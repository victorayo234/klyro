"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { KlyroLogo } from "@/components/ui/logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/* ─────────────────────────── helpers ─────────────────────────── */
function getPasswordStrength(password: string): {
  score: 0 | 1 | 2 | 3;
  label: string;
  color: string;
  barColor: string;
  width: string;
} {
  if (!password) return { score: 0, label: "", color: "", barColor: "bg-slate-200 dark:bg-slate-700", width: "w-0" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password) && password.length >= 10) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "text-red-500", barColor: "bg-red-500", width: "w-1/4" };
  if (score === 2) return { score: 2, label: "Risky", color: "text-amber-500", barColor: "bg-amber-400", width: "w-2/4" };
  if (score === 3) return { score: 3, label: "Good", color: "text-emerald-500", barColor: "bg-emerald-400", width: "w-3/4" };
  return { score: 3, label: "Strong", color: "text-emerald-600", barColor: "bg-emerald-500", width: "w-full" };
}

const INDUSTRIES = [
  { label: "Retail & E-commerce", value: "Retail & E-commerce" },
  { label: "Wholesale & Distribution", value: "Wholesale & Distribution" },
  // Technology
  { label: "Software as a Service (SaaS)", value: "Software as a Service (SaaS)" },
  { label: "Web & Mobile App Development", value: "Web & Mobile App Development" },
  { label: "IT Services & Managed Services", value: "IT Services & Managed Services" },
  { label: "Cybersecurity", value: "Cybersecurity" },
  { label: "Artificial Intelligence & Machine Learning", value: "Artificial Intelligence & Machine Learning" },
  { label: "Cloud Computing & DevOps", value: "Cloud Computing & DevOps" },
  { label: "Hardware & Electronics", value: "Hardware & Electronics" },
  { label: "Telecom & Networking", value: "Telecom & Networking" },
  { label: "Data Analytics & Business Intelligence", value: "Data Analytics & Business Intelligence" },
  { label: "Fintech & Digital Payments", value: "Fintech & Digital Payments" },
  { label: "EdTech & Online Learning", value: "EdTech & Online Learning" },
  { label: "HealthTech & Medical Devices", value: "HealthTech & Medical Devices" },
  // Other industries
  { label: "Professional & Consulting Services", value: "Professional & Consulting Services" },
  { label: "Marketing & Advertising Agency", value: "Marketing & Advertising Agency" },
  { label: "Manufacturing & Assembly", value: "Manufacturing & Assembly" },
  { label: "Construction & Real Estate", value: "Construction & Real Estate" },
  { label: "Logistics, Freight & Supply Chain", value: "Logistics, Freight & Supply Chain" },
  { label: "Hospitality, Food & Beverage", value: "Hospitality, Food & Beverage" },
  { label: "Healthcare & Life Sciences", value: "Healthcare & Life Sciences" },
  { label: "Legal & Compliance Services", value: "Legal & Compliance Services" },
  { label: "Financial Services & Insurance", value: "Financial Services & Insurance" },
  { label: "Media, Content & Publishing", value: "Media, Content & Publishing" },
  { label: "Education & Research", value: "Education & Research" },
  { label: "Nonprofit & Social Enterprise", value: "Nonprofit & Social Enterprise" },
  { label: "Agriculture & Agritech", value: "Agriculture & Agritech" },
  { label: "Energy & Clean Technology", value: "Energy & Clean Technology" },
  { label: "Fashion, Apparel & Beauty", value: "Fashion, Apparel & Beauty" },
  { label: "Sports, Fitness & Wellness", value: "Sports, Fitness & Wellness" },
  { label: "Other", value: "Other" },
];

/* ────────────────────────── component ─────────────────────────── */
export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [businessName, setBusinessName] = React.useState("");
  const [industry, setIndustry] = React.useState("Software as a Service (SaaS)");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const strength = getPasswordStrength(password);

  const isSupabaseConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    return url && !url.includes("placeholder-project") && key && !key.includes("placeholder");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    if (!isSupabaseConfigured()) {
      setError(
        "Supabase is not configured yet. Add your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local to enable authentication."
      );
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, business_name: businessName },
        },
      });

      if (authError) {
        setError(authError.message);
        toast.error("Signup failed", { description: authError.message });
        return;
      }

      const user = authData.user;
      if (user) {
        const { data: business, error: bizError } = await supabase
          .from("businesses")
          .insert({ name: businessName, industry, currency: "USD" })
          .select()
          .single();

        if (!bizError && business) {
          await supabase.from("profiles").upsert({
            id: user.id,
            business_id: business.id,
            full_name: fullName,
            email,
            role: "owner",
          });
        }
      }

      toast.success("Account created!", {
        description: "Welcome to Klyro! Setting up your workspace…",
      });
      router.push("/onboarding");
      router.refresh();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message.includes("fetch")
            ? "Cannot reach Supabase. Check your .env.local credentials."
            : err.message
          : "An unexpected error occurred.";
      setError(msg);
      toast.error("Registration error", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50/70 dark:bg-slate-950 bg-dot-grid">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <KlyroLogo size="lg" href="/" className="justify-center" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Start your 14-day free trial • Set up your business workspace
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create your workspace</CardTitle>
            <CardDescription>Enter your personal and company information below</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Supabase unconfigured notice */}
              {!isSupabaseConfigured() && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  <strong>Supabase not connected.</strong> Add your{" "}
                  <code className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">
                    NEXT_PUBLIC_SUPABASE_URL
                  </code>{" "}
                  and{" "}
                  <code className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">
                    NEXT_PUBLIC_SUPABASE_ANON_KEY
                  </code>{" "}
                  to <code className="font-mono">.env.local</code> and run the SQL migration to
                  enable real authentication.
                </div>
              )}

              {/* Error display */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              {/* Name & Email row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Full Name"
                  placeholder="Ayo Ade"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <Input
                  label="Business Email"
                  type="email"
                  placeholder="ayo@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password field with eye toggle */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Password <span className="text-slate-400 font-normal">(min 8 characters)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-9 px-3 pr-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength bar */}
                {password.length > 0 && (
                  <div className="space-y-1 pt-0.5">
                    <div className="relative h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-full transition-all duration-300",
                          strength.barColor,
                          strength.width
                        )}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={cn("font-semibold", strength.color)}>
                        {strength.label}
                      </span>
                      <span className="text-slate-400">
                        {strength.score < 2 && "Add uppercase, numbers & symbols"}
                        {strength.score === 2 && "Add numbers or special characters"}
                        {strength.score >= 3 && "Meets strong password criteria"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(
                      "w-full h-9 px-3 pr-10 rounded-lg border bg-white dark:bg-slate-900/90 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-blue-500 transition-colors",
                      confirmPassword.length > 0
                        ? password === confirmPassword
                          ? "border-emerald-400 dark:border-emerald-700 focus:ring-emerald-500/20"
                          : "border-red-400 dark:border-red-700 focus:ring-red-500/20"
                        : "border-slate-300 dark:border-slate-700 focus:ring-blue-500/20"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {/* Match indicator */}
                  {confirmPassword.length > 0 && (
                    <div className="absolute right-9 top-1/2 -translate-y-1/2">
                      {password === confirmPassword ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-red-400" />
                      )}
                    </div>
                  )}
                </div>
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <p className="text-[10px] text-red-500">Passwords do not match</p>
                )}
              </div>

              {/* Business details section */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <Input
                  label="Business / Company Name"
                  placeholder="Avo Tech Solutions"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Industry / Business Type
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <optgroup label="Technology">
                      <option value="Software as a Service (SaaS)">Software as a Service (SaaS)</option>
                      <option value="Web & Mobile App Development">Web & Mobile App Development</option>
                      <option value="IT Services & Managed Services">IT Services & Managed Services</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning</option>
                      <option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
                      <option value="Hardware & Electronics">Hardware & Electronics</option>
                      <option value="Telecom & Networking">Telecom & Networking</option>
                      <option value="Data Analytics & Business Intelligence">Data Analytics & Business Intelligence</option>
                      <option value="Fintech & Digital Payments">Fintech & Digital Payments</option>
                      <option value="EdTech & Online Learning">EdTech & Online Learning</option>
                      <option value="HealthTech & Medical Devices">HealthTech & Medical Devices</option>
                    </optgroup>
                    <optgroup label="Business & Commerce">
                      <option value="Retail & E-commerce">Retail & E-commerce</option>
                      <option value="Wholesale & Distribution">Wholesale & Distribution</option>
                      <option value="Manufacturing & Assembly">Manufacturing & Assembly</option>
                      <option value="Logistics, Freight & Supply Chain">Logistics, Freight & Supply Chain</option>
                      <option value="Construction & Real Estate">Construction & Real Estate</option>
                      <option value="Fashion, Apparel & Beauty">Fashion, Apparel & Beauty</option>
                      <option value="Agriculture & Agritech">Agriculture & Agritech</option>
                    </optgroup>
                    <optgroup label="Services & Professional">
                      <option value="Professional & Consulting Services">Professional & Consulting Services</option>
                      <option value="Marketing & Advertising Agency">Marketing & Advertising Agency</option>
                      <option value="Legal & Compliance Services">Legal & Compliance Services</option>
                      <option value="Financial Services & Insurance">Financial Services & Insurance</option>
                      <option value="Hospitality, Food & Beverage">Hospitality, Food & Beverage</option>
                      <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                      <option value="Education & Research">Education & Research</option>
                      <option value="Media, Content & Publishing">Media, Content & Publishing</option>
                      <option value="Sports, Fitness & Wellness">Sports, Fitness & Wellness</option>
                      <option value="Energy & Clean Technology">Energy & Clean Technology</option>
                      <option value="Nonprofit & Social Enterprise">Nonprofit & Social Enterprise</option>
                    </optgroup>
                    <optgroup label="Other">
                      <option value="Other">Other</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isLoading}
                disabled={
                  isLoading ||
                  (confirmPassword.length > 0 && password !== confirmPassword)
                }
              >
                Create Account & Workspace
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
            Already have an account?{" "}
            <Link
              href="/login"
              className="ml-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Log in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
