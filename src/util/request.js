import axios from 'axios'
import {
  Message
} from 'element-ui'


axios.defaults.headers['token'] = '1ae9b3ed27febf8edf80ddf757fa2754'
// const API_URL= process.env.NODE_ENV==='development'?'http://192.168.9.190:8001/':'/api'
// const API_URL= process.env.NODE_ENV==='development'?'http://111.231.106.247:8001/':'/api'
const instances = axios.create({
  // baseURL: 'http://192.168.3.121:8002/',
  // baseURL: 'http://192.168.3.214:2223/',
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 8000,
  withCredentials: false
})
// 请求拦截器
instances.interceptors.request.use(request => {
  request.headers['Authorization'] = 'Bearer afa5997a-3666-458a-a71c-8f5ca2e4c28c'
  request.headers['Accept-Language'] = 'zh-CN,zh'
  // if (request.method == 'post') {
  //   // request.data=Encrypt(JSON.stringify(request.data))
  //   // const jiami11 = Encrypt(JSON.stringify(request.data))
  //   // console.log('加密后的post', request.data, jiami11)
  // }

  return request
}, error => {
  return Promise.reject(error)
})
// 相应拦截器
instances.interceptors.response.use(response => {
  // 解密处理
  if (typeof (response.data) === 'string') {
    return Promise.resolve(response.data)
  } else {
    // 正常接口调用
    if (response.status == 200) {
      if (response.data.ret === 'ERROR') {
        if (response.data.msg != '无效文献id!') {
          Message.info(response.data.msg)
        }
      }
      return Promise.resolve(response.data)
    } else {
      return Promise.reject(Response)
    }
  }
}, error => {
  Message.warning('请求超时,请稍后再试', error)
  return Promise.reject(error)
})

export default instances
