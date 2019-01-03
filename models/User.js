var mongoose = require("mongoose");// 引入数据库模块
// 创建userSchema模式
var userSchema = new mongoose.Schema({// 数据库字段
  username: String,
  password: String,
  isAdmin: {// 是否可以登录后台
    type: Boolean,
    default: false
  }
})
// 公开整个创建user模型
module.exports = mongoose.model('User', userSchema);