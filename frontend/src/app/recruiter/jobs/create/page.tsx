import { CreateJobForm } from "@/components/recruiter/CreateJobForm";

export const metadata = {
  title: "Create Job | AiRecruitex HR",
  description: "Post a new job opening with title, description, skills, and experience requirements",
};

export default function CreateJobPage() {
  return (
    <div className="p-8">
      <CreateJobForm />
    </div>
  );
}
