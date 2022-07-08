<template>
  <div class="con-box">
    <div id="main"  ref="main" style="width: 600px; height: 400px"></div>
    <!-- <div id="map" class="map" /> -->
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
import echarts from 'echarts'
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
      option: {
        title: {
          text: "ECharts 入门示例",
        },
        tooltip: {},
        legend: {
          data: ["销量"],
        },
        xAxis: {
          data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"],
        },
        yAxis: {},
        series: [
          {
            name: "销量",
            type: "bar",
            data: [5, 20, 36, 10, 10, 20],
          },
        ],
      },
      echarMain:null
    };
  },
  mounted() {
    this.initmap();
    // console.log('echarts=',echarts,this.$refs.main)
    // this.echarMain=echarts.init(this.$refs.main)
    // this.echarMain.setOption(this.option)
  },

  beforeDestroy() {},
  methods: {
    addnum() {
      return ++this.num;
    },

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
          image: new Icon({
            // src: '../../../../public/static/icon/5ren.png',
            src: require("../../public/static/icon/5ren.png"),
            anchor: [0.5, 1],
            // src: 'https://openlayers.org/en/v4.6.5/examples/data/icon.png'
          }),
        }),
      });

      this.source = new VectorSource({ wrapX: false });

      var vector = new VectorLayer({
        source: this.source,
      });

      this.map = new olMap({
        target: "map",
        controls: defaultControls({
          zoom: true,
        }).extend([]),
        layers: [imageLayer, vector],
        view: this.view,
      });

      this.addIcon();
    },

    addIcon() {
      var iconFeature = new Feature(new Point([0, 0]));
      iconFeature.set("style", this.createStyle("data/icon.png", undefined));

      var iconFeature1 = new Feature(new Point([60, 0]));
      iconFeature1.set("style", this.createStyle("data/icon.png", undefined));

      var iconFeature5 = new Feature(new Point([160, 100]));
      iconFeature5.set(
        "style",
        new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: require("../../public/static/icon/5ren.png"),
            // src: require('../../../../public/image/5ren.png'),
            color: "#f00",
            rotation: Math.PI / 4,
          }),
          text: new Text({
            text: "锚点显示111",
            scale: [1, 1],
            textAlign: "center",
            color: "#f00",
            textBaseline: "top",
          }),
        })
      );

      this.multiSource = new VectorSource({
        features: [iconFeature, iconFeature1],
      });
      this.multiSource.addFeature(iconFeature5);
      this.vlayer = new VectorLayer({
        style: function (feature) {
          return feature.get("style");
        },
        source: this.multiSource,
      });

      this.map.addLayer(this.vlayer);
    },

    // 创建简单的icon
    createStyle(src, img) {
      return new Style({
        image: new Icon({
          // anchor: [0.5, 0.96],
          anchor: [0.5, 1],
          src: require("../../public/static/icon/5ren.png"),
          //   src: require('/static/icon/5ren.png'),
          img: img,
          color: "#f00",
          rotation: Math.PI / 4,
          // imgSize: img ? [img.width, img.height] : undefined,
        }),
        text: new Text({
          text: "锚点",
          scale: [1, 1],
          textAlign: "center",
          color: "#f00",
          textBaseline: "top",
        }),
      });
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

  border: 1px solid #999999;
}
.map {
  height: 400px;
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
.con-box>.main{
  border: 1px solid red;
}
.con-box {
  width: 100%;

  border: 1px solid #999999;
}
</style>
