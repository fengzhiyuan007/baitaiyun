/*个人中心*/
app.controller('me', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('个人中心');
  $rootScope.footerType = 4; // 底部导航切换使用
  $scope.userInfoFun();
  if($location.search()["confirmOrder"]==1){
    $cookieStore.put("confirmOrder_orderDetails",1)
  }
  /*订单状态点击*/
  $scope.orderTypeClick = function(state){
    sessionStorage.setItem("orderType",state);
    $location.path("orderList");
  }
  /*
  * 判断是否有未读消息
  */
  $http.post(
    url + "api/User/has_message",$.param({
      uid : $cookieStore.get("uid"),
      token : $cookieStore.get("token")
    }),
    {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"] == 'ok'){
      $scope.has_msg = data["data"]
    }else if(data["status"] == 'error'){
      console.log(data['data']);
    }else if (data['error'] == 'token failed') {
      myFactory.loginFun(); // 调用登录失效方法
    }
  })
}])
/*个人资料*/
.controller('userDetails', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('个人资料');
  /*上传图片*/
  $scope.uploadUserImg = function(parsentDom, dom) {
    $http({
      method: 'POST',
      url: url + "api/login/upload",
      data: {},
      headers: {
        'Content-Type': undefined
      },
      transformRequest: function(data) {
        var formData = new FormData(document.getElementById(parsentDom));
        formData.append("img", document.getElementById(dom)); //实际上传
        return formData;
      }
    }).success(function(data) {
      console.log(data)
      if (data.status == "ok") {
        $scope.userInfo.header_img = data["data"][0];
      }
    }).error(function(err, status) {
      console.log(err)
    });
  };

  /*修改个人信息*/
  $scope.editUserInfo = function(){
    $http.post(
      url + "api/user/edit_user",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        username :  $scope.userInfo.username,//呢称
        header_img :  $scope.userInfo.header_img,//头像
        sex: $scope.userInfo.sex, //性别
        signature: $scope.userInfo.signature
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        myFactory.promptBackFun("修改成功",1300);
      }else if(data["status"] == 'error'){
        console.log(data['error']);
        myFactory.promptBackFun("修改失败",1300);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
}])
/*我的地址列表*/
.controller('my_address', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce', 'myFactory',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('我的地址列表');
  /* 获取地址列表 */
  $scope.addressListFun = function () {
    $http.post(
      url + "api/Address/queryAddressList",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token")
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == "ok"){
        $scope.addressListInfo = data["data"];
      }else if(data["status"] == "error"){
        console.log(data["data"])
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  $scope.addressListFun();
  /* 设置默认/删除地址 */
  $scope.setAddressFun = function(address_id,type){ // type:1(设置默认)，2(删除)
    if(type==1){ 
      $scope.address_api = 'api/Address/saveDefaultAddress';
    }else if(type == 2){
      $scope.address_api = 'api/Address/delAddress'
    }
    $http.post(
      url + $scope.address_api,$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        address_id : address_id
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == "ok"){
        $scope.addressListFun();
        myFactory.promptFun(data["data"],1500);
        if($location.search()["confirmOrder"] && type == 1){
          history.go(-1);
        }
      }else if(data["status"] = "error"){
        myFactory.promptFun(data["data"],1500);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  /* 打开新增／编辑地址model */
  $scope.openAddressModel = function(type,addressObj){ // type:1(新增)，2(编辑)
    $scope.address_model = type;
    $scope.addressObj = addressObj;
    if(type==1){
      $scope.is_default = 0;
      $scope.mobile = "";
      $scope.name = ""; //姓名
      $scope.address_detailed = ""; //详细地址 
      $scope.address_zip_code = "";//邮编
      $scope.addressArr = ['上海','上海市','浦东新区'];//省 市 区
      angular.element("#city-picker").val('上海 上海市 浦东新区');
    }else{
      $scope.is_default = $scope.addressObj.is_default;
      $scope.mobile = $scope.addressObj.address_mobile;
      $scope.name = $scope.addressObj.address_name; //姓名
      $scope.addressArr = [$scope.addressObj.address_province,$scope.addressObj.address_city,$scope.addressObj.address_country];//省 市 区
      angular.element("#city-picker").val($scope.addressObj.address_province+' '+$scope.addressObj.address_city+' '+$scope.addressObj.address_country);
      $scope.address_detailed = $scope.addressObj.address_detailed; //详细地址 
      $scope.address_zip_code = $scope.addressObj.address_zip_code;//邮编
    }
    angular.element(".add_addressModel").show();
  }
  /* 调用省市区联动插件*/
  angular.element("#city-picker").cityPicker({
    title: "选择省市区/县",
    onChange: function (picker, values, displayValues) {
      console.log(values, displayValues);
      $scope.addressArr = displayValues;
    }
  });
  /*添加地址设置默认*/
  $scope.addSetDefaultClick = function (is_default) {
    if(is_default==0){
      $scope.is_default = 1;
    }else{
      $scope.is_default = 0;
    }
  }
  /*添加／编辑地址*/
  $scope.add_edit_addressFun = function(){ 
    if(!$scope.name){
      myFactory.promptFun("姓名不能为空",1300);
      return false;
    } else if(!$scope.phoneReg.test($scope.mobile)) {
      myFactory.promptFun("手机号码格式不正确", 1300);
      return false;
    } else if(!$scope.addressArr) {
      myFactory.promptFun("请选择地区", 1300);
      return false;
    } else if(!$scope.address_detailed) {
      myFactory.promptFun("请输入详细地址", 1300);
      return false;
    }
    if($scope.address_model==1){ // 新增
      $scope.add_edit_api = 'api/Address/insertAddress';
      $scope.add_edit_obj = {
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        address_mobile: $scope.mobile, // 手机号
        address_name: $scope.name, //姓名
        address_province: $scope.addressArr[0], //省
        address_city: $scope.addressArr[1], //市
        address_country: $scope.addressArr[2], //区
        address_detailed: $scope.address_detailed, //详细地址 
        address_zip_code: $scope.address_zip_code,//邮编
        is_default: $scope.is_default
      }
    }else{ // 编辑
      $scope.add_edit_api = 'api/Address/saveAddress';
      $scope.add_edit_obj = {
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        address_id : $scope.addressObj.address_id,
        address_mobile: $scope.mobile, // 手机号
        address_name: $scope.name, //姓名
        address_province: $scope.addressArr[0], //省
        address_city: $scope.addressArr[1], //市
        address_country: $scope.addressArr[2], //区
        address_detailed: $scope.address_detailed, //详细地址 
        address_zip_code: $scope.address_zip_code,//邮编
        is_default: $scope.is_default
      }
      console.log($scope.is_default)
    }
    $http.post(
      url + $scope.add_edit_api,$.param($scope.add_edit_obj),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == "ok"){
        $scope.addressListFun();
        angular.element(".add_addressModel").hide();
      }else if(data["status"] = "error"){
        myFactory.promptFun(data["error"],1500);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
}])
/*我的账户*/
.controller('my_account', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('我的账户');

  /*获取充值列表*/
  $scope.getRechargeInfoFun = function () {
    myFactory.httpPost("api/User/price_list",{
      uid : $cookieStore.get("uid"),
      token : $cookieStore.get("token")
    }).then(function(data){ //正确
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.rechargeInfo = data["data"];
      }else if(data["status"] == 'error'){
        console.log(data['data']);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    },function(data){ //错误
      console(data)
    });
  }
  $scope.getRechargeInfoFun();
}])
/*我的收藏*/
.controller('my_collection', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','$window', 'myFactory',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore,$window, $sce,myFactory) {
  console.log('我的收藏');
  /*获取收藏列表*/
  $scope.collectionListInfo = [];  
  $scope.getCollectionListFun = function(page){
    $scope.page = page || 1;
    $http.post(
      url + "api/Mall/collect",$.param({
        uid: $cookieStore.get("uid"),
        token: $cookieStore.get("token"),
        p : $scope.page,
        pagesize : 10
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.allPage = data["data"]["page"];
        $scope.collectionListInfo.push.apply($scope.collectionListInfo, data["data"]["list"]);
        console.log($scope.collectionListInfo);
      }else if(data["status"] == 'error'){
        console.log(data['data']);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  $scope.getCollectionListFun();
  /*滚动加载*/
  angular.element(window).scroll(function() {
    var wTop = null,bTop = null,dTop = null;
    wTop = angular.element(window).scrollTop();
    bTop = angular.element("body").height();
    dTop = angular.element(document).height();
    if (wTop + bTop >= dTop) { //下拉到底部加载
      if ($scope.allPage > $scope.page) {
        $scope.getCollectionListFun(++$scope.page);
      }
    }
  })

  /*编辑*/
  $scope.editType = 1;
  $scope.editClick = function(type){
    if(type==1){
      $scope.editType = 2;
    }else{
      $scope.editType = 1;
      $scope.collection_idArr = [];
      angular.element(".check_icon").removeClass("check_act_icon");
    }
  }
  $scope.collection_idArr = [];
  /*单选事件*/
  $scope.collectionItemClick = function(collection_id,$event){
    if(angular.element($event.target).hasClass("check_act_icon")){
      angular.element($event.target).removeClass("check_act_icon");
      if($scope.collection_idArr.contains(collection_id)){
        $scope.collection_idArr.removeOf(collection_id);
      }
    }else{
      angular.element($event.target).addClass("check_act_icon");
      $scope.collection_idArr.push(collection_id);
    }
    if($scope.collection_idArr.length==$scope.collectionListInfo.length){
      angular.element("#allChenk").addClass("check_act_icon");
    }
    console.log($scope.collection_idArr);
  }
  /*全选事件*/
  $scope.allCollectionClick = function ($event){
    if(angular.element($event.target).hasClass("check_act_icon")){
      angular.element(".check_icon").removeClass("check_act_icon");
      $scope.collection_idArr = [];
    }else{
      angular.element(".check_icon").addClass("check_act_icon");
      for(var i=0;i<$scope.collectionListInfo.length;i++){
        $scope.collection_idArr.push($scope.collectionListInfo[i].collection_id)
      }
    }
    console.log($scope.collection_idArr)
  }
  /*取消收藏*/
  $scope.cancelCollectionClick = function(){
    if($scope.collection_idArr.length==0){
      myFactory.promptFun("您还没有选中任何收藏哦！",1300);
      return false;
    }
    $http.post(
      url + "api/Mall/del_collect",$.param({
        uid: $cookieStore.get("uid"),
        token: $cookieStore.get("token"),
        ids: $scope.collection_idArr.join(",")
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        myFactory.promptFun(data["data"],1300);
        myFactory.reloadRoute();
      }else if(data["status"] == 'error'){
        console.log(data['data']);
        myFactory.promptFun(data["data"],1300);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
}])
/*我的关注*/
.controller('my_follow', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('我的关注');
  /*
  * 获取我的关注列表
  */
  $scope.followListInfo = [];  
  $scope.getfollowListFun = function(page){
    $scope.page = page || 1;
    $http.post(
      url + "api/User/user_follow",$.param({
        uid: $cookieStore.get("uid"),
        token: $cookieStore.get("token"),
        p : $scope.page,
        pagesize : 10
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.allPage = data["data"]["page"];
        $scope.followListInfo.push.apply($scope.followListInfo, data["data"]["list"]);
        console.log($scope.followListInfo);
      }else if(data["status"] == 'error'){
        console.log(data['data']);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  $scope.getfollowListFun();
  /*滚动加载*/
  angular.element(window).scroll(function() {
    $scope.wTop = angular.element(window).scrollTop();
    $scope.bTop = angular.element("body").height();
    $scope.dTop = angular.element(document).height();
    if ($scope.wTop + $scope.bTop >= $scope.dTop) { //下拉到底部加载
      if ($scope.allPage > $scope.page) {
        $scope.getfollowListFun(++$scope.page);
      }
    }
  })
  /*
  * 取消关注（单个）
  */
  $scope.delFollowClick = function (id) {
    $http.post(
      url + 'api/User/del_user_follow',$.param({
        uid: $cookieStore.get("uid"),
        token: $cookieStore.get("token"),
        follow_id: id
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      if(data["status"] == 'ok'){
        myFactory.promptFun(data["data"],1300);
        $scope.followListInfo = [];
        $scope.getfollowListFun();
      }else if(data["status"] == 'error'){
        myFactory.promptFun(data["data"],1300);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  /*
  * 全部取消
  */
  $scope.delAllFollowClick = function() {
    $http.post(
      url + 'api/User/del_all_follow',$.param({
        uid: $cookieStore.get("uid"),
        token: $cookieStore.get("token")
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      if(data["status"] == 'ok'){
        $scope.followListInfo = []; 
        myFactory.promptFun(data["data"],1300);
        $scope.getfollowListFun();
      }else if(data["status"] == 'error'){
        myFactory.promptFun(data["data"],1300);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
}])
/*我的优惠券*/
.controller('my_coupon', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('我的优惠券');
  /*
  * 我的优惠券列表
  */
  $scope.couponListInfo = [];
  $scope.getMyCouponListFun = function (type,page) {
    $scope.page = page || 1;
    $scope.type = type || 1;
    console.log($scope.type)
    $http.post(
      url + 'api/User/my_coupon',$.param({
        uid: $cookieStore.get("uid"),
        token: $cookieStore.get("token"),
        status: $scope.type,
        p: $scope.page
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data)
      if(data["status"] == 'ok'){
        $scope.allPage = data["data"]["page"];
        $scope.couponListInfo.push.apply($scope.couponListInfo, data["data"]["list"]);
      }else if(data["status"] == 'error'){
        myFactory.promptFun(data["data"],1300);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  
  /*
  * tab 切换事件
  */
  $scope.couponTabClick = function(type){
    $scope.couponListInfo = [];
    $scope.getMyCouponListFun(type);
    sessionStorage.setItem("couponType",type);
  }
  if(sessionStorage.getItem('couponType') && sessionStorage.getItem('couponType') !=''){
    $scope.getMyCouponListFun(sessionStorage.getItem('couponType'));
  }else{
    $scope.getMyCouponListFun();
  }
  /*滚动加载*/
  angular.element(window).scroll(function() {
    $scope.wTop = angular.element(window).scrollTop();
    $scope.bTop = angular.element("body").height();
    $scope.dTop = angular.element(document).height();
    if ($scope.wTop + $scope.bTop >= $scope.dTop) { //下拉到底部加载
      if ($scope.allPage > $scope.page) {
        $scope.getMyCouponListFun($scope.type,++$scope.page);
      }
    }
  })
}])
/*协议*/
.controller('about', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('协议');
  /*
  * 获取协议
  */
  $scope.title = $location.search()["title"];
  /*
  * 根据id获取html
  */
  // $scope.getHtml = function(id){
  //   $http.get(
  //     url + "api/Merchant/ajax_agreement/id/" + id,
  //   ).success(function(data){
  //     console.log(data)
  //     if(data["status"] == 'ok'){
  //       $scope.settledInfo = $sce.trustAsHtml(data["data"]);
  //     }else if(data["status"] == 'error'){
  //       myFactory.promptFun(data["data"],1300)
  //     }
  //   })
  // }
  $scope.getHtml($location.search()["id"]);
}])
/*消息*/
.controller('news', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('消息');
  /*
  * 判断是否有未读消息
  */
  $http.post(
    url + "api/User/has_message",$.param({
      uid : $cookieStore.get("uid"),
      token : $cookieStore.get("token")
    }),
    {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"] == 'ok'){
      $scope.has_msg = data["data"]
    }else if(data["status"] == 'error'){
      console.log(data['data']);
    }else if (data['error'] == 'token failed') {
      myFactory.loginFun(); // 调用登录失效方法
    }
  })
}])
/*消息*/
.controller('setUp', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('设置');
  
}])
/*消息*/
.controller('feeback', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('意见反馈');
  $scope.feeback = {
    content: '' //意见
  }
  $scope.feebackFun = function () {
    console.log($scope.feeback.content)
    if ($scope.feeback.content == '') {
      myFactory.promptFun('请输入您的意见',1300);
    } else {
      $http.post(
        url + '/api/User/feedback',$.param({
          uid: $cookieStore.get("uid"),
          token: $cookieStore.get("token"),
          content: $scope.feeback.content
        }),
        {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
      ).success(function(data){
        console.log(data)
        if(data["status"] == 'ok'){
          myFactory.promptFun(data["data"],1300);
          $timeout(function () {
            $scope.backFun();
          },1300)
        }else if(data["status"] == 'error'){
          myFactory.promptFun(data["data"],1300);
        }else if (data['error'] == 'token failed') {
          myFactory.loginFun(); // 调用登录失效方法
        }
      })
    }
  }
}])
/*消息详情*/
.controller('newsDetails', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('消息详情');
  $scope.newsType = $location.search()["newsType"]

  /*
  * 获取消息列表
  */
  $scope.msgListInfo = []
  $scope.getMsgListFun = function (page) {
    $scope.page = page || 1;
    $http.post(
      url + 'api/User/message',$.param({
        uid: $cookieStore.get("uid"),
        token: $cookieStore.get("token"),
        type: $location.search()["newsType"],
        p: $scope.page
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data)
      if(data["status"] == 'ok'){
        $scope.allPage = data["data"]["page"];
        $scope.msgListInfo.push.apply($scope.msgListInfo, data["data"]["list"]);
      }else if(data["status"] == 'error'){
        myFactory.promptFun(data["data"],1300);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  $scope.getMsgListFun();
  /*滚动加载*/
  angular.element(window).scroll(function() {
    $scope.wTop = angular.element(window).scrollTop();
    $scope.bTop = angular.element("body").height();
    $scope.dTop = angular.element(document).height();
    if ($scope.wTop + $scope.bTop >= $scope.dTop) { //下拉到底部加载
      if ($scope.allPage > $scope.page) {
        $scope.getMsgListFun(++$scope.page);
      }
    }
  })
}])
/*充值记录*/
.controller('rechargeHistory', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('充值记录');
  
  /*
  * 获取消息列表
  */
  $scope.rechargeHistoryInfo = []
  $scope.getRechargeHistoryFun = function (page) {
    $scope.page = page;
    $http.post(
      url + 'api/User/recharge_record',$.param({
        uid: $cookieStore.get("uid"),
        token: $cookieStore.get("token"),
        p: $scope.page
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data)
      if(data["status"] == 'ok'){
        $scope.allPage = data["data"]["page"];
        $scope.rechargeHistoryInfo.push.apply($scope.rechargeHistoryInfo, data["data"]["data"]);
      }else if(data["status"] == 'error'){
        myFactory.promptFun(data["data"],1300);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  $scope.getRechargeHistoryFun();
  /*滚动加载*/
  angular.element(window).scroll(function() {
    $scope.wTop = angular.element(window).scrollTop();
    $scope.bTop = angular.element("body").height();
    $scope.dTop = angular.element(document).height();
    if ($scope.wTop + $scope.bTop >= $scope.dTop) { //下拉到底部加载
      if ($scope.allPage > $scope.page) {
        $scope.getRechargeHistoryFun(++$scope.page);
      }
    }
  })
}])

/**/
.controller('', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('');
}])
