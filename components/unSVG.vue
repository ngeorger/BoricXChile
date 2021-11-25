<template lang="pug">
.unSVG(ref="elSVG" :class="[{lineal, relleno}, tipo]")

</template>
<script>
import axios from 'axios'
import localforage from 'localforage'
const iconoStore = localforage.createInstance({ name: 'iconoStore' })
export default {
	props: {
		tipo: {
			type: String,
			required: true
		},
		lineal: {
			type: Boolean,
			required: false,
			default: false
		},
		relleno: {
			type: Boolean,
			required: false,
			default: false
		}
	},
	data () {
		return {
			svg: null
		}
	},
	mounted () { this.mostrarSVG() },
	updated () { this.mostrarSVG() },
	methods: {
		async mostrarSVG (tipo = this.tipo) {
			console.log('mostrarSVG', tipo)
			if (this.svg) this.$refs.elSVG.innerHTML = this.svg
			else {
				// Buscar en localForage
				const iconoCacheado = await iconoStore.getItem(tipo)
				console.log('iconoCacheado', iconoCacheado)
				if (iconoCacheado && iconoCacheado.svg) {
					this.svg = iconoCacheado.svg
					this.$refs.elSVG.innerHTML = iconoCacheado.svg
					if (process.env.inicio === iconoCacheado.versionTemporal) return
				}
				this.cargarSVG()
			}
		},
		async cargarSVG (tipo = this.tipo) {
			console.log('cargarSVG', tipo)
			const url = `/svg/${tipo}.svg`
			// if (this.tipo === 'llave')
			const svgData = await axios.get(url).then(r => {
				console.log('axios svg', r.data)
				return r.data
			}).catch(e => {
				console.error('Error axios svg', e)
			})
			console.log('svgData', svgData)
			if (!svgData) {
				this.svg = 'SVG no encontrado'
				return
			}
			this.svg = svgData
			this.$refs.elSVG.innerHTML = svgData
			iconoStore.setItem(tipo, {
				svg: svgData,
				versionTemporal: process.env.inicio
			})
		}
	}
}
</script>
<style lang="sass" scoped>
@import "style/vars"
.elSVG
	flex: auto 0 0
	// width: 1em
	// height: 1em
	color: inherit
	display: flex
	align-items: center
	justify-content: center
	color: inherit
	::v-deep
		svg
			color: inherit
			path,
			rect,
			circle
				stroke-width: 0 !important
				fill: transparent !important
	&.lineal
		::v-deep svg 
			path,
			rect,
			circle
				stroke: currentColor !important
				stroke-width: var(--bordeAnchura, inherit) !important
	&.relleno
		::v-deep svg 
			path,
			rect,
			circle
				stroke-width: var(--fondoColor, currentColor) !important

	//&.email:hover
		::v-deep 
			#arroba
				opacity: .5
			
</style>
