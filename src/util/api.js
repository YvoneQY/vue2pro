import request from '@/util/request'

// 获取地图
export function getMap(data) {
  return request.get('/system/mapInfo/findById?idx=' + data)
}

// 获取地图图片
export function getMapImage(url) {
  return request.get(url)
}

// 地图树
export function getMapTree() {
  return request.post('/system/mapInfo/maptree')
}


// 获取历史轨迹详情
export function getHistoryInfoDetail(data) {
  return request.post('/system/history/playHistory', data)
}

export function getCameraLayerList(query){
  return request({
    url: '/system/cameraConfig/findList?layerId=' + query,
    method: 'get'
  })
}

// 根据摄像头的idx获取单个摄像头的GeoJson数据
export function getSingleCameraGeoJson(data) {
  return request.get('/system/cameraConfig/findByIdCameraGeoJson?idx=' + data)
}

//根据字典类型查询字典数据信息
export function getDicts(dictType) {
  return request({
    url: '/system/dict/data/type/' + dictType,
    method: 'get'
  })
}
// 一键撤离
export function oneKeyOut(data) {
  return request({
    url: '/socket/display/oneKeyOut',
    method: 'post',
    data: data
  })
}

/**
 * 获取所有围栏数据内容
 * type：all:所有围栏  simple：单个围栏  other：其他类型围栏
 *  
 */
export function allFenceLyaer(data) {

  if (data.type) {
    return request({
      url: '/system/fenceInfo/findListByFenceTypeGeoJson?disable=layer,temporary&layerId=' + data.mapId + '&type=' + data.type,
      method: 'GET'
    })
  } else {
    //请求所有围栏数据
    return request({
      url: '/system/fenceInfo/findListByFenceTypeGeoJson?disable=layer,temporary&layerId=' + data.mapId,
      method: 'GET'
    })
  }
}

// 通过围栏id获取单个围栏的数据
export function getSingeFence(query) {
  return request({
    url: '/system/fenceInfo/findByIdGeoJson?idx=' + query,
    method: 'get'
  })
}
export function getAllFence(query) {
  return request({
    url: '/system/fenceInfo/findListByFenceTypeGeoJson?disable=layer,temporary&layerId=' + query,
    method: 'get'
  })
}

export function getTypeFence(data, type) {

  if (type == 'all') {
    //请求所有围栏数据
    return request({
      url: '/system/fenceInfo/findListByFenceTypeGeoJson?disable=layer,temporary&layerId=' + data.mapId,
      method: 'GET'
    })
  } else if (type == 'simple') {
    return request({
      url: '/system/fenceInfo/findByIdGeoJson?idx=' + query,
      method: 'get'
    })
  }else{
    
  }

}

// 获取所有的围栏名称
export function getLayerFenceDataList(query) {
  return request({
    url: '/system/fenceInfo/findListByFenceType?disable=layer,temporary&layerId=' + query,
    method: 'get'
  })
}


// 获取围栏列表
export function getLayerFenceList(data) {
  return request.get('/system/fenceInfo/findListByFenceType?disable=layer&layerId=' + data)
}














const displaySearchUrl = ''
/**
 * x物料信息
 */
export function materialAll(data) {
  return request({
    url: '/system/material/findPage',
    method: 'post',
    data: data
  })
}

/**
 * 物料修改保存
 */
export function materialSaveEdit(data) {
  return request({
    url: '/system/material/save',
    method: 'post',
    data: data
  })
}

/**
 * 物料删除
 */
export function materailDelete(data) {
  return request({
    url: '/system/material/delete',
    method: 'post',
    data: data
  })
}

/**
 * 分页获取物料信息
 */
export function materialTypeList(data) {
  return request({
    url: '/system/materialType/findPage',
    method: 'post',
    data: data
  })
}

/**
 * 获取所有类型
 */
export function resourceTypeAll() {
  return request({
    url: '/system/resourceType/findListMaterialType',
    method: 'get'
  })
}

/**
 * 分页所有类型列表
 */
export function resourceTypeList(data) {
  return request({
    url: '/system/resourceType/findPage',
    method: 'post',
    data: data
  })
}

/**
 * 保存修改所有类型
 */
export function resourceTypeSaveEdit(data) {
  return request({
    url: '/system/resourceType/save',
    method: 'post',
    data: data
  })
}

/**
 * 删除所有类型
 */
export function resourceTypeDelete(data) {
  return request({
    url: '/system/resourceType/delete',
    method: 'post',
    data: data
  })
}

/**
 * 人员管理模块
 */

// 获取部门树
export function getDeptTree() {
  return request.post('/system/department/tree')
}

// 获取全部职员
export function staffList(data) {
  return request.post('/system/resource/findPageStaff', data)
}

// 获取全部部门
export function deptList() {
  return request.post('/system/department/list')
}

// 添加或修改部门
export function saveAndEditDept(data) {
  return request.post('/system/department/save', data)
}

// 删除部门树
export function deleteDept(data) {
  return request.post('/system/department/delete', data)
}

// 保存和修改
export function saveAndEditStaff(data) {
  return request.post('/system/resource/save', data)
}

// 删除职员
export function deleteStaff(data) {
  return request.post('/system/resource/delete', data)
}


/**
 * 围栏配置管理
 */

// 添加fence
export function addFence(data) {
  return request.post('/system/fenceInfo/save', data)
}

// 获取fence列表
export function fenceList(data, id) {
  return request.get('/system/fenceInfo/findListByFenceType?fenceType=' + data + '&layerId=' + id)
}

// 获取fence列表
export function fencePageList(data) {
  return request.post('/system/fenceInfo/findPage', data)
}

// 删除fence
export function deleteFence(data) {
  return request.post('/system/fenceInfo/delete', data)
}

// 根据围栏id获取围栏信息
export function fenceOneInfo(data) {
  return request.get('/system/fenceInfo/findById?idx=' + data)
}

// 获取单个围栏
export function getFence(data) {
  return request.post('/system/realTimePosition/getFence', data)
}

// 获取区域围栏内移动轨迹数据
export function getFenceHistoryDisplayData(data) {
  return request.post('/system/history/areaHistory', data)
}

// 获取热力图数据(聚合版本)
export function getPosDataEx(data) {
  return request.post('/system/dataHeatMapInfo/afterAggregation', data)
}

// 获取围栏对应的告警列表
export function alarmFenceList(data) {
  return request.get('/system/configAlarm/findList?fenceId=' + data)
}

// 获取声光报警器配置列表
export function getAlertorLists(param) {
  return request.post('/system/alertorConfig/findList', param)
}

// 根据主键查询声光报警器配置
export function getAlertorInfo(param) {
  return request.get('/system/alertorConfig/findById?idx=' + param)
}

// 添加摄像头区域
export function addAlertor(param) {
  return request.post('/system/alertorConfig/save', param)
}

// 删除摄像头区域
export function deleteAlertor(param) {
  return request.post('/system/alertorConfig/delete', param)
}

// 获取摄像头列表
export function getLayerCameraList(data) {
  return request.get('/cameraConfig/findList?layerId=' + data)
}

// 获取摄像头列表GeoJson数据
export function getLayerCameraListGeoJson(data) {
  return request.get('/cameraConfig/findListCameraGeoJson?layerId=' + data)
}

// 根据摄像头的idx获取单个摄像头的拍照图片返回图片链接
export function getSingleCameraPhoto(data) {
  return request.get('/cameraConfig/photograph?idx=' + data)
}

// 隧道版本中获取图层中现有人员详细列表
export function getCurrentLayerDetail(data) {
  return request.get(displaySearchUrl, '/system/display/layerDetail?layerId=' + data)
}

/**
 * 获取部门的围栏列表
 */
export function getDeptsFence() {
  return request.post('/system/department/list')
}

/**
 * 获取目前所有数据类型
 */
export function loadType() {
  return request.get('/system/resourceType/findList')
}

/**
 *
 */
export function FenceAjaxLayerId(fenceUrl) {
  return request.get(fenceUrl)
}

/**
 * 添加访客
 */
export function addCeller(data) {
  return request.post('/system/visitor/save', data)
}

// 根据部门的ID过去部门中对应的人员等信息
export function getDeptDetail(data) {
  return request.get('/system/resource/findList?departmentId=' + data)
}

export function getAllDeptDetail() {
  return request.get('/system/resource/findList')
}

/**
 * 获取访客列表
 */
// export function visitorList() {
//   return request.get('/system/visitor/findPage')
// }
export function visitorList(query) {
  return request({
    url: '/system/visitor/findPage',
    method: 'get',
    params: query
  })
}

/**
 * 解绑标签
 */
export function removeBinding(data) {
  return request.post('/system/visitor/unbindingTag', data)
}

/**
 * 根据身份证号码查询访客信息
 */
export function getCellerInfoByCardID(data) {
  return request.get('/system/resource/findList?resourceId=' + data)
}

// 作废 获取身份证文本类型数据
export function getIDCardInfo(data) {
  return request.get('/system/IDCardRead/readIdCard?type=' + data)
}

// 查询来访纪录
export function getCellerFindPage(data) {
  return request.post('/system/reportVisitor/findPage', data)
}

/**
 * 获取告警列表数据
 */
export function getListData(data) {
  return request.post('/system/reportAlarm/findPage', data)
}

// export function getListData(query) {
//   return request({
//     url: '/system/reportAlarm/findPage',
//     method: 'get',
//     params: query
//   })
// }

export function confirmAlarm(data) {
  return request.post('/system/reportAlarm/confirm', data)
}

// 获取未确认告警数量
export function getUnprocessedNum(param) {
  return request.get('/system/reportAlarm/findStatisticsUnprocessed?key=' + param)
}

// 获取告警列表
export function AlarmList(data) {
  return request.post('/system/configAlarm/findPage', data)
}

// 添加告警
export function addAlarm(data) {
  return request.post('/system/configAlarm/save', data)
}

// 获取职员树形结构包含部门
export function staffTrees(data) {
  return request.post('/system/resource/tree', data)
}

// 获取单个告警任务
export function fenceOneAlarm(data) {
  return request.get('/system/configAlarm/findById?idx=' + data)
}

// 删除告警任务
export function alarmDelete(data) {
  return request.post('/system/configAlarm/delete', data)
}

// 配置报警标签
export function getTableData(param) {
  return request.post('/system/configTagAlarm/findList', param)
}

export function saveAlarmConfig(param) {
  return request.post('/system/configTagAlarm/save', param)
}

export function deleteAlarmConfig(param) {
  return request.post('/system/configTagAlarm/delete', param)
}

/**
 * 地图管理模块
 */



// 添加和修改地图
export function saveAndEditMap(data, config) {
  return request.post('/system/mapInfo/save', data, config)
}

// 删除地图
export function deleteMap(data) {
  return request.post('/system/mapInfo/delete', data)
}

// 添加地图节点
export function addMapNode(data) {
  return request.post('/system/mapInfo/nodeSave', data)
}

// 获取地图信息/mapInfo/findById
export function mapInfo(data) {
  return request.get(data)
}

// 获取默认地图
export function mapDefault() {
  return request.get('/system/mapInfo/findDefaultMap')
}

/**
 * Fuser配置管理
 */

// 获取fuser列表
// export function fuserList() {
//   return request.post('/system/fuser/findPage')
// }
export function fuserList(query) {
  return request({
    url: '/system/fuser/findPage',
    method: 'get',
    params: query
  })
}

// 添加和修改Fuser
export function saveAndeEditFuser(data) {
  return request.post('/system/fuser/save', data)
}

// 删除fuser
export function deleteFuser(data) {
  return request.post('/system/fuser/delete', data)
}

// 重启fuser（后台是wogi模块）
export function rebootFuser(url, data) {
  return request.post(url, '/system/manageFuser/reboot', data)
}

// fuser数据输出设置（后台是wogi模块）
export function dataOutputFuser(url, data) {
  return request.post(url, '/system/manageFuser/dataOutput', data)
}

// /**基站管理 */4个接口作废
// export function getAnchorList (data) {
//   return request.post("/manageAnchorRt/findPage",data);
// }

// // 操作基站
// export function operationAnchor (data) {
//   return request.post('/system/manageAnchorRt/operation',data);
// };

// //标签管理
// export function getTagList (data){
//   return request.post("/manageTagRt/findPage",data);
// }

// // 操作标签
// export function operationTag(data){
//   return request.post('/system/manageTagRt/operation',data);
// };

// 获取历史轨迹的列表
export function getHistoryList(data) {
  return request.post('/system/history/findHistoryN', data)
}

// 获取历史轨迹详情(聚合版本)
export function getHistoryInfoDetailEx(data) {
  // return request.post( "/history/playHistory", data);
  return request.post('/system/trackCleaning/findHistoryTrack', data)
}

// 获取历史的搜索条件
export function getHistorySearchInfo(data) {
  return request.post('/system/searchHistory/findPage', data)
}

/**
 * 文件下载
 * @param {*} url 下载路径
 * @param {*} filename 下载文件名
 * @returns
 */
export function downloadFile(url, filename = `${new Date().getTime()}.xlsx`) {
  return request.get(url, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    responseType: 'blob'
  }).then((data) => {
    const content = data
    const blob = new Blob([content])
    if ('download' in document.createElement('a')) {
      const elink = document.createElement('a')
      elink.download = filename
      elink.style.display = 'none'
      elink.href = URL.createObjectURL(blob)
      document.body.appendChild(elink)
      elink.click()
      URL.revokeObjectURL(elink.href)
      document.body.removeChild(elink)
    } else {
      navigator.msSaveBlob(blob, filename)
    }
  }).catch((r) => {
    console.error(r)
  })
}

/**
 * 文件上传--追加导入
 * @param {*} data
 * @returns
 * /resource/importAppend
 */
export function addFile(urlPath, data, config) {
  return request.post(urlPath, data, config)
}

/**
 * 文件上传--覆盖导入
 * @param {*} data
 * @returns
 * /resource/importReplace
 */
export function coverFile(urlPath, data, config) {
  return request.post(urlPath, data, config)
}

// 获取职员树形结构包含部门
export function staffTree(data) {
  return request.post('/system/resource/tree', data)
}

// 添加考勤
export function addAttend(data) {
  return request.post('/system/configCheck/save', data)
}

// 添加考勤fence
export function addAttendFence(data) {
  return request.post('/system/fenceInfo/save', data)
}

// 获取考勤列表
export function AttendFenceList(data) {
  return request.post('/system/configCheck/findPage', data)
}

// 获取围栏对应的考勤列表
export function attendFenceList(data) {
  return request.get('/system/configCheck/findList?fenceId=' + data)
}

// 获取单个考勤任务
export function fenceOneCheck(data) {
  return request.get('/system/configCheck/findById?idx=' + data)
}

// 删除考勤任务
export function checkDelete(data) {
  return request.post('/system/configCheck/delete', data)
}

/**
 * 巡检配置
 */

// 获取巡检任务列表
export function inspectionList(data) {
  return request.post('/system/configPolling/findPage', data)
}

// 添加巡检
export function addPolling(data) {
  return request.post('/system/configPolling/save', data)
}

// 删除巡检任务
export function deletePolling(data) {
  return request.post('/system/configPolling/delete', data)
}

// 查询某一条巡检任务
export function findOnePolling(data) {
  return request.get('/system/configPolling/findById?idx=' + data)
}
// 获取摄像头列表
export function CameraList() {
  return request.get('/system/cameraConfig/findList')
}

/**
 * 获取巡检任务列表
 */
export function getInspectionList() {
  return request.get('/system/configPolling/findList')
}

// 获取巡检任务完成情况列表
export function getList(data) {
  return request.post('/system/reportPolling/findPage', data)
}

// 获取巡检人员列表
export function getInspectionPeopleList() {
  return request.get('/system/resource/list')
}

// 查询巡检人员的巡检情况
export function getPeopleList(data) {
  return request.post('/system/reportPolling/findPageByPersonal', data)
}
/**
 * 传感器配置管理
 */

// 添加传感器设置
export function AddGasSensor(data) {
  return request.post('/system/gasSensor/save', data)
}
// 传感器列表分页
export function GasSensorList(data) {
  return request.post('/system/gasSensor/findPage', data)
}
// 删除传感器设置
export function GasSensorDel(data) {
  return request.post('/system/gasSensor/delete', data)
}

// 传感器报表
export function GasSensorReport(data) {
  return request.post('/system/reportGasSensor/findList', data)
}

// 删除摄像头区域delCamera
export function delCamera(data) {
  return request.post('/system/cameraConfig/deleteCameraFence', data)
}

// 获取摄像头列表
export function cemeraList(data) {
  return request.post('/system/cameraConfig/findPage', data)
}

// 添加摄像头区域addCamera
export function addCamera(data) {
  return request.post('/system/cameraConfig/save', data)
}

// 获取单个摄像头信息
export function cameraOne(data) {
  return request.get('/system/cameraConfig/findById?idx=' + data)
}

// 按图层获取摄像头列表
export function cameraLayerList(data) {
  return request.get('/system/cameraConfig/findList?layerId=' + data)
}

// 删除摄像头信息
export function delCameraInfo(data) {
  return request.post('/system/cameraConfig/delete', data)
}

/**
 * 热力图模块
 *
 */

// 获取热力图数据
export function getPosData(data) {
  return request.post('/system/dataHeatMapInfo/findList', data)
}
// 搜索资源所在层
export function searchResourceInLayer(name) {
  return request.get(`/system/display/findDisplay?resourceId=${name}`)
}
