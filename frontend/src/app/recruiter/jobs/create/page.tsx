import { CreateJobForm } from "@/components/recruiter/CreateJobForm";

export const metadata = {
  title: "Create Job | AiRecruitex HR",
  description:
    "Post a new job opening with title, description, skills, and experience requirements",
};

export default function CreateJobPage() {
  return (
    <div className="min-h-full bg-[#f7f8fa] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <CreateJobForm />
    </div>
  );
}
