<template>
	<svg width="500" height="800"></svg>
</template>

<script>
import * as d3 from 'd3'
import {geoMercator} from 'd3-geo'
import * as topojson from 'topojson'

export default {
	props: {
		selectedCodigoRegion:{
			type: Number,
			default: null
		},
		selectedCodigoComuna:{
			type: Number,
			default: null
		},
	},
	data() {
		return {
			g: null,
			width: null,
			height: null,
			centered: null,
			path:null,
		}
	},
	mounted() {
		this.createMap()
	},
	methods: {
		createMap(){
			const svg = d3.select(this.$el)
			this.width = +svg.attr('width')
			this.height = +svg.attr('height')
			const projection = geoMercator()
				.center([-80, -30])
				.scale(800)
				.rotate([0,0])
			this.path = d3.geoPath().projection(projection)
			d3.json("/chile-comunas.json").then(chileComunas =>  {
				const self = this
				this.g = svg.append('g')
				this.g
					.selectAll('.state')
					.data(topojson.feature(chileComunas, chileComunas.objects.Final).features)
					.enter()
					.append("path")
					.attr("class", "state")
					.attr("d", this.path)
					.each(function (d)
					{
						d3.select(this)
							.on('mouseover', ()=> {
								self.mouseOver(this, d)
							})
							.on('mouseleave', ()=> {
								self.mouseLeave(this, d)
							})
							.on("click", ()=>{
								self.clicked(this, d)
							})
					})
				this.g.attr('transform', 'scale(0.57)')
			})
		},
		mouseOver(el, dIn){
			if(this.selectedCodigoRegion){
				el.style.fill = "green"
			} else {
				this.g.selectAll("path")
					.each(function(d) {
						if(d.properties.codregion === dIn.properties.codregion){
							this.style.fill = "green"
						}
					})
			}
		},
		mouseLeave(el, dIn){
			if(this.selectedCodigoRegion){
				if(dIn.properties.cod_comuna !== this.selectedCodigoComuna){
					el.style.fill = "#ccc"
				}
			} else {
				this.g.selectAll("path")
					.each(function(d) {
						if (d.properties.codregion === dIn.properties.codregion) {
							this.style.fill = "#ccc"
						}
					})
			}
		},
		clicked(el, dIn) {
			if(this.selectedCodigoRegion !== dIn.properties.codregion){
				this.$emit('update:selected-codigo-region', dIn.properties.codregion)
				this.g.selectAll("path")
					.each(function(d) {
						if (d.properties.codregion === dIn.properties.codregion) {
							this.style.fill = "#ccc"
						}
					})
			}
			if(this.selectedCodigoRegion){
				this.$emit('update:selected-codigo-comuna', dIn.properties.cod_comuna)
				this.g.selectAll("path")
					.each(function(d) {
						if (d.properties.cod_comuna === dIn.properties.cod_comuna) {
							this.style.fill = "green"
						} else {
							this.style.fill = "#ccc"
						}
					})
			}
			if(this.selectedCodigoComuna !== dIn.properties.cod_comuna){
				this.zoom(dIn)
			}
		},
		zoom(d){
			let x, y, k
			if (d && this.centered !== d) {
				const centroid = this.path.centroid(d)
				x = centroid[0]
				y = centroid[1]
				k = 4
				this.centered = d
			} else {
				x = this.width / 2
				y = this.height / 2
				k = 1
				this.centered = null
			}
			this.g.selectAll("path")
				.classed("active", this.centered && function(d) { return d === this.centered })

			this.g.transition()
				.duration(750)
				.attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
				.style("stroke-width", 1.5 / k + "px")
		}
	}
}
</script>

<style>
.state {
	fill: #ccc;
	stroke: #fff;
}
</style>
