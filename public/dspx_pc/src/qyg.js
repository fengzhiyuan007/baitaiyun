/*
* @Author: cool
* @Date:   2017-01-02 10:51:15
* @Last Modified by:   cool
* @Last Modified time: 2017-01-18 19:55:00
*/
var app=angular.module('app',['ng', 'ngRoute', 'ngAnimate','ngTouch','ngCookies'])
.config(function($routeProvider){
    $routeProvider
    //首页
    .when("/",{
        templateUrl:"index/qyg.html",
        controller:"qyg",
    })
    .when("",{
        templateUrl:"index/qyg.html",
        controller:"qyg",
    })
    .otherwise({
        redirectTo: "/"
    })
})
app.controller('home',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
      $scope.url='http://sw.tstweiguanjia.com';
      //右上角名称是否显示
      $scope.membershow=0;
      $cookieStore.put("member_id",$.cookie('member_id')==null?"0":$.cookie('member_id').replace(/\"/g,""));
      $cookieStore.put("member_token",$.cookie('member_token')==null?"0":$.cookie('member_token').replace(/\"/g,""));
      $scope.grxx_center=function(){
            $http.post($scope.url+"/memberInterfaces.api?getMemberDetail",$.param({
                member_id:$cookieStore.get('member_id'),
                member_token:$cookieStore.get('member_token'),
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.membershow=1;
                    $scope.grxx_centers=data['data']
                }else{
                    $scope.membershow=0;
                    $scope.grxx_centers=''
                }
            })
      }
      $scope.grxx_center();
      //登录
      $scope.tcksign=0;//初始化登录弹出窗
      $scope.tckshow=function(arr){
        $scope.tcksign=1;
      }
      $scope.tckhide=function(){
        $scope.tcksign=0;
      }
      $scope.signbtn=function(arr,brr){//登录
            console.log(arr)
            if(arr==undefined||arr==''){
                alert('请填写手机号');
                return false;
            }
            if(brr==undefined||brr==''){
                alert('请填写密码');
                return false;
            }

            $http.post($scope.url+"/memberInterfaces.api?memberLogin",$.param({
                member_account:arr,
                password:brr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $cookieStore.put("member_id",data['data']['member_id']);
                    $cookieStore.put("member_token",data['data']['member_token']);
                    $scope.tcksign=0;
                    window.location.reload();
                }else{
                    alert(data['error'])
                }
            })
      }
      //注册
      $scope.regbtn=function(arr,brr,crr,drr){//注册
            console.log(arr+","+brr+","+crr+","+drr)
            $('.tck .sign-box ul.reg-ul li p').html('');
            if(crr.length<6){
                $("#regpwd").text('密码不规范');
                return false;
            }
            if(crr!=drr){
                $("#regpwd2").text('2次密码不一致');
                return false;
            }
            $http.post($scope.url+"/memberInterfaces.api?memberRegister",$.param({
                member_account:arr,
                password:crr,
                code:brr,
                member_role:'member',
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    alert('注册成功')
                    $scope.signbtn(arr,crr)
                }else{
                    alert(data['error'])
                }
            })
      }
        //获取验证码
        var InterValObj; //timer变量，控制时间
        var count = 60; //间隔函数，1秒执行
        var curCount;//当前剩余秒数
        var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
        $scope.sendMessage=function(arr){
            if(!myreg.test(arr)){
                alert("请输入有效的手机号码！");
            }else{
                $http.post($scope.url+"/othersInterfaces.api?sendCode",$.param({
                    mobile:arr,
                    code_type:"member_register",
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
                ).success(function(data){
                    console.log(data);
                    if(data["status"]=="ok"){
                        curCount = count;
                    　　//设置button效果，开始计时
                         $("#btnSendCode").attr("disabled", "true");
                         $("#btnSendCode").val(curCount + "s");
                         InterValObj = window.setInterval(SetRemainTime, 1000); //启动计时器，1秒执行一次
                    }else if (data["status"] == "pending" && data["error"] == "token failed"){
                        $scope.relogin()
                    }else{
                        alert(data['error'])
                    }
                })
            }
        }
        //timer处理函数
        function SetRemainTime() {
            if (curCount == 0) {
                window.clearInterval(InterValObj);//停止计时器
                $("#btnSendCode").removeAttr("disabled");//启用按钮
                $("#btnSendCode").val("重新发送");
            }
            else {
                curCount--;
                $("#btnSendCode").val(curCount + "s");
            }
       }
       /****获取验证码end***/

      //退出登录
      $scope.delmomber=function(){
        $cookieStore.put("member_id",0);
        $cookieStore.put("member_token",0);
        window.location.reload();
      }

      //伪造登录
      // $cookieStore.put("member_id",'5');
      // $cookieStore.put("member_token",'123456');
      //失去登录状态
      $scope.relogin=function(){
        $scope.tcksign=1;
      }
      //热搜词条
      $http.post($scope.url+"/goodsInterfaces.api?getHotSearchs",$.param({
            search_type:'goods',
            page:1,
            limit:5,
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.hotentry=data['data']
            }else{
                alert(data['error'])
            }
        })
      //nav
      $http.post($scope.url+"/swInterfaces.api?getHomeLabels",$.param({
            label_position:1,
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.navlist=data["data"];
                $scope.navlen=data["data"].length+1;
                console.log($scope.navlen)
            }else{
                alert(data['error'])
            }
        })
      $scope.selectsort=function(arr){
        if(arr==0){
            $scope.selectsorts=1;
        }else{
            $scope.selectsorts=0;
        }
      }
      $scope.selectsort(1)
      //商品分类
      $scope.sorts=function(arr,brr){
        $http.post($scope.url+"/swInterfaces.api?getBusinessBuyClass",$.param({

        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.sortlist=data["data"];
            }else{
                alert(data['error'])
            }
        })
      }
      $scope.sorts(-1,3)
      //sorthover
      $scope.sorthover=function(arr,brr){
          //获取品牌
          $http.post($scope.url+"/goodsInterfaces.api?getAllBrandByClass",$.param({
                goods_uuid:arr,
                limit:20,
          }),
          {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
          ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.sortbrand=data["data"];
                }else{
                    alert(data['error'])
                }
          })
          //悬浮
          $(".sorts>.list li").removeClass("act")
          $(".sorts>.list li").eq(brr).addClass("act")
          var len=$(".sorts-center .listbox").length;
          for(var i=0;i<len;i++){
            if(brr==$(".sorts-center .listbox").eq(i).attr("b")){
              $(".sorts-center .listbox").hide();
              $(".sorts-center").show()
              $(".sorts-center .listbox").eq(i).show();
              break;
            }
          }

      }
      $scope.sortleave=function(){
            //$(".sorts>.list li").removeClass("act");
            $(".sorts-center").hide()
      }
      //点击搜索按钮
      $scope.goshoplist=function(arr){
        var name;
        if(arr==''||arr==undefined){
            name=''
        }else{
            name=arr
        }
        var actsortval=$('.logo-inp-box-select span').attr('val');
        var actsortgid=$('.logo-inp-box-select span').attr('gid');
        window.location.href="index.html#/shoplist?goodsname="+name+"&uuid="+actsortval+"&gid="+actsortgid;
      }
      //获取购物车里的商品数量
      $scope.gwc_num=function(){
        $http.post($scope.url+"/shoppingCarInterfaces.api?getMemberShoppingCarCount",$.param({
            member_id:$cookieStore.get("member_id"),
            member_token:$cookieStore.get("member_token"),
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.gwc_nums=data["data"];
            }else{
                $scope.gwc_nums=0
            }
        }).error(function(){
            $scope.gwc_nums=0
        })
      }
      $scope.gwc_num();

      //回到顶部或者某个位置
      $scope.scrolltop=function(arr){
        $("html,body").stop().animate({scrollTop:arr},300);
      }
      //分类是否收起来
      $scope.navsortshows=function(arr){
        if(arr==0){
            $scope.navsortshow=1;
        }else if(arr==1){
            $scope.navsortshow=0;
        }else{
            $scope.navsortshow=1;
        }
      }
})

    // 首页
    .controller('qyg',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.navsortshows(0);
        $scope.scrolltop(0);
        //轮播
        $http.post($scope.url+"/bannerInterfaces.api?getAllBanners",$.param({
            banner_position:"home",
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.banner=data["data"];
            }else{
                alert(data['error'])
            }
        })
        $scope.flexslider=function() {
            $(".flexslider").flexslider({
                slideshowSpeed: 3000, //展示时间间隔ms
                animationSpeed: 300, //滚动时间ms
                pauseOnAction:false,
                touch: true //是否支持触屏滑动(比如可用在手机触屏焦点图)
            });
        };
        //网站首页推荐分类
        $http.post($scope.url+"/swInterfaces.api?getHomeClassWeb",$.param({

        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.homessort=data["data"];
            }else{
                alert(data['error'])
            }
        })

        //
        $scope.hometabsort=function(arr,brr){
            $("#sort"+brr).find(".tit p a").removeClass('act');
            $("#sort"+brr).find(".tit p a").eq(arr).addClass('act');
            $("#sort"+brr).find(".sj-rightbox").removeClass('act');
            $("#sort"+brr).find(".sj-rightbox").eq(arr).addClass('act')
        }


    })
    //搜索框的下拉
    .directive("selSort", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    $(".logo-inp-box-select").addClass("act");
                    $(".logo-inp-box-select>span").attr("val",element.attr('val')).attr("gid",element.attr('gid')).text(element.text())

                });
            }
        }
    }])

    //判断循环是否结束
    .directive('repeatFinish',function(){
      return {
          link: function(scope,element,attr){if(scope.$last == true){
                  console.log('ng-repeat执行完毕');
                  scope.flexslider( attr.repeatFinish );
              }
          }
      }
     })
    .directive('repeatFinish2',function(){
      return {
          link: function(scope,element,attr){if(scope.$last == true){
                  console.log('ng-repeat执行完毕');
                  scope.owlCarousel( attr.repeatFinish );
              }
          }
      }
     })
    .directive("tab", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    element.addClass("act");
                    element.siblings().removeClass("act")
                });
            }
        }
    }])
    .directive("signtab", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    element.addClass("act");
                    element.siblings().removeClass("act");
                    if(element.index()==0){
                        $('.reg-ul').hide();
                        $('.sign-ul').show();
                        element.parents(".sign-box").removeClass("reg-box")
                    }else if(element.index()==1){
                        $('.reg-ul').show();
                        $('.sign-ul').hide();
                        element.parents(".sign-box").addClass("reg-box")
                    }else{

                    }
                });
            }
        }
    }])






