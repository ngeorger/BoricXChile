<template lang="pug">
.mapa
	UnSVG(ref="unSVG" tipo="mapa" @clickSVG="detectarTerritorio" :class="zoom" @listo="destacarSeleccionada")
</template>
<script>
export default {
	props: {
		zoom: {
			type: String,
			default: 'pais'
		},
		regionID: {
			type: String,
			default: null
		},
		provinciaID: {
			type: String,
			default: null
		},
		comunaID: {
			type: String,
			default: null
		}
	},
	watch: {
		zoom () { this.destacarSeleccionada() }
	},
	mounted () { this.destacarSeleccionada() },
	methods: {
		destacarSeleccionada () {
			const _ = this._
			const zoom = this.zoom
			const hijosDelSvg = this._.get(this.$refs, ['unSVG','$el', 'children', 0, 'children'])
			// Reset 
			_.forEach(hijosDelSvg, region => {
				region.classList.remove("activa")
				_.forEach(region.children, provincia => {
					provincia.classList.remove("activa")
					_.forEach(provincia.children, comuna => {
						comuna.classList.remove("activa")
					})
					if (zoom === 'comuna') {
						const comunaGrupo = _.find(provincia.children, comuna => comuna.id === this.comunaID)
						if (comunaGrupo) comunaGrupo.classList.add("activa")
					}
				})
				if (zoom === 'provincia') {
					const provinciaGrupo = _.find(region.children, provincia => provincia.id === this.provinciaID)
					if (provinciaGrupo) provinciaGrupo.classList.add("activa")
				}
			})
			if (zoom === 'region') {
				const regionGrupo = _.find(hijosDelSvg, region => region.id === this.regionID)
				if (regionGrupo) regionGrupo.classList.add("activa")
			}
		},
		detectarTerritorio (pathDom) {
			if (pathDom[0].tagName === 'svg') {
				this.$emit('ClickFuera')
				return
			}
			const [idComuna, idProvincia, idRegion] = this._.map(pathDom, p => p.id)
			console.log('manejarClickSvg', [idComuna, idProvincia, idRegion])
			// const [comuna, provincia, region] = [idComuna, idProvincia, idRegion].map(id => this.$p(id))
			const [comuna, provincia, region] = [idComuna, idProvincia, idRegion]
			
			this.$emit('ClickTerritorio', {comuna, provincia, region})
		}
	}
}
</script>
<style lang="sass" scoped>

$colorBase: #585B56
$colorImpar: #585B56
$colorPar: #585B56
$colorSemitransparente: transparentize($colorBase, .5)
$colorHover: #937D64
$colorSeleccionado: #E76B74
.unSVG::v-deep 
	svg
		display: block
		path
			fill: $colorSemitransparente
		> g.activa path,
		> g > g.activa path,
		path.activa
			fill: $colorSeleccionado !important
	&.pais svg
		// border: 1px solid green
		> g:nth-child(even)
			path
				fill: $colorPar
				stroke: $colorPar
		> g:nth-child(odd)
			path
				fill: $colorImpar
				stroke: $colorImpar
		> g
			position: relative
			transform-origin: center
			transition: all .2s ease
			&:hover
				path
					fill: $colorHover !important
	//&.region svg
		> g > g:hover
			path
				fill: $colorHover
</style>
