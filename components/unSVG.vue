<template lang="pug">
.unSVG(ref="elSVG" :class="[tipo]" @click="manejarClick")

</template>
<script>
import axios from 'axios'
import localforage from 'localforage'
const iconoStore = localforage.createInstance({ name: 'iconoStore' })
export default {
	name: 'UnSVG',
	props: {
		tipo: {
			type: String,
			required: true
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
					if (!process.env.dev && process.env.inicio === iconoCacheado.versionTemporal) return
				}
				await this.cargarSVG()
				this.$emit('listo')
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
		},
		manejarClick (e) {
			// console.log('manejarClick e.path:', e.path)
			let path = e.path
			const _ = this._
			const indexSvg = _.findIndex(path, p => p.tagName === 'svg')
			if (indexSvg >= 0) path = _.slice(path, 0, indexSvg + 1)
			// console.log('manejarClick path:', path)
			this.$emit('clickSVG', path)
		}
	}
}
</script>
<style lang="sass" scoped>
@import "style/vars"
.unSVG
	flex: auto 0 0
	color: inherit
	display: flex
	align-items: center
	justify-content: center
	color: inherit
	// ::v-deep
		svg
			border: 1px solid red
			
</style>
