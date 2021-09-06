<template>
  <div class="openlayermap">
    <treeselect
      v-model="mapId"
      placeholder="选择"
      :max-height="300"
      :options="mapList"
      style="float: left; width: 200px"
      @input="nodeClick"
    />
    <div id="map" />
    <!-- <div :id="olmapId"></div> -->
  </div>
</template>

<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import {
  sendThis,
  Load_Map,
  _iMap,
  _TransPixel,
  TagStyle,
  _Style,
  updateOverlayPosition,
  FenceStyle,
  _TransMetric,
  _TransMetric2,
  _TransMetric3,
  _TransMetricFence,
  _dPR,
  Load_Fence,
  FenceSource,
  Load_Fence2,
  FenceSource2,
} from "../components/historymap";
import { getMapTree, getMap } from "@/util/api.js";
import $ from "jquery";
export default {
  components: {
    Treeselect,
  },
  props: {
    //地图map唯一id值
    olmapId: {
      type: String,
      require: true,
      default: function () {
        return (
          // "map-self-" + new Date().getTime()
          "map-self"
        );
      },
    },
  },
  data() {
    return {
      mapId: "",
      mapList: [],
    };
  },
  mounted(){
    this.init()
  },
  methods: {
    init() {
      // 加载地图树
      getMapTree().then((res) => {
        console.log(res)
        const RES = this.responseUse(res);
        if (typeof RES !== "undefined") {
          this.mapList = RES;
          sendThis(this);
          this.mapId = RES[0].id;
        }
      });
    },
    nodeClick() {
      const self = this;
      getMap(self.mapId).then((res) => {
        const RES = self.responseUse(res);
        if (RES != undefined) {
          $("#map").empty();
          self.mapName = RES.mapName;
          Load_Map(
            "http://192.168.3.214:8080/file" + RES.mapPath,
            RES.mapActualX,
            RES.mapActualY,
            RES.mapPixelX,
            RES.mapPixelY,
            RES.mapPixelX / RES.mapActualX,
            [RES.mapOriginX, RES.mapOriginY],
            false
          );
          Load_Fence(self.mapId);
          Load_Fence2();
          self.fenceModify_init();
          self.createMeasureTooltip2();
        }
      });
    },
  },
};
</script>

<style>
</style>
