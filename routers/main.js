var express = require("express");
var router = express.Router();
var markdown = require("markdown").markdown;// 引入markdown模块编译#->h1

var escapist = require('node-escapist');// 转义

// 数据表
var User = require("../models/User");// 引入user表模块
var Category = require("../models/Category");// 引入Category表模块
var Content = require("../models/Content");// 引入Content表模块


var data;// 定义全局属性
// 所有路由都会经过这
router.use(function (req, res, next) {
  // console.log(req.session)
  /**
  Session {// 第一次登陆后session没有userInfo信息
    cookie:
     { path: '/',
       _expires: null,
       originalMaxAge: null,
       httpOnly: true } }
  Session {// 刷新或点击后会有userInfo信息
    cookie:
     { path: '/',
       _expires: null,
       originalMaxAge: null,
       httpOnly: true },
    userInfo:
     { isAdmin: true,
       _id: '5c20bc82ee6a8f3ca8538b0e',
       username: 'admin',
       password: 'gq4gef3PmjCwQNLwaVlQjw==',
       __v: 0 },
    login: '1',
    username: 'admin' }
   */
  if (!req.session.userInfo) {// 不存在为空
    req.session.userInfo = null;
  }
  data = {
    userInfo: req.session.userInfo,// 用户信息
    categories: []// 分类列表数组
  }
  Category.find().then(function (result) {// 查找所有分类
    data.categories = result;
    // res.render("main/index", data);
    next();// 跳出当前路由，到下个路由
  })
})

// 前台首页
router.get("/", function (req, res) {
  req.session.category = req.query.category;// session存储分类的id
  data.category = req.session.category || "";
  var where = {};
  if (data.category) {
    where.category = data.category;
  }
  // 使用两次操作表的写法
  Content.where(where).find()// 条件 
    .skip(0)// 始起位置
    .limit(5)// 显示5条
    .sort({ addTime: 1 })// 排序
    .then(function (contents) {// 成功后返回的数据
      for (var key in contents) {
        contents[key].description = markdown.toHTML(contents[key].description);
      }
      data.contents = contents;// 对应的内容数据
      // res.render("main/index", data);
      // res.json(data);
      // 统计content的总条数 Content.countDocuments()  Content.count()已弃用
      return Content.countDocuments(where).populate("content");// 返回查找的总数
    }).then(function (count) {// 成功返回的总数
      // console.log(count);
      // console.log(data.contents)
      data.count = Math.ceil(count / 5);// 分页总数
      res.render("main/index", data);// 渲染页面
      // res.json(data);
      // console.log(data);
    })
  // console.log(req.query.category, data.category)
})


// 内容详情页面
// http://localhost:3000/detail/?contentId=5c222254b84ddd36d0bd09d1
router.get("/detail", function (req, res) {
  data.category = req.session.category || "";// 判断导航样式
  var contentId = req.query.contentId;// 对应内容id号
  Content.findOne({ _id: contentId }).then(function (contentData) {
    contentData.description = markdown.toHTML(contentData.description);
    contentData.content = escapist.unescape(contentData.content);// 转义成HTML
    data.contentData = contentData;
    res.render("main/detail", data);
  })
})

// 分页功能
router.get("/page", function (req, res) {
  var page = req.query.page;
  var category = req.session.category;
  // console.log(category)
  var option = {};
  if (category) {
    option.category = category;
  }
  Content.find(option, null,
    {// 分页实现
      limit: 5, skip: (page - 1) * 5, sort: {
        addTime: 1
      }
    },
    function (err, contents) {
      if (err) throw err;
      for (var key in contents) {
        contents[key].description = markdown.toHTML(contents[key].description);
      }
      data.contents = contents;
      res.json(data);
    })
})

module.exports = router;