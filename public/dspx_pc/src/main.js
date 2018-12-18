/*
* @Author: cool
* @Date:   2017-01-02 10:51:15
* @Last Modified by:   cool
* @Last Modified time: 2017-04-01 10:29:17
*/
//手机正则
var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
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
                $scope.alerttxt(data['error'])
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
            }else{
                $scope.alerttxt(data['error'])
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
        $http.post($scope.url+"/goodsInterfaces.api?getGoodsClassLevel",$.param({
            parent_id:arr,
            level:brr,
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
              if(brr==1){
                $scope.sortlist=data["data"];
                $scope.sorts(-1,3)
              }else{
                $scope.sortlist=data["data"];
              }
            }else{
                $scope.alerttxt(data['error'])
            }
        })
      }
      $scope.sorts(-1,1)
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
        if(actsortval==1&&actsortgid==1){//搜索商家
           window.location.href="index.html#/sssj?merchantname="+name;
        }else{
            $location.path("/shoplist").search({goodsname:name,uuid:actsortval,gid:actsortgid})
        }
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
      $scope.navsortshows=function(arr,brr){
        $scope.actnothide=brr;
        if(brr==1&&arr!=0){
            return false;
        }
        if(arr==0){
            $scope.navsortshow=1;
        }else if(arr==1){
            $scope.navsortshow=0;
        }else{
            $scope.navsortshow=1;
        }
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
      //footer
      $http.post($scope.url+"/othersInterfaces.api?getHtmls",$.param({
            level:2,
      }),
      {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
      ).success(function(data){
          console.log(data);
          if(data["status"]=="ok"){
              $scope.footer=data['data'];
          }else{
          }
      })
})

    // 首页
    .controller('homes',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.navsortshows(0,1);
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
                $scope.alerttxt(data['error'])
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
        $scope.homes=function(arr,brr,crr,drr){
          $http.post($scope.url+"/swInterfaces.api?getHomeClassWeb",$.param({
              level:2,
              goods_id:arr,
              goods_uuid:brr,
              goods_name:crr,
          }),
          {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
          ).success(function(data){
              console.log(data);
              if(data["status"]=="ok"){
                 $scope.homessort[drr]=data["data"];
              }else{
                  $scope.alerttxt(data['error'])
              }
          })
        }

        $http.post($scope.url+"/swInterfaces.api?getHomeClassWeb",$.param({
            level:1,
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.homessort=data["data"];
                var len=data['data'].length;
                for(var i=0;i<len;i++){
                  $scope.homes(data['data'][i]['goods_id'],data['data'][i]['goods_uuid'],data['data'][i]['goods_name'],i)
                }
            }else{
                $scope.alerttxt(data['error'])
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
    //企业购
    .controller('qyg',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.navsortshows(1,0);
        $scope.scrolltop(0);
        //商品列表
        $scope.shopl=function(arr,brr,crr,drr,err,frr,grr,hrr,irr,jrr,krr){
            $scope.loading=1;
            // $scope.shoplist=''
            $scope.arr=arr;
            $scope.brr=brr;
            $scope.crr=crr;
            $scope.drr=drr;
            $scope.err=err;
            $scope.frr=frr;
            $scope.grr=grr;
            $scope.hrr=hrr;
            $scope.irr=irr;
            $scope.jrr=jrr;
            $scope.krr=krr;
            $http.post($scope.url+"/goodsInterfaces.api?searchGoodsDetailList",$.param({
                goods_uuid:arr,//uuid
                goods_name:brr,//商品名
                page:crr,//页数
                min_pc_price:drr,//最小价格
                max_pc_price:err,//最大价格
                brand_id:frr,//品牌
                activity_id:grr,//活动id
                label_id:hrr,//服务id
                storehouse_name:irr,//发货地--仓库名
                sort:jrr,//assessment:评价sales:销量 price:价格
                sort_way:krr,//升降序in
                limit:40,
                is_business_buy:1,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $timeout(function(){
                      $scope.loading=3;
                    },800)
                    $scope.shoplist=data["data"];
                    $scope.shoptotal=data['total'];//总数
                    $scope.pageNum=Math.ceil($scope.shoptotal/40)==0?'1':Math.ceil($scope.shoptotal/40);//总页数
                    $scope.nowpageNum=crr;//当前页
                    $scope.nowpageNum2=crr;//当前页 跳转用
                    $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                    console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页"+$scope.nowpageNum2);//
                }else{
                    $scope.alerttxt(data['error'])
                }
            }).error(function(){
                $scope.loading=2;
            })
        }

        //企业购分类
        $scope.shoplistsort=function(arr){
            $http.post($scope.url+"/swInterfaces.api?getBusinessBuyClass",$.param({
                parent_id:arr,
                level:1,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.shoplistsorts=data["data"];
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.shoplistsort(-1)
        $scope.shoplistsort2=function(arr,index){
            console.log(arr)
            $http.post($scope.url+"/swInterfaces.api?getBusinessBuyClass",$.param({
                parent_id:arr,
                level:2,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.shoplistsorts2=data['data']
                    $scope.shoplistsorts[index].sort2=$scope.shoplistsorts2;
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.shoplistsort3=function(arr,index){
            $http.post($scope.url+"/swInterfaces.api?getBusinessBuyClass",$.param({
                parent_id:arr,
                level:3,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.shoplistsorts2[index].sort3=data["data"];
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        //获取商品品牌 活动 服务 发货地
        $scope.shoppinpai=function(arr){
            $http.post($scope.url+"/goodsInterfaces.api?getFilterByClass",$.param({
                goods_uuid:'',
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.shoppinpais=data["data"];
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.shoppinpai('')
        //获取商品分类名
        //$scope.getsortname=$location.search()['sortname']?$location.search()['sortname']:'分类';
        //一进来判断
        $scope.shopl('','',1,'','','','','','','','');
        //单击。
        $scope.ssclicks=function(arr,brr){
            if($("#"+arr).find('.dx').hasClass('act')){
                return false;
            }
            if(arr=='brand'){//品牌
                $scope.shopl($scope.arr,$scope.brr,1,$scope.drr,$scope.err,brr,$scope.grr,$scope.hrr,$scope.irr,$scope.jrr,$scope.krr)
            }else if(arr=='fenlei'){//分类
                $scope.shopl(brr,$scope.brr,1,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr,$scope.irr,$scope.jrr,$scope.krr);
            }else if(arr=='activity'){//活动
                $scope.shopl($scope.arr,$scope.brr,1,$scope.drr,$scope.err,$scope.frr,brr,$scope.hrr,$scope.irr,$scope.jrr,$scope.krr)
            }else if(arr=='service'){//服务
                $scope.shopl($scope.arr,$scope.brr,1,$scope.drr,$scope.err,$scope.frr,$scope.grr,brr,$scope.irr,$scope.jrr,$scope.krr)
            }else if(arr=='storehouse'){//发货地
                $scope.shopl($scope.arr,$scope.brr,1,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr,brr,$scope.jrr,$scope.krr)
            }else{
                $scope.alerttxt('暂无该分类')
            }
        }
        //确认
        $scope.dbclicks=function(arr){
            var idlist='';//初始化选中的id集合
            if($("#"+arr).find('.dx').hasClass('act')){
                idlist="";
                var zrr=[];
                $("#"+arr).find('.s-s-l-sp-list li,.s-s-l-pp-list li').each(function(i) {
                    if($("#"+arr).find('.s-s-l-sp-list li,.s-s-l-pp-list li').eq(i).hasClass('act')){
                        zrr.push($("#"+arr).find('.s-s-l-sp-list li,.s-s-l-pp-list li').eq(i).attr("val"));
                    }
                });
                idlist=zrr.join(",");
            }else{
                return false;
            }
            //console.log(idlist)
            if(arr=='brand'){//品牌
                $scope.shopl($scope.arr,$scope.brr,1,$scope.drr,$scope.err,idlist,$scope.grr,$scope.hrr,$scope.irr,$scope.jrr,$scope.krr)
            }else if(arr=='fenlei'){//分类
                $scope.shopl(idlist,$scope.brr,1,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr,$scope.irr,$scope.jrr,$scope.krr);
            }else if(arr=='activity'){//活动
                $scope.shopl($scope.arr,$scope.brr,1,$scope.drr,$scope.err,$scope.frr,idlist,$scope.hrr,$scope.irr,$scope.jrr,$scope.krr)
            }else if(arr=='service'){//服务
                $scope.shopl($scope.arr,$scope.brr,1,$scope.drr,$scope.err,$scope.frr,$scope.grr,idlist,$scope.irr,$scope.jrr,$scope.krr)
            }else if(arr=='storehouse'){//发货地
                $scope.shopl($scope.arr,$scope.brr,1,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr,idlist,$scope.jrr,$scope.krr)
            }else{
                $scope.alerttxt('暂无该分类')
            }
            $("#"+arr).find('.s-s-l-btn a.dx').removeClass('act');
            $("#"+arr).find('.s-s-l-sp-list li span').removeClass('act');
            $("#"+arr).find('p').hide();
            //品牌
            $("#"+arr).find(".s-s-l-pp-list").stop().animate({scrollTop:0},0);
            $("#"+arr).find('.s-s-l-btn .gd').removeClass('act');
            $("#"+arr).find('.s-s-l-pp-list').removeClass('act')
        }
        //arr:assessment:评价sales:销量 price:价格 brr:asc:升续 desc:降续
        $scope.sortways='0';//初始化
        $scope.sortway=function(arr){
            if(arr=='pc_price'){
                var way='desc';
                if($('.s-l-s-t-l-4of4.act span').hasClass('act')){
                    $('.s-l-s-t-l-4of4.act span').removeClass('act');
                    way='asc';
                }else{
                    $('.s-l-s-t-l-4of4.act span').addClass('act');
                    way='desc';
                }
                $scope.shopl($scope.arr,$scope.brr,1,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr,$scope.irr,arr,way)
            }else{
                if($scope.sortways==arr){
                    return false;
                }else{
                    $scope.sortways=arr;
                }
                $scope.shopl($scope.arr,$scope.brr,1,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr,$scope.irr,arr,'desc')
            }
        }
        //最大最小价格
        $scope.funprice=function(){
            var mon=/^\d+(\.\d{1,2})?$/
            var minprice=$('.s-l-s-t-r-1of4 .minprice').val();
            var maxprice=$('.s-l-s-t-r-1of4 .maxprice').val();
            console.log(minprice+","+maxprice)
            if(!mon.test(minprice)&&minprice!=''){
                $scope.alerttxt('请填写规范的价格');
                return false;
            }else if(!mon.test(maxprice)&&maxprice!=''){
                $scope.alerttxt('请填写规范的价格');
                return false;
            }
            $scope.shopl($scope.arr,$scope.brr,1,minprice,maxprice,$scope.frr,$scope.grr,$scope.hrr,$scope.irr,$scope.jrr,$scope.krr)
        }
        //分页
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.crr||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.shopl($scope.arr,$scope.brr,arr,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr,$scope.irr,$scope.jrr,$scope.krr)
                var anh = $('.shop-l-sorts').offset().top;
                $scope.scrolltop(anh);
            }
        }

        //热门推荐
        $http.post($scope.url+"/swInterfaces.api?getHomeGoods",$.param({
            limit:10,
            page:1,
            goods_id:$location.search()['shopid']?$location.search()['shopid']:0,
            goods_uuid:$location.search()['uuid']?$location.search()['uuid']:'',
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            //console.log(data);
            if(data["status"]=="ok"){
                $scope.recshop=data["data"];
            }else{
                $scope.alerttxt(data['error'])
            }
        })


    })
    //商品列表 试剂 仪器 耗材
    .controller('shoplist',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.navsortshows(1,0);
        $scope.scrolltop(0);
        //商品列表
        $scope.shopl=function(arr,brr,crr,drr,err,frr,grr,hrr,irr,jrr,krr){
            $scope.loading=1;
            $scope.arr=arr;
            $scope.brr=brr;
            $scope.crr=crr;
            $scope.drr=drr;
            $scope.err=err;
            $scope.frr=frr;
            $scope.grr=grr;
            $scope.hrr=hrr;
            $scope.irr=irr;
            $scope.jrr=jrr;
            $scope.krr=krr;
            $http.post($scope.url+"/goodsInterfaces.api?searchGoodsDetailList",$.param({
                goods_uuid:arr,//uuid
                goods_name:brr,//商品名
                page:crr,//页数
                min_pc_price:drr,//最小价格
                max_pc_price:err,//最大价格
                brand_id:frr,//品牌
                activity_id:grr,//活动id
                label_id:hrr,//服务id
                storehouse_name:irr,//发货地--仓库名
                sort:jrr,//assessment:评价sales:销量 price:价格
                sort_way:krr,//升降序in
                limit:40,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $timeout(function(){
                      $scope.loading=3;
                    },800)
                    console.log(arr);
                    $scope.shoplist=data["data"];
                    for(i=0;i<data["data"].length;i++){
                        var imgs=data["data"][i]['goods_imgs'].split(',')
                        data["data"][i]['goods_imgs']=imgs[0];
                    }
                    $scope.shoptotal=data['total'];//总数
                    $scope.pageNum=Math.ceil($scope.shoptotal/40)==0?'1':Math.ceil($scope.shoptotal/40);//总页数
                    $scope.nowpageNum=crr;//当前页
                    $scope.nowpageNum2=crr;//当前页 跳转用
                    $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                    console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页"+$scope.nowpageNum2);//
                }else{
                    $scope.alerttxt(data['error'])
                }
            }).error(function(){
              $scope.loading=2;
            })
        }

        //获取分类
        $scope.shoplistsort=function(arr){
            $http.post($scope.url+"/goodsInterfaces.api?getGoodsClassLevel",$.param({
                parent_id:arr,
                level:1,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.shoplistsorts=data["data"];
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.shoplistsort2=function(arr,index){
            $http.post($scope.url+"/goodsInterfaces.api?getGoodsClassLevel",$.param({
                parent_id:arr,
                level:1,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.shoplistsorts2=data['data']
                    $scope.shoplistsorts[index].sort2=$scope.shoplistsorts2;
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.shoplistsort3=function(arr,index){
            $http.post($scope.url+"/goodsInterfaces.api?getGoodsClassLevel",$.param({
                parent_id:arr,
                level:1,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.shoplistsorts2[index].sort3=data["data"];
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        //获取商品品牌 活动 服务 发货地
        $scope.shoppinpai=function(arr){
            $http.post($scope.url+"/goodsInterfaces.api?getFilterByClass",$.param({
                goods_uuid:arr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.shoppinpais=data["data"];
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        //获取商品分类名
        $scope.getsortname=$location.search()['sortname']?$location.search()['sortname']:'分类';
        //一进来判断
        if($location.search()['uuid']&&$location.search()['goodsname']){
            $scope.shopl($location.search()['uuid'],$location.search()['goodsname'],1,'','','','','','','','')
            $scope.shoplistsort($location.search()['gid']);
            $scope.shoppinpai($location.search()['uuid']);
        }else if($location.search()['uuid']){
            $scope.shopl($location.search()['uuid'],'',1,'','','','','','','','')
            $scope.shoplistsort($location.search()['gid']);
            $scope.shoppinpai($location.search()['uuid']);
        }else if($location.search()['goodsname']){
            $scope.shopl('',$location.search()['goodsname'],1,'','','','','','','','');
            $scope.shoplistsort('-1');
            $scope.shoppinpai('');
        }else{
            $scope.shopl('','',1,'','','','','','','','');
            $scope.shoplistsort('-1');
            $scope.shoppinpai('');
        }
        //单击。
        $scope.ssclicks=function(arr,brr){
            if($("#"+arr).find('.dx').hasClass('act')){
                return false;
            }
            if(arr=='brand'){//品牌
                $scope.shopl($scope.arr,$scope.brr,1,$scope.drr,$scope.err,brr,$scope.grr,$scope.hrr,$scope.irr,$scope.jrr,$scope.krr)
            }else if(arr=='fenlei'){//分类
                if(brr==''){
                  $scope.shopl($location.search()['uuid']?$location.search()['uuid']:'',$scope.brr,1,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr,$scope.irr,$scope.jrr,$scope.krr);
                }else{
                  $scope.shopl(brr,$scope.brr,1,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr,$scope.irr,$scope.jrr,$scope.krr);
                }
            }else if(arr=='activity'){//活动
                $scope.shopl($scope.arr,$scope.brr,1,$scope.drr,$scope.err,$scope.frr,brr,$scope.hrr,$scope.irr,$scope.jrr,$scope.krr);
            }else if(arr=='service'){//服务
                $scope.shopl($scope.arr,$scope.brr,1,$scope.drr,$scope.err,$scope.frr,$scope.grr,brr,$scope.irr,$scope.jrr,$scope.krr)
            }else if(arr=='storehouse'){//发货地
                $scope.shopl($scope.arr,$scope.brr,1,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr,brr,$scope.jrr,$scope.krr)
            }else{
                $scope.alerttxt('暂无该分类')
            }
        }
        //确认
        $scope.dbclicks=function(arr){
            var idlist='';//初始化选中的id集合
            if($("#"+arr).find('.dx').hasClass('act')){
                idlist="";
                var zrr=[];
                $("#"+arr).find('.s-s-l-sp-list li,.s-s-l-pp-list li').each(function(i) {
                    if($("#"+arr).find('.s-s-l-sp-list li,.s-s-l-pp-list li').eq(i).hasClass('act')){
                        zrr.push($("#"+arr).find('.s-s-l-sp-list li,.s-s-l-pp-list li').eq(i).attr("val"));
                    }
                });
                idlist=zrr.join(",");
            }else{
                return false;
            }
            //console.log(idlist)
            if(arr=='brand'){//品牌
                $scope.shopl($scope.arr,$scope.brr,1,$scope.drr,$scope.err,idlist,$scope.grr,$scope.hrr,$scope.irr,$scope.jrr,$scope.krr)
            }else if(arr=='fenlei'){//分类
                $scope.shopl(idlist,$scope.brr,1,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr,$scope.irr,$scope.jrr,$scope.krr);
            }else if(arr=='activity'){//活动
                $scope.shopl($scope.arr,$scope.brr,1,$scope.drr,$scope.err,$scope.frr,idlist,$scope.hrr,$scope.irr,$scope.jrr,$scope.krr)
            }else if(arr=='service'){//服务
                $scope.shopl($scope.arr,$scope.brr,1,$scope.drr,$scope.err,$scope.frr,$scope.grr,idlist,$scope.irr,$scope.jrr,$scope.krr)
            }else if(arr=='storehouse'){//发货地
                $scope.shopl($scope.arr,$scope.brr,1,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr,idlist,$scope.jrr,$scope.krr)
            }else{
                $scope.alerttxt('暂无该分类')
            }
            $("#"+arr).find('.s-s-l-btn a.dx').removeClass('act');
            $("#"+arr).find('.s-s-l-sp-list li span').removeClass('act');
            $("#"+arr).find('p').hide();
            //品牌
            $("#"+arr).find(".s-s-l-pp-list").stop().animate({scrollTop:0},0);
            $("#"+arr).find('.s-s-l-btn .gd').removeClass('act');
            $("#"+arr).find('.s-s-l-pp-list').removeClass('act')
        }
        //arr:assessment:评价sales:销量 price:价格 brr:asc:升续 desc:降续
        $scope.sortways='0';//初始化
        $scope.sortway=function(arr){
            if(arr=='pc_price'){
                var way='desc';
                if($('.s-l-s-t-l-4of4.act span').hasClass('act')){
                    $('.s-l-s-t-l-4of4.act span').removeClass('act');
                    way='asc';
                }else{
                    $('.s-l-s-t-l-4of4.act span').addClass('act');
                    way='desc';
                }
                $scope.shopl($scope.arr,$scope.brr,1,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr,$scope.irr,arr,way)
            }else{
                if($scope.sortways==arr){
                    return false;
                }else{
                    $scope.sortways=arr;
                }
                $scope.shopl($scope.arr,$scope.brr,1,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr,$scope.irr,arr,'desc')
            }
        }
        //最大最小价格
        $scope.funprice=function(){
            var mon=/^\d+(\.\d{1,2})?$/
            var minprice=$('.s-l-s-t-r-1of4 .minprice').val();
            var maxprice=$('.s-l-s-t-r-1of4 .maxprice').val();
            console.log(minprice+","+maxprice)
            if(!mon.test(minprice)&&minprice!=''){
                $scope.alerttxt('请填写规范的价格');
                return false;
            }else if(!mon.test(maxprice)&&maxprice!=''){
                $scope.alerttxt('请填写规范的价格');
                return false;
            }
            $scope.shopl($scope.arr,$scope.brr,1,minprice,maxprice,$scope.frr,$scope.grr,$scope.hrr,$scope.irr,$scope.jrr,$scope.krr)
        }
        //分页
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.crr||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.shopl($scope.arr,$scope.brr,arr,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr,$scope.irr,$scope.jrr,$scope.krr)
                var anh = $('.shop-l-sorts').offset().top;
                $scope.scrolltop(anh);
            }
        }

        //热门推荐
        $http.post($scope.url+"/swInterfaces.api?getHomeGoods",$.param({
            limit:10,
            page:1,
            goods_id:$location.search()['shopid']?$location.search()['shopid']:0,
            goods_uuid:$location.search()['uuid']?$location.search()['uuid']:'',
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.recshop=data["data"];
            }else{
                $scope.alerttxt(data['error'])
            }
        })


    })
    //商品列表分类点击-->单击
    .directive("ssClick", [function () {  //
        return{
            link: function (scope, element, attributes) {
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
    .directive("ssClick2", [function () {  //
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
    //商品列表分类点击-->取消
    .directive("ssClick4", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    element.parents('.s-s-list').find('.s-s-l-btn a.dx').removeClass('act');
                    element.parents('.s-s-list').find('.s-s-l-sp-list li,.s-s-l-pp-list li').removeClass('act').find('span').removeClass('act');
                    element.parent('p').hide();
                    //品牌
                    $(".s-s-l-pp-list").stop().animate({scrollTop:0},0);
                    element.parents('.s-s-list').find('.s-s-l-btn .gd').removeClass('act');
                    $('.s-s-l-pp-list').removeClass('act')
                });
            }
        }
    }])
    //商品列表分类点击-->更多
    .directive("ssClick5", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    if(element.hasClass('act')){
                        $(".s-s-l-pp-list").stop().animate({scrollTop:0},0);
                        element.removeClass('act');
                        $('.s-s-l-pp-list').removeClass('act')
                    }else{
                        element.addClass('act');
                        $('.s-s-l-pp-list').addClass('act');
                    }
                });
            }
        }
    }])
    //商品列表分类点击-->地址 or仓库
    .directive("ssClick6", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    if(element.attr('val')==1){
                        element.attr('val',2).text('[切换]');
                        element.siblings('ul').hide()
                    }else{
                        element.attr('val',1).text('[关闭]');
                        element.siblings('ul').show()
                    }

                });
            }
        }
    }])
    //商品列表分类点击-->地址单个
    .directive("ssClick7", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    element.parent('ul').siblings('small').attr('val',2).text('[切换]');
                    element.parent('ul').hide();
                    element.parent('ul').siblings('span').text(element.text())

                });
            }
        }
    }])
    //清空
    .directive("ssClick8", [function () {  //
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    element.parents('.s-s-list').find('.s-s-l-pp-list li,.s-s-l-sp-list li').removeClass('act')
                });
            }
        }
    }])

    //商品详情
    .controller('shop',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore,$sce){
        $scope.navsortshows(1,0);
        $scope.scrolltop(0);
        if(!$location.search()['shopid']){
            $scope.alerttxt('错误的商品，为你跳转至网站首页');
            setTimeout("location.href='index.html#/'",1000);
            return false;
        }
        //商品详情
        $http.post($scope.url+"/goodsInterfaces.api?getOneGoodsDetail",$.param({
               goods_id:$location.search()['shopid'],
               member_id:$cookieStore.get("member_id"),
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
              console.log(data);
              if(data["status"]=="ok"){
                  $scope.count=1;//初始化数量
                  $scope.shopdetails=data["data"];
                  $scope.xqhtml=$sce.trustAsHtml(data['data']['goods_url_content']);
                  $scope.nowprice=$scope.shopdetails.goods_pc_price;//pc价
                  $scope.p_nowprice=$scope.shopdetails.goods_now_price;//手机价
                  //$('.shop-details .s-d-xq').html('').append(data['data']['goods_url_content'])
              }else{
                  $scope.alerttxt(data['error'])
              }
        }).error(function(){
            $scope.alerttxt('错误的信息，为你跳转至网站首页');
            setTimeout("location.href='index.html#/'",1000);
        })
        $scope.selgg=function(){
            var len=$('.s-o-3of5').length;
            var selgg_p=0;
            $(".s-o-3of5").each(function(i) {
                $(".s-o-3of5").eq(i).find('p span').each(function(k) {
                    if($(".s-o-3of5").eq(i).find('p span').eq(k).hasClass('act')){
                        selgg_p=Number(selgg_p)+Number($(".s-o-3of5").eq(i).find('p span').eq(k).attr("price"));
                    }
                })
            })
            $scope.nowprice=Number(selgg_p)+Number($scope.shopdetails.goods_pc_price);
            $scope.p_nowprice=Number(selgg_p)+Number($scope.shopdetails.goods_now_price);
        }
        //商品评价
        $scope.evaluate=function(arr,brr){//状态  页数
            $scope.arr=arr;//状态初始化
            $scope.brr=brr;//页数初始化
            $http.post($scope.url+"/orderInterfaces.api?getOrderAssessments",$.param({
                relation_id:$location.search()['shopid'],
                assessment_type:'goods',
                type:arr,
                page:brr,
                limit:20,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.evaluates=data["data"];
                    $scope.shoptotal=data['total'];//总数
                    $scope.pageNum=Math.ceil($scope.shoptotal/20)==0?'1':Math.ceil($scope.shoptotal/20);//总页数
                    $scope.nowpageNum=brr;//当前页
                    $scope.nowpageNum2=brr;//当前页 跳转用
                    $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                    console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页");//
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.evaluate('',1);
        //分页
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.nowpageNum||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.evaluate($scope.arr,arr);
                var anh = $('.pinjia-box .tit').offset().top;
                $scope.scrolltop(anh);
            }
        }
        //商品详情--收藏专用
        $scope.shopdetail2=function(){
            $http.post($scope.url+"/goodsInterfaces.api?getOneGoodsDetail",$.param({
                   goods_id:$location.search()['shopid'],
                   member_id:$cookieStore.get("member_id"),
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                  console.log(data);
                  if(data["status"]=="ok"){
                      $scope.shopdetails2=data["data"];
                  }else{
                      $scope.alerttxt(data['error'])
                  }
            })
        }
        $scope.shopdetail2();
        $scope.owlCarousel=function(){
            $('#spxqimg').owlCarousel({
                items: 4,
                navigation: true,
                navigationText: ["", ""],
                scrollPerPage: true
            });
        }
        //离开数量焦点判断输入内容是否有误 并纠正
        $scope.blurnum=function(arr){
            var num=/^[1-9]*[1-9][0-9]*$/;
            if(!num.test(arr)){
                $scope.count=1;
            }else if(arr>$scope.shopdetails.goods_stock){
                $scope.count=$scope.shopdetails.goods_stock==0?1:$scope.shopdetails.goods_stock;
            }
        }
        //热门推荐
        $http.post($scope.url+"/swInterfaces.api?getHomeGoods",$.param({
            page:1,
            limit:10,
            goods_id:$location.search()['shopid']?$location.search()['shopid']:0,
            goods_uuid:$location.search()['uuid']?$location.search()['uuid']:'',
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.recshop=data["data"];
            }else{
                $scope.alerttxt(data['error'])
            }
        })
        //猜你喜欢
        $scope.guessyoulike=function(arr){
            if(arr<1||arr>4||arr>$scope.guessyouliketotal){
             return false;
           }
            $http.post($scope.url+"/goodsInterfaces2.api?getLoveGoodsByHabit",$.param({
                member_id:$cookieStore.get("member_id"),
                page:arr,
                limit:5,

            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.guessyoulikes=data["data"];
                    $scope.guessyouliketotal=data['total']
                    $scope.guessyoulikepagenum=Math.ceil($scope.guessyouliketotal/5)==0?'1':Math.ceil($scope.guessyouliketotal/5);//总页数
                    $scope.guessyoulikepage=arr;
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.guessyoulike(1);
        //商品收藏 商家收藏
        $scope.collection=function(arr,brr,crr,drr){//arr判断商品还是商家1商品2商家   brr商品id或商家id crr取消收藏id drr收藏还是取消收藏
            $scope.collection_type;
            if(arr==1){
                $scope.collection_type='goods'
            }else if(arr==2){
                $scope.collection_type='merchants'
            }else{
                $scope.alerttxt('状态出错');
                return false;
            }
            if(drr==0){
                $http.post($scope.url+"/collectionInterfaces.api?insertCollection",$.param({
                    member_id:$cookieStore.get("member_id"),
                    member_token:$cookieStore.get("member_token"),
                    relation_id:brr,
                    collection_type:$scope.collection_type,
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
                ).success(function(data){
                    console.log(data);
                    if(data["status"]=="ok"){
                        //alert('收藏成功');
                        $scope.shopdetail2();
                    }else if (data["status"] == "pending" && data["error"] == "token failed"){
                            $scope.relogin()
                    }else{
                        $scope.alerttxt(data['error'])
                    }
                })
            }else if(drr==1){
                $http.post($scope.url+"/collectionInterfaces.api?cancelCollection",$.param({
                    collection_id:crr,
                    member_id:$cookieStore.get("member_id"),
                    member_token:$cookieStore.get("member_token"),
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
                ).success(function(data){
                    console.log(data);
                    if(data["status"]=="ok"){
                        //alert("取消成功");
                        $scope.shopdetail2();
                    }else if (data["status"] == "pending" && data["error"] == "token failed"){
                        $scope.relogin()
                    }else{
                        $scope.alerttxt(data['error'])
                    }
                })
            }else{
                $scope.alerttxt('你还未登录！');
            }
        }
        //加入购物车
        $scope.shopcart=function(arr,brr,crr){//数量，商品id，商家id
            if($scope.shopdetails.goods_stock==0||$scope.shopdetails.goods_stock<0){
                //$scope.alerttxt('库存不足！');
                return false;
            }
            // console.log(arr+','+brr+','+crr);
            var len=$('.s-o-3of5').length;
            var gglist="";//规格id的集合
            var ggactnum=0;//选中的个数
            if(len==0){
                gglist="";
            }else{
                /*获取选中的规格id*/
                gglist="";
                var grr=[];
                $(".s-o-3of5").each(function(i) {
                    $(".s-o-3of5").eq(i).find('p span').each(function(k) {
                        if($(".s-o-3of5").eq(i).find('p span').eq(k).hasClass('act')){
                            grr.push($(".s-o-3of5").eq(i).find('p span').eq(k).attr("val"));
                            ggactnum++;
                        }
                    })
                });
                gglist=grr.join(",");
            }
            //console.log(gglist+","+ggactnum);
            if(ggactnum!=len){
                $scope.alerttxt('请选择规格');
                return false;
            }
            console.log(arr+','+brr+','+crr);
            //加入购物车-->上传数据
            $http.post($scope.url+"/shoppingCarInterfaces.api?insertShoppingCar",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                goods_id:brr,
                goods_num:arr,
                merchants_id:crr,
                car_type:"goods",
                goods_parameters:gglist,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $('.gogwc').show();
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.jxgg=function(){
            $('.gogwc').hide();
        }
    })
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
    //选择规格
    // .directive("selgg", function () {
    //     return{
    //         restrict:'A',
    //         scope:true,
    //         controller:'shop',
    //         link: function (scope, element, attributes) {
    //             element.click(function () {
    //                 //console.log(scope.shopdetails.goods_pc_price)shopdetails.goods_now_price
    //                 element.addClass("act");
    //                 element.siblings().removeClass("act");
    //                 scope.nowprice=Number(element.attr('price'))+Number(scope.shopdetails.goods_pc_price);
    //                 console.log(scope.nowprice);
    //                 //scope.$apply();
    //             });
    //         }
    //     }
    // })
    //选择的img加上选中效果 并把当前的src赋予大图
    .directive("shopimg", [function () {
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    element.parent('.owl-item').siblings().find('li').removeClass("act");
                    element.addClass("act");
                    $(".spxq-img-big img").attr("src",element.find("img").attr("src"))
                });
            }
        }
    }])
    .directive("dbclick", [function () {
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
    .directive("spxqtab", [function () {  //  tab
        return{
            link: function (scope, element, attributes) {
                element.click(function () {
                    element.siblings('span').removeClass("act")
                    element.addClass("act");
                    element.parent('.tit').siblings('.sd').hide();
                    element.parent('.tit').siblings('.sd').eq(element.index()).show()
                });
            }
        }
    }])
    //猜你喜欢
    .controller('guess',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
       $scope.navsortshows(1,0);
       $scope.scrolltop(0);
       //获取商品品牌 活动 服务 发货地
        $scope.shoppinpai=function(arr){
            $http.post($scope.url+"/goodsInterfaces.api?getFilterByClass",$.param({
                goods_uuid:arr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.shoppinpais=data["data"];
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.shoppinpai('');
       //获取分类
        $scope.guesslike=function(arr,brr){
            $http.post($scope.url+"/goodsInterfaces2.api?getLoveClassByHabit",$.param({
                level:arr,
                parent_id:brr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.guesslikes=data["data"];
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.guesslike(1,-1);
        $scope.guesslike2=function(arr,brr,index){
            $http.post($scope.url+"/goodsInterfaces2.api?getLoveClassByHabit",$.param({
                level:arr,
                parent_id:brr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.guesslike2s=data['data']
                    $scope.guesslikes[index].sort2=$scope.guesslike2s;
                    console.log($scope.guesslikes)
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.guesslike3=function(arr,brr,index){
            $http.post($scope.url+"/goodsInterfaces2.api?getLoveClassByHabit",$.param({
                level:arr,
                parent_id:brr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.guesslike2s[index].sort3=data["data"];
                    console.log($scope.guesslikes)
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }

        //获取商品数据
        $scope.guesslikeshop=function(arr,brr,crr,drr,err){
            $scope.loading=1;
            $scope.arr=arr;
            $scope.brr=brr;
            $scope.crr=crr;
            $scope.drr=drr;
            $scope.err=err;
            $http.post($scope.url+"/goodsInterfaces2.api?getLoveGoodsByHabit",$.param({
                member_id:$cookieStore.get("member_id"),
                goods_uuid:arr,
                page:brr,
                brand_id:crr,//品牌
                activity_id:drr,//活动id
                label_id:err,//服务id
                limit:40,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $timeout(function(){
                      $scope.loading=3;
                    },800)
                    $scope.guesslikeshops=data["data"];
                    $scope.shoptotal=data['total'];//总数
                    $scope.pageNum=Math.ceil($scope.shoptotal/40)==0?'1':Math.ceil($scope.shoptotal/40);//总页数
                    $scope.nowpageNum=brr;//当前页
                    $scope.nowpageNum2=brr;//当前页 跳转用
                    $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                    console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页");//
                }else{
                    $scope.alerttxt(data['error']);
                }
            }).error(function(){
                $scope.loading=2;
            })
        }
        $scope.guesslikeshop('',1,'','','')
        //分页
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.brr||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.guesslikeshop($scope.arr,arr,$scope.crr,$scope.drr,$scope.err)
                $scope.scrolltop(0);
            }
        }
        //单击。
        $scope.ssclicks=function(arr,brr){
            if($("#"+arr).find('.dx').hasClass('act')){
                return false;
            }
            if(arr=='brand'){//品牌
                $scope.guesslikeshop($scope.arr,1,brr,$scope.drr,$scope.err)
            }else if(arr=='fenlei'){//分类
                $scope.guesslikeshop(brr,1,$scope.crr,$scope.drr,$scope.err)
            }else if(arr=='activity'){//活动
                $scope.guesslikeshop($scope.arr,1,$scope.crr,brr,$scope.err)
            }else if(arr=='service'){//服务
                $scope.guesslikeshop($scope.arr,1,$scope.crr,$scope.drr,brr)
            }else if(arr=='storehouse'){//发货地
                $scope.guesslikeshop($scope.arr,1,$scope.crr,$scope.drr,$scope.err)
            }else{
                $scope.guesslikeshop($scope.arr,1,$scope.crr,$scope.drr,$scope.err)
            }
        }
        //确认
        $scope.dbclicks=function(arr){
            var idlist='';//初始化选中的id集合
            if($("#"+arr).find('.dx').hasClass('act')){
                idlist="";
                var zrr=[];
                $("#"+arr).find('.s-s-l-sp-list li,.s-s-l-pp-list li').each(function(i) {
                    if($("#"+arr).find('.s-s-l-sp-list li,.s-s-l-pp-list li').eq(i).hasClass('act')){
                        zrr.push($("#"+arr).find('.s-s-l-sp-list li,.s-s-l-pp-list li').eq(i).attr("val"));
                    }
                });
                idlist=zrr.join(",");
            }else{
                return false;
            }
            //console.log(idlist)
            if(arr=='brand'){//品牌
                $scope.guesslikeshop($scope.arr,1,idlist,$scope.drr,$scope.err)
            }else if(arr=='fenlei'){//分类
                $scope.guesslikeshop(idlist,1,$scope.crr,$scope.drr,$scope.err)
            }else if(arr=='activity'){//活动
                $scope.guesslikeshop($scope.arr,1,$scope.crr,idlist,$scope.err)
            }else if(arr=='service'){//服务
                $scope.guesslikeshop($scope.arr,1,$scope.crr,$scope.drr,idlist)
            }else if(arr=='storehouse'){//发货地
                $scope.guesslikeshop($scope.arr,1,$scope.crr,$scope.drr,$scope.err)
            }else{
                $scope.guesslikeshop($scope.arr,1,$scope.crr,$scope.drr,$scope.err)
            }
            $("#"+arr).find('.s-s-l-btn a.dx').removeClass('act');
            $("#"+arr).find('.s-s-l-sp-list li span').removeClass('act');
            $("#"+arr).find('p').hide();
            //品牌
            $("#"+arr).find(".s-s-l-pp-list").stop().animate({scrollTop:0},0);
            $("#"+arr).find('.s-s-l-btn .gd').removeClass('act');
            $("#"+arr).find('.s-s-l-pp-list').removeClass('act')
        }



    })
    //发现好货
    .controller('fxhh',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.navsortshows(1,0);
        $scope.scrolltop(0);
        //exact:精选 album:专辑
        $scope.zjtab=1;//专辑tab切换依据
        $scope.fxhhlist=function(arr,brr){ //  exact:精选 album:专辑  brr:页数
           $scope.loading=1;
           $scope.arr=arr;//
           $scope.brr=brr;//
           if(arr=='exact'){
                $scope.zjtab=1;
                $http.post($scope.url+"/swInterfaces.api?getGoodGoodss",$.param({
                    type:arr,
                    page:brr,
                    limit:40,

                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
                ).success(function(data){
                    console.log(data);
                    if(data["status"]=="ok"){
                        $timeout(function(){
                          $scope.loading=3;
                        },800)
                        $scope.fxhhshop=data['data'];
                        $scope.shoptotal=data['total'];//总数
                        $scope.pageNum=Math.ceil($scope.shoptotal/40)==0?'1':Math.ceil($scope.shoptotal/40);//总页数
                        $scope.nowpageNum=brr;//当前页
                        $scope.nowpageNum2=brr;//当前页 跳转用
                        $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                        console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页");//
                    }else if (data["status"] == "pending" && data["error"] == "token failed"){
                        $scope.relogin()
                    }else{
                        $scope.alerttxt(data['error'])
                    }
                }).error(function(){
                    $scope.loading=2;
                })
           }else if(arr=='album'){
                $scope.zjtab=2;
                 $http.post($scope.url+"/swInterfaces.api?getAlbums",$.param({
                    page:brr,
                    limit:20,
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
                ).success(function(data){
                    console.log(data);
                    if(data["status"]=="ok"){
                        $timeout(function(){
                          $scope.loading=3;
                        },800)
                        $scope.fxhhzj=data['data'];
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
                }).error(function(){
                    $scope.loading=2;
                })
           }else{

           }
        }
        $scope.fxhhlist('exact',1);
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.brr||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.fxhhlist($scope.arr,arr)
                $scope.scrolltop(0);
            }
        }

    })
    //专辑详情
    .controller('zjxq',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.navsortshows(1,0);
        $scope.scrolltop(0);
        //获取商品品牌 活动 服务 发货地
        $scope.shoppinpai=function(arr){
            $http.post($scope.url+"/goodsInterfaces.api?getFilterByClass",$.param({
                goods_uuid:arr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.shoppinpais=data["data"];
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.shoppinpai('');
        //
        $scope.zjxqlist=function(arr,brr,crr,drr){
            $scope.loading=1;
            $scope.arr=arr;
            $scope.brr=brr;
            $scope.crr=crr;
            $scope.drr=drr;
            $http.post($scope.url+"/swInterfaces.api?getGoodGoodss",$.param({
                type:'album',
                page:arr,
                album_id:$location.search()['zid'],
                brand_id:brr,//品牌
                activity_id:crr,//活动id
                label_id:drr,//服务id
                limit:40,

            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $timeout(function(){
                      $scope.loading=3;
                    },800)
                    $scope.zjxqlists=data['data'];
                    $scope.shoptotal=data['total'];//总数
                    $scope.pageNum=Math.ceil($scope.shoptotal/40)==0?'1':Math.ceil($scope.shoptotal/40);//总页数
                    $scope.nowpageNum=arr;//当前页
                    $scope.nowpageNum2=arr;//当前页 跳转用
                    $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                    console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页"+$scope.nowpageNum2);//
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            }).error(function(){
                $scope.loading=2;
            })
        }
        $scope.zjxqlist(1,'','','');
        //分页
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.crr||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.zjxqlist(arr,$scope.brr,$scope.crr,$scope.drr)
                $scope.scrolltop(0);
            }
        }
        //单击。
        $scope.ssclicks=function(arr,brr){
            if($("#"+arr).find('.dx').hasClass('act')){
                return false;
            }
            if(arr=='brand'){//品牌
                $scope.zjxqlist(1,brr,$scope.crr,$scope.drr)
            }else if(arr=='fenlei'){//分类
                $scope.zjxqlist(1,$scope.brr,$scope.crr,$scope.drr)
            }else if(arr=='activity'){//活动
                $scope.zjxqlist(1,$scope.brr,brr,$scope.drr)
            }else if(arr=='service'){//服务
                $scope.zjxqlist(1,$scope.brr,$scope.crr,brr)
            }else if(arr=='storehouse'){//发货地
                $scope.zjxqlist(1,$scope.brr,$scope.crr,$scope.drr)
            }else{
                $scope.zjxqlist(1,$scope.brr,$scope.crr,$scope.drr)
            }
        }
        //确认
        $scope.dbclicks=function(arr){
            var idlist='';//初始化选中的id集合
            if($("#"+arr).find('.dx').hasClass('act')){
                idlist="";
                var zrr=[];
                $("#"+arr).find('.s-s-l-sp-list li,.s-s-l-pp-list li').each(function(i) {
                    if($("#"+arr).find('.s-s-l-sp-list li,.s-s-l-pp-list li').eq(i).hasClass('act')){
                        zrr.push($("#"+arr).find('.s-s-l-sp-list li,.s-s-l-pp-list li').eq(i).attr("val"));
                    }
                });
                idlist=zrr.join(",");
            }else{
                return false;
            }
            //console.log(idlist)
            if(arr=='brand'){//品牌
                $scope.zjxqlist(1,idlist,$scope.crr,$scope.drr)
            }else if(arr=='fenlei'){//分类
                $scope.zjxqlist(1,$scope.brr,$scope.crr,$scope.drr)
            }else if(arr=='activity'){//活动
                $scope.zjxqlist(1,$scope.brr,idlist,$scope.drr)
            }else if(arr=='service'){//服务
                $scope.zjxqlist(1,$scope.brr,$scope.crr,idlist)
            }else if(arr=='storehouse'){//发货地
                $scope.zjxqlist(1,$scope.brr,$scope.crr,$scope.drr)
            }else{
                $scope.zjxqlist(1,$scope.brr,$scope.crr,$scope.drr)
            }
            $("#"+arr).find('.s-s-l-btn a.dx').removeClass('act');
            $("#"+arr).find('.s-s-l-sp-list li span').removeClass('act');
            $("#"+arr).find('p').hide();
            //品牌
            $("#"+arr).find(".s-s-l-pp-list").stop().animate({scrollTop:0},0);
            $("#"+arr).find('.s-s-l-btn .gd').removeClass('act');
            $("#"+arr).find('.s-s-l-pp-list').removeClass('act')
        }

    })
    //店铺头条
    .controller('dptt',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.navsortshows(1,0);
        $scope.scrolltop(0);

        //hot:热门 dynamic：动态
        $scope.delshow=1;
        $scope.hotdp=function(arr,brr){ //hot:热门 dynamic：动态  brr:页数
            $scope.arr=arr;
            $scope.brr=brr;
            if(arr=='dynamic'){
                $scope.delshow=1;
            }else if(arr=='hot'){
                $scope.delshow=2;
            }else{
                $scope.delshow=1;
            }
            $http.post($scope.url+"/swInterfaces.api?getHeadlinesMerchants",$.param({
                member_id:$cookieStore.get("member_id"),
                type:arr,
                page:brr,
                limit:20,

            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.hotdps=data['data'];
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
        }
        $scope.hotdp('dynamic',1);
        //分页
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.brr||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.hotdp($scope.arr,arr)
                $scope.scrolltop(0);
            }
        }
        //叉掉
        $scope.dpttdel=function(arr){
            $http.post($scope.url+"/swInterfaces.api?memberCloseDynamicHeadlines",$.param({
                merchants_id:arr,
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $("#m"+arr).hide();
                    //$scope.alerttxt("取消成功");
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        //收藏
        $scope.dpsc=function(arr,brr,crr){//id  收藏id  收藏还是取消收藏
            console.log(arr+","+brr+","+crr)
            if(crr==1){//取消收藏
                $http.post($scope.url+"/collectionInterfaces.api?cancelCollection",$.param({
                    collection_id:brr,
                    member_id:$cookieStore.get("member_id"),
                    member_token:$cookieStore.get("member_token"),
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
                ).success(function(data){
                    console.log(data);
                    if(data["status"]=="ok"){
                        $scope.alerttxt("取消成功");
                        $scope.hotdp($scope.arr,$scope.brr);
                    }else if (data["status"] == "pending" && data["error"] == "token failed"){
                        $scope.relogin()
                    }else{
                        $scope.alerttxt(data['error'])
                    }
                })
            }else{//收藏
                $http.post($scope.url+"/collectionInterfaces.api?insertCollection",$.param({
                    member_id:$cookieStore.get("member_id"),
                    member_token:$cookieStore.get("member_token"),
                    relation_id:arr,
                    collection_type:'merchants',
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
                ).success(function(data){
                    console.log(data);
                    if(data["status"]=="ok"){
                        $scope.alerttxt('收藏成功');
                        $scope.hotdp($scope.arr,$scope.brr);
                    }else if (data["status"] == "pending" && data["error"] == "token failed"){
                            $scope.relogin()
                    }else{
                        $scope.alerttxt(data['error'])
                    }
                })
            }
        }


    })
    //搜索商家
    .controller('sssj',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
       $scope.navsortshows(1,0);
       $scope.scrolltop(0);
       $scope.sssjlists=function(brr){
          $http.post($scope.url+"/merchantsInterfaces.api?searchMerchants",$.param({
                merchants_name:$location.search()['merchantname']?$location.search()['merchantname']:'',
                page:brr,
                limit:10,

            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.hotdps=data['data'];
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
       $scope.sssjlists(1);
       //分页
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.brr||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.sssjlists(arr);
                $scope.scrolltop(0);
            }
        }

    })
    //品牌馆
    .controller('pplist',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.navsortshows(1,0);
        $scope.scrolltop(0);
        //获取分类
        $scope.pinpaisort=function(arr,brr){
            $http.post($scope.url+"/goodsInterfaces.api?getClassByBrand",$.param({
                brand_id:'',
                level:arr,
                parent_id:brr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.pinpaisorts=data["data"];
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.pinpaisort(1,-1);
        $scope.pinpaisort2=function(arr,brr,index){
            $http.post($scope.url+"/goodsInterfaces.api?getClassByBrand",$.param({
                brand_id:'',
                level:arr,
                parent_id:brr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.pinpaisort2s=data['data']
                    $scope.pinpaisorts[index].sort2=$scope.pinpaisort2s;
                    console.log($scope.pinpaisorts)
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.pinpaisort3=function(arr,brr,index){
            $http.post($scope.url+"/goodsInterfaces.api?getClassByBrand",$.param({
                brand_id:'',
                level:arr,
                parent_id:brr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.pinpaisort2s[index].sort3=data["data"];
                    console.log($scope.pinpaisorts)
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        //获取商品品牌 活动 服务 发货地
        $scope.shoppinpai=function(arr){
            $http.post($scope.url+"/goodsInterfaces.api?getFilterByClass",$.param({
                goods_uuid:arr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.shoppinpais=data["data"];
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.shoppinpai('')

    })
    //品牌
    .controller('pinpai',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.navsortshows(1,0);
        $scope.scrolltop(0);
        //获取商品品牌 活动 服务 发货地
        $scope.shoppinpai=function(arr){
            $http.post($scope.url+"/goodsInterfaces.api?getFilterByClass",$.param({
                goods_uuid:arr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.shoppinpais=data["data"];
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.shoppinpai('');
        //获取分类
        $scope.pinpaisort=function(arr,brr){
            $http.post($scope.url+"/goodsInterfaces.api?getClassByBrand",$.param({
                brand_id:$location.search()['bid'],
                level:arr,
                parent_id:brr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.pinpaisorts=data["data"];
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.pinpaisort(1,-1);
        $scope.pinpaisort2=function(arr,brr,index){
            $http.post($scope.url+"/goodsInterfaces.api?getClassByBrand",$.param({
                brand_id:$location.search()['bid'],
                level:arr,
                parent_id:brr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.pinpaisort2s=data['data']
                    $scope.pinpaisorts[index].sort2=$scope.pinpaisort2s;
                    console.log($scope.pinpaisorts)
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.pinpaisort3=function(arr,brr,index){
            $http.post($scope.url+"/goodsInterfaces.api?getClassByBrand",$.param({
                brand_id:$location.search()['bid'],
                level:arr,
                parent_id:brr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.pinpaisort2s[index].sort3=data["data"];
                    console.log($scope.pinpaisorts)
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        //获取品牌详情
        $http.post($scope.url+"/goodsInterfaces.api?getBrandDetail",$.param({
            brand_id:$location.search()['bid'],
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.pinpaidetails=data["data"];
            }else{
                $scope.alerttxt(data['error'])
            }
        })

        //获取商品列表
        $scope.pinpaishop=function(arr,brr,crr,drr,err,frr,grr,hrr){
            $scope.loading=1;
            $scope.arr=arr;
            $scope.brr=brr;
            $scope.crr=crr;
            $scope.drr=drr;
            $scope.err=err;
            $scope.frr=frr;
            $scope.grr=grr;
            $scope.hrr=hrr;
            $http.post($scope.url+"/goodsInterfaces.api?searchGoodsDetailList",$.param({
                goods_uuid:arr,
                page:brr,
                brand_id:$location.search()['bid'],
                limit:40,
                min_pc_price:crr,//最小价格
                max_pc_price:drr,//最大价格
                sort:err,//assessment:评价sales:销量 price:价格
                sort_way:frr,//升降序in
                activity_id:grr,//活动id
                label_id:hrr,//服务id
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $timeout(function(){
                      $scope.loading=3;
                    },800)
                    $scope.pinpaishops=data["data"];
                    $scope.shoptotal=data['total'];//总数
                    $scope.pageNum=Math.ceil($scope.shoptotal/40)==0?'1':Math.ceil($scope.shoptotal/40);//总页数
                    $scope.nowpageNum=brr;//当前页
                    $scope.nowpageNum2=brr;//当前页 跳转用
                    $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                    console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页");//
                }else{
                    $scope.alerttxt(data['error']);
                }
            }).error(function(){
                $scope.loading=2;
            })
        }
        $scope.pinpaishop('',1,'','','','','','');
        //单击。
        $scope.ssclicks=function(arr,brr){
            if($("#"+arr).find('.dx').hasClass('act')){
                return false;
            }
            if(arr=='brand'){//品牌
                $scope.pinpaishop($scope.arr,1,$scope.crr,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr)
            }else if(arr=='fenlei'){//分类
                $scope.pinpaishop(brr,1,$scope.crr,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr)
            }else if(arr=='activity'){//活动
                $scope.pinpaishop($scope.arr,1,$scope.crr,$scope.drr,$scope.err,$scope.frr,brr,$scope.hrr)
            }else if(arr=='service'){//服务
                $scope.pinpaishop($scope.arr,1,$scope.crr,$scope.drr,$scope.err,$scope.frr,$scope.grr,brr)
            }else if(arr=='storehouse'){//发货地
                $scope.pinpaishop($scope.arr,1,$scope.crr,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr)
            }else{
                $scope.pinpaishop($scope.arr,1,$scope.crr,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr)
            }
        }
        //确认
        $scope.dbclicks=function(arr){
            var idlist='';//初始化选中的id集合
            if($("#"+arr).find('.dx').hasClass('act')){
                idlist="";
                var zrr=[];
                $("#"+arr).find('.s-s-l-sp-list li,.s-s-l-pp-list li').each(function(i) {
                    if($("#"+arr).find('.s-s-l-sp-list li,.s-s-l-pp-list li').eq(i).hasClass('act')){
                        zrr.push($("#"+arr).find('.s-s-l-sp-list li,.s-s-l-pp-list li').eq(i).attr("val"));
                    }
                });
                idlist=zrr.join(",");
            }else{
                return false;
            }
            //console.log(idlist)
            if(arr=='brand'){//品牌
                $scope.pinpaishop($scope.arr,1,$scope.crr,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr)
            }else if(arr=='fenlei'){//分类
                $scope.pinpaishop($scope.arr,1,$scope.crr,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr)
            }else if(arr=='activity'){//活动
                $scope.pinpaishop($scope.arr,1,$scope.crr,$scope.drr,$scope.err,$scope.frr,idlist,$scope.hrr)
            }else if(arr=='service'){//服务
                $scope.pinpaishop($scope.arr,1,$scope.crr,$scope.drr,$scope.err,$scope.frr,$scope.grr,idlist)
            }else if(arr=='storehouse'){//发货地
                $scope.pinpaishop($scope.arr,1,$scope.crr,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr)
            }else{
                $scope.pinpaishop($scope.arr,1,$scope.crr,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr)
            }
            $("#"+arr).find('.s-s-l-btn a.dx').removeClass('act');
            $("#"+arr).find('.s-s-l-sp-list li span').removeClass('act');
            $("#"+arr).find('p').hide();
            //品牌
            $("#"+arr).find(".s-s-l-pp-list").stop().animate({scrollTop:0},0);
            $("#"+arr).find('.s-s-l-btn .gd').removeClass('act');
            $("#"+arr).find('.s-s-l-pp-list').removeClass('act')
        }
        //arr:assessment:评价sales:销量 price:价格 brr:asc:升续 desc:降续
        $scope.sortways='0';//初始化
        $scope.sortway=function(arr){
            if(arr=='pc_price'){
                var way='desc';
                if($('.s-l-s-t-l-4of4.act span').hasClass('act')){
                    $('.s-l-s-t-l-4of4.act span').removeClass('act');
                    way='asc';
                }else{
                    $('.s-l-s-t-l-4of4.act span').addClass('act');
                    way='desc';
                }
                $scope.pinpaishop($scope.arr,1,$scope.crr,$scope.drr,arr,way,$scope.grr,$scope.hrr);
            }else{
                if($scope.sortways==arr){
                    return false;
                }else{
                    $scope.sortways=arr;
                }
                $scope.pinpaishop($scope.arr,1,$scope.crr,$scope.drr,arr,'desc',$scope.grr,$scope.hrr);
            }
        }
        //最大最小价格
        $scope.funprice=function(){
            var mon=/^\d+(\.\d{1,2})?$/
            var minprice=$('.s-l-s-t-r-1of4 .minprice').val();
            var maxprice=$('.s-l-s-t-r-1of4 .maxprice').val();
            console.log(minprice+","+maxprice)
            if(!mon.test(minprice)&&minprice!=''){
                $scope.alerttxt('请填写规范的价格');
                return false;
            }else if(!mon.test(maxprice)&&maxprice!=''){
                $scope.alerttxt('请填写规范的价格');
                return false;
            }
            $scope.pinpaishop($scope.arr,1,minprice,maxprice,$scope.err,$scope.frr,$scope.grr,$scope.hrr);
        }
        //分页
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.brr||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.pinpaishop($scope.arr,arr,$scope.crr,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr);
                var anh=$('.main-rightbox').offset().top;
                $scope.scrolltop(anh);
            }
        }
    })
    //热门折扣
    .controller('hotzk',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.navsortshows(1,0);
        $scope.scrolltop(0);
        //获取分类
        $http.post($scope.url+"/rankingInterfaces.api?getDiscountRankingClass",$.param({

        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.hotzksort=data["data"];
            }else{
                $scope.alerttxt(data['error'])
            }
        })
        //获取商品列表
        $scope.hotzk=function(arr,brr){
            $scope.loading=1;
            $scope.arr=arr;//
            $scope.brr=brr;//
            $http.post($scope.url+"/rankingInterfaces.api?getDiscountRanking",$.param({
                goods_uuid:arr,
                page:brr,
                limit:40,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $timeout(function(){
                      $scope.loading=3;
                    },800)
                    $scope.hotzks=data["data"];
                    $scope.shoptotal=data['total'];//总数
                    $scope.pageNum=Math.ceil($scope.shoptotal/40)==0?'1':Math.ceil($scope.shoptotal/40);//总页数
                    $scope.nowpageNum=brr;//当前页
                    $scope.nowpageNum2=brr;//当前页 跳转用
                    $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                    console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页");//
                }else{
                    $scope.alerttxt(data['error'])
                }
            }).error(function(){
                $scope.loading=2;
            })
        }
        $scope.hotzk('',1);
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.brr||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.hotzk($scope.arr,arr)
                $scope.scrolltop(0);
            }
        }

    })
    //热门商品
    .controller('hotshop',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.navsortshows(1,0);
        $scope.scrolltop(0);
        //获取分类
        $http.post($scope.url+"/rankingInterfaces.api?getSalesRankingClass",$.param({

        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.hotshopsort=data["data"];
            }else{
                $scope.alerttxt(data['error'])
            }
        })
        //获取商品列表
        $scope.hotshop=function(arr,brr){
            $scope.loading=1;
            $scope.arr=arr;
            $cookieStore.put("brr",brr)
            $http.post($scope.url+"/rankingInterfaces.api?getSalesRanking",$.param({
                goods_uuid:arr,
                page:brr,
                limit:40,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $timeout(function(){
                      $scope.loading=3;
                    },800)
                    $scope.hotshops=data["data"];
                    $scope.shoptotal=data['total'];//总数
                    $scope.pageNum=Math.ceil($scope.shoptotal/40)==0?'1':Math.ceil($scope.shoptotal/40);//总页数
                    $scope.nowpageNum=brr;//当前页
                    $scope.nowpageNum2=brr;//当前页 跳转用
                    $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                    console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页");//
                }else{
                    $scope.alerttxt(data['error'])
                }
            }).error(function(){
                $scope.loading=2;
            })
        }
        $scope.hotshop('',1)
        //分页
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.brr||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.hotshop($scope.arr,arr)
                $scope.scrolltop(0);
            }
        }

    })
    //热门活动
    .controller('hothd',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.navsortshows(1,0);
        $scope.scrolltop(0);
        $scope.hothds=function(arr){
            $http.post($scope.url+"/rankingInterfaces.api?getHotActivitys",$.param({
                page:arr,
                limit:20,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.hothdlist=data["data"];
                    $scope.shoptotal=data['total'];//总数
                    $scope.pageNum=Math.ceil($scope.shoptotal/20)==0?'1':Math.ceil($scope.shoptotal/20);//总页数
                    $scope.nowpageNum=arr;//当前页
                    $scope.nowpageNum2=arr;//当前页 跳转用
                    $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                    console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页");//
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.hothds(1)

        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.nowpageNum||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.hothds(arr)
                $scope.scrolltop(0);
            }
        }

    })
    //活动列表
    .controller('hdlist',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.navsortshows(1,0);
        $scope.scrolltop(0);
        $scope.hdname=$location.search()['hdname']?$location.search()['hdname']:'活动';


        //获取商品品牌 活动 服务 发货地
        $scope.shoppinpai=function(arr){
            $http.post($scope.url+"/goodsInterfaces.api?getFilterByClass",$.param({
                goods_uuid:arr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.shoppinpais=data["data"];
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.shoppinpai('');
       //获取分类
        $scope.guesslike=function(arr,brr){
            $http.post($scope.url+"/activityInterfaces.api?getActivityClass",$.param({
                level:arr,
                parent_id:brr,
                activity_id:$location.search()['hdid'],
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.guesslikes=data["data"];
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.guesslike(1,-1);
        $scope.guesslike2=function(arr,brr,index){
            $http.post($scope.url+"/activityInterfaces.api?getActivityClass",$.param({
                level:arr,
                parent_id:brr,
                activity_id:$location.search()['hdid'],
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.guesslike2s=data['data']
                    $scope.guesslikes[index].sort2=$scope.guesslike2s;
                    console.log($scope.guesslikes)
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.guesslike3=function(arr,brr,index){
            $http.post($scope.url+"/activityInterfaces.api?getActivityClass",$.param({
                level:arr,
                parent_id:brr,
                activity_id:$location.search()['hdid'],
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.guesslike2s[index].sort3=data["data"];
                    console.log($scope.guesslikes)
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }

        //获取商品数据
        $scope.guesslikeshop=function(arr,brr,crr,drr,err){
            $scope.loading=1;
            $scope.arr=arr;
            $scope.brr=brr;
            $scope.crr=crr;
            $scope.drr=drr;
            $scope.err=err;
            $http.post($scope.url+"/activityInterfaces.api?getActivityGoods",$.param({
                goods_uuid:arr,
                page:brr,
                brand_id:crr,//品牌
                activity_id:$location.search()['hdid'],//活动id
                label_id:err,//服务id
                limit:20,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $timeout(function(){
                      $scope.loading=3;
                    },800)
                    $scope.guesslikeshops=data["data"];
                    $scope.shoptotal=data['total'];//总数
                    $scope.pageNum=Math.ceil($scope.shoptotal/20)==0?'1':Math.ceil($scope.shoptotal/20);//总页数
                    $scope.nowpageNum=brr;//当前页
                    $scope.nowpageNum2=brr;//当前页 跳转用
                    $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                    console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页");//
                }else{
                    $scope.alerttxt(data['error']);
                }
            }).error(function(){
                $scope.loading=2;
            })
        }
        $scope.guesslikeshop('',1,'','','')
        //分页
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.brr||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.guesslikeshop($scope.arr,arr,$scope.crr,$scope.drr,$scope.err)
                $scope.scrolltop(0);
            }
        }
        //单击。
        $scope.ssclicks=function(arr,brr){
            if($("#"+arr).find('.dx').hasClass('act')){
                return false;
            }
            if(arr=='brand'){//品牌
                $scope.guesslikeshop($scope.arr,1,brr,$scope.drr,$scope.err)
            }else if(arr=='fenlei'){//分类
                $scope.guesslikeshop(brr,1,$scope.crr,$scope.drr,$scope.err)
            }else if(arr=='activity'){//活动
                $scope.guesslikeshop($scope.arr,1,$scope.crr,brr,$scope.err)
            }else if(arr=='service'){//服务
                $scope.guesslikeshop($scope.arr,1,$scope.crr,$scope.drr,brr)
            }else if(arr=='storehouse'){//发货地
                $scope.guesslikeshop($scope.arr,1,$scope.crr,$scope.drr,$scope.err)
            }else{
                $scope.guesslikeshop($scope.arr,1,$scope.crr,$scope.drr,$scope.err)
            }
        }
        //确认
        $scope.dbclicks=function(arr){
            var idlist='';//初始化选中的id集合
            if($("#"+arr).find('.dx').hasClass('act')){
                idlist="";
                var zrr=[];
                $("#"+arr).find('.s-s-l-sp-list li,.s-s-l-pp-list li').each(function(i) {
                    if($("#"+arr).find('.s-s-l-sp-list li,.s-s-l-pp-list li').eq(i).hasClass('act')){
                        zrr.push($("#"+arr).find('.s-s-l-sp-list li,.s-s-l-pp-list li').eq(i).attr("val"));
                    }
                });
                idlist=zrr.join(",");
            }else{
                return false;
            }
            //console.log(idlist)
            if(arr=='brand'){//品牌
                $scope.guesslikeshop($scope.arr,1,idlist,$scope.drr,$scope.err)
            }else if(arr=='fenlei'){//分类
                $scope.guesslikeshop(idlist,1,$scope.crr,$scope.drr,$scope.err)
            }else if(arr=='activity'){//活动
                $scope.guesslikeshop($scope.arr,1,$scope.crr,idlist,$scope.err)
            }else if(arr=='service'){//服务
                $scope.guesslikeshop($scope.arr,1,$scope.crr,$scope.drr,idlist)
            }else if(arr=='storehouse'){//发货地
                $scope.guesslikeshop($scope.arr,1,$scope.crr,$scope.drr,$scope.err)
            }else{
                $scope.guesslikeshop($scope.arr,1,$scope.crr,$scope.drr,$scope.err)
            }
            $("#"+arr).find('.s-s-l-btn a.dx').removeClass('act');
            $("#"+arr).find('.s-s-l-sp-list li span').removeClass('act');
            $("#"+arr).find('p').hide();
            //品牌
            $("#"+arr).find(".s-s-l-pp-list").stop().animate({scrollTop:0},0);
            $("#"+arr).find('.s-s-l-btn .gd').removeClass('act');
            $("#"+arr).find('.s-s-l-pp-list').removeClass('act')
        }



    })
    //热门店铺
    .controller('hotdp',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
       $scope.navsortshows(1,0);
        $scope.scrolltop(0);
        //获取分类
        $http.post($scope.url+"/rankingInterfaces.api?getSalesMerchantsRankingLabel",$.param({

        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.hotdpsort=data["data"];
            }else{
                $scope.alerttxt(data['error'])
            }
        })
        //获取店铺列表
        $scope.hotdp=function(arr,brr){
            $scope.arr=arr;//
            $scope.brr=brr;//
            $http.post($scope.url+"/rankingInterfaces.api?getSalesMerchantsRanking",$.param({
                label_ids:arr,
                page:brr,
                limit:10,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.hotdps=data["data"];
                    $scope.shoptotal=data['total'];//总数
                    $scope.pageNum=Math.ceil($scope.shoptotal/10)==0?'1':Math.ceil($scope.shoptotal/10);//总页数
                    $scope.nowpageNum=brr;//当前页
                    $scope.nowpageNum2=brr;//当前页 跳转用
                    $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                    console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页");//
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.hotdp('',1);
        //分页
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.brr||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.hotdp($scope.arr,arr)
                $scope.scrolltop(0);
            }
        }

    })
    //降价榜
    .controller('hotjj',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.navsortshows(1,0);
        $scope.scrolltop(0);
        //获取分类
        $http.post($scope.url+"/rankingInterfaces.api?getPriceCutsRankingClass",$.param({

        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.hotjjsort=data["data"];
            }else{
                $scope.alerttxt(data['error'])
            }
        })
        //获取商品列表
        $scope.hotjj=function(arr,brr){
            $scope.loading=1;
            $scope.arr=arr;//
            $scope.brr=brr;//
            $http.post($scope.url+"/rankingInterfaces.api?getPriceCutsPCRanking",$.param({
                goods_uuid:arr,
                page:brr,
                limit:40,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $timeout(function(){
                      $scope.loading=3;
                    },800)
                    $scope.hotjjs=data["data"];
                    $scope.shoptotal=data['total'];//总数
                    $scope.pageNum=Math.ceil($scope.shoptotal/40)==0?'1':Math.ceil($scope.shoptotal/40);//总页数
                    $scope.nowpageNum=brr;//当前页
                    $scope.nowpageNum2=brr;//当前页 跳转用
                    $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                    console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页");//
                }else{
                    $scope.alerttxt(data['error'])
                }
            }).error(function(){
                $scope.loading=2;
            })
        }
        $scope.hotjj('',1);
        //分页
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.brr||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                $scope.hotjj($scope.arr,arr)
                $scope.scrolltop(0);
            }
        }

    })
    //店铺
    .controller('dianpu',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.navsortshows(1,0);
        $scope.scrolltop(0);
        //获取店铺详情
        $scope.merchantxq=function(){
            $http.post($scope.url+"/merchantsInterfaces.api?getOneMerchantsDetail",$.param({
                merchants_id:$location.search()['mid'],
                member_id:$cookieStore.get("member_id"),
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.merchantxqs=data["data"];
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.merchantxq();
        $scope.flexslider=function() {
            $(".flexslider").flexslider({
                slideshowSpeed: 3000, //展示时间间隔ms
                animationSpeed: 300, //滚动时间ms
                pauseOnAction:false,
                touch: true //是否支持触屏滑动(比如可用在手机触屏焦点图)
            });
        };

        //优惠券列表
        $scope.yhqlist=function(arr){
            $scope.yhqpage=arr;
            $http.post($scope.url+"/couponInterfaces.api?getReceiceCoupons",$.param({
                merchants_id:$location.search()['mid'],
                member_id:$cookieStore.get("member_id"),
                page:arr,
                limit:5,
                is_save_take:1,
                is_repeat_take:1,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.coupons=data["data"];
                    $scope.coupontotal=data['total'];//总数
                    $scope.couponNum=Math.ceil($scope.coupontotal/5)==0?'1':Math.ceil($scope.coupontotal/5);//总页数
                    $scope.couponpage=arr;
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.yhqlist(1);
        $scope.yhqlist2=function(arr){
            console.log(arr+","+$scope.couponpage+","+$scope.couponNum)
            if(arr>0&&arr!=$scope.couponpage&&arr<=$scope.couponNum){
                $scope.yhqlist(arr);
            }
        }
        //领取优惠券
        $scope.receivecoupon=function(arr,brr){
            console.log(arr+","+brr)
            if(brr!=''){
                return false;
            }
            $http.post($scope.url+"/couponInterfaces.api?memberReceiveCoupon",$.param({
                coupon_id:arr,
                member_token:$cookieStore.get("member_token"),
                member_id:$cookieStore.get("member_id"),
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.yhqlist($scope.yhqpage);
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                        $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        //是否显示资质
        $scope.yyzzshows=0;
        $scope.yyzzshow=function(arr){
            if(arr==1){
                $scope.yyzzshows=0;
            }else{
                $scope.yyzzshows=1;
            }
        }
        $scope.yyzzshow(1);
        //商品收藏 商家收藏
        $scope.collection=function(arr,brr,crr){//arr商家id brr收藏id  crr收藏还是取消收藏
            console.log(arr+","+brr+","+crr)
            if(crr==0){
                $http.post($scope.url+"/collectionInterfaces.api?insertCollection",$.param({
                    member_id:$cookieStore.get("member_id"),
                    member_token:$cookieStore.get("member_token"),
                    relation_id:arr,
                    collection_type:'merchants',
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
                ).success(function(data){
                    console.log(data);
                    if(data["status"]=="ok"){
                        $scope.alerttxt('收藏成功');
                        $scope.merchantxq();
                    }else if (data["status"] == "pending" && data["error"] == "token failed"){
                            $scope.relogin()
                    }else{
                        $scope.alerttxt(data['error'])
                    }
                })
            }else if(crr==1){
                $http.post($scope.url+"/collectionInterfaces.api?cancelCollection",$.param({
                    collection_id:brr,
                    member_id:$cookieStore.get("member_id"),
                    member_token:$cookieStore.get("member_token"),
                }),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
                ).success(function(data){
                    console.log(data);
                    if(data["status"]=="ok"){
                        $scope.alerttxt("取消成功");
                        $scope.merchantxq();
                    }else if (data["status"] == "pending" && data["error"] == "token failed"){
                        $scope.relogin()
                    }else{
                        $scope.alerttxt(data['error'])
                    }
                })
            }else{
                $scope.alerttxt('你没登录-->未获取到是否已收藏');
            }
        }
        //获取商品品牌 活动 服务 发货地
        $scope.shoppinpai=function(arr){
            $http.post($scope.url+"/goodsInterfaces.api?getFilterByClass",$.param({
                goods_uuid:arr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.shoppinpais=data["data"];
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.shoppinpai('');
        //获取分类
        $scope.guesslike=function(arr,brr){
            $http.post($scope.url+"/merchantsInterfaces.api?getMerchantsClass",$.param({
                level:arr,
                parent_id:brr,
                merchants_id:$location.search()['mid'],
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.guesslikes=data["data"];
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.guesslike(1,-1);
        $scope.guesslike2=function(arr,brr,index){
            $http.post($scope.url+"/merchantsInterfaces.api?getMerchantsClass",$.param({
                level:arr,
                parent_id:brr,
                merchants_id:$location.search()['mid'],
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.guesslike2s=data['data']
                    $scope.guesslikes[index].sort2=$scope.guesslike2s;
                    console.log($scope.guesslikes)
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.guesslike3=function(arr,brr,index){
            $http.post($scope.url+"/merchantsInterfaces.api?getMerchantsClass",$.param({
                level:arr,
                parent_id:brr,
                merchants_id:$location.search()['mid'],
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.guesslike2s[index].sort3=data["data"];
                    console.log($scope.guesslikes)
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        //商家的商品列表
        $scope.mshoplist = function(arr,brr,crr,drr,err,frr,grr,hrr,irr){
            $scope.loading=1;
            $scope.arr=arr;//
            $scope.brr=brr;//
            $scope.crr=crr;
            $scope.drr=drr;
            $scope.err=err;
            $scope.frr=frr;//
            $scope.grr=grr;
            $scope.hrr=hrr;
            $scope.irr=irr;
            console.log(arr+","+arr+","+brr+","+drr+","+err+","+frr+","+grr+","+hrr+","+irr)
            $http.post($scope.url+"/merchantsInterfaces.api?getMerchantsGoodss",$.param({
                merchants_id:$location.search()['mid'],
                page:arr,
                limit:40,
                is_new:brr,
                is_recommend:crr,
                sort_type:drr,
                sort_way:err,
                brand_id:frr,//品牌
                activity_id:grr,//活动id
                label_id:hrr,//服务id
                goods_uuid:irr,//分类id
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $timeout(function(){
                      $scope.loading=3;
                    },800)
                    $scope.mshoplists=data['data'];
                    $scope.shoptotal=data['total'];//总数
                    $scope.pageNum=Math.ceil($scope.shoptotal/40)==0?'1':Math.ceil($scope.shoptotal/40);//总页数
                    $scope.nowpageNum=arr;//当前页
                    $scope.nowpageNum2=arr;//当前页 跳转用
                    $scope.pagebox($scope.shoptotal,$scope.pageNum,$scope.nowpageNum)
                    console.log($scope.pageNum+"页,当前是"+$scope.nowpageNum+"页"+$scope.nowpageNum2);//
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            }).error(function(){
              $scope.loading=2;
            })
        }
        $scope.mshoplist(1,'','','','','','','','');
        //价格排序
        $scope.mshoplistprices='desc';//初始化desc 正序 asc倒序
        $scope.mshoplistprice=function(arr){
            console.log(arr)
            $scope.mshoplist(1,'','','pc_price',arr,$scope.frr,$scope.grr,$scope.hrr,$scope.irr);
            if(arr=='desc'){
                $scope.mshoplistprices='asc'
            }else{
                $scope.mshoplistprices='desc'
            }
        }
        //单击。
        $scope.ssclicks=function(arr,brr){
            if($("#"+arr).find('.dx').hasClass('act')){
                return false;
            }
            if(arr=='brand'){//品牌
                $scope.mshoplist(1,$scope.brr,$scope.crr,$scope.drr,$scope.err,brr,$scope.grr,$scope.hrr,$scope.irr);
            }else if(arr=='fenlei'){//分类
                $scope.mshoplist(1,$scope.brr,$scope.crr,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr,brr);
            }else if(arr=='activity'){//活动
                $scope.mshoplist(1,$scope.brr,$scope.crr,$scope.drr,$scope.err,$scope.frr,brr,$scope.hrr,$scope.irr);
            }else if(arr=='service'){//服务
                $scope.mshoplist(1,$scope.brr,$scope.crr,$scope.drr,$scope.err,$scope.frr,$scope.grr,brr,$scope.irr);
            }else if(arr=='storehouse'){//发货地
                $scope.mshoplist(1,$scope.brr,$scope.crr,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr,$scope.irr);
            }else{
                $scope.mshoplist(1,$scope.brr,$scope.crr,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr,$scope.irr);
            }
        }
        //确认
        $scope.dbclicks=function(arr){
            var idlist='';//初始化选中的id集合
            if($("#"+arr).find('.dx').hasClass('act')){
                idlist="";
                var zrr=[];
                $("#"+arr).find('.s-s-l-sp-list li,.s-s-l-pp-list li').each(function(i) {
                    if($("#"+arr).find('.s-s-l-sp-list li,.s-s-l-pp-list li').eq(i).hasClass('act')){
                        zrr.push($("#"+arr).find('.s-s-l-sp-list li,.s-s-l-pp-list li').eq(i).attr("val"));
                    }
                });
                idlist=zrr.join(",");
            }else{
                return false;
            }
            //console.log(idlist)
            if(arr=='brand'){//品牌
                $scope.mshoplist(1,$scope.brr,$scope.crr,$scope.drr,$scope.err,idlist,$scope.grr,$scope.hrr,$scope.irr);
            }else if(arr=='fenlei'){//分类
                $scope.mshoplist(1,$scope.brr,$scope.crr,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr,idlist);
            }else if(arr=='activity'){//活动
                $scope.mshoplist(1,$scope.brr,$scope.crr,$scope.drr,$scope.err,$scope.frr,idlist,$scope.hrr,$scope.irr);
            }else if(arr=='service'){//服务
                $scope.mshoplist(1,$scope.brr,$scope.crr,$scope.drr,$scope.err,$scope.frr,$scope.grr,idlist,$scope.irr);
            }else if(arr=='storehouse'){//发货地
                $scope.mshoplist(1,$scope.brr,$scope.crr,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr,$scope.irr);
            }else{
                $scope.mshoplist(1,$scope.brr,$scope.crr,$scope.drr,$scope.err,$scope.frr,$scope.grr,$scope.hrr,$scope.irr);
            }
            $("#"+arr).find('.s-s-l-btn a.dx').removeClass('act');
            $("#"+arr).find('.s-s-l-sp-list li span').removeClass('act');
            $("#"+arr).find('p').hide();
            //品牌
            $("#"+arr).find(".s-s-l-pp-list").stop().animate({scrollTop:0},0);
            $("#"+arr).find('.s-s-l-btn .gd').removeClass('act');
            $("#"+arr).find('.s-s-l-pp-list').removeClass('act')
        }
        //分页
        $scope.pageclick=function(arr){
            console.log(arr);
            if(arr==$scope.arr||arr==0||arr>$scope.pageNum){
                return false;
            }
            if(arr>0){
                var anh = $('.saixuan-tit').offset().top;
                $scope.mshoplist(arr,$scope.brr,$scope.crr,$scope.drr,$scope.err);
                $scope.scrolltop(anh);
            }
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

    //判断循环是否结束
    .directive('repeatFinish',function(){
      return {
          link: function(scope,element,attr){
            if(scope.$last == true){
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






