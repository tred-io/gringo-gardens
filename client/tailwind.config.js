/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{html,tsx,ts}",
    "../shared/**/*.{js,jsx,ts,tsx}",
    "../server/**/*.{js,ts}"
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
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },
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
        "texas-green": {
          100: "var(--texas-green-100)",
          400: "var(--texas-green-400)",
          500: "var(--texas-green-500)",
          600: "var(--texas-green-600)",
        },
        earth: {
          100: "var(--earth-100)",
          400: "var(--earth-400)",
          500: "var(--earth-500)",
          600: "var(--earth-600)",
        },
      },
    },
  },
  plugins: [],
};