<template lang="pug">
.padreMapa
	Mapa(@ClickTerritorio="cambiarTerritorio" @ClickFuera="alejar")
	.contenido
		.migajas
			.regionID(v-if="regionID")
				pre regionID
				pre {{regionID}}
			.provinciaID(v-if="provinciaID")
				pre provinciaID
				pre {{provinciaID}}
			.comunaID(v-if="comunaID")
				pre comunaID
				pre {{comunaID}}
		.info
			pre #[b zoom]: {{zoom}}
		n-child
</template>
<script>
export default {
	computed: {
		regionID () { return this.$route.params.regionID },
		provinciaID () { return this.$route.params.provinciaID },
		comunaID () { return this.$route.params.comunaID },
		zoom () {
			const {comunaID, provinciaID, regionID } = this
			return comunaID? 'comuna' : provinciaID ? 'provincia' : regionID ? 'region' : 'pais'
		}
	},
	methods: {
		cambiarTerritorio ({comuna, provincia, region}) {
			console.log('cambiarTerritorio', [comuna, provincia, region])
			const {comunaID, provinciaID, regionID } = this
			const zoom = this.zoom
			const mismaComuna = comunaID && comuna === comunaID
			const mismaProvincia = provinciaID && provincia === provinciaID
			const mismaRegion = regionID && region === regionID

			if (mismaComuna) return false
			if (zoom === 'pais' && region) this.$router.push(`/mapa/${region}`)
			else if (zoom === 'region' && mismaRegion) this.$router.push(`/mapa/${region}/${provincia}`)
			else if (zoom === 'provincia' && mismaProvincia) this.$router.push(`/mapa/${region}/${provincia}/${comuna}`)
			else this.alejar()
		},
		alejar () {
			const zoom = this.zoom
			if (zoom === 'pais') return false
			else if (zoom === 'region') this.$router.push(`/mapa`)
			else if (zoom === 'provincia') this.$router.push(`/mapa/${this.regionID}`)
			else if (zoom === 'comuna') this.$router.push(`/mapa/${this.regionID}/${this.provinciaID}`)
		}
	}
}
</script>
<style lang="sass" scoped>
.padreMapa
	display: flex
	flex-flow: row nowrap

	.mapa
		flex: 50% 1 1
	.contenido
		flex: 50% 1 1
		.migajas
			display: flex
			flex-flow: row wrap
			justify-content: flex-start
			.provinciaID,
			.comunaID
				::before
					content: ' > '


</style>
