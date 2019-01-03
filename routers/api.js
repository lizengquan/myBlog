var express = require("express");
var router = express.Router();// 实例化路由
var formidable = require("formidable");// 表单处理
var md5 = require("../function/md5");// MD5加密

// 数据表
var User = require("../models/User");// 引入user表模块
var Category = require("../models/Category");// 引入Category表模块
var Content = require("../models/Content");// 引入Content表模块

// Api 接口  vue项目
// 根据自己项目不同需求，设计接口
// router.post("/login", function(req, res) {
//   // res.json(); 返回json数据
//   res.jsonp();
// })


// 统一返回数据格式
router.use(function(req, res, next){
    responseData = {// 响应回浏览器的数据
      code: 0,// 为0代表请求成功 其他如1 2 3 4 5 6 7 8 代表失败
      message: ''// 提示信息
    }
    next();// 跳出当前路由到下面路由
})

// 注册功能

// js验证
// 1.用户名不能为空
// 2.密码不能为空
// 3.再次验证密码相同

// 数据库验证
// 用户名不能存在
// 更新数据库
// 处理注册ajax的post请求
router.post("/register", function(req, res) {
  var form = new formidable.IncomingForm();// 接收表单信息
  form.parse(req, function(err, fields, files) {// 处理表单信息
    if (err) {
      throw new Error("获取表单信息错误");
    }
    // console.log(fields);{ username: 'admin', password: '123', password2: '123' }
    var username = fields.username;// 接收请求的用户名
    var password = fields.password;// 接收请求的密码
    var password2 = fields.password2;// 接收请求的第二次输入的密码

    // 1.用户名不能为空
    if (username == "") {
      responseData.code = "1";
      responseData.message = "用户名不能为空";
      res.json(responseData);// ajax请求返回的json数据
      return;// 终止代码
    }
    // 2.密码不能为空
    if (password == "") {
      responseData.code = "2";
      responseData.message = "密码不能为空";
      res.json(responseData);// ajax请求返回的json数据
      return;
    }
    // 3.输入两次密码相同
    if (password != password2) {
      responseData.code = "3";
      responseData.message = "两次输入密码不一致";
      res.json(responseData);// ajax请求返回的json数据
      return;
    }
    User.findOne({// 查找用户表
      username// 根据用户名查找
    }).then(function(userInfo) {// 查找成功后返回的数据
      // console.log(userInfo);// 没有 null
      // 4.输入的用户名不能存在数据库中
      if (userInfo) {
        //表示数据库有该数据
        responseData.code = "4";
        responseData.message = "用户名已被注册";
        res.json(responseData);
        return;
      }
      // 保存用户名 更新数据库
      var md5Pass = md5(md5(password).substr(11, 7) + md5(password));// MD5加密
      var user = new User({// 实例化
        username,
        password: md5Pass
      })
      return user.save();// 返回更新数据库
    }).then(function(newUserInfo) {// 成功后返回的更新数据
      // console.log(newUserInfo); 没有undefined 
      /**
      { isAdmin: false,
        _id: 5c23651f2b41ea40b41b1ef2,
        username: '小明',
        password: 'gq4gef3PmjCwQNLwaVlQjw==',
        __v: 0 }
       */
      responseData.message = "注册成功";
      res.json(responseData);// 返回json数据
    })
  })
})

// 处理登录的ajax的post请求
router.post("/login", function(req, res) {
  var form = new formidable.IncomingForm();// 接收表单信息
  form.parse(req, function(err, fields, files) {// 处理表单信息
    if (err) {
      throw new Error("获取表单信息错误");
    }
    // console.log(fields);{ username: 'admin', password: '123' }
    var username = fields.username;// 接收请求的用户名
    var password = fields.password;// 接收请求的密码

    // 1.用户名不能为空
    if (username == "") {
      responseData.code = "1";
      responseData.message = "用户名不能为空";
      res.json(responseData);// ajax请求返回的json数据
      return;// 终止代码
    }
    // 2.密码不能为空
    if (password == "") {
      responseData.code = "2";
      responseData.message = "密码不能为空";
      res.json(responseData);// ajax请求返回的json数据
      return;
    }
    var md5Pass = md5(md5(password).substr(11, 7) + md5(password));// MD5加密
    User.findOne({// 查找用户表
      username,// 根据用户名查找
      password: md5Pass
    }).then(function(userInfo) {// 查找成功后返回的数据
      // console.log(userInfo);// 没有 null
      
      if (!userInfo) {
        // 数据库没有数据
        responseData.code = "3";
        responseData.message = "用户名或密码错误";
        res.json(responseData);
        return;
      }
      // 用户名和密码正确 登录成功
      req.session.login = "1";
      req.session.username = userInfo.username;// session记录用户名
      req.session.userInfo = userInfo;// session记录用户信息
      responseData.userInfo = {// 响应回浏览器的用户信息
        id: userInfo.id,
        username: userInfo.username,// 用户名
        isAdmin: userInfo.isAdmin
      }
      res.json(responseData);// 返回json数据
      return;
    })
  })
})

// 前台退出登录功能
router.get("/logout", function(req, res) {
  req.session.login = "0";
  req.session.userInfo = null;
  res.json(responseData);
})

module.exports = router;