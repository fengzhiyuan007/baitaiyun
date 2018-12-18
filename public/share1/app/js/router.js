/** 
* 删除数组指定下标或指定对象 
**/ 
Array.prototype.remove=function(obj){ 
  for(var i =0;i <this.length;i++){ 
    var temp = this[i]; 
    if(!isNaN(obj)){ 
    temp=i; 
  } 
  if(temp == obj){ 
    for(var j = i;j <this.length;j++){ 
      this[j]=this[j+1]; 
    } 
    this.length = this.length-1; 
    } 
  } 
}
/* 具体用法 */
// var str ="vvvvvvv"; 
// arr.remove(3);//删除下标为3的对象 
// arr.remove(str);//删除对象值为“vvvvvvv” 

/*删除数组中的指定元素*/
Array.prototype.indexOf = function(val) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == val) return i;
  }
  return -1;
};
Array.prototype.removeOf = function(val) {
  var index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};
/*判断数组中是否有某个元素*/
Array.prototype.contains = function (obj) {  
  var i = this.length;  
  while (i--) {  
    if (this[i] === obj) {  
      return true;  
    }  
  }  
  return false;  
}
/*具体用法*/
// [1, 2, 3].contains(2); //返回true 

// var url = "http://dspx.tstmobile.com/";
var url = location.href.split(".com")[0] + '.com/';

var app = angular.module("app", ['ng', 'ngRoute', 'ngCookies', "ngTouch",'me-lazyload']);
/*百分比过滤器*/
app.filter('PercentValue', function () {
  return function (o) {
    if (o != undefined && /(^(-)*\d+\.\d*$)|(^(-)*\d+$)/.test(o)) {
      var v = parseFloat(o);
      return Number(Math.round(v * 10000) / 100) + "%";
    } else {
      return "undefined";
    }
  }
})

app.run(['$rootScope', '$location', '$http', '$cookieStore',function($rootScope, $location, $http,$cookieStore,myFactory) {
  /* 
  * 监听路由的状态变化 
  * $routeChangeStart：这个事件会在路由跳转前触发
  * $routeChangeSuccess：这个事件在路由跳转成功后触发
  * $routeChangeError：这个事件在路由跳转失败后触发
  */
  $rootScope.$on('$routeChangeStart', function(evt,current,previous) {
    // console.log(evt)
    // console.log(current.$$route.originalPath); // 现在的
    // console.log(previous.$$route.originalPath); // 以前的
  });

  $rootScope.$on('$routeChangeSuccess', function(evt, current, previous) {
    // console.log(evt)
    // console.log(current.$$route.originalPath); // 现在的
    // console.log(previous.$$route.originalPath); // 以前的
    /* 每次切换路由使页面在最顶部 */
    angular.element('body').scrollTop(0);
  });
}])

/*路由*/
app.config(function($routeProvider, $locationProvider,$compileProvider) {
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|sms|javascript):/);
  $routeProvider
  /*首页*/
  .when("/", {
    templateUrl: "app/views/mall/mall.html",
    controller: "mall"
  })
  /*首页*/
  .when("/home", {
    templateUrl: "app/views/home/home.html",
    controller: "home"
  })
  /**************************** live start *******************************/
  /*直播分类*/
  .when("/liveClass", {
    templateUrl: "app/views/live/liveClass.html",
    controller: "liveClass"
  })
  /*城市列表*/
  .when("/cityList", {
    templateUrl: "app/views/live/cityList.html",
    controller: "cityList"
  })
  /*直播间-竖屏*/
  .when("/liveRoom_mobile", {
    templateUrl: "app/views/live/liveRoom_mobile.html",
    controller: "liveRoom_mobile"
  })
  /*直播间-横屏*/
  .when("/liveRoom_pc", {
    templateUrl: "app/views/live/liveRoom_pc.html",
    controller: "liveRoom_pc"
  })
  /*直播间-测试*/
  .when("/liveRoom_test", {
    templateUrl: "app/views/live/liveRoom_test.html",
    controller: "liveRoom_test"
  })
  /*主播详情页*/
  .when("/anchorDetails", {
    templateUrl: "app/views/live/anchorDetails.html",
    controller: "anchorDetails"
  })
  /*录播*/
  .when("/recording", {
    templateUrl: "app/views/live/recording.html",
    controller: "recording"
  })
  /*商铺搜索or主播搜索*/
  .when("/searchLiveShop", {
    templateUrl: "app/views/live/searchLiveShop.html",
    controller: "searchLiveShop"
  })
  /**************************** live end *******************************/

  /**************************** goods start *******************************/
  /*商场首页*/
  .when("/mall",{
    templateUrl: "app/views/mall/mall.html",
    controller: "mall"
  })
  /*商品列表*/
  .when("/goodsList", {
    templateUrl: "app/views/mall/goods/goodsList.html",
    controller: "goodsList"
  })
  /*商品详情*/
  .when("/goodsDetails", {
    templateUrl: "app/views/mall/goods/goodsDetails.html",
    controller: "goodsDetails"
  })
  /*全部评价*/
  .when("/allEvaluate", {
    templateUrl: "app/views/mall/goods/allEvaluate.html",
    controller: "allEvaluate"
  })
  /*商品分类*/
  .when("/goodsClass", {
    templateUrl: "app/views/mall/goods/goodsClass.html",
    controller: "goodsClass"
  })
  /*商品搜索*/
  .when("/searchGoods", {
    templateUrl: "app/views/mall/goods/searchGoods.html",
    controller: "searchGoods"
  })
  /*购物车*/
  .when("/shoppingCart", {
    templateUrl: "app/views/mall/shoppingCart/shoppingCart.html",
    controller: "shoppingCart"
  })
  /*店铺详情*/
  .when("/shopDetails", {
    templateUrl: "app/views/mall/shop/shopDetails.html",
    controller: "shopDetails"
  })
  /*店铺商品分类*/
  .when("/shopGoodsClass", {
    templateUrl: "app/views/mall/shop/shopGoodsClass.html",
    controller: "shopGoodsClass"
  })
  /*店铺介绍*/
  .when("/shopIntroduce", {
    templateUrl: "app/views/mall/shop/shopIntroduce.html",
    controller: "shopIntroduce"
  })
  /**************************** goods end *******************************/

  /**************************** order start *******************************/
  /*确认订单*/
  .when("/confirmOrder", {
    templateUrl: "app/views/mall/order/confirmOrder.html",
    controller: "confirmOrder"
  })
  /*购物车结算-确认订单*/
  .when("/confirmOrder_car", {
    templateUrl: "app/views/mall/order/confirmOrder_car.html",
    controller: "confirmOrder_car"
  })
  /*购物车结算-确认订单*/
  .when("/paySuccess", {
    templateUrl: "app/views/mall/order/paySuccess.html",
    controller: "paySuccess"
  })
  /*订单列表*/
  .when("/orderList", {
    templateUrl: "app/views/mall/order/orderList.html",
    controller: "orderList"
  })
  /*售后订单列表*/
  .when("/saleAfterOrderList", {
    templateUrl: "app/views/mall/order/saleAfterOrderList.html",
    controller: "saleAfterOrderList"
  })
  /*售后订单详情*/
  .when("/saleAfterOrderDetails", {
    templateUrl: "app/views/mall/order/saleAfterOrderDetails.html",
    controller: "saleAfterOrderDetails"
  })
  /*订单详情*/
  .when("/orderDetails", {
    templateUrl: "app/views/mall/order/orderDetails.html",
    controller: "orderDetails"
  })
  /*物流详情*/
  .when("/logisticsDetails", {
    templateUrl: "app/views/mall/order/logisticsDetails.html",
    controller: "logisticsDetails"
  })
  /*填写退货物流*/
  .when("/fillLogistics", {
    templateUrl: "app/views/mall/order/fillLogistics.html",
    controller: "fillLogistics"
  })
  /*评价订单*/
  .when("/evaluateOrder", {
    templateUrl: "app/views/mall/order/evaluateOrder.html",
    controller: "evaluateOrder"
  })
  /*申请售后*/
  .when("/orderRefund", {
    templateUrl: "app/views/mall/order/orderRefund.html",
    controller: "orderRefund"
  })
  
  /**************************** order end *******************************/

  /**************************** 个人中心 start *******************************/
  /*个人中心*/
  .when("/me",{
    templateUrl: "app/views/me/me.html",
    controller: "me"
  })
  /*个人信息*/
  .when("/userDetails",{
    templateUrl: "app/views/me/userDetails.html",
    controller: "userDetails"
  })
  /*我的地址*/
  .when("/my_address",{
    templateUrl: "app/views/me/my_address.html",
    controller: "my_address"
  })
  /*我的账户*/
  .when("/my_account",{
    templateUrl: "app/views/me/my_account.html",
    controller: "my_account"
  })
  /*充值记录*/
  .when("/rechargeHistory",{
    templateUrl: "app/views/me/rechargeHistory.html",
    controller: "rechargeHistory"
  })
  /*我的收藏*/
  .when("/my_collection",{
    templateUrl: "app/views/me/my_collection.html",
    controller: "my_collection"
  })
  /*我的关注*/
  .when("/my_follow",{
    templateUrl: "app/views/me/my_follow.html",
    controller: "my_follow"
  })
  /*设置*/
  .when("/setUp",{
    templateUrl: "app/views/me/setUp.html",
    controller: "setUp"
  })
  /*意见反馈*/
  .when("/feeback",{
    templateUrl: "app/views/me/feeback.html",
    controller: "feeback"
  })
  /*关于我们*/
  .when("/about",{
    templateUrl: "app/views/me/about.html",
    controller: "about"
  })
  /*消息中心*/
  .when("/news",{
    templateUrl: "app/views/me/news.html",
    controller: "news"
  })
  /*消息详情*/
  .when("/newsDetails",{
    templateUrl: "app/views/me/newsDetails.html",
    controller: "newsDetails"
  })
  /*我的优惠券*/
  .when("/my_coupon",{
    templateUrl: "app/views/me/my_coupon.html",
    controller: "my_coupon"
  })
  /**************************** 个人中心 end *******************************/

  /**************************** 资讯 start *******************************/
  /*资讯列表*/
  .when("/informationList",{
    templateUrl: "app/views/information/informationList.html",
    controller: "informationList"
  })
  /*资讯详情*/
  .when("/informationDetails",{
    templateUrl: "app/views/information/informationDetails.html",
    controller: "informationDetails"
  })
  /**************************** 资讯 end *******************************/

  /**************************** 成为卖家 start *******************************/
  /*成为卖家*/
  .when("/becomeSeller",{
    templateUrl: "app/views/becomeSeller/becomeSeller.html",
    controller: "becomeSeller"
  })
  /*填写资料*/
  .when("/fillUserInfo",{
    templateUrl: "app/views/becomeSeller/fillUserInfo.html",
    controller: "fillUserInfo"
  })
  /**************************** 成为卖家 end *******************************/
  .otherwise({
    redirectTo: "/"
  })
})


