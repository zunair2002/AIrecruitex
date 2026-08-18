export const contactInfo = {
  demo: {
    heading: "Book a Demo",
    subtext:
      "Want to see Skreena in action? Book a demo and we'll show you how AI-powered screening can transform your hiring process.",
  },
  recruit: {
    heading: "We Need Recruitment Help",
    subtext:
      "Tell us about your hiring needs and our team will get back to you within 24 hours with a custom solution.",
  },
};

export type ContactMode = "demo" | "recruit";

export type ContactFormData = {
  name: string;
  email: string;
  company: string;
  message: string;
};

export const emptyContactForm: ContactFormData = {
  name: "",
  email: "",
  company: "",
  message: "",
};
