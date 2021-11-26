<template lang="pug">
.mapa
	UnSVG(ref="unSVG" tipo="mapa" @clickSVG="detectarTerritorio" :class="zoom" @listo="iniciar")
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
	data () {
		return {
			svgCentro: null
		}
	},
	watch: {
		zoom () { this.destacarSeleccionada() }
	},
	mounted () { this.destacarSeleccionada() },
	methods: {
		iniciar () {
			const svgElement = this._.get(this.$refs, ['unSVG','$el', 'children', 0])
			const svgBoundingBox = svgElement.getBBox()
			const svgCentroX = svgBoundingBox.x + (svgBoundingBox.width / 2)
			const svgCentroY = svgBoundingBox.y + (svgBoundingBox.height / 2)
			this.svgCentro = [svgCentroX, svgCentroY]
			this.destacarSeleccionada()
		},
		async destacarSeleccionada () {
			await new Promise(resolve => { requestAnimationFrame(resolve) })

			const _ = this._
			const zoom = this.zoom
			const hijosDelSvg = this._.get(this.$refs, ['unSVG','$el', 'children', 0, 'children'])
			
			let elementoActivo

			_.forEach(hijosDelSvg, region => {
				let contiene

				_.forEach(region.children, provincia => {
					_.forEach(provincia.children, comuna => {
						if (zoom === 'comuna' && comuna.id === this.comunaID) {
							elementoActivo = comuna
							contiene = true
						} else {
							comuna.classList.remove("activa")
							comuna.setAttribute('style', null)
						}
					})
					if (zoom === 'provincia' && provincia.id === this.provinciaID) {
						elementoActivo = provincia
						contiene = true
					} else provincia.classList.remove("activa")
					if (!contiene) provincia.setAttribute('style', null)
				})
				if (zoom === 'region' && region.id === this.regionID) {
					elementoActivo = region
					contiene = true
				} else region.classList.remove("activa")
				if (!contiene) region.setAttribute('style', null)
			})

			if (elementoActivo) {
				elementoActivo.classList.add("activa")
				// TO DO: Maximizar la zona activa al 80% del área disponible para el svg del mapa
				
				const parentElement = elementoActivo.parentNode
				const parentBoundingBox = parentElement.getBBox()
				const parentCentroX = parentBoundingBox.x + (parentBoundingBox.width / 2)
				const parentCentroY = parentBoundingBox.y + (parentBoundingBox.height / 2)
				this.parentCentro = [parentCentroX, parentCentroY]
				console.log('parentCentroX, parentCentroY', [parentCentroX, parentCentroY])

				const boundingBox = elementoActivo.getBBox()
				console.log('boundingBox', zoom, boundingBox)
				const centroX = boundingBox.x + (boundingBox.width / 2)
				const centroY = boundingBox.y + (boundingBox.height / 2)
				const corregirCentroElemento = `transform-origin: ${centroX}px ${centroY}px;`
				const diferenciaX = parentCentroX - centroX
				const diferenciaY = parentCentroY - centroY

				const escalado = zoom === 'region' ? 4 : zoom === 'provincia' ? 3 : zoom === 'comuna' ? 2 : 1 
				const moverAlCentroDelSVGYAgrandar = `transform: translate(${diferenciaX}px, ${diferenciaY}px) scale(${escalado});`
				elementoActivo.setAttribute('style', `${corregirCentroElemento} ${moverAlCentroDelSVGYAgrandar} `)
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
			// transition: none
			transform: translate(0,0) scale(1)
			pointer-events: none
			fill: transparentize($colorBase, .8)

		> g.activa,
		> g > g.activa,
		path.activa
			// transition: none
			// transition: transform .2s ease
			// transform: scale(2)

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
