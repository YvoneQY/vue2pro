// import '@/utils/css/ol.css';
import 'ol/ol.css'
import {
  Map,
  View
} from 'ol'
import TileLayer from 'ol/layer/Tile'
import ImageLayer from 'ol/layer/Image'
import Static from 'ol/source/ImageStatic'
import Projection from 'ol/proj/Projection'
import OSM from 'ol/source/OSM'
import {
  defaults as defaultControls
} from 'ol/control'
import {
  closestOnCircle,
  createStringXY
} from 'ol/coordinate'
import MousePosition from 'ol/control/MousePosition'
import {
  getCenter
} from 'ol/extent'
import {
  Draw,
  Modify,
  Snap,
  Select,
  Translate,
  Interaction,
  defaults as defaultInteractions,
  DragRotateAndZoom
} from 'ol/interaction.js'
import { altKeyOnly, click, pointerMove } from 'ol/events/condition'
import {
  Style,
  Icon,
  Text,
  Fill,
  Stroke,
  Circle
} from 'ol/style'
import Overlay from 'ol/Overlay'
import {
  Vector as VectorLayer,
  Image
} from 'ol/layer.js'
import {
  Vector
} from 'ol/source.js'
import {
  GeoJSON
} from 'ol/format.js'
import Feature from 'ol/Feature'
import { Circle as CircleFeature } from 'ol/geom'
import {
  baseUrl
} from '@/utils/global'
import Cookie from 'js-cookie'

import {
  getLayerFenceDataList,
  getSingeFence,
  loadType,
  getAllFence,
  getAllCameraFence,
  getCameraList,
  getCameraLayerList,
  cameraOne
} from '@/api/system/historyDisplayInfo.js'

let _this = null // 用来存储Vue实例this
let _iMap = null
let _iMap2 = null
let _dPR
let _dPR2
let _zero
let _Style
let OverlayPopup
let measureTooltipElement
let measureTooltip
let tagTypes
var mapZoom = 2
var FenceSource = null
var FenceLayer = null
let cameraSource = null
let cameraLayer = null

let cameraSource2 = null
let cameraLayer2 = null

const cameraSelect = null

let Popup2 = null

var FenceSource2
var FenceLayer2
// 传递this对象
function sendThis (vm) {
  _this = vm
}

function Load_Map (url, RealWidth, RealHeight, PixelWidth, PixelHeight, dPR, ZeroPoint, param) {
  _dPR = dPR
  _zero = _TransPixel(ZeroPoint)
  var left = _zero[0]
  var bottom = _zero[1] + (-PixelHeight)
  var right = _zero[0] + PixelWidth
  var top = _zero[1]
  var _Projection = new Projection({
    code: 'EPSG:3857',
    units: 'pixels',
    extent: [left, bottom, right, top]
  })

  _iMap = new Map({
    interactions: defaultInteractions().extend([
      new DragRotateAndZoom()
    ]),
    target: 'map',
    layers: [
      new ImageLayer({
        source: new Static({
          url: url,
          projection: _Projection,
          imageExtent: [left, bottom, right, top]
        })
      })
    ],
    view: new View({
      projection: _Projection,
      center: getCenter([left, bottom, right, top]),
      zoom: 2,
      maxZoom: 8
      // rotation: Math.PI / 2
    }),
    renderer: 'canvas'
  })

  _iMap.on('pointermove', MapPointerMove) // 监听鼠标移动事件
  _iMap.getView().on('change:resolution', calcScale) // 监听地图缩放事件
  calcScale()
  if (param) {
    _iMap.on('click', MapClick) // 监听点击事件
    const element = document.getElementById('popup').cloneNode(true)
    element.style.display = 'block'
    const Popup = new Overlay({
      id: 'popup_',
      element: element,
      positioning: 'center-center',
      position: undefined
    })
    _iMap.addOverlay(Popup)
  }
}

function Load_TrackMap (url, RealWidth, RealHeight, PixelWidth, PixelHeight, dPR, ZeroPoint) {
  _dPR2 = dPR
  const _zero = _TransPixel(ZeroPoint)
  var left = _zero[0]
  var bottom = _zero[1] + (-PixelHeight)
  var right = _zero[0] + PixelWidth
  var top = _zero[1]
  var _Projection = new Projection({
    code: 'EPSG:3857',
    units: 'pixels',
    extent: [left, bottom, right, top]
  })

  _iMap2 = new Map({
    interactions: defaultInteractions().extend([
      new DragRotateAndZoom()
    ]),
    target: 'map2',
    layers: [
      new ImageLayer({
        source: new Static({
          url: url,
          projection: _Projection,
          imageExtent: [left, bottom, right, top]
        })
      })
    ],
    view: new View({
      projection: _Projection,
      center: getCenter([left, bottom, right, top]),
      zoom: 2,
      maxZoom: 8
    })
  })
}

// 坐标函数
function MapPointerMove (evt) {
  if (evt.dragging) {
    return
  }
  var pixel = _iMap.getEventPixel(evt.originalEvent)
  var hit = _iMap.hasFeatureAtPixel(pixel)
  if (hit) {
    _iMap.getTargetElement().style.cursor = 'pointer'
  } else {
    _iMap.getTargetElement().style.cursor = ''
  }
  var coord = _TransMetric_XY(evt.coordinate, 2)
  $('.positiondiv span').html(coord)
}

// 输出坐标点位置
function _TransMetric_XY (c, fix) {
  var X = (c[0] / _dPR).toFixed(fix)
  var Y = (c[1] / _dPR).toFixed(fix) * -1
  var M = [X, Y]
  var M = 'X:' + X + '  ' + 'Y:' + Y
  return M
}
// 坐标（锚点、标签） 转换成像素(米-》像素)
function _TransPixel (c) {
  var PX
  $.each(c, function (i, item) {
    if (item.length == undefined) {
      var X = c[0] * _dPR
      var Y = _validate(c[1]) * _dPR
      PX = [X, Y]
    } else {
      $.each(c, function (i, item) {
        var j, jj
        for (j = 0, jj = item.length; j < jj; ++j) {
          item[j] = [item[j][0] * _dPR, _validate(item[j][1]) * _dPR]
        }
        PX = [item]
      })
    }
  })
  return PX
}

// 坐标（锚点、标签）  转换成米（像素-》米）
function _TransMetric (c) {
  var M = []
  c.forEach(function (item) {
    if (item.length == undefined) {
      var X = (c[0] / _dPR).toFixed(2)
      var Y = _validate((c[1] / _dPR)).toFixed(2)
      M = [X, Y]
    } else {
      M.push('[' + [(item[0] / _dPR).toFixed(2), (_validate(item[1]) / _dPR).toFixed(2)] + ']')
    }
  })
  return M
}

function _TransMetric2 (c, fix) {
  var M
  $.each(c, function (i, item) {
    if (item.length == undefined) {
      var X = (c[0] / _dPR).toFixed(fix)
      var Y = _validate((c[1] / _dPR)).toFixed(fix)
      M = [X, Y]
    } else {
      $.each(c, function (i, item) {
        var j, jj
        for (j = 0, jj = item.length; j < jj; ++j) {
          item[j] = '[' + [(item[j][0] / _dPR).toFixed(fix), (_validate(item[j][1]) / _dPR).toFixed(fix)] + ']'
        }
        M = [item]
      })
    }
  })
  return M
}

function _TransMetric3 (c, fix) {
  var M
  $.each(c, function (i, item) {
    if (item.length == undefined) {
      var X = (c[0] / _dPR).toFixed(fix)
      var Y = _validate((c[1] / _dPR)).toFixed(fix)
      M = [X, Y]
    } else {
      $.each(c, function (i, item) {
        var j, jj
        for (j = 0, jj = item.length; j < jj; ++j) {
          item[j] = [(item[j][0] / _dPR).toFixed(fix), (_validate(item[j][1]) / _dPR).toFixed(fix)]
        }
        M = item
      })
    }
  })
  return M
}

function createMeasureTooltip () {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement)
  }
  measureTooltipElement = document.createElement('div')
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure'
  measureTooltip = new Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center'
  })
  _iMap.addOverlay(measureTooltip)
}
// 坐标（电子围栏页面显示标尺）像素-》米
function _TransMetricFence (c) {
  var M = []
  c.forEach(function (item) {
    if (item.length == undefined) {
      var X = (c[0] / _dPR).toFixed(2)
      var Y = (c[1] / _dPR)
      M = [X, Y]
    } else {
      M.push([(item[0] / _dPR).toFixed(2), (-(item[1] / _dPR)).toFixed(2)])
    }
  })
  return '长:' + (parseFloat(M[1][0]) - parseFloat(M[0][0])).toFixed(2) + '宽' + (parseFloat(M[1][1]) - parseFloat(M[2][1])).toFixed(2)
}
// 监听地图缩放事件
function calcScale () {
  mapZoom = _iMap.getView().getZoom()
  const res = _iMap.getView().getResolution()
  const temp = (100 / _dPR) * res
  $('.scalediv span').html(temp.toFixed(2) + 'M')
}
// 取数字的绝对值
function _validate (num) {
  var reg = /^\d+(?=\.{0,1}\d+$|$)/
  if (reg.test(num)) return -(num)
  return Math.abs(num)
}
// 获取目前所有数据类型
function LoadTypeData () {
  tagTypes = []
  loadType().then(data => {
    if (data.code === 200) {
      // 按大类进行分类整理
      const datas = data.data
      for (let i = 0; i < datas.length; i++) {
        const type = datas[i].type
        if (tagTypes[type]) {
          tagTypes[type].push(datas[i])
        } else {
          tagTypes[type] = []
          tagTypes[type].push(datas[i])
        }
      }
    }
  })
}
LoadTypeData()


// 标签样式设置
function TagStyle (f, rontation) {
  let textname = ''
  let iconsrc = ''
  let iconcolor = ''
  textname = mapZoom >= 2 ? f.get('name') : ''
  // 判断标签的类型及工种，用来显示不同的图标和颜色
  if (tagTypes[f.get('type')]) {
    const subtypes = tagTypes[f.get('type')]
    var b = -1
    for (let i = 0; i < subtypes.length; i++) {
      if (subtypes[i].name === f.get('workTypeName')) {
        b = i
        break
      }
    }
    if (b != -1) { // 有这种类型的工种
      iconsrc = '/static/icon/' + subtypes[b].icon + '.png'
      iconcolor = subtypes[b].color
    } else {
      iconsrc = '/static/icon/5ren.png'
      iconcolor = '#409EFF'
    }
  } else {
    // 如果没有这种大类，使用默认图标
    iconsrc = '/static/icon/5ren.png'
    iconcolor = '#409EFF'
  }
  if (f.get('type') == "startVector") {
    iconsrc = '/static/icon/start.png'
    iconcolor = '#409EFF'
  }
  if (f.get('type') == "endVector") {
    iconsrc = '/static/icon/end.png'
    iconcolor = '#fff60e'
  }
  if (!f.get('visible')) {
    return null
  }
  return [
    _Style = new Style({
      image: new Icon({
        src: iconsrc,
        color: iconcolor
      }),
      text: new Text({
        text: textname,
        offsetY: 14,
        fill: new Fill({
          color: '#fff'
        }),
        stroke: new Stroke({
          color: '#000',
          width: 3
        }),
        rotation: rontation
      })
    })
  ]
}

function MapClick (evt) {
  var feature
  if (evt.pixel != undefined) {
    feature = _iMap.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
      return feature
    })
  } else {
    feature = evt
  }
  if (feature) {
    const type = feature.get('type')
    if (type === 'staff' || type === 'car' || type === 'material' || type === 'signange' || type === 'workingHoursOrder' || type === 'bucket') {
      _Popup(feature, feature.getGeometry().getCoordinates())
    } else if (type === 'Camera') {
      popupCamera(feature, feature.getGeometry().getCoordinates())
    }
  }
}

function removeOverlay_ () {
  if (Popup2 != null) {
    _iMap.removeOverlay(Popup2)
    Popup2 = null;
  }
}
function popupCamera (f, pos) {
  if (Popup2 != null) {
    _iMap.addOverlay(Popup2)
    Popup2.setPosition(pos)
    const closer = $(Popup2.getElement()).find('#popup-closer2')
    closer.click(function () {
      Popup2.setPosition(undefined)
      this.blur()
      _this.$refs.video0.closePlayer()
      return false
    })
    _this.playUrl = 'ws://' + window.g.IP + ':' + window.g.cameraPort + '/live?url=' + f.get('subStream')
    _this.handlePlay()
  } else {
    const element2 = document.getElementById('popup2')
    element2.style.display = 'block'
    Popup2 = new Overlay({
      element: element2,
      positioning: 'center-center',
      position: undefined,
      stopEvent: false,
      insertFirst: false
    })
    _iMap.addOverlay(Popup2)
    const closer = $(Popup2.getElement()).find('#popup-closer2')
    closer.click(function () {
      Popup2.setPosition(undefined)
      this.blur()
      _this.$refs.video0.closePlayer()
      return false
    })
    Popup2.setPosition(pos)
    if (f) {
      // var c = '<li>视屏</li>'
      // content.html(c)
      _this.playUrl = 'ws://' + window.g.IP + ':' + window.g.cameraPort + '/live?url=' + f.get('subStream')
      _this.handlePlay()
    } else {
      Popup2.setPosition(undefined)
    }
  }
}

function _Popup (f, pos) {
  OverlayPopup = _iMap.getOverlayById('popup_')
  const content = $(OverlayPopup.getElement()).find('#popup-content')
  const closer = $(OverlayPopup.getElement()).find('#popup-closer')
  const trackHistory = $(OverlayPopup.getElement()).find('#trackHistory')
  trackHistory.on('click', function () {
    _this.isDialog = true
  })
  closer.click(function () {
    OverlayPopup.setPosition(undefined)
    this.blur()
    return false
  })
  OverlayPopup.setPosition(pos)
  OverlayPopup.set('idx_', f.getId())
  _this.featureId = f.getId()
  if (f) {
    var c
    switch (f.get('type')) {
      case 'staff':
        c = '<li>编号：' + f.get('resourceId') + '</li><li>名称：' + f.get('itemname') + '</li><li>坐标：' + _TransMetric(pos) + '</li>'
        break
      default:
        c = '<li>编号：' + f.get('resourceId') + '</li><li>名称：' + f.get('itemname') + '</li><li>坐标：' + _TransMetric(pos) + '</li>'
        break
    }
    content.html(c)
  } else {
    OverlayPopup.setPosition(undefined)
  }
}

// 更新overlay位置
function updateOverPopupPosition (f, ncoords) {
  const OverlayPopup = _iMap.getOverlayById('popup_')
  if (OverlayPopup.getPosition()) {
    if (f.getId() == OverlayPopup.get('idx_')) {
      const content = $(OverlayPopup.getElement()).find('#popup-content')
      if (f) {
        var c
        switch (f.get('type')) {
          case 'staff':
            c = '<li>编号：' + f.get('resourceId') + '</li><li>名称：' + f.get('itemname') + '</li><li>坐标：' + _TransMetric(ncoords) + '</li>'
            break
          default:
            c = '<li>编号：' + f.get('resourceId') + '</li><li>名称：' + f.get('itemname') + '</li><li>坐标：' + _TransMetric(ncoords) + '</li>'
            break
        }
        content.html(c)
      } else {
        OverlayPopup.setPosition(undefined)
      }
      OverlayPopup.setPosition(ncoords)
    }
  }
}
function FenceStyle (f, r) {
  const name = f.get('name')
  let fillColor, frameColor
  if (f.get('fillColor') == undefined || f.get('fillColor') == 'null') {
    fillColor = 'rgba(' + r + ',0.1)'
  } else {
    fillColor = f.get('fillColor')
  }
  if (f.get('frameColor') == undefined || f.get('frameColor') == 'null') {
    frameColor = 'rgb(' + r + ')'
  } else {
    frameColor = f.get('frameColor')
  }
  return [
    new Style({
      fill: new Fill({
        color: fillColor
      }),
      stroke: new Stroke({
        lineDash: [1, 2, 3, 4, 5, 6],
        color: frameColor,
        width: 2
      }),
      image: new Circle({
        radius: 7,
        fill: new Fill({
          color: '#FF0000'
        })
      }),
      text: new Text({
        text: name,
        font: 'bold 14px Arial',
        textAlign: 'center',
        textBaseline: 'middle',
        overflow: true,
        offsetX: 0,
        offsetY: 0,
        fill: new Fill({
          color: '#FF0000'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 3
        })
      })
    })
  ]
}

// 增加电子围栏
function Load_Fence (Geo) {
  if (FenceLayer != null) {
    _iMap.removeLayer(FenceLayer)
    FenceSource = null
    FenceLayer = null
  }
  FenceSource = new Vector({
    wrapX: false
  })
  FenceLayer = new VectorLayer({
    minResolution: 0,
    maxResolution: _dPR * 1.2,
    source: FenceSource,
    style: function (feature, resolution) {
      const fenceType = feature.get('fencetype')
      if (feature.get('id') == undefined) {
        return FenceStyle(feature, '255, 0, 0')
      }
      if (!(typeof fenceType === 'undefined')) {
        const arr = fenceType.split(',')
        if (arr.length > 1) {
          return FenceStyle(feature, '165,42,42')
        }
      }

      if (fenceType == 'camera') {
        return FenceStyle(feature, '0, 153, 102')
      } else if (fenceType == 'operation') {
        return FenceStyle(feature, '0,153,204')
      } else if (fenceType == 'alarm') {
        return FenceStyle(feature, '255,0,0')
      } else if (fenceType == 'check') {
        return FenceStyle(feature, '255,255,0')
      } else if (fenceType == 'polling') {
        return FenceStyle(feature, '255,165,0')
      } else {
        return FenceStyle(feature, '160,32,240')
      }
    }
  })
  _iMap.addLayer(FenceLayer)
  if (Geo != '') {
    FenceAjax(Geo, FenceSource)
  }
}

// 增加摄像头电子围栏
function Load_CameraFence (Geo) {
  if (FenceLayer != null) {
    _iMap.removeLayer(FenceLayer)
    FenceSource = null
    FenceLayer = null
  }
  FenceSource = new Vector({
    wrapX: false
  })
  FenceLayer = new VectorLayer({
    minResolution: 0,
    maxResolution: _dPR * 1.2,
    source: FenceSource,
    zIndex: 10,
    style: function (feature, resolution) {
      const fenceType = feature.get('fencetype')
      if (feature.get('id') == undefined) {
        return FenceStyle(feature, '255, 0, 0')
      }
      if (!(typeof fenceType === 'undefined')) {
        const arr = fenceType.split(',')
        if (arr.length > 1) {
          return FenceStyle(feature, '165,42,42')
        }
      }

      if (fenceType == 'camera') {
        return FenceStyle(feature, '0, 153, 102')
      } else if (fenceType == 'operation') {
        return FenceStyle(feature, '0,153,204')
      } else if (fenceType == 'alarm') {
        return FenceStyle(feature, '255,0,0')
      } else if (fenceType == 'check') {
        return FenceStyle(feature, '255,255,0')
      } else if (fenceType == 'polling') {
        return FenceStyle(feature, '255,165,0')
      } else {
        return FenceStyle(feature, '160,32,240')
      }
    }
  })
  _iMap.addLayer(FenceLayer)
  if (Geo != '') {
    CameraFenceAjax(Geo, FenceSource)
  }
}

function CameraFenceAjax (Geo, source) {
  getAllCameraFence(Geo).then(res => {
    var format = new GeoJSON()
    if (res.code == 200) {
      if (res.data.length > 0) {
        for (let i = 0; i < res.data.length; i++) {
          if (res.data[i].mark == undefined || res.data[i].mark == 'other') {
            var newFeatures = format.readFeatures(res.data[i])
            newFeatures.forEach(function (f) {
              if (f.get('fencetype') != 'layer' && f.get('fencetype') != 'temporary') {
                var coord = f.getGeometry().getCoordinates()
                f.getGeometry().setCoordinates(_TransPixel(coord))
                f.setId(f.get('id'))
                source.addFeature(f)
              }
            })
          } else {
            const geometryData = res.data[i]
            const circleFeature = new Feature({
              geometry: new CircleFeature(_TransPixel(geometryData.geometry.coordinates[0][0]), _dPR * geometryData.geometry.coordinates[0][1])
            })
            circleFeature.setId(geometryData.id)
            circleFeature.properties = geometryData.properties
            circleFeature.coorRadiu = geometryData.geometry.coordinates[0][1]
            circleFeature.dotOrigin = geometryData.geometry.coordinates[0][0]
            circleFeature.set('name', geometryData.properties.name)
            circleFeature.set('fillColor', geometryData.properties.fillColor)
            circleFeature.set('frameColor', geometryData.properties.frameColor)
            source.addFeature(circleFeature)
          }
        }
      }
    }
  })
}
// 增加电子围栏
function Load_Fence2 () {
  if (FenceLayer2 != null) {
    FenceSource2.clear()
    _iMap.removeLayer(FenceLayer2)
    FenceSource2 = null
    FenceLayer2 = null
  }
  FenceSource2 = new Vector({
    wrapX: false
  })
  FenceLayer2 = new VectorLayer({
    minResolution: 0,
    maxResolution: _dPR * 1.2,
    source: FenceSource2,
    style: function (feature, resolution) {
      const fenceType = feature.get('fencetype')
      if (feature.get('id') == undefined) {
        return FenceStyle(feature, '255, 0, 0')
      }
      if (!(typeof fenceType === 'undefined')) {
        const arr = fenceType.split(',')
        if (arr.length > 1) {
          return FenceStyle(feature, '165,42,42')
        }
      }

      if (fenceType == 'camera') {
        return FenceStyle(feature, '0, 153, 102')
      } else if (fenceType == 'operation') {
        return FenceStyle(feature, '0,153,204')
      } else if (fenceType == 'alarm') {
        return FenceStyle(feature, '255,0,0')
      } else if (fenceType == 'check') {
        return FenceStyle(feature, '255,255,0')
      } else if (fenceType == 'polling') {
        return FenceStyle(feature, '255,165,0')
      } else {
        return FenceStyle(feature, '160,32,240')
      }
    }
  })
  _iMap.addLayer(FenceLayer2)
}
function Load_Camera (mapId) {
  if (cameraLayer != null) {
    _iMap.removeLayer(cameraLayer)
    cameraSource = null
    cameraLayer = null
  }
  cameraSource = new Vector({
    wrapX: false
  })
  cameraLayer = new VectorLayer({
    minResolution: 0,
    maxResolution: _dPR * 1.2,
    source: cameraSource,
    zIndex: 8000,
    className: 'camera',
    style: function (feature) {
      return CameraStyle(feature)
    }
  })
  _iMap.addLayer(cameraLayer)
  if (mapId != '') {
    CameraData(mapId, cameraSource)
  }
}
function Load_Camera2 () {
  if (cameraLayer2 != null) {
    cameraSource2.clear()
    _iMap.removeLayer(cameraLayer2)
    cameraSource2 = null
    cameraLayer2 = null
  }
  cameraSource2 = new Vector({
    wrapX: false
  })
  cameraLayer2 = new VectorLayer({
    minResolution: 0,
    maxResolution: _dPR * 1.2,
    source: cameraSource2,
    zIndex: 8000,
    style: function (feature) {
      return CameraStyle(feature)
    }
  })
  _iMap.addLayer(cameraLayer2)
}
function CameraData (mapId, source) {
  getCameraList(mapId).then(res => {
    const format = new GeoJSON()
    if (res.code == 200) {
      const newFeatures = format.readFeatures(res.data)
      newFeatures.forEach(function (f) {
        var coord = f.getGeometry().getCoordinates()
        f.getGeometry().setCoordinates(_TransPixel(coord))
        f.setId(f.get('idx'))
        source.addFeature(f)
      })
    }
  })
}
function CameraStyle (f) {
  return [
    new Style({
      image: new Icon({
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        offset: [0, 0],
        Size: [f.get('size'), f.get('size')],
        src: '/static/icon/camera.png',
        color: '#409EFF',
        opacity: 1
      }),
      text: new Text({
        text: f.get('cameraName'),
        font: '10px Arial',
        textAlign: 'center',
        textBaseline: 'middle',
        offsetX: 0,
        offsetY: 30 * 2 / 3,
        overflow: true,
        fill: new Fill({
          color: '#fff'
        }),
        stroke: new Stroke({
          color: '#000',
          width: 3
        })
      })
    })
  ]
}

/**
 * AJAX获取电子围栏GeoJson数据
 */
function FenceAjax (Geo, source) {
  getAllFence(Geo).then(res => {
    var format = new GeoJSON()
    if (res.code == 200) {
      if (res.data.length > 0) {
        for (let i = 0; i < res.data.length; i++) {
          if (res.data[i].mark == undefined || res.data[i].mark == 'other') {
            var newFeatures = format.readFeatures(res.data[i])
            newFeatures.forEach(function (f) {
              if (f.get('fencetype') != 'layer' && f.get('fencetype') != 'temporary') {
                var coord = f.getGeometry().getCoordinates()
                f.getGeometry().setCoordinates(_TransPixel(coord))
                f.setId(f.get('id'))
                source.addFeature(f)
              }
            })
          } else {
            const geometryData = res.data[i]
            const circleFeature = new Feature({
              geometry: new CircleFeature(_TransPixel(geometryData.geometry.coordinates[0][0]), _dPR * geometryData.geometry.coordinates[0][1])
            })
            circleFeature.setId(geometryData.id)
            circleFeature.properties = geometryData.properties
            circleFeature.coorRadiu = geometryData.geometry.coordinates[0][1]
            circleFeature.dotOrigin = geometryData.geometry.coordinates[0][0]
            circleFeature.set('name', geometryData.properties.name)
            circleFeature.set('fillColor', geometryData.properties.fillColor)
            circleFeature.set('frameColor', geometryData.properties.frameColor)
            source.addFeature(circleFeature)
          }
        }
      }
    }
  })
}
// 释放围栏容器
function releaseFence () {
  if (FenceSource != null) {
    const old = FenceSource.getFeatures()
    let len = old.length
    while (len > 0) {
      len--
      FenceSource.removeFeature(old[len])
      old.splice(len, 1)
    }
  }
  if (FenceLayer != null) {
    _iMap.removeLayer(FenceLayer)
  }

  FenceSource = null
  FenceLayer = null
}

// 获取围栏资源列表
function getFenceList (mapId) {
  getLayerFenceDataList(mapId).then(res => {
    if (res.code == 200) {
      _this.tableFence = res.data
      _this.tableFence.forEach((val) => {
        val.layerName = null
        val.creator = null
      })
    }
  })
}
// 获取摄像头资源列表
function getCameraList_ (mapId) {
  getCameraLayerList(mapId).then(res => {
    if (res.code == 200) {
      _this.tableGamera = res.data
    }
  })
}

// 通过围栏id加载单个围栏或多个
function addSingleFence (param) {
  if (FenceLayer != null) {
    _iMap.removeLayer(FenceLayer)
    FenceSource = null
    FenceLayer = null
  }
  FenceSource = new Vector({
    wrapX: false
  })
  FenceLayer = new VectorLayer({
    minResolution: 0,
    maxResolution: _dPR * 1.2,
    source: FenceSource,
    zIndex: 1,
    style: function (feature, resolution) {
      const fenceType = feature.get('fencetype')
      if (feature.get('id') == undefined) {
        return FenceStyle(feature, '255, 0, 0')
      }
      if (!(typeof fenceType === 'undefined')) {
        const arr = fenceType.split(',')
        if (arr.length > 1) {
          return FenceStyle(feature, '165,42,42')
        }
      }

      if (fenceType == 'camera') {
        return FenceStyle(feature, '0, 153, 102')
      } else if (fenceType == 'operation') {
        return FenceStyle(feature, '0,153,204')
      } else if (fenceType == 'alarm') {
        return FenceStyle(feature, '255,0,0')
      } else if (fenceType == 'check') {
        return FenceStyle(feature, '255,255,0')
      } else if (fenceType == 'polling') {
        return FenceStyle(feature, '255,165,0')
      } else {
        return FenceStyle(feature, '160,32,240')
      }
    }
  })
  _iMap.addLayer(FenceLayer)
  if (typeof param === 'number') {
    getSingeFence(param).then(res => {
      if (res.data[0].mark == undefined || res.data[0].mark == 'other') {
        var format = new GeoJSON()
        var newFeatures = format.readFeatures(res.data[0])
        newFeatures.forEach(function (f) {
          if (f.get('fencetype') != 'layer' && f.get('fencetype') != 'temporary') {
            var coord = f.getGeometry().getCoordinates()
            f.getGeometry().setCoordinates(_TransPixel(coord))
            f.setId(f.get('id'))
            FenceSource.addFeature(f)
          }
        })
      } else {
        const geometryData = res.data[0]
        const circleFeature = new Feature({
          geometry: new CircleFeature(_TransPixel(geometryData.geometry.coordinates[0][0]), _dPR * geometryData.geometry.coordinates[0][1])
        })
        circleFeature.setId(geometryData.id)
        circleFeature.properties = geometryData.properties
        circleFeature.coorRadiu = geometryData.geometry.coordinates[0][1]
        circleFeature.dotOrigin = geometryData.geometry.coordinates[0][0]
        circleFeature.set('name', geometryData.properties.name)
        circleFeature.set('fillColor', geometryData.properties.fillColor)
        circleFeature.set('frameColor', geometryData.properties.frameColor)
        FenceSource.addFeature(circleFeature)
      }
    })
  } else {
    param.forEach((val) => {
      getSingeFence(val.idx).then(res => {
        if (res.data[0].mark == undefined || res.data[0].mark == 'other') {
          var format = new GeoJSON()
          var newFeatures = format.readFeatures(res.data[0])
          newFeatures.forEach(function (f) {
            if (f.get('fencetype') != 'layer' && f.get('fencetype') != 'temporary') {
              var coord = f.getGeometry().getCoordinates()
              f.getGeometry().setCoordinates(_TransPixel(coord))
              f.setId(f.get('id'))
              FenceSource.addFeature(f)
            }
          })
        } else {
          const geometryData = res.data[0]
          const circleFeature = new Feature({
            geometry: new CircleFeature(_TransPixel(geometryData.geometry.coordinates[0][0]), _dPR * geometryData.geometry.coordinates[0][1])
          })
          circleFeature.setId(geometryData.id)
          circleFeature.properties = geometryData.properties
          circleFeature.coorRadiu = geometryData.geometry.coordinates[0][1]
          circleFeature.dotOrigin = geometryData.geometry.coordinates[0][0]
          circleFeature.set('name', geometryData.properties.name)
          circleFeature.set('fillColor', geometryData.properties.fillColor)
          circleFeature.set('frameColor', geometryData.properties.frameColor)
          FenceSource.addFeature(circleFeature)
        }
      })
    })
  }
}
// 初始化摄像头层
function initCameraLayer () {
  if (cameraLayer != null) {
    _iMap.removeLayer(cameraLayer)
    cameraSource = null
    cameraLayer = null
  }
  cameraSource = new Vector({
    wrapX: false
  })
  cameraLayer = new VectorLayer({
    minResolution: 0,
    maxResolution: _dPR * 1.2,
    source: cameraSource,
    zIndex: 8000,
    className: 'camera',
    style: function (feature) {
      return CameraStyle(feature)
    }
  })
  _iMap.addLayer(cameraLayer)
  // cameraSelect = new Select({
  //   condition: click,
  //   layers: function (e) {
  //     if (e.className_ == "camera") {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   }
  // });
  // _iMap.addInteraction(cameraSelect);
  // cameraSelect.on("select", function (e) {

  // })
}
// 通过id加载单个或多个摄像头
function addSingleCamera (param) {
  if (typeof param === 'number') {
    cameraOne(param).then(res => {
      var format = new GeoJSON()
      var newFeatures = format.readFeatures(res.data)
      newFeatures.forEach(function (f) {
        const coord = f.getGeometry().getCoordinates()
        f.getGeometry().setCoordinates(_TransPixel(coord))
        f.setId(f.get('idx'))
        cameraSource.addFeature(f)
      })
    })
  } else {
    param.forEach((val) => {
      cameraOne(val.idx).then(res => {
        var format = new GeoJSON()
        var newFeatures = format.readFeatures(res.data)
        newFeatures.forEach(function (f) {
          const coord = f.getGeometry().getCoordinates()
          f.getGeometry().setCoordinates(_TransPixel(coord))
          f.setId(f.get('idx'))
          cameraSource.addFeature(f)
        })
      })
    })
  }
}
// 根据围栏id修改单个电子围栏的样式信息
function getFenceById (fenceId, color1, color2, fenceType, fenceName) {
  if (FenceSource == null) {
    _this.$message({
      message: '围栏未被勾选显示'
    })
  }
  if (color1 == null) {
    if (fenceType == 'camera') {
      color1 = 'rgba(0, 153, 102,0.1)'
    } else if (fenceType == 'operation') {
      color1 = 'rgba(0,153,204,0.1)'
    } else if (fenceType == 'alarm') {
      color1 = 'rgba(255,0,0,0.1)'
    } else if (fenceType == 'check') {
      color1 = 'rgba(255,255,0,0.1)'
    } else if (fenceType == 'polling') {
      color1 = 'rgba(255,165,0,0.1)'
    } else {
      color1 = 'rgba(160,32,240,0.1)'
    }
  }
  if (color2 == null) {
    if (fenceType == 'camera') {
      color2 = 'rgba(0, 153, 102,1)'
    } else if (fenceType == 'operation') {
      color2 = 'rgba(0,153,204,1)'
    } else if (fenceType == 'alarm') {
      color2 = 'rgba(255,0,0,1)'
    } else if (fenceType == 'check') {
      color2 = 'rgba(255,255,0,1)'
    } else if (fenceType == 'polling') {
      color2 = 'rgba(255,165,0,1)'
    } else {
      color2 = 'rgba(160,32,240,1)'
    }
  }

  var feature = FenceSource.getFeatureById(fenceId)
  feature.setStyle(new Style({
    fill: new Fill({
      color: color1
    }),
    stroke: new Stroke({
      lineDash: [1, 2, 3, 4, 5, 6],
      color: color2,
      width: 2
    }),
    image: new Circle({
      radius: 7,
      fill: new Fill({
        color: '#FF0000'
      })
    }),
    text: new Text({
      text: fenceName,
      font: 'bold 14px Arial',
      textAlign: 'center',
      textBaseline: 'middle',
      offsetX: 0,
      offsetY: 0,
      fill: new Fill({
        color: '#FF0000'
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 3
      })
    })
  }))
}

export {
  sendThis,
  Load_Map,
  _TransPixel,
  TagStyle,
  updateOverPopupPosition,
  FenceStyle,
  _TransMetric,
  _TransMetric2,
  _TransMetric3,
  _TransMetricFence,
  createMeasureTooltip,
  Load_Fence,
  Load_Fence2,
  Load_Camera,
  Load_Camera2,
  Load_CameraFence,
  addSingleCamera,
  initCameraLayer,
  releaseFence,
  getFenceList,
  getCameraList_,
  addSingleFence,
  getFenceById,
  Load_TrackMap,
  MapClick,
  removeOverlay_,
  FenceSource,
  FenceSource2,
  cameraSource,
  cameraSource2,
  cameraLayer,
  _iMap,
  _iMap2,
  _Style,
  _dPR,
  tagTypes,
}
