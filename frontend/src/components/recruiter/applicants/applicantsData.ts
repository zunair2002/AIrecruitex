export type Applicant = {
  id: string;
  name: string;
  email: string;
  resume: string;
  jobTitle: string;
  match: number;
  status: "Applied" | "Interviewed" | "Shortlisted" | "Rejected";
  appliedDate: string;
};

export const applicants: Applicant[] = [
  {
    id: "1",
    name: "Sarah Khan",
    email: "sarah.khan@email.com",
    resume: "sarah_khan_resume.pdf",
    jobTitle: "React Developer",
    match: 88,
    status: "Interviewed",
    appliedDate: "Mar 20, 2026",
  },
  {
    id: "2",
    name: "Ali Ahmed",
    email: "ali.ahmed@email.com",
    resume: "ali_ahmed_cv.pdf",
    jobTitle: "Node.js Backend Engineer",
    match: 82,
    status: "Shortlisted",
    appliedDate: "Mar 19, 2026",
  },
  {
    id: "3",
    name: "Jane Doe",
    email: "jane.doe@email.com",
    resume: "jane_doe_resume.pdf",
    jobTitle: "React Developer",
    match: 76,
    status: "Applied",
    appliedDate: "Mar 18, 2026",
  },
  {
    id: "4",
    name: "Hassan Raza",
    email: "hassan.raza@email.com",
    resume: "hassan_raza_cv.pdf",
    jobTitle: "AI Engineer",
    match: 91,
    status: "Shortlisted",
    appliedDate: "Mar 17, 2026",
  },
  {
    id: "5",
    name: "Fatima Noor",
    email: "fatima.noor@email.com",
    resume: "fatima_noor_resume.pdf",
    jobTitle: "React Developer",
    match: 69,
    status: "Applied",
    appliedDate: "Mar 16, 2026",
  },
  {
    id: "6",
    name: "Usman Malik",
    email: "usman.malik@email.com",
    resume: "usman_malik_cv.pdf",
    jobTitle: "Node.js Backend Engineer",
    match: 58,
    status: "Rejected",
    appliedDate: "Mar 14, 2026",
  },
];

export const statusStyles: Record<Applicant["status"], string> = {
  Applied: "bg-blue-50 text-blue-700",
  Interviewed: "bg-purple-50 text-purple-700",
  Shortlisted: "bg-indigo-50 text-indigo-700",
  Rejected: "bg-red-50 text-red-700",
};

export function getMatchColor(match: number) {
  if (match >= 80) return "text-emerald-600";
  if (match >= 65) return "text-amber-600";
  return "text-red-600";
}
