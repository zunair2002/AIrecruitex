import type { HowItWorksStep } from "./stepsData";

export const HowItWorksHeader = () => (
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
);

export const StepCard = ({ step }: { step: HowItWorksStep }) => (
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
        {step.number}
      </span>
      <div
        className="icon-wrapper"
        style={{
          width: "80px",
          height: "80px",
          background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)",
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
          style={{ width: "40px", height: "40px" }}
        >
          {step.icon}
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
        {step.title}
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
        {step.description}
      </p>
    </div>
  </div>
);
