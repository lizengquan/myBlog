$(function () {
  // var category = ''
  // $('#bs-example-navbar-collapse-1 .nav > li').click(function () {
  //   // $(this).addClass('active').siblings().removeClass('active');
  //   // category = $(this).find('a').data('category')
  //   // console.log($(this).find('a').data('category'));// 5c21d2847a395722485facfd
  //   /*$.ajax({
  //     url: '/',
  //     dataType: 'json',
  //     data: {category},
  //     success: function(data) {
  //       console.log(data, 123)
  //       getListData(1)
  //     }
  //   }) */
  // })
  $(document).scroll(function () {// 监听页面滚动
    // console.log($(this).scrollTop(), $('.jumbotron').innerHeight());
    if ($(this).scrollTop() >= $('.jumbotron').innerHeight()) {// 滚动距离大于巨幕高度
      $('.navbar').css({// 导航固定在顶部
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: '1000'
      })
      $('.height50').css('height', '72px')// 代替导航原本的位置
    } else {
      $('.navbar').css({// 取消固定
        position: 'relative'
      })
      $('.height50').css('height', 0)// 不占位置
    }
    if ($(this).scrollTop() >= 500) {// 大于500向上箭头显示，否则隐藏
      $('.arrow-top').show()
    } else {
      $('.arrow-top').hide()
    }
  })

  $('.arrow-top').click(function () {// 向上箭头当页面滚动到一定位置跳到指定位置页面顶部
    $("html, body").animate({
      scrollTop: -$(this).offset().top
    }, { duration: 500, easing: "swing" });
  })

  $('.pagination li').click(function () {// 获取分页数
    console.log($(this).text());// 1 2 3 ...
    // console.log($(this).data('page'));// 1 2 3 ...

    var nowPage = $(this).text()
    getListData(nowPage)
  })
  // getListData(1)
  function getListData(nowPage) {// ajax请求分页的数据
    // console.log(category);
    $.ajax({
      url: '/page',
      dataType: 'json',
      data: { page: nowPage },
      success: function (data) {
        // console.log(data);// {userInfo: null, categories: Array(7), contents: Array(5)}
        elementList(data.contents)// 展示页面元素
      }
    })
  }

  function elementList(contents) {
    /* contents: Array(5)
    0:
    addTime: "2018-12-26T03:13:19.420Z"
    category: "5c22f0d3f9b3212e6425316b"
    comments: []
    content: "<h2 style="margin: 35px 0px 15px; padding: 0px 0px"
    description: "<p><strong>ECMAScript 6（简称ES6）</strong>是于2015年6月正式发布的JavaScript语言的标准，正式名为ECMAScript 2015（ES2015）。它的目标是使得JavaScript语言可以用来编写复杂的大型应用程序，成为企业级开发语言。另外，一些情况下ES6也泛指ES2015及之后的新增特性，虽然之后的版本应当称为ES7、ES8等。</p>"
    title: "ECMAScript 6（简称ES6）"
    views: 0
    __v: 0
    _id: "5c22f2a7dcf1872ee8a5fd0e" 
    ... */
    var str = '';
    for (var i = 0; i < contents.length; i++) {
      str += '<div class="panel panel-default">'
      str += '<div class="panel-heading">'
      str += '<h4>'
      str += contents[i].title + '<small class="pull-right">'
      str += contents[i].addTime + '</small></h4>'
      str += '</div>'
      str += '<div class="panel-body">'
      str += contents[i].description
      str += '<a class="pull-right" href="/detail/?contentId=' + contents[i]._id + '">阅读更多...</a>'
      str += '</div>'
      str += '</div>'
    }
    // console.log(str);
    $('#list-data').empty().prepend(str)// 清空原本，添加新的数据
  }


})