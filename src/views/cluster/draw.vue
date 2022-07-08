<template>
  <div class="con-box">
    <span @click="addInteractions()">点击查看</span>
    <span @click="removeData()">清空</span>
    <div id="map" class="map" />
  </div>
</template>

<script>
import "ol/ol.css";
import olMap from "ol/Map";
import olView from "ol/View";
import ollayerTile from "ol/layer/Tile";
// import olsourceOSM from "ol/source/OSM";
import { get as getProjection, Projection, fromLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Point, LineString, Polygon } from "ol/geom";
import XYZ from "ol/source/XYZ";
import { Map, View, Feature, ol } from "ol";

import {
  Circle,
  Fill,
  Stroke,
  Style,
  Text,
  Icon,
  Circle as CircleStyle,
} from "ol/style.js";
import Overlay from "ol/Overlay.js";
import { Image } from "ol/layer.js";
import { OSM, Vector, ImageStatic } from "ol/source";
import { defaults as defaultControls } from "ol/control";

import Draw, { createBox, createRegularPolygon } from "ol/interaction/Draw";
import bus from "@/util/bus";
export default {
  data() {
    return {
      value: "",
      map: null,
      view: null,
      positionLayer: null,
      featuresArr: [],
      opt: {
        img: "",
        imgsize: "",
      },
      geo: null,
      vlayer: null,
      draw: null,
      source: null,
      multiSource: null,
      num: 1,
    };
  },
  mounted() {
    this.initmap();
  },

  beforeDestroy() {},
  methods: {
    initmap() {
      // 定义坐标系
      var projection = new Projection({
        // code: "EPSG:900931", // 用“米”做单位的x/y坐标的投影
        code: "xkcd-image",
        units: "pixels", // 单位：像素
        extent: [0, 0, 1200, 600], // 图片图层四至,分别是静态图片左下角和右上角的基于基站的坐标
      });
      this.view = new olView({
        center: [108, 30],
        projection: projection,
        zoom: 2,
      });

      var imageLayer = new Image({
        source: new ImageStatic({
          //   url: require('../../../public/image/wb.png'),
          url: "https://scpic.chinaz.net/files/pic/pic9/202102/hpic3599.jpg",
          // imageSize: [1300, 980], // 图片尺寸（px）  [长,宽]
          projection: projection,
          imageExtent: [-500, -100, 1200, 600], // // 映射到地图的范围
        }),
        style: new Style({
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.2",
          }),
          stroke: new Stroke({
            color: "#ffcc33",
            width: 2,
          }),
          //   image: new Icon({
          //     // src: '../../../../public/static/icon/5ren.png',
          //     src: require('../../public/static/icon/5ren.png'),
          //     anchor: [0.5, 1]
          //     // src: 'https://openlayers.org/en/v4.6.5/examples/data/icon.png'
          //   })
        }),
      });

      this.source = new VectorSource({ wrapX: false });

      var vector = new VectorLayer({
        source: this.source,
        style: new Style({

          stroke: new Stroke({
            lineDash: [1, 2, 3, 4, 5, 6],
            color: "#FF0000",
            width: 2,
          }),
          image: new Circle({
            radius: 7,
            fill: new Fill({
              color: "#FF0000",
            }),
          }),
          text: new Text({
            text: "adsafdsf",
            font: "bold 14px Arial",
            textAlign: "center",
            textBaseline: "middle",
            overflow: true,
            offsetX: 0,
            offsetY: 0,
            fill: new Fill({
              color: "#FF0000",
            }),
            stroke: new Stroke({
              color: "#fff",
              width: 3,
            }),
          }),
        }),
      });

      this.map = new olMap({
        target: "map",
        controls: defaultControls({
          zoom: true,
        }).extend([]),
        layers: [imageLayer, vector],
        view: this.view,
      });
    },
    addInteractions() {
      this.draw = new Draw({
        source: this.source,
        type: "Circle",
        geometryFunction: createBox(),
      });
      this.map.addInteraction(this.draw);
    },
    removeData() {
      this.map.removeInteraction(this.draw);
      this.source.clear();
    },

    FenceStyle(f, r) {
      return [
        new Style({
          fill: new Fill({
            color: "rgba(" + r + ",0.1)",
          }),
          stroke: new Stroke({
            lineDash: [1, 2, 3, 4, 5, 6],
            color: "rgb(" + r + ")",
            width: 2,
          }),
          image: new Circle({
            radius: 7,
            fill: new Fill({
              color: "#FF0000",
            }),
          }),
          text: new Text({
            text: f.get("name"),
            font: "bold 14px Arial",
            textAlign: "center",
            textBaseline: "middle",
            offsetX: 0,
            offsetY: 0,
            fill: new Fill({
              color: "#FF0000",
            }),
            stroke: new Stroke({
              color: "#fff",
              width: 3,
            }),
          }),
        }),
      ];
    },
  },
};
</script>

<style scoped>
#map {
  width: 97%;
  margin: 0 auto;
  /* background: rgb(238, 238, 238); */
}
.con-box {
  width: 100%;
  height: 100%;
  border: 1px solid #999999;
}
.map {
  height: 800px;
  border: 1px solid;
}
.icon_but {
  margin: 0 10px;
  padding: 10px;
  border: 1px solid red;
}
.toolbar {
  margin: 10px;
}
.toolbar span {
  display: inline-block;
}

.ol-popup {
  border: 1px solid red;
  font-size: 20px;
  font-weight: bolder;
}
.con-box {
  width: 100%;
  height: calc(100% - 84px);
  border: 1px solid #999999;
}
</style>
