"use client";

import { motion } from "framer-motion";

export const TwoStageVisual = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="scene-twostage bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8"
  >
    <div className="pipeline flex items-center justify-center gap-4 flex-wrap">
      <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="pipeline-stage text-center">
        <div className="cv-pile">
          <motion.div whileHover={{ y: -5 }} className="cv-doc w-12 h-16 bg-indigo-200 rounded mb-1"></motion.div>
          <motion.div whileHover={{ y: -5 }} className="cv-doc w-12 h-16 bg-indigo-200 rounded mb-1"></motion.div>
          <motion.div whileHover={{ y: -5 }} className="cv-doc w-12 h-16 bg-indigo-200 rounded"></motion.div>
        </div>
        <div className="pile-label font-bold mt-2">50 CVs</div>
        <div className="pile-count text-sm text-gray-500">received</div>
      </motion.div>
      <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="filter-line text-4xl text-indigo-400">→</motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="pipeline-stage text-center">
        <div className="filter-gate">
          <div className="filter-icon text-indigo-600 text-3xl">⚡</div>
          <div className="filter-label font-bold">CV Screen</div>
          <div className="filter-stats text-indigo-600">8 pass</div>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="filter-line text-4xl text-indigo-400">→</motion.div>
      <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }} className="pipeline-stage text-center">
        <div className="interview-stage">
          <div className="interview-box bg-indigo-100 p-4 rounded-lg">
            <div className="chat-lines">
              <motion.div animate={{ width: ["20px", "80px", "20px"] }} transition={{ repeat: Infinity, duration: 2 }} className="chat-line-mini ai h-2 bg-indigo-300 rounded mb-1"></motion.div>
              <div className="chat-line-mini user h-2 w-16 bg-gray-300 rounded mb-1"></div>
              <div className="chat-line-mini ai h-2 w-24 bg-indigo-300 rounded"></div>
            </div>
          </div>
          <div className="interview-label font-bold mt-2">Interview</div>
          <div className="interview-count">8 candidates</div>
        </div>
      </motion.div>
    </div>
  </motion.div>
);
