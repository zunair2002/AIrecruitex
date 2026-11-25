export type PricingPlan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted: boolean;
  /**
   * A paid plan. Its CTA goes to the buyer's billing page rather than a login
   * screen — see PlanCta, which resolves the destination from the session so a
   * signed-in user isn't bounced through sign-in to reach checkout.
   */
  paid?: boolean;
};

export type PricingCategory = "candidates" | "companies";

/** Plans for job seekers: practice interviews, feedback and career guidance. */
export const candidatePlans: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description:
      "Perfect for candidates getting started with practice interviews.",
    features: [
      "5 practice interviews per day",
      "Free learning courses",
      "Basic interview feedback",
      "Resume upload",
    ],
    cta: "Get Started",
    href: "/login/candidate",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "$29",
    period: "/month",
    description: "For serious job seekers who want advanced AI coaching.",
    features: [
      "10 practice interviews per day",
      "Every course, including Premium",
      "Advanced role-based interviews",
      "Detailed AI scoring & feedback",
      "Personalized learning recommendations",
    ],
    cta: "Get Premium",
    paid: true,
    // Signed-in candidates land on the upgrade page; signed-out visitors are
    // sent to the candidate login by the portal's auth guard.
    href: "/candidate/billing",
    highlighted: true,
  },
  {
    name: "Career+",
    price: "$59",
    period: "/month",
    description: "Everything in Premium, plus deeper preparation for a target role.",
    features: [
      "Everything in Premium",
      "Company-style interview packs",
      "AI resume review & rewrite tips",
      "Progress reports across sessions",
      "Priority feedback processing",
    ],
    cta: "Choose Career+",
    href: "/candidate/billing",
    paid: true,
    highlighted: false,
  },
];

/** Plans for HR teams: job postings, AI screening and AI interviews. */
export const companyPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "For small teams making their first few hires.",
    features: [
      "Up to 3 active job postings",
      "AI resume matching",
      "100 AI interviews per month",
      "Applicant dashboard & shortlisting",
    ],
    cta: "Start Hiring",
    href: "/login/recruiter",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$199",
    period: "/month",
    description: "For growing teams screening candidates every week.",
    features: [
      "Up to 20 active job postings",
      "AI resume matching & ranking",
      "Unlimited automated AI interviews",
      "Organisational interview invites",
      "Team-wide hiring analytics",
    ],
    cta: "Start Growth Trial",
    href: "/login/recruiter",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For HR teams hiring at scale with AI-powered screening.",
    features: [
      "Unlimited job postings",
      "AI resume matching",
      "Automated AI interviews",
      "Applicant dashboard & shortlisting",
      "Priority support",
    ],
    cta: "Contact Sales",
    href: "/contact",
    highlighted: false,
  },
];

export const pricingCategories: {
  id: PricingCategory;
  label: string;
  plans: PricingPlan[];
}[] = [
  { id: "candidates", label: "For candidates", plans: candidatePlans },
  { id: "companies", label: "For companies / HR", plans: companyPlans },
];

/** Every plan, for callers that don't split by audience. */
export const pricingPlans: PricingPlan[] = [...candidatePlans, ...companyPlans];
