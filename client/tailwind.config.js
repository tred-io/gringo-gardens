/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../shared/**/*.{js,jsx,ts,tsx}"
  ],
  safelist: [
    // Layout & Structure
    'flex', 'grid', 'block', 'inline-block', 'inline-flex', 'hidden',
    'w-full', 'w-auto', 'w-1/2', 'w-1/3', 'w-1/4', 'w-2/3', 'w-3/4',
    'h-full', 'h-auto', 'h-screen', 'h-64', 'h-32', 'h-16', 'h-8', 'h-4',
    'max-w-7xl', 'max-w-6xl', 'max-w-4xl', 'max-w-2xl', 'max-w-xl', 'max-w-lg', 'max-w-md', 'max-w-sm', 'max-w-xs',
    'container', 'mx-auto', 'ml-auto', 'mr-auto',
    
    // Spacing
    'p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6', 'p-8', 'p-10', 'p-12', 'p-16', 'p-20', 'p-24',
    'px-1', 'px-2', 'px-3', 'px-4', 'px-5', 'px-6', 'px-8', 'px-10', 'px-12', 'px-16', 'px-20', 'px-24',
    'py-1', 'py-2', 'py-3', 'py-4', 'py-5', 'py-6', 'py-8', 'py-10', 'py-12', 'py-16', 'py-20', 'py-24',
    'm-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6', 'm-8', 'm-10', 'm-12', 'm-16', 'm-20', 'm-24',
    'mx-1', 'mx-2', 'mx-3', 'mx-4', 'mx-5', 'mx-6', 'mx-8', 'mx-10', 'mx-12', 'mx-16', 'mx-20', 'mx-24',
    'my-1', 'my-2', 'my-3', 'my-4', 'my-5', 'my-6', 'my-8', 'my-10', 'my-12', 'my-16', 'my-20', 'my-24',
    'mt-1', 'mt-2', 'mt-3', 'mt-4', 'mt-5', 'mt-6', 'mt-8', 'mt-10', 'mt-12', 'mt-16', 'mt-20', 'mt-24',
    'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mb-5', 'mb-6', 'mb-8', 'mb-10', 'mb-12', 'mb-16', 'mb-20', 'mb-24',
    'ml-1', 'ml-2', 'ml-3', 'ml-4', 'ml-5', 'ml-6', 'ml-8', 'ml-10', 'ml-12', 'ml-16', 'ml-20', 'ml-24',
    'mr-1', 'mr-2', 'mr-3', 'mr-4', 'mr-5', 'mr-6', 'mr-8', 'mr-10', 'mr-12', 'mr-16', 'mr-20', 'mr-24',
    'space-x-1', 'space-x-2', 'space-x-3', 'space-x-4', 'space-x-5', 'space-x-6', 'space-x-8', 'space-x-10', 'space-x-12',
    'space-y-1', 'space-y-2', 'space-y-3', 'space-y-4', 'space-y-5', 'space-y-6', 'space-y-8', 'space-y-10', 'space-y-12',
    'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-5', 'gap-6', 'gap-8', 'gap-10', 'gap-12', 'gap-16', 'gap-20', 'gap-24',
    
    // Colors
    'bg-white', 'bg-black', 'bg-gray-50', 'bg-gray-100', 'bg-gray-200', 'bg-gray-300', 'bg-gray-400', 'bg-gray-500', 'bg-gray-600', 'bg-gray-700', 'bg-gray-800', 'bg-gray-900',
    'text-white', 'text-black', 'text-gray-50', 'text-gray-100', 'text-gray-200', 'text-gray-300', 'text-gray-400', 'text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900',
    'border-white', 'border-black', 'border-gray-50', 'border-gray-100', 'border-gray-200', 'border-gray-300', 'border-gray-400', 'border-gray-500', 'border-gray-600', 'border-gray-700', 'border-gray-800', 'border-gray-900',
    
    // Custom Colors
    'bg-bluebonnet-50', 'bg-bluebonnet-100', 'bg-bluebonnet-200', 'bg-bluebonnet-300', 'bg-bluebonnet-400', 'bg-bluebonnet-500', 'bg-bluebonnet-600', 'bg-bluebonnet-700', 'bg-bluebonnet-800', 'bg-bluebonnet-900',
    'text-bluebonnet-50', 'text-bluebonnet-100', 'text-bluebonnet-200', 'text-bluebonnet-300', 'text-bluebonnet-400', 'text-bluebonnet-500', 'text-bluebonnet-600', 'text-bluebonnet-700', 'text-bluebonnet-800', 'text-bluebonnet-900',
    'border-bluebonnet-50', 'border-bluebonnet-100', 'border-bluebonnet-200', 'border-bluebonnet-300', 'border-bluebonnet-400', 'border-bluebonnet-500', 'border-bluebonnet-600', 'border-bluebonnet-700', 'border-bluebonnet-800', 'border-bluebonnet-900',
    'bg-texas-green-100', 'bg-texas-green-400', 'bg-texas-green-500', 'bg-texas-green-600',
    'text-texas-green-100', 'text-texas-green-400', 'text-texas-green-500', 'text-texas-green-600',
    'border-texas-green-100', 'border-texas-green-400', 'border-texas-green-500', 'border-texas-green-600',
    'bg-earth-100', 'bg-earth-400', 'bg-earth-500', 'bg-earth-600',
    'text-earth-100', 'text-earth-400', 'text-earth-500', 'text-earth-600',
    
    // Borders & Shadows
    'border', 'border-0', 'border-2', 'border-4', 'border-8',
    'border-t', 'border-r', 'border-b', 'border-l',
    'rounded', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full',
    'shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl', 'shadow-none',
    
    // Typography
    'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl',
    'font-thin', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold', 'font-black',
    'text-left', 'text-center', 'text-right', 'text-justify',
    'leading-none', 'leading-tight', 'leading-snug', 'leading-normal', 'leading-relaxed', 'leading-loose',
    'tracking-tighter', 'tracking-tight', 'tracking-normal', 'tracking-wide', 'tracking-wider', 'tracking-widest',
    
    // Interactive States
    'hover:bg-bluebonnet-700', 'hover:bg-bluebonnet-800', 'hover:bg-texas-green-500', 'hover:bg-texas-green-600',
    'hover:text-bluebonnet-600', 'hover:text-bluebonnet-700', 'hover:text-white',
    'focus:ring-bluebonnet-500', 'focus:ring-texas-green-500', 'focus:ring-2', 'focus:ring-4',
    'active:bg-bluebonnet-800', 'active:bg-texas-green-600',
    'transition-colors', 'transition-all', 'duration-200', 'duration-300',
    
    // Positioning
    'relative', 'absolute', 'fixed', 'sticky',
    'top-0', 'right-0', 'bottom-0', 'left-0',
    'z-10', 'z-20', 'z-30', 'z-40', 'z-50',
    
    // Flexbox & Grid
    'flex-col', 'flex-row', 'flex-wrap', 'flex-nowrap',
    'items-start', 'items-center', 'items-end', 'items-stretch',
    'justify-start', 'justify-center', 'justify-end', 'justify-between', 'justify-around', 'justify-evenly',
    'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6', 'grid-cols-12',
    'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-5', 'col-span-6', 'col-span-full',
    
    // Overflow & Display
    'overflow-hidden', 'overflow-visible', 'overflow-scroll', 'overflow-auto',
    'truncate', 'line-clamp-1', 'line-clamp-2', 'line-clamp-3'
  ],
  theme: {
    extend: {
      colors: {
        'bluebonnet': {
          50: '#f8faff',
          100: '#e6edff', 
          200: '#c7d7ff',
          300: '#9cb5ff',
          400: '#6a8cff',
          500: '#4c6fff',
          600: '#3b5ae6',
          700: '#2e47cc',
          800: '#243aa6',
          900: '#1f3085',
        },
        'texas-green': {
          100: '#dcf4e6',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        'earth': {
          100: '#f5f1eb',
          400: '#b8a082',
          500: '#a18a6b',
          600: '#8b7355',
        }
      }
    },
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