/*确认订单*/
app.controller('confirmOrder', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce', 'myFactory',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('确认订单');
  if($cookieStore.get("confirmOrder_orderDetails")==1){
    history.go(-1);
    $cookieStore.remove("confirmOrder_orderDetails");
  }
  $scope.confirmOrderObj = JSON.parse(sessionStorage.getItem("confirmOrderObj"));
  console.log(JSON.parse(sessionStorage.getItem("confirmOrderObj")));
  /* 初始化订单json */
  $scope.orderJson = {
    member_id: $cookieStore.get("uid"), // 用户id
    address_id: "", // 地址ID
    deduct_integral_value: "", // 抵扣积分
    coupon_ids: "", // 优惠券id,有多个用‘,’分隔
    orderBeans:[{
      merchants_id: $scope.confirmOrderObj.goodsInfo.merchants_id, // 商家ID
      order_type: "", // 订单类型
      order_remark: "", // 订单备注
      member_group_id: "", // 团购下单 需传值 用户开团主键
      orderGoodsBeans:[{
        goods_id: $scope.confirmOrderObj.goodsInfo.goods_id, // 商品ID
        specification_id: $scope.confirmOrderObj.specification_id, // 规格ID
        goods_num: $scope.confirmOrderObj.gmnum, //购买数量
        goods_group_id: "",  // 团购下单ID
        live_id: $scope.confirmOrderObj.goodsInfo.live_id,
        seller: $scope.confirmOrderObj.goodsInfo.seller
      }]
    }]
  };
  console.log($scope.orderJson)

  /*计算订单价格*/
  $scope.order_price = $scope.confirmOrderObj.gmnum * $scope.confirmOrderObj.specification_price;

  /***************** 地址模块 start ******************/
  /*查询默认地址*/
  $scope.address_default = function(){
    $http.post(
      url + "api/Address/queryDefaultAddress",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token")
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == "ok"){
        $scope.addressInfo = data["data"];
        $scope.orderJson.address_id = data["data"].address_id; // orderJson 地址ID赋值
      }else if(data["status"] == "error"){
        console.log(data["error"])
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  $scope.address_default();
  /* 调用省市区联动插件*/
  angular.element("#address_order").cityPicker({
    title: "选择省市区/县",
    onChange: function (picker, values, displayValues) {
      console.log(values, displayValues);
      $scope.addressArr = displayValues;
    }
  });
  /*新增地址model事件*/
  $scope.addressModelClick = function (t){
    if(t==1){
      angular.element("#add_addressModel").show();
    }else{
      angular.element("#add_addressModel").hide();
    }
  }
  /*新增地址*/
  $scope.add_addressFun = function(){
    if(!$scope.name){
      myFactory.promptFun("姓名不能为空",1300);
      return false;
    }else if(!$scope.phoneReg.test($scope.mobile)){
      myFactory.promptFun("手机号码格式不正确",1300);
      return false;
    }else if(!$scope.addressArr){
      myFactory.promptFun("请选择地区",1300);
      return false;
    }else if(!$scope.address_detailed){
      myFactory.promptFun("请输入详细地址",1300);
      return false;
    }
    $http.post(
      url + "api/Address/insertAddress",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        address_mobile: $scope.mobile, // 手机号
        address_name: $scope.name, //姓名
        address_province: $scope.addressArr[0], //省
        address_city: $scope.addressArr[1], //市
        address_country: $scope.addressArr[2], //区
        address_detailed: $scope.address_detailed, //详细地址 
        address_zip_code: $scope.address_zip_code//邮编
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == "ok"){
        $scope.address_default();
        angular.element("#add_addressModel").hide();
      }else if(data["status"] = "error"){
        myFactory.promptFun(data["error"],1300)
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  /***************** 地址模块 end ******************/

  /***************** 优惠券模块 start ******************/
  /*选择优惠券model事件*/
  $scope.couponClick = function (t){
    if(t==1){
      angular.element("#coupon").show();
    }else{
      angular.element("#coupon").hide();
    }
  }
  $scope.couponId = ''; //优惠券ID
  $scope.couponPrice = 0; //优惠金额
  $scope.couponIdFun = function (id,price) { //选中优惠券
    $scope.couponId = id;
    $scope.couponPrice = price;
    /*计算订单价格减去优惠券后的价格*/
    $scope.order_price1 = $scope.order_price - $scope.couponPrice;
    console.log($scope.couponId);
    $scope.couponClick(2);
  }
  //优惠券列表
  $scope.couponListInfo = [];
  $scope.getMyCouponListFun = function () {
    $http.post(
      url + 'api/User/my_coupon',$.param({
        uid: $cookieStore.get("uid"),
        token: $cookieStore.get("token"),
        status: 1
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data)
      if(data["status"] == 'ok'){
        $scope.couponListInfo = data["data"]["list"];
      }else if(data["status"] == 'error'){
        myFactory.promptFun(data["data"],1300);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  $scope.getMyCouponListFun();
  /***************** 优惠券模块 end ******************/
  /*提交订单*/
  $scope.paymentState = true;
  $scope.submitOrder = function(){
    $scope.paymentState = false;
    $scope.orderJson.orderBeans[0].order_remark = $scope.order_remark || ""; // orderJson 订单备注赋值
    $scope.orderJson.coupon_ids = $scope.couponId; //orderJson 优惠券ID赋值
    console.log(JSON.stringify($scope.orderJson));
    $http.post(
      url + "api/Order/insertMallOrder",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        json: JSON.stringify($scope.orderJson)
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == "ok"){
        $scope.paymentFun(data["data"]["order_no"]);
      }else if(data["status"] == "error"){
        $scope.paymentState = true;
        myFactory.promptFun(data["data"],1500);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  /*支付*/
  $scope.paymentFun = function(order_no){
    $http.post(
      url + "api/Pingxx/ping1",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        order_no: order_no, //订单号
        type: 'wx_pub',    //微信公众号支付
        openid: $cookieStore.get("openid")
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == "ok"){
        var charge = data['data'];
        pingpp.createPayment(charge, function (result, error) {
          if (result == "success") { // 只有微信公众账号 wx_pub 支付成功的结果会在这里返回，其他的 wap 支付结果都是在 extra 中对应的 URL 跳转。
            myFactory.promptFun("支付成功",1300);
            window.location.href="#/paySuccess?goods_id=";
          } else if (result == "fail") {
            myFactory.promptFun("支付取消",1300);
            window.location.href="#/me?confirmOrder=1";
            // charge 不正确或者微信公众账号支付失败时会在此处返回
          } else if (result == "cancel") {
            myFactory.promptFun("支付失败",1300);
            window.location.href="#/me?confirmOrder=1";
          }
        })
      }else if(data["status"] == "error"){
        $scope.paymentState = true;
      }
    }).error(function(err) {
      $scope.paymentState = true;
    });
  }
}])
/*购物车结算-确认订单*/
.controller('confirmOrder_car', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce', 'myFactory',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('确认订单');
  if($cookieStore.get("confirmOrder_orderDetails")==1){
    history.go(-1);
    $cookieStore.remove("confirmOrder_orderDetails");
  }
  /* 初始化订单json */
  $scope.orderJson = {
    member_id: $cookieStore.get("uid"), // 用户id
    address_id: "", // 地址ID
    deduct_integral_value: "", // 抵扣积分
    coupon_ids: "", // 优惠券id,有多个用‘,’分隔
    orderBeans:[]
  };
  console.log($scope.orderJson)
  /*获取购物车商品信息*/
  $http.post(
    url + "api/Order/confirmOrderInfo",$.param({
      uid : $cookieStore.get("uid"),
      token : $cookieStore.get("token"),
      car_ids : $location.search()["car_ids"]
    }),
    {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"] == "ok"){
      $scope.confirmOrder_carInfo = data["data"];
      /*循环数据为orderJson赋值*/
      for(var i=0;i<data["data"].list.length;i++){
        $scope.merchantsObj = {
          merchants_id: data["data"]["list"][i].merchants_id, // 商家ID
          order_type: "", // 订单类型
          order_remark: "", // 订单备注
          member_group_id: "", // 团购下单 需传值 用户开团主键
          orderGoodsBeans: []
        };
        $scope.orderJson.orderBeans.push($scope.merchantsObj);
        for(var j=0;j<data["data"]["list"][i]["goods"].length;j++){
          $scope.goodsObj = {
            goods_id: data["data"]["list"][i]["goods"][j].goods_id, // 商品ID
            specification_id: data["data"]["list"][i]["goods"][j].specification_id, // 规格ID
            goods_num: data["data"]["list"][i]["goods"][j].goods_num, //购买数量
            goods_group_id: "",  // 团购下单ID
            live_id: data["data"]["list"][i]["goods"][j].live_id || '',
            seller: data["data"]["list"][i]["goods"][j].seller || ''
          }
          $scope.orderJson.orderBeans[i].orderGoodsBeans.push($scope.goodsObj);
        }
      }
      console.log($scope.orderJson);
    }else if(data["status"] == "error"){
      console.log(data["error"])
    }else if (data['error'] == 'token failed') {
      myFactory.loginFun(); // 调用登录失效方法
    }
  })

  /***************** 地址模块 start ******************/
  /*查询默认地址*/
  $scope.address_default = function(){
    $http.post(
      url + "api/Address/queryDefaultAddress",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token")
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == "ok"){
        $scope.addressInfo = data["data"];
        $scope.orderJson.address_id = data["data"].address_id; // orderJson 地址ID赋值
      }else if(data["status"] == "error"){
        console.log(data["error"])
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  $scope.address_default();
  /* 调用省市区联动插件*/
  angular.element("#address_order").cityPicker({
    title: "选择省市区/县",
    onChange: function (picker, values, displayValues) {
      console.log(values, displayValues);
      $scope.addressArr = displayValues;
    }
  });
  /*新增地址model事件*/
  $scope.addressModelClick = function (t){
    if(t==1){
      angular.element("#add_addressModel").show();
    }else{
      angular.element("#add_addressModel").hide();
    }
  }
  /*新增地址*/
  $scope.add_addressFun = function(){
    if(!$scope.name){
      myFactory.promptFun("姓名不能为空",1300);
      return false;
    }else if(!$scope.phoneReg.test($scope.mobile)){
      myFactory.promptFun("手机号码格式不正确",1300);
      return false;
    }else if(!$scope.addressArr){
      myFactory.promptFun("请选择地区",1300);
      return false;
    }else if(!$scope.address_detailed){
      myFactory.promptFun("请输入详细地址",1300);
      return false;
    }
    $http.post(
      url + "api/Address/insertAddress",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        address_mobile: $scope.mobile, // 手机号
        address_name: $scope.name, //姓名
        address_province: $scope.addressArr[0], //省
        address_city: $scope.addressArr[1], //市
        address_country: $scope.addressArr[2], //区
        address_detailed: $scope.address_detailed, //详细地址 
        address_zip_code: $scope.address_zip_code//邮编
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == "ok"){
        $scope.address_default();
        angular.element("#add_addressModel").hide();
      }else if(data["status"] = "error"){
        myFactory.promptFun(data["error"],1300)
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  /***************** 地址模块 end ******************/

   /***************** 优惠券模块 start ******************/
  /*选择优惠券model事件*/
  $scope.couponClick = function (t){
    if(t==1){
      angular.element("#coupon").show();
    }else{
      angular.element("#coupon").hide();
    }
  }
  $scope.couponId = ''; //优惠券ID
  $scope.couponPrice = 0; //优惠金额
  $scope.couponIdFun = function (id,price) { //选中优惠券
    $scope.couponId = id;
    $scope.couponPrice = price;
    /*计算订单价格减去优惠券后的价格*/
    $scope.order_price = $scope.confirmOrder_carInfo.amount - $scope.couponPrice;
    console.log($scope.couponId);
    $scope.couponClick(2);
  }
  //优惠券列表
  // $scope.couponListInfo = [];
  // $scope.getMyCouponListFun = function () {
  //   $http.post(
  //     url + 'api/User/my_coupon',$.param({
  //       uid: $cookieStore.get("uid"),
  //       token: $cookieStore.get("token"),
  //       status: 1
  //     }),
  //     {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  //   ).success(function(data){
  //     console.log(data)
  //     if(data["status"] == 'ok'){
  //       $scope.couponListInfo = data["data"]["list"];
  //     }else if(data["status"] == 'error'){
  //       myFactory.promptFun(data["data"],1300);
  //     }else if (data['error'] == 'token failed') {
  //       myFactory.loginFun(); // 调用登录失效方法
  //     }
  //   })
  // }
  // $scope.getMyCouponListFun();
  /***************** 优惠券模块 end ******************/

  /*提交订单*/
  $scope.paymentState = true;
  $scope.submitOrder = function(){
    $scope.paymentState = false;
    $scope.orderJson.coupon_ids = $scope.couponId; //orderJson 优惠券ID赋值
    console.log(JSON.stringify($scope.orderJson));
    $http.post(
      url + "api/Order/insertMallOrder",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        json: JSON.stringify($scope.orderJson),
        car_ids: $location.search()["car_ids"]
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == "ok"){
        $scope.paymentFun(data["data"]["order_no"]);
      }else if(data["status"] == "error"){
        $scope.paymentState = true;
        myFactory.promptFun(data["data"],1500);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  /*支付*/
  $scope.paymentFun = function(order_no){
    $http.post(
      url + "api/Pingxx/ping1",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        order_no: order_no, //订单号
        type: 'wx_pub',    //微信公众号支付
        openid: $cookieStore.get("openid")
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == "ok"){
        var charge = data['data'];
        pingpp.createPayment(charge, function (result, error) {
          if (result == "success") { // 只有微信公众账号 wx_pub 支付成功的结果会在这里返回，其他的 wap 支付结果都是在 extra 中对应的 URL 跳转。
            myFactory.promptFun("支付成功",1300);
            window.location.href="#/paySuccess";
          } else if (result == "fail") {
            myFactory.promptFun("支付取消",1300);
            window.location.href="#/me?confirmOrder=1";
            // charge 不正确或者微信公众账号支付失败时会在此处返回
          } else if (result == "cancel") {
            myFactory.promptFun("支付失败",1300);
            window.location.href="#/me?confirmOrder=1";
          }
        })
      }else if(data["status"] == "error"){
        $scope.paymentState = true;
      }
    }).error(function(err) {
      $scope.paymentState = true;
    });
  }
}])
.controller('paySuccess', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('支付成功');
  /*订单状态点击*/
  $scope.orderTypeClick = function(state){
    sessionStorage.setItem("orderType",state);
    $location.path("orderList");
  }

}])
/*订单列表*/
.controller('orderList', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('订单列表');
  /*订单列表*/
  $scope.orderListInfo = [];
  $scope.orderListFun2 = function(state,page){ // 空为全部, cancel：取消,  wait_pay:待付款,  wait_send:带发货,  wait_receive：待确认收货,  wait_assessment：待评价,  end：已结束,  wait_group_buy：等待团购人数满
    $scope.page = page || 1;
    $scope.state = state || "";
    console.log($scope.state)
    $http.post(
      url + "api/Order/queryOrderByState",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        p: $scope.page,
        order_state: $scope.state,
        pagesize: 10
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.allPage = data["data"]["page"];
        $scope.orderListInfo.push.apply($scope.orderListInfo, data["data"]["list"]);
        console.log($scope.orderListInfo);
      }else if(data["status"] == 'error'){
        console.log(data['data']);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  
  $scope.orderListFun = function(state){ // tab切换
    $scope.orderListInfo = [];
    $scope.orderListFun2(state);
    sessionStorage.setItem("orderType",state);
  }
  /* 实现点击详情后返回订单列表保持原本状态 */
  if(sessionStorage.getItem("orderType") && sessionStorage.getItem("orderType") != ''){
    $scope.orderListFun2(sessionStorage.getItem("orderType"));
  }else{
    $scope.orderListFun2(); // 初始化
  }
  /*滚动加载*/
  angular.element(window).scroll(function() {
    $scope.wTop = angular.element(window).scrollTop();
    $scope.bTop = angular.element("body").height();
    $scope.dTop = angular.element(document).height();
    if ($scope.wTop + $scope.bTop >= $scope.dTop) { //下拉到底部加载
      if ($scope.allPage > $scope.page) {
        $scope.orderListFun2($scope.state,++$scope.page);
      }
    }
  })
}])
/*售后订单列表*/
.controller('saleAfterOrderList', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce', 'myFactory',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('售后订单列表');
  /*获取售后订单列表*/
  $scope.saleAfterOrderListInfo = [];
  $scope.saleAfterOrderListFun = function(state,page){ // 空为全部, cancel：取消,  wait_pay:待付款,  wait_send:带发货,  wait_receive：待确认收货,  wait_assessment：待评价,  end：已结束,  wait_group_buy：等待团购人数满
    $scope.page = page || 1;
    $scope.state = state || "";
    console.log($scope.state)
    $http.post(
      url + "api/Order/refund_order",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token")
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.allPage = data["data"]["page"];
        $scope.saleAfterOrderListInfo.push.apply($scope.saleAfterOrderListInfo, data["data"]["list"]);
        console.log($scope.saleAfterOrderListInfo);
      }else if(data["status"] == 'error'){
        console.log(data['data']);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  $scope.saleAfterOrderListFun()
  /*滚动加载*/
  angular.element(window).scroll(function() {
    $scope.wTop = angular.element(window).scrollTop();
    $scope.bTop = angular.element("body").height();
    $scope.dTop = angular.element(document).height();
    if ($scope.wTop + $scope.bTop >= $scope.dTop) { //下拉到底部加载
      if ($scope.allPage > $scope.page) {
        $scope.saleAfterOrderListFun($scope.state,++$scope.page);
      }
    }
  })
}])
/*订单详情*/
.controller('orderDetails', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('订单详情');
  /*获取订单详情*/
  $scope.getOrderInfoFun = function () {
    $http.post(
      url + "api/Order/queryOrderView",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        order_merchants_id : $location.search()["order_merchants_id"]
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.orderInfo = data["data"];
        $scope.payEnd_time = parseInt(new Date(data["data"].cancel_end_time).getTime());
      }else if(data["status"] == 'error'){
        console.log(data['data']);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  $scope.getOrderInfoFun();
}])
/*售后订单详情*/
.controller('saleAfterOrderDetails', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('售后订单详情');
  /*获取订单详情*/
  $scope.getOrderInfoFun = function () {
    $http.post(
      url + "api/Order/refund_order_view",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        refund_id : $location.search()["refund_id"]
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.orderInfo = data["data"];
        $scope.imgArr = data["data"]["refund_img"].split(',');
      }else if(data["status"] == 'error'){
        console.log(data['data']);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  $scope.getOrderInfoFun();
  /*取消退货*/
  $scope.delRefundFun = function () {
    $http.post(
      url + "api/Order/del_refund",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        refund_id : $location.search()["refund_id"]
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        myFactory.promptBackFun(data['data'], 1300);
      }else if(data["status"] == 'error'){
        myFactory.promptFun(data['error'], 1300);
        console.log(data['data']);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
}])
/*填写退货物流*/
.controller('fillLogistcs', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('填写退货物流');
  /*获取订单详情*/
  $scope.getOrderInfoFun = function () {
    $http.post(
      url + "api/Order/queryOrderView",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        order_merchants_id : $location.search()["order_merchants_id"]
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.orderInfo = data["data"];
        $scope.payEnd_time = parseInt(new Date(data["data"].cancel_end_time).getTime());
      }else if(data["status"] == 'error'){
        console.log(data['data']);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
}])
/*物流详情*/
.controller('logisticsDetails', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('查看物流');
  $scope.goods_img = $location.search()["goods_img"];
  $scope.order_no = $location.search()['order_no'];
  /*获取物流详情*/
  $http.post(
    url + "api/Express/getTracesByJson",$.param({
      logistics_no : $location.search()["logistics_no"],
      logistics_pinyin : $location.search()["logistics_pinyin"]
    }),
    {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"]=="ok"){
      $scope.logisticsDetailsInfo = data["data"];
    }else if(data["status"] == "error"){
      console.log(data["data"]);
    }else if (data['error'] == 'token failed') {
      myFactory.loginFun(); // 调用登录失效方法
    }
  })
}])
/*评价订单*/
.controller('evaluateOrder', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('评价订单');
  $scope.evaluateOrderBeans = JSON.parse(sessionStorage.getItem("evaluateOrderBeans"));
  console.log($scope.evaluateOrderBeans);
  $scope.contentArr = [];

  for(var i=0;i<$scope.evaluateOrderBeans.length;i++){
    $scope.contentObj = {
      goods_id:$scope.evaluateOrderBeans[i].goods_id,
      mark:'',
      comment_desc:'',
      img:[]
    }
    $scope.contentArr.push($scope.contentObj);
  }
  console.log($scope.contentArr);

  /*星级*/
  $scope.starClick = function (n,index){
    $scope.contentArr[index].mark = n;
    console.log($scope.contentArr[index])
  }
  /*店铺星级*/
  $scope.shopStarClick = function (n,t){ // n:数量，t=1(物流);t=2(服务)
    if(t==1){
      $scope.wlNum = n;
    }else{
      $scope.fwNum = n;
    }
  }

  /*上传图片*/
  $scope.uploadImg = function(e) {
    var formDomIndex = angular.element(e).parents("form").index();//找到file所在form(祖先)
    $scope.len = $scope.contentArr[formDomIndex].img.length
    if($scope.len+1>3){
      myFactory.promptFun("最多上传3张图片",1300);
      return false;
    }
    $http({
      method: 'POST',
      url: url + "api/login/upload",
      data: {},
      headers: {
        'Content-Type': undefined
      },
      transformRequest: function(data) {
        var formData = new FormData(angular.element(e).parents("form")[0]);
        formData.append("img",e); //实际上传
        return formData;
      }
    }).success(function(data) {
      console.log(data)
      if (data.status == "ok") {
        var html= '';
        for(var j=0;j<data["data"].length;j++){
          $scope.contentArr[formDomIndex].img.push(data["data"][j]);
          html += '<div class="w60 h60 mr15 mb15 p_r">'
                  +'<div class="p_a t_f10 r_f10 w22 h22 close_red_icon"></div>'
                  +'<img class="br3" src="'+data["data"][j]+'" alt="">'
                +'</div>'
        }
        angular.element(e).parents("form").find(".imgBox").append(html);
        angular.element(".close_red_icon").click(function(){
            var $formIndex = angular.element(this).parents("form").index(),//找到元素祖先form的下标
                index = angular.element(this).parent().index();//每个评价图片的下标
            console.log(index);
            $scope.contentArr[$formIndex]["img"].splice(index,1);
            angular.element(this).parent().remove();//删除自己
            console.log($scope.contentArr);
        })
      }
    }).error(function(err, status) {
      if (data['data'] == 'token failed') {

      }
    });
  };

  /*立即发布*/
  $scope.releaseClick = function(){
    $scope.contentArr[0].img = $scope.contentArr[0].img.toString(","); //把img数组转字符串
    console.log(JSON.stringify($scope.contentArr));
    $http.post(
      url + "api/Order/comment_goods",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        order_merchants_id : $location.search()["order_merchants_id"],
        express_mark: $scope.wlNum,
        service_mark: $scope.fwNum,
        content: JSON.stringify($scope.contentArr)
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        myFactory.promptBackFun(data["data"],1300)
      }else if(data["status"] == 'error'){
        myFactory.promptFun(data["data"],1300)
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  
}])
/*申请售后*/
.controller('orderRefund', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('申请售后');
  /*获取售后商品信息*/
  $http.post(
    url + "api/Order/refund_goods",$.param({
      uid : $cookieStore.get("uid"),
      token : $cookieStore.get("token"),
      order_merchants_id : $location.search()["order_merchants_id"],
      order_goods_id: $location.search()["order_goods_id"]
    }),
    {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"] == 'ok'){
      $scope.refundGoodsInfo = data["data"];
      $scope.gmnum = $scope.refundGoodsInfo.goods_num; //初始化数量
      $scope.refundMoney = $scope.refundGoodsInfo.refund_price * $scope.gmnum;
      console.log($scope.refundMoney);
    }else if(data["status"] == 'error'){
      console.log(data['data']);
    }else if (data['error'] == 'token failed') {
      myFactory.loginFun(); // 调用登录失效方法
    }
  })
  /*获取售后原因列表*/
  $http.post(
    url + "api/Order/order_refund_reason",
    {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"] == 'ok'){
      $scope.reasonListInfo = data["data"];
    }else if(data["status"] == 'error'){
      console.log(data['data']);
    }
  })
  /*选择售后类型*/
  $scope.refund_type = 1; // 默认为退款
  $scope.refundTypeClick = function(type){
    $scope.refund_type=type;
  }
  /* 选择原因model */
  $scope.reasonModelType = 2;
  $scope.reasonModelToggle = function(t){ // t:1打开，t:2关闭
    $scope.reasonModelType = t;
  }
  /* 保存原因id */
  $scope.reasonIdClick = function(id,name){ // 原因ID ,名称
    $scope.reasonId = id;
    $scope.reason_name = name;
    console.log($scope.reasonId);
    $scope.reasonModelToggle(2);
  }
  /*数量加减*/
  $scope.numberfn = function (num, max, type) {//下限，上限（库存），type:2加 1:减
    $scope.num = parseInt(num);
    $scope.max = parseInt(max);
    if (type == 1 && $scope.num > 1) {
      $scope.gmnum = (--$scope.num);
    } else if (type == 2 && $scope.num < $scope.max) {
      $scope.gmnum = (++$scope.num);
    } else {
      isNaN($scope.num * 1) || $scope.num < 0 || $scope.num == "" ? $scope.gmnum = 1 : $scope.num > $scope.max ? $scope.gmnum = $scope.max : $scope.gmnum = $scope.num;
    }
    $scope.refundMoney = $scope.refundGoodsInfo.refund_price * $scope.gmnum;
    console.log($scope.refundMoney);
  }

  /*上传图片*/
  $scope.refundImg = [];
  $scope.uploadImg = function(parsentDom, dom) {
    console.log($scope.refundImg.length);
    if($scope.refundImg.length+1>3){
      myFactory.promptFun("最多上传3张图片",1300);
      return false;
    }
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
        $scope.refundImg.push(data["data"][0]);
        console.log($scope.refundImg.join(","));
      }
    }).error(function(err, status) {
      if (data['data'] == 'token failed') {

      }
    });
  };
  /* 删除图片 */
  $scope.delImgClick = function(index){
    $scope.refundImg.remove(index);
  }
  /* 提交申请 */
  $scope.refundClick = function(){
    if(!$scope.reasonId){
      myFactory.promptFun("请选择退款/货理由！",1300);
      return false;
    }else if(!$scope.refund_desc){
      myFactory.promptFun("请填写退款/货说明",1300);
      return false;
    }else if($scope.refundImg.length<1){
      myFactory.promptFun("请上传凭证！",1300);
      return false;
    }
    $http.post(
      url + "api/Order/apply_refund",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        order_merchants_id: $location.search()["order_merchants_id"], //订单ID
        order_goods_id: $location.search()["order_goods_id"], 
        refund_type: $scope.refund_type, // 1退款2退货
        // refund_reason_id: $scope.reasonId, // 退款理由id
        refund_reason: $scope.reason_name, // 退款理由描述
        refund_desc: $scope.refund_desc, // 退款描述
        refund_count: $scope.gmnum, // 退款数量
        refund_img: $scope.refundImg.join(",")// 图片路径 逗号隔开
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"]=="ok"){
        myFactory.promptBackFun(data["data"],1500);
      }else if(data["status"] == "error"){
        myFactory.promptFun(data["error"],1500);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
}])



