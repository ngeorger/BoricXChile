// https://github.com/nuxt/nuxt.js/issues/1593#issuecomment-384554130
export default function extend (app, mixin) {
	if (!app.mixins) {
		app.mixins = []
	}
	app.mixins.push(mixin)
}
