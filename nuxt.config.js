import path from 'path'

const nuxtConfig = {
	// Target: https://go.nuxtjs.dev/config-target
	target: 'static',
	env: {
		inicio: new Date(),
		version: 'v1.3.1',
		dev: (process.env.MODO !== 'produccion'),
		modo: process.env.MODO
	},

	// Global page headers: https://go.nuxtjs.dev/config-head
	head: {
		title: 'BoricXChile',
		htmlAttrs: {
			lang: 'es'
		},
		meta: [
			{ charset: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ hid: 'description', name: 'description', content: '' },
			{ name: 'format-detection', content: 'telephone=no' }
		],
		link: [
			{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
		]
	},

	// Global CSS: https://go.nuxtjs.dev/config-css
	css: [
		'~/style/base',
	],

	// Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
	plugins: [
		'~/plugins/lodash',
		'~/plugins/utilidades'
	],

	// Auto import components: https://go.nuxtjs.dev/config-components
	components: true,

	// Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
	buildModules: [
		// https://go.nuxtjs.dev/eslint
		'@nuxtjs/eslint-module',
	],

	// Modules: https://go.nuxtjs.dev/config-modules
	modules: [
	],

	// Build Configuration: https://go.nuxtjs.dev/config-build
	build: {
		extend (config, ctx) {
			config.resolve.alias.style = path.join(__dirname, 'style')
			config.resolve.alias['@style'] = path.join(__dirname, 'style')
		}
	}
}

export default nuxtConfig
