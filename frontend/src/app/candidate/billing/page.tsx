import { Suspense } from "react";
import { BillingPage } from "@/components/candidate/billing/BillingPage";
import { LoadingBlock } from "@/components/ui/Feedback";

export const metadata = {
  title: "Plan & Billing | AiRecruitex Candidate",
  description: "Your plan, Premium subscription and payment history",
};

// Suspense: BillingPage reads ?checkout / ?session_id from the URL.
export default function CandidateBillingPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <BillingPage />
    </Suspense>
  );
}
