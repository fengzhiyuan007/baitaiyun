
/*主控制器*/
app.controller('mainCtrl', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('主控制器');

  /*创建环信链接*/
  $scope.conn = new WebIM.connection({
    isMultiLoginSessions: WebIM.config.isMultiLoginSessions,
    https: typeof WebIM.config.https === 'boolean' ? WebIM.config.https : location.protocol === 'https:',
    url: WebIM.config.xmppURL,
    heartBeatWait: WebIM.config.heartBeatWait,
    autoReconnectNumMax: WebIM.config.autoReconnectNumMax,
    autoReconnectInterval: WebIM.config.autoReconnectInterval,
    apiUrl: WebIM.config.apiURL,
    isAutoLogin: true
  });

  $scope.phoneReg = /^1[3|4|5|7|8]\d{9}$/;
  /*获取用户信息*/
  $scope.userInfoFun = function(){
    $http.post(
      url + "api/user/user_info",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token")
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.userInfo = data["data"];
      }else if(data["status"] == 'error'){
        console.log(data['data']);
        myFactory.promptFun(data["data"],1300);
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  /*微信登录*/
  if ($cookieStore.get("user", {path: "/"})) {
    var member = $cookies.get("user", {path: "/"});
    if (member.indexOf("{") == 0) {
      $scope.member = JSON.parse(member);
    } else {
      $scope.member = JSON.parse(member.slice(6));
    }
    $cookieStore.put('uid', $scope.member.member_id);
    $cookieStore.put('token', $scope.member.app_token);
    $cookieStore.put('hx_username', $scope.member.hx_username);
    $cookieStore.put('hx_password', $scope.member.hx_password);
    $cookieStore.put("openid", $scope.member.pwx_openid);
    $cookieStore.put('tv_id', $location.search()["tv_id"] || '');
    $scope.userInfoFun();
  } else {
    $cookies.put("url", window.location.href, {path: "/"});
    window.location.href = url + "api/login/weixin"
  }
  /*调用轮播图插件*/
  $scope.flexsliders=function(dom) {
    angular.element(dom).flexslider({
      slideshowSpeed: 3000, //展示时间间隔ms
      animationSpeed: 300, //滚动时间ms
      pauseOnAction:false,
      touch: true //是否支持触屏滑动(比如可用在手机触屏焦点图)
    });
  }
  /*动态设置图片高度等于图片宽度*/
  $scope.setGoodsListImgH = function (dom) {
    angular.element(dom).css("height",angular.element(dom).width());
  }

  /****************
  * 返回上一页
  ****************/
  $scope.backFun = function(){
    history.back();
  }

  $scope.getHtml = function(id){
    $http.get(
      url + "api/Merchant/ajax_agreement/id/" + id
    ).success(function(data){
      console.log(data)
      if(data["status"] == 'ok'){
        $scope.settledInfo = $sce.trustAsHtml(data["data"]);
      }else if(data["status"] == 'error'){
        myFactory.promptFun(data["data"],1300)
      }
    })
  }
  /* banner */
  $scope.getBanner = function(type){ // 1:首页；2商城；3直播；4优惠券
    $scope.bannerInfo = [];
    $http.post(
      url + "api/index/banner_list",$.param({
        type: type
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.bannerInfo = data["data"];
        for(var i=0;i<data["data"].length;i++){
          if(data["data"][i].b_type ==1){ // 无跳转
            $scope.bannerInfo[i].url="javascript:;"
          }else if(data["data"][i].b_type==2){ // web(外链)
            $scope.bannerInfo[i].url=data["data"][i].jump
          }else if(data["data"][i].b_type==3){ // 分类页
            $scope.bannerInfo[i].url="#/goodsList?class_uuid=" + data["data"][i].jump;
          }else if(data["data"][i].b_type==4){ // 商家（店铺）
            $scope.bannerInfo[i].url="#/shopDetails?merchants_id=" + data["data"][i].jump;
          }else if(data["data"][i].b_type==5){ // 商品详情
            $scope.bannerInfo[i].url="#/goodsDetails?goods_id=" + data["data"][i].jump
          }else if(data["data"][i].b_type==6){ // 优惠券
            $scope.bannerInfo[i].url= data["data"][i].jump+ "&uid1=" + $cookieStore.get("uid") + "&token1=" + $cookieStore.get("token");
          }
        }
      }else if(data["status"] == 'error'){
        console.log(data['error']);
      }
    })
  }
  console.log(location.href.split("#")[0])
  //获得微信权限
  $http.post(
    url+"api/login/getjssdk",$.param({
        url: location.href
    }),
    {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"]=="ok"){
      wx.config({
        debug: false,
        appId: data['data']['appId'],
        timestamp: data['data']['timestamp'],
        nonceStr: data['data']['nonceStr'],
        signature: data['data']['signature'],
        jsApiList: [
          // 所有要调用的 API 都要加到这个列表中
          'checkJsApi',
          'onMenuShareTimeline',
          'getLocation',
          'onMenuShareAppMessage',
          'openLocation',
          'hideOptionMenu',
          'showOptionMenu',
          'hideMenuItems',
          'showMenuItems',
          'hideAllNonBaseMenuItem',
          'showAllNonBaseMenuItem',
          'getLocation',
          'scanQRCode'
        ],
        success: function(res) {

        },
        error : function (res) {

        }
      });

    }
  });
  $scope.city = '上海'
  /*微信定位*/
  wx.ready(function(){
    /*微信定位*/
    wx.getLocation({
      type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
      success: function (res) {
        $scope.geocoder = new qq.maps.Geocoder({
          complete: function (data) {
            console.log(data)
            $scope.locationInfo = data.detail.addressComponents;
            $scope.$apply(function () {
           　　$scope.city = data.detail.addressComponents.city || '上海';
            });
          }
        })
        $scope.coord = new qq.maps.LatLng(res.latitude, res.longitude);
        $scope.geocoder.getAddress($scope.coord)

      }
    })
  })
}])
/*直播首页*/
.controller('home', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('首页');
  $rootScope.footerType = 1; // 底部导航切换使用
  // 获取banner
  $scope.getBanner(1)
  /*
  * 微信扫一扫
  */
  $scope.scanQRCodeFun = function(){
    wx.ready(function(){
      wx.scanQRCode({
        needResult: 0, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
        scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
        success: function (res) {
          // var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
          console.log(res);
          // // alert(JSON.stringify(res));
          // window.location.href = res.resultStr;
        }
      });
    })
  }
  if(sessionStorage.getItem("city") && sessionStorage.getItem("city") != ''){
    $scope.city = sessionStorage.getItem("city");
  }
  /*获取直播分类列表*/
  $http.get(url + "api/live/live_class").success(function(data){
    console.log(data);
    if(data["status"] == 'ok'){
      $scope.liveClassInfo = data["data"]
    }else if(data["status"] == 'error'){
      console.log(data['data']);
    }
  })

  /* 直播列表 */
  $scope.liveListInfo = [];
  $scope.liveListFun = function (type,page) {
    $scope.page = page || 1;
    $scope.type = type || 1;
    $http.post(
      url + "api/live/anchor_list",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        p : $scope.page,
        type: $scope.type
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.allPage = data["data"]["page"]
        $scope.liveListInfo.push.apply($scope.liveListInfo, data["data"]["list"]);
        console.log($scope.liveListInfo)
      }else if(data["status"] == 'error'){
        console.log(data['data']);
        alert(data["data"])
      }
    })
  }

  /*获取banner图盒子的高度or分类列表盒子的高度*/
  $scope.bannerBoxH = angular.element("#bannerBox").height();
  $scope.liveClassBoxH = angular.element("#lievClassBox").height();

  /*滚动加载*/
  angular.element(window).scroll(function() {
    $scope.wTop = angular.element(window).scrollTop();
    $scope.bTop = angular.element("body").height();
    $scope.dTop = angular.element(document).height();
    /*
    * 判断
    * banner图的高度加上分类盒子的高度再加上分类盒子的下边距
    * 是否大于或等于滚动的高度
    */
    if($scope.wTop >= $scope.bannerBoxH + $scope.liveClassBoxH + 10){
      angular.element("#liveTypeBox").addClass("liveType_position_f");
      angular.element("#liveListBox").addClass("mt40");
    }else {
      angular.element("#liveTypeBox").removeClass("liveType_position_f");
      angular.element("#liveListBox").removeClass("mt40");
    }
    if ($scope.wTop + $scope.bTop >= $scope.dTop) { //下拉到底部加载
      if ($scope.allPage > $scope.page) {
        $scope.liveListFun($scope.type,++$scope.page);
      }
    }
  })

  /*直播类型tab切换*/
  $scope.liveTypeTabClick = function(type){
    $scope.liveListInfo = [];
    $scope.liveListFun(type);
    sessionStorage.setItem("liveType",type);
  }
  /* 实现点击详情后返回订单列表保持原本状态 */
  if(sessionStorage.getItem("liveType") && sessionStorage.getItem("liveType") != ''){
    $scope.liveListFun(sessionStorage.getItem("liveType"));
  }else{
    $scope.liveListFun(); // 初始化
  }

  /*
  * 主播列表跳转
  */
  $scope.goLiveRoomClick = function (index) {
    if($scope.liveListInfo[index].live_id !=0){
      $location.path("liveRoom_mobile").search({live_id:$scope.liveListInfo[index].live_id,room_id:$scope.liveListInfo[index].room_id});
    }else {
      $location.path("anchorDetails").search({user_id:$scope.liveListInfo[index].member_id})
    }
  }
}])
/*直播分类*/
.controller('liveClass', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce', 'myFactory',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('直播分类');
  $scope.title = $location.search()["title"];
  // 获取banner
  $scope.getBanner(3)
  /*
  * 获取分类直播列表
  */
  $scope.liveClassListInfo = [];
  $scope.getLiveClassListFun = function(city,page){
    $scope.city = city;
    $scope.page = page || 1;
    $http.post(
      url + "api/live/tag_live_list",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        live_class_id: $location.search()["live_class_id"],
        city: $scope.city,
        p : $scope.page
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.allPage = data["data"]["page"]
        $scope.liveClassListInfo.push.apply($scope.liveClassListInfo, data["data"]["list"]);
        console.log($scope.liveClassListInfo)
      }else if(data["status"] == 'error'){
        console.log(data['data']);
      }
    })
  }
  if(sessionStorage.getItem("city") && sessionStorage.getItem("city") != ''){
    $scope.city = sessionStorage.getItem("city");
    $scope.getLiveClassListFun(sessionStorage.getItem("city"))
  }

  /*
  * 主播列表跳转
  */
  $scope.goLiveRoomClick = function (index) {
    if($scope.liveClassListInfo[index].live_id !=0){
      window.location.href = "http://dspx.tstmobile.com/mall_live/#/liveRoom_mobile?live_id=" + $scope.liveClassListInfo[index].live_id + "&room_id=" + $scope.liveClassListInfo[index].room_id ;
      // $location.path("liveRoom_mobile").search({live_id:$scope.liveClassListInfo[index].live_id,room_id:$scope.liveClassListInfo[index].room_id});
    }else {
      $location.path("anchorDetails").search({user_id:$scope.liveClassListInfo[index].member_id})
    }
  }

  /*滚动加载*/
  angular.element(window).scroll(function() {
    $scope.wTop = angular.element(window).scrollTop();
    $scope.bTop = angular.element("body").height();
    $scope.dTop = angular.element(document).height();
    if ($scope.wTop + $scope.bTop >= $scope.dTop) { //下拉到底部加载
      if ($scope.allPage > $scope.page) {
        $scope.liveListFun($scope.city,++$scope.page);
      }
    }
  })
}])
/*城市列表*/
.controller('cityList', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce', 'myFactory',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('城市列表');
  /*
  * 获取城市列表
  */
  $scope.getCityListClick = function (name) {
    $http.post(
      url + "api/Home/city",$.param({
        name: name
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.cityListInfo = data["data"];
      }else if(data["status"] == 'error'){
        console.log(data['data']);
        myFactory.promptFun(data["data"],1300)
      }
    })
  }
  $scope.getCityListClick('');
  /*
  * 选择城市
  */
  $scope.selectCityClick = function(name){
    sessionStorage.setItem('city',name);
    $scope.backFun();
  }
}])
/*直播间*/
.controller('liveRoom_mobile', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('直播间-竖屏');

  $scope.videoDodyDom = document.getElementById("liveRoom");
  $scope.videoBoxDom = document.getElementById("videoBox"); // 获取video父盒子Dom

  /*获取聊天室DOM元素*/
  $scope.msgBoxDom = document.getElementById("msgBox");
  $scope.chatInfoDom = angular.element("#chatInfo"); //聊天室信息内容框
  $scope.bottomBoxDom = document.getElementById("bottomBox");
  sessionStorage.setItem("live_id",$location.search()["live_id"]);

  /*
  * 进入直播间
  */
  $http.post(
    url + "api/live/into_live",$.param({
      uid : $cookieStore.get("uid"),
      token : $cookieStore.get("token"),
      live_id : $location.search()["live_id"]
    }),
    {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"] == 'ok'){
      $scope.into_liveInfo = data["data"];
      $scope.chatInfoDom.append('<div class="f12 pb5"><span class="col_fff">直播消息：</span><span class="col_d55343">'+ data["data"].prompt +'</span></div>');
    }else if(data["status"] == 'error'){
      console.log(data['data']);
    }else if (data['status'] == 'pending') {
      myFactory.loginFun(); // 调用登录失效方法
    }
  })
  /*
  * 获取直播信息
  */
  $http.post(
    url + "api/Live/live_info",$.param({
      live_id: $location.search()["live_id"]
    }),
    {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"] == 'ok'){
      $scope.liveInfo = data["data"];
      /*安卓手机*/
      var androidVideoHtml = '<video id="vieoPlayer" width="100%" height="100%" preload="auto" poster="" src="'+ data["data"].play_address_m3u8 +'" webkit-playsinline="true" x-webkit-airplay="true" x5-video-player-type="h5" x5-video-player-fullscreen="true" style="object-fit: cover; border: 0px; background: rgb(0, 0, 0);"></video>'
      /*ios手机*/
      var iosVideoHtml = '<video id="vieoPlayer" width="100%" height="100%" preload="auto" poster="" src="'+ data["data"].play_address_m3u8 +'" playsinline="true" webkit-playsinline="webkit-playsinline" style="object-fit: cover; border: 0px; background: rgb(0, 0, 0);"></video>'
      /**********************
       * 判断是iOS还是android
       ***********************/
      var ua = navigator.userAgent.toLowerCase();
      if (ua.match(/iPhone\sOS/i) == "iphone os") { //ios
        $scope.videoBoxDom.innerHTML = iosVideoHtml;
      } else if (ua.match(/Android/i) == "android") { //安卓
        $scope.videoBoxDom.innerHTML = androidVideoHtml;
      }
      $scope.video = document.getElementById("vieoPlayer"); // 获取video

      /*触摸事件*/
      $scope.videoDodyDom.addEventListener("touchstart", function(){
        $scope.video.play() // 播放
        angular.element("#playIcon").hide();
        angular.element("#playImgBox").hide(); // 隐藏封面图
      });
      
      // $scope.video.addEventListener('ended', function (e) {
      //   alert("播放停止")
      // })

      $scope.getGiftFun();
      $scope.anchorInfoFun(); //获取主播信息
    }else if(data["status"] == 'error'){
      console.log(data['data']);
    }
  })

  /***************** 环信相关 start *******************/
  /*环信登录配置*/
  $scope.hxLogin = {
    apiUrl: WebIM.config.apiURL,
    user: $cookieStore.get('hx_username'),
    pwd: $cookieStore.get('hx_password'),
    appKey: WebIM.config.appkey,
    success: function(e) {
      console.log('登录成功！');
      $scope.conn.setPresence(); // 设置上线
    },
    error: function() {
      console.log("登录失败！");
    }
  }
  $scope.conn.open($scope.hxLogin);// 登录

  /*加入聊天室*/
  $scope.joinRoom = function () {
    $scope.conn.joinChatRoom({
        roomId: $location.search()["room_id"] // 聊天室id
    });
  };
  /*退出聊天室*/
  $scope.quitRoom = function () {
    $scope.conn.quitChatRoom({
      roomId: $location.search()["room_id"] // 聊天室id
    });
  }

  /*环信回调函数*/
  $scope.conn.listen({
    onTextMessage: function ( message ) {     //收到文本消息
      /*****聊天室*****/
      if (message.type == 'chatroom' && message.to == $location.search()["room_id"]) {
        console.log(message);
        if (message.ext.intoroom == '1' || message.ext.intoroom == '2') {
          //如果有这两个值，刷新直播间人数
          $scope.liveRoomUserListFun();
        }
        if(message.ext.gift_id){ // 收到礼物消息
          console.log('收到礼物消息')
          // 刷新礼物数量
          $scope.getGiftFun();
          $scope.chatInfoDom.append('<div class="f12 pb5 col_fff"><span class="col_156ee7">' + message.ext.username + '</span>送了主播<span class="col_red">'+ message.ext.gift_num +'</span>个<span class="col_fff">' + message.ext.giftname + '</span></div>');
        }else{ // 普通消息
          $scope.chatInfoDom.append('<div class="f12 pb5"><span class="col_e4c931">' + message.ext.username + '：</span><span class="col_fff">' + message.data + '</span></div>');
        }
        angular.element('#msgBox').scrollTop($scope.bottomBoxDom.offsetTop);//消息显示在最底部
      }
    },    
    onCmdMessage: function ( message ) {      //收到命令消息
      console.log(message.action);
      // 直播结束
      if(message.action == 'anchorStopLive'){
        myFactory.promptFun('直播已结束',1300);
      }
      // 商品置顶
      if(message.action == 'MerchantsLivingGoods') {
        $scope.liveGoodsListFun();
      }
    },
    onOpened: function ( message ) {          //连接成功回调
      console.log('连接成功')
      $scope.conn.setPresence(); // 设置手动上线
      $scope.sendRoomText(1);
      $timeout(function() {
        $scope.joinRoom(); //加入聊天室
      }, 1000);
    },  
    onClosed: function ( message ) {          //连接关闭回调
      console.log("连接关闭")
    },         
    onOnline: function ( m ) { //本机网络连接成功
      console.log(m)
    },                  
    onOffline: function () {},                 //本机网络掉线
    onError: function ( message ) {
      console.log('连接失败')
    }
  });

  /*发送普通文本消息*/
  $scope.sendRoomText = function(inChat) {
    $scope.msgTextId = $scope.conn.getUniqueId(); // 生成本地消息id
    $scope.msg = new WebIM.message("txt", $scope.msgTextId); // 创建文本消息
    if (inChat == 1) {
      $scope.text = '进入了直播间';
      $scope.intoroom = 1;
    } else if (inChat == 2) {
      $scope.text = '离开了直播间';
      $scope.intoroom = 2;
    } else {
      $scope.text = $scope.liveMsg;
      $scope.intoroom = '';
    }
    $scope.msgText = {
      msg: $scope.text, // 消息内容
      to: $location.search()["room_id"], // 接收消息对象(聊天室id)
      roomType: true,
      chatType: 'chatRoom',
      /*用户自扩展的消息内容（群聊用法相同）*/
      ext: {
        /******用户信息扩展字段*******/
        username: $scope.userInfo.username, //用户名
        user_id: $scope.userInfo.member_id, //用户id
        userimg: $scope.userInfo.header_img, //用户头像
        intoroom: $scope.intoroom,
      },
      success: function() {
        console.log('普通消息发送成功');
        if(inChat != 1 ){
          $scope.chatInfoDom.append('<div class="f12 pb5"><span class="col_e4c931">' + $scope.userInfo.username + '：</span><span class="col_fff">' + $scope.text + '</span></div>');
        }
        angular.element('#msgBox').scrollTop($scope.bottomBoxDom.offsetTop);//消息显示在最底部
      },
      fail: function() {
        console.log('普通消息发送失败');
      }
    }
    //发送成功清除输入框
    $scope.liveMsg = null;
    $scope.msg.set($scope.msgText);
    $scope.msg.setGroup('groupchat');
    $scope.conn.send($scope.msg.body);
  };
  /*普通消息发送按钮*/
  $scope.sendMsgClick = function() {
    if ($scope.liveMsg == null) {
      return false;
    }
    $scope.sendRoomText();
  }

  /*发送礼物消息*/
  $scope.sendRoomGift = function(giftObj) {
    $scope.msgGiftId = $scope.conn.getUniqueId(); // 生成本地消息id
    $scope.msg = new WebIM.message("txt", $scope.msgGiftId); // 创建文本消息
    $scope.msgGift = {
      msg: '', // 消息内容
      to: $location.search()["room_id"], // 接收消息对象(聊天室id)
      roomType: true,
      chatType: 'chatRoom',
      /*用户自扩展的消息内容（群聊用法相同）*/
      ext: {
        /******用户信息扩展字段*******/
        username: $scope.userInfo.username.toString(), //用户名
        user_id: $scope.userInfo.member_id.toString(), //用户id
        userimg: $scope.userInfo.header_img.toString(), //用户头像
        intoroom: '',
        /******* 礼物消息扩展字段 ********/
        giftimg: giftObj.img.toString(),
        giftname: giftObj.name.toString(),
        gift_id: giftObj.gift_id.toString(),
        gift_num: giftObj.num.toString()
      },
      success: function() {
        console.log('礼物消息发送成功');
        $scope.chatInfoDom.append('<div class="f12 pb5 col_fff"><span class="col_156ee7">你</span>送了主播<span class="col_red">'+ giftObj.num +'</span>个<span>' + giftObj.name + '</span></div>');
        angular.element('#msgBox').scrollTop($scope.bottomBoxDom.offsetTop);//消息显示在最底部
      },
      fail: function() {
        console.log('礼物消息发送失败');
      }
    }
    $scope.msg.set($scope.msgGift);
    $scope.msg.setGroup('groupchat');
    $scope.conn.send($scope.msg.body);
  };

  /*监听$destory事件，这个事件会在页面发生跳转的时候触发。*/
  $scope.$on("$destroy", function() {
    console.log('页面发生跳转')
    $scope.sendRoomText(2); // 给聊天时发送离开直播间消息
    $scope.conn.close(); //退出登录(断开连接)
    $scope.outListRoom(); // 退出直播间
  });
  /***************** 环信相关 end *******************/
  /*
  * 关注与取消关注
  */
  $scope.isFollowClick = function (type) {
    $http.post(
      url + "api/live/follow",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        user_id2 : $scope.liveInfo.user_id, // 主播id
        type : type
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        if(type==1){
          $scope.into_liveInfo.is_follow = 2;
        }else {
          $scope.into_liveInfo.is_follow = 1;
        }
      }else if(data["status"] == 'error'){
        console.log(data['data']);
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  /*退出直播间*/
  $scope.outListRoom = function () {
    $http.post(
      url + "api/live/out_live",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        live_id : sessionStorage.getItem("live_id")
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        console.log(data["data"]);
      }else if(data["status"] == 'error'){
        console.log(data['data']);
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }

  /*直播间用户列表*/
  $scope.liveRoomUserListFun = function () {
    $http.post(
      url + "api/live/show_viewer",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        live_id : $location.search()["live_id"],
        page: 1,
        pagesize: 5
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.liveRoomCount = data["data"]["count"];
        $scope.liveRoomUserListInfo = data["data"]["list"];
      }else if(data["status"] == 'error'){
        console.log(data['error']);
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  $scope.liveRoomUserListFun();
  $scope.aMk = 0;   //控制主播信息显示隐藏
  $scope.aMkFun = function(d) {
    $scope.aMk = d;
  }
   /*获取主播信息*/
  $scope.anchorInfoFun = function () {
    $http.post(
      url + "/api/live/get_live_info",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        live_id : $location.search()["live_id"],
        user_id: $scope.liveInfo.user_id
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.anchorInfo = data["data"];
      }else if(data["status"] == 'error'){
        console.log(data['error']);
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
   /*举报接口*/
  $scope.reportFun = function () {
    $http.post(
      url + "/api/live/report",$.param({
        uid : $cookieStore.get("uid"),
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
         myFactory.promptFun(data['data'], 1300);
      }else if(data["status"] == 'error'){
        myFactory.promptFun(data['error'], 1300);
        console.log(data['error']);
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  
  /*直播间商品列表*/
  $scope.liveGoodsListFun = function() {
    $http.post(
      url + "api/merchant/live_goods",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        live_id : $location.search()["live_id"]
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.liveGoodsListInfo = data["data"];
        for(var i=0; i<data["data"].length; i++){
          if(data["data"][i].is_top == 1){
            $scope.topGoods = data["data"][i]
            return false
          }
        }
      }else if(data["status"] == 'error'){
        console.log(data['error']);
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  $scope.liveGoodsListFun();

  /*输入框model事件*/
  $scope.inputModelClick = function (t){ // t=1(打开),t=2(关闭)
    if(t==1){
      angular.element("#bottomInputBox").show();
      angular.element("#liveRoomInput").focus();
    }else{
      angular.element("#bottomInputBox").hide();
    }
  }

  /************** 礼物相关 **************/
  /*
  * 获取当前用户的账户余额
  */
  $scope.getMonyFun = function(){
    $http.post(
      url + "api/live/get_money",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token")
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.user_mony = data["data"]["money"];
      }else if(data["status"] == 'error'){
        console.log(data['data']);
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  $scope.getMonyFun();
  /*直播间礼物列表*/
  $http.post(
    url + "api/live/gift_list",$.param({
      uid : $cookieStore.get("uid"),
      token : $cookieStore.get("token")
    }),
    {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"] == 'ok'){
      $scope.giftListInfo = data["data"]
      $scope.giftObj = $scope.giftListInfo[0]; //默认选中第一个礼物
    }else if(data["status"] == 'error'){
      console.log(data['error']);
    }else if (data['status'] == 'pending') {
      myFactory.loginFun(); // 调用登录失效方法
    }
  })
  /* 主播收到的礼物数量 */
  $scope.getGiftFun = function(){
    $http.post(
      url + "api/live/get_get_money",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        user_id : $scope.liveInfo.user_id
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.giftNum = data["data"]
      }else if(data["status"] == 'error'){
        console.log(data['error']);
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }

  /*礼物点击事件*/
  $scope.giftClick = function (giftObj) {
    $scope.giftObj = giftObj;
    console.log($scope.giftObj)
  }
  /*
  * 送礼按钮点击事件
  */
  $scope.num = 1;
  var zz = /^[0-9]*[1-9][0-9]*$/;　　//正整数
  $scope.sendBtnClick= function () {
    if(!zz.test($scope.num)) {
      myFactory.promptFun('请输入正整数！', 1300);
    } else {
      $http.post(
      url + "api/live/give_gift",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        live_id : $location.search()["live_id"],
        gift_id : $scope.giftObj.gift_id,
        number : $scope.num || '1'
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        angular.element("#liveRoomGiftBox").hide();
        $scope.giftObj.num = $scope.num || 1;
        $scope.sendRoomGift($scope.giftObj)
        $scope.giftModelClick(2);
        $scope.getMonyFun();
      }else if(data["status"] == 'error'){
        myFactory.promptFun(data["data"],1300);
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
    }
  }
  /************** 礼物相关 **************/
}])
/*直播间-横屏*/
.controller('liveRoom_pc', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce', 'myFactory',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('直播间-横屏');
}])
/*主播详情*/
.controller('anchorDetails', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce', 'myFactory',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('主播详情');
  $scope.setGoodsListImgH("#anchorInfoBox"); // 设置盒子高度等于它的宽度

  /*
  * 获取主播信息
  */
  $http.post(
    url + "api/live/other_center",$.param({
      uid : $cookieStore.get("uid"),
      token : $cookieStore.get("token"),
      user_id : $location.search()["user_id"]
    }),
    {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"] == 'ok'){
      $scope.anchorInfo = data["data"];
    }else if(data["status"] == 'error'){
      console.log(data['error']);
    }else if (data['status'] == 'pending') {
      myFactory.loginFun(); // 调用登录失效方法
    }
  })

  /*
  * 录播列表
  */
  $scope.recordingListInfo = [];
  $scope.recordingListFun = function (page) {
    $scope.page = page || 1;
    $http.post(
      url + "api/live/other_live_list",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        p : $scope.page,
        user_id : $location.search()["user_id"]
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.allPage = data["data"]["page"]
        $scope.recordingListInfo.push.apply($scope.recordingListInfo, data["data"]);
      }else if(data["status"] == 'error'){
        console.log(data['error']);
      }
    })
  }
  $scope.recordingListFun()
  /*滚动加载*/
  angular.element(window).scroll(function() {
    $scope.wTop = angular.element(window).scrollTop();
    $scope.bTop = angular.element("body").height();
    $scope.dTop = angular.element(document).height();
    if ($scope.wTop + $scope.bTop >= $scope.dTop) { //下拉到底部加载
      if ($scope.allPage > $scope.page) {
        $scope.recordingListFun(++$scope.page);
      }
    }
  })
  /*
  * 关注与取消关注
  */
  $scope.isFollowClick = function (type) {
    $http.post(
      url + "api/live/follow",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        user_id2 : $scope.anchorInfo.member_id, // 主播id
        type : type
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        if(type==1){
          $scope.anchorInfo.is_follow = 2;
        }else {
          $scope.anchorInfo.is_follow = 1;
        }
      }else if(data["status"] == 'error'){
        console.log(data['data']);
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  /*
  * 跳转到录播页
  */
  $scope.goRecordingClick = function(index){
    $scope.recordingInfo = $scope.recordingListInfo[index];
    $location.path("recording");
    sessionStorage.setItem("recordingInfo",JSON.stringify($scope.recordingInfo));
  }
}])
/*录播*/
.controller('recording', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce', 'myFactory',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('录播');
  $scope.recordingInfo = JSON.parse(sessionStorage.getItem("recordingInfo"));

  /**************** 视频播放部分 start *****************/
  $scope.videoBoxDom = document.getElementById("videoBox"); // 获取video盒子Dom
  $scope.videoDodyDom = document.getElementById("videoBody");

  /*安卓手机*/
  var androidVideoHtml = '<video id="vieoPlayer" width="100%" height="100%" preload="auto" poster="" src="'+ $scope.recordingInfo.url +'" webkit-playsinline="true" x-webkit-airplay="true" x5-video-player-type="h5" x5-video-player-fullscreen="true" style="object-fit: cover; border: 0px; background: rgb(0, 0, 0);"></video>'
  
  /*ios手机*/
  var iosVideoHtml = '<video id="vieoPlayer" width="100%" height="100%" preload="auto" poster="" src="'+ $scope.recordingInfo.url +'" playsinline="true" webkit-playsinline="webkit-playsinline" style="object-fit: cover; border: 0px; background: rgb(0, 0, 0);"></video>'
  
  /**********************
   * 判断是iOS还是android
   ***********************/
  var ua = navigator.userAgent.toLowerCase();
  if (ua.match(/iPhone\sOS/i) == "iphone os") { //ios
    $scope.videoBoxDom.innerHTML = iosVideoHtml;
  } else if (ua.match(/Android/i) == "android") { //安卓
    $scope.videoBoxDom.innerHTML = androidVideoHtml;
  }
  $scope.video = document.getElementById("vieoPlayer"); // 获取video
  /* 判断是暂停还是播放 */
  $scope.pausedFun = function(){
    if($scope.video.paused) {
      $scope.video.play();
      angular.element("#playIcon").hide();
      angular.element("#playImgBox").hide(); // 隐藏封面图
    }else{
      $scope.video.pause();
      angular.element("#playIcon").show();
      angular.element("#playImgBox").show(); // 显示封面图
    }
  }
  /*触摸事件*/
  $scope.videoDodyDom.addEventListener("touchstart", function(){
    $scope.pausedFun();
  });

  $scope.video.onended = function() {
    myFactory.promptFun('视频播放完啦！', 2000);
    angular.element("#playIcon").show();
    angular.element("#playImgBox").show(); // 显示封面图
  };

  /**************** 视频播放部分 start *****************/
}])
/*商铺搜索or主播搜索*/
.controller('searchLiveShop', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce', 'myFactory',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('商铺搜索or主播搜索');
  /*
  * 推荐商铺
  */
  $http.post(
    url + "api/Mall/showMerchants",$.param({
      pagesize: 10
    }),
    {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"] == 'ok'){
      $scope.recommendShopInfo = data["data"];
    }else if(data["status"] == 'error'){
      console.log(data['data']);
    }
  })

  /*
  * 搜索商铺or主播
  */
  $scope.searchState = false;
  $scope.searchListInfo = [];
  $scope.searchFun = function (memberType,type,page) {
    sessionStorage.setItem("searchTxt",$scope.searchTxt);
    $scope.searchState = true;
    // if(!$scope.searchTxt){
    //   myFactory.promptFun("关键字不能为空",1300);
    //   return false;
    // }
    $scope.memberType = memberType || 0;
    $scope.page = page || 1;
    $scope.type = type || 1;
    $http.post(
      url + "api/Mall/searchMerchants",$.param({
        name: $scope.searchTxt,
        p: $scope.page,
        type: $scope.type,
        merchants_id : $location.search()["merchants_id"] || '',
        pagesize: 10,
        member_type: memberType // 1(主播)
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        if(data["data"]["merchants_list"].length == 0){
          myFactory.promptFun("抱歉，没有搜索到相关的内容",1300);
          return false;
        }
        $scope.allPage = data["data"]["page"];
        $scope.searchListInfo.push.apply($scope.searchListInfo, data["data"]["merchants_list"]);
      }else if(data["status"] == 'error'){
        console.log(data['data']);
        myFactory.promptFun(data["data"],1300)
      }
    })
  }
  /*
  * 搜索按钮事件
  */
  $scope.searchClick = function (){
    $scope.searchListInfo = [];
    $scope.searchFun();
  }
  /*
  * 一级tab切换
  */
  $scope.oneLevelClick = function(memberType){ 
    $scope.searchListInfo = [];
    $scope.searchFun(memberType);
    sessionStorage.setItem("memberType",memberType);
  }
  /*
  * 二级tab切换
  */
  $scope.twoLevelClick = function(type){
    $scope.searchListInfo = [];
    $scope.searchFun($scope.memberType,type);
    sessionStorage.setItem("type",type);
  }

  // if(sessionStorage.getItem("searchTxt") && sessionStorage.getItem("searchTxt") !=''){
  //   $scope.searchTxt = sessionStorage.getItem("searchTxt");
  //   if(sessionStorage.getItem("memberType") && sessionStorage.getItem("memberType") !=''){
  //     if(sessionStorage.getItem("type") && sessionStorage.getItem("type") !=''){
  //       $scope.searchFun(sessionStorage.getItem("memberType"),sessionStorage.getItem("type"));
  //     }else {
  //       $scope.searchFun();
  //     }
  //   }
  // }
  /*
  * 主播列表跳转
  */
  $scope.goLiveRoomClick = function (index) {
    if($scope.searchListInfo[index].live_id !=0){
      $location.path("liveRoom_mobile").search({live_id:$scope.searchListInfo[index].live_id,room_id:$scope.searchListInfo[index].room_id});
    }else {
      $location.path("anchorDetails").search({user_id:$scope.searchListInfo[index].member_id})
    }
  }
  /*滚动加载*/
  angular.element(window).scroll(function() {
    $scope.wTop = angular.element(window).scrollTop();
    $scope.bTop = angular.element("body").height();
    $scope.dTop = angular.element(document).height();
    if ($scope.wTop + $scope.bTop >= $scope.dTop) { //下拉到底部加载
      if ($scope.allPage > $scope.page) {
        $scope.searchFun($scope.memberType,$scope.type,++$scope.page);
      }
    }
  })
}])

/*直播间测试*/
.controller('liveRoom_test', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('直播间测试');

  $scope.videoDodyDom = document.getElementById("liveRoom");
  $scope.videoBoxDom = document.getElementById("videoBox"); // 获取video父盒子Dom

  /*获取聊天室DOM元素*/
  $scope.msgBoxDom = document.getElementById("msgBox");
  $scope.chatInfoDom = angular.element("#chatInfo"); //聊天室信息内容框
  $scope.bottomBoxDom = document.getElementById("bottomBox");
  sessionStorage.setItem("live_id",$location.search()["live_id"]);

  /*
  * 进入直播间
  */
  $http.post(
    url + "api/live/into_live",$.param({
      uid : $cookieStore.get("uid"),
      token : $cookieStore.get("token"),
      live_id : $location.search()["live_id"]
    }),
    {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"] == 'ok'){
      $scope.into_liveInfo = data["data"];
      $scope.chatInfoDom.append('<div class="f12 pb5"><span class="col_fff">直播消息：</span><span class="col_d55343">'+ data["data"].prompt +'</span></div>');
    }else if(data["status"] == 'error'){
      console.log(data['data']);
    }else if (data['status'] == 'pending') {
      myFactory.loginFun(); // 调用登录失效方法
    }
  })
  /*
  * 获取直播信息
  */
  $http.post(
    url + "api/Live/live_info",$.param({
      live_id: $location.search()["live_id"]
    }),
    {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"] == 'ok'){
      $scope.liveInfo = data["data"];
      /*安卓手机*/
      var androidVideoHtml = '<video id="vieoPlayer" width="100%" height="100%" preload="auto" poster="" src="'+ data["data"].play_address_m3u8 +'" webkit-playsinline="true" x-webkit-airplay="true" x5-video-player-type="h5" x5-video-player-fullscreen="true" style="object-fit: cover; border: 0px; background: rgb(0, 0, 0);"></video>'
      /*ios手机*/
      var iosVideoHtml = '<video id="vieoPlayer" width="100%" height="100%" preload="auto" poster="" src="'+ data["data"].play_address_m3u8 +'" playsinline="true" webkit-playsinline="webkit-playsinline"></video>'
      /**********************
       * 判断是iOS还是android
       ***********************/
      var ua = navigator.userAgent.toLowerCase();
      if (ua.match(/iPhone\sOS/i) == "iphone os") { //ios
        $scope.videoBoxDom.innerHTML = iosVideoHtml;
      } else if (ua.match(/Android/i) == "android") { //安卓
        $scope.videoBoxDom.innerHTML = androidVideoHtml;
      }
      $scope.video = document.getElementById("vieoPlayer"); // 获取video

      /*触摸事件*/
      $scope.videoDodyDom.addEventListener("touchstart", function(){
        $scope.video.play() // 播放
        angular.element("#playIcon").hide();
        angular.element("#playImgBox").hide(); // 隐藏封面图
      });

      // $scope.video.addEventListener('ended', function (e) {
      //   alert("播放停止")
      // })

      $scope.getGiftFun();
      $scope.anchorInfoFun(); //获取主播信息
    }else if(data["status"] == 'error'){
      console.log(data['data']);
    }
  })

  /***************** 环信相关 start *******************/
  /*环信登录配置*/
  $scope.hxLogin = {
    apiUrl: WebIM.config.apiURL,
    user: $cookieStore.get('hx_username'),
    pwd: $cookieStore.get('hx_password'),
    appKey: WebIM.config.appkey,
    success: function(e) {
      console.log('登录成功！');
      $scope.conn.setPresence(); // 设置上线
    },
    error: function() {
      console.log("登录失败！");
    }
  }
  $scope.conn.open($scope.hxLogin);// 登录

  /*加入聊天室*/
  $scope.joinRoom = function () {
    $scope.conn.joinChatRoom({
        roomId: $location.search()["room_id"] // 聊天室id
    });
  };
  /*退出聊天室*/
  $scope.quitRoom = function () {
    $scope.conn.quitChatRoom({
      roomId: $location.search()["room_id"] // 聊天室id
    });
  }

  /*环信回调函数*/
  $scope.conn.listen({
    
    onTextMessage: function ( message ) {     //收到文本消息
      /*****聊天室*****/
      if (message.type == 'chatroom' && message.to == $location.search()["room_id"]) {
        console.log(message);
        if (message.ext.intoroom == '1' || message.ext.intoroom == '2') {
          //如果有这两个值，刷新直播间人数
          $scope.liveRoomUserListFun();
        }
        if(message.ext.gift_id){ // 收到礼物消息
          console.log('收到礼物消息')
          // 刷新礼物数量
          $scope.getGiftFun();
          $scope.chatInfoDom.append('<div class="f12 pb5 col_fff"><span class="col_156ee7">' + message.ext.username + '</span>送了主播<span class="col_red">'+ message.ext.gift_num +'</span>个<span class="col_fff">' + message.ext.giftname + '</span></div>');
        }else{ // 普通消息
          $scope.chatInfoDom.append('<div class="f12 pb5"><span class="col_e4c931">' + message.ext.username + '：</span><span class="col_fff">' + message.data + '</span></div>');
        }
        angular.element('#msgBox').scrollTop($scope.bottomBoxDom.offsetTop);//消息显示在最底部
      }
    },    
    onCmdMessage: function ( message ) {      //收到命令消息
      console.log(message.action);
      // 直播结束
      if(message.action == 'anchorStopLive'){
        myFactory.promptFun('直播已结束',1300);
      }
      // 商品置顶
      if(message.action == 'MerchantsLivingGoods') {
        $scope.liveGoodsListFun();
      }
    },
    onOpened: function ( message ) {          //连接成功回调
      console.log('连接成功')
      $scope.conn.setPresence(); // 设置手动上线
      $scope.sendRoomText(1);
      $timeout(function() {
        $scope.joinRoom(); //加入聊天室
      }, 1000);
    },  
    onClosed: function ( message ) {          //连接关闭回调
      console.log("连接关闭")
    },         
    onOnline: function ( m ) { //本机网络连接成功
      console.log(m)
    },                  
    onOffline: function () {},                 //本机网络掉线
    onError: function ( message ) {
      console.log('连接失败')
    }
  });

  /*发送普通文本消息*/
  $scope.sendRoomText = function(inChat) {
    $scope.msgTextId = $scope.conn.getUniqueId(); // 生成本地消息id
    $scope.msg = new WebIM.message("txt", $scope.msgTextId); // 创建文本消息
    if (inChat == 1) {
      $scope.text = '进入了直播间';
      $scope.intoroom = 1;
    } else if (inChat == 2) {
      $scope.text = '离开了直播间';
      $scope.intoroom = 2;
    } else {
      $scope.text = $scope.liveMsg;
      $scope.intoroom = '';
    }
    $scope.msgText = {
      msg: $scope.text, // 消息内容
      to: $location.search()["room_id"], // 接收消息对象(聊天室id)
      roomType: true,
      chatType: 'chatRoom',
      /*用户自扩展的消息内容（群聊用法相同）*/
      ext: {
        /******用户信息扩展字段*******/
        username: $scope.userInfo.username, //用户名
        user_id: $scope.userInfo.member_id, //用户id
        userimg: $scope.userInfo.header_img, //用户头像
        intoroom: $scope.intoroom,
      },
      success: function() {
        console.log('普通消息发送成功');
        if(inChat != 1 ){
          $scope.chatInfoDom.append('<div class="f12 pb5"><span class="col_e4c931">' + $scope.userInfo.username + '：</span><span class="col_fff">' + $scope.text + '</span></div>');
        }
        angular.element('#msgBox').scrollTop($scope.bottomBoxDom.offsetTop);//消息显示在最底部
      },
      fail: function() {
        console.log('普通消息发送失败');
      }
    }
    //发送成功清除输入框
    $scope.liveMsg = null;
    $scope.msg.set($scope.msgText);
    $scope.msg.setGroup('groupchat');
    $scope.conn.send($scope.msg.body);
  };
  /*普通消息发送按钮*/
  $scope.sendMsgClick = function() {
    if ($scope.liveMsg == null) {
      return false;
    }
    $scope.sendRoomText();
  }

  /*发送礼物消息*/
  $scope.sendRoomGift = function(giftObj) {
    $scope.msgGiftId = $scope.conn.getUniqueId(); // 生成本地消息id
    $scope.msg = new WebIM.message("txt", $scope.msgGiftId); // 创建文本消息
    $scope.msgGift = {
      msg: '', // 消息内容
      to: $location.search()["room_id"], // 接收消息对象(聊天室id)
      roomType: true,
      chatType: 'chatRoom',
      /*用户自扩展的消息内容（群聊用法相同）*/
      ext: {
        /******用户信息扩展字段*******/
        username: $scope.userInfo.username.toString(), //用户名
        user_id: $scope.userInfo.member_id.toString(), //用户id
        userimg: $scope.userInfo.header_img.toString(), //用户头像
        intoroom: '',
        /******* 礼物消息扩展字段 ********/
        giftimg: giftObj.img.toString(),
        giftname: giftObj.name.toString(),
        gift_id: giftObj.gift_id.toString(),
        gift_num: giftObj.num.toString()
      },
      success: function() {
        console.log('礼物消息发送成功');
        $scope.chatInfoDom.append('<div class="f12 pb5 col_fff"><span class="col_156ee7">你</span>送了主播<span class="col_red">'+ giftObj.num +'</span>个<span>' + giftObj.name + '</span></div>');
        angular.element('#msgBox').scrollTop($scope.bottomBoxDom.offsetTop);//消息显示在最底部
      },
      fail: function() {
        console.log('礼物消息发送失败');
      }
    }
    $scope.msg.set($scope.msgGift);
    $scope.msg.setGroup('groupchat');
    $scope.conn.send($scope.msg.body);
  };

  /*监听$destory事件，这个事件会在页面发生跳转的时候触发。*/
  $scope.$on("$destroy", function() {
    console.log('页面发生跳转')
    $scope.sendRoomText(2); // 给聊天时发送离开直播间消息
    $scope.conn.close(); //退出登录(断开连接)
    $scope.outListRoom(); // 退出直播间
  });
  /***************** 环信相关 end *******************/
  /*
  * 关注与取消关注
  */
  $scope.isFollowClick = function (type) {
    $http.post(
      url + "api/live/follow",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        user_id2 : $scope.liveInfo.user_id, // 主播id
        type : type
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        if(type==1){
          $scope.into_liveInfo.is_follow = 2;
        }else {
          $scope.into_liveInfo.is_follow = 1;
        }
      }else if(data["status"] == 'error'){
        console.log(data['data']);
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  /*退出直播间*/
  $scope.outListRoom = function () {
    $http.post(
      url + "api/live/out_live",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        live_id : sessionStorage.getItem("live_id")
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        console.log(data["data"]);
      }else if(data["status"] == 'error'){
        console.log(data['data']);
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }

  /*直播间用户列表*/
  $scope.liveRoomUserListFun = function () {
    $http.post(
      url + "api/live/show_viewer",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        live_id : $location.search()["live_id"],
        page: 1,
        pagesize: 5
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.liveRoomCount = data["data"]["count"];
        $scope.liveRoomUserListInfo = data["data"]["list"];
      }else if(data["status"] == 'error'){
        console.log(data['error']);
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  $scope.liveRoomUserListFun();
  $scope.aMk = 0;   //控制主播信息显示隐藏
  $scope.aMkFun = function(d) {
    $scope.aMk = d;
  }
   /*获取主播信息*/
  $scope.anchorInfoFun = function () {
    $http.post(
      url + "/api/live/get_live_info",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        live_id : $location.search()["live_id"],
        user_id: $scope.liveInfo.user_id
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.anchorInfo = data["data"];
      }else if(data["status"] == 'error'){
        console.log(data['error']);
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
   /*举报接口*/
  $scope.reportFun = function () {
    $http.post(
      url + "/api/live/report",$.param({
        uid : $cookieStore.get("uid"),
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
         myFactory.promptFun(data['data'], 1300);
      }else if(data["status"] == 'error'){
        myFactory.promptFun(data['error'], 1300);
        console.log(data['error']);
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  
  /*直播间商品列表*/
  $scope.liveGoodsListFun = function() {
    $http.post(
      url + "api/merchant/live_goods",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        live_id : $location.search()["live_id"]
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.liveGoodsListInfo = data["data"];
        for(var i=0; i<data["data"].length; i++){
          if(data["data"][i].is_top == 1){
            $scope.topGoods = data["data"][i]
            return false
          }
        }
      }else if(data["status"] == 'error'){
        console.log(data['error']);
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  $scope.liveGoodsListFun();

  /*输入框model事件*/
  $scope.inputModelClick = function (t){ // t=1(打开),t=2(关闭)
    if(t==1){
      angular.element("#bottomInputBox").show();
      angular.element("#liveRoomInput").focus();
    }else{
      angular.element("#bottomInputBox").hide();
    }
  }

  /************** 礼物相关 **************/
  /*
  * 获取当前用户的账户余额
  */
  $scope.getMonyFun = function(){
    $http.post(
      url + "api/live/get_money",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token")
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.user_mony = data["data"]["money"];
      }else if(data["status"] == 'error'){
        console.log(data['data']);
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  $scope.getMonyFun();
  /*直播间礼物列表*/
  $http.post(
    url + "api/live/gift_list",$.param({
      uid : $cookieStore.get("uid"),
      token : $cookieStore.get("token")
    }),
    {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"] == 'ok'){
      $scope.giftListInfo = data["data"]
      $scope.giftObj = $scope.giftListInfo[0]; //默认选中第一个礼物
    }else if(data["status"] == 'error'){
      console.log(data['error']);
    }else if (data['status'] == 'pending') {
      myFactory.loginFun(); // 调用登录失效方法
    }
  })
  /* 主播收到的礼物数量 */
  $scope.getGiftFun = function(){
    $http.post(
      url + "api/live/get_get_money",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        user_id : $scope.liveInfo.user_id
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.giftNum = data["data"]
      }else if(data["status"] == 'error'){
        console.log(data['error']);
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }

  /*礼物点击事件*/
  $scope.giftClick = function (giftObj) {
    $scope.giftObj = giftObj;
    console.log($scope.giftObj)
  }
  /*
  * 送礼按钮点击事件
  */
  $scope.num = 1;
  var zz = /^[0-9]*[1-9][0-9]*$/;　　//正整数
  $scope.sendBtnClick= function () {
    if(!zz.test($scope.num)) {
      myFactory.promptFun('请输入正整数！', 1300);
    } else {
      $http.post(
      url + "api/live/give_gift",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        live_id : $location.search()["live_id"],
        gift_id : $scope.giftObj.gift_id,
        number : $scope.num || '1'
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.giftObj.num = $scope.num || 1;
        $scope.sendRoomGift($scope.giftObj)
        $scope.giftModelClick(2);
        $scope.getMonyFun();
      }else if(data["status"] == 'error'){
        myFactory.promptFun(data["data"],1300);
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
    }
  }
  /************** 礼物相关 **************/
}])
/**/
.controller('a', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce', 'myFactory',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('');
}])






