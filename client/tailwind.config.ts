import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./index.html", 
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{html,js,jsx,ts,tsx,vue}",
    "*.html"
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        // Custom Bluebonnet Theme Colors
        bluebonnet: {
          50: "var(--bluebonnet-50)",
          100: "var(--bluebonnet-100)",
          200: "var(--bluebonnet-200)",
          300: "var(--bluebonnet-300)",
          400: "var(--bluebonnet-400)",
          500: "var(--bluebonnet-500)",
          600: "var(--bluebonnet-600)",
          700: "var(--bluebonnet-700)",
          800: "var(--bluebonnet-800)",
          900: "var(--bluebonnet-900)",
        },
        // Texas Green Colors
        "texas-green": {
          100: "var(--texas-green-100)",
          400: "var(--texas-green-400)",
          500: "var(--texas-green-500)",
          600: "var(--texas-green-600)",
        },
        // Earth Tone Colors
        earth: {
          100: "var(--earth-100)",
          400: "var(--earth-400)",
          500: "var(--earth-500)",
          600: "var(--earth-600)",
        },
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;