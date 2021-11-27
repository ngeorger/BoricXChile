<template lang="pug">
.mapa(:class="zoom")
	UnSVG.territorio(ref="unSVG" tipo="mapa" @clickSVG="detectarTerritorio" :class="zoom" @listo="iniciar")
</template>
<script>
function encontrarCentro (nodo) {
	console.log('encontrarCentro', nodo.id)
	const nodoBBox = nodo.getBBox()
	const nodoCentro = {x:nodoBBox.x + (nodoBBox.width / 2), y:  nodoBBox.y + (nodoBBox.height / 2)}
	console.log('nodoCentro', nodoCentro)
	return nodoCentro
}

function translateAlArea (nodo) {
	console.log('translateAlArea', nodo.id)
	const centroOrigen = encontrarCentro(nodo)
	const centroDestino = encontrarCentro(nodo.parentNode)
	const diffCentros = {x: (centroDestino.x - centroOrigen.x), y: centroDestino.y - centroOrigen.y}
	const valores = Object.values(diffCentros).map(v => `${v}px`).join(', ')
	console.log('translateAlArea valores', valores)
	return valores
}

function escalaAlArea (paisGroup, nodoArea) {
	console.log('escalaAlArea', nodoArea.id)
	const viewportBBox = paisGroup.getBBox() // { x: 0, y: 0, width: 4009, height: 8717}
	const nodoAreaBBox = nodoArea.getBBox()

	const escalaContain = Math.min(viewportBBox.width / nodoAreaBBox.width, viewportBBox.height / nodoAreaBBox.height)

	console.log('escalaAlArea =>', escalaContain)
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
	watch: {
		zoom () { this.destacarSeleccionada() }
	},
	// mounted () { this.destacarSeleccionada() },
	methods: {
		iniciar () {
			this.destacarSeleccionada()
		},
		async destacarSeleccionada () {
			console.log('destacarSeleccionada')
			await new Promise(resolve => { requestAnimationFrame(resolve) })

			const _ = this._
			const zoom = this.zoom
			const elSVG = this._.get(this.$refs, ['unSVG','$el', 'children', 0])
			console.log('elSVG', elSVG)
			const paisGroup = this._.get(elSVG, ['children', 'pais'])
			console.log('paisGroup', paisGroup)
			
			let cadena
			_.forEach(paisGroup.children, region => {
				region.classList.add("region")
				_.forEach(region.children, provincia => {
					provincia.classList.add("provincia")
					_.forEach(provincia.children, comuna => {
						comuna.classList.add("comuna")
						if (zoom === 'comuna' && comuna.id === this.comunaID) cadena = [region, provincia, comuna]
					})
					if (zoom === 'provincia' && provincia.id === this.provinciaID) cadena = [region, provincia]
				})
				if (zoom === 'region' && region.id === this.regionID) cadena = [region]
			})

			if (cadena) {
				const centroDestino = encontrarCentro(_.last(cadena))
				paisGroup.style.transformOrigin = `${centroDestino.x}px ${centroDestino.y}px`
				paisGroup.style.transform = `translate(${translateAlArea(_.last(cadena))}) scale(${escalaAlArea(paisGroup, _.last(cadena))})`
			} else {
				paisGroup.style.transformOrigin = '50% 50%'
				paisGroup.style.transform = 'scale(1)'
			}
			// console.log('paisGroup', paisGroup)
			// console.log('paisGroup.style', paisGroup.style)
			// console.log('paisGroup.style.transformOrigin', paisGroup.style.transformOrigin)
			// console.log('paisGroup.style.transform', paisGroup.style.transform)
			console.log('cadena', cadena)
			const [nodoRegion, nodoProvincia, nodoComuna] = cadena || []

			_.forEach(paisGroup.children, region => {
				if (region.isEqualNode(nodoRegion)) {
					if (zoom === 'region') region.classList.add("activa", "exacta")
					else {
						region.classList.add("activa")
						region.classList.remove("exacta")
					}
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
		.region:hover
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
