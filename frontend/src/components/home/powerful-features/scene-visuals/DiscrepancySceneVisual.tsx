"use client";

import { motion } from "framer-motion";

const cvLines = [
  { text: "✓ Experience: 5 years", color: "text-green-500", delay: 0.3 },
  { text: "✓ Skills: React, Node", color: "text-green-500", delay: 0.4 },
  { text: "\u26A0 Education: Bachelor\u2019s", color: "text-yellow-500", delay: 0.5 },
  { text: "✓ Portfolio available", color: "text-green-500", delay: 0.6 },
];

const interviewLines = [
  { text: "✓ Experience: 5 years", color: "text-green-500", delay: 0.8 },
  { text: "⚠️ Skills: React, Angular", color: "text-yellow-500", delay: 0.9 },
  { text: "✓ Portfolio mentioned", color: "text-green-500", delay: 1.0 },
  { text: "⚠️ Education not mentioned", color: "text-yellow-500", delay: 1.1 },
];

export const DiscrepancySceneVisual = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="scene-discrepancy bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8"
  >
    <div className="flex items-center justify-center gap-8 flex-wrap">
      <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.02 }} className="doc-panel cv-panel bg-white p-4 rounded-xl">
        <div className="doc-header font-bold mb-2">CV Claims</div>
        {cvLines.map((line) => (
          <motion.div key={line.text} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: line.delay }} className={`doc-line ${line.color}`}>
            {line.text}
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1, transition: { delay: 0.5, type: "spring" } }}
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2, delay: 1 }}
        className="alert-badge text-yellow-500 text-4xl"
      >
        ⚠️
      </motion.div>
      <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} whileHover={{ scale: 1.02 }} className="doc-panel interview-panel bg-white p-4 rounded-xl">
        <div className="doc-header font-bold mb-2">Interview</div>
        {interviewLines.map((line) => (
          <motion.div key={line.text} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: line.delay }} className={`doc-line ${line.color}`}>
            {line.text}
          </motion.div>
        ))}
      </motion.div>
    </div>
  </motion.div>
);
