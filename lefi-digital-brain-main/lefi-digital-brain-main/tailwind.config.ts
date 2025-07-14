import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: '#72F782', // verde más oscuro para bordes
				input: '#72F782',
				ring: '#72F782',
				background: '#F8FFF0',
				foreground: '#222', // texto principal muy oscuro
				primary: {
					DEFAULT: '#72F782',
					foreground: '#222'
				},
				secondary: {
					DEFAULT: '#87FABC',
					foreground: '#444' // texto secundario más oscuro
				},
				destructive: {
					DEFAULT: '#FAF673',
					foreground: '#222'
				},
				muted: {
					DEFAULT: '#F9FCD6',
					foreground: '#444' // texto secundario
				},
				accent: {
					DEFAULT: '#6DFA3B',
					foreground: '#222'
				},
				card: {
					DEFAULT: '#fff',
					foreground: '#222',
					shadow: '0 2px 8px 0 rgba(34,34,34,0.07)'
				},
				popover: {
					DEFAULT: '#fff',
					foreground: '#222'
				},
				sidebar: {
					DEFAULT: '#F9FCD6',
					foreground: '#222',
					primary: '#72F782',
					'primary-foreground': '#222',
					accent: '#6DFA3B',
					'accent-foreground': '#222',
					border: '#72F782',
					ring: '#72F782'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
