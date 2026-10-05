// Konfigurasi Tailwind (CDN) - tema hitam/merah
tailwind.config = {
  theme: {
    extend: {
      colors: {
        ink: '#050505',
        panel: '#0c0c0e',
        line: '#1f1f23',
        blood: { DEFAULT: '#e11d2e', dark: '#9b111e', light: '#ff3b4d' },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(225,29,46,.35)',
      },
    },
  },
};
