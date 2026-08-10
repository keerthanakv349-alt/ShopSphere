import type { Config } from "tailwindcss";

// Design tokens sourced from the "Vivid Couture" design system
// (stitch_fashion_retail_marketplace / vivid_couture DESIGN.md).
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#b90041", // primary
          dark: "#910031", // on-primary-fixed-variant, used for hover states
        },
        tertiary: {
          DEFAULT: "#994211",
          container: "#b85928",
        },
        success: "#03a685",
        surface: {
          DEFAULT: "#f9f9ff",
          dim: "#d8d9e3",
          bright: "#f9f9ff",
          "container-lowest": "#ffffff",
          "container-low": "#f2f3fd",
          container: "#ecedf7",
          "container-high": "#e6e8f1",
          "container-highest": "#e1e2ec",
        },
        "on-surface": "#191c22",
        "on-surface-variant": "#5b4042",
        outline: "#8f6f72",
        "outline-variant": "#e3bdc0",
      },
      fontFamily: {
        heading: ["Montserrat", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      fontSize: {
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg-mobile": ["24px", { lineHeight: "30px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-bold": ["12px", { lineHeight: "16px", fontWeight: "700" }],
        "label-sm": ["11px", { lineHeight: "14px", fontWeight: "500" }],
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
      spacing: {
        base: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        gutter: "16px",
      },
      maxWidth: {
        "container-max": "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
