// 微信JS-SDK使用权限签名中控微服务
const express = require('express')
const request = require('request-promise')
const sign = require('./sign')
const app = express()
app.get('/', function (req, res, next) {
  console.log('请求微信签名中...')
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('X-Powered-By', 'wechat-jsapi-sign')
  res.header('Cache-control', 'no-cache')
  let access_token = ''
  let jsapi_ticket = ''
  let expires_in = 7200
  let appid = req.query.appid ? req.query.appid : ''
  let secret = req.query.secret ? req.query.secret : ''
  let url = req.query.url ? req.query.url : req.protocol + '//' + req.hostname
  if (url) {
    getToken(appid, secret).then((data) => {
      if (!data.errcode) {
        access_token = data.access_token
        expires_in = data.expires_in
      } else {
        console.log('请求微信签名失败。')
        return res.status(400).send(data)
      }
      getTicket(access_token).then((data) => {
        if (!data.errcode) {
          jsapi_ticket = data.ticket
          let result = sign(appid, access_token, jsapi_ticket, url, expires_in)
          console.log('请求微信签名成功。')
          return res.send(result)
        } else {
          console.log('请求微信签名失败。')
          return res.status(400).send(data)
        }
      }).catch((err) => {
        console.log('请求微信签名失败。')
        console.log(err)
        return res.status(404).send(err.message)
      })
    }).catch((err) => {
      console.log('请求微信签名失败。')
      console.log(err)
      return res.status(404).send(err.message)
    })
  }
})

function getToken (appid, secret) {
  const opt = {
    url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appid + '&secret=' + secret,
    json: true
  }
  return request(opt)
}

function getTicket (access_token) {
  const opt = {
    url: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + access_token + '&type=jsapi',
    json: true
  }
  return request(opt)
}

app.listen(port = 3000, () => {
  console.log('微信JS-SDK使用权限签名中控微服务')
  console.log('Listening at http://localhost:' + port)
})
