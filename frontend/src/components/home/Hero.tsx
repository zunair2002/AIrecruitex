"use client";

import { useState, useEffect } from "react";

export const Hero = () => {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  const words = ["Find the best talent", "Hire faster", "Screen smarter"];
  const period = 2000;

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
      setLoopNum(loopNum + 1);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, loopNum, words]);

  return (
    <section
      className="hero"
      style={{
        background:
          "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)",
        padding: "140px 0px 100px",
      }}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="hero-content text-center">
          {/* Heading with typewriter effect */}
          <h1 className="hero-headline mb-6">
            <span
              className="typewriter-text"
              style={{
                color: "#FFFFFF",
                fontSize: "68px",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: "bold",
              }}
            >
              {displayText}
            </span>
            <span
              className="typewriter-cursor inline-block w-1 ml-1 animate-pulse"
              style={{
                backgroundColor: "#FFFFFF",
                height: "68px",
              }}
            ></span>
          </h1>

          {/* Subheadline */}
          <p
            className="hero-subheadline mx-auto text-center"
            style={{
              color: "#FFFFFFE6",
              fontSize: "20px",
              fontFamily: "'Inter', sans-serif",
              margin: "0px auto 40px auto",
              maxWidth: "900px",
              lineHeight: "1.5",
              textAlign: "center",
            }}
          >
            Skreena conducts{" "}
            <span className="sparkle-word" style={{ display: "inline-block" }}>
              <span
                style={{
                  background: "linear-gradient(135deg, #FFFFFF, #E0F2FE)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  fontWeight: "600",
                }}
              >
                intelligent
              </span>
              <svg
                className="sparkle-icon w-5 h-5"
                style={{ display: "inline", marginLeft: "4px" }}
                viewBox="0 0 24 24"
                fill="none"
              >
                <defs>
                  <linearGradient
                    id="sparkleGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#E0F2FE" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z"
                  fill="url(#sparkleGrad)"
                />
                <path
                  d="M19 2L19.75 4.25L22 5L19.75 5.75L19 8L18.25 5.75L16 5L18.25 4.25L19 2Z"
                  fill="url(#sparkleGrad)"
                />
                <path
                  d="M6 16L6.5 17.5L8 18L6.5 18.5L6 20L5.5 18.5L4 18L5.5 17.5L6 16Z"
                  fill="url(#sparkleGrad)"
                />
              </svg>
            </span>{" "}
            interviews 24/7, scores candidates against your requirements, and
            delivers a ranked shortlist — so you only spend time on the best
            fits.
          </p>

          {/* CTA Buttons */}
          <div className="hero-ctas flex flex-wrap items-center justify-center gap-4 mt-10">
            <a
              href="#contact"
              className="btn btn-outline btn-large"
              style={{
                color: "#FFFFFF",
                fontSize: "16px",
                fontFamily: "'Inter', sans-serif",
                fontWeight: "600",
                background: "#FFFFFF26",
                padding: "16px 48px",
                borderRadius: "8px",
                textDecoration: "none",
                display: "inline-block",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              Book a Demo
            </a>
            <a
              href="#recruitment-service"
              className="btn btn-ghost btn-large"
              style={{
                color: "#FFFFFF",
                fontSize: "16px",
                fontFamily: "'Inter', sans-serif",
                fontWeight: "600",
                background: "transparent",
                padding: "16px 48px",
                borderRadius: "8px",
                textDecoration: "none",
                display: "inline-block",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              We'll Recruit For You
            </a>
          </div>

            {/* Hero Image */}
          <div className="hero-image mt-16 lg:mt-20">
            <div className="relative">
              <img
                src="/landing/images/hero-3-images.png"
                alt="Skreena AI-powered candidate screening dashboard"
                loading="eager"
                style={{
                  width: "752px",
                  maxWidth: "100%",
                  height: "auto",
                  margin: "0 auto",
                  borderRadius: "12px",
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://placehold.co/752x470/ffffff/white?text=Skreena+Dashboard";
                }}
              />
            </div>
            <p
              className="hero-caption text-center mt-4"
              style={{
                color: "#FFFFFFCC",
                fontSize: "14px",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Your AI recruitment team in your pocket
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
