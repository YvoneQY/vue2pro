<template>
    <el-row :gutter="20">
        <el-col :span="11">
            <el-card class="box-card">
                <div slot="header" class="w-title clearfix">
                    <span>主维度系统数据
                        <el-switch v-model="isOnly" class="switch"></el-switch>
                        <span>
                            <em>{{isOnly ? '移动不包含子机构' : '移动包含子机构'}}</em>
                        </span>
                    </span>
                </div>
                <el-tree
                    :data="sourceData"
                    show-checkbox
                    default-expand-all
                    node-key="id"
                    ref="sourceTree"
                    highlight-current
                    :check-strictly="isOnly"
                    :props="defaultProps"
                    @check-change="sourceCheckChange"
                    @check="sourceCheck"
                    @node-expand="sourceExpand"
                    @node-click="sourceClick">
                </el-tree>
            </el-card>
        </el-col>
        <el-col :span="2" style="margin-top:1%;">
            <div style="text-align: center;">
                <el-button type="primary" icon="el-icon-back" circle @click="detach" :disabled="l_mutilCk"></el-button>
                <el-button type="primary" icon="el-icon-right" circle @click="shuttle" :disabled="r_mutilCk"></el-button>
            </div>
        </el-col>
        <el-col :span="11">
            <el-card class="box-card">
                <div slot="header" class="clearfix">
                    <span>子维度系统数据</span>
                </div>
                  <!-- :check-strictly="false" -->
                <el-tree
                    :data="targetData"
                    show-checkbox
                    default-expand-all
                    node-key="id"
                    ref="targetTree"
                  
                    highlight-current
                    @check="targetCheck"
                    @node-expand="targetExpand"
                    @node-click="targetClick"
                    :props="defaultProps">
                </el-tree>
            </el-card>
        </el-col>
    </el-row>
</template>
<script>
export default {
        name: 'mytreeTransfer',
        props: ["defaultProps", "sourceData", "targetData"],
        data() {
            return {
                s_AllChecked: false,
                s_disabled: false,
                s_indeterminate: false,
                l_mutilCk:true,
                t_AllChecked: false,
                t_indeterminate: false,
                t_disabled: false,
                r_mutilCk:true,
                create_tree:{},
                isOnly:false,
            }
        },
        methods: {
            targetClick(data,node,com){this.$emit("target_click",data,node,com)},
            sourceClick(data,node,com){this.$emit("source_click",data,node,com)},
            targetExpand(data,node,com){ this.$emit("target_expand",data,node,com)},
            sourceExpand(data,node,com){ this.$emit("source_expand",data,node,com)},
            s_checkAllChange(args) {
                this.s_AllChecked = args;
                this.checkAll(this.sourceData, args, 'source');
                this.s_indeterminate = false;
            },
            t_checkAllChange(args) {
                this.t_AllChecked = args;
                this.checkAll(this.targetData, args, 'target');
                this.t_indeterminate = false;
            },
            targetLoad(node, resolve){
                // console.log(node);
            },
            sourceCheck(data, checked) {
                this._sourceCheckAll();
                this.isDisabledArrow();
                this.$emit("source-check", { data, checked })
            },
            sourceCheckChange(data, checked, indeterminate) {
                this.$emit("source-check-change", {data,checked,indeterminate})
            },
            _sourceCheckAll() {
               this.checkAllButtonStatus('sourceTree');
            },
            targetCheck(data, checked) {
                this._tagetCheckAll();
                this.isDisabledArrow();
                this.$emit("target-check", { data, checked})
            },
            isDisabledArrow(){
               let targetTree=this.$refs.targetTree.getCheckedNodes().length;
                let sourceTree=this.$refs.sourceTree.getCheckedNodes().length;
                this.l_mutilCk= (targetTree>0)?false:true;
                this.r_mutilCk= (targetTree<2&&sourceTree>0)?false:true;
            },
 
            targetCheckChange(data, checked, indeterminate) {
                this.$emit("target-check-change", { data, checked, indeterminate})
            },
            _tagetCheckAll() {
               this.checkAllButtonStatus('targetTree');
            },
            checkAllButtonStatus(args='sourceTree'){
                let banxuan = this.$refs[args].getHalfCheckedNodes();
                let checknode = this.$refs[args].getCheckedNodes();
                let isAllCk= (banxuan.length == 0 && checknode.length > 0);
                let isIndeterminate= banxuan.length > 0 ? true : false;
                if(args=='sourceTree'){
                     this.s_AllChecked =isAllCk
                     this.s_indeterminate =isIndeterminate;
                }else{
                    this.t_AllChecked = isAllCk;
                    this.t_indeterminate = isIndeterminate;
                }
            },
            //左箭头 移除事件
            detach() {
                let sourceTree = this.$refs.sourceTree;
                let targetTree = this.$refs.targetTree;
                let sourceCurrent = sourceTree.getCheckedNodes();
                let targetCurrent = targetTree.getCheckedNodes();
                let havaChild=targetCurrent.filter(item=>item.hasOwnProperty('children'))
                let noChild=targetCurrent.filter(item=>!item.hasOwnProperty('children'))
                targetCurrent.forEach(item=>{
                      this.deepDisableFn(this.sourceData, item.id, false);
                      targetTree.remove(item);
                })
                this.$refs.sourceTree.setCheckedKeys(targetCurrent.map(item=>item.id));
                this.$emit("detach", targetCurrent);
            },
            //右箭头 穿梭事件
            shuttle() {
                //禁用左侧数据同时判断右侧结构
                let sourceTree = this.$refs.sourceTree;
                let targetTree = this.$refs.targetTree;
                let sourceCurrent = sourceTree.getCheckedNodes(false,false);
                let targetCurrent = targetTree.getCheckedNodes();
               if (sourceCurrent.length > 0) {
                     let haveChild=[],notChild=[];
                 if(!this.isOnly){
                     sourceCurrent.forEach(item => {
                         let newItem=JSON.parse(JSON.stringify(item));
                         if(newItem.hasOwnProperty('children'))  haveChild.push(newItem);
                         else notChild.push(newItem);
                         this.deepDisableFn(this.sourceData, item.id, true);
                     });
                     haveChild.forEach(element=>{
                       let obj=this.createTree(element,notChild);
                         element=obj.element;
                         notChild=obj.noC;
                     });
                     let newArray=[].concat(haveChild);
                      for (var i = 0; i < newArray.length; i++) {
                          for (var j = 0; j < newArray[i].children.length; j++) {
                              newArray.forEach((item,index)=>{
                                  if(newArray[i].children[j].id==item.id){
                                      haveChild.splice(haveChild.indexOf(item),1)
                                  }
                              })
                          }
                      }
                      newArray=[];
                 }else{
                     sourceCurrent.forEach(item => {
                         let newItem=JSON.parse(JSON.stringify(item));
                         delete newItem.children;
                         notChild.push(newItem);
                         this.deepDisableFn(this.sourceData, item.id, true);
                     });
                 }
 
                   let meryAry=[...notChild,...haveChild];
                   if (targetCurrent.length > 0)meryAry.forEach(item=> targetTree.append(item,targetCurrent[0].id))   ; //targetTree.updateKeyChildren(targetCurrent[0].id, meryAry);
                   else meryAry.forEach(item=> this.targetData.push(item));
                   this.$refs.sourceTree.setCheckedKeys([]);
 
                   // setTimeout(()=>{ meryAry.forEach(item=>   this.$refs.targetTree.setCheckedKeys([item.id]))},100)
               }
                this.$emit("shuttle", sourceCurrent);
            },
            createTree(element,noC){
                  let newNoC=[],obj={};
                 noC.forEach((item,index)=>{
                            delete item.disabled;
                            if(item.id==element.id) noC.splice(noC.indexOf(item),1);
                   })
                 delete element.disabled;
                 if(element.hasOwnProperty('children')){
                     element.children.forEach(nodeItem=>{
                        let obj=this.createTree(nodeItem,noC);
                        nodeItem=obj.element
                        noC=obj.noC;
                     })
                 }
                return {element,noC};
            },
            deepDisableFn(treeData, id, bool) {
                for (let i = 0; i < treeData.length; i++) {
                    if (treeData[i].id == id) {
                        treeData[i].disabled = bool;
                        break;
                    } else {
                        if (treeData[i].hasOwnProperty("children")) {
                            this.deepDisableFn(treeData[i].children, id, bool);
                        }
                    }
                }
            },
 
            targetPut(id, data,bool=true){
                let tree=this.$refs.targetTree;
                  tree.append(data,id);
                  if(bool) setTimeout(()=>{tree.setCheckedKeys([id])},100);
 
            },
            sourcePut(id, data,bool=true){
                 let tree=this.$refs.sourceTree;
                tree.append(data,id);
                 if(bool) setTimeout(()=>{tree.setCheckedKeys([id])},100);
            },
            verdictAllDisable(treeData) {
                let bool = true;
                for (let i = 0; i < treeData.length; i++) {
                    if (treeData[i].disabled != true) {
                        bool = false
                        break;
                    }
                    if (treeData[i].hasOwnProperty("children") && bool) {
                        bool = this.verdictAllDisable(treeData[i].children);
                    }
                }
                return bool;
            },
 
            checkAll(treeData, bool, type = 'source') {
                console.log("调用选中",treeData, bool, type);
                for (let i = 0; i < treeData.length; i++) {
                    if (treeData[i].disabled != true) {
                        if (type == 'source') this.$refs.sourceTree.setChecked(treeData[i].id, bool);
                        else this.$refs.targetTree.setChecked(treeData[i].id, bool);
                        if (treeData[i].hasOwnProperty("children")) {
                            this.checkAll(treeData[i].children, bool, type);
                        }
                    }
                }
            }
        }
    }
</script>
<style scoped>
/deep/ .el-tree-node>.el-tree-node__children{
    overflow: auto;
}
/deep/ .el-col-11{
    height:650px;
}
/deep/ .el-card {
    height:100%;
}
/deep/ .el-tree{
    height:650px;
    overflow:overlay;
}
.switch{
    margin-left:10px;
}
.w-title em{
    font-size:12px;
    font-style:normal;
    margin-left:5px;
}
</style>