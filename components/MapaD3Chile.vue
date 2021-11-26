<template>
	<svg width="500" height="800"></svg>
</template>

<script>
import * as d3 from 'd3'
import {geoMercator} from 'd3-geo'
import * as topojson from 'topojson'

const selectedRegionColor = '#177496'
const selectedComunaColor = '#094c68'
const unselectedColor = '#0e8974'

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
			path:null
		}
	},
	watch: {
		selectedCodigoRegion(codigoRegion){
			this.selectRegion(codigoRegion)
		},
		selectedCodigoComuna(codigoComuna){
			this.selectComuna(codigoComuna)
		}
	},
	async mounted() {
		await this.createMap()
		this.selectRegion(this.selectedCodigoRegion)
		this.selectComuna(this.selectedCodigoComuna)
	},
	methods: {
		async createMap(){
			const svg = d3.select(this.$el)
			this.width = +svg.attr('width')
			this.height = +svg.attr('height')
			const projection = geoMercator()
				.center([-50, -31])
				.scale(800)
				.rotate([0,0])
			this.path = d3.geoPath().projection(projection)
			await d3.json("/chile-comunas.json").then(chileComunas =>  {
				const self = this
				this.g = svg.append('g')
				this.g
					.selectAll('.comuna')
					.data(topojson.feature(chileComunas, chileComunas.objects.Final).features)
					.enter()
					.append("path")
					.attr("class", "comuna")
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
				this.$el.addEventListener('click', e => {
					if(!e.target.classList.contains('comuna')){
						this.unselect()
					}
				});
			})
		},
		selectRegion(codigoRegion){
			if(codigoRegion){
				const self = this
				this.g.selectAll("path")
					.each(function(d) {
						if (d.properties.codregion === codigoRegion) {
							this.style.fill = selectedRegionColor
							self.zoom(d)
						}
					})
			}
		},
		selectComuna(codigoComuna){
			if(codigoComuna){
				const self = this
				this.g.selectAll("path")
					.each(function(d) {
						if (d.properties.cod_comuna === codigoComuna) {
							self.zoom(d)
							this.style.fill = selectedComunaColor
						}
					})
			}
		},
		mouseOver(el, dIn){
			if(this.selectedCodigoRegion){
				el.style.fill = selectedComunaColor
			} else {
				this.g.selectAll("path")
					.each(function(d) {
						if(d.properties.codregion === dIn.properties.codregion){
							this.style.fill = selectedComunaColor
						}
					})
			}
		},
		mouseLeave(el, dIn){
			if(this.selectedCodigoRegion){
				if(dIn.properties.cod_comuna !== this.selectedCodigoComuna){
					if(dIn.properties.codregion === this.selectedCodigoRegion){
						el.style.fill = selectedRegionColor
					} else {
						el.style.fill = unselectedColor
					}
				}
			} else {
				this.g.selectAll("path")
					.each(function(d) {
						if (d.properties.codregion === dIn.properties.codregion) {
							this.style.fill = unselectedColor
						}
					})
			}
		},
		clicked(el, dIn) {
			this.g.selectAll("path")
				.each(function() {
					if(this.style){
						this.style.fill = unselectedColor
					}
				})
			if(this.selectedCodigoRegion !== dIn.properties.codregion){
				this.$emit('update:selected-codigo-region', dIn.properties.codregion)
				this.selectRegion(dIn.properties.codregion)
			}
			if(this.selectedCodigoRegion){
				this.$emit('update:selected-codigo-comuna', dIn.properties.cod_comuna)
				this.selectComuna(dIn.properties.cod_comuna)
			}
			if(this.selectedCodigoComuna !== dIn.properties.cod_comuna){
				this.zoom(dIn)
			}
		},
		zoom(d){
			const centroid = this.path.centroid(d)
			const x = centroid[0]
			const y = centroid[1]
			const k = 4
			this.g.transition()
				.duration(750)
				.attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
				.style("stroke-width", 0.5 / k + "px")
			this.g.selectAll("path")
				.each(function() {
					if(this.style){
						this.style.strokeWidth = 0.05
					}
				})
		},
		unselect(){
			this.g.selectAll("path")
				.each(function() {
					if(this.style){
						this.style.fill = unselectedColor
					}
				})
			this.$emit('update:selected-codigo-comuna', null)
			this.$emit('update:selected-codigo-region', null)
			this.zoomOut();
		},
		zoomOut(){
			this.g.transition()
				.duration(750)
				.attr("transform", "")
				.style("stroke-width", 1 + "px")
		}
	}
}
</script>

<style>
.comuna {
	fill: #0e8974;
	stroke: #fff;
	stroke-width: 0.2;
}
</style>
