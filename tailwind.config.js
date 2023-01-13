/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js}"],
    daisyui: {
        themes: [
            {
                mclinker: {
                    "primary": "#729e34",
                    "secondary": "#BF95F9",
                    "accent": "#FFB86B",
                    "neutral": "#222e35",
                    "base-100": "#111b21",
                    "info": "#8BE8FD",
                    "success": "#52F17C",
                    "warning": "#F1FA89",
                    "error": "#FF5757"
                }
            },
        ],
    },
    theme: {
        extend: {},
    },
    plugins: [require("daisyui")]
}
