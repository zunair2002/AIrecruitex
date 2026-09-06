import { MyJobsList } from "@/components/recruiter/jobs/MyJobsList";

export const metadata = {
  title: "My Jobs | AIRecruitX HR",
  description: "Every job you've posted, with required skills and status",
};

export default function MyJobsPage() {
  return <MyJobsList />;
}
