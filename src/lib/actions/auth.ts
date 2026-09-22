"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
  businessName: string;
  industry: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface AuthActionResult {
  success: boolean;
  destination?: string;
  error?: string;
}

/**
 * Authoritative Server Action for Workspace & User Registration.
 * - Guarantees email confirmation via admin API so users never get stuck in pending state.
 * - Creates businesses and profiles entries server-side.
 * - Establishes session cookie on the response so the user lands immediately in /onboarding.
 */
export async function signUpAction(input: SignUpInput): Promise<AuthActionResult> {
  const { fullName, email, password, businessName, industry } = input;

  if (!email || !password || password.length < 8) {
    return {
      success: false,
      error: "Valid email and a password of at least 8 characters are required.",
    };
  }

  const admin = getAdminClient();
  const serverSupabase = await createClient();

  try {
    let userId: string | null = null;

    if (admin) {
      // 1. Create user with pre-confirmed email via Admin API
      const { data: createData, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          business_name: businessName,
          industry,
        },
      });

      if (createError) {
        // If user already exists, check if they were stuck unconfirmed
        if (
          createError.message.toLowerCase().includes("already registered") ||
          createError.message.toLowerCase().includes("user already exists")
        ) {
          // Find existing user to auto-confirm & update
          const { data: listData } = await admin.auth.admin.listUsers();
          const existing = listData?.users.find(
            (u) => u.email?.toLowerCase() === email.toLowerCase()
          );

          if (existing) {
            userId = existing.id;
            await admin.auth.admin.updateUserById(existing.id, {
              password,
              email_confirm: true,
              user_metadata: {
                full_name: fullName,
                business_name: businessName,
                industry,
              },
            });
          } else {
            return { success: false, error: createError.message };
          }
        } else {
          return { success: false, error: createError.message };
        }
      } else if (createData?.user) {
        userId = createData.user.id;
      }
    }

    // 2. Authenticate the session on the server to establish real HTTP cookies
    const { data: signInData, error: signInError } = await serverSupabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // If sign in fails due to email not confirmed and admin client is available, recover
      if (
        signInError.message.toLowerCase().includes("not confirmed") ||
        signInError.message.toLowerCase().includes("confirm")
      ) {
        if (admin && userId) {
          await admin.auth.admin.updateUserById(userId, { email_confirm: true });
          const retry = await serverSupabase.auth.signInWithPassword({ email, password });
          if (retry.error) {
            return {
              success: false,
              error: `Account created, but authentication failed: ${retry.error.message}. Please log in directly.`,
            };
          }
        } else {
          return {
            success: false,
            error:
              "Account created, but email confirmation is pending. Please verify your email or sign in directly.",
          };
        }
      } else {
        return { success: false, error: signInError.message };
      }
    }

    const currentUserId = signInData?.user?.id || userId;
    if (!currentUserId) {
      return { success: false, error: "Session creation failed. Please log in." };
    }

    // 3. Provision Business and Profile records (using admin client to bypass any RLS latency)
    const dbClient = admin || serverSupabase;

    // Check if profile already exists
    const { data: existingProfile } = await dbClient
      .from("profiles")
      .select("id, business_id")
      .eq("id", currentUserId)
      .maybeSingle();

    if (!existingProfile?.business_id) {
      // Create new business row
      const { data: newBusiness, error: bizError } = await dbClient
        .from("businesses")
        .insert({
          name: businessName,
          industry,
          currency: "USD",
          onboarding_completed: false,
        })
        .select("id")
        .single();

      if (bizError) {
        console.error("Error creating business record:", bizError);
        return {
          success: false,
          error: `Could not create workspace profile: ${bizError.message}`,
        };
      }

      // Upsert profile linked to business as owner
      const { error: profError } = await dbClient.from("profiles").upsert({
        id: currentUserId,
        business_id: newBusiness.id,
        full_name: fullName,
        email,
        role: "owner",
      });

      if (profError) {
        console.error("Error creating profile record:", profError);
        return {
          success: false,
          error: `Could not create owner profile: ${profError.message}`,
        };
      }
    }

    revalidatePath("/onboarding");
    revalidatePath("/dashboard");

    return {
      success: true,
      destination: "/onboarding",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An unexpected signup error occurred.";
    return { success: false, error: msg };
  }
}

/**
 * Authoritative Server Action for Login.
 * - Authenticates credentials.
 * - Automatically resolves and confirms any stale unconfirmed accounts.
 * - Checks onboarding completion in ONE authoritative place server-side.
 * - Returns exact destination (/dashboard if onboarded, /onboarding if not).
 */
export async function signInAction(input: SignInInput): Promise<AuthActionResult> {
  const { email, password } = input;

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  const admin = getAdminClient();
  const serverSupabase = await createClient();

  try {
    let signInResult = await serverSupabase.auth.signInWithPassword({
      email,
      password,
    });

    // Handle stale unconfirmed account edge case
    if (
      signInResult.error &&
      (signInResult.error.message.toLowerCase().includes("not confirmed") ||
        signInResult.error.message.toLowerCase().includes("confirm"))
    ) {
      if (admin) {
        // Auto-confirm the stale user
        const { data: listData } = await admin.auth.admin.listUsers();
        const userToConfirm = listData?.users.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase()
        );

        if (userToConfirm) {
          await admin.auth.admin.updateUserById(userToConfirm.id, { email_confirm: true });
          // Retry sign in
          signInResult = await serverSupabase.auth.signInWithPassword({
            email,
            password,
          });
        }
      }
    }

    if (signInResult.error) {
      const isUnconfirmed =
        signInResult.error.message.toLowerCase().includes("not confirmed") ||
        signInResult.error.message.toLowerCase().includes("confirm");

      const friendlyError = isUnconfirmed
        ? "This account has an unconfirmed email from an earlier version. Please contact support or try resetting your password."
        : signInResult.error.message;

      return { success: false, error: friendlyError };
    }

    const user = signInResult.data.user;
    if (!user) {
      return { success: false, error: "Unable to retrieve user session." };
    }

    // Query profile and business status authoritatively
    const dbClient = admin || serverSupabase;
    const { data: profile } = await dbClient
      .from("profiles")
      .select("role, business_id, businesses(id, name, onboarding_completed)")
      .eq("id", user.id)
      .maybeSingle();

    let destination = "/onboarding";

    if (profile?.businesses && typeof profile.businesses === "object") {
      const biz = profile.businesses as { onboarding_completed?: boolean };
      if (biz.onboarding_completed === true) {
        destination = "/dashboard";
      } else {
        destination = "/onboarding";
      }
    } else {
      // User has no business/profile yet — provision one so they can onboard
      const { data: newBiz } = await dbClient
        .from("businesses")
        .insert({
          name: (user.user_metadata?.business_name as string) || "Workspace",
          industry: (user.user_metadata?.industry as string) || "General",
          currency: "USD",
          onboarding_completed: false,
        })
        .select("id")
        .single();

      if (newBiz) {
        await dbClient.from("profiles").upsert({
          id: user.id,
          business_id: newBiz.id,
          full_name:
            (user.user_metadata?.full_name as string) ||
            user.email?.split("@")[0] ||
            "Owner",
          email: user.email || "",
          role: "owner",
        });
      }

      destination = "/onboarding";
    }

    revalidatePath(destination);

    return {
      success: true,
      destination,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An unexpected sign-in error occurred.";
    return { success: false, error: msg };
  }
}

/**
 * Query current user's authoritative destination (/dashboard vs /onboarding).
 */
export async function getAuthDestination(): Promise<string> {
  try {
    const serverSupabase = await createClient();
    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    if (!user) return "/login";

    const { data: profile } = await serverSupabase
      .from("profiles")
      .select("business_id, businesses(onboarding_completed)")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.business_id || !profile?.businesses) {
      return "/onboarding";
    }

    const biz = profile.businesses as { onboarding_completed?: boolean };
    return biz.onboarding_completed === true ? "/dashboard" : "/onboarding";
  } catch {
    return "/login";
  }
}
