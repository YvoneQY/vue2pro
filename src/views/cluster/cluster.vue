<template>
  <div>
    <div
      id="mapclus"
      style="height: 500px; width: 100%; border: 1px solid gray"
    ></div>
  </div>
</template>

<script>
import "ol/ol.css";

import Stamen from "ol/source/Stamen";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Heatmap as HeatmapLayer, Tile as TileLayer } from "ol/layer";
import GeoJSON from "ol/format/GeoJSON";
import { Map, View, Feature, ol } from "ol";
import olsourceOSM from "ol/source/OSM";
import { Point, LineString, Polygon } from "ol/geom";
import { get as getProjection, transform } from "ol/proj";
import { OSM, Cluster, ImageStatic } from "ol/source";
import { Circle, Fill, Stroke, Style, Text } from "ol/style";
import { click } from "ol/events/condition";
export default {
  name: "heatmap",
  data() {
    return {
      maps: null,
      clustersLay: null,
      center: [113.0521, 34.6006],
      heatData: {
        type: "FeatureCollection",
        features: [
          { type: "Point", coordinates: [104.4, 31.19], count: 400 },
          { type: "Point", coordinates: [113.3, 30.6], count: 19 },
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
    };
  },
  methods: {
    initMap() {
      this.initFeature();
      let projection = getProjection("EPSG:4326");

      // 底图2
      let tile = new TileLayer({
        source: new olsourceOSM(),
      });

      // 地图中心
      let view = new View({
        // center: transform(this.center, "EPSG:4326", "EPSG:3857"),
        center: [0, 0],
        zoom: 5,
      });
      // 实例化底图
      this.maps = new Map({
        layers: [tile, this.clustersLay],
        target: "mapclus",
        view,
      });
    },

    initFeature() {
      let count = 10000;
      let e = 4500000;
      var features = new Array(count);
      for (var i = 0; i < count; i++) {
        var coordinates = [
          2 * e * Math.random() - e,
          2 * e * Math.random() - e,
        ];
        features[i] = new Feature(new Point(coordinates));
      }

      var source1 = new VectorSource({
        features: features,
      });

      //聚合标注数据源
      var clusterSource = new Cluster({
        distance: 100, //聚合的距离参数，即当标注间距离小于此值时进行聚合，单位是像素,
        // minDistance:10,
        source: source1, //聚合的数据源，即矢量要素数据源对象
      });

      var styleCache = {}; //用于保存特定数量的聚合群的要素样式
      this.clustersLay = new VectorLayer({
        source: clusterSource,
        style: function (feature, resolution) {
          var size = feature.get("features").length; //获取该要素所在聚合群的要素数量
          var style = styleCache[size];
          console.log("啥子", style, size, styleCache, feature.get("features"));

          if (!style) {
            style = [
              new Style({
                image: new Circle({
                  radius: 10,
                  stroke: new Stroke({
                    color: "#0ff",
                  }),
                  fill: new Fill({
                    color: "#3399CC",
                  }),
                }),
                text: new Text({
                  text: size.toString(),
                  fill: new Fill({
                    color: "#fff",
                  }),
                }),
              }),
            ];
            styleCache[size] = style;
          }
          return style;
        },
      });

    },
    zoomCluster() {
      this.maps.on("click", (e) => {
        this.clustersLay.getFeatures(e.pixel).then((clickedFeatures) => {
          if (clickedFeatures.length) {
            // Get clustered Coordinates
            const features = clickedFeatures[0].get("features");
            if (features.length > 1) {
              const extent = boundingExtent(
                features.map((r) => r.getGeometry().getCoordinates())
              );

              this.maps
                .getView()
                .fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
            }
          }
        });
      });
    },

    clusterPop() {
      this.maps.on("click", (evt) => {
        let coordinate = evt.coordinates;
        //判断当前单击处是否有要素，捕获到要素时弹出popup
        var feature = this.maps.forEachFeatureAtPixel(
          evt.pixel,
          (feature, layerVetor) => {
            console.log("拔凉拔凉", evt.pixel);
            return feature;
          }
        );
        if (feature) {
          //聚合情况下
          if (feature.getProperties().features) {
            //只有一个要素
            if (feature.getProperties().features.length == 1) {
              // layer.msg("聚合该处有1个要素")
              featuerInfo = feature.getProperties().features[0].N.attribute;
              content.innerHTML = ""; //清空popup的内容容器

              addFeatrueInfo(featuerInfo); //在popup中加载当前要素的具体信息
              if (popup.getPosition() == undefined) {
                popup.setPosition(coordinate); //设置popup的位置
              }
            } else {
              //有多个要素,多标记聚合
              info_popup.setPosition(undefined);
            }
          } else {
            info_popup.setPosition(undefined);
          }
        } else {
          info_popup.setPosition(undefined);
        }
      });
    },
    changeMouse(){
        this.maps.on('pointermove', function(e) {
        var pixel = this.maps.getEventPixel(e.originalEvent);
        var hit = this.maps.hasFeatureAtPixel(pixel);
        this.maps.getTargetElement().style.cursor = hit ? 'pointer' : '';
    })

    }
  },
  mounted() {
    this.initMap();
  },
};
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