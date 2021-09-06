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
import {
    altKeyOnly,
    click,
    pointerMove
} from 'ol/events/condition'
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
import {
    Circle as CircleFeature
} from 'ol/geom'
import $ from 'jquery'

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
function sendThis(vm) {
    _this = vm
}

function Load_Map(url, RealWidth, RealHeight, PixelWidth, PixelHeight, dPR, ZeroPoint, param) {
    _dPR = dPR
    _zero = _TransPixel(ZeroPoint)
    var left = _zero[0]
    var bottom = _zero[1] + (-PixelHeight)
    var right = _zero[0] + PixelWidth
    var top = _zero[1]
    var _Projection = new Projection({
        code: 'EPSG:3857', //SRS 标识符代码，例如 EPSG：4326,web墨卡托wkid3857
        units: 'pixels', //单位
        extent: [left, bottom, right, top] //SRS 的有效性范围。
    })

    _iMap = new Map({
        interactions: defaultInteractions().extend([
            new DragRotateAndZoom()
            /**
         *
         * 允许用户通过在地图上单击和拖动来缩放和旋转地图。 默认情况下，此交互仅限于按住 shift 键时。

此交互仅支持鼠标设备。

并且此交互不包含在默认交互中
         */
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
            center: getCenter([left, bottom, right, top]), //设置视图居中显示
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

function calcScale() {
    mapZoom = _iMap.getView().getZoom()
    const res = _iMap.getView().getResolution()
    const temp = (100 / _dPR) * res
    $('.scalediv span').html(temp.toFixed(2) + 'M')
  }

// 坐标（锚点、标签） 转换成像素(米-》像素)
function _TransPixel(c) {
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


// 取数字的绝对值
function _validate(num) {
    var reg = /^\d+(?=\.{0,1}\d+$|$)/
    if (reg.test(num)) return -(num)
    return Math.abs(num)
}

// 坐标函数
function MapPointerMove(evt) {
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
function _TransMetric_XY(c, fix) {
    var X = (c[0] / _dPR).toFixed(fix)
    var Y = (c[1] / _dPR).toFixed(fix) * -1
    var M = [X, Y]
    var M = 'X:' + X + '  ' + 'Y:' + Y
    return M
}
export {





}
