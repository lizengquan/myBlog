// MD5验证功能
var crypto = require("crypto");// 引入加密模块
module.exports = function(data) {// 把整个函数公开
  var md5 = crypto.createHash('md5');// 创建hash
  var password = md5.update(data).digest('base64');// 更新数据 整理成base64
  return password;// 返回加密的密码
}
// 在外部调用并使用
// var md5 = require("./models/md5");
// 安全使用md5加密的写法
// var md5Pass = md5(md5('123456').substr(11, 7) + md5('123456'));