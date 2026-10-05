import { CandidateShell } from "./CandidateShell";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CandidateShell>{children}</CandidateShell>;
}
