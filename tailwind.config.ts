import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "rgb(var(--color-primary) / <alpha-value>)",
                "background-light": "rgb(var(--color-background-light) / <alpha-value>)",
                "background-dark": "rgb(var(--color-background-dark) / <alpha-value>)",
                "surface-light": "rgb(var(--color-surface-light) / <alpha-value>)",
                "surface-dark": "rgb(var(--color-surface-dark) / <alpha-value>)",
                "border-light": "rgb(var(--color-border-light) / <alpha-value>)",
                "border-dark": "rgb(var(--color-border-dark) / <alpha-value>)",
                "text-main": "rgb(var(--color-text-main) / <alpha-value>)",
                "text-muted": "rgb(var(--color-text-muted) / <alpha-value>)",
                background: "var(--background)",
                foreground: "var(--foreground)",
                // Status Palette
                success: "rgb(var(--color-status-success) / <alpha-value>)",
                warning: "rgb(var(--color-status-warning) / <alpha-value>)",
                error: "rgb(var(--color-status-error) / <alpha-value>)",
                info: "rgb(var(--color-status-info) / <alpha-value>)",
            },
        },
    },
    plugins: [
        require("@tailwindcss/forms"),
    ],
};
export default config;
