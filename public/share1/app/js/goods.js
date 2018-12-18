/*商城首页*/
app.controller('mall', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce', 'myFactory','myFactory',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('商城首页');
  $rootScope.footerType = 2; // 底部导航切换使用
  /*获取分类信息*/
  $http.post(
    url + "api/Home/home_class",
    {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"] == 'ok'){
      $scope.mallClassInfo = data["data"]
    }else if(data["status"] == 'error'){
      console.log(data['error']);
    }
  })

  /*获取推荐商品*/
  $scope.getMaybeEnjoyFun = function () {
    $http.post(
      url + "api/Mall/maybeEnjoy",$.param({
        uid: $cookieStore.get("uid"),
        token: $cookieStore.get("token"),
        pagesize: 6
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.maybeEnjoyInfo = data["data"]
      }else if(data["status"] == 'error'){
        console.log(data['error']);
      }
    })
  } 
  $scope.getMaybeEnjoyFun();
  /* 获取商城首页推荐信息 */
  $http.post(
    url + "api/Home/dress",
    {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"] == 'ok'){
      $scope.dressInfo = data["data"];
      for(var i=0;i<data["data"].length;i++){
        if(data["data"][i].type==1){ // 无跳转
          $scope.dressInfo[i].href="javascript:;"
        }else if(data["data"][i].type==2){ // web(外链)
          $scope.dressInfo[i].href=data["data"][i].jump
        }else if(data["data"][i].type==3){ // 分类页
          $scope.dressInfo[i].href=""
        }else if(data["data"][i].type==4){ // 商家（店铺）
          $scope.dressInfo[i].href="#/shopDetails?merchants_id=" + data["data"][i].jump;
        }else if(data["data"][i].type==5){ // 商品详情
          $scope.dressInfo[i].href="#/goodsDetails?goods_id=" + data["data"][i].jump
        }else if(data["data"][i].type==6){ // 标签
          $scope.dressInfo[i].href=""
        }
        for(var j=0;j<data["data"][i]["seedBeans"].length;j++){
          if(data["data"][i]["seedBeans"][j].type==1){ // 无跳转
            $scope.dressInfo[i]["seedBeans"][j].href = "javascript:;"
          }else if(data["data"][i]["seedBeans"][j].type==2){ // web(外链)
            $scope.dressInfo[i]["seedBeans"][j].href = data["data"][i]["seedBeans"][j].jump
          }else if(data["data"][i]["seedBeans"][j].type==3){ // 分类页
            $scope.dressInfo[i]["seedBeans"][j].href = ""
          }else if(data["data"][i]["seedBeans"][j].type==4){ // 商家（店铺）
            $scope.dressInfo[i]["seedBeans"][j].href = "#/shopDetails?merchants_id=" + data["data"][i]["seedBeans"][j].jump;
          }else if(data["data"][i]["seedBeans"][j].type==5){ // 商品详情
            $scope.dressInfo[i]["seedBeans"][j].href = "#/goodsDetails?goods_id=" + data["data"][i]["seedBeans"][j].jump;
          }else if(data["data"][i]["seedBeans"][j].type==6){ // 标签
            $scope.dressInfo[i]["seedBeans"][j].href = ""
          }
        }
      }
    }else if(data["status"] == 'error'){
      console.log(data['error']);
    }
  })
}])
/*商品列表*/
.controller('goodsList', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('商品列表');
  $scope.title = $location.search()["title"];
  /*获取商品列表*/
  $scope.goodsListInfo = [];  
  $scope.getGoodsListFun2 = function(state,page){ // state(1:综合；2销量；3低价；4高价)
    $scope.page = page || 1;
    $scope.state = state || 1;
    $http.post(
      url + "api/Mall/searchGoods",$.param({
        name: '',
        class_uuid : $location.search()["class_uuid"],
        type : $scope.state,
        p : $scope.page,
        pagesize : 10
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.allPage = data["data"]["page"];
        $scope.goodsListInfo.push.apply($scope.goodsListInfo, data["data"]["goodsBean"]);
        console.log($scope.goodsListInfo);
      }else if(data["status"] == 'error'){
        console.log(data['data']);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  
  $scope.getGoodsListFun = function(state){ // tab切换
    $scope.goodsListInfo = [];
    $scope.getGoodsListFun2(state);
    sessionStorage.setItem("goodsListType",state);
  }
  /*升降价*/
  $scope.sortType = 0;// 默认低价
  $scope.sortClick = function(sortType){
    if(sortType==0){
      $scope.sortType = 1;
      $scope.getGoodsListFun(3)
    }else {
      $scope.sortType = 0;
      $scope.getGoodsListFun(4)
    }
    
  }
  /* 实现点击详情后返回订单列表保持原本状态 */
  if(sessionStorage.getItem("goodsListType") && sessionStorage.getItem("goodsListType") != ''){
    $scope.getGoodsListFun2(sessionStorage.getItem("goodsListType"));
  }else{
    $scope.getGoodsListFun2(); // 初始化
  }
  /*滚动加载*/
  angular.element(window).scroll(function() {
    $scope.wTop = angular.element(window).scrollTop();
    $scope.bTop = angular.element("body").height();
    $scope.dTop = angular.element(document).height();
    if ($scope.wTop + $scope.bTop >= $scope.dTop) { //下拉到底部加载
      if ($scope.allPage > $scope.page) {
        $scope.getGoodsListFun2($scope.state,++$scope.page);
      }
    }
  })
}])
/*商品详情*/
.controller('goodsDetails', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('商品详情');

  /*获取商品详情*/
  $http.post(
    url + "api/Mall/goods_info",$.param({
      uid: $cookieStore.get("uid"),
      token: $cookieStore.get("token"),
      goods_id : $location.search()["goods_id"]
    }),
    {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"] == 'ok'){
      $scope.goodsInfoObj = data["data"];
      /*获取店铺详情*/
      myFactory.getShopDetails(data["data"].merchants_id)
      .success(function(data){
        console.log(data)
        if(data["status"] == 'ok'){
          $scope.merchantsInfo = data["data"];
        }else if(data["status"] == 'error'){
          console.log(data['data']);
        }
      });
      $scope.goods_detail = $sce.trustAsHtml(data["data"].goods_detail); // 商品详情
      for(var i=0;i<data["data"].goodsSpecificationBeans.length;i++){
        $scope.specOption(data["data"].goodsSpecificationBeans[i].specificationBeans[0].specification_id,data["data"].goodsSpecificationBeans[i].specificationBeans[0].specification_value,i);
      }
    }else if(data["status"] == 'error'){
      console.log(data['error']);
    }
  })

  /*查看全部评价*/
  $scope.seeAllEvaluateClick = function () {
    $scope.evaluate_goods_info = {
      goods_img: $scope.goodsInfoObj.goods_img,
      goods_id: $scope.goodsInfoObj.goods_id,
      goods_name: $scope.goodsInfoObj.goods_name
    }
    sessionStorage.setItem('evaluate_goods_info',JSON.stringify($scope.evaluate_goods_info));
    $location.path("allEvaluate");
  }

  /*商品收藏与取消收藏*/
  $scope.collectionClick = function () {
    $http.post(
      url + "api/Mall/goods_collect",$.param({
        uid: $cookieStore.get("uid"),
        token: $cookieStore.get("token"),
        goods_id : $location.search()["goods_id"]
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.goodsInfoObj.is_collect = data["data"];
        if(data["data"]==1){
          myFactory.promptFun("恭喜您！商品已收藏到您的收藏夹啦！",1300)
        }else{
          myFactory.promptFun("取消收藏成功！",1300)
        }
      }else if(data["status"] == 'error'){
        console.log(data['error']);
      }
    })
  }
  /*店铺关注与取消关注*/
  $scope.followClick = function(type){
    $http.post(
      url + "api/User/follow_merchants",$.param({
        uid: $cookieStore.get("uid"),
        token: $cookieStore.get("token"),
        user_id2 : $scope.merchantsInfo.member_id
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        if(type==1){
          $scope.merchantsInfo.is_follow=2;
          myFactory.promptFun("取消关注成功！",1300)
        }else{
          $scope.merchantsInfo.is_follow=1;
          myFactory.promptFun("恭喜您！关注成功！",1300)
        }
      }else if(data["status"] == 'error'){
        console.log(data['data']);
        myFactory.promptFun(data['data'],1300)
      }
    })
  }

  /*规格model事件*/
  $scope.specificationModelClick = function(t,type){
    if(t==1){
      $scope.confirmType = type || '';
      console.log($scope.confirmType);
      angular.element("#specificationBox").show()
    }else{
      angular.element("#specificationBox").hide()
    }
  }

  /*计算规格价格*/
  $scope.specInfoFun = function () {
    $http.post(
      url + "api/Mall/get_specification",$.param({
        goods_id : $location.search()["goods_id"],
        specification_ids : $scope.specObj.paIdArr.join(","),
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.specInfo = data["data"];
      }else if(data["status"] == 'error'){
        console.log(data['error']);
      }
    })
  }

  /* 初始化规格参数 */
  $scope.specObj = {
    paIdArr:[], // 初始化规格ID
    paNameArr:[] // 初始化规格名称
  }
  /*选择规格*/
  $scope.specOption = function(id,name,paIndex){ // id:规格ID，name:规格名称 ，外层循环下标
    $scope.specObj.paIdArr[paIndex] = id;
    $scope.specObj.paNameArr[paIndex] = name;
    console.log($scope.specObj)
    $timeout(function(){
      $scope.specInfoFun();
    },20)
  }

  /*数量加减*/
  $scope.gmnum = 1; //初始化数量
  $scope.numberfn = function (num, max, type) {//下限，上限（库存），type:2加 1:减
    if (type == 1 && num > 1) {
      $scope.gmnum = (--num);
    } else if (type == 2 && num < max) {
      $scope.gmnum = (++num);
    } else {
      isNaN(num * 1) || num < 0 || num == "" ? $scope.gmnum = 1 : num > max ? $scope.gmnum = max : $scope.gmnum = num;
    }
  }

  /*确认*/
  $scope.determineFun = function (type) {  //type 为1 表示有规格  0为没规格信息
    if($scope.confirmType == 'pay'){ // 立即购买
      if(type == 1) {  //区分有没有规格对象赋值
        $scope.confirmOrderObj = {

          specObj : $scope.specObj, // 规格对象(id,name)
          specification_price : $scope.specInfo.specification_price, // 规格单价
          specification_id : $scope.specInfo.specification_id,

          gmnum : $scope.gmnum, // 数量
          goodsInfo : { // 商品信息
            goods_id : $location.search()["goods_id"],
            goods_name : $scope.goodsInfoObj.goods_name,
            goods_img : $scope.goodsInfoObj.goods_img,
            merchants_id : $scope.goodsInfoObj.merchants_id,
            live_id : $location.search()["live_id"] || '',
            seller : $location.search()["member_id"] || ''
          }
        }
      } else {  //无规格
        $scope.confirmOrderObj = {
          
          specObj : '' , // 规格对象(id,name)
          specification_price : $scope.goodsInfoObj.goods_now_price, // 商品单价
          specification_id : '',

          gmnum : $scope.gmnum, // 数量
          goodsInfo : { // 商品信息
            goods_id : $location.search()["goods_id"],
            goods_name : $scope.goodsInfoObj.goods_name,
            goods_img : $scope.goodsInfoObj.goods_img,
            merchants_id : $scope.goodsInfoObj.merchants_id,
            live_id : $location.search()["live_id"] || '',
            seller : $location.search()["member_id"] || ''
          }
        }
      }

     
      sessionStorage.setItem("confirmOrderObj",JSON.stringify($scope.confirmOrderObj))
      window.location.href =  "#/confirmOrder";
      //$location.path("confirmOrder");
    }else{
      $scope.addShoppingCartFun();
    }
  }
  /*添加购物车*/
  $scope.addShoppingCartFun = function (){
    if($scope.goodsInfoObj.goodsSpecificationBeans =='') {  //如果规格为空，规格id为空
      $scope.specification_id = '';
    } else {
      $scope.specification_id = $scope.specInfo.specification_id;
    }
    $http.post(
      url + "api/Mall/insertShopCar",$.param({
        uid: $cookieStore.get("uid"),
        token: $cookieStore.get("token"),
        goods_id : $location.search()["goods_id"],
        goods_num : $scope.gmnum,
        specification_id : $scope.specification_id,
        seller: $location.search()["member_id"] || '',
        live_id: $location.search()["live_id"] || ''
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        myFactory.promptFun(data["data"],1300);
        $scope.specificationModelClick(2)
      }else if(data["status"] == 'error'){
        console.log(data['error']);
        myFactory.promptFun(data["data"],1300);
      }
    })
  }
  /*头部选项点击事件*/
  $scope.headerType = 1;
  $scope.goodsHeaderClick = function(t){
    if(t==1){
      angular.element('.liveRoom_touch').animate({  
        scrollTop: angular.element(".liveRoom_touch").offset().top  
      }, 300);
    }else{
      angular.element('.liveRoom_touch').animate({  
        scrollTop: angular.element("#goodsDetailsBox").offset().top  
      }, 300);
    }
  }
  $scope.goodsHeaderClick(1);
  /*
  * 监听滚动事件
  * 当元素距离顶部的距离小于或等于40时，为其添加class
  */
  angular.element(".liveRoom_touch").scroll(function() {
    $scope.offsetTop = angular.element("#goodsDetailsBox").offset().top;
    if($scope.offsetTop<=40){
      $scope.$apply(function () {
     　　$scope.headerType = 2;
      });
    }else{
      $scope.$apply(function () {
     　　$scope.headerType = 1;
      });
    }
  })
}])
/*购物车*/
.controller('shoppingCart', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','$window', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,$window,myFactory) {
  console.log('购物车');
  $rootScope.footerType = 3; // 底部导航切换使用
  $scope.cartType = $location.search()["cartType"];

  /*获取购物车列表*/
  $scope.getCartFun = function () {
    $http.post(
      url + "api/Mall/getShopCars",$.param({
        uid: $cookieStore.get("uid"),
        token: $cookieStore.get("token")
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.cartInfo = data["data"]
        if(data["data"].valid_count==0 && data["data"].no_valid_data.length == 0){
          $scope.getMaybeEnjoyFun();
        }
      }else if(data["status"] == 'error'){
        console.log(data['error']);
      }
    })
  }
  $scope.getCartFun();

  /*获取推荐商品*/
  $scope.getMaybeEnjoyFun = function () {
    $http.post(
      url + "api/Mall/maybeEnjoy",$.param({
        uid: $cookieStore.get("uid"),
        token: $cookieStore.get("token"),
        pagesize: 6
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.maybeEnjoyInfo = data["data"]
      }else if(data["status"] == 'error'){
        console.log(data['error']);
      }
    })
  } 

  /*清除无效商品*/
  $scope.delInvalidShopCarClick = function() {
    $http.post(
      url + "api/Mall/delInvalidShopCar",$.param({
        uid: $cookieStore.get("uid"),
        token: $cookieStore.get("token")
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.getCartFun();
        myFactory.promptFun(data["data"],1300)
      }else if(data["status"] == 'error'){
        console.log(data['error']);
        myFactory.promptFun(data["data"],1300)
      }
    })
  }
  $scope.all_price = 0 ; // 定义总价
  /*全选事件*/
  $scope.checkAllClick = function($event){
    if(angular.element($event.target).hasClass("check_act_icon")){
      angular.element(".check_icon").removeClass("check_act_icon")
      $scope.all_price = 0;
    }else{
      angular.element(".check_icon").addClass("check_act_icon")
      /*计算总价*/
      for(var a=0;a<$scope.cartInfo.valid_data.length;a++){
        for(var g=0;g<$scope.cartInfo.valid_data[a].goods.length;g++){
          $scope.all_price = $scope.all_price + $scope.cartInfo.valid_data[a].goods[g].goods_now_price * $scope.cartInfo.valid_data[a].goods[g].goods_num
        }
      }
      console.log($scope.all_price)
    }
  }

  /*店铺全选事件*/
  $scope.shopCheckAllClick = function (merchants_id,index) { // 店铺ID ,下标
    if(angular.element('#mer'+ merchants_id).find(".shopCheck").hasClass("check_act_icon")){
      angular.element('#mer'+ merchants_id).find(".check_icon").removeClass("check_act_icon");
      /*计算总价*/
      for(var h=0;h<$scope.cartInfo.valid_data[index].goods.length;h++){
        $scope.all_price = $scope.all_price - $scope.cartInfo.valid_data[index].goods[h].goods_now_price * $scope.cartInfo.valid_data[index].goods[h].goods_num
      }
    }else{
      angular.element('#mer'+ merchants_id).find(".check_icon").addClass("check_act_icon");
      /*计算总价*/
      for(var h=0;h<$scope.cartInfo.valid_data[index].goods.length;h++){
        $scope.all_price = $scope.all_price + $scope.cartInfo.valid_data[index].goods[h].goods_now_price * $scope.cartInfo.valid_data[index].goods[h].goods_num
      }
    }
    console.log($scope.all_price);
    /*判断店铺是否全部选中*/
    $scope.merNum=0;
    for(var m=0;m<angular.element(".shopCheck").length;m++){
      if(angular.element(".shopCheck").eq(m).hasClass("check_act_icon")){
        $scope.merNum++
      }
    }
    if($scope.merNum == angular.element(".shopCheck").length){
      angular.element("#checkAll").addClass("check_act_icon")
    }else{
      angular.element("#checkAll").removeClass("check_act_icon")
    }
  }
  /*商品选择事件*/
  $scope.carGoodsItemClick = function ($event,merchants_id,paIndex,index){ // 当前元素，店铺ID，外层循环下标，当前下标
    if(angular.element($event.target).hasClass("check_act_icon")){
      angular.element($event.target).removeClass("check_act_icon");
      /*计算价格*/
      $scope.all_price = $scope.all_price - $scope.cartInfo.valid_data[paIndex].goods[index].goods_now_price * $scope.cartInfo.valid_data[paIndex].goods[index].goods_num
    }else{
      angular.element($event.target).addClass("check_act_icon");
      /*计算价格*/
      $scope.all_price = $scope.all_price + $scope.cartInfo.valid_data[paIndex].goods[index].goods_now_price * $scope.cartInfo.valid_data[paIndex].goods[index].goods_num
    }
    console.log($scope.all_price)
    /*判断是否店铺下的所有商品全部被选中*/
    $scope.goodsCheckLen = angular.element('#mer'+merchants_id).find(".goodsCheck").length;
    $scope.num = 0;
    for(var j=0;j<$scope.goodsCheckLen;j++){
      if(angular.element('#mer'+merchants_id).find(".goodsCheck").eq(j).hasClass("check_act_icon")){
        $scope.num++
      }
    }
    console.log($scope.num)
    /*判断同一个店铺下的商品是不是全部选中*/
    if($scope.num == $scope.goodsCheckLen){
      angular.element('#mer'+merchants_id).find(".shopCheck").addClass("check_act_icon");
    }else{
      angular.element('#mer'+merchants_id).find(".shopCheck").removeClass("check_act_icon");
    }

    /*判断是不是所有的商品都被选中*/
    $scope.gnum = 0
    for(var n=0;n<angular.element(".goodsCheck").length;n++){
      if(angular.element(".goodsCheck").eq(n).hasClass("check_act_icon")){
        $scope.gnum++
      }
    }
    if($scope.gnum == angular.element(".goodsCheck").length){ // 全部商品被选中
      angular.element("#checkAll").addClass("check_act_icon")
    }else{
      angular.element("#checkAll").removeClass("check_act_icon")
    }
  }

  /*数量加减*/
  $scope.numberfn = function (num,type,carId,paIndex,index) {//数量，type:2加 1:减，购物车ID ,paIndex(外层循环下标)，index(内层循环下标)
    if(type==1){
      $http.post(
        url + 'api/Mall/minusShopCar',$.param({
          uid: $cookieStore.get("uid"),
          token: $cookieStore.get("token"),
          car_id: carId
        }),
        {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
      ).success(function(data){
        console.log(data);
        if(data["status"] == 'ok'){
          console.log(data["data"]);
          $scope.cartInfo.valid_data[paIndex].goods[index].goods_num = (--num);
          angular.element("#input"+carId).attr('count',num);

          /*加减价格后重新计算总价*/
          $scope.all_price = 0;
          for(var p=0;p<angular.element(".goodsCheck").length;p++){
            if(angular.element(".goodsCheck").eq(p).hasClass("check_act_icon")){
              $scope.price = angular.element(".goodsCheck").eq(p).parent(".goodsListBox").find(".priceTxt").text();
              $scope.goodsNum = angular.element(".goodsCheck").eq(p).parent(".goodsListBox").find("input").attr('count');
              console.log($scope.price+$scope.goodsNum);
              $scope.all_price = $scope.all_price + $scope.price * parseInt($scope.goodsNum);
            }
          }
          console.log($scope.all_price)
        }else if(data["status"] == 'error'){
          myFactory.promptFun(data["data"],1300)
        }
      })
    }else{
      $http.post(
        url + 'api/Mall/plusShopCar',$.param({
          uid: $cookieStore.get("uid"),
          token: $cookieStore.get("token"),
          car_id: carId
        }),
        {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
      ).success(function(data){
        console.log(data);
        if(data["status"] == 'ok'){
          console.log(data["data"]);
          $scope.cartInfo.valid_data[paIndex].goods[index].goods_num = (++num);
          angular.element("#input"+carId).attr('count',num);
          /*加减价格后重新计算总价*/
          $scope.all_price = 0;
          for(var p=0;p<angular.element(".goodsCheck").length;p++){
            if(angular.element(".goodsCheck").eq(p).hasClass("check_act_icon")){
              $scope.price = angular.element(".goodsCheck").eq(p).parent(".goodsListBox").find(".priceTxt").text();
              $scope.goodsNum = angular.element(".goodsCheck").eq(p).parent(".goodsListBox").find("input").attr('count');
              console.log($scope.price+$scope.goodsNum);
              $scope.all_price = $scope.all_price + $scope.price * parseInt($scope.goodsNum);
            }
          }
          console.log($scope.all_price)
        }else if(data["status"] == 'error'){
          myFactory.promptFun(data["data"],1300)
        }
      })
    }
  }

  /*编辑点击事件*/
  $scope.carEditState = true;
  $scope.carEditClick = function(carEditState){
    if(carEditState){
      $scope.carEditState = false;
    }else{
      $scope.carEditState = true;
    }
  }
  /*删除*/
  $scope.delCarGoodsListClick = function () {
    $scope.carIdArr = [];
    for(var d=0;d<angular.element(".goodsCheck").length;d++){
      if(angular.element(".goodsCheck").eq(d).hasClass("check_act_icon")){
        $scope.carIdArr.push(angular.element(".goodsCheck").eq(d).attr("carId"));
      }
    }
    if($scope.carIdArr==''){
      myFactory.promptFun("您还没有选中商品哦！",1300);
      return false;
    }
    $http.post(
      url + "api/Mall/delShopCar",$.param({
        uid : $cookieStore.get("uid"),
        token : $cookieStore.get("token"),
        car_ids : $scope.carIdArr.join(",")
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == "ok"){
        $window.location.reload();
        myFactory.promptFun(data["data"],1300);
      }else if(data["status"] == "error"){
        console.log(data["error"])
        myFactory.promptFun(data["data"],1300);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  /*结算*/
  $scope.settlementClick = function () {
    $scope.carIdArr = [];
    for(var d=0;d<angular.element(".goodsCheck").length;d++){
      if(angular.element(".goodsCheck").eq(d).hasClass("check_act_icon")){
        $scope.carIdArr.push(angular.element(".goodsCheck").eq(d).attr("carId"));
      }
    }
    if($scope.carIdArr==''){
      myFactory.promptFun("您还没有选中商品哦！",1300);
      return false;
    }
    console.log($scope.carIdArr);
    $location.path("confirmOrder_car").search({car_ids:$scope.carIdArr.join(",")})
  }
}])
/*店铺详情*/
.controller('shopDetails', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('店铺详情');

  /*获取店铺详情*/
  myFactory.getShopDetails($location.search()["merchants_id"])
  .success(function(data){
    console.log(data)
    if(data["status"] == 'ok'){
      $scope.shopDetailsInfo = data["data"];
    }else if(data["status"] == 'error'){
      console.log(data['data']);
    }else if (data['error'] == 'token failed') {
      myFactory.loginFun(); // 调用登录失效方法
    }
  });
  /*店铺关注与取消关注*/
  $scope.followClick = function(type){
    $http.post(
      url + "api/User/follow_merchants",$.param({
        uid: $cookieStore.get("uid"),
        token: $cookieStore.get("token"),
        user_id2 : $scope.shopDetailsInfo.member_id
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        if(type==1){
          $scope.shopDetailsInfo.is_follow=2;
          myFactory.promptFun("取消关注成功！",1300)
        }else{
          $scope.shopDetailsInfo.is_follow=1;
          myFactory.promptFun("恭喜您！关注成功！",1300)
        }
      }else if(data["status"] == 'error'){
        console.log(data['data']);
        myFactory.promptFun(data['data'],1300)
      }
    })
  }
  /*
  * 右上角功能按钮事件
  */
  $scope.rightTopBtnState = false;
  $scope.rightTopBtnClick = function(state){
    $scope.rightTopBtnState = !state;
  }
  /*获取店铺分类列表*/
  $http.post(
    url + "api/Mall/merchants_class",$.param({
      merchants_id: $location.search()["merchants_id"]
    }),
    {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"] == "ok"){
      $scope.merchants_class = data["data"]
      console.log($scope.merchants_class)
    }else if(data["status"] == "error"){
      console.log(data["error"])
    }
  })
  /*查看全部分类or收起*/
  $scope.classType =1;
  $scope.classToogleClick = function(type){
    if(type==1){ // 展开
      $scope.classType =2;
    }else{ // 收起
      $scope.classType =1;
    }
  }

  /*获取店铺的全部商品*/
  $scope.shopAllGoods = [];
  $scope.getShopAllGoodsFun = function (page,name) {
    $scope.page = page || 1;
    $http.post(
      url + "api/Mall/merchants_goods",$.param({
        merchants_id: $location.search()["merchants_id"],
        p: $scope.page,
        goods_name: name || ''
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == "ok"){
        $scope.allPage = data["data"]["page"];
        $scope.shopAllGoods.push.apply($scope.shopAllGoods, data["data"]["list"]);
      }else if(data["status"] == "error"){
        console.log(data["error"])
      }
    })
  }
  /*获取商户直播*/
  $scope.getMerchantsLiveFun = function(){
    $http.post(
      url + "api/live/merchants_live",$.param({
        member_id: $location.search()["merchants_id"]
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == "ok"){
        $scope.merchantsLiveInfo = data["data"];
      }else if(data["status"] == "error"){
        console.log(data["error"])
      }
    }) 
  }
  /*获取商户录播列表*/
  $scope.recordingInfo = [];
  $scope.getMerchantsRecordingFun = function(page){
    $scope.recordingPage = page || 1;
    $http.post(
      url + "api/live/playback_list",$.param({
        member_id: $location.search()["merchants_id"],
        p: $scope.recordingPage
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == "ok"){
        $scope.recordingAllPage = data["data"]["page"];
        $scope.recordingCount = data["data"]["count"];
        $scope.recordingInfo.push.apply($scope.recordingInfo, data["data"]["list"]);
      }else if(data["status"] == "error"){
        console.log(data["error"])
      }
    }) 
  }

  /*获取导购视频列表*/
  $scope.shopVideoInfo = [];
  $scope.getShopVideoFun = function(page){
    $scope.shopVideoPage = page || 1;
    $http.post(
      url + "api/live/video_list",$.param({
        uid: $cookieStore.get("uid"),
        token: $cookieStore.get("token"),
        mid: $location.search()["merchants_id"],
        p: $scope.shopVideoPage
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == "ok"){
        $scope.shopVideoAllPage = Math.ceil(data["data"]["count"] / 10) == 0 ? '1' : Math.ceil(data["data"]["count"] / 10);
        $scope.shopVideoInfo.push.apply($scope.shopVideoInfo, data["data"]["list"]);
      }else if(data["status"] == "error"){
        console.log(data["error"])
      }
    }) 
  }

  /*
  * 录播跳转
  */
  $scope.goRecordingClick = function(info){
    $location.path("recording");
    sessionStorage.setItem("recordingInfo",JSON.stringify(info));
  }
  
  /*tab*/
  $scope.shopTabType = 1;
  $scope.shopTabClick = function(type){
    $scope.shopTabType = type;
    if(type==1){ // 全部商品
      $scope.shopAllGoods = [];
      $scope.getShopAllGoodsFun();
    }else if(type==2){ // 直播or回放
      $scope.getMerchantsLiveFun();
      $scope.recordingInfo = [];
      $scope.getMerchantsRecordingFun();
    }else { // 导购视频
      $scope.shopVideoInfo = [];
      $scope.getShopVideoFun()
    }
  }
  if($location.search().live == 1) {  //判断是否查看直播
    $scope.shopTabClick(2);
  } else {
    $scope.shopTabClick(1);//默认为全部商品
  }
  /*
  * 跳转到店铺分类列表
  */
  $scope.goShopGoodsClassClick = function (uuid){
    sessionStorage.setItem("shopClassUuid",uuid)
    $location.path("shopGoodsClass");
  }
  /*滚动加载*/
  angular.element("#shop_touchBox").scroll(function() {
    $scope.wTop = angular.element("#shop_touchBox").scrollTop(); //元素中滚动条的垂直偏移
    $scope.bTop = angular.element("#shop_body").height();
    $scope.dTop = angular.element("#shop_docBox").height();
    if ($scope.wTop + $scope.bTop >= $scope.dTop) { //下拉到底部加载
      if ($scope.shopTabType==1){
        if ($scope.allPage > $scope.page) {
          $scope.getShopAllGoodsFun(++$scope.page);
        }
      }else if($scope.shopTabType==2){
        if ($scope.recordingAllPage > $scope.recordingPage) {
          $scope.getMerchantsRecordingFun(++$scope.recordingPage);
        }
      }else{
        if ($scope.shopVideoAllPage > $scope.shopVideoPage) {
          $scope.getShopVideoFun(++$scope.shopVideoPage);
        }
      }
    }
  })
}])
/*店铺商品分类*/
.controller('shopIntroduce', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('店铺介绍');
   /*获取店铺详情*/
  myFactory.getShopDetails($location.search()["merchants_id"])
  .success(function(data){
    console.log(data)
    if(data["status"] == 'ok'){
      $scope.shopDetailsInfo = data["data"];
    }else if(data["status"] == 'error'){
      console.log(data['data']);
    }else if (data['error'] == 'token failed') {
      myFactory.loginFun(); // 调用登录失效方法
    }
  });
  /*店铺关注与取消关注*/
  $scope.followClick = function(type){
    $http.post(
      url + "api/User/follow_merchants",$.param({
        uid: $cookieStore.get("uid"),
        token: $cookieStore.get("token"),
        user_id2 : $scope.shopDetailsInfo.member_id
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        if(type==1){
          $scope.shopDetailsInfo.is_follow=2;
          myFactory.promptFun("取消关注成功！",1300)
        }else{
          $scope.shopDetailsInfo.is_follow=1;
          myFactory.promptFun("恭喜您！关注成功！",1300)
        }
      }else if(data["status"] == 'error'){
        console.log(data['data']);
        myFactory.promptFun(data['data'],1300)
      }
    })
  }
}])
/*店铺商品分类*/
.controller('shopGoodsClass', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('店铺商品分类');
  /*获取店铺分类列表*/
  $http.post(
    url + "api/Mall/merchants_class",$.param({
      merchants_id: $location.search()["merchants_id"]
    }),
    {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"] == "ok"){
      $scope.merchants_class = data["data"]
      console.log($scope.merchants_class)
    }else if(data["status"] == "error"){
      console.log(data["error"])
    }
  })

  /*获取店铺的分类商品*/
  $scope.shopClassGoods = [];
  $scope.getShopClassGoodsFun = function (uuid,page) {
    $scope.page = page || 1;
    $scope.uuid = uuid;
    $http.post(
      url + "api/Mall/merchants_class_goods",$.param({
        merchants_id: $location.search()["merchants_id"],
        class_uuid: $scope.uuid,
        p: $scope.page,
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == "ok"){
        $scope.allPage = data["data"]["page"];
        $scope.shopClassGoods.push.apply($scope.shopClassGoods, data["data"]["list"]);
      }else if(data["status"] == "error"){
        console.log(data["error"])
      }
    })
  }
  /*
  * tab切换
  */
  $scope.shopClassGoodsClick = function(uuid){ // tab切换
    $scope.shopClassGoods = [];
    $scope.getShopClassGoodsFun(uuid);
    sessionStorage.setItem("shopClassUuid",uuid);
  }
  /*
  * 判断是否有shopClassUuid
  */
  if(sessionStorage.getItem("shopClassUuid") && sessionStorage.getItem("shopClassUuid") != ''){
    $scope.getShopClassGoodsFun(sessionStorage.getItem("shopClassUuid"));
  }
  /*滚动加载*/
  angular.element(window).scroll(function() {
    $scope.wTop = angular.element(window).scrollTop(); //元素中滚动条的垂直偏移
    $scope.bTop = angular.element("body").height();
    $scope.dTop = angular.element(document).height();
    if ($scope.wTop + $scope.bTop >= $scope.dTop) { //下拉到底部加载
      $scope.getShopClassGoodsFun($scope.uuid,++$scope.page);
    }
  })
}])
/*全部评价*/
.controller('allEvaluate', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('全部评价');

  $scope.evaluate_goods_info = JSON.parse(sessionStorage.getItem("evaluate_goods_info"));
  
  /*获取评价列表*/
  $scope.allEvaluateListInfo = [];  
  $scope.allEvaluateListFun = function(page){
    $scope.page = page || 1;
    $http.post(
      url + "api/Mall/goods_comment",$.param({
        goods_id:$scope.evaluate_goods_info.goods_id,
        p : $scope.page,
        pagesize : 10
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.allPage = data["data"]["page"];
        $scope.count = data["data"]["count"]
        $scope.allEvaluateListInfo.push.apply($scope.allEvaluateListInfo, data["data"]["comment"]);
        console.log($scope.allEvaluateListInfo);
      }else if(data["status"] == 'error'){
        console.log(data['data']);
      }else if (data['error'] == 'token failed') {
        myFactory.loginFun(); // 调用登录失效方法
      }
    })
  }
  $scope.allEvaluateListFun();
  /*滚动加载*/
  angular.element(window).scroll(function() {
    var wTop = null,bTop = null,dTop = null;
    wTop = angular.element(window).scrollTop();
    bTop = angular.element("body").height();
    dTop = angular.element(document).height();
    if (wTop + bTop >= dTop) { //下拉到底部加载
      if ($scope.allPage > $scope.page) {
        $scope.allEvaluateListFun(++$scope.page);
      }
    }
  })
}])
/*商品搜索*/
.controller('searchGoods', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('商品搜索');
  /*
  * 推荐商品
  */
  $http.post(
    url + "api/Mall/maybeEnjoy",$.param({
      uid: $cookieStore.get("uid"),
      token: $cookieStore.get("token"),
      merchants_id: $location.search()["merchants_id"] || '',
      pagesize: 10
    }),
    {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"] == 'ok'){
      $scope.recommendGoodsInfo = data["data"];
    }else if(data["status"] == 'error'){
      console.log(data['error']);
    }
  })
  
  /*
  * 搜索商品
  */
  $scope.searchState = false;
  $scope.goodsListInfo = [];
  $scope.searchGoodsFun = function (type,page) {
    sessionStorage.setItem("searchGoodsName",$scope.searchGoods);
    $scope.searchState = true;
    if(!$scope.searchGoods){
      myFactory.promptFun("商品名称不能为空",1300);
      return false;
    }
    $scope.page = page || 1;
    $scope.type = type || 1;
    $http.post(
      url + "api/Mall/searchGoods",$.param({
        name: $scope.searchGoods,
        p: $scope.page,
        type: $scope.type,
        merchants_id : $location.search()["merchants_id"] || '',
        pagesize: 10
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        if(data["data"]["goodsBean"].length == 0){
          myFactory.promptFun("抱歉，没有搜索到相关的商品",1300);
          return false;
        }
        $scope.allPage = data["data"]["page"];
        $scope.goodsListInfo.push.apply($scope.goodsListInfo, data["data"]["goodsBean"]);
      }else if(data["status"] == 'error'){
        console.log(data['data']);
        myFactory.promptFun(data["data"],1300)
      }
    })
  }
  /*
  * 搜索
  */
  $scope.searchGoodsClick = function(){
    $scope.goodsListInfo = [];
    $scope.searchGoodsFun()
  }
  // tab切换
  $scope.getGoodsListFun = function(type){ 
    $scope.goodsListInfo = [];
    $scope.searchGoodsFun(type);
    sessionStorage.setItem("searchGoodsType",type);
  }
  /*
  * 保存搜索状态
  */
  // if(sessionStorage.getItem("searchGoodsName") && sessionStorage.getItem("searchGoodsName") !=''){
  //   $scope.searchGoods = sessionStorage.getItem("searchGoodsName");
  //   if(sessionStorage.getItem("searchGoodsType") && sessionStorage.getItem("searchGoodsType") !=''){
  //     $scope.searchGoodsFun(sessionStorage.getItem("searchGoodsType"));
  //   }else {
  //     $scope.searchGoodsFun();
  //   }
  // }
  /*升降价*/
  $scope.sortType = 0;// 默认低价
  $scope.sortClick = function(sortType){
    if(sortType==0){
      $scope.sortType = 1;
      $scope.getGoodsListFun(3)
    }else {
      $scope.sortType = 0;
      $scope.getGoodsListFun(4)
    }
  }
  /*滚动加载*/
  angular.element(window).scroll(function() {
    $scope.wTop = angular.element(window).scrollTop();
    $scope.bTop = angular.element("body").height();
    $scope.dTop = angular.element(document).height();
    if ($scope.wTop + $scope.bTop >= $scope.dTop) { //下拉到底部加载
      if ($scope.allPage > $scope.page) {
        $scope.searchGoodsFun($scope.type,++$scope.page);
      }
    }
  })
}])
/*商品分类*/
.controller('goodsClass', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('商品分类');
  /*
  * 获取一级分类
  */
  $http.post(
    url + "api/Mall/parent_class",
    {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
  ).success(function(data){
    console.log(data);
    if(data["status"] == 'ok'){
      $scope.parentClassInfo = data["data"];
      $scope.getSeedClassClick(data["data"][0].class_uuid,data["data"][0].template_img)
    }else if(data["status"] == 'error'){
      console.log(data['data']);
    }
  })

  /*
  * 获取二级分类
  */
  $scope.getSeedClassClick = function(uuid,img){
    $scope.uuid = uuid;
    $scope.template_img = img;
    $http.post(
      url + "api/Mall/seed_class",$.param({
        class_uuid: $scope.uuid
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data);
      if(data["status"] == 'ok'){
        $scope.seedClassInfo = data["data"]
      }else if(data["status"] == 'error'){
        console.log(data['data']);
      }
    })
  }
}])




