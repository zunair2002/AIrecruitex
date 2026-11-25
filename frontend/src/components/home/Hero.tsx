"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { easeOutExpo } from "@/lib/motion";

const capabilities = [
  "Structured AI interviews",
  "Resume-to-role matching",
  "Ranked shortlists",
  "Interview reports",
  "White-label delivery",
  "Always-on screening",
];

export const Hero = () => {
  return (
    <section className="bg-canvas pt-[4.75rem] text-ink">
      <div className="mx-auto grid max-w-7xl items-stretch lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: easeOutExpo }}
          className="flex flex-col justify-center px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          <p className="eyebrow">Recruitment intelligence</p>
          <h1 className="font-display mt-6 max-w-xl text-[2.85rem] leading-[1.08] text-ink sm:text-5xl lg:text-[3.65rem]">
            Your shortlist, ready by morning.
          </h1>
          <p className="mt-6 max-w-lg text-[1.05rem] leading-relaxed text-muted">
            AiRecruitex interviews every applicant, scores them against the role,
            and returns a ranked shortlist — so hiring teams only meet people
            worth meeting.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#contact" className="btn-brand">
              Request a briefing
            </a>
            <Link href="/login/recruiter" className="btn-ghost">
              Open the HR portal
            </Link>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 border-t border-line pt-7">
            {[
              ["24/7", "Interview coverage"],
              ["3 steps", "To a shortlist"],
              ["1 report", "For every candidate"],
            ].map(([value, label], i) => (
              <div
                key={label}
                className={i === 0 ? "" : "border-l border-line pl-5"}
              >
                <dt className="font-display text-2xl text-brand">{value}</dt>
                <dd className="mt-1 text-xs leading-snug text-muted">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>

        


<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.8, delay: 0.12, ease: easeOutExpo }}
  className="relative min-h-[520px] w-full lg:min-h-[550px]"
>
  <Image
    src="/landing/images/AIX.png"
    alt="AiRecruitex hiring workspace"
    fill
    priority
    className="object-contain p-4 sm:p-6"
  />
</motion.div>



      </div>

      <div className="border-t border-line bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {capabilities.map((item, index) => (
            <div
              key={item}
              className={`px-4 py-5 text-xs font-semibold tracking-[0.12em] uppercase ${
                index === 0 ? "text-brand" : "text-muted"
              } ${index !== 0 ? "border-l border-line" : ""}`}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
