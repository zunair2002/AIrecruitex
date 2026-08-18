"use client";

import { motion } from "framer-motion";

export const SmartScoringSceneVisual = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="scene-scoring bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8"
  >
    <div className="scoring-pipeline flex items-center justify-center gap-6 flex-wrap">
      <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="interview-doc text-center">
        <motion.div whileHover={{ scale: 1.05 }} className="doc-icon bg-indigo-100 p-4 rounded-lg">
          <div className="doc-line-sm w-16 h-1 bg-indigo-300 mb-1"></div>
          <div className="doc-line-sm w-16 h-1 bg-indigo-300 mb-1"></div>
          <div className="doc-line-sm w-12 h-1 bg-indigo-300"></div>
        </motion.div>
        <div className="doc-label mt-2 font-bold">Interview</div>
      </motion.div>
      <div className="ai-agents flex items-center gap-4">
        {[
          { delay: 0.4, rotate: [0, 10, -10, 0], scoreDelay: 0.8, score: "84%", color: "text-indigo-600" },
          { delay: 0.6, rotate: [0, -10, 10, 0], scoreDelay: 1.0, score: "88%", color: "text-purple-600" },
        ].map((agent, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: agent.delay }} whileHover={{ scale: 1.05 }} className="ai-agent text-center">
            <motion.div animate={{ rotate: agent.rotate }} transition={{ repeat: Infinity, duration: 3 }} className="ai-agent-icon text-4xl">🤖</motion.div>
            <div className="ai-agent-score">
              <div className="ai-agent-label">Agent {i + 1}</div>
              <motion.div initial={{ width: 0 }} whileInView={{ width: i === 0 ? "84%" : "88%" }} transition={{ delay: agent.scoreDelay, duration: 1 }} className={`ai-agent-value text-2xl font-bold ${agent.color}`}>
                {agent.score}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, type: "spring" }} className="final-score text-center">
        <motion.div whileHover={{ scale: 1.05 }} className="score-box bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 1.2 }} className="score-box-number text-3xl font-bold">86</motion.div>
          <div className="score-box-percent text-sm">Match Score</div>
        </motion.div>
      </motion.div>
    </div>
  </motion.div>
);
