<template>
  <div class="threeSty">
    <div class="three-container">
      <div class="container" ref="dThree">
        <!-- <v3d-orbit-controls ref="controls">
          <v3d-camera ref="camera0" :position="camPos"></v3d-camera>
        </v3d-orbit-controls> -->
      </div>
    </div>
  </div>
</template>

<script>
import OrbitControls from "./OrbitControls.vue";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
export default {
  name: "Three",
  components: {
    "v3d-orbit-controls": OrbitControls,
  },
  data() {
    return {
      TScene: null,
      TGeometry: null,
      TMaterial: null,
      TMesh: null,
      TPoint: null,
      TAmbient: null,
      TCamera: null,
      TRender: null,
      TGltfloader: null,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.init();
    });
  },
  methods: {
    loadModule() {
      this.TGltfloader = new GLTFLoader();
       console.log("好吵", this.TGltfloader);
      this.TGltfloader.load(`${process.env.BASE_URL}`+"modules/Bee.glb", (gltf) => {
        console.log("小布舞曲", gltf);
        gltf.scene.position.set(0, 0, 0);
        gltf.scene.traverse((obj) => {
          console.log("貌似应用", gltf);
          obj.castShadow = true;
          obj.receiveShadow = true;
        });
        this.TScene.add(gltf.scene);
        gltf.animations.forEach((i) => {
         console.log('always with me')
        });
      });
    },
    init() {
      this.TScene = new THREE.Scene();
      this.TGeometry = new THREE.BoxGeometry(100, 100, 100);
      this.TMaterial = new THREE.MeshLambertMaterial({
        color: 0x0000ff,
      }); //材质对象Material
      this.TMesh = new THREE.Mesh(this.TGeometry, this.TMaterial); //网格模型对象Mesh
      this.TScene.add(this.TMesh); //网格模型添加到场景中
      /**
       * 光源设置
       */
      //点光源
      this.TPoint = new THREE.PointLight(0xffffff);
      this.TPoint.position.set(400, 200, 300); //点光源位置
      this.TScene.add(this.TPoint); //点光源添加到场景中
      //环境光
      this.TAmbient = new THREE.AmbientLight(0x444444);
      this.TScene.add(this.TAmbient);
      // console.log(scene)
      // console.log(scene.children)
      /**
       * 相机设置
       */
      var width = window.innerWidth; //窗口宽度
      var height = window.innerHeight; //窗口高度
      var k = width / height; //窗口宽高比
      var s = 200; //三维场景显示范围控制系数，系数越大，显示的范围越大
      //创建相机对象
      this.TCamera = new THREE.OrthographicCamera(
        -s * k,
        s * k,
        s,
        -s,
        1,
        1000
      );

      this.TCamera.position.set(200, 300, 200); //设置相机位置
      this.TCamera.lookAt(this.TScene.position); //设置相机方向(指向的场景对象)
      /**
       * 创建渲染器对象
       * alpha: true 这个属性是关键，不然背景会被renderer遮住
       */
      this.TRender = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      this.TRender.setSize(width, height); //设置渲染区域尺寸
      this.TRender.setClearColor(0xb9d3ff, 1); //设置背景颜色
      // document.body.appendChild(this.TRender.domElement); //body元素中插入canvas对象
      this.$refs.dThree.appendChild(this.TRender.domElement);
      //执行渲染操作   指定场景、相机作为参数
      this.TRender.render(this.TScene, this.TCamera);
      console.log("参数设置", this.TRender, width, height);
      this.loadModule();
    },
  },
};
</script>

<style scoped>
.threeSty {
  border: 1px solid red;
}
.three-container {
  border: 1px solid yellow;
}
.container {
  border: 1px solid green;
  margin: 0;
  overflow: hidden;
  background: url("../../assets/logo.png") center no-repeat;
  background-size: cover;
}
</style>