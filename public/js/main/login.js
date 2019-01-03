$(function() {
  // 注册功能
  $('#register').click(function() {
    var form = $(this).parent();// 获取整个form表单 
    // form表单查找input子元素对应的name值，然后获取对应的值
    var username = form.find("input[name='username']").val();// 获取用户名的值
    var password = form.find("input[name='password']").val();// 获取密码值
    var password2 = form.find("input[name='password2']").val();// 获取确认密码值
    console.log(username, password, password2);// admin 123456 123456
    // 前台验证不是很安全，后台验证安全性高
    $.ajax({// ajax请求
      url: '/api/register',// 请求地址
      type: 'post',// 请求类型
      dataType: 'json',// 请求数据类型
      data: {// 传入服务器的参数
        username,
        password,
        password2
      },
      success: function(data) {// 请求成功返回的数据
        console.log(data);// {code: "1", message: "用户名不能为空"}
        if (data.code != "0") {// 注册失败
          // 在form表单添加元素
          form.append('<div class="alert alert-danger" role="alert">' + data.message + '</div>')
        } else {// 注册成功
          form.append('<div class="alert alert-success" role="alert">' + data.message + '</div>')
        }
        hidden();// 2秒后隐藏提示信息
      }
    })
  })
  // 登录功能
  $('#login').click(function() {
    var form = $(this).parent();// 获取整个form表单 
    // form表单查找input子元素对应的name值，然后获取对应的值
    var username = form.find("input[name='username']").val();// 获取用户名的值
    var password = form.find("input[name='password']").val();// 获取密码值
    console.log(username, password);// admin 123456
    // 前台验证不是很安全，后台验证安全性高
    $.ajax({// ajax请求
      url: '/api/login',// 请求地址
      type: 'post',// 请求类型
      dataType: 'json',// 请求数据类型
      data: {// 传入服务器的参数
        username,
        password
      },
      success: function(data) {// 请求成功返回的数据
        console.log(data);// {code: "1", message: "用户名不能为空"}
        if (data.code != "0") {// 登录失败
          // 在form表单添加元素
          form.append('<div class="alert alert-danger" role="alert">' + data.message + '</div>')
        } else {// 登录成功
          form.hide();// 隐藏登录表单
          // 显示用户信息部分
          $(".userInfo").show().find("span").text(data.userInfo.username);// 插入用户名
          $(".userInfo").show().find("span").attr('data-id', data.userInfo.id);// 添加id
          if (!data.userInfo.isAdmin) {
            $('.userInfo h5').eq(0).hide();
          }
        }
        hidden();// 2秒后隐藏提示信息
      }
    })
  })
  
  $('#logout').click(function() {// 退出登录
    $.ajax({
      url: '/api/logout',
      success: function(result) {
        console.log(result);
        if (result.code == "0") {
          location.reload();// 刷新页面
        }
      }
    })
  })

  function hidden() {// 隐藏提示信息
    setTimeout(() => {
      $(".alert").hide();
    }, 2000);
  }
})