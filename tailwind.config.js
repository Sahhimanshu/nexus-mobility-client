/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        midnight: '#0A0F1E',
        navy: '#0D1B3E',
        cobalt: '#1E3A8A',
        azure: '#1D4ED8',
        cyan: '#06B6D4',
        gold: '#F59E0B',
        amber: '#FBBF24',
        slate: {
          850: '#1a2235',
          900: '#0f172a',
          950: '#080d1a',
        }
      },
      backgroundImage: {
        'mesh-1': 'radial-gradient(at 40% 20%, #1E3A8A 0px, transparent 50%), radial-gradient(at 80% 0%, #06B6D4 0px, transparent 50%), radial-gradient(at 0% 50%, #0A0F1E 0px, transparent 50%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      }
    },
  },
  plugins: [],
}
