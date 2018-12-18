
function GetRequest() {
    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for(var i = 0; i < strs.length; i ++) {
            theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}

// 调用方式
var urlParams = GetRequest();
// urlParams["参数名称"]

var app = angular.module("app", ['ng', 'ngRoute', 'ngCookies']);
// app.config([
//     '$compileProvider',
//     function ($compileProvider) {
//         $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|javascript|mailto|tel|file|sms):/);
//         // Angular v1.2 之前使用 $compileProvider.urlSanitizationWhitelist(...)
//     }
// ])
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
var url = location.href.split("/")[0];

/*主控制器*/
app.controller('mainCtrl', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce) {
    console.log('主控制器');
    angular.element("#loading").fadeIn(100);
    /* banner */
      $http.post(
        "http://dspx.tstmobile.com/" + "api/index/banner_list",$.param({
            type: 4
        }),
        {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
      ).success(function(data){
        console.log(data);
        if(data["status"] == 'ok'){
          $scope.bannerInfo = data["data"];
          for(var i=0;i<data["data"].length;i++){
            if(data["data"][i].b_type==1){ // 无跳转
              $scope.bannerInfo[i].url="javascript:;"
            }else if(data["data"][i].b_type==2){ // web(外链)
              $scope.bannerInfo[i].url=data["data"][i].jump
            }else if(data["data"][i].b_type==3){ // 分类页
              $scope.bannerInfo[i].url=""
            }else if(data["data"][i].b_type==4){ // 商家（店铺）
              $scope.bannerInfo[i].url="#/shopDetails?merchants_id=" + data["data"][i].jump;
            }else if(data["data"][i].b_type==5){ // 商品详情
              $scope.bannerInfo[i].url="#/goodsDetails?goods_id=" + data["data"][i].jump
            }else if(data["data"][i].b_type==6){ // 优惠券
              $scope.bannerInfo[i].url=data["data"][i].jump+"&uid1="+$scope.uid1+"&token1="+$scope.token1;
            }
          }
        }else if(data["status"] == 'error'){
          console.log(data['error']);
        }
      })
     /*调用轮播图插件*/
      $scope.flexsliders=function(dom) {
          $(dom).flexslider({
              slideshowSpeed: 3000, //展示时间间隔ms
              animationSpeed: 300, //滚动时间ms
              pauseOnAction:false,
              touch: true //是否支持触屏滑动(比如可用在手机触屏焦点图)
          });
      }
    // 判断是否微信
    $scope.wxOf = 0; // 0为App  1为微信
    if (urlParams['uid1'] && urlParams['token1']) { //如果传值过来，便是微信
        $scope.wxOf = 1;
    }
    /*提示方法*/
    $scope.promptFun = function(txt, time) { //txt(提示文本)，time(时间)
        // $scope.promptTxt = txt;
        angular.element(".text").text(txt);
        angular.element("#tips").fadeIn(300);
        $timeout(function() {
          angular.element("#tips").fadeOut(300);
        }, time)
      }
    /*获取用户信息*/
    var  uid = urlParams['uid'];
    var  token = urlParams['token'];
    // var  merchants_id = urlParams['merchants_id'];
    console.log(uid+"..."+token+"...");
    /*头部选项点击事件*/
    $scope.goodsHeaderType = 1;
    $scope.goodsHeaderClick = function(t){
        $scope.goodsHeaderType = t;
        if(t==1){
            angular.element('html, body').animate({
                scrollTop: $("body").offset().top
            }, 300);
        }else{
            angular.element('html, body').animate({
                scrollTop: $("#goodsDetailsBox").offset().top
            }, 300);
        }
    }
    $scope.goodsHeaderClick(1);
    // // 暴露跳转方法
    // $scope.goodsHeader=function (t) {
    //     var u = navigator.userAgent;
    //     if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {//安卓手机
    //         JavaScript:android.goodsHeader(t)
    //     } else
    //     if (u.indexOf('iPhone') > -1) {//苹果手机
    //         goodsHeader(t)
    //     }
    // }

   

    /* get couponlist */
    $scope.couponInfo=[];
    $scope.getcouponlistFun= function (page) {
        $scope.page=page||1;
        $http.post(
            url + "/api/User/coupon",
            $.param({
                uid:urlParams['uid'],
                token:urlParams['token'],
                p:$scope.page,
                pagesize:10
            }),
            {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"] == 'ok'){
                $scope.allPage = Math.ceil(data["page"] / 10) == 0 ? '1' : Math.ceil(data["page"] / 10);
                $scope.couponInfo.push.apply( $scope.couponInfo, data["data"]["list"]);
                angular.element("#loading").fadeOut(1500);
            }else if(data["status"] == 'error'){
                console.log(data['error']);
                angular.element("#loading").fadeOut(1500);
            }else if (data['error'] == 'token failed') {
                console.log(data['error']); // 调用登录失效方法
                angular.element("#loading").fadeOut(1500);
            }
        });
    }
    $scope.getcouponlistFun(); // 初始加载

    $scope.drawCoupon= function (coupon_id) {  //领取优惠券
        $http.post(
            url + "/api/User/draw_coupon",
            $.param({
                uid:urlParams['uid1'],
                token:urlParams['token1'],
                coupon_id: coupon_id
            }),
            {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"] == 'ok'){
                $scope.promptFun(data['data'],1500);
            }else if(data["status"] == 'error'){
                console.log(data['data']);
                $scope.promptFun(data['data'],1500);
            }else if (data['error'] == 'token failed') {
                console.log(data['error']); // 调用登录失效方法
            }
        });
    }
    /*滚动加载*/
    $(window).scroll(function() {
        var wTop = null,bTop = null,dTop = null;
        wTop = $(window).scrollTop();
        bTop = $("body").height();
        dTop = $(document).height();
        if (wTop + bTop >= dTop) { //下拉到底部加载
            if ($scope.allPage > $scope.page) {
                $scope.getcouponlistFun(++$scope.page);
            }else{
                angular.element("#scrollType").show();
            }
        }})
    // if(!urlParams['uid']){
    //     $scope.isload=0;
    // }else {
    //     $scope.isload=1;
    // }
    $scope.appcoupon=function (couponid,type) {
        var u = navigator.userAgent;
        // console.log(typeof(couponid)+",,"+typeof(type));

        if(!urlParams['uid'] && (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1)){
            JavaScript:android.appcoupon(parseInt(couponid) ,0);
            // $scope.getcouponlistFun();
        }else if(!urlParams['uid'] && (u.indexOf('iPhone') > -1)){
            appcoupon(couponid ,0)
        }else if(urlParams['uid'] && (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1)){
            JavaScript:android.appcoupon(parseInt(couponid) ,1);
            angular.element("#loading").fadeIn(100);
            $scope.couponInfo=[];
            $timeout(function(){
                $scope.getcouponlistFun();
            },1500);
            // $scope.getcouponlistFun();
        }else if(urlParams['uid'] && (u.indexOf('iPhone') > -1)){
            appcoupon(couponid ,1)
        } 
        // if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {//安卓手机
        //     JavaScript:android.getcoupon(couponid)
        // } else
        // if (u.indexOf('iPhone') > -1) {//苹果手机
        //     getcoupon(couponid)
        // }
    }

}]);

