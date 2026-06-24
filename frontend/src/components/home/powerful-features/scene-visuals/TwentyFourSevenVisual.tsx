"use client";

import { motion } from "framer-motion";

export const TwentyFourSevenVisual = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="scene-247 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8"
  >
    <div className="global-interviews flex items-center justify-center gap-8 flex-wrap">
      <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} whileHover={{ y: -5 }} className="device-card bg-white p-4 rounded-xl shadow-md">
        <div className="device-header flex justify-between mb-2">
          <span className="device-time font-bold">9:42 AM</span>
          <div className="device-status w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
        <div className="device-chat">
          <motion.div animate={{ width: ["60px", "100px", "60px"] }} transition={{ repeat: Infinity, duration: 2 }} className="chat-line ai h-2 bg-indigo-300 rounded mb-1"></motion.div>
          <div className="chat-line user h-2 w-20 bg-gray-300 rounded mb-1"></div>
          <div className="chat-line ai h-2 w-28 bg-indigo-300 rounded"></div>
        </div>
        <div className="device-location text-sm text-gray-500 mt-2">London</div>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, type: "spring" }} className="always-on-hub text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="clock-ring w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
          <div className="clock-face text-indigo-600 font-bold">24/7</div>
        </motion.div>
      </motion.div>
      <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} whileHover={{ y: -5 }} className="device-card bg-white p-4 rounded-xl shadow-md">
        <div className="device-header flex justify-between mb-2">
          <span className="device-time font-bold">7:42 PM</span>
          <div className="device-status w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
        <div className="device-chat">
          <div className="chat-line ai h-2 w-24 bg-indigo-300 rounded mb-1"></div>
          <div className="chat-line user h-2 w-20 bg-gray-300 rounded mb-1"></div>
          <motion.div animate={{ width: ["60px", "100px", "60px"] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }} className="chat-line ai h-2 bg-indigo-300 rounded"></motion.div>
        </div>
        <div className="device-location text-sm text-gray-500 mt-2">New York</div>
      </motion.div>
    </div>
  </motion.div>
);
