<template lang="pug">
.padreMapa
	Mapa
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
		n-child
</template>
<script>
export default {
	computed: {
		regionID () { return this.$route.params.regionID },
		provinciaID () { return this.$route.params.provinciaID },
		comunaID () { return this.$route.params.comunaID }
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
