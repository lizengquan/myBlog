var mongoose = require("mongoose");

// 内容表结构
var contentSchema = new mongoose.Schema({
  category: {// 关联字段 -- 内容分类的id
    type: mongoose.Schema.Types.ObjectId,// 类型
    ref: "Category"// 引用
  },
  user: {// 关联字段 -- 用户id
    type: mongoose.Schema.Types.ObjectId,// 类型
    ref: "User"// 引用User表 关联
  },
  addTime: {// 添加时间
    type: Date,
    default: new Date()
  },
  views: {// 阅读量
    type: Number,
    default: 0
  },
  description: {// 简介
    type: String,
    default: ""
  },
  content: {// 内容
    type: String,
    default: ""
  },
  comments: {// 评论
    type: Array,
    default: []
  },
  title: {// 标题
    type: String,
    default: ""
  }
})
// 创建模型 Content表 在数据库中自动生成contents表
module.exports = mongoose.model("Content", contentSchema);