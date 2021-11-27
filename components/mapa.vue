<template lang="pug">
.mapa(:class="zoom")
	UnSVG.tierra(ref="trasSVG" tipo="mapa" @clickSVG="detectarTerritorio" :class="zoom" @listo="iniciar")
	UnSVG.territorio(ref="unSVG" tipo="mapa" @clickSVG="detectarTerritorio" :class="zoom" @listo="iniciar")
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
	const diffCentros = {x: (parentCentro.x - nodoCentro.x), y: parentCentro.y - nodoCentro.y}
	return Object.values(diffCentros).map(v => `${v}px`).join(', ')
}

// eslint-disable-next-line
function escalarSegunParent (nodo, elSVG) {
	console.log('escalarSegunParent', nodo.id)
	const viewportBBox = { x: 0, y: 0, width: 4009, height: 8717}
	const nodoBBox = nodo.getBBox()
	const parentBBox = nodo.parentNode.getBBox()

	const escalaContain = Math.min(parentBBox.width / Math.min(nodoBBox.width, viewportBBox.width), parentBBox.height / Math.min(nodoBBox.height, viewportBBox.height))

	return escalaContain
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
					else {
						region.classList.add("activa")
						region.classList.remove("exacta")
					}
					const traslacion =  diffCentroParent(region)
					region.style.transform = `translate(${traslacion}) scale(${escalarSegunParent(region, elSVG)})`
					// region.style.transform = `translate(${traslacion}) scale(${escalarSegunSVG(region, elSVG)})`
				} else {
					region.classList.remove("activa", "exacta")
					region.style.transform = null
				}
				_.forEach(region.children, provincia => {
					if (provincia.isEqualNode(nodoProvincia)) {
						if (zoom === 'provincia') provincia.classList.add("activa", "exacta")
						else {
							provincia.classList.add("activa")
							provincia.classList.remove("exacta")
						}
						const traslacion = diffCentroParent(provincia)
						provincia.style.transform = `translate(${traslacion}) scale(${escalarSegunParent(provincia, elSVG)})`
						// provincia.style.transform = `translate(${traslacion}) scale(${escalarSegunSVG(provincia, elSVG)})`
					} else {
						provincia.classList.remove("activa", "exacta")
						provincia.style.transform = null
					}
					_.forEach(provincia.children, comuna => {
						if (comuna.isEqualNode(nodoComuna)) {
							if (zoom === 'comuna') comuna.classList.add("activa", "exacta")
							else {
								comuna.classList.add("activa")
								comuna.classList.remove("exacta")
							}
							const traslacion =  diffCentroParent(comuna)
							comuna.style.transform = `translate(${traslacion}) scale(${escalarSegunParent(comuna, elSVG)})`
							// comuna.style.transform = `translate(${traslacion}) scale(${escalarSegunSVG(comuna, elSVG)})`
						} else {
							comuna.classList.remove("activa", "exacta")
							comuna.style.transform = null
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
$colorSemitransparente: var(--colorSemitransparente)
$colorHover: #937D64
$colorActiva: #E76B74
$colorActivaExacta: #E76B74
.mapa
	max-height: 100vh
	position: relative
	--colorSemitransparente: rgba(81, 96, 71, .15)
	.unSVG
		height: 100%
	.tierra
		position: absolute
		top: 0
		left: 0
		right: 0
		bottom: 0
		--colorSemitransparente: hsl(25deg 29% 36% / 15%)
.unSVG::v-deep 
	svg
		height: 100%
		display: block
		transition: transform .2s ease 
		g,
		path
			transition: transform .2s ease, transformOrigin .2s linear, transform-origin .2s linear
			transform: translate(0,0) scale(1)
			pointer-events: none
			fill: $colorSemitransparente

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
			
.mapa
	background-color: #eee
	&.pais::v-deep svg
		path
			fill: $colorSemitransparente
			pointer-events: all
		> g
			&:hover
				path
					fill: $colorHover
	//&.region::v-deep svg 
		.region
			transform: translate(-10%, 0)
	//&.provincia::v-deep svg
		.region
			transform: translate(-40%, 0)
		.provincia
			transform: translate(-10%, 0)
		.provincia.activa > path:hover
			fill: $colorHover
	//&.comuna::v-deep  svg
		.region
			transform: translate(-80%, 0)
		.provincia
			transform: translate(-40%, 0)
		.comuna
			transform: translate(-10%, 0)
		.comuna.activa
			fill: $colorHover


// .region.activa

</style>
