/*
* @Author: cool
* @Date:   2017-01-02 10:51:15
* @Last Modified by:   cool
* @Last Modified time: 2017-04-01 10:49:16
*/
var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;//手机正则
var ybreg=/^[0-9]{6}$/;//邮编
var yxreg=/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;//邮箱
app.controller('home',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
    console.log("成功")
    //获取网站基础信息
}).controller('gwc',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
    console.log("购物车信息列表显示成功")
    //获取网站基础信息
})
    .directive("moreadd", [function (){  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    if(element.find('span').hasClass('act')){
                        element.find('span').removeClass('act');
                        element.siblings('ul').removeClass('act');
                    }else{
                        element.find('span').addClass('act');
                        element.siblings('ul').addClass('act');
                    }

                });
            }
        }
    }])
    //gwcin 更多
    .directive("sharegd", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    if(element.find('i').hasClass('act')){
                        element.find('i').removeClass('act');
                        element.parents('.gwc-share-tit').siblings('.gwc-dp-box').show();
                    }else{
                        element.find('i').addClass('act');
                        element.parents('.gwc-share-tit').siblings('.gwc-dp-box').hide()
                    }

                });
            }
        }
    }])
    .controller('gwc',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
      console.log("购物车信息列表显示成功")
        //获取网站基础信息
})
    .directive("moreadd", [function (){  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    if(element.find('span').hasClass('act')){
                        element.find('span').removeClass('act');
                        element.siblings('ul').removeClass('act');
                    }else{
                        element.find('span').addClass('act');
                        element.siblings('ul').addClass('act');
                    }

                });
            }
        }
    }])
    //gwcin 更多
    .directive("sharegd", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    if(element.find('i').hasClass('act')){
                        element.find('i').removeClass('act');
                        element.parents('.gwc-share-tit').siblings('.gwc-dp-box').show();
                    }else{
                        element.find('i').addClass('act');
                        element.parents('.gwc-share-tit').siblings('.gwc-dp-box').hide()
                    }

                });
            }
        }
    }])
    //促销优惠
    .directive("selCx", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.mouseover(function () {
                    element.find('>span').addClass("act");
                    element.find('>ul').show()
                });
                element.mouseleave(function () {
                    element.find('>span').removeClass("act");
                    element.find('>ul').hide()

                });
            }
        }
    }])
    //选择发票
    .directive("zttab", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    element.addClass("act");
                    element.parent('li').siblings().find('.sel').removeClass("act");
                });
            }
        }
    }])
    //选择发票
    .directive("fptab", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    element.addClass("act");
                    element.siblings().removeClass("act");
                    element.parent('.fpzl').siblings('ul').hide();
                    for(var i=0;i<element.parent('.fpzl').siblings('ul').length;i++){
                        if(element.parent('.fpzl').siblings('ul').eq(i).hasClass(element.attr('val'))){
                            element.parent('.fpzl').siblings('ul').eq(i).show();
                        }
                    }
                });
            }
        }
    }])
    //选择优惠券
    .directive("yhqtab", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    if(element.hasClass('act')){
                      element.removeClass("act");
                    }else{
                      element.addClass("act");
                      element.siblings().removeClass("act");
                    }
                });
            }
        }
    }])
    //优惠券显示隐藏
    .directive("yhqshow", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    if(element.hasClass('act')){
                       element.removeClass("act");
                       element.siblings('.q-y-list-box').hide()
                    }else{
                       element.addClass("act");
                       element.siblings('.q-y-list-box').show()
                    }
                });
            }
        }
    }])
    //发票选择单位还是个人
    .directive("gsshow", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    element.addClass("act");
                    element.siblings().removeClass("act");
                    if(element.index()==2){
                        element.parents('li').siblings('.gsshow').show();
                    }else{
                        element.parents('li').siblings('.gsshow').hide();
                    }
                });
            }
        }
    }])


    .directive("payshow", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    $('.select-pay .tab-tit li').removeClass('act');
                    $('.banklist-box .banksel').removeClass('act')
                    element.addClass('act');
                    element.parents('.paylist-box').find('.tab-center-box>div').hide();
                    element.parents('.paylist-box').find('.'+element.attr('val')).show();

                });
            }
        }
    }])
    .directive("tips", function ($timeout) {  //
        return{
            link: function (scope, element, attributes) {
                element.mouseover(function () {
                  element.parents('.tab-tit').find('.pay-tips').html(element.attr('tip')).attr('val',1).css('left',(-10+element.parents('li').position().left+element.position().left)).show();
                });
                element.mouseleave(function () {
                  $timeout(function(){
                      if( element.parents('.tab-tit').find('.pay-tips').attr('val')==1){
                        element.parents('.tab-tit').find('.pay-tips').hide();
                      }
                  },200)
                });
            }
        }
    })
    .directive("tipshover", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.mouseover(function () {
                  element.attr('val',2)
                  element.show();
                });
                element.mouseleave(function () {
                  element.hide();
                });
            }
        }
    }])
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
    .directive("banktab", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    element.addClass("act");
                    element.siblings().removeClass("act");
                    element.parent('p').siblings('ul').hide();
                    element.parent('p').siblings('ul').eq(element.index()).show();
                });
            }
        }
    }])
    .directive("ztclick", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    $('.zt-addbox .zt-span').removeClass('act')
                    element.addClass('act');

                });
            }
        }
    }])
    .directive("dbclick", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    if(element.hasClass('act')){
                        element.removeClass('act')
                    }else{
                        element.addClass('act')
                    }
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
    .directive("selectbank", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    if(element.attr("val")==1){
                        element.attr("val",2);
                        element.siblings("ul").slideUp()
                    }else{
                        element.attr("val",1);
                        element.siblings("ul").slideDown()
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
                  console.log(element.offset().top+","+element.offset().left);
                  console.log(element.height());
                  $('.site-nav-box .ewm').css('top',(element.offset().top+element.height()+10)).css('left',(element.offset().left-50+element.width()/2)).fadeIn();
                });
                element.mouseleave(function () {
                  $('.site-nav-box .ewm').hide();
                });
            }
        }
    }])


