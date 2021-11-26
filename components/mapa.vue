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
			})

			let elementoActivo

			if (zoom === 'region') {
				elementoActivo = _.find(hijosDelSvg, region => region.id === this.regionID)
			} else if (zoom === 'provincia') {
				_.forEach(hijosDelSvg, region => {
					const match = _.find(region.children, provincia => provincia.id === this.provinciaID)
					if (match) elementoActivo = match
				})
			} else if (zoom === 'comuna') {
				_.forEach(hijosDelSvg, region => {
					_.forEach(region.children, provincia => {
						const match = _.find(provincia.children, comuna => comuna.id === this.comunaID)
						if (match) elementoActivo = match
					})
				})
			}
			if (elementoActivo) {
				elementoActivo.classList.add("activa")
				const boundingBox = elementoActivo.getBBox()
				console.log('boundingBox', boundingBox)
				const centroX = boundingBox.x + (boundingBox.width / 2)
				const centroY = boundingBox.y + (boundingBox.height / 2)
				// TO DO: Maximizar la zona activa al 80% del área disponible para el svg del mapa
				elementoActivo.setAttribute('style', `transform-origin: ${centroX}px ${centroY}px;`)
			}

			// TO DO: Reordenar elementos para que el correspondiente a la zona activa quede primero (z-index en svg se determina por su posición en el código)
		},
		detectarTerritorio (pathDom) {
			if (pathDom[0].tagName === 'svg') {
				this.$emit('ClickFuera')
				return
			}
			const [idComuna, idProvincia, idRegion] = this._.map(pathDom, p => p.id)
			// console.log('manejarClickSvg', [idComuna, idProvincia, idRegion])
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
		g,
		path
			transition: transform .2s ease
			pointer-events: none
			fill: transparentize($colorBase, .8)

		> g.activa,
		> g > g.activa,
		path.activa
			transform: scale(2)

		> g.activa path,
		> g > g.activa path,
		path.activa
			fill: $colorSeleccionado
			pointer-events: all
			
	&.pais svg
		path
			fill: $colorSemitransparente
			pointer-events: all
		> g
			&:hover
				path
					fill: $colorHover
	&.region svg
		> g:not(.activa)
			&:hover
				path
					fill: $colorHover
		> g.activa > g:hover
			path
				fill: $colorHover
	&.provincia svg
		> g > g:not(.activa)
			&:hover
				path
					fill: $colorHover
		> g > g.activa > path:hover
			fill: $colorHover
</style>
