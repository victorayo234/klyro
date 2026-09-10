"use server";

import { createClient } from "@/lib/supabase/server";
import { Customer } from "@/types/database";
import { logActivity } from "./activity";

export async function getCustomers(): Promise<Customer[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Error fetching customers from Supabase:", error.message);
      return getDemoCustomers();
    }

    if (!data || data.length === 0) {
      return getDemoCustomers();
    }

    return data as Customer[];
  } catch {
    return getDemoCustomers();
  }
}

export async function createCustomer(formData: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  tags?: string[];
  status?: "active" | "inactive" | "lead";
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let businessId = "00000000-0000-0000-0000-000000000001";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id")
      .eq("id", user.id)
      .single();
    if (profile?.business_id) businessId = profile.business_id;
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      business_id: businessId,
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      address: formData.address || null,
      notes: formData.notes || null,
      tags: formData.tags || [],
      status: formData.status || "active",
      total_spend: 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "customer",
    entityId: data.id,
    action: `Created customer ${formData.name}`,
    details: { name: formData.name, email: formData.email },
  });

  return data;
}

export async function updateCustomer(
  id: string,
  updates: Partial<Customer>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "customer",
    entityId: id,
    action: `Updated customer ${updates.name || id}`,
    details: updates,
  });

  return data;
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "customer",
    entityId: id,
    action: `Deleted customer`,
  });
}

function getDemoCustomers(): Customer[] {
  return [
    {
      id: "cust-1",
      business_id: "biz-demo",
      name: "Apex Consulting LLC",
      email: "billing@apexcorp.com",
      phone: "+1 (555) 342-9182",
      address: "100 Financial Way, New York, NY",
      notes: "Enterprise retainer client. Net 30 terms.",
      tags: ["Enterprise", "VIP", "Monthly Retainer"],
      total_spend: 24500.0,
      status: "active",
      created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "cust-2",
      business_id: "biz-demo",
      name: "BioLab Diagnostics",
      email: "procurement@biolab.io",
      phone: "+1 (555) 881-2309",
      address: "42 Science Park, Cambridge, MA",
      notes: "Regular purchaser of lab and office equipment.",
      tags: ["Healthcare", "Net 15"],
      total_spend: 14200.5,
      status: "active",
      created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "cust-3",
      business_id: "biz-demo",
      name: "Solarium Studios",
      email: "clara@solarium.design",
      phone: "+1 (555) 712-4491",
      address: "740 Market St, San Francisco, CA",
      notes: "Design agency. Orders ergonomic seating.",
      tags: ["Design", "Direct Deposit"],
      total_spend: 6850.0,
      status: "active",
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "cust-4",
      business_id: "biz-demo",
      name: "Vanguard Logistics",
      email: "ops@vanguardfreight.com",
      phone: "+1 (555) 902-1144",
      address: "120 Harbor Blvd, Long Beach, CA",
      notes: "Requested quote for warehouse inventory systems.",
      tags: ["Lead", "High Priority"],
      total_spend: 0.0,
      status: "lead",
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "cust-5",
      business_id: "biz-demo",
      name: "Kinetics Fitness Co",
      email: "accounts@kineticsfit.com",
      phone: "+1 (555) 412-8877",
      address: "88 Broadway, Denver, CO",
      notes: "Previous gym expansion client.",
      tags: ["Retail"],
      total_spend: 3400.0,
      status: "inactive",
      created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}
