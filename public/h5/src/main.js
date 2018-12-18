/*
* @Author: cool
* @Date:   2017-01-02 10:51:15
* @Last Modified by:   cool
* @Last Modified time: 2017-04-01 10:29:17
*/
//手机正则
var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
app.controller('home',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
    
        $scope.url='http://dspx.tstmobile.com';


        //首页列表内容
        $http.post($scope.url+"/api/Home/home_class",
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            if(data["status"]=="ok"){
                $scope.navlist = data["data"];
            }
        })


        $http.post($scope.url+"/api/Home/home_class",
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            if(data["status"]=="ok"){
                $scope.navlist = data["data"];
            }
        })

        $http.post($scope.url+"/api/Mall/parent_class",
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            if(data["status"]=="ok"){
                $scope.sortlist = data["data"];
            }
        })
        //商品内容展示内容
        $scope.sorthover = function(arr){
            $http.post($scope.url+"/api/Mall/seed_class",$.param({
                    class_uuid:arr
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                if(data["status"]=="ok"){
                    $scope.sortbrand=data["data"];
                }else{
                    $scope.alerttxt(data['error'])
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



        


})
    .controller('homes',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $rootScope.listShowHide = true;
    //banner内容
    $http.post($scope.url+"/api/index/banner_list",
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
        if(data["status"]=="ok"){
            $scope.banner_img = data["data"];
        }
    })
    /*调用轮播图插件*/
    $scope.js_silder=function(dom) {
        angular.element(dom).silder({
            auto: true,//自动播放，传入任何可以转化为true的值都会自动轮播
            speed: 20,//轮播图运动速度
            sideCtrl: true,//是否需要侧边控制按钮
            bottomCtrl: true,//是否需要底部控制按钮
            defaultView: 0,//默认显示的索引
            interval: 3000,//自动轮播的时间，以毫秒为单位，默认3000毫秒
            activeClass: "active",//小的控制按钮激活的样式，不包括作用两边，默认active
        });
    }



    //用户登入内容
    $scope.loginContent = function(mobile,yzm){
        if(mobile === undefined || mobile === ""){
            alert("请输入手机号");
            return;
        }else if(yzm === undefined || yzm === ""){
            alert("请输入验证码");
            return;
        }else if(mobile === undefined || yzm === undefined || mobile === "" || yzm === ""){
            alert("手机号与验证码不能为空");
            return;
        }else{
            $http.post($scope.url+"/api/login/message_login",$.param({
                    mobile:mobile,
                    yzm:yzm
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                if(data["status"] == "ok"){
                    alert("登入成功");
                    $rootScope.LoginContentShowHide = false;
                    $rootScope.LogoutContentShowHide = true;
                    $rootScope.hx_username=data["data"].hx_username;
                    $rootScope.phone=data["data"].phone;
                    var sss= JSON.stringify(data["data"]);
                    sessionStorage.setItem("key",sss);
                }else{
                    alert(data["data"]);
                }
            })
        }

    }
    //用户获取验证码信息内容
    $scope.validationButton = function(mobile){
        if(mobile === undefined || mobile === ""){
            alert("手机号不能为空");
            return;
        }else{
            $http.post($scope.url+"/api/login/sendSMS",$.param({
                    mobile:mobile
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                if(data["data"] === "发送成功!"){
                    alert("获取成功")
                }else if(data["data"] === "一分钟只能发送一条短信"){
                    alert("一分钟只能发送一条短信");
                }
            })
        }
    }
    
    $scope.validationOut = function(){
        $scope.LoginContentShowHide = true;
        $scope.LogoutContentShowHide = false;
        $scope.hx_username="";
        $scope.phone="";
        sessionStorage.removeItem("key");
    }
})
    .controller('shoplist',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        var class_uuid = $location.search()["class_uuid"];
        var sortname = $location.search()["sortname"];
        //商品分类
        $http.post($scope.url+"/api/Mall/seed_class",$.param({
                class_uuid:class_uuid
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            if(data["status"] =="ok"){
                $scope.goodsClassification = data["data"];
            }
        })


        //首页列表内容
        $http.post($scope.url+"/api/Mall/class_goods",$.param({
                class_uuid:class_uuid,
                pagesize:8
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            $scope.getsortname = sortname;
            if(data["status"]=="ok"){
                $scope.pageNum =data.data.page;
                $scope.pageboxs = data.data.page;
                $scope.shoplist = data.data.goodsBean;
                $scope.pageclick(1);
            }
        })
        
        //分页显示内容
        $scope.pageclick =function (page){
            var pages = [];
            for (var i = 1; i <= $scope.pageNum; i++) {
                if (i >= page - 5 && page <= $scope.pageNum - 11){
                    pages.push(i);
                } else if (i > $scope.pageNum - 11){
                    pages.push(i);
                }
                if (pages.length >= 11){
                    break;
                }
            }
            $scope.pageboxs = pages;
        }

        //分页按钮内容
        $scope.pagePaging = function(page){
            $http.post($scope.url+"/api/Mall/class_goods",$.param({
                    class_uuid:class_uuid,
                    p:page,
                    pagesize:8
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                $scope.getsortname = sortname;
                if(data["status"]=="ok"){
                    $scope.shoplist = data.data.goodsBean;
                }
            })
        }





        






        //商品搜索按钮
        $scope.shoplistSearch = function(type){
            $scope.loading=1;
            $http.post($scope.url+"/api/Mall/searchGoods",$.param({
                    class_uuid:class_uuid,
                    type:type
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                $timeout(function(){
                    $scope.loading=3;
                },800)
                if(data["status"]=="ok"){
                    $scope.pageNum =data.data.page;
                    $scope.pageboxs = data.data.page;
                    $scope.shoplist = data.data.goodsBean;
                    $scope.pageclick(1);
                }

            }).error(function(){
                $scope.loading=2;
            })
        }


        $scope.shoplistSearchw = function(class_uuid){
            $scope.loading=1;
            $http.post($scope.url+"/api/Mall/searchGoods",$.param({
                    class_uuid:class_uuid,
                    pagesize:8
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                $timeout(function(){
                    $scope.loading=3;
                },800)

                if(data["status"]=="ok"){
                    $scope.pageNum =data.data.page;
                    $scope.pageboxs = data.data.page;
                    $scope.shoplist = data.data.goodsBean;
                    $scope.pageclick(1);
                }

            }).error(function(){
                $scope.loading=2;
            })
        }
        
        //最大最小价格
        $scope.funprice=function(){
            var mon=/^\d+(\.\d{1,2})?$/
            var minprice=$('.s-l-s-t-r-1of4 .minprice').val();
            var maxprice=$('.s-l-s-t-r-1of4 .maxprice').val();
            if(!mon.test(minprice)&&minprice!=''){
                $scope.alerttxt('请填写规范的价格');
                return false;
            }else if(!mon.test(maxprice)&&maxprice!=''){
                $scope.alerttxt('请填写规范的价格');
                return false;
            }
            //$scope.shopl($scope.arr,$scope.brr,1,minprice,maxprice,$scope.frr,$scope.grr,$scope.hrr,$scope.irr,$scope.jrr,$scope.krr)
        }


        
        
        
        
})
    .controller('shop',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        //获取路由内容
        var shop_sjsd = $location.search()["goods_id"];
        var shop_detail_edit = [
            {name:"商品详情",key:1},
            {name:"规格参数",key:2},
            {name:"商品评价",key:3}
        ];

        var specificationBeans = [];
        var specificationBeansShowWeb = [];
        var shop_key1 =1;
        //显示商品内容
        $scope.shop_data_content = 0;
        $http.post($scope.url+"/api/Mall/goods_info",$.param({
                goods_id:shop_sjsd
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);

            if(data["status"]=="ok"){
                $scope.count=1;//初始化数量
                $scope.goodsDetailContent = data["data"];
                $scope.goods_now_price = data["data"].goods_now_price;
                $scope.shop_detail_edit = shop_detail_edit;
                $scope.shop_key = shop_key1;
                goodsSpecificationBeansContent = data["data"].goodsSpecificationBeans;

                for(var i=0;i<data["data"].goodsSpecificationBeans.length;i++){
                    var specificationBeans2Content = [];
                    for(var j=0;j<data["data"].goodsSpecificationBeans[i].specificationBeans.length;j++){
                        specificationBeans2Content.push(data["data"].goodsSpecificationBeans[i].specificationBeans[j]);
                    }
                    specificationBeans.push(specificationBeans2Content);
                }

                console.log(specificationBeans);
                $scope.specificationBeansShowWeb = specificationBeans;
            }
        })
        $scope.shop_tab_content = function(t,shop_key){
            $scope.shop_data_content = t;
            $scope.shop_key = shop_key;
        }
        $scope.owlCarouselButton = function (tab) {
            $scope.goodsDetailContent.goods_img = tab;
        }
        var VieBeans = [];
        //规格显示内容
        $scope.specificationontentClickButton = function(specificationontent,index){
            console.log(index);
            VieBeans[index] = parseInt(specificationontent.specification_id);
            var specification_ids = VieBeans.join(',');
            $http.post($scope.url+"/api/Mall/get_specification",$.param({
                goods_id:$scope.goodsDetailContent.goods_id,
                specification_ids:specification_ids
             }),
             {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
             ).success(function(data){
                console.log(data);
                $scope.goodsDetailContent.goods_now_price = data["data"].specification_sale_price;
                $scope.specification_id = data["data"].specification_id
             }).error(function(error){
                console.log(error);
             })


        }









        //显示添加商品弹框
        $scope.shoppingCartTitleShow = false;



        //添加购物车内容
        $scope.GoosdShoppingCart = function(uid,token,goods_id,goods_num){

            if($scope.specification_id == "" || $scope.specification_id == undefined || $scope.specification_id == null){
                alert("请选择规格");
            }else{
                $http.post($scope.url+"/api/Mall/insertShopCar",$.param({
                        uid:uid,
                        token:token,
                        goods_id:goods_id,
                        goods_num:goods_num,
                        specification_id:$scope.specification_id

                    }),
                    {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
                ).success(function(data){
                    console.log($scope.specification_id);
                    if(data["status"]=="ok"){
                        $scope.shoppingCartTitleShow = true;
                        console.log(data);
                    }else if(data["status"]=="pending"){
                        alert("请先登录后在操作");
                    }

                }).error(function(error){
                    console.log(error);
                })
            }

        }


        $scope.jxgg = function(){
            $scope.shoppingCartTitleShow = false;
        }


    })
    .directive('repeatFinish',function(){
        return {
            restrict: 'A',
            repeatFinish : '@',
            link: function(scope,element,attr){
                if(scope.$last == true){
                    scope.$eval(attr.repeatFinish);
                }
            }
        }
    })
    //商品列表分类点击-->单击
    .directive("ssClick",[function(){  //
        return{
            link: function (scope, element, attributes){
                element.click(function () {
                    if(element.parents('.s-s-list').find('.s-s-l-btn .dx').hasClass('act')){
                        if(element.hasClass('act')){
                            element.removeClass('act')
                        }else{
                            element.addClass('act')
                        }
                    }else{
                        element.parents('.s-s-list').find('.s-s-l-sp-list li,.s-s-l-pp-list li').removeClass('act')
                        element.addClass('act')
                    }
                });
            }
        }
    }])
    //商品列表分类点击-->多选
    .directive("ssClick2",[function(){  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    if(element.hasClass('act')){
                        element.removeClass('act');
                        element.parents('.s-s-l-btn').siblings('.s-s-l-sp-list,.s-s-l-pp-list').find('li').removeClass('act').find('span').removeClass('act');
                        element.parents('.s-s-list').find('p').hide();
                    }else{
                        element.addClass('act');
                        element.parents('.s-s-l-btn').siblings('.s-s-l-sp-list').find('li span').addClass('act');
                        element.parents('.s-s-list').find('p').show();
                        //品牌
                        element.parents('.s-s-list').find('.s-s-l-btn .gd').addClass('act');
                        element.parents('.s-s-list').find('.s-s-l-pp-list').addClass('act')
                    }
                });
            }
        }
    }])
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
    .directive("selSeach", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.mouseover(function () {
                    element.removeClass("act");

                });
                element.mouseleave(function () {
                    element.addClass("act");

                });
            }
        }
    }])

    .directive('repeatFinish2',function(){
      return {
          link: function(scope,element,attr){if(scope.$last == true){
                  scope.owlCarousel( attr.repeatFinish );
              }
          }
      }
     })
    .directive("sortTop", function ($timeout) {  //
        return{
            restrict:'EA',
            link: function (scope, element, attributes) {
                element.mouseover(function(){
                    if(element.attr('end')==1){
                        return false;
                    }
                    $timeout(function(){
                        if(element.attr('val')!=1){
                            element.addClass("act2");
                            element.siblings().removeClass("act2");
                            element.siblings().find('>div').hide();
                            element.find('>div').css('left',-element.position().left)
                            element.find('>div').show();
                        }
                    },800)

                })
                element.mouseleave(function () {
                    element.attr('val',1)
                    element.removeClass("act2");
                    element.siblings().removeClass("act2");
                    element.siblings().find('>div').hide();
                    element.find('>div').hide();
                    $timeout(function(){
                        element.attr('val',2)
                        element.removeClass("act2");
                        element.siblings().removeClass("act2");
                        element.siblings().find('>div').hide();
                        element.find('>div').hide();
                    },800)
                });

            }
        }
    })
    .directive("sortTop2", function ($timeout) {  //
        return{
            link: function (scope, element, attributes) {
                element.mouseover(function () {
                    if(element.attr('end')==1){
                        return false;
                    }
                    $timeout(function(){
                        if(element.attr('val')!=1){
                            element.addClass("act2");
                            element.siblings().removeClass("act2");
                            element.find('>div').css('left',-(1+element.position().left))
                            element.find('>div').show();
                        }
                    },800)

                });
                element.mouseleave(function () {
                    element.attr('val',1)
                    element.removeClass("act2");
                    element.siblings().removeClass("act2");
                    element.siblings().find('>div').hide();
                    element.find('>div').hide();
                    $timeout(function(){
                        element.attr('val',2)
                        element.removeClass("act2");
                        element.siblings().removeClass("act2");
                        element.siblings().find('>div').hide();
                        element.find('>div').hide();
                    },800)
                });

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
    .directive("tabs", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    element.addClass("specificationontentStyleContentShow");
                    element.siblings().removeClass("specificationontentStyleContentShow")
                });
            }
        }
    }])
    //首页左边
    .directive("lScroll", function ($timeout) {  //
        return{
            link: function (scope, element, attributes,attr) {
                element.click(function () {
                    element.addClass("act").attr('val',1);
                    element.siblings().removeClass("act").attr('val',1);
                    $timeout(function(){
                        element.attr('val','');
                        element.siblings().attr('val','');
                    },600)
                    var anh = $('#sort'+element.attr('id')).offset().top;
                    $("html,body").stop().animate({scrollTop:anh},300);
                });
            }
        }
    })
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
    /*头部网址导航*/
    .directive("siteNav", function ($timeout) {  //
        return{
            link: function (scope, element, attributes) {
                element.mouseover(function () {
                    $('.site-nav-box').attr('val',1).fadeIn();

                });
                element.mouseleave(function () {

                    $timeout(function(){
                        if($('.site-nav-box').attr('val')!=1){
                            return false;
                        }
                        $('.site-nav-box').hide();
                    },100)
                });
            }
        }
    })
    .directive("siteNavshow", function ($timeout) {  //
        return{
            link: function (scope, element, attributes) {
                element.mouseover(function () {
                    element.attr('val',2).show();
                });
                element.mouseleave(function () {
                    $('.site-nav-box').hide();
                });
            }
        }
    })
    .directive("ewmtips", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.mouseover(function () {
                  $('.site-nav-box .ewm').css('top',(element.offset().top+element.height()+10)).css('left',(element.offset().left-50+element.width()/2)).fadeIn();
                });
                element.mouseleave(function () {
                  $('.site-nav-box .ewm').hide();
                });
            }
        }
    }])






