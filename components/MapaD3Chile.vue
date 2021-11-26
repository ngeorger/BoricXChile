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
		this.selectRegion(this.selectedCodigoRegion, true)
		this.selectComuna(this.selectedCodigoComuna, true)
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
		selectRegion(codigoRegion, zoom = false){
			if(codigoRegion){
				const self = this
				this.g.selectAll("path")
					.each(function(d) {
						if (d.properties.codregion === codigoRegion) {
							this.style.fill = selectedRegionColor
							if(zoom){
								self.zoom(d)
							}
						}
					})
			}
		},
		selectComuna(codigoComuna, zoom = false){
			if(codigoComuna){
				const self = this
				this.g.selectAll("path")
					.each(function(d) {
						if (d.properties.cod_comuna === codigoComuna) {
							if(zoom){
								self.zoom(d)
							}
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
			}
			this.selectRegion(dIn.properties.codregion)
			if(this.selectedCodigoRegion){
				this.$emit('update:selected-codigo-comuna', dIn.properties.cod_comuna)
				this.selectComuna(dIn.properties.cod_comuna)
			}
			if(this.selectedCodigoComuna !== dIn.properties.cod_comuna){
				this.zoom(dIn, true)
			}
		},
		zoom(dIn){
			let maxY = null
			let minY = null
			let maxX = null
			let minX = null
			const self = this
			const chileSizeX = 41.470082545805326
			const chileSizeY = 36.014626435053174
			this.g.selectAll("path")
				.each(function(d) {
					if(this.style){
						this.style.strokeWidth = 0.05
					}
					if(d.properties.codregion === dIn.properties.codregion){
						const bounds = self.path.bounds(d)
						if(!minX || minX > bounds[0][0]){
							minX = bounds[0][0]
						}
						if(!minY || minY > bounds[0][1]){
							minY = bounds[0][1]
						}
						if(!maxX || maxX < bounds[1][0]){
							maxX = bounds[1][0]
						}
						if(!maxY || maxY < bounds[1][1]){
							maxY = bounds[1][1]
						}
					}
				})
			const x = (minX + maxX)/2
			const y = (maxY+minY)/2
			const sizeX = maxX - minX
			const sizeY = maxY - minY
			const k = 10/(sizeX > sizeY? sizeX/chileSizeX: (sizeY/(chileSizeY*1.5)))
			this.g.transition()
				.duration(750)
				.attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
				.style("stroke-width", 0.5 / k + "px")
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
