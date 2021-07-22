<template>
  <div class="con-box">
    <el-select
      v-model="value"
      clearable
      placeholder="请选择"
      @change="changeType"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <!-- <span @click="localpos()">定位指定</span>
    <span @click="localpos1()">定位指定1</span> -->
    <span @click="localpos2()">定位指定2</span>
    <span @click="addRandomFeature()">添加动画</span>
    <span @click="animateDot()">animateDot</span>
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
import { unByKey } from "ol/Observable";
import { getVectorContext } from "ol/render";
import { easeIn, easeOut } from "ol/easing";
import { Tile as TileLayer } from "ol/layer";

export default {
  data() {
    return {
      options: [
        {
          value: "None",
          label: "None",
        },
        {
          value: "Circle",
          label: "Circle",
        },
        {
          value: "Square",
          label: "Square",
        },
        {
          value: "Box",
          label: "Box",
        },
        {
          value: "Star",
          label: "Star",
        },
      ],
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
      feature: null,
      duration: 3000,
      tileLayer: null,
    };
  },
  mounted() {
    this.initmap();
    this.addFeather();
  },

  methods: {
    localpos() {
      const polygon = this.multiSource.getFeatures()[3].getGeometry();
      this.view.fit(polygon, { padding: [170, 50, 30, 150] });
    },
    localpos1() {
      const polygon1 = this.multiSource.getFeatures()[1].getGeometry();
      this.view.centerOn(
        polygon1.getCoordinates(),
        this.map.getSize(),
        [160, 60]
      );
    },
    localpos2() {
      // const polygon2 = this.multiSource.getFeatures()[1].getGeometry()
      // this.view.fit(polygon2, { padding: [170, 50, 30, 150], minResolution: 50 })
      console.log("查看中心带你", this.view.getCenter());
      const rome = [160, 60];
      const center = this.view.getCenter();
      this.view.animate(
        {
          center: [
            center[0] + (rome[0] - center[0]) / 2,
            center[1] + (rome[1] - center[1]) / 2,
          ],
          rotation: Math.PI,
          easing: easeIn,
        },
        {
          center: rome,
          rotation: 2 * Math.PI,
          easing: easeOut,
        }
      );
    },

    initmap() {
      this.tileLayer = new TileLayer({
        source: new OSM({
          wrapX: false,
        }),
      });
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
        layers: [
          imageLayer,
          vector,
          this.tileLayer,

          // vlayer,
        ],
        view: this.view,
      });

      this.geo =
        "http://192.168.3.92:8002" +
        "/fenceInfo/findListByFenceTypeGeoJson?fenceType=polling&layerId=" +
        this.mapValue;

      // this.map.addLayer(vlayer);
      // this.Popup();

      this.addIcon();
    },

    changeType(e) {
      this.map.removeInteraction(this.draw);
      this.addInteraction();
    },

    addInteraction() {
      var value = this.value;
      if (value !== "None") {
        var geometryFunction;
        if (value === "Square") {
          value = "Circle";
          geometryFunction = createRegularPolygon(4);
        } else if (value === "Box") {
          value = "Circle";
          geometryFunction = createBox();
        } else if (value === "Star") {
          value = "Circle";
          geometryFunction = function (coordinates, geometry) {
            var center = coordinates[0];
            var last = coordinates[coordinates.length - 1];
            var dx = center[0] - last[0];
            var dy = center[1] - last[1];
            console.log("绘制", center, last, dx, dy);

            var radius = Math.sqrt(dx * dx + dy * dy);
            var rotation = Math.atan2(dy, dx);
            var newCoordinates = [];
            var numPoints = 12;
            for (var i = 0; i < numPoints; ++i) {
              var angle = rotation + (i * 2 * Math.PI) / numPoints;
              var fraction = i % 2 === 0 ? 1 : 0.5;
              var offsetX = radius * fraction * Math.cos(angle);
              var offsetY = radius * fraction * Math.sin(angle);
              newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
            }
            newCoordinates.push(newCoordinates[0].slice());
            if (!geometry) {
              geometry = new Polygon([newCoordinates]);
            } else {
              geometry.setCoordinates([newCoordinates]);
            }
            return geometry;
          };
        }
        this.draw = new Draw({
          source: this.source,
          type: value,
          geometryFunction: geometryFunction,
        });
        this.map.addInteraction(this.draw);
      }
    },

    animateDot() {
      var iconFeatureq = new Feature(new Point([100, 100]));
      iconFeatureq.set("style", this.createStyle("data/icon.png", undefined));
      this.multiSource.addFeature(iconFeatureq);
    },
    //添加随机的点
    addRandomFeature() {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      console.log("随机点", x, y);
      this.feature = new Feature(new Point([x, y]));
      this.feature.set("style", this.createStyle("data/icon.png", undefined));
      this.multiSource.addFeature(this.feature);
      this.flash(this.feature)
    },

    addFeather() {
      // const that=this
      // this.multiSource.on('addfeature',function(e){
      //   that.flash(e)
      // })  
    },

    flash(feature) {
      const start = Date.now();
      const flashGeom = feature.getGeometry().clone();
      const listenerKey = this.tileLayer.on("postrender", animate);
      // const listenerKey = this.tileLayer.on("postcompose", animate);
      const self = this;
      const duration = 1000;
      function animate(event) {
        const frameState = event.frameState;
        const elapsed = frameState.time - start;
        if (elapsed >= duration) {
          unByKey(listenerKey);
          return;
        }
        const vectorContext = getVectorContext(event);
        const elapsedRatio = elapsed / duration;
        // radius will be 5 at start and 30 at end.
        const radius = easeOut(elapsedRatio) * 25 + 5;
        const opacity = easeOut(1 - elapsedRatio);

        const style = new Style({
          image: new CircleStyle({
            radius: radius,
            stroke: new Stroke({
              color: "rgba(255, 0, 0, " + opacity + ")",
              // width: 0.25 + opacity,
              width:2+opacity
            }),
          }),
        });

        vectorContext.setStyle(style);
        vectorContext.drawGeometry(flashGeom);
        // tell OpenLayers to continue postrender animation
        self.map.render();
      }
    },

    addIcon() {
      var iconFeature = new Feature(new Point([0, 0]));
      iconFeature.set("style", this.createStyle("data/icon.png", undefined));

      var iconFeature1 = new Feature(new Point([60, 0]));
      iconFeature1.set("style", this.createStyle("data/icon.png", undefined));

      var iconFeature3 = new Feature(
        new LineString([
          [0, 0],
          [600, 600],
        ])
      );
      iconFeature3.set(
        "style",
        new Style({
          stroke: new Stroke({
            color: "rgb(28 127 82)",
            width: 2,
          }),
          //  color: "rgba(" + r + ",0.1)",
        })
      );

      var iconFeature4 = new Feature(
        new Polygon([
          [
            [0, 20],
            [20, 600],
            [60, 120],
            [200, 600],
          ],
        ])
      );
      iconFeature4.set(
        "style",
        new Style({
          //  color: "rgba(" + r + ",0.1)",
          fill: new Fill({
            color: "rgb(64 158 255)",
          }),
        })
      );

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
        features: [iconFeature, iconFeature1, iconFeature3],
      });
      this.multiSource.addFeature(iconFeature5);
      this.multiSource.addFeature(iconFeature4);
      this.vlayer = new VectorLayer({
        style: function (feature) {
          return feature.get("style");
        },
        source: this.multiSource,
      });

      this.map.addLayer(this.vlayer);
    },

    // 气泡弹窗显示
    initIcon1() {
      var iconmp = new Style({
        image: new Icon({
          anchorXUnits: "fraction",
          anchorYUnits: "fraction",
          offset: [100, 0],
          Size: [22, 22],
          //   src: require('/static/icon/5ren.png'),
          src: require("../../public/static/icon/5ren.png"),
          opacity: 1,
          // anchor: [0.5, 0.5],//图标锚点位置，单位由anchorXUnits和anchorYUnits确定，缺省为百分比
        }),
      });
      var iconLayer = new VectorLayer({
        style: iconmp,
      });
      this.map.addLayer(iconLayer);
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
  height: 100%;
  border: 1px solid #999999;
}
.map {
  height: 500px;
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
