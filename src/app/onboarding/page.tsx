"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  TrendingUp,
  Package,
  Users,
  FileText,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  ChevronRight,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { KlyroLogo } from "@/components/ui/logo";
import { completeOnboarding, getBusinessOnboardingStatus } from "@/lib/actions/onboarding";
import { CSVImportWizard } from "@/components/dashboard/csv-import-wizard";
import { cn } from "@/lib/utils";

const PRIMARY_GOALS = [
  {
    id: "track_cashflow",
    title: "Track Cashflow, Profit & Expenses",
    description: "Prioritize real-time profit margins, revenue targets, and operational burn rate.",
    icon: TrendingUp,
    accent: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
  },
  {
    id: "manage_inventory",
    title: "Manage Stock & Inventory",
    description: "Lead with stock depletion warnings, low-stock reorder thresholds, and SKU telemetry.",
    icon: Package,
    accent: "text-amber-500 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
  },
  {
    id: "get_organized_customers",
    title: "Get Organized with Customers (CRM)",
    description: "Center your dashboard around client accounts, active leads, and lifetime spend history.",
    icon: Users,
    accent: "text-blue-500 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800",
  },
  {
    id: "professionalize_invoicing",
    title: "Professionalize Billing & Invoicing",
    description: "Highlight aging buckets, overdue collections, recurring billing, and PDF invoices.",
    icon: FileText,
    accent: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800",
  },
  {
    id: "manage_team",
    title: "Manage a Growing Team & Activity",
    description: "Focus on staff access controls, audit trail events, and operations checklists.",
    icon: UserCheck,
    accent: "text-purple-500 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800",
  },
];

const TEAM_SIZES = [
  { id: "solo", label: "Solo Operator", desc: "Just myself" },
  { id: "2-10", label: "Small Team", desc: "2 - 10 people" },
  { id: "11-50", label: "Growing Company", desc: "11 - 50 people" },
  { id: "50+", label: "Mid-Market / Enterprise", desc: "50+ people" },
];

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD - US Dollar" },
  { code: "EUR", symbol: "€", label: "EUR - Euro" },
  { code: "GBP", symbol: "£", label: "GBP - British Pound" },
  { code: "CAD", symbol: "$", label: "CAD - Canadian Dollar" },
  { code: "AUD", symbol: "$", label: "AUD - Australian Dollar" },
  { code: "NGN", symbol: "₦", label: "NGN - Nigerian Naira" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);

  // Form State
  const [industry, setIndustry] = React.useState("Software as a Service (SaaS)");
  const [teamSize, setTeamSize] = React.useState("2-10");
  const [currency, setCurrency] = React.useState("USD");
  const [primaryGoal, setPrimaryGoal] = React.useState("track_cashflow");
  const [monthlyRevenueTarget, setMonthlyRevenueTarget] = React.useState<number>(10000);
  const [monthlyProfitTarget, setMonthlyProfitTarget] = React.useState<number>(4000);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCompleted, setIsCompleted] = React.useState(false);

  // Reverse guard: if already completed, navigate straight to dashboard
  React.useEffect(() => {
    getBusinessOnboardingStatus().then((status) => {
      const biz = status?.business as { onboarding_completed?: boolean } | null;
      if (biz?.onboarding_completed) {
        router.replace("/dashboard");
      }
    });
  }, [router]);

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const res = await completeOnboarding({
        industry,
        team_size_bracket: teamSize,
        primary_goal: primaryGoal,
        currency,
        monthly_revenue_target: Number(monthlyRevenueTarget) || 10000,
        monthly_profit_target: Number(monthlyProfitTarget) || 4000,
      });

      if (!res.success) {
        toast.error("Could not save settings", { description: res.error });
        setIsSubmitting(false);
        return;
      }

      setIsCompleted(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 700);
    } catch {
      toast.error("Failed to complete onboarding");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 bg-dot-grid flex flex-col justify-between p-4 md:p-8">
      {/* Top Brand Bar */}
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between py-2">
        <KlyroLogo size="md" href="/" />
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">Step {step}</span> of 3
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl w-full mx-auto my-6">
        {isCompleted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="max-w-md mx-auto my-12 text-center space-y-4 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
                Workspace Configured
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Your tailored workspace is ready. Opening your dashboard...
              </p>
            </div>
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.65, ease: "easeInOut" }}
                className="h-full bg-indigo-600 rounded-full"
              />
            </div>
          </motion.div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-6">
              <motion.div
                className="h-full bg-indigo-600 transition-all duration-300"
                animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
              />
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 1: Business Basics */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-6 md:p-8 space-y-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mb-2">
                        Step 1 of 3: Business Profile
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold font-display text-slate-900 dark:text-white">
                        Tell us about your business
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        We adapt terminology and currency across the entire system based on your answers.
                      </p>
                    </div>

                <div className="space-y-4">
                  {/* Industry Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Industry / Operational Domain
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                    >
                      <optgroup label="Technology & Digital">
                        <option value="Software as a Service (SaaS)">Software as a Service (SaaS)</option>
                        <option value="Web & Mobile App Development">Web & Mobile App Development</option>
                        <option value="IT Services & Managed Services">IT Services & Managed Services</option>
                        <option value="Artificial Intelligence & Machine Learning">AI & Machine Learning</option>
                        <option value="Digital Agency / Marketing">Digital Agency / Marketing</option>
                      </optgroup>
                      <optgroup label="Services & Consulting">
                        <option value="Professional & Consulting Services">Professional & Consulting Services</option>
                        <option value="Legal & Compliance Services">Legal & Compliance Services</option>
                        <option value="Financial Services & Insurance">Financial Services & Accounting</option>
                        <option value="Healthcare & Wellness Clinic">Healthcare & Wellness Clinic</option>
                      </optgroup>
                      <optgroup label="Commerce & Physical Goods">
                        <option value="Retail & E-commerce">Retail & E-commerce</option>
                        <option value="Restaurant & Food Service">Restaurant & Food Service / Hospitality</option>
                        <option value="Wholesale & Distribution">Wholesale & Distribution</option>
                        <option value="Manufacturing & Assembly">Manufacturing & Production</option>
                        <option value="Construction & Trades">Construction & Trades</option>
                      </optgroup>
                      <optgroup label="Other">
                        <option value="General Business">General Business / Other</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Team Size Bracket */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Current Team Size
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {TEAM_SIZES.map((ts) => (
                        <motion.button
                          key={ts.id}
                          type="button"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setTeamSize(ts.id)}
                          className={cn(
                            "p-3 rounded-xl border text-left transition-all",
                            teamSize === ts.id
                              ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                          )}
                        >
                          <span
                            className={cn(
                              "block text-xs font-bold",
                              teamSize === ts.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-slate-200"
                            )}
                          >
                            {ts.label}
                          </span>
                          <span className="text-[10px] text-slate-400">{ts.desc}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Currency Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Primary Operating Currency
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {CURRENCIES.map((curr) => (
                        <motion.button
                          key={curr.code}
                          type="button"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setCurrency(curr.code)}
                          className={cn(
                            "p-2.5 rounded-lg border text-left flex items-center justify-between transition-all",
                            currency === curr.code
                              ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                              : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                          )}
                        >
                          <span className="text-xs font-medium">{curr.label}</span>
                          <span className="font-mono text-xs font-bold">{curr.symbol}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Button onClick={() => setStep(2)} className="gap-2">
                    Continue to Primary Goal <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: Primary Goal */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6 md:p-8 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mb-2">
                    Step 2 of 3: Primary Objective
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold font-display text-slate-900 dark:text-white">
                    What is your primary focus right now?
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Select the single most important metric or operational priority. We will rearrange widgets so what matters most is right at the top.
                  </p>
                </div>

                <div className="space-y-3">
                  {PRIMARY_GOALS.map((g) => {
                    const Icon = g.icon;
                    const isSelected = primaryGoal === g.id;
                    return (
                      <motion.div
                        key={g.id}
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => setPrimaryGoal(g.id)}
                        className={cn(
                          "p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4",
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-xs"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60"
                        )}
                      >
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", g.accent)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
                              {g.title}
                            </h4>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {g.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)} className="gap-1.5">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="gap-2">
                    Continue to Starting Data <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 3: Monthly Operational Targets */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6 md:p-8 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mb-2">
                    Step 3 of 3: Operational Targets
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold font-display text-slate-900 dark:text-white">
                    Set your monthly goals
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Establish your target revenue and net profit benchmarks. These directly power your executive health snapshot and goal tracker widgets.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Revenue Target Input */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <TrendingUp className="w-4 h-4" />
                        <label className="text-xs font-bold font-display text-slate-900 dark:text-slate-100">
                          Monthly Revenue Target
                        </label>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                          $
                        </span>
                        <input
                          type="number"
                          min={0}
                          step={500}
                          value={monthlyRevenueTarget}
                          onChange={(e) => setMonthlyRevenueTarget(Number(e.target.value))}
                          className="w-full h-10 pl-7 pr-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 font-mono text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">Gross sales goal per month</p>
                    </div>

                    {/* Profit Target Input */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <DollarSign className="w-4 h-4" />
                        <label className="text-xs font-bold font-display text-slate-900 dark:text-slate-100">
                          Monthly Net Profit Target
                        </label>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                          $
                        </span>
                        <input
                          type="number"
                          min={0}
                          step={250}
                          value={monthlyProfitTarget}
                          onChange={(e) => setMonthlyProfitTarget(Number(e.target.value))}
                          className="w-full h-10 pl-7 pr-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 font-mono text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">Suggested: ~40% of revenue target</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 text-center italic pt-1">
                    You can change these targets at any time in Workspace Settings.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setStep(2)} className="gap-1.5">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    onClick={handleFinish}
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md px-6"
                  >
                    Finish Setup & Enter Dashboard <CheckCircle2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )}
  </main>

      {/* Footer reassurance */}
      <footer className="max-w-3xl w-full mx-auto text-center text-xs text-slate-400">
        You can reconfigure your industry, goals, and targets at any time in Workspace Settings.
      </footer>
    </div>
  );
}
