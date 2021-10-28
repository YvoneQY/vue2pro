<template>
  <div class="openlayer">
    <div>
          <el-button
            type="primary"
            plain
            icon="el-icon-notebook-1"
            circle
            @click="quickStatistics"
          />
      <el-collapse v-model="activeNames" @change="collapseChange">
        <el-collapse-item title="地图管理模式" name="1">
          <el-table
            :data="tableFence"
            max-height="200"
            @select="clickShowFence"
            @select-all="clickShowCompleteFence"
          >
            <el-table-column type="selection" width="30" />
            <el-table-column prop="fenceName" label="全选" />
          </el-table>
        </el-collapse-item>
        <el-collapse-item title="摄像头显示1111" name="2" v-if="tableCamera.length > 0">
          <el-table
            :data="tableCamera"
            max-height="200"
            @select="clickShowCamera"
            @select-all="clickShowCompleteCamera"
          >
            <el-table-column type="selection" width="30" />
            <el-table-column prop="cameraName" label="全选" />
          </el-table>
        </el-collapse-item>
      </el-collapse>

      <treeselect
        v-model="mapId"
        :max-height="300"
        :options="mapList"
        style="float: left; width: 200px"
        @input="nodeClick"
      />
      <!-- <el-tooltip
        v-for="(item, index) in drawForms"
        :key="index"
        effect="dark"
        :content="item.label"
        placement="bottom"
      >
        <el-button
          :key="item.value"
          type="text"
          :autofocus="false"
          :data-id="item.value"
          :label="item.label"
          :disabled="disabled"
          size="mini"
          @click="handleChange(index, item.value)"
        >
          {{ item.id == colorFlag ? "un" + item.label : item.label }}
        </el-button>
      </el-tooltip> -->
      <el-button @click="changePic">点我切图</el-button>
      <el-button @click="showhaw">是否显示鹰眼</el-button>
      <el-button @click="changeMap">重新渲染map</el-button>
      <el-button @click="getWsPoint">获取ws动态点</el-button>
    </div>

    <openlayer-map
      ref="openmap"
      style="height: 600px"
      :mapurls="mapUrl"
      :curmapconfig="curmap"
      :is-haw-eyes="ishaw"
      :wsmsgdata="wsMsg"
      :icontype="icontypes"
      :draw-form-value="drawFormValue"
      :track-data="trackData"
      :fence-data="fenceData"
      :camera-data="cameraData"
      :play-video-url="playerVideoUrl"
      :leave-txt="leaveTxt"
      @getTrackData="queryTrackData($event)"
      @onLeaveTxt="onleaveTxt($event)"
    />
  </div>
</template>

<script>
import {   
  getMap,
  getMapTree,
  getHistoryInfoDetail,
  getLayerFenceDataList,
  getSingeFence,
  getAllFence,
  getCameraLayerList,
  cameraOne,
  getSingleCameraGeoJson,
  getDicts,
  oneKeyOut,} from "./../util/api";
import Treeselect from "@riophae/vue-treeselect";
// import the styles
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

import "ol/ol.css";
// import OpenlayerMap from "@/components/OpenlayerMap.vue";
export default {
  components: { Treeselect },
  data() {
    return {
      leaveTxt: [], //下发撤离文字
      tableCamera: [],
      tableFence: [],
      activeNames: ["1"],
      trackData: [],
      mapList: [],
      drawFormValue: "None",
      colorFlag: 0,
      disabled: false,
      drawForms: [
        {
          id: 0,
          value: "None",
          label: "无操作",
          iconFont: "al-icon-carxuanzegongju1",
          unIconFont: "al-icon-carxuanzegongju",
        },
        {
          id: 1,
          value: "Box",
          label: "绘制矩形",
          iconFont: "al-icon-carcheckbox-blank-outli",
          unIconFont: "al-icon-carcheckbox-blank",
        },
        {
          id: 2,
          value: "Square",
          label: "绘制方块",
          iconFont: "al-icon-carrhombus-outline",
          unIconFont: "al-icon-carrhombus",
        },
        {
          id: 3,
          value: "Polygon",
          label: "绘制多边形",
          iconFont: "al-icon-carpentagon-outline",
          unIconFont: "al-icon-carpentagon",
        },
        {
          id: 4,
          value: "Circle",
          label: "绘制圆形",
          iconFont: "al-icon-carcheckbox-blank-circle-outline",
          unIconFont: "al-icon-carcheckbox-blank-circle",
        },
        {
          id: 5,
          value: "Select",
          label: "修改围栏",
          iconFont: "al-icon-carbianji-kong",
          unIconFont: "al-icon-carbianji-shi",
        },
        // {
        //   id: 6,
        //   value: 'BiaoChi',
        //   label: '标尺',
        //   iconFont: 'el-icon-position',
        //   unIconFont: 'el-icon-s-promotion'
        // }
      ],
      mapId: null,

      ws: null,
      systemID: null,
      bLockEx: true,
      wsMsg: null, //ws发送来的数据
      iswsMsg: false, //是否是推送ws

      ishaw: true,
      order: 0,
      mapIndex: 0,
      curmap: {},
      mapUrlList: [
        "https://scpic3.chinaz.net/Files/pic/pic9/202107/apic34088_s.jpg",
        "https://scpic2.chinaz.net/Files/pic/pic9/202107/hpic4220_s.jpg",
        "https://scpic.chinaz.net/Files/pic/pic9/202107/hpic4223_s.jpg",
        "https://scpic1.chinaz.net/Files/pic/pic9/202107/bpic23746_s.jpg",
        "https://scpic1.chinaz.net/Files/pic/pic9/202107/bpic23750_s.jpg",
      ],
      mapUrl: "https://scpic.chinaz.net/Files/pic/pic9/202107/bpic23751_s.jpg",
      mapData: [
        {
          companyId: 103,
          createTime: 1626251459109,
          creator: "admin",
          idx: 39,
          isDefault: 0,
          layerId: 3,
          lcid: "LCID14vMn1eA",
          mapActualX: 111,
          mapActualY: 111,
          mapName: "平面图",
          mapOriginX: 111,
          mapOriginY: 111,
          mapPath:
            "https://scpic2.chinaz.net/Files/pic/pic9/202107/apic34073_s.jpg",
          mapPathName: "11.jpg",
          mapPixelX: 1000,
          mapPixelY: 1000,
          nodeName: "平面图",
          parentId: 0,
          remark: "",
          type: "layer",
          updateTime: 1626411645235,
          updator: "admin",
        },
        {
          companyId: 103,
          createTime: 1626224371584,
          creator: "admin",
          idx: 37,
          isDefault: 1,
          layerId: 1,
          lcid: "LCIDQOqLHGIr",
          mapActualX: 66.25,
          mapActualY: 30.96,
          mapName: "公司地图",
          mapOriginX: -14,
          mapOriginY: -18.17,
          mapPath:
            "https://scpic.chinaz.net/Files/pic/pic9/202004/zzpic24382_s.jpg",
          mapPathName: "company.png",
          mapPixelX: 3041,
          mapPixelY: 1422,
          nodeName: "公司地图",
          parentId: 0,
          remark: "",
          type: "layer",
          updateTime: 1626405752153,
          updator: "admin",
        },
      ],
      iconlist: [
        {
          note: "1",
          color: "#F57756",
          icon: "al-icon-carcustmer",
          remark: "1",
          type: "",
          companyId: 103,
          createTime: 1625760000000,
          name: "1",
          idx: 9,
        },
        {
          note: "1",
          color: "#F57756",
          icon: "al-icon-carcustmer",
          remark: "1",
          type: "",
          companyId: 103,
          createTime: 1625760000000,
          name: "1",
          idx: 10,
        },
        {
          note: "1",
          color: "#E64373",
          icon: "al-icon-carhuowu",
          type: "material",
          companyId: 103,
          createTime: 1626077323805,
          name: "包装箱",
          idx: 31,
        },
        {
          note: "12",
          color: "#E64373",
          icon: "al-icon-carcustmer",
          updateTime: 1626223715587,
          remark: "12",
          type: "staff",
          companyId: 103,
          createTime: 1625809885533,
          name: "小时工",
          idx: 11,
        },
        {
          color: "#F5B556",
          icon: "al-icon-carshigongrenyuan",
          updateTime: 1626223720933,
          type: "staff",
          companyId: 103,
          createTime: 1626082606650,
          name: "临时工",
          idx: 32,
        },
        {
          note: "1212",
          color: "#E643CF",
          icon: "al-icon-carlunchuan2",
          updateTime: 1626223981646,
          remark: "1212",
          type: "car",
          companyId: 103,
          createTime: 1625810113596,
          name: "叉车1",
          idx: 26,
        },
        {
          note: "aaa",
          color: " #F57756",
          icon: "al-icon-caric_local_shipping_px",
          updateTime: 1626224005626,
          remark: "aaa",
          type: "car",
          companyId: 103,
          createTime: 1625809947504,
          name: "咨询车",
          idx: 14,
        },
        {
          note: "12",
          color: " #F57756",
          icon: "al-icon-carhuowu",
          updateTime: 1626224027182,
          remark: "12",
          type: "material",
          companyId: 103,
          createTime: 1626061504018,
          name: "物料资源",
          idx: 30,
        },
        {
          color: "#EF7613",
          icon: "al-icon-caryuangong",
          type: "staff",
          companyId: 103,
          createTime: 1626311747293,
          name: "testee",
          idx: 35,
        },
        {
          color: "#E64373",
          updateTime: 1626334088719,
          type: "car",
          companyId: 103,
          createTime: 1625810132618,
          name: "资源3",
          idx: 29,
        },
        {
          color: "#E64373",
          updateTime: 1626334094249,
          type: "car",
          companyId: 103,
          createTime: 1625810126106,
          name: "吊车",
          idx: 28,
        },
        {
          color: "#F57756",
          icon: "al-icon-cardiaoche",
          updateTime: 1626334103390,
          type: "car",
          companyId: 103,
          createTime: 1625810120462,
          name: "叉车2",
          idx: 27,
        },
        {
          note: "1221",
          color: "#F5B556",
          icon: "al-icon-caric_local_shipping_px",
          updateTime: 1626334152589,
          remark: "2112",
          type: "car",
          companyId: 103,
          createTime: 1625810058642,
          name: "货车",
          idx: 21,
        },
        {
          note: "qewe",
          color: " #F57756",
          icon: "al-icon-caric_local_shipping_px",
          updateTime: 1626334167293,
          remark: "qeq",
          type: "car",
          companyId: 103,
          createTime: 1625810069419,
          name: "雪弗兰",
          idx: 22,
        },
        {
          note: "1111",
          color: " #F57756",
          icon: "al-icon-caric_local_shipping_px",
          updateTime: 1626337305560,
          remark: "11111",
          type: "car",
          companyId: 103,
          createTime: 1625810081645,
          name: "桑塔纳",
          idx: 23,
        },
        {
          note: "1",
          color: "#F5B556",
          icon: "al-icon-caric_local_shipping_px",
          updateTime: 1626339117670,
          remark: "1",
          type: "car",
          companyId: 103,
          createTime: 1625810095759,
          name: "运输车",
          idx: 24,
        },
        {
          note: "12",
          color: " #F57756",
          icon: "al-icon-carlunchuan2",
          updateTime: 1626339120784,
          remark: "12",
          type: "car",
          companyId: 103,
          createTime: 1625810106544,
          name: "碰碰车",
          idx: 25,
        },
        {
          note: "aaa",
          color: "#E643CF",
          icon: "al-icon-caric_local_shipping_px",
          type: "car",
          companyId: 103,
          createTime: 1626688205103,
          name: "aaa",
          idx: 36,
        },
      ],
      icontypes: [],
      fenceData: [], //围栏数据
      cameraData: [], //摄像头数据
      playerVideoUrl: "ws://192.168.3.214:8866/live?url=", //摄像头的ws请求地址
    };
  },
  created() {
    this.getMapList();
    this.initLeave();
  },
  mounted() {
    this.getIconList();
    this.webSocketPosition();
  },
  methods: {
    quickStatistics(){
      this.$refs.openmap.quickStatistics()
    },
    //下发文字撤离
    onleaveTxt(e) {
      oneKeyOut(e).then((response) => {
        if (response.code == 200) {
          console.log("成功了");
        } else {
          console.log("失败了", response.data);
        }
      });
    },

    // 获取撤离下发文字
    initLeave() {
      getDicts("sys_view_index").then((response) => {
        if (response.code == 200) {
          response.data.map((item) => {
            console.log(item);
            item.value = item.dictValue;
            item.label = item.dictLabel;
          });
          this.leaveTxt = response.data;
          console.log("最后文字接口", this.leaveTxt);
        }
      });
    },
    showhaw() {
      this.ishaw = !this.ishaw;
    },
    changePic() {
      this.mapUrl = this.mapUrlList[this.order];
      ++this.order;
      if (this.order > this.mapUrlList.length) {
        this.order = 0;
      }
    },
    changeMap() {
      let donfig = this.mapData[this.mapIndex];

      let dataconfig = {};
      dataconfig.url = donfig.mapPath;
      dataconfig.RealWidth = donfig.mapActualX;
      dataconfig.RealHeight = donfig.mapActualY;
      dataconfig.PixelWidth = donfig.mapPixelX;
      dataconfig.PixelHeight = donfig.mapPixelY;
      dataconfig.dPR = donfig.mapPixelX / donfig.mapActualX;
      dataconfig.ZeroPoint = [donfig.mapOriginX, donfig.mapOriginY];
      dataconfig.param = false;
      this.curmap = dataconfig;
      ++this.mapIndex;
      if (this.mapIndex >= this.mapData.length) {
        this.mapIndex = 0;
      }
    },

    getIconList() {
      let tagTypes = [];
      for (let i = 0; i < this.iconlist.length; i++) {
        const type = this.iconlist[i].type;
        if (tagTypes[type]) {
          tagTypes[type].push(this.iconlist[i]);
        } else {
          tagTypes[type] = [];
          tagTypes[type].push(this.iconlist[i]);
        }
      }
      this.icontypes = tagTypes;
    },

    webSocketPosition() {
      const self = this;
      self.systemID = new Date().getTime().toString();
      var param = JSON.stringify({
        register: self.systemID,
      });
      if ("WebSocket" in window) {
        // self.ws = new WebSocket(
        //   "ws://192.168.3.214:8080/socket/websocket/socketServer.do"
        // );
        self.ws = new WebSocket(
          "ws://192.168.3.92:8762/websocket/socketServer.do"
        );
        self.ws.onopen = function () {
          self.webSocketOnSend(param);
          console.log("数据发送中...");
        };
        self.ws.onmessage = function (evt) {
          self.getMessage(evt.data);
        };
        self.ws.onclose = function () {
          console.log("ws连接已关闭...");
        };
        self.ws.onerror = function () {
          console.log("ws出错");
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
      const result = JSON.parse(el);

      if (result.message === "handshake") {
      } else if (result.message === "Point") {
        if (self.bLockEx) {
          self.bLockEx = false;
          self.wsMsg = result;
          self.bLockEx = true;
        }
      }
    },

    getWsPoint() {
      const param = JSON.stringify({
        key: this.systemID,
        // layerId: this.mapId,
        layerId: "160",
      });
      this.webSocketOnSend(param);
    },

    handleChange(val, type) {
      this.colorFlag = val;
      this.drawFormValue = type;
    },

    //获取地图列表
    getMapList() {
      getMapTree().then((res) => {
        if (res.code == 200) {
          this.mapList = res.data;
        }
      });
    },

    nodeClick() {
      console.log(this.mapId);
      getMap(this.mapId).then((res) => {
        if (res.code == 200) {
          let RES = res.data;
          if (RES != undefined) {
            RES.mapPath = "http://192.168.11.214:8080" + "/file" + RES.mapPath;
            this.initMapRule(RES);
          }
          this.getWsPoint();
        }
      });
    },
    //格式化地图控件
    initMapRule(donfig) {
      let dataconfig = {};
      dataconfig.mapName = donfig.mapName;
      dataconfig.idx = donfig.idx;
      dataconfig.url = donfig.mapPath;
      dataconfig.RealWidth = donfig.mapActualX;
      dataconfig.RealHeight = donfig.mapActualY;
      dataconfig.PixelWidth = donfig.mapPixelX;
      dataconfig.PixelHeight = donfig.mapPixelY;
      dataconfig.dPR = donfig.mapPixelX / donfig.mapActualX;
      dataconfig.ZeroPoint = [donfig.mapOriginX, donfig.mapOriginY];
      dataconfig.param = false;
      this.curmap = dataconfig;
      this.initFence();
      this.initCamera();
    },

    //获取icon的轨迹数据
    queryTrackData(e) {
      console.log(e);
      getHistoryInfoDetail(e).then((res) => {
        if (res.code == 200) {
          this.trackData = res.data;
        }
      });
    },
    //折叠面板
    collapseChange(val) {
      console.log(val);
    },
    initFence() {
      getLayerFenceDataList(this.curmap.idx).then((res) => {
        if (res.code == 200) {
          console.log(res.data);
          this.tableFence = res.data;
        }
      });
    },
    //初始化摄像头
    initCamera() {
      getCameraLayerList(this.curmap.idx).then((res) => {
        if (res.code == 200) {
          this.tableCamera = res.data;
        }
      });
    },

    //勾选单个围栏
    clickShowFence(row) {
      this.fenceData = [];
      if (row.length > 0) {
        row.map((item) => {
          this.addSingleFence(item.idx);
        });
      }
    },
    //勾选多个围栏即查所有围栏
    clickShowCompleteFence(row) {
      if (row.length == this.tableFence.length) {
        getAllFence(this.curmap.idx).then((res) => {
          if (res.code == 200) {
            this.fenceData = res.data;
          }
        });
      } else {
        this.fenceData = [];
      }
    },

    //围栏接口调用
    addSingleFence(value) {
      getSingeFence(value).then((res) => {
        if (res.code == 200) {
          this.fenceData.push(res.data[0]);
        }
      });
    },

    //单选摄像头
    clickShowCamera(row) {
      this.cameraData = [];
      if (row.length > 0) {
        row.map((item) => {
          this.addSingleCamera(item.idx);
        });
      }
    },
    //全选摄像头
    clickShowCompleteCamera(row) {
      if (row.length == this.tableFence.length) {
      } else {
        this.cameraData = [];
      }
    },

    //获取摄像头资源列表
    addSingleCamera(idx) {
      getSingleCameraGeoJson(idx).then((res) => {
        if (res.code == 200) {
          this.cameraData.push(res.data);
        }
      });
    },
  },
};
</script>

<style>
</style>
