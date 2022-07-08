<template>
  <div>
    <div id="mapheat" style=" height:500px;width:100%;border:1px solid gray"></div>
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
export default {
  name: 'heatmap',
  data() {
    return {
      maps: null,
      center: [113.0521, 34.6006],
      heatData: {
        type: 'FeatureCollection',
        features: [
          { type: 'Point', coordinates: [104.4, 31.19], count: 400 },
          { type: 'Point', coordinates: [113.3, 30.6], count: 19 },
          // { type: 'Point', coordinates: [123.3, 30.6], count: 419 },
          // { type: 'Point', coordinates: [105.3, 30.6], count: 319 },
          // { type: 'Point', coordinates: [106.3, 30.6], count: 719 },
          // { type: 'Point', coordinates: [109.3, 31.6], count: 519 },
          // { type: 'Point', coordinates: [109.3, 30.6], count: 319 },
          // { type: 'Point', coordinates: [108.3, 32.6], count: 139 },
          // { type: 'Point', coordinates: [118.3, 31.6], count: 129 },
          // { type: 'Point', coordinates: [108.3, 33.6], count: 190 },
          // { type: 'Point', coordinates: [108.3, 32.6], count: 189 },
          // { type: 'Point', coordinates: [100.3, 30.6], count: 1 },
          // { type: 'Point', coordinates: [109.3, 30.6], count: 119 },
          // { type: 'Point', coordinates: [108.3, 31.6], count: 200 },
          // { type: 'Point', coordinates: [118.3, 30.6], count: 300 },
        ],
      },
      view: null,
    }
  },
  methods: {
    initMap() {
      let projection = getProjection('EPSG:4326')

      // 热力图层
      let vector = new HeatmapLayer({
        source: new VectorSource({
          features: new GeoJSON().readFeatures(this.heatData, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857',
          }),
        }),
        blur: 20,
        radius: 10,
      //    weight(feature) {
      //   const weight = feature.get("count"); //获取feature的weight参数值,此处weight不可变更为其他参数,否则失效(暂时不明原因);
      //   const magnitude = weight / 1;
      //   return magnitude;
      // },
      })

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
        layers: [tile, vector],
        target: 'mapheat',
        view,
      })
    },
  },
  mounted() {
    this.initMap()
  },
}
</script>

<style scoped>
.label {
  font-size: 20px;
}
#map {
  width: 100%;
  height: 99vh;
}
</style>