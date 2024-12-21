import daisyui from 'daisyui'
import daisyUIThemes from 'daisyui/src/theming/themes'

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    daisyui,
  ],
  daisyui: {
		themes: [
			"light",
			{
				black: {
					...daisyUIThemes["black"], // getting the black theme from daisyui
					primary: "rgb(29, 155, 240)",
					secondary: "rgb(24, 24, 24)",
				},
			},
		],
	},
}

