<template>
  <div>
    <div class="simple">
      <div>简单的{{ checkedId }}</div>
      <treeselect v-model="value" :multiple="true" :options="options" />
    </div>
    <div class="complicated">
      <div>{{ defaultCheckedPeople }}困难的{{ toData }}</div>
      <tree-transfer
        ref="pageTree"
        :title="title"
        :default-checked-keys="defaultCheckedPeople"
        :from_data="fromData"
        node-key="id"
        :to_data="toData"
        :defaultProps="{ label: 'label' }"
        default-transfer
        @add-btn="add"
        @remove-btn="remove"
        :mode="mode"

        filter
        openAll
        @left-check-change="changeLeft"
        @right-check-change="changeRight"
      >
      </tree-transfer>
      <br />
      <tree-transfer
        lazy
        @lazyFn="lazyLoad"
        :title="title"
        :data="dataList"
        node-key="id"
        :defaultProps="{ label: 'label' }"
        default-transfer
        @add-btn="add"
        @remove-btn="remove"
        :mode="mode"
        @left-check-change="changeLeft"
        @right-check-change="changeRight"
      >
      </tree-transfer>
       <!-- <tree-transfer
        lazy
        @lazyFn="lazyLoad"
        :title="title"
        :from_data="fromData11"
        node-key="id"
        :to_data="toData11"
        :defaultProps="{ label: 'label' }"
        default-transfer
        @add-btn="add"
        @remove-btn="remove"
        :mode="mode"
        height="540px"
        @left-check-change="changeLeft"
        @right-check-change="changeRight"
      >
      </tree-transfer> -->
      <!-- <tree-transfer
        ref="pageTree"
        :title="title"
        :default-checked-keys="defaultCheckedPeople1"
        :from_data="fromData1"
        node-key="id"
        :to_data="toData1"
        :defaultProps="{ label: 'label' }"
        default-transfer
        @add-btn="add"
        @remove-btn="remove"
        :mode="mode"
        height="540px"
        filter
        openAll
        @left-check-change="changeLeft"
        @right-check-change="changeRight"
      >
      </tree-transfer> -->
    </div>
  </div>
</template>

<script>

import Treeselect from "@riophae/vue-treeselect";
import treeTransfer from "el-tree-transfer";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { deptList } from "./dept.js";
export default {
  components: {
    Treeselect,
    treeTransfer,
  },
  // check：当复选框被点击的时候触发；共两个参数，依次为：传递给 data 属性的数组中该节点所对应的对象、树目前的选中状态对象，包含 checkedNodes、checkedKeys、halfCheckedNodes、halfCheckedKeys 四个属性
  data() {
    return {
      value: null,
      // define options ['1-2', '1-2-1', '1-2-2'],['1-2-1']
      options: [
        {
          id: "a",
          label: "a",
          children: [
            {
              id: "aa",
              label: "aa",
            },
            {
              id: "ab",
              label: "ab",
            },
            {
              id: "ac",
              label: "ac",
            },
            {
              id: "ad",
              label: "ad",
            },
          ],
        },
        {
          id: "b",
          label: "b",
          children: [
            {
              id: "ba",
              label: "ba",
            },
            {
              id: "bb",
              label: "bb",
            },
            {
              id: "bc",
              label: "bc",
            },
          ],
        },
        {
          id: "c",
          label: "c",
        },
      ],
      title: ["待选", "已选"], //标题 类型：Array 必填：false 默认：["源列表", "目标列表"]
      mode: "transfer", //设置模式，字段可选值为transfer|addressList 类型：String 必填：false 补充：mode默认为transfer模式，即树形穿梭框模式，可配置字段为addressList改为通讯录模式，通讯录模式时按钮不可自定义名字，如要自定义标题名在title数组传入四个值即可，addressList模式时标题默认为通讯录、收件人、抄送人、密送人
      // fromData: [
      //   //源数据 类型：Array 必填：true 补充：数据格式同element-ui tree组件，但必须有id和pid
      //   {
      //     id: "1",
      //     pid: 0, //自定义pid的参数名，默认为"pid" 必填：false
      //     label: "一级 1",
      //     children: [
      //       {
      //         id: "1-1",
      //         pid: "1",
      //         label: "二级 1-1",
      //         disabled: true,
      //         children: [],
      //       },
      //       {
      //         id: "1-2",
      //         pid: "1",
      //         label: "二级 1-2",
      //         children: [
      //           {
      //             id: "1-2-1",
      //             pid: "1-2",
      //             children: [],
      //             label: "二级 1-2-1",
      //           },
      //           {
      //             id: "1-2-2",
      //             pid: "1-2",
      //             children: [],
      //             label: "二级 1-2-2",
      //           },
      //         ],
      //       },
      //     ],
      //   },
      // ],
      toData: [],
      fromData: deptList,
      defaultCheckedPeople: [],
      // defaultCheckedPeople: [203, 211],
      deptData: [],
      checkedId: [],

      curData: [],

      fromData1: [
        {
          id: "1",
          pid: 0,
          label: "一级 1",
          children: [
            {
              id: "1-1",
              pid: "1",
              label: "二级 1-1",
              disabled: true,
              children: [],
            },
            {
              id: "1-2",
              pid: "1",
              label: "二级 1-2",
              children: [
                {
                  id: "1-2-1",
                  pid: "1-2",
                  children: [],
                  label: "二级 1-2-1",
                },
                {
                  id: "1-2-2",
                  pid: "1-2",
                  children: [],
                  label: "二级 1-2-2",
                },
              ],
            },
          ],
        },
      ],
      toData1: [],
      defaultCheckedPeople1: [],

      fromData11: [
        {
          id: "1",
          pid: 0,
          label: "一级 1",
          children: [
            {
              id: "1-1",
              pid: "1",
              label: "二级 1-1",
              disabled: true,
              children: [],
            },
            {
              id: "1-2",
              pid: "1",
              label: "二级 1-2",
              children: [
                {
                  id: "1-2-1",
                  pid: "1-2",
                  children: [],
                  label: "二级 1-2-1",
                },
                {
                  id: "1-2-2",
                  pid: "1-2",
                  children: [],
                  label: "二级 1-2-2",
                },
              ],
            },
          ],
        },
      ],
      toData11: [],
      defaultCheckedPeople11: [],
      dataList:[
           {
          id: "1",
          pid: 0,
          label: "一级 1",
          children: [
            {
              id: "1-1",
              pid: "1",
              label: "二级 1-1",
              disabled: true,
              children: [],
            },
            {
              id: "1-2",
              pid: "1",
              label: "二级 1-2",
              children: [
                {
                  id: "1-2-1",
                  pid: "1-2",
                  children: [],
                  label: "二级 1-2-1",
                },
                {
                  id: "1-2-2",
                  pid: "1-2",
                  children: [],
                  label: "二级 1-2-2",
                },
              ],
            },
          ],
        },
      ]
    };
  },
  mounted() {
    this.$nextTick(() => {
      console.log("眼睛疼", this.$refs.pageTree);
    });

  },
  methods: {

    lazyLoad(node, resolve, from){
      //  node->当前展开节点node
      // resolve->懒加载resolve 
      // from -> left/right 表示回调来自左侧/右侧
      console.log('你好---',node, resolve, from)
      setTimeout(() => {
          resolve(this.dataList)
      }, 1000);

    },
    // 切换模式 现有树形穿梭框模式transfer 和通讯录模式addressList
    changeMode() {
      if (this.mode == "transfer") {
        this.mode = "addressList";
      } else {
        this.mode = "transfer";
      }
    },
    // 监听穿梭框组件添加
    add(fromData, toData, obj) {
      // 树形穿梭框模式transfer时，返回参数为左侧树移动后数据、右侧树移动后数据、移动的{keys,nodes,halfKeys,halfNodes}对象
      // 通讯录模式addressList时，返回参数为右侧收件人列表、右侧抄送人列表、右侧密送人列表
      console.log("fromData:", fromData);
      console.log("toData:", toData);
      console.log("obj:", obj);
    },
    // 监听穿梭框组件移除
    remove(fromData, toData, obj) {
      // 树形穿梭框模式transfer时，返回参数为左侧树移动后数据、右侧树移动后数据、移动的{keys,nodes,halfKeys,halfNodes}对象
      // 通讯录模式addressList时，返回参数为右侧收件人列表、右侧抄送人列表、右侧密送人列表
      console.log("fromData:", fromData);
      console.log("toData:", toData);
      console.log("obj:", obj);
    },

    changeLeft(nodeObj, treeObj, checkAll) {
      console.log("左侧--", nodeObj, treeObj, checkAll);
      this.checkedId = treeObj.checkedKeys;
      // treeObj.checkedKeys.map(item=>{
      //    this.defaultCheckedPeople.push(item)
      // })
    },
    changeRight(nodeObj, treeObj, checkAll) {
      console.log("右侧--", nodeObj, treeObj, checkAll);
    },
  },
};
</script>

<style>
</style>