<template lang="pug">
.mapa
	UnSVG(ref="unSVG" tipo="mapa" @clickSVG="detectarTerritorio" :class="zoom" @listo="iniciar")
</template>
<script>
function centroPropio (nodo) {
	console.log('centroPropio', nodo.id)
	const nodoBBox = nodo.getBBox()
	const nodoCentro = {x:nodoBBox.x + (nodoBBox.width / 2), y:  nodoBBox.y + (nodoBBox.height / 2)}
	console.log('centroPropio', nodo.id, Object.values(nodoCentro))
	return Object.values(nodoCentro).map(v => `${v}px`).join(' ')
}

function diffCentroParent (nodo) {
	console.log('diffCentroParent', nodo.id)
	const parentBBox = nodo.parentNode.getBBox()
	const parentCentro = {x: parentBBox.x + (parentBBox.width / 2), y: parentBBox.y + (parentBBox.height / 2)}

	const nodoBBox = nodo.getBBox()
	const nodoCentro = {x:nodoBBox.x + (nodoBBox.width / 2), y:  nodoBBox.y + (nodoBBox.height / 2)}
	const diffCentros = {x: parentCentro.x - nodoCentro.x, y: parentCentro.y - nodoCentro.y}
	return Object.values(diffCentros).map(v => `${v}px`).join(', ')
}
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
			console.log('destacarSeleccionada')
			await new Promise(resolve => { requestAnimationFrame(resolve) })

			const _ = this._
			const zoom = this.zoom
			const elSVG = this._.get(this.$refs, ['unSVG','$el', 'children', 0])
			
			let cadena
			_.forEach(elSVG.children, region => {
				region.classList.add("region")
				_.forEach(region.children, provincia => {
					provincia.classList.add("provincia")
					_.forEach(provincia.children, comuna => {
						comuna.classList.add("comuna")
						if (zoom === 'comuna' && comuna.id === this.comunaID) cadena = [region, provincia, comuna]
						comuna.style.transformOrigin = centroPropio(comuna)
					})
					if (zoom === 'provincia' && provincia.id === this.provinciaID) cadena = [region, provincia]
					provincia.style.transformOrigin = centroPropio(provincia)
				})
				if (zoom === 'region' && region.id === this.regionID) cadena = [region]
				region.style.transformOrigin = centroPropio(region)
			})
			console.log('cadena', cadena)
			const [nodoRegion, nodoProvincia, nodoComuna] = cadena || []

			_.forEach(elSVG.children, region => {
				if (region.isEqualNode(nodoRegion)) {
					if (zoom === 'region') region.classList.add("activa", "exacta")
					else region.classList.add("activa")
					const traslacion =  diffCentroParent(region)
					region.style.transform = `translate(${traslacion}) scale(2)`
				} else {
					region.classList.remove("activa", "exacta")
					region.style.transform = 'none'
				}
				_.forEach(region.children, provincia => {
					if (provincia.isEqualNode(nodoProvincia)) {
						if (zoom === 'provincia') provincia.classList.add("activa", "exacta")
						else provincia.classList.add("activa")
						const traslacion =  diffCentroParent(provincia)
						provincia.style.transform = `translate(${traslacion}) scale(2)`
					} else {
						provincia.classList.remove("activa", "exacta")
						provincia.style.transform = 'none'
					}
					_.forEach(provincia.children, comuna => {
						if (comuna.isEqualNode(nodoComuna)) {
							if (zoom === 'comuna') comuna.classList.add("activa", "exacta")
							else comuna.classList.add("activa")
							const traslacion =  diffCentroParent(comuna)
							comuna.style.transform = `translate(${traslacion}) scale(2)`
						} else {
							comuna.classList.remove("activa", "exacta")
							comuna.style.transform = 'none'
						}
					})
				})
			})
		},
		detectarTerritorio (pathDom) {
			if (pathDom[0].tagName === 'svg') {
				this.$emit('ClickFuera')
				return
			}
			const [idComuna, idProvincia, idRegion] = this._.map(pathDom, p => p.id)
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
$colorActiva: #E76B74
$colorActivaExacta: #E76B74
.mapa
	max-height: 100vh
	.unSVG
		height: 100%
.unSVG::v-deep 
	svg
		height: 100%
		display: block
		g,
		path
			transition: transform .2s ease
			transform: translate(0,0) scale(1)
			pointer-events: none
			fill: transparentize($colorBase, .8)

		.region.activa path,
		.provincia.activa path,
		.comuna.activa
			fill: $colorSemitransparente
			pointer-events: none

		.region.activa.exacta path,
		.provincia.activa.exacta path,
		.comuna.activa.exacta
			fill: $colorActivaExacta
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


// .region.activa

</style>
