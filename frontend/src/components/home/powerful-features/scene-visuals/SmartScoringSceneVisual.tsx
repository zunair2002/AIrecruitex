"use client";

import { motion } from "framer-motion";

export const SmartScoringSceneVisual = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="scene-scoring bg-[#f6f3f9] rounded-2xl p-8"
  >
    <div className="scoring-pipeline flex items-center justify-center gap-6 flex-wrap">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="interview-doc text-center"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="doc-icon bg-[#f3e8ff] p-4 rounded-lg"
        >
          <div className="doc-line-sm w-16 h-1 bg-accent mb-1"></div>
          <div className="doc-line-sm w-16 h-1 bg-accent mb-1"></div>
          <div className="doc-line-sm w-12 h-1 bg-accent"></div>
        </motion.div>
        <div className="doc-label mt-2 font-bold">Interview</div>
      </motion.div>
      <div className="ai-agents flex items-center gap-4">
        {[
          {
            delay: 0.4,
            rotate: [0, 10, -10, 0],
            scoreDelay: 0.8,
            score: "84%",
            color: "text-brand",
          },
          {
            delay: 0.6,
            rotate: [0, -10, 10, 0],
            scoreDelay: 1.0,
            score: "88%",
            color: "text-zinc-700",
          },
        ].map((agent, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: agent.delay }}
            whileHover={{ scale: 1.05 }}
            className="ai-agent text-center"
          >
            <motion.div
              animate={{ rotate: agent.rotate }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="ai-agent-icon text-4xl"
            >
              🤖
            </motion.div>
            <div className="ai-agent-score">
              <div className="ai-agent-label">Agent {i + 1}</div>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: i === 0 ? "84%" : "88%" }}
                transition={{ delay: agent.scoreDelay, duration: 1 }}
                className={`ai-agent-value text-2xl font-bold ${agent.color}`}
              >
                {agent.score}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
        className="final-score text-center"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="score-box rounded-xl bg-brand p-4 text-white"
        >
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="score-box-number text-3xl font-bold"
          >
            86
          </motion.div>
          <div className="score-box-percent text-sm">Match Score</div>
        </motion.div>
      </motion.div>
    </div>
  </motion.div>
);
