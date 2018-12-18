/*
* @Author: cool
* @Date:   2017-01-02 10:51:15
* @Last Modified by:   cool
* @Last Modified time: 2017-03-14 14:05:47
*/
var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;//手机正则
var ybreg=/^[0-9]{6}$/;//邮编
var yxreg=/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;//邮箱
app.controller('home',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
       $scope.url='http://niuhonghong.tstweiguanjia.com/';
        //获取网站基础信息
        $http.post($scope.url+"/othersInterfaces.api?getHost",$.param({

        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.sw_p=data['data'];
            }else{
            }
        })
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
                $scope.alerttxt('请填写手机号');
                return false;
            }
            if(brr==undefined||brr==''){
                $scope.alerttxt('请填写密码');
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
                    $scope.alerttxt(data['error'])
                }
            })
      }
      //注册
      $scope.regbtn=function(arr,brr,crr,drr){//注册
            console.log(arr+","+brr+","+crr+","+drr)
            $('.tck .sign-box ul.reg-ul li p').html('');

            if(!myreg.test(arr)){
                $("#regphone").text('请输入规范的手机号');
                return false;
            }
            if(crr==undefined||crr.length<6){
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
                    $scope.alerttxt('注册成功')
                    $scope.signbtn(arr,crr)
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
      }
        //获取验证码
        var InterValObj; //timer变量，控制时间
        var count = 60; //间隔函数，1秒执行
        var curCount;//当前剩余秒数

        $scope.sendMessage=function(arr){
            if($("#btnSendCode").attr("val")==1){
                return false;
            }
            $("#btnSendCode").attr("val", "1");
            setTimeout('$("#btnSendCode").attr("val", "2")',2000);
            if(!myreg.test(arr)){
                $scope.alerttxt("请输入有效的手机号码！");
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
                        $scope.alerttxt(data['error'])
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
      //pagebox 计算页数的方法
        $scope.pagebox=function(arr,brr,crr){//总数 总页数 当前页
            $scope.pageboxs=[];
            if(brr==1){
                return false;
            }
            for(var i=1;i<11;i++){
                if(crr==1||brr<11){//第一页 和总页数小于10
                    if(i<(brr+1)){
                        $scope.pageboxs.push(i);
                    }
                }else if(crr==brr){//最后一页
                    if(brr<11){
                        if(i<(brr+1)){
                            $scope.pageboxs.push(i);
                        }
                    }else{
                        $scope.pageboxs.push(crr-(10-i));
                    }
                }else{
                    if(crr>10){
                        if((brr-crr)>9){
                            $scope.pageboxs.push(crr+(i-2));
                        }else{
                            $scope.pageboxs.push(crr+i-(10-brr+crr));
                        }
                    }else if((brr-crr)>10){
                        if(crr<10){
                            $scope.pageboxs.push(i);
                        }else{
                            $scope.pageboxs.push(crr+(i-2));
                        }
                    }else if(crr<10){
                        if(i<(brr+1)){
                            $scope.pageboxs.push(i);
                        }else{
                            $scope.pageboxs.push(crr+(i-2));
                        }
                    }else if((brr-crr)<11){
                        $scope.pageboxs.push(crr+i-(10-brr+crr));
                    }
                }
            }
            console.log($scope.pageboxs)

        }
      //alert 优化
      $scope.alertshow=0;
      $scope.alerttxt=function(arr,brr){
        if(brr==1){
          $scope.alerttxts=arr;
          $scope.alertshow=0;
        }else{
          $scope.alerttxts=arr;
          $scope.alertshow=1;
        }
      }
      //显示哪个nav 选中哪个nav
      $scope.h3nav=function(arr,brr){
        $scope.h3_nav=arr;
        $scope.h3_navact=brr;
      }
      //footer
      $scope.footers=function(arr){
          $http.post($scope.url+"/othersInterfaces.api?getHtmls",$.param({
                level:arr,
          }),
          {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
          ).success(function(data){
              console.log(data);
              if(data["status"]=="ok"){
                  $scope.footer=data['data'];
              }else{
              }
          })
      }
      $scope.footers(2)

})

    //首页
    .controller('core',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0);
        $scope.h3nav(1,0);
        $http.post($scope.url+"/orderInterfaces.api?getOrdersCount",$.param({
            member_id:$cookieStore.get("member_id"),
            member_token:$cookieStore.get("member_token"),
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.ddlistcount=data['data']
            }else if (data["status"] == "pending" && data["error"] == "token failed"){
                $scope.relogin()
            }else{
                $scope.alerttxt(data['error'])
            }
        })



    })
    //我的订单
    .controller('wddd',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0)
        $scope.h3nav(1,0);
        //各个状态的订单总数
        $scope.ordernum=function(){
            $http.post($scope.url+"/orderInterfaces.api?getOrdersCount",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.ddlistcount=data['data']
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.ordernum();

        //订单列表
        $scope.ddlist=function(arr,brr,crr){//订单状态 页数 搜索的
            $scope.arr=arr;//订单状态初始化
            $scope.brr=brr;//页数初始化
            $http.post($scope.url+"/orderInterfaces.api?getOrders",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                order_state:arr,
                page:brr,
                order_type:'goods',
                order_no:crr,
                limit:10,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.ddlists=data['data'];
                    $scope.shoptotal=data['total'];//总数
                    $scope.pageNum=Math.ceil($scope.shoptotal/10)==0?'1':Math.ceil($scope.shoptotal/10);//总页数
                    $scope.nowpageNum=brr;//当前页
                    $scope.nowpageNum2=brr;//当前页 跳转用
                    $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                    console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页");//
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        if($location.search()['state']){
            $('.dd-nav>a').removeClass('act');
            if($location.search()['state']=='wait_pay'){
                $('.dd-nav>a').eq(1).addClass('act');
                $scope.ddlist('wait_pay',1,'');
            }else if($location.search()['state']=='wait_send'){
                $('.dd-nav>a').eq(2).addClass('act');
                $scope.ddlist('wait_send',1,'');
            }else if($location.search()['state']=='wait_receive'){
                $('.dd-nav>a').eq(3).addClass('act');
                $scope.ddlist('wait_receive',1,'');
            }else if($location.search()['state']=='wait_assessment'){
                $('.dd-nav>a').eq(4).addClass('act');
                $scope.ddlist('wait_assessment',1,'');
            }else if($location.search()['state']=='end'){
                $('.dd-nav>a').eq(5).addClass('act');
                $scope.ddlist('end',1,'');
            }else{
                $('.dd-nav>a').eq(0).addClass('act');
                $scope.ddlist('',1,'');
            }
        }else{
            $scope.ddlist('',1,'')
        }
        //确认收货
        $scope.qrshop=function(arr){
            $http.post($scope.url+"/orderInterfaces.api?confirmOrder",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                order_id:arr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.alerttxt('确认成功！');
                    $scope.ddlist($scope.arr,$scope.brr,'');
                    $scope.ordernum();
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        //删除订单
        $scope.delor=function(arr){
            $http.post($scope.url+"/orderInterfaces.api?deleteOrder",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                order_id:arr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.alerttxt('删除成功！');
                    $scope.ddlist($scope.arr,$scope.brr,'');
                    $scope.ordernum();
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        //取消订单
        $scope.dellist=function(arr){
            $http.post($scope.url+"/orderInterfaces.api?cancelOrder",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                order_id:arr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.alerttxt('取消成功！');
                    $scope.ddlist($scope.arr,$scope.brr,'');
                    $scope.ordernum();
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        //立即付款
        $scope.ddpay=function(arr){
            location.href="gwc.html#/gopay?orderid="+arr;
            //$scope.pay(arr);
        }
        //分页
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.brr||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.ddlist($scope.arr,arr)
                $scope.scrolltop(0);
            }
        }



    })
    //订单详情
    .controller('ddxq',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0)
        $scope.h3nav(1,0);
        //物流详情
        $scope.wlxq=function(arr){
            $http.post($scope.url+"/orderInterfaces.api?getOrderLogisticsDetails",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                order_id:$location.search()['orderid'],
                logistics_no:arr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.wlxqs=data['data']
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        //订单详情
        $http.post($scope.url+"/orderInterfaces.api?getOneOrderDetail",$.param({
            member_id:$cookieStore.get("member_id"),
            member_token:$cookieStore.get("member_token"),
            order_id:$location.search()['orderid'],
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.ddxq=data['data'];
                $scope.wlxq(data['data']['logistics_no'])
            }else if (data["status"] == "pending" && data["error"] == "token failed"){
                $scope.relogin()
            }else{
                $scope.alerttxt(data['error'])
            }
        })

        //确认收货
        $scope.qrshop=function(arr){
            $http.post($scope.url+"/orderInterfaces.api?confirmOrder",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                order_id:arr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.alerttxt('确认成功！');
                    $scope.ddlist($scope.arr,$scope.brr,'');
                    $scope.ordernum();
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }


    })
    //商品收藏
    .controller('spsc',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0)
        $scope.h3nav(1,0);
        //商品收藏列表
        $scope.spsclist=function(arr){//页数
            $scope.arr=arr;//页数
            $http.post($scope.url+"/collectionInterfaces.api?getCollection",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                collection_type:'goods',
                page:arr,
                limit:20,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.spsclists=data['data'];
                    $scope.shoptotal=data['total'];//总数
                    $scope.pageNum=Math.ceil($scope.shoptotal/20)==0?'1':Math.ceil($scope.shoptotal/20);//总页数
                    $scope.nowpageNum=arr;//当前页
                    $scope.nowpageNum2=arr;//当前页 跳转用
                    $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                    console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页");//
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.spsclist(1);
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.arr||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.spsclist(arr)
                $scope.scrolltop(0);
            }
        }
        //取消收藏
        $scope.delsc=function(arr){//收藏id
            $http.post($scope.url+"/collectionInterfaces.api?cancelCollection",$.param({
                collection_id:arr,
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.alerttxt("取消成功");
                    $scope.spsclist(1)
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }

    })
    //我的积分
    .controller('wdjf',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0)
        $scope.h3nav(1,0);
        $http.post($scope.url+"/othersInterfaces.api?getHtmlDesc",$.param({
            url:'/html/others/integral_rule.html',
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            //$scope.wdjf_gw=data;
            $('.gz-txt').append(data)

        })
        $scope.wdjflist=function(arr){
            $http.post($scope.url+"/memberInterfaces.api?getMemberIntegral",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                page:arr,
                limit:40,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.wdjflists=data['data'];
                    $scope.shoptotal=data['total'];//总数
                    $scope.pageNum=Math.ceil($scope.shoptotal/40)==0?'1':Math.ceil($scope.shoptotal/40);//总页数
                    $scope.nowpageNum=arr;//当前页
                    $scope.nowpageNum2=arr;//当前页 跳转用
                    $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                    console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页");//
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.wdjflist(1);
        //分页
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.nowpageNum||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.wdjflist(arr)
                $scope.scrolltop(0);
            }
        }


    })
    //优惠券
    .controller('yhq',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0);
        $scope.h3nav(1,0);
        //优惠券各状态数量
        $http.post($scope.url+"/couponInterfaces.api?getCouponsCount",$.param({
            member_id:$cookieStore.get("member_id"),
            member_token:$cookieStore.get("member_token"),
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.yhqCount=data['data'];
            }else if (data["status"] == "pending" && data["error"] == "token failed"){
                $scope.relogin()
            }else{
                $scope.alerttxt(data['error'])
            }
        })
        //
        $scope.yhqlist=function(arr,brr){// not_used:未使用 already_used:已使用 expired:过期
            $http.post($scope.url+"/couponInterfaces.api?getCoupons",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                coupon_state:arr,
                page:brr,

            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.yhqlists=data['data'];

                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.yhqlist('not_used',1);
        //是否是过期的样式
        $scope.sactshow=function(arr,brr){
            var t=new Date(brr).getTime();
            var n=new Date().getTime();
            if(arr=='already_used'||arr=='expired'||(arr=='not_used'&&n>t)){
                return 'act2';
            }
        }


    })
    //银行卡
    .controller('yhk',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0)
        $scope.h3nav(1,0);
        $scope.yhklist=function(brr){
            $http.post($scope.url+"/bankInterfaces.api?getMemberBanks",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                page:brr,

            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.yhklists=data['data']
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.yhklist(1);
        //删除银行卡
        $scope.delbank=function(arr){
            $http.post($scope.url+"/bankInterfaces.api?deleteMemberBank",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                bank_id:arr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.alerttxt('删除成功')
                    $scope.yhklist(1);
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }


    })
    //信用额度
    .controller('xyed',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0)
        $scope.h3nav(1,0);
        $http.post($scope.url+"/othersInterfaces.api?getHtmlDesc",$.param({
            url:'html/others/trust.html',
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            //$scope.wdjf_gw=data;
            $('.gz-txt').append(data)

        })
        $scope.xyedjl=function(arr){
            $http.post($scope.url+"/memberInterfaces.api?getMemberTrustRecord",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                page:arr,
                limit:40,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.xyedjls=data['data'];
                    $scope.shoptotal=data['total'];//总数
                    $scope.pageNum=Math.ceil($scope.shoptotal/40)==0?'1':Math.ceil($scope.shoptotal/40);//总页数
                    $scope.nowpageNum=arr;//当前页
                    $scope.nowpageNum2=arr;//当前页 跳转用
                    $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                    console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页");//
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.xyedjl(1);
        //分页
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.nowpageNum||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.xyedjl(arr)
                $scope.scrolltop(0);
            }
        }

    })
    //退款申请
    .controller('tksq',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0)
        $scope.h3nav(1,0);
        $scope.count=1;
        $scope.shopnum=$location.search()['num'];

        $scope.tksq=function(){
            var images='';
            var zrr=[];
            $(".t-c-3of5 p b").each(function(i) {
                zrr.push($(".t-c-3of5 p b").eq(i).attr("val"));
            });
            images=zrr.join(",");

            $http.post($scope.url+"/orderInterfaces.api?refundOrderNoFile",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                order_id:$location.search()['oid'],
                order_goods_id:$location.search()['shopid'],
                refund_count:$scope.count,
                refund_desc:$('.t-c-2of5 textarea').val(),
                imgs:images,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    alert(data['data']);
                    window.location.href="core.html#/wddd"
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }




    })
    //退款订单
    .controller('tkdd',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0)
        $scope.h3nav(1,0);
        //各个状态的退款订单总数
        $scope.tkddnum=function(){
            $http.post($scope.url+"/orderInterfaces.api?getMemberRefundCount",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.tkddnums=data['data']
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.tkddnum();
        //退款订单列表
        $scope.tkddlist=function(arr,brr,crr){//订单状态 页数 搜索的订单号
            $scope.arr=arr;//
            $scope.brr=brr;//
            $http.post($scope.url+"/orderInterfaces.api?getMemberRefunds",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                refund_state:arr,
                page:brr,
                refund_no:crr,
                limit:20,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.tkddlists=data['data'];
                    $scope.shoptotal=data['total'];//总数
                    $scope.pageNum=Math.ceil($scope.shoptotal/20)==0?'1':Math.ceil($scope.shoptotal/20);//总页数
                    $scope.nowpageNum=brr;//当前页
                    $scope.nowpageNum2=brr;//当前页 跳转用
                    $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                    console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页");//
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
            .error(function(data,status){
                console.log(status)
            })
        }
        $scope.tkddlist('',1,'');
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.brr||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.tkddlist($scope.arr,arr,'')
                $scope.scrolltop(0);
            }
        }


    })
    //退款订单详情
    .controller('tkddxq',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0)
        $scope.h3nav(1,0);
        $http.post($scope.url+"/orderInterfaces.api?getRefundDetail",$.param({
            member_id:$cookieStore.get("member_id"),
            member_token:$cookieStore.get("member_token"),
            refund_id:$location.search()['rid'],
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.tkddxqs=data['data'];
            }else if (data["status"] == "pending" && data["error"] == "token failed"){
                $scope.relogin()
            }else{
                $scope.alerttxt(data['error'])
            }
        })


    })
    //提现
    .controller('tixian',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0)
        $scope.h3nav(1,0);
        $scope.yhklist=function(brr){
            $http.post($scope.url+"/bankInterfaces.api?getMemberBanks",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                page:brr,

            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.yhklists=data['data'];
                    if(data['data'].length>0){
                        $scope.morenbank_id=data['data'][0]['bank_id']
                    }else{
                        $scope.morenbank_id=0;
                    }
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.yhklist(1);
        $scope.morenbank=function(arr){
            $http.post($scope.url+"/bankInterfaces.api?updateMemberDefaultBank",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                bank_id:arr,

            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.yhklist(1);
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }

        //提现
        $scope.txbtn=function(arr,brr,crr){//提现金额 支付密码 验证码
            if($scope.morenbank_id==0){
                $scope.alerttxt('请添加提现银行卡')
                return false;
            }
            if(arr<0||arr>$scope.grxx_centers.balance){
                $scope.alerttxt('提现金额不能超过已有金额或小于0')
                return false;
            }
            if(brr.length!=6){
                $scope.alerttxt('请输入规范的密码')
                return false;
            }
            if(crr==''){
                $scope.alerttxt('请输入验证码')
                return false;
            }
            $http.post($scope.url+"/memberInterfaces.api?applyCash",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                bank_id:$scope.morenbank_id,
                cash_price:arr,
                balance_password:brr,
                code:crr
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.alerttxt('申请成功')
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }

        //获取验证码
        var InterValObj2; //timer变量，控制时间
        var count2 = 60; //间隔函数，1秒执行
        var curCount2;//当前剩余秒数

        $scope.sendMessage2=function(arr){//手机号码
            if($("#btnSendCode2").attr("val")==1){
                return false;
            }
            $("#btnSendCode2").attr("val", "1");
            setTimeout('$("#btnSendCode2").attr("val", "2")',2000);
            console.log(arr)
            if(!myreg.test(arr)){
                $scope.alerttxt("请输入有效的手机号码！");
            }else{
                $http.post($scope.url+"/othersInterfaces.api?sendCode",$.param({
                    mobile:arr,
                    code_type:"apply_cash",
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
                ).success(function(data){
                    console.log(data);
                    if(data["status"]=="ok"){
                        curCount2 = count2;
                    　　//设置button效果，开始计时
                         $("#btnSendCode2").attr("disabled", "true");
                         $("#btnSendCode2").val(curCount2 + "s");
                         InterValObj2 = window.setInterval(SetRemainTime2, 1000); //启动计时器，1秒执行一次
                    }else if (data["status"] == "pending" && data["error"] == "token failed"){
                        $scope.relogin()
                    }else{
                        $scope.alerttxt(data['error'])
                    }
                })
            }
        }
        //timer处理函数
        function SetRemainTime2() {
            if (curCount2 == 0) {
                window.clearInterval(InterValObj2);//停止计时器
                $("#btnSendCode2").removeAttr("disabled");//启用按钮
                $("#btnSendCode2").val("重新发送");
            }else {
                curCount2--;
                $("#btnSendCode2").val(curCount2 + "s");
            }
       }
       /****获取验证码end***/


    })
    //收货地址
    .controller('shdz',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0)
        $scope.h3nav(1,1);
        //初始化编辑操作的addid
        $scope.editaddid=0;
        $scope.addlength;
        //地址列表
        $scope.addlist=function(){
            $http.post($scope.url+"/addressInterfaces.api?getOwnerAddress",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.addlists=data['data'];
                    $scope.addlength=data['data'].length;
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.addlist();
        //省市区3级信息
        $scope.seladd=function(arr,brr,crr,drr){//省市区123 当前  省级的下标  id:为区的时候用
          console.log(arr+","+brr+","+crr)
          if(arr==1){
            $scope.selCity=arr;
            $scope.seladds=$scope.ssq_adds;
          }else if(arr==2){
            $scope.selCity=arr;
            $scope.selAdd_p=brr;//-->省的下标
            $scope.addtext_p=$scope.ssq_adds[$scope.selAdd_p].name;//省
            $scope.addtext_c='';//市
            $scope.addtext_a='';//区
            $scope.seladds=$scope.ssq_adds[brr].cityBeans;
          }else if(arr==3){
            $scope.selCity=arr;
            $scope.selAdd_c=brr;//-->市的下标
            $scope.addtext_p=$scope.ssq_adds[$scope.selAdd_p].name;//省
            $scope.addtext_c=$scope.ssq_adds[$scope.selAdd_p].cityBeans[$scope.selAdd_c].name;//市
            $scope.addtext_a='';//区
            $scope.seladds=$scope.ssq_adds[crr].cityBeans[brr].cityBeans;
          }else if(arr==4){
            $scope.addtext_p=$scope.ssq_adds[$scope.selAdd_p].name;//省
            $scope.addtext_c=$scope.ssq_adds[$scope.selAdd_p].cityBeans[$scope.selAdd_c].name;//市
            $scope.addtext_a=$scope.ssq_adds[$scope.selAdd_p].cityBeans[$scope.selAdd_c].cityBeans[brr].name;//区
            $scope.morenadds=$scope.ssq_adds[$scope.selAdd_p].name+""+$scope.ssq_adds[$scope.selAdd_p].cityBeans[$scope.selAdd_c].name+""+$scope.ssq_adds[$scope.selAdd_p].cityBeans[$scope.selAdd_c].cityBeans[brr].name
            $scope.country_id=drr;
            console.log($scope.morenadds)
          }else{

          }
          console.log($scope.seladds)

        }
        $scope.ssq_add=function(){
           $http.post($scope.url+"/addressInterfaces.api?getCitys",$.param({

            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.ssq_adds=data['data'];
                    $scope.seladd(1);
                    $scope.selAdd_p=0;//初始化省
                    $scope.selAdd_c=0;//初始化市
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.ssq_add()
        //添加地址  修改地址
        $scope.editadd=function(arr){
            if($("#name").val()==""){
                $scope.alerttxt("请输入收货人！");
                return false;
            }
            if($scope.addtext_p==''||$scope.addtext_c==''||$scope.addtext_a==''){
                $scope.alerttxt("请选择省市区！");
                return false;
            }
            if($("#add").val()==""){
                $scope.alerttxt("请输入地址！");
                return false;
            }
            if(!myreg.test($("#mobile").val())){
                $scope.alerttxt("请输入有效的手机号码！");
                return false;
            }
            if(!ybreg.test($("#zip_code").val())){
                $scope.alerttxt("请输入有效的邮编！");
                return false;
            }
            console.log($scope.editaddid+","+arr)
            $http.post($scope.url+"/addressInterfaces.api?insertAddress",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                mobile:$("#mobile").val(),
                name:$("#name").val(),
                province:$scope.addtext_p,
                city:$scope.addtext_c,
                country:$scope.addtext_a,
                detailed_address:$("#add").val(),
                zip_code:$("#zip_code").val(),
                address_id:arr,//  传0添加 其他修改
                country_id:$scope.country_id,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    console.log($scope.editaddid)
                    if(arr==0){
                        $scope.alerttxt('添加成功');
                    }else{
                        $scope.alerttxt('修改成功');
                    }
                    $(".tck.addhide").hide();
                    $(".address-box").hide();
                    $scope.addlist();
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                        $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.editshow=function(arr){
            $scope.editaddid=arr;
            if(arr==0){
                if($scope.addlength>=6){
                    $scope.alerttxt('地址最多6个哦');
                    return false;
                }else{
                    $scope.bjadd='';
                    $scope.addtext_p='';//初始化省
                    $scope.addtext_c='';//初始化市
                    $scope.addtext_a='';//初始化区
                    $scope.morenadds="省市区";
                    $scope.seladd(1);
                    //$(".address-box .center input[type='text'], .address-box .center input[type='number']").text('');
                    //new PCAS('location_p', 'location_c', 'location_a', '北京', '市辖区', '东城区');
                }
            }else{
                $http.post("/addressInterfaces.api?getOwnerAddress",$.param({
                            member_id:$cookieStore.get("member_id"),
                            member_token:$cookieStore.get("member_token"),
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
                ).success(function(data){
                    console.log(data);
                    if(data["status"]=="ok"){
                        var len=data['data'].length;
                        for(var i=0;i<len;i++){
                            if(arr==data['data'][i]['address_id']){
                                $scope.bjadd=data['data'][i];
                                console.log($scope.bjadd);
                                $scope.addtext_p=data['data'][i]['province'];//省
                                $scope.addtext_c=data['data'][i]['city'];//市
                                $scope.addtext_a=data['data'][i]['country'];//区
                                $scope.morenadds=data['data'][i]['province']+data['data'][i]['city']+data['data'][i]['country']
                                $scope.country_id=data['data'][i]['country_id']
                                $scope.seladd(1);
                                //new PCAS('location_p', 'location_c', 'location_a', data['data'][i]['province'], data['data'][i]['city'], data['data'][i]['country']);
                            }
                        }
                    }else if (data["status"] == "pending" && data["error"] == "token failed"){
                        $scope.relogin()
                    }else{
                        $scope.alerttxt(data['error'])
                    }
                })

            }
            $(".tck.addhide").show();
            $(".address-box").show();

        }
        //设置默认
        $scope.morenadd=function(arr){
            $http.post("/addressInterfaces.api?setDefaultAddress",$.param({
                        member_id:$cookieStore.get("member_id"),
                        member_token:$cookieStore.get("member_token"),
                        address_id:arr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.alerttxt("设置成功");
                    $scope.addlist();
                    //判断是不是从确认订单来的
                    // if($location.search()['qrdd']){
                    //     window.location.href="javascript:history.go(-1)"
                    // }else{
                    //     alert("设置成功");
                    //     $scope.addlist();
                    // }
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        //删除
        $scope.deladd=function(arr){
            $http.post("/addressInterfaces.api?deleteAddress",$.param({
                        member_id:$cookieStore.get("member_id"),
                        member_token:$cookieStore.get("member_token"),
                        address_id:arr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.alerttxt("删除成功");
                    $scope.addlist();
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }


    })
    //钱包充值
    .controller('qbcz',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0)
        $scope.h3nav(1,0);
        $scope._payfs='';//初始化第三方支付方式
        //支付  付钱-->ping++
        $scope.pingpay=function(arr,brr){//订单号  支付方式
          if(brr=="alipay_pc_direct"){
            $http.post($scope.url+"/orderInterfaces.api?payRealOrders",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                order_ids:arr,
                channel:brr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    charge = data["data"];
                    pingppPc.createPayment(charge, function (result, err) {
                      console.log(result);
                      console.log(err.msg);
                      console.log(err.extra);
                       // if (result == "success") {
                       //    window.location.href = "core.html#wddd";
                       //    // 只有微信公众账号 wx_pub 支付成功的结果会在这里返回，其他的 wap 支付结果都是在 extra 中对应的 URL 跳转。
                       // } else if (result == "fail") {
                       //    // charge 不正确或者微信公众账号支付失败时会在此处返回
                       //    //alert('支付不正常')
                       // } else if (result == "cancel") {
                       //    window.location.href = "index.html#wddd";
                       //    // 微信公众账号支付取消支
                       // }
                    });
                }
            })
          }else if(brr=="wx_pub_qr"){
            $http.post($scope.url+"/orderInterfaces.api?payRealOrders",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                order_ids:arr,
                channel:brr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    location.href="#/wxpay?img="+data['data']+"&paynum="+$location.search()['paynum']+"&orderid="+$location.search()['orderid'];
                    // charge = data["data"];
                    // console.log(JSON.stringify(data["data"]))
                    // pingpp.createPayment(charge, function (result, err) {
                    //   console.log(result);
                    //   console.log(err.msg);
                    //   console.log(err.extra);
                    //    if (result == "success") {
                    //       window.location.href = "core.html#wddd";
                    //       // 只有微信公众账号 wx_pub 支付成功的结果会在这里返回，其他的 wap 支付结果都是在 extra 中对应的 URL 跳转。
                    //    } else if (result == "fail") {
                    //       // charge 不正确或者微信公众账号支付失败时会在此处返回
                    //       //alert('支付不正常')
                    //    } else if (result == "cancel") {
                    //       window.location.href = "index.html#wddd";
                    //       // 微信公众账号支付取消支
                    //    }
                    // });
                }
            }).error(function(){
              console.log('出错')
            })
          }else{
            $scope.alerttxt('请选择支付方式')
            return false;
          }
        }
        $scope.qbcz=function(arr,brr){//充值金额 支付方式
            console.log(arr+","+brr)
            if(arr<0){
                $scope.alerttxt('请填写充值金额')
                return false;
            }
            if(brr=="alipay_pc_direct"||brr=="wx_pub_qr"){
                $http.post($scope.url+"/orderInterfaces.api?insertRechargeOrder",$.param({
                    member_id:$cookieStore.get("member_id"),
                    member_token:$cookieStore.get("member_token"),
                    order_total_price:arr,
                    channel:brr,
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
                ).success(function(data){
                    console.log(data);
                    if(data["status"]=="ok"){
                        if(brr=="alipay_pc_direct"){
                            charge = data["data"];
                            pingppPc.createPayment(charge, function (result, err) {
                              console.log(result);
                              console.log(err.msg);
                              console.log(err.extra);
                               // if (result == "success") {
                               //    window.location.href = "core.html#wddd";
                               //    // 只有微信公众账号 wx_pub 支付成功的结果会在这里返回，其他的 wap 支付结果都是在 extra 中对应的 URL 跳转。
                               // } else if (result == "fail") {
                               //    // charge 不正确或者微信公众账号支付失败时会在此处返回
                               //    //alert('支付不正常')
                               // } else if (result == "cancel") {
                               //    window.location.href = "index.html#wddd";
                               //    // 微信公众账号支付取消支
                               // }
                            });
                        }else if(brr=="wx_pub_qr"){
                            location.href="gwc.html#/wxpay?img="+data['data']['qrcode_img']+"&paynum="+arr+"&orderid="+data['data']['order_id'];
                        }
                    }else if (data["status"] == "pending" && data["error"] == "token failed"){
                        $scope.relogin()
                    }else{
                        $scope.alerttxt(data['error'])
                    }
                })
            }else{
                $scope.alerttxt('暂无该充值方式')
                return false;
            }

        }

    })
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
    //评价晒单
    .controller('pjdd',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0)
        $scope.h3nav(1,0);
        $scope.dpjshow=1;
        //各个状态的订单总数
        $scope.ordernum=function(){
            $http.post($scope.url+"/orderInterfaces.api?getOrdersCount",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.ddlistcount=data['data']
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.ordernum();
        $scope.sdlist=function(arr,brr){
            $scope.arr=arr;//
            $scope.brr=brr;//
            $scope.sdstate=arr;
            if(arr=='dzp'){
                $http.post($scope.url+"/orderInterfaces.api?getCanAddAssessmentOrder",$.param({
                    member_id:$cookieStore.get("member_id"),
                    member_token:$cookieStore.get("member_token"),
                    page:brr,
                    limit:10,
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
                ).success(function(data){
                    console.log(data);
                    if(data["status"]=="ok"){
                        $scope.sdlists=data['data'];
                        $scope.shoptotal=data['total'];//总数
                        $scope.pageNum=Math.ceil($scope.shoptotal/10)==0?'1':Math.ceil($scope.shoptotal/10);//总页数
                        $scope.nowpageNum=brr;//当前页
                        $scope.nowpageNum2=brr;//当前页 跳转用
                        $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                        console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页");//
                    }else if (data["status"] == "pending" && data["error"] == "token failed"){
                        $scope.relogin()
                    }else{
                        $scope.alerttxt(data['error'])
                    }
                })
            }else{
                $http.post($scope.url+"/orderInterfaces.api?getOrders",$.param({
                    member_id:$cookieStore.get("member_id"),
                    member_token:$cookieStore.get("member_token"),
                    order_state:arr,
                    order_type:'goods',
                    page:brr,
                    limit:10,
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
                ).success(function(data){
                    console.log(data);
                    if(data["status"]=="ok"){
                        $scope.sdlists=data['data'];
                        $scope.shoptotal=data['total'];//总数
                        $scope.pageNum=Math.ceil($scope.shoptotal/10)==0?'1':Math.ceil($scope.shoptotal/10);//总页数
                        $scope.nowpageNum=brr;//当前页
                        $scope.nowpageNum2=brr;//当前页 跳转用
                        $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                        console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页");//
                    }else if (data["status"] == "pending" && data["error"] == "token failed"){
                        $scope.relogin()
                    }else{
                        $scope.alerttxt(data['error'])
                    }
                })
            }
        }
        $scope.sdlist('wait_assessment',1);
        //分页
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.brr||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.sdlist($scope.arr,arr)
                $scope.scrolltop(0);
            }
        }

    })
    //晒单详情
    .controller('sdxq',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0);
        $scope.h3nav(1,0);
        $http.post($scope.url+"/orderInterfaces.api?getMemberAssessmentsV2",$.param({
            member_id:$cookieStore.get("member_id"),
            member_token:$cookieStore.get("member_token"),
            order_id:$location.search()['oid'],
            assessment_type:'goods',
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.sdxq=data['data']
            }else if (data["status"] == "pending" && data["error"] == "token failed"){
                $scope.relogin()
            }else{
                $scope.alerttxt(data['error'])
            }
        })


    })
    //评价
    .controller('pingjia',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0)
        $scope.h3nav(1,0);
        //获取订单详情
        $http.post($scope.url+"/orderInterfaces.api?getOneOrderDetail",$.param({
            member_id:$cookieStore.get("member_id"),
            member_token:$cookieStore.get("member_token"),
            order_id:$location.search()['oid'],
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.ddxq=data['data']
            }else if (data["status"] == "pending" && data["error"] == "token failed"){
                $scope.relogin()
            }else{
                $scope.alerttxt(data['error'])
            }
        })

        $scope.tjpj=function(){
            var json=[];
            //商品数据
            var len=$('.pingjia-list').length;
            for(var i=0;i<len;i++){
                var l={};
                l.member_id=$cookieStore.get("member_id");
                l.order_id=$location.search()['oid'];
                l.assessment_desc=$('.pingjia-list').eq(i).find('textarea').val();
                l.assessment_type=$location.search()['type']?'order':'goods';
                if($('.pingjia-list').eq(i).find('.star').attr('val')==0){
                    $scope.alerttxt('请选择星级');
                    return false;
                }
                l.assessment_star1=$('.pingjia-list').eq(i).find('.star').attr('val');
                l.assessment_star2=$('.pingjia-list').eq(i).find('.star').attr('val');
                l.assessment_star3=$('.pingjia-list').eq(i).find('.star').attr('val');
                l.relation_id=$('.pingjia-list').attr('shopid');
                l.assessmentImgBeans=[];
                var len2=$('.pingjia-list').eq(i).find('.p-l-r-3of p b').length;
                if(len2==0){

                }else{
                    for(var k=0;k<len2;k++){
                        var s={};
                        s.assessment_img=$('.pingjia-list').eq(i).find('.p-l-r-3of p b').eq(k).attr('val');
                        l.assessmentImgBeans.push(s)
                    }
                }
                json.push(l);

            }
            //商家数据
            var b={}
            b.member_id=$cookieStore.get("member_id");
            b.order_id=$location.search()['oid'];
            b.assessment_desc='';
            b.assessment_type='merchants';
            b.relation_id=$('.pj-dianpu .p-d-right').attr('mid');
            b.assessmentImgBeans=[];
            b.assessment_star1=$('.pj-dianpu .p-d-right li').eq(0).find('.star').attr('val');
            b.assessment_star2=$('.pj-dianpu .p-d-right li').eq(1).find('.star').attr('val');
            b.assessment_star3=$('.pj-dianpu .p-d-right li').eq(2).find('.star').attr('val');
            if(b.assessment_star1==0||b.assessment_star2==0||b.assessment_star3==0){
                $scope.alerttxt('请选择星级');
                return false;
            }
            json.push(b);

            console.log(JSON.stringify(json));
            //上传数据
            $http.post($scope.url+"/orderInterfaces.api?assessmentOrder",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                json:JSON.stringify(json),
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.alerttxt('评价成功');
                    window.location.href="core.html#/pjdd"
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }



    })
    .directive("star", [function () {  //  选择尺寸，颜色
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    var index=element.index()+1;
                    element.parent(".star").attr("class","").attr("class","star star"+index).attr('val',index)
                });
            }
        }
    }])
    //个人资料
    .controller('grzl',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0)
        $scope.h3nav(1,1);
        $scope.grzl_center=function(){
                $http.post($scope.url+"/memberInterfaces.api?getMemberDetail",$.param({
                    member_id:$cookieStore.get('member_id'),
                    member_token:$cookieStore.get('member_token'),
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
                ).success(function(data){
                    console.log(data);
                    if(data["status"]=="ok"){
                        $scope.grzl_centers=data['data'];
                        var ages=data['data']['age']==0?'2000-1-1':data['data']['age'];
                        var ss = ages.split("-");
                        for(var i=0;i<3;i++){
                            $('.xgzl-5of6 select').eq(i).attr('rel',ss[i]);
                        }
                        $.ms_DatePicker({
                                YearSelector: ".sel_year",
                                MonthSelector: ".sel_month",
                                DaySelector: ".sel_day"
                        });
                        $.ms_DatePicker();
                    }else{
                        $scope.grzl_centers=''
                    }
                })
        }
        $scope.grzl_center();

        $scope.grxxbtn=function(){
            if($('#grzlname').val().length>10){
                $scope.alerttxt('昵称最多10个字')
                return false;
            }
            if($('#grzlname').val()==''){
                $scope.alerttxt('请输入昵称')
                return false;
            }
            var sex;
            if($('.xgzl-4of6 .sexm').is(':checked')){
                sex='m'
            }else{
                sex='w'
            }
            var ages='';
            var zrr=[];
            var len=$('.xgzl-5of6 select').length;
            for(var i=0;i<len;i++){
                zrr.push($('.xgzl-5of6 select').eq(i).val());
            }
            ages=zrr.join("-");
            $http.post($scope.url+"/memberInterfaces.api?updateMemberDetail",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                nick_name:$('#grzlname').val(),
                age:ages,
                sex:sex,
                head_path:$('.xgzl-1of6 b').attr('val'),

            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.alerttxt('修改成功')
                    $scope.grzl_center();
                    $scope.grxx_center();
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }


    })
    //店铺收藏
    .controller('dpsc',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0);
        $scope.h3nav(1,0);
        $scope.dpscfun = function(id,index,arr,brr){
            //console.log(id+","+index+","+arr+","+brr);

            $http.post($scope.url+"/merchantsInterfaces.api?getMerchantsGoodss",$.param({
                merchants_id:id,
                page:1,
                limit:3,
                is_new:arr,
                is_recommend:brr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.dpsclists[index]["data"]=data["data"];
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }

        //商品收藏列表
        $scope.dpsclist=function(arr){//页数
            $scope.arr=arr;//页数初始化
            $http.post($scope.url+"/collectionInterfaces.api?getCollection",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                collection_type:'merchants',
                page:arr,
                limit:10,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.dpsclists=data['data'];
                    $scope.shoptotal=data['total'];//总数
                    $scope.pageNum=Math.ceil($scope.shoptotal/10)==0?'1':Math.ceil($scope.shoptotal/10);//总页数
                    $scope.nowpageNum=arr;//当前页
                    $scope.nowpageNum2=arr;//当前页 跳转用
                    $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                    console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页");//
                    for(var i=0;i<$scope.dpsclists.length;i++){
                        $scope.dpscfun($scope.dpsclists[i].merchantsBean.merchants_id,i,0,1)
                    }
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.dpsclist(1);
        //分页
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.arr||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.dpsclist(arr)
                $scope.scrolltop(0);
            }
        }

        //取消收藏
        $scope.dpscsc=function(arr,brr){
            console.log(arr+","+brr)

            $http.post($scope.url+"/collectionInterfaces.api?cancelCollection",$.param({
                collection_id:brr,
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $("#m"+arr).hide();
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }


    })
    //我的钱包
    .controller('wdqb',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0);
        $scope.h3nav(1,0);
        $scope.zdjl=function(arr){
            $http.post($scope.url+"/memberInterfaces.api?getMemberBalanceRecord",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                page:arr,
                limit:40,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.zdjls=data['data'];
                    $scope.shoptotal=data['total'];//总数
                    $scope.pageNum=Math.ceil($scope.shoptotal/40)==0?'1':Math.ceil($scope.shoptotal/40);//总页数
                    $scope.nowpageNum=arr;//当前页
                    $scope.nowpageNum2=arr;//当前页 跳转用
                    $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                    console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页");//
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.zdjl(1);
        //分页
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.nowpageNum||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.zdjl(arr)
                $scope.scrolltop(0);
            }
        }


    })
    //安全设置
    .controller('aqsz',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0)
        $scope.h3nav(1,1);
        //获取验证码
        var InterValObj1; //timer变量，控制时间
        var count1 = 60; //间隔函数，1秒执行
        var curCount1;//当前剩余秒数

        $scope.sendMessage1=function(arr){//手机号码  id
            if($("#btnSendCode1").attr("val")==1){
                return false;
            }
            $("#btnSendCode1").attr("val", "1");
            setTimeout('$("#btnSendCode1").attr("val", "2")',2000);
            if(!myreg.test(arr)){
                $scope.alerttxt("请输入有效的手机号码！");
            }else{
                $http.post($scope.url+"/othersInterfaces.api?sendCode",$.param({
                    mobile:arr,
                    code_type:"forget_passwrod",
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
                ).success(function(data){
                    console.log(data);
                    if(data["status"]=="ok"){
                        curCount1 = count1;
                    　　//设置button效果，开始计时
                         $("#btnSendCode1").attr("disabled", "true");
                         $("#btnSendCode1").val(curCount1 + "s");
                         InterValObj1 = window.setInterval(SetRemainTime1, 1000); //启动计时器，1秒执行一次
                    }else if (data["status"] == "pending" && data["error"] == "token failed"){
                        $scope.relogin()
                    }else{
                        $scope.alerttxt(data['error'])
                    }
                })
            }
        }
        //timer处理函数
        function SetRemainTime1() {
            if (curCount1 == 0) {
                window.clearInterval(InterValObj1);//停止计时器
                $("#btnSendCode1").removeAttr("disabled");//启用按钮
                $("#btnSendCode1").val("重新发送");
            }else {
                curCount1--;
                $("#btnSendCode1").val(curCount1 + "s");
            }
       }
       /****获取验证码end***/
       $scope.keepbtn1=function(arr,brr,crr,drr){//手机号 验证码 密码 2次密码
            if(crr!=drr){
                $scope.alerttxt("请输入一致的密码");
                return false;
            }
            $http.post($scope.url+"/memberInterfaces.api?memberForgetPassword",$.param({
                member_account:arr,
                password:crr,
                code:brr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.alerttxt('修改成功！');
                    $cookieStore.put("member_id",0);
                    $cookieStore.put("member_token",0);
                    $scope.grxx_center();
                    $scope.tckshow(1);
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
       }
       //获取验证码
        var InterValObj2; //timer变量，控制时间
        var count2 = 60; //间隔函数，1秒执行
        var curCount2;//当前剩余秒数
        $scope.sendMessage2=function(arr){//手机号码
            if($("#btnSendCode2").attr("val")==1){
                return false;
            }
            $("#btnSendCode2").attr("val", "1");
            setTimeout('$("#btnSendCode2").attr("val", "2")',2000);
            console.log(arr)
            if(!myreg.test(arr)){
                $scope.alerttxt("请输入有效的手机号码！");
            }else{
                $http.post($scope.url+"/othersInterfaces.api?sendCode",$.param({
                    mobile:arr,
                    code_type:"balance_passwrod",
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
                ).success(function(data){
                    console.log(data);
                    if(data["status"]=="ok"){
                        curCount2 = count2;
                    　　//设置button效果，开始计时
                         $("#btnSendCode2").attr("disabled", "true");
                         $("#btnSendCode2").val(curCount2 + "s");
                         InterValObj2 = window.setInterval(SetRemainTime2, 1000); //启动计时器，1秒执行一次
                    }else if (data["status"] == "pending" && data["error"] == "token failed"){
                        $scope.relogin()
                    }else{
                        $scope.alerttxt(data['error'])
                    }
                })
            }
        }
        //timer处理函数
        function SetRemainTime2() {
            if (curCount2 == 0) {
                window.clearInterval(InterValObj2);//停止计时器
                $("#btnSendCode2").removeAttr("disabled");//启用按钮
                $("#btnSendCode2").val("重新发送");
            }else {
                curCount2--;
                $("#btnSendCode2").val(curCount2 + "s");
            }
       }
       /****获取验证码end***/
       $scope.keepbtn2=function(arr,brr,crr,drr){//手机号 验证码 密码 2次密码
            if(crr!=drr){
                $scope.alerttxt("请输入一致的密码");
                return false;
            }
            if(crr.length!=6){
                $scope.alerttxt("请输入6位数密码");
                return false;
            }
            $http.post($scope.url+"/memberInterfaces.api?updateMemberBalancePassword",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                member_account:arr,
                balance_password:crr,
                code:brr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.alerttxt('修改成功！');
                    window.location.reload();
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
       }
       //获取验证码
        var InterValObj3; //timer变量，控制时间
        var count3 = 60; //间隔函数，1秒执行
        var curCount3;//当前剩余秒数
        $scope.sendMessage3=function(arr){//手机号码  id
            if($("#btnSendCode3").attr("val")==1){
                return false;
            }
            $("#btnSendCode3").attr("val", "1");
            setTimeout('$("#btnSendCode3").attr("val", "2")',2000);
            console.log(arr)
            if(!myreg.test(arr)){
                $scope.alerttxt("请输入有效的手机号码！");
            }else{
                $http.post($scope.url+"/othersInterfaces.api?sendCode",$.param({
                    mobile:arr,
                    code_type:"trust_passwrod",
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
                ).success(function(data){
                    console.log(data);
                    if(data["status"]=="ok"){
                        curCount3 = count3;
                    　　//设置button效果，开始计时
                         $("#btnSendCode3").attr("disabled", "true");
                         $("#btnSendCode3").val(curCount3 + "s");
                         InterValObj3 = window.setInterval(SetRemainTime3, 1000); //启动计时器，1秒执行一次
                    }else if (data["status"] == "pending" && data["error"] == "token failed"){
                        $scope.relogin()
                    }else{
                        $scope.alerttxt(data['error'])
                    }
                })
            }
        }
        //timer处理函数
        function SetRemainTime3() {
            if (curCount3 == 0) {
                window.clearInterval(InterValObj3);//停止计时器
                $("#btnSendCode3").removeAttr("disabled");//启用按钮
                $("#btnSendCode3").val("重新发送");
            }else {
                curCount3--;
                $("#btnSendCode3").val(curCount3 + "s");
            }
       }
       /****获取验证码end***/
       $scope.keepbtn3=function(arr,brr,crr,drr){//手机号 验证码 密码 2次密码
            if(crr!=drr){
                $scope.alerttxt("请输入一致的密码");
                return false;
            }
            if(crr.length!=6){
                $scope.alerttxt("请输入6位数密码");
                return false;
            }
            $http.post($scope.url+"/memberInterfaces.api?updateMemberTrustPassword",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                member_account:arr,
                trust_password:crr,
                code:brr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.alerttxt('修改成功！');
                    window.location.reload();
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
       }
       //获取验证码
       //  var InterValObj4; //timer变量，控制时间
       //  var count4 = 60; //间隔函数，1秒执行
       //  var curCount4;//当前剩余秒数
       //  $scope.sendMessage4=function(arr){//手机号码  id
       //      console.log(arr)
       //      if(!myreg.test(arr)){
       //          alert("请输入有效的手机号码！");
       //      }else{
       //          $http.post($scope.url+"/othersInterfaces.api?sendCode",$.param({
       //              mobile:arr,
       //              code_type:"member_register",
       //          }),
       //          {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
       //          ).success(function(data){
       //              console.log(data);
       //              if(data["status"]=="ok"){
       //                  curCount4 = count4;
       //              　　//设置button效果，开始计时
       //                   $("#btnSendCode4").attr("disabled", "true");
       //                   $("#btnSendCode4").val(curCount4 + "s");
       //                   InterValObj4 = window.setInterval(SetRemainTime4, 1000); //启动计时器，1秒执行一次
       //              }else if (data["status"] == "pending" && data["error"] == "token failed"){
       //                  $scope.relogin()
       //              }else{
       //                  $scope.alerttxt(data['error'])
       //              }
       //          })
       //      }
       //  }
       //  //timer处理函数
       //  function SetRemainTime4() {
       //      if (curCount4 == 0) {
       //          window.clearInterval(InterValObj4);//停止计时器
       //          $("#btnSendCode4").removeAttr("disabled");//启用按钮
       //          $("#btnSendCode4").val("重新发送");
       //      }else {
       //          curCount4--;
       //          $("#btnSendCode4").val(curCount4 + "s");
       //      }
       // }
       // /****获取验证码end***/
       // //获取验证码
       //  var InterValObj5; //timer变量，控制时间
       //  var count5 = 60; //间隔函数，1秒执行
       //  var curCount5;//当前剩余秒数
       //  $scope.sendMessage5=function(arr){//手机号码  id
       //      console.log(arr)
       //      if(!myreg.test(arr)){
       //          alert("请输入有效的手机号码！");
       //      }else{
       //          $http.post($scope.url+"/othersInterfaces.api?sendCode",$.param({
       //              mobile:arr,
       //              code_type:"update_mobile",
       //          }),
       //          {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
       //          ).success(function(data){
       //              console.log(data);
       //              if(data["status"]=="ok"){
       //                  curCount5 = count5;
       //              　　//设置button效果，开始计时
       //                   $("#btnSendCode5").attr("disabled", "true");
       //                   $("#btnSendCode5").val(curCount5 + "s");
       //                   InterValObj5 = window.setInterval(SetRemainTime5, 1000); //启动计时器，1秒执行一次
       //              }else if (data["status"] == "pending" && data["error"] == "token failed"){
       //                  $scope.relogin()
       //              }else{
       //                  $scope.alerttxt(data['error'])
       //              }
       //          })
       //      }
       //  }
       //  //timer处理函数
       //  function SetRemainTime5() {
       //      if (curCount5 == 0) {
       //          window.clearInterval(InterValObj5);//停止计时器
       //          $("#btnSendCode5").removeAttr("disabled");//启用按钮
       //          $("#btnSendCode5").val("重新发送");
       //      }else {
       //          curCount5--;
       //          $("#btnSendCode5").val(curCount5 + "s");
       //      }
       // }
       // /****获取验证码end***/
       // $scope.keepbtn5=function(arr,brr){//新手机号 验证码
       //      $http.post($scope.url+"/memberInterfaces.api?updateMemberDetail",$.param({
       //          member_id:$cookieStore.get("member_id"),
       //          member_token:$cookieStore.get("member_token"),
       //          phone:arr,
       //          code:brr,
       //      }),
       //      {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
       //      ).success(function(data){
       //          console.log(data);
       //          if(data["status"]=="ok"){
       //              alert('修改成功！');
       //              window.location.reload();
       //          }else if (data["status"] == "pending" && data["error"] == "token failed"){
       //              $scope.relogin()
       //          }else{
       //              $scope.alerttxt(data['error'])
       //          }
       //      })
       // }

    })
    //我的认证
    .controller('wdrz',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0)
        $scope.h3nav(1,1);
        $scope.cwdrz=function(){
            $http.post($scope.url+"/merchantsInterfaces.api?getMerchantsByMember",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.c_wdrzs=data['data'];
                    if(data['data']['contact_mobile']){
                        $scope.wdrzshow=2;
                    }else{
                        $scope.wdrzshow=1;
                    }
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            }).error(function(){
                $scope.wdrzshow=1;
            })
        }
        $scope.cwdrz();


        $scope.wdrzbtn=function(){
            var radio=2;//2:企业供应商 4:个人供应商
            if($('.w-l-1of .qy').hasClass('act')){
                var radio=2;//
            }else{
                var radio=4;//
            }
            var json=[];

            if($("#m_names").val()==''){
                $scope.alerttxt('请输入企业/店铺名');
                return false;
            }
            if($("#m_add").val()==''){
                $scope.alerttxt('请输入企业/店铺地址');
                return false;
            }
            if($("#m_name").val()==''){
                $scope.alerttxt('请输入联系人姓名');
                return false;
            }
            if($("#m_phone").val()==''){
                $scope.alerttxt('请输入手机号');
                return false;
            }
            if(!myreg.test($("#m_phone").val())){
                $scope.alerttxt("请输入有效的手机号码！");
                return false;
            }
            if(!yxreg.test($("#m_email").val())){
                $scope.alerttxt("请输入有效的邮箱！");
                return false;
            }
            //var len=$(".w-l-8of .sc-list").length;
            var ka_=0;
            for(var i=0;i<3;i++){
                var sz={};//3证或营业执照
                if($(".w-l-8of .sc-list").eq(i).find('i img').attr('val')){
                    ka_++;
                    sz.img_type=$(".w-l-8of .sc-list").eq(i).find('i').attr('ty');
                    sz.merchants_img=$(".w-l-8of .sc-list").eq(i).find('i img').attr('val');
                    sz.qualification_id='-1';
                    json.push(sz)
                }
            }
            if(ka_<1){
                $scope.alerttxt('请上传企业3证或营业执照')
                return false;
            }

            var kb_=0;
            for(var i=0;i<3;i++){
                var sfz={};//3证或营业执照
                if($(".w-l-10of .sc-list").eq(i).find('i img').attr('val')){
                    kb_++
                    sfz.img_type=$(".w-l-10of .sc-list").eq(i).find('i').attr('ty');
                    sfz.merchants_img=$(".w-l-10of .sc-list").eq(i).find('i img').attr('val');
                    sfz.qualification_id='-1';
                    json.push(sfz)
                }
            }
            if(kb_!=3){
                $scope.alerttxt('请上传身份证套图')
                return false;
            }
            console.log(radio)
            //console.log(JSON.stringify(json))
            //return false
            //return false;
            $http.post($scope.url+"/merchantsInterfaces.api?applyMerchants",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                merchants_name:$("#m_names").val(),//店铺名
                merchants_type:radio,//2:企业供应商 4:个人供应商
                contact_mobile:$("#m_phone").val(),//联系人电话
                contact_name:$("#m_name").val(),//联系人姓名
                merchants_address:$("#m_add").val(),//地址
                merchants_email:$("#m_email").val(),//邮箱
                json:JSON.stringify(json),
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.alerttxt('你的信息提交成功，请等待审核');
                    $scope.cwdrz();
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        //重新提交
        $scope.cxtjbtn=function(){
            $scope.wdrzshow=1;
            $scope.scrolltop(0)
        }


    })
    //信用认证
    .controller('xyrz',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0);
        $scope.h3nav(1,1);
        //信用认证最新的人的信息
        $http.post($scope.url+"/swInterfaces.api?getLastTrust",$.param({
            member_id:$cookieStore.get("member_id"),
            member_token:$cookieStore.get("member_token"),
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.newlatest=data['data'];
            }else if (data["status"] == "pending" && data["error"] == "token failed"){
                $scope.relogin()
            }else{
                $scope.alerttxt(data['error'])
            }
        }).error(function(){
            $scope.newlatest='';
        })
        //提交
        $scope.wdrzbtn=function(){
            if($("#sqdw").val()==''){
                $scope.alerttxt('请输入单位名称')
                return false;
            }
            if($("#sqname").val()==''){
                $scope.alerttxt('请输入申请人姓名')
                return false;
            }
            var sex='m'
            if($('.sq-sex .m').hasClass('act')){
                sex='m'
            }else if($('.sq-sex .w').hasClass('act')){
                sex='w'
            }else{
                $scope.alerttxt('请选择性别')
                return false;
            }
            if($("#sqzc").val()==''){
                $scope.alerttxt('请输入专业/职称')
                return false;
            }
            if($("#sqgddh").val()==''){
                $scope.alerttxt('请输入固定电话')
                return false;
            }
            var gdreg=/^((0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/;
            if(!gdreg.test($("#sqgddh").val())){
                $scope.alerttxt('请输入规范的固定电话')
                return false;
            }
            if($("#sqphone").val()==''){
                $scope.alerttxt('请输入手机')
                return false;
            }
            if(!myreg.test($("#sqphone").val())){
                $scope.alerttxt('请输入规范的手机号');
                return false;
            }
            if(!yxreg.test($("#sqemail").val())){
                $scope.alerttxt("请输入有效的邮箱！");
                return false;
            }

            var json=[];
            var len=$('.xyrz-listbox.xm ul').length;
            var x=$('.xyrz-listbox.xm ul')
            for(var i=0;i<len;i++){
                var xm={};
                if(x.eq(i).find('.xmname').val()==''){
                    $scope.alerttxt('请输入第'+(i*1+1*1)+'个项目的项目名称')
                    return false;
                }
                xm.item_name=x.eq(i).find('.xmname').val();
                if(x.eq(i).find('.fzname').val()==''){
                    $scope.alerttxt('请输入第'+(i*1+1*1)+'个项目的负责人')
                    return false;
                }
                xm.item_responsible_name=x.eq(i).find('.fzname').val();
                if(x.eq(i).find('.dwname').val()==''){
                    $scope.alerttxt('请输入第'+(i*1+1*1)+'个项目的单位名称')
                    return false;
                }
                xm.company_name=x.eq(i).find('.dwname').val();
                if(x.eq(i).find('.xmcode').val()==''){
                    $scope.alerttxt('请输入第'+(i*1+1*1)+'个项目的项目批准号')
                    return false;
                }
                xm.item_code=x.eq(i).find('.xmcode').val();
                if(x.eq(i).find('.xmtime1').val()==''){
                    $scope.alerttxt('请输入第'+(i*1+1*1)+'个项目的批准时间（起点年月）')
                    return false;
                }
                xm.item_start_time=x.eq(i).find('.xmtime1').val();
                if(x.eq(i).find('.xmtime2').val()==''){
                    $scope.alerttxt('请输入第'+(i*1+1*1)+'个项目的批准时间（终止年月）')
                    return false;
                }
                xm.item_end_time=x.eq(i).find('.xmtime2').val();
                if(x.eq(i).find('.xmmoney').val()==''){
                    $scope.alerttxt('请输入第'+(i*1+1*1)+'个项目的项目金额')
                    return false;
                }
                xm.item_price=x.eq(i).find('.xmmoney').val();
                xm.trust_price=(xm.item_price*0.1).toFixed(2);
                xm.trust_remark=x.eq(i).find('.xmtext').val()

                json.push(xm);
            }
            console.log(json);
            //
            $http.post($scope.url+"/swInterfaces.api?applyTrust",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                apply_company:$("#sqdw").val(),
                apply_name:$("#sqname").val(),
                apply_sex:sex,
                apply_position:$("#sqzc").val(),
                apply_fixed_mobile:$("#sqgddh").val(),
                apply_mobile:$("#sqphone").val(),
                apply_email:$("#sqemail").val(),
                json:JSON.stringify(json),
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.alerttxt('申请成功，请等待审核');
                    $timeout(function(){
                        location.href="core.html#/xyrzlist"
                    },2000)
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }

    })
    .controller('xyrzlist',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0);
        $scope.h3nav(1,1);
        //信用认证列表
        $scope.gettrusts=function(arr){
            $http.post($scope.url+"/swInterfaces.api?getTrust",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                page:arr,
                limit:20,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.gettrust=data['data'];
                    $scope.shoptotal=data['total'];//总数
                    $scope.pageNum=Math.ceil($scope.shoptotal/20)==0?'1':Math.ceil($scope.shoptotal/20);//总页数
                    $scope.nowpageNum=arr;//当前页
                    $scope.nowpageNum2=arr;//当前页 跳转用
                    $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                    console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页"+$scope.nowpageNum2);//
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.gettrusts(1);
        //分页
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.nowpageNum||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.gettrusts(arr);
                $scope.scrolltop(0);
            }
        }

    })
    //信用认证详情
    .controller('xyrzxq',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0)
        $scope.h3nav(1,1);
        //信用认证详情
        $http.post($scope.url+"/swInterfaces.api?getOneTrust",$.param({
            member_id:$cookieStore.get("member_id"),
            member_token:$cookieStore.get("member_token"),
            trust_id:$location.search()['xid']
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.rzxq=data['data'];
            }else if (data["status"] == "pending" && data["error"] == "token failed"){
                $scope.relogin()
            }else{
                $scope.alerttxt(data['error'])
            }
        })

    })
    //帮助中心
    .controller('bzzx',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore,$sce){
        // $scope.scrolltop(0);
        $scope.h3nav(2,2);

        $scope.bzzxact=$location.search()['b'];
        $scope.bzzxact2=$location.search()['c']?$location.search()['c']:0;
        $scope.bzzxact3=$location.search()['d']?$location.search()['d']:$location.search()['b'];;
        if($location.search()['type']!=1){
            $scope.bzzxtit=$location.search()['tit'];
        }
        $scope.bzzxtype=$location.search()['type'];
        //拿到3级的帮助中心的问题
        $scope.footers(3);
        //type=1时拿下级的文本
        $scope.bzzxfinds=function(arr){
            $http.post($scope.url+"/othersInterfaces.api?getHtmlDesc",$.param({
                url:arr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                $scope.bzzxtxt=$sce.trustAsHtml(data);//==''?'波尔牛烘烘很高兴能帮到你':data

            })
        }
        //根据id拿到右侧文本内容 2拿文本  1拿链接
        if($scope.bzzxtype==2){
            $http.post($scope.url+"/othersInterfaces.api?getHtmlDesc",$.param({
                url:$location.search()['b'],
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                $scope.bzzxtxt=$sce.trustAsHtml(data);//==''?'波尔牛烘烘很高兴能帮到你':data

            })
        }else if($scope.bzzxtype==1){
            $http.post($scope.url+"/othersInterfaces.api?getHtmlByParent",$.param({
                parent_id:$location.search()['b'],
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    if(data['data'].length>0){
                        $scope.bzzxfinds(data['data'][0]['html_id']);
                        $scope.bzzxact=data['data'][0]['html_id'];
                        $scope.bzzxtit=data['data'][0]['html_name'];
                    }
                    //$scope.bzzxfind=data['data']
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }else{

        }

    })
    //各种规则
    .controller('rule',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore,$sce){
        $scope.scrolltop(0);
        $scope.h3nav(4,4);
        $scope.ruleact=$location.search()['act'];
        $scope.ruletit=$location.search()['tit'];
    })
    //意见反馈
    .controller('yjfk',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.scrolltop(0)
        $scope.h3nav(3,3);
        $scope.fk_desc='';
        $scope.yj=1;
        $scope.fk_name='';
        $scope.fk_mobile='';
        $scope.yjfkbtn=function(){
            if($scope.fk_desc==''){
                $scope.alerttxt('请填写反馈内容！');
                return false;
            }
            if($scope.fk_desc.length<10||$scope.fk_desc.length>500){
                $scope.alerttxt('内容需在10-500字之间！');
                return false;
            }
            if($scope.fk_name==''){
                $scope.alerttxt('请输入姓名');
                return false;
            }
            if(!myreg.test($scope.fk_mobile)){
                $scope.alerttxt('请输入规范的手机号');
                return false;
            }
            var len=$('.p-l-r-3of p b').length;
            var fk_img;
            if(len!=0){
                var s=[];
                for(var k=0;k<len;k++){
                    s.push($('.p-l-r-3of p b').eq(k).attr('val'));
                }
                fk_img=s.join(",");
            }else{
                fk_img='';
            }
            $http.post($scope.url+"/adviceInterfaces.api?insertAdviceWithPath",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                advice_desc:$scope.yj,
                advice_name:$scope.fk_name,
                advice_mobile:$scope.fk_mobile,
                advice_assessment:$scope.yj,
                advice_imgs:fk_img,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.alerttxt('你的反馈已提交,感谢您的宝贵意见！');
                    setTimeout("location.href='index.html#/'",1000);
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }

    })
    .directive("tab", [function () {  //  选择尺寸，颜色
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    element.addClass("act");
                    element.siblings().removeClass("act")
                });
            }
        }
    }])
    .directive("dbclick2", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    if(element.parent('.nav3-list').hasClass('act')){
                        element.parent('.nav3-list').removeClass('act')
                    }else{
                        element.parent('.nav3-list').addClass('act')
                    }
                });
            }
        }
    }])
    .directive("dbclick3", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    if(element.find('ul').hasClass('act')){
                        element.find('ul').hide();
                        element.find('ul').removeClass('act');
                    }else{
                        element.find('ul').show();
                        element.find('ul').addClass('act');
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
    //添加一个项目
    .directive("addxm", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    var tpl='<ul>'+
                     '<li class="w-l-2of"><label>项目名称：</label><input class="xmname" type="text" /><span class="del">删除</span></li>'+
                     '<li class="w-l-2of"><label>负责人：</label><input class="fzname" type="text" /></li>'+
                     '<li class="w-l-2of"><label>单位名称：</label><input class="dwname" type="text" /></li>'+
                     '<li class="w-l-2of"><label>项目批准号：</label><input class="xmcode" type="text" /></li>'+
                     '<li class="w-l-2of"><label>批准时间（起点年月）：</label><input class="xmtime1" onClick="WdatePicker()" /></li>'+
                     '<li class="w-l-2of"><label>批准时间（终止年月）：</label><input class="xmtime2" onClick="WdatePicker()" /></li>'+
                     '<li class="w-l-2of"><label>项目金额（万元）：</label><input class="xmmoney" type="number" /></li>'+
                     '<li class="w-l-2of"><label>授信额度（万元）：</label><input disabled class="xmmoney2" type="text" /><span class="red mar-l20">授信额度&nbsp;=&nbsp;项目金额&nbsp;*&nbsp;10%</span></li>'+
                     '<li class="w-l-2of"><label>备注：</label><textarea class="xmtext"></textarea></li>'+
                  '</ul>'
                  $('.xyrz-listbox.xm').append(tpl)
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
    .directive("fktab", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    element.addClass("act");
                    element.parent('li').siblings().find('span').removeClass("act");
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
    .directive("wltips", function ($timeout) {  //
        return{
            link: function (scope, element, attributes) {
                element.mouseover(function () {
                  console.log(element.position().top)
                  element.siblings('.tips-box').attr('val',1).css('top',(24+element.position().top)).show();
                });
                element.mouseleave(function () {
                  $timeout(function(){
                      if(element.siblings('.tips-box').attr('val')==1){
                        element.siblings('.tips-box').hide();
                      }
                  },200)
                });
            }
        }
    })
    .directive("wltipshover", [function () {  //
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
