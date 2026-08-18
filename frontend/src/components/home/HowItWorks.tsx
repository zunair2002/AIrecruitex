"use client";

export const HowItWorks = () => {
  return (
    <section className="how-it-works py-20 bg-gray-50" id="how-it-works">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="section-title-wrapper text-center mb-16">
          <p
            className="carousel-headline-small"
            style={{
              color: "#1F2937",
              fontSize: "24px",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              margin: "0px 0px 8px",
              fontWeight: "400",
            }}
          >
            Screen Faster. Hire{" "}
            <span className="hw" style={{ fontWeight: "600" }}>
              Smarter
            </span>
            .
          </p>
          <h2
            className="carousel-headline"
            style={{
              color: "#1F2937",
              fontSize: "40px",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: "bold",
              margin: 0,
            }}
          >
            From job posting to shortlist in three simple steps.
          </h2>
        </div>

        {/* Steps */}
        <div className="steps grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="step text-center">
            <div className="step-icon relative inline-flex items-center justify-center mb-6">
              <span
                className="step-number absolute"
                style={{
                  top: "-8px",
                  right: "-8px",
                  width: "28px",
                  height: "28px",
                  background: "#6366F1",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "bold",
                  fontFamily: "'Inter', sans-serif",
                  zIndex: 10,
                }}
              >
                1
              </span>
              <div
                className="icon-wrapper"
                style={{
                  width: "80px",
                  height: "80px",
                  background:
                    "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    width: "40px",
                    height: "40px",
                  }}
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
              </div>
            </div>
            <div className="step-content">
              <h3
                className="step-title"
                style={{
                  fontSize: "24px",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: "bold",
                  color: "#1F2937",
                  marginBottom: "12px",
                }}
              >
                Post Your Job
              </h3>
              <p
                className="step-description"
                style={{
                  fontSize: "16px",
                  fontFamily: "'Inter', sans-serif",
                  color: "#4B5563",
                  lineHeight: "1.6",
                  maxWidth: "300px",
                  margin: "0 auto",
                }}
              >
                Paste your job description and set your interview mode. Skreena
                generates tailored questions automatically.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="step text-center">
            <div className="step-icon relative inline-flex items-center justify-center mb-6">
              <span
                className="step-number absolute"
                style={{
                  top: "-8px",
                  right: "-8px",
                  width: "28px",
                  height: "28px",
                  background: "#6366F1",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "bold",
                  fontFamily: "'Inter', sans-serif",
                  zIndex: 10,
                }}
              >
                2
              </span>
              <div
                className="icon-wrapper"
                style={{
                  width: "80px",
                  height: "80px",
                  background:
                    "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    width: "40px",
                    height: "40px",
                  }}
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
            </div>
            <div className="step-content">
              <h3
                className="step-title"
                style={{
                  fontSize: "24px",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: "bold",
                  color: "#1F2937",
                  marginBottom: "12px",
                }}
              >
                AI Interviews
              </h3>
              <p
                className="step-description"
                style={{
                  fontSize: "16px",
                  fontFamily: "'Inter', sans-serif",
                  color: "#4B5563",
                  lineHeight: "1.6",
                  maxWidth: "300px",
                  margin: "0 auto",
                }}
              >
                Candidates apply and Skreena interviews them automatically — any
                time, any timezone, no scheduling needed.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="step text-center">
            <div className="step-icon relative inline-flex items-center justify-center mb-6">
              <span
                className="step-number absolute"
                style={{
                  top: "-8px",
                  right: "-8px",
                  width: "28px",
                  height: "28px",
                  background: "#6366F1",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "bold",
                  fontFamily: "'Inter', sans-serif",
                  zIndex: 10,
                }}
              >
                3
              </span>
              <div
                className="icon-wrapper"
                style={{
                  width: "80px",
                  height: "80px",
                  background:
                    "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    width: "40px",
                    height: "40px",
                  }}
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </div>
            <div className="step-content">
              <h3
                className="step-title"
                style={{
                  fontSize: "24px",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: "bold",
                  color: "#1F2937",
                  marginBottom: "12px",
                }}
              >
                Review Shortlist
              </h3>
              <p
                className="step-description"
                style={{
                  fontSize: "16px",
                  fontFamily: "'Inter', sans-serif",
                  color: "#4B5563",
                  lineHeight: "1.6",
                  maxWidth: "300px",
                  margin: "0 auto",
                }}
              >
                Wake up to scored, ranked candidates ready for review. Only
                spend time on the best fits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
