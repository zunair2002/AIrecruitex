import { ApplicantsList } from "@/components/recruiter/applicants/ApplicantsList";

export const metadata = {
  title: "Applicants | AIRecruitX HR",
  description: "View job applicants with resume links and AI match scores",
};

export default function ApplicantsPage() {
  return <ApplicantsList />;
}
