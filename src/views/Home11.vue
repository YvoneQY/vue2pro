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

    <treeselect
      v-model="mapId"
      placeholder="选择"
      :max-height="300"
      :options="mapTree"
      style="width: 200px"
      @input="nodeClick"
    />
    <div @click="addStar()">添加</div>
    <div @click="onEdit()">编辑了</div>
    <div @click="localpos()">定位指定</div>
    <div @click="localpos1()">定位指定1</div>
    <div @click="localpos2()">定位指定2</div>
    <div class="alarmanage_right_maptree">
              <!-- :props="defaultProps" -->
      <el-tree
        ref="tree"
        class="spanBtn"
        :data="mapTree"

        node-key="id"
        :default-expand-all="true"
        :expand-on-click-node="false"
        current-node-key
        :highlight-current="false"
        @node-click="nodeClick"
        @node-drag-start="handleDragStart"
        @node-drag-enter="handleDragEnter"
        @node-drag-leave="handleDragLeave"
        @node-drag-over="handleDragOver"
        @node-drag-end="handleDragEnd"
        @node-drop="handleDrop"
        draggable
        :allow-drop="allowDrop"
        :allow-drag="allowDrag"
      >
        <span
          slot-scope="{ node, data }"
          class="nodebg custom-tree-node"
          :style="{ background: mapId == data.id ? '#e5f0fb' : 'transparent' }"
        >
          <span>{{ node.label }}</span>
          <span>
            <el-button type="text" @click.stop="editTree(data)">
              <i class="el-icon-edit" style="font-size: 14px" />
            </el-button>
            <el-button type="text" @click.stop="removeTree(node, data)">
              <i class="el-icon-delete" />
            </el-button>
          </span>
        </span>
      </el-tree>
    </div>
    <div id="map" class="map" />

    <!-- <div
      class="popup-info-div"
      style="height：100px;width:100px;border:1px solid red;display:none"
    >
      <div id="popup-info" class="ol-popup">
        <a href="#" id="popup-closer" class="ol-popup-closer">close</a>
        <div id="popup-title" class="popup-title"></div>
        <div id="popup-content"></div>
      </div>
    </div> -->
  </div>
</template>

<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
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
  RegularShape,
} from "ol/style.js";
import Overlay from "ol/Overlay.js";
import { Image } from "ol/layer.js";
import { OSM, Vector, ImageStatic } from "ol/source";
import { defaults as defaultControls } from "ol/control";
import { GeoJSON } from "ol/format.js";
import Draw, { createBox, createRegularPolygon } from "ol/interaction/Draw";
import bus from "@/util/bus";
import ExtTransform from "ol-ext/interaction/Transform";

export default {
  components: {
    Treeselect,
  },
  data() {
    return {
      defaultProps: {
        children: "children",
        label: "label",
      },
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
      mapId: null,
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
      vector: null,
      ws: null,
      bLockEx: true,
      mapTree: [],
    };
  },
  mounted() {
    this.initmap();
    this.webSocketPosition();
    this.busEmitOn();
    this.mapTree = this.initMapData().data;
    console.log("查看地图管理", this.mapTree);
  },

  methods: {
    editTree(data) {
      console.log("查看地图管理", data);
    },
    removeTree(node, data) {
      console.log("查看地图管理", node, data);
    },
    nodeClick(val) {
      console.log(val);
    },
    handleDragStart(node, ev) {
      console.log("drag start", node);
    },
    handleDragEnter(draggingNode, dropNode, ev) {
      console.log("tree drag enter: ", dropNode.label);
    },
    handleDragLeave(draggingNode, dropNode, ev) {
      console.log("tree drag leave: ", dropNode.label);
    },
    handleDragOver(draggingNode, dropNode, ev) {
      console.log("tree drag over: ", dropNode.label);
    },
    handleDragEnd(draggingNode, dropNode, dropType, ev) {
      console.log("tree drag end: ", dropNode && dropNode.label, dropType);
    },
    handleDrop(draggingNode, dropNode, dropType, ev) {
      console.log("tree drop: ", dropNode.label, dropType);
    },
    allowDrop(draggingNode, dropNode, type) {
      // if (dropNode.data.label === "二级 3-1") {
      //   return type !== "inner";
      // } else {
      //   return true;
      // }
      console.log(this.mapTree,'生活')
      console.log('代高帽',draggingNode, dropNode, type)
      return true
    },
    allowDrag(draggingNode) {
      // return draggingNode.data.label.indexOf("三级 3-2-2") === -1;
       console.log('代高帽23',draggingNode)
      return true
    },
    initMapData() {
      return {
        msg: "操作成功",
        code: 200,
        data: [
          {
            label: "测试",
            parentId: "0",
            isDefault: 0,
            disabled: false,
            id: "48",
          },
          {
            label: "23232312",
            parentId: "0",
            isDefault: 0,
            disabled: false,
            id: "47",
          },
          {
            label: "平台测试22",
            parentId: "0",
            isDefault: 0,
            disabled: false,
            id: "46",
          },
          {
            label: "平台测试",
            parentId: "0",
            isDefault: 0,
            disabled: false,
            id: "45",
          },
          {
            label: "综合训练塔4-14层",
            parentId: "0",
            isDefault: 0,
            children: [
              {
                label: "综合训练塔L14",
                parentId: "33",
                isDefault: 0,
                parentName: "综合训练塔4-14层",
                disabled: false,
                id: "44",
              },
              {
                label: "综合训练塔L13",
                parentId: "33",
                isDefault: 0,
                parentName: "综合训练塔4-14层",
                disabled: false,
                id: "43",
              },
              {
                label: "综合训练塔L12",
                parentId: "33",
                isDefault: 0,
                parentName: "综合训练塔4-14层",
                disabled: false,
                id: "42",
              },
              {
                label: "综合训练塔L11",
                parentId: "33",
                isDefault: 0,
                parentName: "综合训练塔4-14层",
                disabled: false,
                id: "41",
              },
              {
                label: "综合训练塔L10",
                parentId: "33",
                isDefault: 0,
                parentName: "综合训练塔4-14层",
                disabled: false,
                id: "40",
              },
              {
                label: "综合训练塔L9",
                parentId: "33",
                isDefault: 0,
                parentName: "综合训练塔4-14层",
                disabled: false,
                id: "39",
              },
              {
                label: "综合训练塔L8",
                parentId: "33",
                isDefault: 0,
                parentName: "综合训练塔4-14层",
                disabled: false,
                id: "38",
              },
              {
                label: "综合训练塔L7",
                parentId: "33",
                isDefault: 0,
                parentName: "综合训练塔4-14层",
                disabled: false,
                id: "37",
              },
              {
                label: "综合训练塔L6",
                parentId: "33",
                isDefault: 0,
                parentName: "综合训练塔4-14层",
                disabled: false,
                id: "36",
              },
              {
                label: "综合训练塔L5",
                parentId: "33",
                isDefault: 0,
                parentName: "综合训练塔4-14层",
                disabled: false,
                id: "35",
              },
              {
                label: "综合训练塔L4",
                parentId: "33",
                isDefault: 0,
                parentName: "综合训练塔4-14层",
                disabled: false,
                id: "34",
              },
            ],
            disabled: false,
            id: "33",
          },
          {
            label: "综合训练塔1-3层",
            parentId: "0",
            isDefault: 0,
            children: [
              {
                label: "综合训练塔L3",
                parentId: "29",
                isDefault: 0,
                parentName: "综合训练塔1-3层",
                disabled: false,
                id: "32",
              },
              {
                label: "综合训练塔L2",
                parentId: "29",
                isDefault: 0,
                parentName: "综合训练塔1-3层",
                disabled: false,
                id: "31",
              },
              {
                label: "综合训练塔L1",
                parentId: "29",
                isDefault: 0,
                parentName: "综合训练塔1-3层",
                disabled: false,
                id: "30",
              },
            ],
            disabled: false,
            id: "29",
          },
          {
            label: "地铁高架区域",
            parentId: "0",
            isDefault: 0,
            children: [
              {
                label: "地铁地下二层",
                parentId: "23",
                isDefault: 0,
                parentName: "地铁高架区域",
                disabled: false,
                id: "28",
              },
              {
                label: "地铁地下一层",
                parentId: "23",
                isDefault: 0,
                parentName: "地铁高架区域",
                disabled: false,
                id: "27",
              },
              {
                label: "高架二层",
                parentId: "23",
                isDefault: 0,
                parentName: "地铁高架区域",
                disabled: false,
                id: "25",
              },
              {
                label: "高架一层",
                parentId: "23",
                isDefault: 0,
                parentName: "地铁高架区域",
                disabled: false,
                id: "24",
              },
            ],
            disabled: false,
            id: "23",
          },
        ],
      };
    },
    //创建多边形
    createPolygon() {
      //添加图层，并设置点范围
      const polygon = new Feature({
        geometry: new Polygon([
          [
            [0, 20],
            [20, 300],
            [160, 120],
            [100, 300],
          ],
        ]),
      });
      //设置样式
      polygon.setStyle(
        new Style({
          stroke: new Stroke({
            width: 4,
            color: [255, 0, 0, 1],
          }),
        })
      );
      //将图形加到地图上
      this.map.addLayer(
        new VectorLayer({
          source: new VectorSource({
            features: [polygon],
          }),
        })
      );
    },

    //操作事件
    onEdit() {
      console.log("");
      const transform = new ExtTransform({
        enableRotatedTransform: false,
        hitTolerance: 2,
        translate: true, // 拖拽
        stretch: false, // 拉伸
        scale: true, // 缩放
        rotate: true, // 旋转
        translateFeature: false,
        noFlip: true,
        // layers: [],
      });
      this.map.addInteraction(transform);

      //开始事件
      transform.on(["rotatestart", "translatestart"], function (e) {
        // Rotation
        let startangle = e.feature.get("angle") || 0;
        // Translation
        console.log(1111);
        console.log(startangle);
      });
      //旋转
      transform.on("rotating", function (e) {
        console.log(2222);
        console.log(
          "rotate: " +
            ((((e.angle * 180) / Math.PI - 180) % 360) + 180).toFixed(2)
        );
        console.log(e);
      });
      //移动
      transform.on("translating", function (e) {
        console.log(3333);
        console.log(e.delta);
        console.log(e);
      });
      //拖拽事件
      transform.on("scaling", function (e) {
        console.log(4444);
        console.log(e.scale);
        console.log(e);
      });
      //事件结束
      transform.on(["rotateend", "translateend", "scaleend"], function (e) {
        console.log(5555);
      });
    },

    busEmitOn() {
      console.log("初始化");
      bus.$on("testbus", (content) => {
        console.log("内容多次", content);
      });
    },

    addStar() {
      let extent = this.view.calculateExtent(this.map.getSize());
      for (let i = 0; i < 1; i++) {
        var dx = extent[2] - extent[0],
          dy = extent[3] - extent[1];
        setTimeout(this.addFeature, 200 * (i + 1), [
          extent[0] + dx * Math.random(1),
          extent[1] + dy * Math.random(1),
        ]);
      }
    },

    addFeature(coordinates) {
      var f = new ol.Feature({
        geometry: new ol.geom.Point(coordinates),
      });
      var geom = f.getGeometry();
      var xy = geom.getCoordinates();
      var extent = this.view.calculateExtent(this.map.getSize());
      var dy = extent[3] - xy[1];
      var c = 0.01;
      var key = this.map.on("postcompose", function (e) {
        if (c >= 1) {
          this.map.unByKey(key);
        }
        c += 0.01;
        geom.setCoordinates([xy[0], xy[1] + dy * (1 - ol.easing.inAndOut(c))]);
      });
      geom.setCoordinates([xy[0], xy[1] + dy * (1 - ol.easing.inAndOut(c))]);

      this.vector.getSource().addFeature(f);
    },

    localpos() {
      const polygon = this.multiSource.getFeatures()[3].getGeometry();
      this.view.fit(polygon, { padding: [170, 50, 30, 150] });
    },
    localpos1() {
      const polygon1 = this.multiSource.getFeatures()[1].getGeometry();
      console.log(
        "nihao ",
        polygon1,
        polygon1.getCoordinates(),
        this.map.getSize()
      );
      this.view.centerOn(
        polygon1.getCoordinates(),
        this.map.getSize(),
        [160, 60]
      );
    },
    localpos2() {
      const polygon2 = this.multiSource.getFeatures()[1].getGeometry();
      this.view.fit(polygon2, {
        padding: [170, 50, 30, 150],
        minResolution: 50,
      });
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

      this.vector = new VectorLayer({
        source: this.source,
      });

      this.map = new olMap({
        target: "map",
        controls: defaultControls({
          zoom: true,
        }).extend([]),
        layers: [
          imageLayer,
          this.vector,

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

      this.createPolygon();
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
          snapTolerance: 1,
        });
        this.map.addInteraction(this.draw);
      }
    },

    addIcon() {
      var iconFeature = new Feature(new Point([0, 0]));
      iconFeature.set("style", this.createStar("data/icon.png", undefined));

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
            // color: "#f00",
            // rotation: Math.PI / 4,
            // opacity: 0.2,

            stroke: new Stroke({
              color: "#ff0000",
              width: 30,
            }),
          }),
          fill: new Fill({
            color: "#1fca04",
            opacity: 1,
          }),
          stroke: new Stroke({
            color: "#ff0000",
            width: 3,
          }),
          text: new Text({
            text: "锚点显示111",
            scale: [1, 1],
            textAlign: "center",
            // color: "#f00",
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

    createStar() {
      return new Style({
        image: new RegularShape({
          points: 5,
          radius1: 20,
          radius2: 10,
          fill: new Fill({
            color: "#ffff00",
          }),
          stroke: new Stroke({
            width: 1,
            color: "00ffff",
          }),
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

    webSocketPosition() {
      const self = this;
      self.systemID = new Date().getTime().toString();
      var param = JSON.stringify({
        register: self.systemID,
      });
      if ("WebSocket" in window) {
        let url = "ws://192.168.3.214:8080/socket/websocket/socketServer.do";
        self.ws = new WebSocket(url);
        self.ws.onopen = function () {
          self.webSocketOnSend(param);

          console.log("数据发送中...");
        };
        self.ws.onmessage = function (evt) {
          console.log(evt);
          //  self.getMessage(evt.data);
        };

        self.ws.onmessage = function (evt) {
          console.log(evt.data);
          self.getMessage(JSON.parse(evt.data));
        };

        self.ws.onclose = function () {
          console.log("连接已关闭...");
        };
      } else {
        console.log("您的浏览器不支持WebSocket!");
      }
    },
    webSocketOnSend(data) {
      const self = this;
      if (self.ws.readyState === 1) {
        self.ws.send(data);
      }
    },

    getMessage(el) {
      const self = this;
      const result = el;
      if (result.message === "handshake") {
        let json = JSON.stringify({ key: "1626945204067", layerId: "37" });
        self.webSocketOnSend(json);
      } else if (result.message === "Point") {
        if (self.bLockEx) {
          self.bLockEx = false;
          const format = new GeoJSON();
          const newFeatures = format.readFeatures(result.data);
          newFeatures.forEach(function (f) {
            // const coords = _TransPixel(f.getGeometry().getCoordinates());
            const coords = f.getGeometry().getCoordinates();
            const tag = self.TagSource.getFeatureById(f.get("resourceId"));
            if (tag != null) {
              if (
                tag.get("pos_x") - 0.3 > f.get("pos_x") ||
                tag.get("pos_x") + 0.3 < f.get("pos_x") ||
                tag.get("pos_y") - 0.3 > f.get("pos_y") ||
                tag.get("pos_y") + 0.3 < f.get("pos_y")
              ) {
                tag.set("pos_x", f.get("pos_x"));
                tag.set("pos_y", f.get("pos_y"));
                tag.set("axis", f.get("axis"));
                tag.getGeometry().setCoordinates(coords);
                // updateOverPopupPosition(tag, coords);
              }
            } else {
              console.log(f);
              f.getGeometry().setCoordinates(coords);
              f.setId(f.get("resourceId"));
              f.set("visible", true);
              self.TagSource.addFeature(f);
              self.options.push({
                label: f.get("itemname"),
                value: f.get("resourceId"),
              });
            }
          });
          self.bLockEx = true;
        }
      }
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
