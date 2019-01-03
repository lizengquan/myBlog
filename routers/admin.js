var express = require("express");// 引入express框架
var router = express.Router();// 使用express的Router方法
var formidable = require("formidable");// 表单处理（图片请求）
var md5 = require("../function/md5");// 引入MD5加密函数
// 把<h1></h1> <script>等转成16进制
var escapist = require('node-escapist');// node-escapist 转义 安全问题

// 数据表
var User = require("../models/User");// 引入user表模块
var Category = require("../models/Category");// 引入Category表模块
var Content = require("../models/Content");// 引入Content表模块

// 后台登录页面
// router.get("/login", function(req, res) {
//   res.render("admin/login");
// })
// 处理登录post请求
router.post("/login", function(req, res) {
  req.session.active = '/';// 侧栏导航样式显示高亮的判断
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) {
      throw new Error("登录表单提交错误");
    }
    // console.log(fields);
    var username = fields.username;
    var password = fields.password;
    var md5Pass = md5(md5(password).substr(11, 7) + md5(password));// md5加密
    User.findOne({"username": username}, function(err, result) {// 查找对应的用户名的数据
      if (err) throw err;
      // result == nul 没找到对应的数据
      if (result != null && result.password == md5Pass && result.isAdmin === true) {// 判断密码是否正确 密码匹对
        req.session.login = '1';// 记录登录成功的状态
        req.session.userInfo = result;// 记录用户信息
        // req.session.userInfo.isAdmin = result.isAdmin
        req.session.username = result.username;// 记录用户名
        res.render("admin/index", {username: req.session.username, active: req.session.active})// 后台首页
      } else {
        // res.render("admin/login");// 失败回到登录页面，继续登录
        res.render("admin/error", {state: ":(", error: "用户名或密码错误！", url: "/admin/login", time: 3000});
      }
    })
  })
})
// 后台的所有的路由都会经过这里，判断是否登录
router.use(function(req, res, next) {
  if (req.session.login == "1" && req.session.userInfo.isAdmin === true) {
    next();// 已登录就跳过这个路由，去找下面合适的路由
  } else {
    res.render("admin/login");// 失败回到登录页面，继续登录
  }
})

// 退出登录Logout
router.get("/logout", function(req, res) {
  req.session.login = '0';// 清空session
  req.session.users = null;// 用户信息清空
  res.render("admin/login");// 登录页面
})

// 后台首页
router.get("/", function(req, res) {
  // 测试数据库是否可用，为user是表添加一条用户。后台登陆验证
  // var md5Pass = md5(md5("123456").substr(11, 7) + md5("123456"));
  // user.insertMany({username: "admin", password: md5Pass, isAdmin: true}, function(err, docs) {
  //   if (err) throw err;
  //   console.log(docs);
  //   /*[ { isAdmin: true,
  //     _id: 5c20bc82ee6a8f3ca8538b0e,
  //     username: 'admin',
  //     password: 'gq4gef3PmjCwQNLwaVlQjw==',
  //     __v: 0 } ]*/
  // })
  req.session.active = req.url;
  // console.log(req.session.active)
  res.render("admin/index", {username: req.session.username, active: req.session.active});
})

// 博客分类 类别category
router.get("/category", function(req, res) {
  req.session.active = req.url;
  Category.find({}, function(err, result) {
    if (err) {
      throw new Error("数据库没有对应的数据")
    }
    // console.log(result);
    res.render("admin/category", {username: req.session.username, result: result, active: req.session.active});
  })
})
// 博客分类添加页面
router.get("/category/add", function(req, res) {
  req.session.active = "/category";
  res.render("admin/category_add", {username: req.session.username, active: req.session.active});
})

// 博客分类添加页面post处理
router.post("/category/add", function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) {
      throw new Error("表单提交失败");
    }
    Category.insertMany({"name": fields.name}, function(err, doc) {
      if (err) {
        // throw new Error("分类添加失败");
        res.render("admin/error", {state: ":(", error: "分类添加失败！", url: "/admin/category/add", time: 3000});
      }
      // console.log(doc);// [ { _id: 5c21b5a0acb00e03784735aa, name: 'HTML', __v: 0 } ]
      res.render("admin/error", {state: ":)", error: "分类添加成功！", url: "/admin/category", time: 3000});
    })
  })
})

// 博客分类删除
// http://localhost:3000/admin/category/del/5c21b7507f6a052690972d84
router.get("/category/del/:id", function(req, res) {
  var id = req.params.id;
  // console.log(id);// 5c21b5eb7f6a052690972d83
  Category.deleteOne({_id: id}, function(err) {
    if (err) {
      res.render("admin/error", {state: ":(", error: "数据删除失败！", url: "/admin/category", time: 3000});
    }
    res.render("admin/error", {state: ":)", error: "数据删除成功！", url: "/admin/category", time: 3000});
  })
})

// 博客内容列表页面
router.get("/content", function(req, res) {
  req.session.active = req.url;
  // 数据库读取数据，遍历到页面中
  Content.find().sort({_id: -1}).then(function(data) {// 查找所有 根据_id降序 then返回数据
    res.render("admin/content", {username: req.session.username, listData: data, active: req.session.active});
  })
})

// 博客内容添加页面
router.get("/content/add", function(req, res) {
  req.session.active = '/content';
  Category.find().sort({_id: -1}).then(function(categoryData) {// 分类选择
    // console.log(categoryData);
    /**
    [ { _id: 5c21da9f125ecf02ec16755b, name: 'HTML5', __v: 0 },
      { _id: 5c21da59125ecf02ec167559, name: 'CSS', __v: 0 },
      { _id: 5c21d2847a395722485facfd, name: 'JavaScript', __v: 0 },
      { _id: 5c21d2677a395722485facfc, name: 'Vuejs', __v: 0 },
      { _id: 5c21d2517a395722485facfb, name: 'Express', __v: 0 },
      { _id: 5c21d2307a395722485facfa, name: 'CSS', __v: 0 },
      { _id: 5c21d1ca7a395722485facf9, name: 'CSS3', __v: 0 },
      { _id: 5c21d1bd7a395722485facf8, name: 'Node.js', __v: 0 },
      { _id: 5c21b5a0acb00e03784735aa, name: 'HTML', __v: 0 } ]
    */
    res.render("admin/content_add", {
      username: req.session.username, 
      listData: categoryData,
      active: req.session.active
    })
  })
})
// 博客内容数据提交 post处理
router.post("/content/add", function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) {
      throw new Error("内容数据提交失败");
    }
    // console.log(fields);
    /**
    { title: 'html5',
      category: '5c21da9f125ecf02ec16755b',
      description: '### **_html5_**',
      content:
      '<h1><span style="font-weight: bold; font-style: italic; text-decoration-line: underline;">html5</span></h1>',
      files: '' }
    */
    // 数据添加数据库
    Content.insertMany({
      title: fields.title,
      category: fields.category,
      description: fields.description,
      // content: fields.content,
      content: escapist.escape(fields.content),// 把html转义成
      files: fields.files
    }, function(err) {
      res.render("admin/error", {state: ":)", error: "数据添加成功", url: "/admin/content", time: 3000});
    })
  })
})

// 博客内容删除
router.get("/content/del/:id", function(req, res) {
  var id = req.params.id;
  // console.log(id);5c220c7350207e37bc3e0c1b
  Content.deleteOne({_id: id}, function(err) {
    if (err) {
      res.render("admin/error", {state: ":(", error: "数据删除失败", url: "/admin/content", time: 3000});
    } else {
      res.render("admin/error", {state: ":)", error: "数据删除成功", url: "/admin/content", time: 3000});
    }
  })
})
// 博客内容修改
// admin/content/edit/5c220e373a74d30ff071adcd
router.get("/content/edit/:id", function(req, res) {
  req.session.active = '/content';
  var id = req.params.id;
  if (id == "favicon.ico") {
    return;
  }
  // console.log(id);
  var categories = [];
  Category.find().sort({_id: -1}).then(function(categoryData) {
    categories = categoryData;
    return Content.findOne({_id: id}).populate("category");
  }).then(function(content) {
      content.content = escapist.unescape(content.content);
      res.render("admin/content_edit", {username: req.session.username, result: content, listData: categories, active: req.session.active});
      // console.log(categories);
      // console.log(content);
/**
[ { _id: 5c22d1de7903912534feba4e, name: 'Webpack', __v: 0 },
  { _id: 5c21da9f125ecf02ec16755b, name: 'HTML5', __v: 0 },
  { _id: 5c21da59125ecf02ec167559, name: 'CSS', __v: 0 },
  { _id: 5c21d2847a395722485facfd, name: 'JavaScript', __v: 0 },
  { _id: 5c21d2677a395722485facfc, name: 'Vuejs', __v: 0 },
  { _id: 5c21d2517a395722485facfb, name: 'Express', __v: 0 },
  { _id: 5c21d1ca7a395722485facf9, name: 'CSS3', __v: 0 },
  { _id: 5c21d1bd7a395722485facf8, name: 'Node.js', __v: 0 },
  { _id: 5c21b5a0acb00e03784735aa, name: 'HTML', __v: 0 } ]
{ addTime: 2018-12-26T00:55:37.600Z,
  views: 0,
  description: 'webpack',
  content: '<p>webpack</p>',
  comments: [],
  title: 'Webpack',
  _id: 5c22d1fa7903912534feba4f,
  category: { _id: 5c22d1de7903912534feba4e, name: 'Webpack', __v: 0 },
  __v: 0 } 
 */
  })
})


// 博客内容修改更新
router.post("/content/edit", function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) {
      throw new Error("内容修改错误");
    }
    // console.log(fields);
    /**
    { title: 'CSS3',
      id: '5c220e113a74d30ff071adcc',
      category: '5c21da9f125ecf02ec16755b',
      description: 'css3',
      content: '<p>css3</p>',
      files: '' }
    */
    var id = fields.id;
    Content.update({_id: id},{
      title: fields.title,
      category: fields.category,
      description: fields.description,
      content: escapist.escape(fields.content),// 把html转义
      // files: fields.files
    }, function(err) {
      if (err) throw err;
      res.render("admin/error", {state: ":)", error: "数据更新成功", url: "/admin/content", time: 3000});
    })
  })
})

module.exports = router;