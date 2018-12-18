/*直播间-测试*/
app.controller('liveRoom_test', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('直播间-竖屏');
  $scope.video = document.querySelector('video'); // 获取video

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
      $scope.liveInfo = data["data"]
      /* 设置播放流*/
      // angular.element("#vieoPlayer").attr('src',data["data"].play_address_m3u8)
    }else if(data["status"] == 'error'){
      console.log(data['data']);
    }
  })
  /**************** 视频播放部分 start *****************/
  /*触摸事件*/
  document.getElementById("videoPlayBox").addEventListener("touchstart", function(){
    console.log("触摸了屏幕")
    angular.element("#playImgBox").hide(); // 隐藏封面图
    $scope.video.play() // 播放
  });
  /**************** 视频播放部分 start *****************/

  /***************** 环信相关 start *******************/
  /*创建环信链接*/
  $scope.conn = new WebIM.connection({
    https: WebIM.config.https,
    url: WebIM.config.xmppURL,
    isAutoLogin: WebIM.config.isAutoLogin,
    isMultiLoginSessions: WebIM.config.isMultiLoginSessions
  });

  /*环信登录配置*/
  $scope.options = {
    apiUrl: WebIM.config.apiURL,
    user: $cookieStore.get('hx_username'),
    pwd: $cookieStore.get('hx_password'),
    appKey: WebIM.config.appkey,
    success: function(e) {
      console.log('登录成功！');
      $timeout(function() {
        $scope.joinRoom(); //加入聊天室
      }, 800);
    },
    error: function() {
      console.log("登录失败！");
    }
  }
  
  /*加入聊天室*/
  $scope.joinRoom = function () {
    // $scope.sendRoomText(1);
    $scope.conn.joinChatRoom({
        roomId: $location.search()["room_id"] // 聊天室id
    });
  };
  /*退出聊天室*/
  $scope.quitRoom = function () {
    $scope.sendRoomText(2); //给聊天室发送离开消息
    $scope.conn.quitChatRoom({
      roomId: $location.search()["room_id"] // 聊天室id
    });
  }

  /*环信回调函数*/
  $scope.conn.listen({
    onOpened: function ( message ) {          //连接成功回调
      console.log('连接成功')
      $scope.conn.setPresence(); // 设置手动上线
    },  
    onClosed: function ( message ) {          //连接关闭回调
      console.log("连接关闭")
    },         
    onTextMessage: function ( message ) {     //收到文本消息
      console.log(message)
      /*****聊天室*****/
      if (message.type == 'chatroom' && message.to == $location.search()["room_id"]) {
        console.log(message);
        if (message.ext.intoroom == '1' || message.ext.intoroom == '2') {
          //如果有这两个值，刷新直播间人数
          $scope.liveRoomUserListFun();
        }
        console.log("普通消息")
        $scope.chatInfo.append('<div class="f12 pb5"><span class="col_e4c931">' + message.ext.username + '：</span><span class="col_fff">' + message.data + '</span></div>');
        angular.element('#msgBox').scrollTop($scope.bottomBox.offsetTop);//消息显示在最底部
      }
    },    
    onCmdMessage: function ( message ) {      //收到命令消息
      console.log(message.action);
    },     
    onPresence: function ( message ) {         // 聊天室相关回调
      $scope.handlePresence(message);
    },
    onPresence: function ( message ) {},       //处理“广播”或“发布-订阅”消息，如联系人订阅请求、处理群组、聊天室被踢解散等消息
    onOnline: function () {},                  //本机网络连接成功
    onOffline: function () {},                 //本机网络掉线
    onError: function ( message ) {
      console.log('连接失败')
    },          //失败回调
    onReceivedMessage: function(message){},    //收到消息送达服务器回执
    onDeliveredMessage: function(message){},   //收到消息送达客户端回执
    onReadMessage: function(message){},        //收到消息已读回执
    onMutedMessage: function(message){}        //如果用户在A群组被禁言，在A群发消息会走这个回调并且消息不会传递给群其它成员
  });

  /*处理聊天室回调方法*/
  $scope.handlePresence = function(e) {
    console.log(e.type);
    if (e.type === 'joinChatRoomSuccess') { //加入成功
      console.log("加入成功");
      $scope.joinChatRoomSuccess = 1
      $scope.sendRoomText(1);
    }
    if (e.type === 'deleteGroupChat') { //聊天室被删除
      console.log("聊天室已解散");
    }
    if (e.type === 'joinChatRoomFailed') { //加入失败
      console.log("加入失败");
    }
  };

  /*获取聊天室DOM元素*/
  $scope.msgBox = document.getElementById("msgBox");
  $scope.chatInfo = angular.element("#chatInfo"); //聊天室信息内容框
  $scope.bottomBox = document.getElementById("bottomBox");
  /*发送普通文本消息*/
  $scope.sendRoomText = function(inChat) {
    console.log($scope.userInfo.member_id);
    var id = $scope.conn.getUniqueId(); // 生成本地消息id
    $scope.msg = new WebIM.message("txt", id); // 创建文本消息
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
    $scope.option = {
      msg: $scope.text, // 消息内容
      to: $location.search()["room_id"], // 接收消息对象(聊天室id)
      roomType: true,
      chatType: 'chatRoom',
      /*用户自扩展的消息内容（群聊用法相同）*/
      ext: {
        /******用户信息扩展字段*******/
        username: $scope.userInfo.username.toString(), //用户名
        user_id: $scope.userInfo.member_id.toString(), //用户id
        userimg: $scope.userInfo.header_img.toString(), //用户头像
        intoroom: $scope.intoroom.toString()
      },
      success: function() {
        console.log('普通消息发送成功');
        $scope.chatInfo.append('<div class="f12 pb5"><span class="col_e4c931">' + $scope.userInfo.username + '：</span><span class="col_fff">' + $scope.text + '</span></div>');
        angular.element('#msgBox').scrollTop($scope.bottomBox.offsetTop);//消息显示在最底部
      },
      fail: function() {
        console.log('普通消息发送失败');
      }
    }
    //发送成功清除输入框
    $scope.liveMsg = null;
    $scope.msg.set($scope.option);
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

  /*监听$destory事件，这个事件会在页面发生跳转的时候触发。*/
  $scope.$on("$destroy", function() {
    console.log('页面发生跳转')
    $scope.outListRoom(); // 退出直播间
  });
  /***************** 环信相关 end *******************/

  /*进入直播间*/
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
      $scope.conn.open($scope.options);// 登录
      // $scope.chatInfo.append('<div class="f12 pb5"><span class="col_fff">直播消息：</span><span class="col_d55343">'+ data["data"].prompt +'</span></div>');
    }else if(data["status"] == 'error'){
      console.log(data['error']);
    }else if (data['status'] == 'pending') {
      myFactory.loginFun(); // 调用登录失效方法
    }
  })

  /*退出直播间*/
  $scope.outListRoom = function () {
    $http.post(
      url + "api/live/out_live",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        live_id : $location.search()["live_id"]
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        console.log(data["data"])
        $scope.quitRoom(); //调用退出聊天室方法
        $scope.conn.close(); //退出登录(断开连接)
      }else if(data["status"] == 'error'){
        console.log(data['error']);
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

  /*直播间商品列表*/
  $scope.getGoodsListState = 0;
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
        $scope.getGoodsListState = 1;
        $scope.liveGoodsListInfo = data["data"];
      }else if(data["status"] == 'error'){
        console.log(data['error']);
        $scope.getGoodsListState = 0;
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }

  /*输入框与商品列表model事件*/
  $scope.inputModelClick = function (t,dom){ // t=1(打开),t=2(关闭)
    if(t==1){
      angular.element(dom).show();
      angular.element("#bottomFunBox").hide();
      if(dom=='#bottomInputBox'){ // 打开输入框
        angular.element("#liveRoomInput").focus();
      }else if(dom=='#liveRoomGoodsListBox' && $scope.getGoodsListState == 0){ // 打开商品列表box
        $scope.liveGoodsListFun();
      }
    }else{
      angular.element(dom).hide();
      angular.element("#bottomFunBox").show();
    }
  }

  /************** 礼物相关 **************/
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
    }else if(data["status"] == 'error'){
      console.log(data['error']);
    }else if (data['status'] == 'pending') {
      myFactory.loginFun(); // 调用登录失效方法
    }
  })
  /* 礼物弹窗打开关闭事件 */
  $scope.giftModelClick = function (t) {
    if(t==1){
      angular.element("#liveRoomGiftBox").show();
    }else{
      angular.element("#liveRoomGiftBox").hide();
    }
  }

  /*礼物点击事件*/
  $scope.giftClick = function (id) {
    $scope.gift_id = id;
    console.log($scope.gift_id)
  }
  /*送礼*/
  $scope.giveGiftClick = function () {
    $http.post(
      url + "api/live/give_gift",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        live_id : $location.search()["live_id"],
        gift_id : $scope.gift_id
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.giftModelClick(2);
        myFactory.promptFun(data["data"],1300);
      }else if(data["status"] == 'error'){
        myFactory.promptFun(data["data"],1300);
        console.log(data['error']);
      }else if (data['status'] == 'pending') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  /************** 礼物相关 **************/
}])