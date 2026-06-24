"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "./animationVariants";

export const PowerfulFeaturesHeader = () => (
  <motion.div variants={fadeInUp} className="section-header text-center mb-16">
    <motion.p
      variants={fadeInUp}
      className="carousel-headline-small"
      style={{
        color: "#1F2937",
        fontSize: "24px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        margin: "0px 0px 8px",
        fontWeight: "400",
      }}
    >
      <span className="hw" style={{ fontWeight: "600" }}>
        Powerful
      </span>{" "}
      Features
    </motion.p>
    <motion.h2
      variants={fadeInUp}
      className="carousel-headline"
      style={{
        color: "#1F2937",
        fontSize: "40px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: "bold",
        margin: 0,
      }}
    >
      Everything you need to screen candidates efficiently.
    </motion.h2>
  </motion.div>
);
