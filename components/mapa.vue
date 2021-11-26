<template lang="pug">
.mapa
	UnSVG(tipo="mapa" @clickSVG="detectarTerritorio")
</template>
<script>
export default {
	methods: {
		detectarTerritorio (pathDom) {
			if (pathDom[0].tagName === 'svg') return
			const [comuna, provincia, region] = this._.map(pathDom, p => p.id)
			console.log('manejarClickSvg', [comuna, provincia, region])
		}
	}
}
</script>
<style lang="sass" scoped>
.unSVG::v-deep svg
	display: block
</style>
