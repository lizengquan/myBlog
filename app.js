// 配置模块（加载模块）
var express = require("express");// express框架
var ejs = require("ejs");// ejs模板模块
var mongoose = require("mongoose");// 数据库模块 
// var bodyParser = require('body-parser');// 表单处理模块
var session = require("express-session");// session储存
// 创建应用
var app = express();
// 加载静态文件
app.use(express.static("./public"));
// session的配置
app.use(session({ // session的基本配置
  secret: 'keyboard cat',// 验证 data+keyboard cat
  resave: false,
  saveUninitialized: true
}))
// ejs模板配置把后缀名改html
app.engine("html", ejs.__express);
app.set("view engine", "html");


// /admin 经过路由
app.use("/admin", require("./routers/admin"));// 后台所有路由

app.use("/", require("./routers/main"));// 前台所有路由

app.use("/api", require("./routers/api"));// 提供api接口给 vue框架等调用

// bibiApi
// app.use("/bibiapi",require("./routers/bibiapi"));

// 404页面
app.use(function(req, res) {
  res.render("admin/404");
})
// 创建数据库连接
mongoose.connect('mongodb://127.0.0.1:27017/blogs', {useNewUrlParser: true}, function(err) {
  if (err) {
    console.log("数据库连接失败");// 如果错误为真，则初始连接失败。
  } else {
    // 监听端口 数据库连接成功启动服务器
    app.listen(3000, () => console.log("服务器启动成功，请访问：http://localhost:3000"));
  }
})