/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
          primary: {
            DEFAULT: '#3B82F6',
            hover: '#2563EB',
            dark: '#1E40AF',
          },
          success: {
            DEFAULT: '#10B981',
            hover: '#059669',
          },
          danger: {
            DEFAULT: '#EF4444',
            hover: '#DC2626',
          },
          neutral: {
            DEFAULT: '#6B7280',
            hover: '#4B5563',
          },
          sidebar: {
            bg: '#FFFFFF',
            active: '#EFF6FF',
            text: '#6B7280',
            'active-text': '#1E40AF',
          },
        },
    },
  },
  plugins: [],
}