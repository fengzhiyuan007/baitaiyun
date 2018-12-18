var url = "http://base.tstweiguanjia.com/";

var app = angular.module("app", ['ng', 'ngRoute', 'ngCookies', "ngTouch", "ngAnimate"]);
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
});
/* 轮播图指令 */
app.directive('repeatFinish',function(){
  return {
    restrict: 'A',
    repeatFinish : '@',
    link: function(scope,element,attr){
      if(scope.$last == true){
        scope.$eval(attr.repeatFinish);
        console.log('repeatFinish完成');
      }
    }
  }
})

/*路由*/
app.config(function($routeProvider, $locationProvider) {
  $routeProvider
  /*首页*/
  .when("/", {
    templateUrl: "app/views/home/home.html",
    controller: "home"
  })
  /*首页*/
  .when("/home", {
    templateUrl: "app/views/home/home.html",
    controller: "home"
  })
  /**************************** goods start *******************************/
  /*商品列表*/
  .when("/goodsList", {
    templateUrl: "app/views/goods/goodsList.html",
    controller: "goodsList"
  })
  /*商品详情*/
  .when("/goodsDetails", {
    templateUrl: "app/views/goods/goodsDetails.html",
    controller: "goodsDetails"
  })
  /*拼团列表*/
  .when("/fightGroupList", {
    templateUrl: "app/views/goods/fightGroupList.html",
    controller: "fightGroupList"
  })
  /*拼团详情*/
  .when("/fightGroupDetails", {
    templateUrl: "app/views/goods/fightGroupDetails.html",
    controller: "fightGroupDetails"
  })
  /*拼团成功*/
  .when("/fightGroupSuccess", {
    templateUrl: "app/views/goods/fightGroupSuccess.html",
    controller: "fightGroupSuccess"
  })
  /*开团成功*/
  .when("/openGroupSuccess", {
    templateUrl: "app/views/goods/openGroupSuccess.html",
    controller: "openGroupSuccess"
  })
  /**************************** goods end *******************************/
  
  /**************************** fuPoor start *******************************/
  /*扶贫列表*/
  .when("/fuPoorList", {
    templateUrl: "app/views/fuPoor/fuPoorList.html",
    controller: "fuPoorList"
  })
  /*扶贫详情*/
  .when("/fuPoorDetails", {
    templateUrl: "app/views/fuPoor/fuPoorDetails.html",
    controller: "fuPoorDetails"
  })
  /*机构详情*/
  .when("/mechanismDetails",{
    templateUrl: "app/views/fuPoor/mechanismDetails.html",
    controller: "mechanismDetails"
  })
  /**************************** fuPoor end *******************************/

  /**************************** order start *******************************/
  /*确认订单*/
  .when("/confirmOrder", {
    templateUrl: "app/views/order/confirmOrder.html",
    controller: "confirmOrder"
  })
  /*团购确认订单*/
  .when("/confirmOrderGroup", {
    templateUrl: "app/views/order/confirmOrderGroup.html",
    controller: "confirmOrderGroup"
  })
  /*订单列表*/
  .when("/orderList", {
    templateUrl: "app/views/order/orderList.html",
    controller: "orderList"
  })
  /*订单详情*/
  .when("/orderDetails", {
    templateUrl: "app/views/order/orderDetails.html",
    controller: "orderDetails"
  })
  /*售后订单列表*/
  .when("/refundList", {
    templateUrl: "app/views/order/refundList.html",
    controller: "refundList"
  })
  /*售后订单详情*/
  .when("/refundOrderDetails", {
    templateUrl: "app/views/order/refundOrderDetails.html",
    controller: "refundOrderDetails"
  })
  /*申请退款*/
  .when("/orderRefund", {
    templateUrl: "app/views/order/orderRefund.html",
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
  .when("/address",{
    templateUrl: "app/views/me/address.html",
    controller: "address"
  })
  /*申请发票列表*/
  .when("/applyInvoice",{
    templateUrl: "app/views/me/applyInvoice.html",
    controller: "applyInvoice"
  })
  /*开票详情*/
  .when("/openInvoiceDetails",{
    templateUrl: "app/views/me/openInvoiceDetails.html",
    controller: "openInvoiceDetails"
  })
  /*发票详情*/
  .when("/invoiceDetails",{
    templateUrl: "app/views/me/invoiceDetails.html",
    controller: "invoiceDetails"
  })
  /*绑定手机号*/
  .when("/bindingPhone",{
    templateUrl: "app/views/me/bindingPhone.html",
    controller: "bindingPhone"
  })
  /*更换绑定手机号*/
  .when("/changeBindingPhone",{
    templateUrl: "app/views/me/changeBindingPhone.html",
    controller: "changeBindingPhone"
  })
  /*我参与的公益*/
  .when("/partakeWelfares",{
    templateUrl: "app/views/me/partakeWelfares.html",
    controller: "partakeWelfares"
  })
  /*系统消息*/
  .when("/sysMsg",{
    templateUrl: "app/views/me/sysMsg.html",
    controller: "sysMsg"
  })
  /*荣誉积分*/
  .when("/integral",{
    templateUrl: "app/views/me/integral.html",
    controller: "integral"
  })
  /*意见反馈*/
  .when("/feedback",{
    templateUrl: "app/views/me/feedback.html",
    controller: "feedback"
  })
  /*关于乐农*/
  .when("/about",{
    templateUrl: "app/views/me/about.html",
    controller: "about"
  })
  /**************************** 个人中心 end *******************************/
  .otherwise({
    redirectTo: "/"
  })
})


