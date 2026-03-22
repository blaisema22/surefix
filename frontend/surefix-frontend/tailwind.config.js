/** @type {import('tailwindcss').Config} */
function withOpacity(variableName) {
    return ({ opacityValue }) => {
        if (opacityValue !== undefined) {
            return `rgba(var(${variableName}), ${opacityValue})`
        }
        return `rgb(var(${variableName}))`
    }
}

export default {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'Outfit', 'Inter', 'sans-serif'],
                heading: ['Plus Jakarta Sans', 'Fraunces', 'serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                'sf-bg': withOpacity('--sf-bg'),
                'sf-card': withOpacity('--sf-card'),
                'sf-border': withOpacity('--sf-border'),
                'sf-text': withOpacity('--sf-text'),
                'sf-text-muted': withOpacity('--sf-text-muted'),
                'sf-input': withOpacity('--sf-input'),

                // SureFix Brand 2024
                'sf-blue': '#3b82f6',
                'sf-blue-light': '#60a5fa',
                'sf-cyan': '#22d3ee',
                'sf-emerald': '#10b981',
                'sf-amber': '#f59e0b',
                'sf-red': '#ef4444',
                'sf-purple': '#a78bfa',

                // Legacy aliases
                'sf-border-light': withOpacity('--sf-border'),
                'sf-card-light': withOpacity('--sf-card'),
            },
            spacing: {
                '4.5': '1.125rem',
                '7.5': '1.875rem',
                '18': '4.5rem',
            },
            borderRadius: {
                'sf': 'var(--sf-radius)',
                'sf-lg': 'var(--sf-radius-lg)',
            },
            boxShadow: {
                'glow-blue': '0 0 30px rgba(59,130,246,0.2)',
                'glow-cyan': '0 0 30px rgba(34,211,238,0.2)',
                'card-elevated': '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(59,130,246,0.1)',
            },
            animation: {
                'fade-up': 'fadeUp 0.4s var(--sf-spring)',
                'shimmer': 'shimmer 1.4s infinite',
                'glow': 'glow 2s ease-in-out infinite',
                'spin': 'spin 0.7s linear infinite',
                'scale-in': 'sf-scale-in 0.6s var(--sf-spring)',
            },
            keyframes: {
                fadeUp: {
                    'from': { opacity: '0', transform: 'translateY(18px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' },
                },
                shimmer: {
                    '0%': { 'background-position': '200% 0' },
                    '100%': { 'background-position': '-200% 0' },
                },
                glow: {
                    '0%, 100%': { boxShadow: 'var(--sf-shadow-glow)' },
                    '50%': { boxShadow: '0 0 60px rgba(59,130,246,0.4)' },
                },
                spin: {
                    'to': { transform: 'rotate(360deg)' },
                },
                'sf-scale-in': {
                    'from': { opacity: '0', transform: 'scale(0.95)' },
                    'to': { opacity: '1', transform: 'scale(1)' },
                },
            },
        },
    },

    plugins: [],
}