<template lang="pug">
.paginaIndex
  h1 mapa
  MapaD3Chile(:selected-codigo-region.sync='selectedCodigoRegion', :selected-codigo-comuna.sync='selectedCodigoComuna')
</template>
<script>
export default {
	data(){
		return {
			selectedCodigoRegion: null,
			selectedCodigoComuna: null
		}
	}
}
</script>
<style lang="sass" scoped>

</style>
