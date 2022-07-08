<template>
  <div>
       <div id="mapAir" style=" height:500px;width:100%;border:1px solid gray"></div>
  </div>
</template>

<script>
import 'ol/ol.css'
import Map from 'ol/Map'
import Stamen from 'ol/source/Stamen'
import VectorSource from 'ol/source/Vector'
import View from 'ol/View'
import { Heatmap as HeatmapLayer, Tile as TileLayer } from 'ol/layer'
import GeoJSON from 'ol/format/GeoJSON'

import olsourceOSM from 'ol/source/OSM'
import { get as getProjection, transform } from 'ol/proj'

// import ol3Echarts from 'ol3-echarts'
// import EChartsLayer from 'ol-echarts'
export default {
  name: 'plane',
  data() {
    return {
      maps: null,
      center: [113.0521, 34.6006],
      view: null,
    }
  },
  methods: {
    initMap() {
      let projection = getProjection('EPSG:4326')

      // 底图1
      let raster = new TileLayer({
        source: new Stamen({
          layer: 'toner',
        }),
      })
      // 底图2
      let tile = new TileLayer({
        source: new olsourceOSM(),
      })

      // 地图中心
      let view = new View({
        center: transform(this.center, 'EPSG:4326', 'EPSG:3857'),
        zoom: 5,
      })
      // 实例化底图
      this.maps = new Map({
        layers: [tile],
        target: 'mapAir',
        view,
      })
    },
  },
  mounted() {
    this.initMap()
  },
}
</script>

<style>

</style>