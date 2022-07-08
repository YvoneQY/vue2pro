<template>
  <div class="con-box">
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
import {
  defaults as defaultControls,
  FullScreen,
  ZoomToExtent,
  ScaleLine,
} from "ol/control";

import Draw, { createBox, createRegularPolygon } from "ol/interaction/Draw";
import { unByKey } from "ol/Observable";
import { getVectorContext } from "ol/render";
import { easeIn, easeOut } from "ol/easing";
import { Tile as TileLayer } from "ol/layer";
import Graticule from "ol/layer/Graticule";
import TileDebug from "ol/source/TileDebug";
import ol3Echarts from "ol3-echarts";
import EChartsLayer from "ol-echarts";

export default {
  data() {
    return {
      map: null,
      view: null,
      opt: {
        img: "",
        imgsize: "",
      },
      source: null,
      duration: 3000,
      tileLayer: null,
      debugLayer: null,
      osmSource: null,
      echartslayer: null,
      option: {
        tooltip: {},
        geo: {
          tooltip: {
            show: true,
          },
          map: "iceland_svg",
          roam: true,
        },
        series: {
          type: "custom",
          coordinateSystem: "geo",
          geoIndex: 0,
          zlevel: 1,
          data: [
            [488.2358421078053, 459.70913833075736, 100],
            [770.3415644319939, 757.9672194986475, 30],
            [1180.0329284196291, 743.6141808346214, 80],
            [894.03790632245, 1188.1985153835008, 61],
            [1372.98925630313, 477.3839988649537, 70],
            [1378.62251255796, 935.6708486282843, 81],
          ],
          renderItem(params, api) {
            const coord = api.coord([
              api.value(0, params.dataIndex),
              api.value(1, params.dataIndex),
            ]);
            const circles = [];
            for (let i = 0; i < 5; i++) {
              circles.push({
                type: "circle",
                shape: {
                  cx: 0,
                  cy: 0,
                  r: 30,
                },
                style: {
                  stroke: "red",
                  fill: "none",
                  lineWidth: 2,
                },
                // Ripple animation
                keyframeAnimation: {
                  duration: 4000,
                  loop: true,
                  delay: (-i / 4) * 4000,
                  keyframes: [
                    {
                      percent: 0,
                      scaleX: 0,
                      scaleY: 0,
                      style: {
                        opacity: 1,
                      },
                    },
                    {
                      percent: 1,
                      scaleX: 1,
                      scaleY: 0.4,
                      style: {
                        opacity: 0,
                      },
                    },
                  ],
                },
              });
            }
            return {
              type: "group",
              x: coord[0],
              y: coord[1],
              children: [
                ...circles,
                {
                  type: "path",
                  shape: {
                    d: "M16 0c-5.523 0-10 4.477-10 10 0 10 10 22 10 22s10-12 10-22c0-5.523-4.477-10-10-10zM16 16c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z",
                    x: -10,
                    y: -35,
                    width: 20,
                    height: 40,
                  },
                  style: {
                    fill: "red",
                  },
                  // Jump animation.
                  keyframeAnimation: {
                    duration: 1000,
                    loop: true,
                    delay: Math.random() * 1000,
                    keyframes: [
                      {
                        y: -10,
                        percent: 0.5,
                        easing: "cubicOut",
                      },
                      {
                        y: 0,
                        percent: 1,
                        easing: "bounceOut",
                      },
                    ],
                  },
                },
              ],
            };
          },
        },
      },
    };
  },
  mounted() {
    this.initgrid();
    this.initmap();
  },

  methods: {
    initgrid() {
      this.osmSource = new OSM();
      this.debugLayer = new TileLayer({
        source: new TileDebug({
          tileGrid: this.osmSource.getTileGrid(),
          projection: this.osmSource.getProjection(),
        }),
        visible: false,
      });
    },

    initmap() {
      //   this.tileLayer = new TileLayer({
      //     source: new OSM({
      //       wrapX: false,
      //     }),
      //   });
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
      const gview = new olView({
        // projection: "EPSG:3857",
        center: [300, 500],
        // center: [108, 30],
        // center: fromLonLat([4.8, 47.75]),
        projection: projection,
        zoom: 5,
      });

      //   var extent = [
      //     center[0] - (550 * 1000) / 2,
      //     center[1] - (344 * 1000) / 2,
      //     center[0] + (550 * 1000) / 2,
      //     center[1] + (344 * 1000) / 2,
      //   ];
      var imageLayer = new Image({
        source: new ImageStatic({
          //   url: require('../../../public/image/wb.png'),
          url: "https://scpic3.chinaz.net/Files/pic/pic9/201901/bpic10189_s.jpg",
          // imageSize: [1300, 980], // 图片尺寸（px）  [长,宽]
          //   projection: projection,
          //   projection: "EPSG:3857",
          imageExtent: [-450, -300, 900, 500], // // 映射到地图的范围
        }),
      });

      this.source = new VectorSource({ wrapX: false });

      var vector = new VectorLayer({
        source: this.source,
      });

      this.map = new olMap({
        target: "map",
        layers: [
          // new Graticule({
          //   strokeStyle: new Stroke({
          //     color: "rgba(255,120,0,0.9)",
          //     width: 2,
          //     lineDash: [0.5, 4],
          //   }),
          //   targetSize: 100,
          //   showLabels: false,
          //   wrapX: false,
          //   //   opacity: 0.3,
          //   Extent: [-100, -100, 100, 100],
          // }),

          imageLayer,
          //   this.tileLayer,

          // vector,
        ],
        // layers: [imageLayer, vector],
        view: gview,
      });

      this.initEchart();
    },

    initEchart() {
      let option1 = {
        xAxis: {
          type: "category",
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: [150, 230, 224, 218, 135, 147, 260],
            type: "line",
          },
        ],
      };
      this.echartslayer = new ol3Echarts(option1);
      this.echartslayer.appendTo(this.map);
    },
    getOption() {
      var geoCoordMap = {
        上海: [121.4648, 31.2891],
        北京: [116.4551, 40.2539],
        南宁: [108.479, 23.1152],
        南昌: [116.0046, 28.6633],
        大连: [122.2229, 39.4409],
        广州: [113.5107, 23.2196],
      };
      var BJData = [
        [{ name: "北京" }, { name: "上海", value: 95 }],
        [{ name: "北京" }, { name: "广州", value: 90 }],
        [{ name: "北京" }, { name: "大连", value: 80 }],
        [{ name: "北京" }, { name: "南宁", value: 70 }],
        [{ name: "北京" }, { name: "南昌", value: 60 }],
      ];
      var convertData = function (data) {
        var res = [];
        for (var i = 0; i < data.length; i++) {
          var dataItem = data[i];
          var fromCoord = geoCoordMap[dataItem[1].name];
          var toCoord = geoCoordMap[dataItem[0].name];
          if (fromCoord && toCoord) {
            res.push({
              toName: dataItem[0].name,
              fromName: dataItem[1].name,
              coords: [fromCoord, toCoord],
              value: dataItem[1].value,
            });
          }
        }
        return res;
      };
      var color = [
        "#a6c84c",
        "#ffa022",
        "#46bee9",
        "#61b8ff",
        "#0000e1",
        "#fa00fa",
        "pink",
        "#880015",
      ];
      var series = [];
      series.push(
        {
          type: "lines",
          zlevel: 2,
          effect: {
            show: true,
            period: 6,
            trailLength: 0,
            symbol: "arrow",
            symbolSize: 10,
          },
          lineStyle: {
            normal: {
              color: function (params) {
                console.log(params.value, params.data.fromName);
                return color[parseInt((params.value - 60) / 5)];
              },
              width: 2,
              opacity: 0.4,
              curveness: 0.2,
            },
          },
          data: convertData(BJData),
        },
        {
          type: "effectScatter",
          coordinateSystem: "geo",
          zlevel: 2,
          rippleEffect: {
            brushType: "stroke",
          },
          label: {
            normal: {
              show: true,
              position: "right",
              formatter: "{b}",
            },
          },
          symbolSize: 15,
          itemStyle: {
            normal: {
              color: function (params) {
                return color[parseInt((params.value[2] - 60) / 5)];
              },
            },
          },
          data: BJData.map(function (dataItem) {
            return {
              name: dataItem[1].name,
              value: geoCoordMap[dataItem[1].name].concat([dataItem[1].value]),
            };
          }),
        }
      );
      return {
        tooltip: {
          trigger: "item",
        },
        series: series,
      };
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
