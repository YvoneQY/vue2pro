import axios from 'axios' // 创建axios实例
const service = axios.create({
    // axios中请求配置有baseURL选项，表示请求URL公共部分
    // baseURL: process.env.VUE_APP_BASE_API,
    //  baseURL: 'http://192.168.3.214:2223/stage-api/',
     baseURL: 'http://192.168.3.214:2223/',
    // 超时
    timeout: 13000
})

// request拦截器
service.interceptors.request.use(config => {
    // 是否需要设置 token
    config.headers['Authorization'] = 'Bearer 5b078715-1501-40c5-9789-edc05fce8d36' 
    // const isToken = (config.headers || {}).isToken === false
    // if (getToken() && !isToken) {
    //   config.headers['Authorization'] = 'Bearer ' + getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    //   switch (Cookie.get('langs')) {
    //     case 'zh':
    //       config.headers['Accept-Language'] = 'zh-CN,zh'// 让每个请求携带自定义token 请根据实际情况自行修改
    //       break
    //     case 'en':
    //       config.headers['Accept-Language'] = 'en-US,en'// 让每个请求携带自定义token 请根据实际情况自行修改
    //       break
    //     case 'tw':
    //       config.headers['Accept-Language'] = 'zh-TW,zh'// 让每个请求携带自定义token 请根据实际情况自行修改
    //       break
    //   }
    return config
})



// 响应拦截器
service.interceptors.response.use(res => {
        // 未设置状态码则默认成功状态
        const code = res.data.code || 200

        if (code === 400) {
            return res.data
        } else if (code !== 200) {

            return Promise.reject('error')
        } else {
            return res.data
        }
    },
    error => {
        console.log('err' + error)
        let {
            message
        } = error
        if (message == 'Network Error') {
            message = '后端接口连接异常'
        } else if (message.includes('timeout')) {
            message = '系统接口请求超时'
        } else if (message.includes('Request failed with status code')) {
            message = '系统接口' + message.substr(message.length - 3) + '异常'
        }
        return Promise.reject(error)
    }
)

export default service
