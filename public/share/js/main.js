
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
    // // 直播 和 店铺
    $scope.appJumpZhibo=function () {
        var u = navigator.userAgent;
        if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {//安卓手机
            JavaScript:android.appJumpZhibo()
        } else
        if (u.indexOf('iPhone') > -1) {//苹果手机
            appJumpZhibo()
        }
    }
    $scope.appJumpDianpu=function () {
        var u = navigator.userAgent;
        if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {//安卓手机
            JavaScript:android.appJumpDianpu()
        } else
        if (u.indexOf('iPhone') > -1) {//苹果手机
            appJumpDianpu()
        }
    }

    /*调用轮播图插件*/
    $scope.flexsliders=function(dom) {
        $(dom).flexslider({
            slideshowSpeed: 3000, //展示时间间隔ms
            animationSpeed: 300, //滚动时间ms
            pauseOnAction:false,
            touch: true //是否支持触屏滑动(比如可用在手机触屏焦点图)
        });
    }

    /* good an banner */
    $http.post(
        url + "/api/Mall/goods_info",
        $.param({
            goods_id: urlParams['goods_id'] ,
            uid:urlParams['uid'],
            token:urlParams['token']
        }),
        {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
        console.log(data);
        if(data["status"] == 'ok'){
            $scope.goodsInfo = data["data"];
            // $scope.merchants_id=data["data"]["merchants_id"];
            $scope.bannerInfo = data["data"]["imgs"];
            $scope.goods_url_desc = $sce.trustAsHtml(data["data"].goods_detail);
            // $scope.getmerth();
            angular.element("#loading").fadeOut(500);
        }else if(data["status"] == 'error'){
            console.log(data['error']);
        }else if (data['error'] == 'token failed') {
            console.log(data['error']); // 调用登录失效方法
        }
    });
    // 商户详情
    $scope.uid=urlParams['uid'];
    $scope.token=urlParams['token'];
    // $scope.merchants_id=parseInt($scope.merchants_id);
    $scope.getmerth=function () {
        $http.post(
            url+"/api/Mall/merchants_info",
            $.param({
                uid:urlParams['uid'],
                token:urlParams['token'],
                // merchants_id: $scope.merchants_id
                merchants_id: urlParams["merchants_id"]
            }),
            {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function (data) {
            console.log(data);
            if(data["status"] == 'ok'){
                $scope.merchantsInfo = data["data"];
                $(".dianpu").attr("href","JavaScript:android.appJumpDianpu(\""+$scope.merchantsInfo.member_id+"\")");
                angular.element("#loading").fadeOut(300);
            }else if(data["status"] == 'error'){
                console.log(data['error']);
            }else if (data['error'] == 'token failed') {

            }
        })
    }
    $scope.getmerth();
   $scope.appJumpGuanzhu=function () {
        // if(t==1){ // 已关注 取消关注
       angular.element("#loading").fadeIn(100);
            $http.post(
                url+"/api/User/follow_merchants",
                $.param({
                    uid:urlParams['uid'],
                    token:urlParams['token'],
                    user_id2: urlParams["merchants_id"]
                }),
                {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function (data) {
                console.log(data);
                if(data["status"] == 'ok'){
                    $scope.getmerth();
                }else if(data["status"] == 'error'){
                    console.log(data['error']);
                    angular.element("#loading").fadeOut(300);
                }else if (data['status'] == 'pending' && data['data']=='token failed') {
                    angular.element("#loading").fadeOut(300);
                    var u = navigator.userAgent;
                        console.log('tokenfailed');
                        console.log(u);
                        if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {//安卓手机
                            JavaScript:android.appJumpGuanzhu(urlParams["merchants_id"])
                        } else
                        if (u.indexOf('iPhone') > -1) {//苹果手机
                            appJumpGuanzhu()
                        }
                }
            })
        // }else if(t==2){

        }

    $scope.appviewbanner=function (aa,bb) { // 轮播图交互放大方法
        // console.log($scope.bannerInfo);
        // var abc = $scope.bannerInfo;
        var abc = $scope.bannerInfo.join(',');
        // console.log(abc);
        var u = navigator.userAgent;
        if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {//安卓手机
            JavaScript:android.appviewbanner(abc,bb)
        } else
        if (u.indexOf('iPhone') > -1) {//苹果手机
            appviewbanner(abc,bb)
        }
    }
    // $scope.appJumpDianpu=function () {
    //     var u = navigator.userAgent;
    //     console.log($scope.merchantsInfo.member_id);
    //     if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {//安卓手机
    //         JavaScript:android.appJumpDianpu($scope.merchantsInfo.member_id)
    //     } else
    //     if (u.indexOf('iPhone') > -1) {//苹果手机
    //         appJumpDianpu($scope.merchantsInfo.member_id)
    //     }
    // }
}]);

