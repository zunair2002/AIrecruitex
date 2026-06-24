"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const words = ["Find the best talent", "Hire faster", "Screen smarter"];
const period = 2000;

export const Hero = () => {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentIndex = loopNum % words.length;
    const fullText = words[currentIndex];

    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplayText(fullText.substring(0, displayText.length - 1));
      }, 100);
    } else {
      timer = setTimeout(() => {
        setDisplayText(fullText.substring(0, displayText.length + 1));
      }, 150);
    }

    if (!isDeleting && displayText === fullText) {
      timer = setTimeout(() => setIsDeleting(true), period);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setLoopNum((prev) => prev + 1);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, loopNum]);

  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-32">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 -z-10" />
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-purple-100 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-100 blur-3xl opacity-50" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Next-Gen AI Recruiting
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
              <span className="block mb-2 text-indigo-600 min-h-[80px]">
                {displayText}
                <span className="animate-pulse ml-1">|</span>
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Skreena conducts intelligent interviews 24/7, scores candidates against your requirements, and delivers a ranked shortlist &mdash; so you only spend time on the best fits.
            </p>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <a href="#contact" className="px-8 py-4 rounded-full bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                Start Hiring Now
              </a>
              <a href="#demo" className="px-8 py-4 rounded-full bg-white text-gray-700 font-semibold shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </a>
            </div>
          </motion.div>

          {/* Hero Images Grid / Collage */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 relative w-full h-[400px] lg:h-[500px]"
          >
            <div className="relative w-full h-full">
              {/* Main Image */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 bg-white z-10 flex items-center justify-center p-4">
                <div className="relative w-full h-full">
                  <Image
                    src="/landing/images/hero-3-images.png"
                    alt="Skreena Dashboard"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              
              {/* Floating Element 1 - Candidate Score */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-10 right-0 lg:right-4 bg-white p-4 rounded-xl shadow-xl border border-gray-100 z-20 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-lg">
                  98%
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Top Candidate</p>
                  <p className="text-xs text-gray-500">Match Score</p>
                </div>
              </motion.div>

              {/* Floating Element 2 - AI Interviewing */}
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="absolute bottom-10 left-0 lg:left-4 bg-white p-4 rounded-xl shadow-xl border border-gray-100 z-20 flex items-center gap-3"
              >
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </div>
                <p className="text-sm font-semibold text-gray-900">AI Interview Active</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
