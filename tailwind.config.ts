import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'spin-slow': 'spin 5s linear infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', 'box-shadow': '0 0 5px #34D399, 0 0 10px #34D399' },
          '50%': { opacity: '0.8', 'box-shadow': '0 0 15px #34D399, 0 0 25px #34D399' },
        }
      },
    },
  },
  plugins: [],
};
export default config; 