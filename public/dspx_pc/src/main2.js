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
      $scope.gwcjdshows=function(arr){
        $scope.gwcjdshow=arr;
      }
      $scope.gwcjdshows(1);

      //假支付
      $scope.pay=function(arr){
           $scope.alerttxt('快捷支付暂未开通')
           return false;
           $http.post($scope.url+"/orderInterfaces.api?payOrder",$.param({
               member_id:$cookieStore.get("member_id"),
               member_token:$cookieStore.get("member_token"),
               order_ids:arr,
           }),
           {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
           ).success(function(data){
               console.log(data);
               if(data["status"]=="ok"){
                   $scope.alerttxt('支付成功');
                   location.href="core.html#/wddd"
                   //return data['data'];
               }else if (data["status"] == "pending" && data["error"] == "token failed"){
                   $scope.relogin();
               }else{
                   $scope.alerttxt(data['error']);
               }
           })
      }
      //付款订单----余额支付
      $scope.balancePay=function(arr){
           if(arr==""){
             $scope.alerttxt("状态出错！")
             return false;
           }
           if($("#yepwd").val()==""||$("#yepwd").val().length!=6){
             $scope.alerttxt("请输入规范的密码");
             return false;
           }
           if($("#yecode").val()==""){
             $scope.alerttxt("请输入验证码");
             return false;
           }
           $http.post($scope.url+"/orderInterfaces.api?payBalanceSuccessOrder",$.param({
               member_id:$cookieStore.get("member_id"),
               member_token:$cookieStore.get("member_token"),
               order_ids:arr,
               balance_password:$("#yepwd").val(),
               code:$("#yecode").val(),
           }),
           {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
           ).success(function(data){
               console.log(data);
               if(data["status"]=="ok"){
                   $scope.alerttxt('支付成功,即将跳转订单列表');
                   setTimeout("location.href='core.html#/wddd'",2000);
                   //return data['data'];
               }else if (data["status"] == "pending" && data["error"] == "token failed"){
                   $scope.relogin();
               }else{
                   $scope.alerttxt(data['error']);
               }
           })
      }
      //付款订单---信用额度付款
      $scope.trustPay=function(arr){
           if(arr==""){
             $scope.alerttxt("状态出错！")
             return false;
           }
           if($("#xypwd").val()==""||$("#xypwd").val().length!=6){
             $scope.alerttxt("请输入规范的密码");
             return false;
           }
           if($("#xycode").val()==""){
             $scope.alerttxt("请输入验证码");
             return false;
           }
           $http.post($scope.url+"/orderInterfaces.api?payTrustSuccessOrder",$.param({
               member_id:$cookieStore.get("member_id"),
               member_token:$cookieStore.get("member_token"),
               order_ids:arr,
               trust_password:$("#xypwd").val(),
               code:$("#xycode").val(),
           }),
           {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
           ).success(function(data){
               console.log(data);
               if(data["status"]=="ok"){
                   $scope.alerttxt('支付成功,即将跳转订单列表');
                   setTimeout("location.href='core.html#/wddd'",2000);
                   //return data['data'];
               }else if (data["status"] == "pending" && data["error"] == "token failed"){
                   $scope.relogin();
               }else{
                   $scope.alerttxt(data['error']);
               }
           })
      }
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
                    $location.path('/wxpay').search('img='+data['data']+'&paynum='+$location.search()['paynum']+'&orderid='+$location.search()['orderid'])
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
      //回到顶部或者某个位置
      $scope.scrolltop=function(arr){
        $("html,body").stop().animate({scrollTop:arr},300);
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

    // 购物车首页
    .controller('gwc',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.gwcjdshows(1);
        $scope.scrolltop(0);
        if($location.search()['carids']){
           $('.gwc-jindu li').removeClass('act')
           $('.gwc-jindu li').eq(1).addClass('act');
        }else{
           $('.gwc-jindu li').removeClass('act')
           $('.gwc-jindu li').eq(0).addClass('act');
        }
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
        //没登录就调用一下猜你喜欢
        if($scope.membershow==0){
            $scope.guessyoulike(1);
        }

        $scope.gwcshop=function(){
            $http.post($scope.url+"/shoppingCarInterfaces.api?getShoppingCars",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.gwcshoplist=data['data']
                    if(data['data'].length==0){
                      $scope.guessyoulike(1);
                    }
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.gwcshop();
        $scope.jjnum=function(arr,brr,crr){//id 修改 crr:库存
            var inputval=parseInt($("#gwc"+arr).find("input").val())>(crr*1-1*1)?(crr*1==0?1:crr*1):parseInt($("#gwc"+arr).find("input").val());
            // if(parseInt($("#gwc"+arr).find("input").val())>(crr*1-1*1)){
            //    $scope.alerttxt('达到库存上限');
            // }
            if(brr=="jia"){
              if(inputval<(crr*1)){
                inputval++;
              }
            }else if(brr=="jian"){
                if(inputval==1){
                    return false;
                }
                if(inputval>0){
                  inputval--;
                }
            }else if(brr=="xg"){
                if(isNaN(inputval)||inputval<1){
                    inputval=1;
                }else{
                    inputval=inputval;
                }
            }
            console.log(inputval)
            $("#gwc"+arr).find("input").val(inputval);
            $http.post($scope.url+"/shoppingCarInterfaces.api?updateShoppingCarNum",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                car_id:arr,
                goods_num:inputval,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    //$scope.gwcshop();
                    $("#gwc"+arr).find(".td6>span").text((inputval*$("#gwc"+arr).find(".td4>span").text()).toFixed(2))
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
            $scope.zmoney();
        }
        //离开input再判断一下
        $scope.blurnum=function(arr,brr){
            var num=/^[1-9]*[1-9][0-9]*$/;
            if(!num.test($("#gwc"+arr).find('input').val())){
                $("#gwc"+arr).find('input').val('1')
            }
            if(parseInt($("#gwc"+arr).find("input").val())>brr){
              $("#gwc"+arr).find("input").val(brr)
            }
        }
        //计算价格
        $scope.zmoneys=0;//总价格
        $scope.znums=0;//总数量
        $scope.zmoney=function(){
        	$scope.zmoneys=0;
          $scope.znums=0;
        	var len=$('.gwc-listbox .gwc-dp-box tr').length;
        	for(var i=0;i<len;i++){
        		if($('.gwc-listbox .gwc-dp-box tr').eq(i).find('.td1>span').attr('class')=='act'){
        			var jg=$('.gwc-listbox .gwc-dp-box tr').eq(i).find('.td4>span').text()*$('.gwc-listbox .gwc-dp-box tr').eq(i).find('input').val();
              $scope.zmoneys=$scope.zmoneys+jg;
              $scope.znums=parseInt($scope.znums)+parseInt($('.gwc-listbox .gwc-dp-box tr').eq(i).find('input').val());
        		}
        	}
        }
        //判断是否全部已选择
        $scope.gwcact=function(){
    			var num=0;
    			var len=$('.gwc-dp-box').length;
    			for(var i=0;i<len;i++){
    				if($('.gwc-dp-box').eq(i).find('.gwc-dp-tit>span').attr('class')=='act'){
    					num++;
    				}
    			}
    			if(num==len){
    				$(".gwc-tit span,.g-b-1of4>span").addClass("act");
    			}else{
    				$(".gwc-tit span,.g-b-1of4>span").removeClass("act");
    			}
    			$scope.zmoney()
    		}
    		//全选
    		$scope.qxact=function(){
    			if($(".gwc-tit span,.gwc-dp-tit>span,.gwc-dp-box .td1>span,.g-b-1of4>span").attr("class")=="act"){
    				$(".gwc-tit span,.gwc-dp-tit>span,.gwc-dp-box .td1>span,.g-b-1of4>span").removeClass("act");
    			}else{
    				$(".gwc-tit span,.gwc-dp-tit>span,.gwc-dp-box .td1>span,.g-b-1of4>span").addClass("act");
    			}
    			$scope.zmoney();
    		}
    		/*店铺的全选*/
    		$scope.gwcdpact=function(arr){
    			if($("#mid"+arr).find('.gwc-dp-tit>span').attr("class")=="act"){
    				$("#mid"+arr).find('.gwc-dp-tit>span').removeClass("act")
    				$("#mid"+arr).find(".td1>span").removeClass("act");
    			}else{
    				$("#mid"+arr).find('.gwc-dp-tit>span').addClass("act")
    				$("#mid"+arr).find(".td1>span").addClass("act");
    			}
    			$scope.gwcact();
    		}
    		/*单个选择*/
    		$scope.gwcshopact=function(arr){
    			if($("#gwc"+arr).find('.td1>span').attr("class")=="act"){
    				$("#gwc"+arr).find('.td1>span').removeClass("act")
    			}else{
    				$("#gwc"+arr).find('.td1>span').addClass("act")
    			}
    			/*判断店铺下的商品是否全选中了*/
    			var index=$("#gwc"+arr).parents("table").find("tr").length;
    			var num=0;
    			for(var i=0;i<index;i++){
    				if($("#gwc"+arr).parents("table").find("tr").eq(i).find('.td1>span').attr('class')=='act'){
    					num++;
    				}
    			}
    			if(num==index){
    				$("#gwc"+arr).parents('.gwc-dp-box').find('.gwc-dp-tit>span').addClass('act')
    			}else{
    				$("#gwc"+arr).parents('.gwc-dp-box').find('.gwc-dp-tit>span').removeClass('act')
    			}
    			$scope.gwcact();
    		}
        // $scope.cuxiao=function(arr){
        //     if($("#gwc"+arr).find('.cx-select>span').hasClass('act')){
        //         $("#gwc"+arr).find('.cx-select ul').hide();
        //         $("#gwc"+arr).find('.cx-select>span').removeClass('act')
        //     }else{
        //         $("#gwc"+arr).find('.cx-select ul').slideDown();
        //         $("#gwc"+arr).find('.cx-select>span').addClass('act')
        //     }

        // }
        //获取carids
        $scope.zmoneys=0;
        $scope.carids=function(){
            $scope.zmoneys=0;
            var carid='';
            var zrr=[];
            var len=$('.gwc-listbox .gwc-dp-box tr').length;
            for(var i=0;i<len;i++){
                if($('.gwc-listbox .gwc-dp-box tr').eq(i).find('.td1>span').attr('class')=='act'){
                    zrr.push($('.gwc-listbox .gwc-dp-box tr').eq(i).find('.td1>span').attr('val'));
                }
            }
            carid=zrr.join(",");
            return carid;
        }
        //分享购物车弹出框
        $scope.sharetck=2;
        $scope.sharetcks=function(arr){
          if(arr==1){
            $scope.sharetck=2;
          }else{
            $scope.sharetck=1;
          }
        }
        //分享购物车-弹出框和判断单个和多个
        $scope.sharegwc=function(arr){
          $scope.sharegwc_id=arr;//=0就是分享多个
          $scope.sharetck=1;
        }
        //分享购物车-提交
        $scope.sharegwcs=function(arr){
          if(!myreg.test(arr)){
              $scope.alerttxt("请输入有效的手机号码！");
              return false;
          }
          var share_carids;
          if($scope.sharegwc_id==0){
              share_carids=$scope.carids();
          }else{
              share_carids=$scope.sharegwc_id;
          }
          console.log(share_carids)
          $http.post($scope.url+"/swInterfaces.api?shareShoppingCar",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                member_account:arr,
                car_ids:share_carids,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.sharetck=2;
                    $scope.alerttxt('分享成功');
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        //删除购物车商品
        $scope.delgwc=function(arr){
            var cars;
            if(arr==0){
                cars=$scope.carids();
                if(cars==''){
                    $scope.alerttxt('你没有选中商品哦！');
                    return false;
                }
            }else{
                cars=arr;
            }
            console.log(cars)
            $http.post($scope.url+"/shoppingCarInterfaces.api?deleteShoppingCars",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                car_ids:cars,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.alerttxt('删除成功');
                    $scope.gwcshop();
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        //点结算
        $scope.goqrdd=function(){
            var cars=$scope.carids();
            if(cars==''){
                $scope.alerttxt('你没有选中商品哦！');
                return false;
            }
            window.location.href="gwc.html#/qrdd?carids="+cars;
        }


    })
    // 购物车in
    .controller('gwcin',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.gwcjdshows(1);
        $scope.scrolltop(0);
        if($location.search()['carids']){
           $('.gwc-jindu li').removeClass('act')
           $('.gwc-jindu li').eq(1).addClass('act');
        }else{
           $('.gwc-jindu li').removeClass('act')
           $('.gwc-jindu li').eq(0).addClass('act');
        }
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
        //没登录就调用一下猜你喜欢
        if($scope.membershow==0){
            $scope.guessyoulike(1);
        }
        //gwcin 列表
        $scope.gwcinlist=function(arr){
          $http.post($scope.url+"/swInterfaces.api?getShareOutShoppingCar",$.param({
              member_id:$cookieStore.get("member_id"),
              member_token:$cookieStore.get("member_token"),
          }),
          {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
          ).success(function(data){
              console.log(data);
              if(data["status"]=="ok"){
                  $scope.gwcinlists=data['data'];
                  if(data['data'].length==0){
                    $scope.guessyoulike(1);
                  }
              }else if (data["status"] == "pending" && data["error"] == "token failed"){
                  $scope.relogin()
              }else{
                  $scope.alerttxt(data['error'])
              }
          })
        }
        $scope.gwcinlist();
        //计算价格
        $scope.zmoneys=0;
        $scope.znums=0;//总数量
        $scope.zmoney=function(){
          $scope.zmoneys=0;
          $scope.znums=0;
          var len=$('.share-list .gwc-dp-box tr').length;
          for(var i=0;i<len;i++){
            if($('.share-list .gwc-dp-box tr').eq(i).parents('.share-list').find('.gwc-share-tit .sel').hasClass('act')){
              var jg=$('.share-list .gwc-dp-box tr').eq(i).find('.td4>span').text()*$('.share-list .gwc-dp-box tr').eq(i).find('.td5').attr('val');
              $scope.zmoneys=$scope.zmoneys+jg;
              $scope.znums=parseInt($scope.znums)+parseInt($('.share-list .gwc-dp-box tr').eq(i).find('.td5').attr('val'));
            }
          }
        }
        //判断是否全部已选择
        $scope.gwcact=function(){
          var num=0;
          var len=$('.share-list').length;
          for(var i=0;i<len;i++){
            if($('.share-list').eq(i).find('.gwc-share-tit .sel').hasClass('act')){
              num++;
            }
          }
          if(num==len){
            $(".gwc-tit span,.g-b-1of4>span").addClass("act");
          }else{
            $(".gwc-tit span,.g-b-1of4>span").removeClass("act");
          }
          $scope.zmoney()
        }
        //全选
        $scope.qxact=function(){
          if($(".gwc-tit span,.g-b-1of4>span").attr("class")=="act"){
            $(".gwc-share-tit .sel,.gwc-tit span,.g-b-1of4>span").removeClass("act");
          }else{
            $(".gwc-share-tit .sel,.gwc-tit span,.g-b-1of4>span").addClass("act");
          }
          $scope.zmoney();
        }
        //单个人的选择
        $scope.share_meaber_id=0;//去结算时用
        $scope.shareact=function(arr){
          if($('#share'+arr).find('.gwc-share-tit .sel').hasClass('act')){
            $scope.share_meaber_id=0;
            $('#share'+arr).find('.gwc-share-tit .sel').removeClass('act')
          }else{
            $scope.share_meaber_id=arr;
            $('.share-list .gwc-share-tit .sel').removeClass('act')
            $('#share'+arr).find('.gwc-share-tit .sel').addClass('act')
          }
          $scope.gwcact();
        }

        //获取carids
        $scope.zmoneys=0;
        $scope.carids=function(){
            $scope.zmoneys=0;
            var carid='';
            var zrr=[];
            var len=$('.share-list').length;
            for(var i=0;i<len;i++){
                if($('.share-list').eq(i).find('.gwc-share-tit .sel').hasClass('act')){
                  zrr.push($('.share-list').eq(i).find('.gwc-share-tit .sel').attr('val'));
                }
            }
            carid=zrr.join(",");
            return carid;
        }

        //点结算
        $scope.goqrdd=function(){
            if($scope.share_meaber_id==0){
                $scope.alerttxt('你没有选中商品哦！');
                return false;
            }
            window.location.href="gwc.html#/qrdd?smid="+$scope.share_meaber_id+"&outorin=1";
        }


    })
    // 购物车out
    .controller('gwcout',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.gwcjdshows(1);
        $scope.scrolltop(0);
        if($location.search()['carids']){
           $('.gwc-jindu li').removeClass('act')
           $('.gwc-jindu li').eq(1).addClass('act');
        }else{
           $('.gwc-jindu li').removeClass('act')
           $('.gwc-jindu li').eq(0).addClass('act');
        }
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
        //没登录就调用一下猜你喜欢
        if($scope.membershow==0){
            $scope.guessyoulike(1);
        }

        //gwcout
        $scope.gwcoutlist=function(arr){
          $http.post($scope.url+"/swInterfaces.api?getShareIngShoppingCar",$.param({
              member_id:$cookieStore.get("member_id"),
              member_token:$cookieStore.get("member_token"),
          }),
          {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
          ).success(function(data){
              console.log(data);
              if(data["status"]=="ok"){
                  $scope.gwcoutlists=data['data'];
                  if(data['data'].length==0){
                    $scope.guessyoulike(1);
                  }
              }else if (data["status"] == "pending" && data["error"] == "token failed"){
                  $scope.relogin()
              }else{
                  $scope.alerttxt(data['error'])
              }
          })
        }
        $scope.gwcoutlist();
        //计算价格
        $scope.zmoneys=0;
        $scope.znums=0;//总数量
        $scope.zmoney=function(){
          $scope.zmoneys=0;
          $scope.znums=0;
          var len=$(".share-list").length;
          for(var i=0;i<len;i++){
            if($('.share-list').eq(i).find('.gwc-share-tit .sel').hasClass('act')){
              var len2=$('.share-list').eq(i).find('.gwc-dp-box tr').length;
              for(var k=0;k<len2;k++){
                var jg;
                if($('.share-list').eq(i).find('.gwc-share-tit .sel').attr('type')!=1){
                  jg=$('.share-list').eq(i).find('.gwc-dp-box tr').eq(k).find('.td4>span').text()*$('.share-list').eq(i).find('.gwc-dp-box tr').eq(k).find('input').val();
                  $scope.znums=parseInt($scope.znums)+parseInt($('.share-list').eq(i).find('.gwc-dp-box tr').eq(k).find('input').val());
                }else{
                  jg=$('.share-list').eq(i).find('.gwc-dp-box tr').eq(k).find('.td4>span').text()*$('.share-list').eq(i).find('.gwc-dp-box tr').eq(k).find('.td5').attr('val');
                  $scope.znums=parseInt($scope.znums)+parseInt($('.share-list').eq(i).find('.gwc-dp-box tr').eq(k).find('.td5').attr('val'))
                }
                $scope.zmoneys=$scope.zmoneys+jg;
              }
            }
          }

        }
        $scope.jjnum=function(arr,brr,crr,drr,err){//id 修改 crr:库存 drr:shareID
            var inputval=parseInt($("#share"+err).find("#gwc"+arr).find("input").val())>(crr*1-1*1)?(crr*1==0?1:crr*1):parseInt($("#share"+err).find("#gwc"+arr).find("input").val());
            // if(parseInt($("#share"+drr).find("#gwc"+arr).find("input").val())>(crr*1-1*1)){
            //    $scope.alerttxt('达到库存上限');
            // }
            console.log(inputval)
            if(brr=="jia"){
              if(inputval<(crr*1)){
                inputval++;
              }
            }else if(brr=="jian"){
                if(inputval==1){
                    return false;
                }
                if(inputval>0){
                  inputval--;
                }
            }else if(brr=="xg"){
                if(isNaN(inputval)||inputval<1){
                    inputval=1;
                }else{
                    inputval=inputval;
                }
            }
            console.log(inputval)
            $("#share"+err).find("#gwc"+arr).find("input").val(inputval);
            $http.post($scope.url+"/swInterfaces.api?updateShareShoppingCarNumV2",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                share_car_id:drr,
                goods_num:inputval,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    //$scope.gwcshop();
                    $("#share"+err).find("#gwc"+arr).find(".td6>span").text((inputval*$("#share"+err).find("#gwc"+arr).find(".td4>span").text()).toFixed(2))
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
            $scope.zmoney();
        }
        //离开input再判断一下
        $scope.blurnum=function(arr,brr,crr){
            var num=/^[1-9]*[1-9][0-9]*$/;
            if(!num.test($("#share"+crr).find("#gwc"+arr).find('input').val())){
                $("#share"+crr).find("#gwc"+arr).find('input').val('1')
            }
            if(parseInt($("#share"+crr).find("#gwc"+arr).find("input").val())>brr){
              $("#share"+crr).find("#gwc"+arr).find("input").val(brr)
            }
        }
        //判断是否全部已选择
        $scope.gwcact=function(){
          var num=0;
          var len=$('.share-list').length;
          for(var i=0;i<len;i++){
            if($('.share-list').eq(i).find('.gwc-share-tit .sel').hasClass('act')){
              num++;
            }
          }
          if(num==len){
            $(".gwc-tit span,.g-b-1of4>span").addClass("act");
          }else{
            $(".gwc-tit span,.g-b-1of4>span").removeClass("act");
          }
          $scope.zmoney()
        }
        //全选
        $scope.qxact=function(){
          if($(".gwc-tit span,.g-b-1of4>span").attr("class")=="act"){
            $(".gwc-share-tit .sel,.gwc-tit span,.g-b-1of4>span").removeClass("act");
          }else{
            $(".gwc-share-tit .sel,.gwc-tit span,.g-b-1of4>span").addClass("act");
          }
          $scope.zmoney();
        }
        //单个人的选择
        $scope.share_meaber_id=0;//去结算时用
        $scope.shareact=function(arr){
          if($('#share'+arr).find('.gwc-share-tit .sel').hasClass('act')){
            $scope.share_meaber_id=0;
            $('#share'+arr).find('.gwc-share-tit .sel').removeClass('act')
          }else{
            $scope.share_meaber_id=arr;
            $('.share-list .gwc-share-tit .sel').removeClass('act')
            $('#share'+arr).find('.gwc-share-tit .sel').addClass('act')
          }
          $scope.gwcact();
        }

        //获取carids
        $scope.zmoneys=0;
        $scope.carids=function(){
            $scope.zmoneys=0;
            var carid='';
            var zrr=[];
            var len=$('.share-list').length;
            for(var i=0;i<len;i++){
                if($('.share-list').eq(i).find('.gwc-share-tit .sel').hasClass('act')){
                  zrr.push($('.share-list').eq(i).find('.gwc-share-tit .sel').attr('val'));
                }
            }
            carid=zrr.join(",");
            return carid;
        }
        //删除购物车商品
        $scope.delgwc=function(arr,brr){
            $http.post($scope.url+"/swInterfaces.api?deleteShareShoppingCar",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                share_car_id:brr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.alerttxt('删除成功');
                    $scope.gwcoutlist();
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        //点结算
        $scope.goqrdd=function(){
            if($scope.share_meaber_id==0){
                $scope.alerttxt('你没有选中商品哦！');
                return false;
            }
            window.location.href="gwc.html#/qrdd?smid="+$scope.share_meaber_id;
        }


    })
    .directive("moreadd", [function () {  //
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
    //确认订单
    .controller('qrdd',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.gwcjdshows(1);
        $scope.scrolltop(0);
        if($location.search()['carids']){
           $('.gwc-jindu li').removeClass('act')
           $('.gwc-jindu li').eq(1).addClass('act');
        }else{
           $('.gwc-jindu li').removeClass('act')
           $('.gwc-jindu li').eq(0).addClass('act');
        }
        /*创建json*/
        var json={}
        json.shopping_car_ids=$location.search()['carids']?$location.search()['carids']:'';
        if($location.search()['outorin']==1){
          json.member_car_id=$location.search()['smid']?$location.search()['smid']:'';
        }
        json.member_id=$cookieStore.get("member_id"),
        json.order_type="goods";
        json.invoice_rise="";
        //根据区的id获取自提点列表
        $scope.ztlist=function(arr){
          $http.post($scope.url+"/addressInterfaces.api?getCitySinces",$.param({
              city_id:arr,
          }),
          {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
          ).success(function(data){
              console.log(data);
              if(data["status"]=="ok"){
                  $scope.ztlists=data['data'];
              }else if (data["status"] == "pending" && data["error"] == "token failed"){
                  $scope.relogin()
              }else{
                  $scope.alerttxt(data['error'])
              }
          })
        }
        //根据默认地址的区的id获取默认自提点
        $scope.ztlist2=function(arr){
          $scope.ztlist2_c=arr;//点击更换自提地址时用到的默认地址的区id
          $http.post($scope.url+"/addressInterfaces.api?getCitySinces",$.param({
              city_id:arr,
          }),
          {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
          ).success(function(data){
              console.log(data);
              if(data["status"]=="ok"){
                if(data['data'].length==0){
                  $scope.morenzt='无可推荐地址'
                }else{
                  json.since_id=data['data'][0]['since_id'];//初始化自提点区id

                  $scope.morenzt='推荐地址:'+data['data'][0]['since_name']+''+data['data'][0]['since_address']
                }
              }else if (data["status"] == "pending" && data["error"] == "token failed"){
                  $scope.relogin()
              }else{
                  $scope.alerttxt(data['error'])
              }
          })
        }
        //初始化编辑操作的addid
        $scope.editaddid=0;
        $scope.morenadds='省市区';
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
                    if($scope.addlength>0){
                        json.address_id=data['data'][0]['address_id'];
                        json.since_fixed_mobile='';//初始化自提点固定电话
                        json.since_people_name=data['data'][0]['name'];//初始化自提点姓名
                        json.since_mobile=data['data'][0]['mobile'];//初始化自提点手机
                        //json.address_id;
                        $scope.morenadds=data['data'][0]['province']+data['data'][0]['city']+data['data'][0]['country']
                        $scope.ztlist2(data['data'][0]['country_id']);
                    }else{
                        json.address_id='';
                        $scope.ztlist2(0);
                    }
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
            $scope.ztlist(drr);
            console.log($scope.morenadds)
          }else{

          }
          console.log($scope.seladds)

        }
        //省市区3级信息
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
        $scope.ssq_add=function(){
          $scope.seladd(1);
           $scope.ztlist($scope.ztlist2_c);
           //$scope.addlist();
          $(".zt-tck").show();
        }
        $scope.ztbtn=function(){
            if($("#ztname").val()==''){
                $scope.alerttxt("请输入收货人！");
                return false;
            }
            if(!myreg.test($("#ztmobile").val())){
                $scope.alerttxt("请输入有效的手机号码！");
                return false;
            }
            var len=$('.zttck-box .zt-c-div2 li').length;
            if($scope.ztlists.length==0){
              $scope.alerttxt("请选择自提点！");
              return false;
            }
            var txt='';
            for(var i=0;i<len;i++){
              if($('.zttck-box .zt-c-div2 li').eq(i).find('.sel').hasClass('act')){
                json.since_id=$('.zttck-box .zt-c-div2 li').eq(i).find('.sel').attr('sid');//初始化自提点区id
                txt=$scope.ztlists[i].since_name+$scope.ztlists[i].since_address;
              }
            }
            json.since_fixed_mobile=$("#ztgdmobile").val();//初始化自提点固定电话
            json.since_people_name=$("#ztname").val();//初始化自提点姓名
            json.since_mobile=$("#ztmobile").val();//初始化自提点手机
            console.log(json.since_id+","+json.since_fixed_mobile+","+json.since_people_name);
            $scope.morenzt=json.since_people_name+'  '+txt+'('+json.since_mobile+')';
            $('.zt-addbox .zt-span').removeClass('act')
            $("#ztshow").addClass('act');
            $(".zt-tck").hide();
        }

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
                $scope.alerttxt("请输入收货地址！");
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
                    $scope.addlist();
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
                    //alert("删除成功");
                    $scope.addlist();
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }

        //商品列表
        if($location.search()['carids']){
          $http.post($scope.url+"/shoppingCarInterfaces.api?getShoppingCarsWithCarids",$.param({
              member_id:$cookieStore.get("member_id"),
              member_token:$cookieStore.get("member_token"),
              car_ids:$location.search()['carids'],
          }),
          {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
          ).success(function(data){
              console.log(data);
              if(data["status"]=="ok"){
                if(data['data'].length==0){
                    $scope.alerttxt('订单已经生成，即将前往我的订单继续付款。')
                    setTimeout("location.href='core.html#/wddd'",2000);
                }
                 $scope.qrddshoplist=data['data'];
                 $scope.yhqlist();
                 $scope.totalAmount=0;//总价
                 $scope.freight=0;//运费-->express_price
                  //json 的数据
                 json.orderBeans=[];//商户之后
                 var len=data['data'].length;
                 for(var i=0;i<len;i++){
                    var shlist={}
                    shlist.merchants_id=data['data'][i]['merchants_id'];
                    $scope.freight=$scope.freight+data['data'][i]['express_price'];//运费
                    shlist.remark="";
                    //初始化发票信息
                    shlist.invoice_type="no";//发票类型 no:不开票 paper:纸质发票（个人，单位），electron:电子发票 increment:增值税发票
                    shlist.invoice_rise_type="";//发票抬头类型 personal:个人 company:公司
                    shlist.invoice_company_name="";//"发票抬头是 单位时， 所需要的单位名称 个人时 个人姓名",
                    shlist.invoice_content="";//发票内容
                    shlist.invise_ticket_phone="";//收票人手机号
                    shlist.invise_ticket_email="";//收票人邮箱
                    shlist.invise_taxpayer_code="";//纳税人识别码
                    shlist.invise_register_time="";//注册时间
                    shlist.invise_register_address="";//注册地址
                    shlist.invise_register_phone="";//注册电话
                    shlist.invise_bank_name="";//开户银行
                    shlist.invise_bank_code="";//银行账号
                    shlist.orderGoodsBeans=[];
                    json.orderBeans.push(shlist);


                    var len2=data['data'][i]['shoppingCarBeans'].length;
                    for(var k=0;k<len2;k++){
                        $scope.totalAmount=$scope.totalAmount*1+$scope.qrddshoplist[i].shoppingCarBeans[k].car_total_pc_price*$scope.qrddshoplist[i].shoppingCarBeans[k].goods_num;
                        var shoplist={}
                        shoplist.goods_id=data['data'][i]['shoppingCarBeans'][k]['goods_id'];
                        shoplist.goods_num=data['data'][i]['shoppingCarBeans'][k]['goods_num'];
                        //shoplist.is_deduct_integral="0";
                        shoplist.orderParameterBeans=[];
                        var obj2 = data['data'][i]['shoppingCarBeans'][k]['goods_parameters'].split(",");
                        if(obj2[0]!=""){
                            for(var a=0;a<obj2.length;a++){
                                var aa={};
                                aa.parameter_id=obj2[a];
                                shoplist.orderParameterBeans.push(aa);
                            }
                        }

                        shoplist.orderServiceBeans=[];
                        shlist.orderGoodsBeans.push(shoplist)
                    }
                 }
              }else if (data["status"] == "pending" && data["error"] == "token failed"){
                  $scope.relogin()
              }else{
                  $scope.alerttxt(data['error'])
              }
          })
        }else if($location.search()['smid']){
          $http.post($scope.url+"/swInterfaces.api?getShoppingCarWithShare",$.param({
              member_id:$cookieStore.get("member_id"),
              member_token:$cookieStore.get("member_token"),
              member_car_id:$location.search()['smid'],
          }),
          {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
          ).success(function(data){
              console.log(data);
              if(data["status"]=="ok"){
                if(data['data'].length==0){
                    $scope.alerttxt('订单已经生成，即将前往我的订单继续付款。')
                    setTimeout("location.href='core.html#/wddd'",2000);
                }
                 $scope.qrddshoplist=data['data'];
                 $scope.yhqlist();
                 $scope.totalAmount=0;//总价
                 $scope.freight=0;//运费-->express_price
                  //json 的数据
                 json.orderBeans=[];//商户之后
                 var len=data['data'].length;
                 for(var i=0;i<len;i++){
                    var shlist={}
                    shlist.merchants_id=data['data'][i]['merchants_id'];
                    $scope.freight=$scope.freight+data['data'][i]['express_price'];//运费
                    shlist.remark="";
                    //初始化发票信息
                    shlist.invoice_type="no";//发票类型 no:不开票 paper:纸质发票（个人，单位），electron:电子发票 increment:增值税发票
                    shlist.invoice_rise_type="";//发票抬头类型 personal:个人 company:公司
                    shlist.invoice_company_name="";//"发票抬头是 单位时， 所需要的单位名称 个人时 个人姓名",
                    shlist.invoice_content="";//发票内容
                    shlist.invise_ticket_phone="";//收票人手机号
                    shlist.invise_ticket_email="";//收票人邮箱
                    shlist.invise_taxpayer_code="";//纳税人识别码
                    shlist.invise_register_time="";//注册时间
                    shlist.invise_register_address="";//注册地址
                    shlist.invise_register_phone="";//注册电话
                    shlist.invise_bank_name="";//开户银行
                    shlist.invise_bank_code="";//银行账号
                    shlist.orderGoodsBeans=[];
                    json.orderBeans.push(shlist);


                    var len2=data['data'][i]['shoppingCarBeans'].length;
                    for(var k=0;k<len2;k++){
                        $scope.totalAmount=$scope.totalAmount*1+$scope.qrddshoplist[i].shoppingCarBeans[k].car_total_pc_price*$scope.qrddshoplist[i].shoppingCarBeans[k].goods_num;
                        var shoplist={}
                        if($location.search()['outorin']==1){
                          shoplist.share_car_id=data['data'][i]['shoppingCarBeans'][k]['share_car_id'];
                        }
                        shoplist.goods_id=data['data'][i]['shoppingCarBeans'][k]['goods_id'];
                        shoplist.goods_num=data['data'][i]['shoppingCarBeans'][k]['goods_num'];
                        //shoplist.is_deduct_integral="0";
                        shoplist.orderParameterBeans=[];
                        var obj2 = data['data'][i]['shoppingCarBeans'][k]['goods_parameters'].split(",");
                        if(obj2[0]!=""){
                            for(var a=0;a<obj2.length;a++){
                                var aa={};
                                aa.parameter_id=obj2[a];
                                shoplist.orderParameterBeans.push(aa);
                            }
                        }

                        shoplist.orderServiceBeans=[];
                        shlist.orderGoodsBeans.push(shoplist)
                    }
                 }
              }else if (data["status"] == "pending" && data["error"] == "token failed"){
                  $scope.relogin()
              }else{
                  $scope.alerttxt(data['error'])
              }
          })
        }else{

        }
        //发票类型
        $http.post($scope.url+"/orderInterfaces.api?getOrderInviseContents",$.param({
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.fplxs=data['data'];
            }else if (data["status"] == "pending" && data["error"] == "token failed"){
                $scope.relogin()
            }else{
                $scope.alerttxt(data['error'])
            }
        })
        //显示对应的发票
        $scope.tckfp=function(arr){
            $(".fptck"+arr).show();
            $(".fptck-box").show();
        }
        $scope.tckfphide=function(arr){
            $(".fptck"+arr).hide();
            $(".fptck-box").hide();
        }
        //保存发票信息
        $scope.keepfpxx=function(arr){
            var jlen=json.orderBeans.length;
            for(var i=0;i<jlen;i++){
                if(json.orderBeans[i].merchants_id==arr){
                  var jlen2=$(".fptck"+arr).find('.fpzl span').length;
                  for(var k=0;k<jlen2;k++){
                    if($(".fptck"+arr).find('.fpzl span').eq(k).hasClass('act')){
                        var val=$(".fptck"+arr).find('.fpzl span').eq(k).attr('val');
                        console.log(val);
                        if(val=='bk'){
                          json.orderBeans[i].invoice_type="no";//发票类型 no:不开票 paper:纸质发票（个人，单位），electron:电子发票 increment:增值税发票
                          json.orderBeans[i].invoice_rise_type="";//发票抬头类型 personal:个人 company:公司
                          json.orderBeans[i].invoice_company_name="";//"发票抬头是 单位时， 所需要的单位名称 个人时 个人姓名",
                          json.orderBeans[i].invoice_content="";//发票内容
                          json.orderBeans[i].invise_ticket_phone="";//收票人手机号
                          json.orderBeans[i].invise_ticket_email="";//收票人邮箱
                          json.orderBeans[i].invise_taxpayer_code="";//纳税人识别码
                          json.orderBeans[i].invise_register_time="";//注册时间
                          json.orderBeans[i].invise_register_address="";//注册地址
                          json.orderBeans[i].invise_register_phone="";//注册电话
                          json.orderBeans[i].invise_bank_name="";//开户银行
                          json.orderBeans[i].invise_bank_code="";//银行账号
                          $(".qrdd-dp-box"+arr).find('.qrdd-paymode .txt').html('').text("不开发票")
                        }else if(val=='zz'){
                          if($(".fptck"+arr).find('.center').find('.zz .zz-gsordw span').eq(0).hasClass('act')){
                            json.orderBeans[i].invoice_rise_type="personal";//发票抬头类型 personal:个人 company:公司
                            json.orderBeans[i].invoice_company_name="";//"发票抬头是 单位时， 所需要的单位名称 个人时 个人姓名",
                          }else{
                            json.orderBeans[i].invoice_rise_type="company";//发票抬头类型 personal:个人 company:公司
                            var gsname=$(".fptck"+arr).find('.center').find('.zz .gsshow input').val();
                            if(gsname==""){
                                $scope.alerttxt('请输入公司抬头');
                                return false;
                            }
                            json.orderBeans[i].invoice_company_name=gsname;//"发票抬头是 单位时， 所需要的单位名称 个人时 个人姓名",
                          }
                          var jlen3=$(".fptck"+arr).find('.center').find('.zz .zz-fpcenter span').length;
                          for(var j=0;j<jlen3;j++){
                            if($(".fptck"+arr).find('.center').find('.zz .zz-fpcenter span').eq(j).hasClass('act')){
                                json.orderBeans[i].invoice_content=$(".fptck"+arr).find('.center').find('.zz .zz-fpcenter span').eq(j).text();//发票内容
                            }
                          }
                          json.orderBeans[i].invoice_type="paper";//发票类型 no:不开票 paper:纸质发票（个人，单位），electron:电子发票 increment:增值税发票
                          json.orderBeans[i].invise_ticket_phone="";//收票人手机号
                          json.orderBeans[i].invise_ticket_email="";//收票人邮箱
                          json.orderBeans[i].invise_taxpayer_code="";//纳税人识别码
                          json.orderBeans[i].invise_register_time="";//注册时间
                          json.orderBeans[i].invise_register_address="";//注册地址
                          json.orderBeans[i].invise_register_phone="";//注册电话
                          json.orderBeans[i].invise_bank_name="";//开户银行
                          json.orderBeans[i].invise_bank_code="";//银行账号
                          $(".qrdd-dp-box"+arr).find('.qrdd-paymode .txt').html('').text("纸质发票")
                        }else if(val=='dz'){
                          if($(".fptck"+arr).find('.center').find('.dz .zz-gsordw span').eq(0).hasClass('act')){
                            json.orderBeans[i].invoice_rise_type="personal";//发票抬头类型 personal:个人 company:公司
                            json.orderBeans[i].invoice_company_name="";//"发票抬头是 单位时， 所需要的单位名称 个人时 个人姓名",
                          }else{
                            json.orderBeans[i].invoice_rise_type="company";//发票抬头类型 personal:个人 company:公司
                            var gsname=$(".fptck"+arr).find('.center').find('.dz .gsshow input').val();
                            if(gsname==""){
                                $scope.alerttxt('请输入公司抬头');
                                return false;
                            }
                            json.orderBeans[i].invoice_company_name=gsname;//"发票抬头是 单位时， 所需要的单位名称 个人时 个人姓名",
                          }
                          var jlen3=$(".fptck"+arr).find('.center').find('.dz .zz-fpcenter span').length;
                          for(var j=0;j<jlen3;j++){
                            if($(".fptck"+arr).find('.center').find('.dz .zz-fpcenter span').eq(j).hasClass('act')){
                                json.orderBeans[i].invoice_content=$(".fptck"+arr).find('.center').find('.dz .zz-fpcenter span').eq(j).text();//发票内容
                            }
                          }
                          if($(".fptck"+arr).find('.center').find('.dz .dz-phone input').val()==''){
                             $scope.alerttxt('请输入收票人手机号');
                             return false;
                          }
                          if(!myreg.test($(".fptck"+arr).find('.center').find('.dz .dz-phone input').val())){
                              $scope.alerttxt('请输入规范的手机号');
                              return false;
                          }
                          if(!yxreg.test($(".fptck"+arr).find('.center').find('.dz .dz-email input').val())){
                              $scope.alerttxt("请输入有效的邮箱！");
                              return false;
                          }
                          json.orderBeans[i].invoice_type="electron";//发票类型 no:不开票 paper:纸质发票（个人，单位），electron:电子发票 increment:增值税发票
                          json.orderBeans[i].invise_ticket_phone=$(".fptck"+arr).find('.center').find('.dz .dz-phone input').val();//收票人手机号
                          json.orderBeans[i].invise_ticket_email=$(".fptck"+arr).find('.center').find('.dz .dz-email input').val();//收票人邮箱
                          json.orderBeans[i].invise_taxpayer_code="";//纳税人识别码
                          json.orderBeans[i].invise_register_time="";//注册时间
                          json.orderBeans[i].invise_register_phone="";//注册电话
                          json.orderBeans[i].invise_register_address="";//注册地址
                          json.orderBeans[i].invise_bank_name="";//开户银行
                          json.orderBeans[i].invise_bank_code="";//银行账号
                          $(".qrdd-dp-box"+arr).find('.qrdd-paymode .txt').html('').text("电子发票")
                        }else if(val=='zzs'){
                          json.orderBeans[i].invoice_type="increment";//发票类型 no:不开票 paper:纸质发票（个人，单位），electron:电子发票 increment:增值税发票
                          json.orderBeans[i].invoice_rise_type="";//发票抬头类型 personal:个人 company:公司
                          json.orderBeans[i].invoice_content="";//发票内容
                          json.orderBeans[i].invise_ticket_phone="";//收票人手机号
                          json.orderBeans[i].invise_ticket_email="";//收票人邮箱

                          if($(".fptck"+arr).find('.center').find('.zzs .zzs-name').val()==""){
                            $scope.alerttxt('请输入单位名称')
                            return false;
                          }
                          json.orderBeans[i].invoice_company_name=$(".fptck"+arr).find('.center').find('.zzs .zzs-name').val();//"发票抬头是 单位时， 所需要的单位名称 个人时 个人姓名",
                          if($(".fptck"+arr).find('.center').find('.zzs .zzs-sbm').val()==""){
                            $scope.alerttxt('请输入纳税人识别码')
                            return false;
                          }
                          json.orderBeans[i].invise_taxpayer_code=$(".fptck"+arr).find('.center').find('.zzs .zzs-sbm').val();//纳税人识别码
                          if($(".fptck"+arr).find('.center').find('.zzs .zzs-add').val()==""){
                            $scope.alerttxt('请输入注册地址');
                            return false;
                          }
                          json.orderBeans[i].invise_register_address=$(".fptck"+arr).find('.center').find('.zzs .zzs-add').val();//注册地址
                          if($(".fptck"+arr).find('.center').find('.zzs .zzs-phone').val()==""){
                            $scope.alerttxt('请输入注册电话')
                            return false;
                          }
                          if(!myreg.test($(".fptck"+arr).find('.center').find('.zzs .zzs-phone').val())){
                              $scope.alerttxt('请输入规范的手机号');
                              return false;
                          }
                          json.orderBeans[i].invise_register_phone=$(".fptck"+arr).find('.center').find('.zzs .zzs-phone').val();//注册电话
                          if($(".fptck"+arr).find('.center').find('.zzs .zzs-bank').val()==""){
                            $scope.alerttxt('请输入开户银行')
                            return false;
                          }
                          json.orderBeans[i].invise_bank_name=$(".fptck"+arr).find('.center').find('.zzs .zzs-bank').val();//开户银行
                          if($(".fptck"+arr).find('.center').find('.zzs .zzs-bankno').val()==""){
                            $scope.alerttxt('请输入银行账户')
                            return false;
                          }
                          json.orderBeans[i].invise_bank_code=$(".fptck"+arr).find('.center').find('.zzs .zzs-bankno').val();//银行账号
                          json.orderBeans[i].invise_register_time="";//注册时间

                          $(".qrdd-dp-box"+arr).find('.qrdd-paymode .txt').html('').text("增值税发票")
                        }
                    }
                  }
                }
            }
            $(".fptck"+arr).hide();
            $(".fptck-box").hide();
        }
        //积分兑换比例
        $http.post($scope.url+"/othersInterfaces.api?getPercent",$.param({
            percent_type:'integral',
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.jfbl=data["data"];
            }else{
                $scope.alerttxt(data['error'])
            }
        })
        //优惠券列表
        $scope.yhqlist=function(){
          $http.post($scope.url+"/couponInterfaces.api?getCoupons",$.param({
              member_id:$cookieStore.get("member_id"),
              member_token:$cookieStore.get("member_token"),
              coupon_state:'not_used',
              page:1,
              limit:100,
          }),
          {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
          ).success(function(data){
              console.log(data);
              if(data["status"]=="ok"){
                  $scope.yhqlists=[];//可使用
                  $scope.yhqlists2=[];//不可使用
                  var len0=data["data"].length;
                  for(var s=0;s<len0;s++){
                    var len=$scope.qrddshoplist.length;
                    for(var i=0;i<len;i++){
                      var len2=$scope.qrddshoplist[i].shoppingCarBeans.length;
                      var ddpaynum=0;//订单总价
                      var mmid=$scope.qrddshoplist[i].merchants_id;//商家id
                      for(var k=0;k<len2;k++){
                          ddpaynum=ddpaynum*1+$scope.qrddshoplist[i].shoppingCarBeans[k].car_total_pc_price*$scope.qrddshoplist[i].shoppingCarBeans[k].goods_num;
                      }
                      if(data["data"][s]['coupon_way']=='system'&&ddpaynum>=data["data"][s]['coupon_full_price']){
                         $scope.yhqlists.push(data["data"][s])
                      }else if(data["data"][s]['merchants_id']==mmid&&ddpaynum>=data["data"][s]['coupon_full_price']){
                         $scope.yhqlists.push(data["data"][s])
                      }else{
                         $scope.yhqlists2.push(data["data"][s])
                      }
                    }
                  }
              }else{
                  $scope.alerttxt(data['error'])
              }
          })
        }
        //积分2
        $scope.jfpay2=function(){
          if($('.qrdd-jf-select .select').hasClass('act')){

            $scope.jfpays=$scope.grxx_centers.integral/100>$scope.totalAmount*1+$scope.freight*1-$scope.yhqpays*1?($scope.totalAmount*1+$scope.freight*1-$scope.yhqpays*1)*$scope.jfbl.percent_value:$scope.grxx_centers.integral*$scope.jfbl.percent_value/100
            json.is_deduct_integral=1;
          }else{
            $scope.jfpays=0;
            json.is_deduct_integral=0;
          }
        }
        //优惠券
        $scope.yhqpays=0;//优惠券所减价格
        $scope.member_coupon_id='';
        $scope.yhqpay=function(index){
          if($('.q-y-list').eq(index).hasClass('act')){
            $scope.yhqpays=$scope.yhqlists[index].coupon_price;
            $scope.member_coupon_id=$scope.yhqlists[index].member_coupon_id;
          }else{
            $scope.yhqpays=0;
            $scope.member_coupon_id='';
          }
          $scope.jfpay2();

        }
        //积分
        $scope.jfpays=0;
        $scope.jfpay=function(){
          if($('.qrdd-jf-select .select').hasClass('act')){
            $scope.jfpays=0;
            json.is_deduct_integral=0;
          }else{
            $scope.jfpays=$scope.grxx_centers.integral/100>$scope.totalAmount*1+$scope.freight*1-$scope.yhqpays*1?($scope.totalAmount*1+$scope.freight*1-$scope.yhqpays*1)*$scope.jfbl.percent_value:$scope.grxx_centers.integral*$scope.jfbl.percent_value/100
            json.is_deduct_integral=1;
          }
        }
        //提交订单
        $scope.tjdd=function(){
            var jsonlen=json.orderBeans.length;
            for(var i=0;i<jsonlen;i++){
                json.orderBeans[i].remark=$('.qrdd-dp-box').eq(i).find(".qrdd-message input").val();

            }
            //判断是否选中自提点  否则删掉自提点内容
            if($("#ztshow").hasClass('act')){

            }else{
              json.since_id='';//自提点id
              json.since_fixed_mobile='';//自提点固定电话
              json.since_people_name='';//自提点姓名
              json.since_mobile='';//自提点手机
            }
            //优惠券id
            json.member_coupon_id=$scope.member_coupon_id;
            console.log(JSON.stringify(json));
            if(json.address_id==""){
                $scope.alerttxt('请添加地址');
                return false;
            }
            $http.post($scope.url+"/orderInterfaces.api?insertOrderV2",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                json:JSON.stringify(json),
                type:'pc'
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                  if(data['data']['order_actual_price']==0){
                    $scope.alerttxt('已抵扣全部金额，即将前往订单列表');
                    setTimeout("location.href='core.html#/wddd'",2000);
                  }else{
                    window.location.href="gwc.html#/gopay?orderid="+data['data']['order_ids']+"&paynum="+data['data']['order_actual_price']
                  }
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else if(data["status"] == "pending"){
                    $scope.alerttxt(data['error'])
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }


    })
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

    //去支付
    .controller('gopay',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.gwcjdshows(0);
        $scope.scrolltop(0);
        $scope.orderids=$location.search()['orderid'];
        $scope.paynum=$location.search()['paynum'];
        //
        $scope._payfs='';//初始化第三方支付方式
        //
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
            console.log(arr)
            if(!myreg.test(arr)){
                $scope.alerttxt("请输入有效的手机号码！");
            }else{
                $http.post($scope.url+"/othersInterfaces.api?sendCode",$.param({
                    mobile:arr,
                    code_type:"balance_pay",
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
        //余额支付是否开启
        $http.post($scope.url+"/othersInterfaces.api?getPercent",$.param({
            percent_type:'balance_pay',
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.yeopen=data["data"];
            }else{
                $scope.alerttxt(data['error'])
            }
        })
        //信用支付是否开启
        $http.post($scope.url+"/othersInterfaces.api?getPercent",$.param({
            percent_type:'trust_pay',
        }),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            console.log(data);
            if(data["status"]=="ok"){
                $scope.xyopen=data["data"];
            }else{
                $scope.alerttxt(data['error'])
            }
        })
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
                    code_type:"trust_pay",
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
    //添加银行卡
    .controller('addbank',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.gwcjdshows(0);
        $scope.scrolltop(0);

        $scope.banklistshows=0;
        $scope.banklistshow=function(arr){
            if(arr==0){
                $scope.banklistshows=1;
            }else{
                $scope.banklistshows=0;
            }
        }
        $scope.bank_pinyin=0;//银行简称
        $scope.bank_names='';//银行卡名称
        $scope.clickbank=function(arr,crr){//yhk的idor名字  银行简称
            $scope.bank_names=arr;
            $scope.bank_pinyin=crr;
            $scope.banklistshow(1);
        }
        $scope.banklists=_banklist;//储蓄卡 in bank.json
        //$scope.banklists2=_banklist2;//信用卡 in bank.json
        //添加银行卡
        $scope.addbanks=function(arr,brr,crr,drr){
            if($scope.bank_names==''){
                $scope.alerttxt('请选择银行');
                return false;
            }
            if(arr==''||arr==undefined){
                $scope.alerttxt('请填写卡号');
                return false;
            }
            //验证银行卡
            var yhknum=arr+'';
            var lastNum=yhknum.substring(yhknum.length-1,yhknum.length);//取出最后一位（与luhm进行比较）
            var first15Num=yhknum.substring(0,yhknum.length-1);//前15或18位
            var newArr=new Array();
            var sumTotal = 0;
            for(var i = first15Num.length-1,j=0;i>=0;i--,j++){
                    var yuansu= parseInt(first15Num[i]);
                    if(j%2==0){
                         yuansu *= 2;
                         yuansu = parseInt(yuansu/10)+parseInt(yuansu%10);
                        }
                    sumTotal += parseInt(yuansu);
            }
            //计算Luhm值
            var k= parseInt(sumTotal)%10==0?0:10-parseInt(sumTotal)%10;
            if(lastNum==k){
              //
            }else{
              $scope.alerttxt('请填写规范的卡号');
              return false;
            }
            //验证银行卡 end
            if(brr==''||brr==undefined){
                $scope.alerttxt('请填写持卡人姓名');
                return false;
            }
            if(crr==''||crr==undefined){
                $scope.alerttxt('请填写开户行');
                return false;
            }
            if(drr==''||drr==undefined){
                $scope.alerttxt('请填写手机号');
                return false;
            }
            if(!myreg.test(drr)){
              $scope.alerttxt("请输入有效的手机号码！");
              return false;
            }
            $http.post($scope.url+"/bankInterfaces.api?insertMemberBank",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                bank_name:$scope.bank_names,
                bank_pinyin:$scope.bank_pinyin,
                bank_user_name:brr,
                bank_code:arr,
                bank_open_name:crr,
                bank_mobile:drr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    if($location.search()['tixian']){
                      $scope.alerttxt('银行卡添加成功，即将返回提现页面');
                      setTimeout('window.location.href="core.html#/tixian"',2000)
                    }else{
                      $scope.alerttxt('银行卡添加成功，即将返回银行卡列表');
                      setTimeout('window.location.href="core.html#/yhk"',2000)
                    }
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.scrolltop(0)
    })
    //添加快捷银行卡
    .controller('kjbank',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.gwcjdshows(0);
        $scope.scrolltop(0);

        $scope.banklistshows=0;
        $scope.banklistshow=function(arr){
            if(arr==0){
                $scope.banklistshows=1;
            }else{
                $scope.banklistshows=0;
            }
        }
        $scope.selbank=0;//选择的是银行卡还是储蓄卡0没1有储蓄卡2信用卡
        $scope.bank_pinyin=0;
        $scope.bank_names=''
        $scope.clickbank=function(arr,brr,crr){//yhk的idor名字  储蓄卡1or信用卡2 银行简称
            $scope.bank_names=arr;
            $scope.selbank=brr;
            $scope.bank_pinyin=crr;
            $scope.banklistshow(1);
        }
        $scope.banklists=_banklist;//储蓄卡 in bank.json
        $scope.banklists2=_banklist2;//信用卡 in bank.json
        //添加银行卡
        $scope.addbanks=function(arr,brr,crr,drr){
            if($scope.bank_names==''){
                $scope.alerttxt('请选择银行');
                return false;
            }
            if(arr==''||arr==undefined){
                $scope.alerttxt('请填写卡号');
                return false;
            }
            //验证银行卡
            var yhknum=arr+'';
            var lastNum=yhknum.substring(yhknum.length-1,yhknum.length);//取出最后一位（与luhm进行比较）
            var first15Num=yhknum.substring(0,yhknum.length-1);//前15或18位
            var newArr=new Array();
            var sumTotal = 0;
            for(var i = first15Num.length-1,j=0;i>=0;i--,j++){
                    var yuansu= parseInt(first15Num[i]);
                    if(j%2==0){
                         yuansu *= 2;
                         yuansu = parseInt(yuansu/10)+parseInt(yuansu%10);
                        }
                    sumTotal += parseInt(yuansu);
            }
            //计算Luhm值
            var k= parseInt(sumTotal)%10==0?0:10-parseInt(sumTotal)%10;
            if(lastNum==k){
              //
            }else{
              $scope.alerttxt('请填写规范的卡号');
              return false;
            }
            //验证银行卡 end
            if(brr==''||brr==undefined){
                $scope.alerttxt('请填写持卡人姓名');
                return false;
            }
            if(crr==''||crr==undefined){
                $scope.alerttxt('请填写开户行');
                return false;
            }
            if(drr==''||drr==undefined){
                $scope.alerttxt('请填写手机号');
                return false;
            }
            if(!myreg.test(drr)){
              $scope.alerttxt("请输入有效的手机号码！");
              return false;
            }
            $http.post($scope.url+"/bankInterfaces.api?insertMemberBank",$.param({
                member_id:$cookieStore.get("member_id"),
                member_token:$cookieStore.get("member_token"),
                bank_name:$scope.bank_names,
                bank_pinyin:$scope.bank_pinyin,
                bank_user_name:brr,
                bank_code:arr,
                bank_open_name:crr,
                bank_mobile:drr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    if($location.search()['tixian']){
                      $scope.alerttxt('银行卡添加成功，即将返回提现页面');
                      setTimeout('window.location.href="core.html#/tixian"',2000)
                    }else{
                      $scope.alerttxt('银行卡添加成功，即将返回银行卡列表');
                      setTimeout('window.location.href="core.html#/yhk"',2000)
                    }
                }else if (data["status"] == "pending" && data["error"] == "token failed"){
                    $scope.relogin()
                }else{
                    $scope.alerttxt(data['error'])
                }
            })
        }
        $scope.scrolltop(0)
    })
    //微信支付
    .controller('wxpay',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.gwcjdshows(0);
        $scope.scrolltop(0);
        $scope.wxpayimg=$location.search()['img'];
        $scope.paynum=$location.search()['paynum'];
        $scope.orderstate=function(){
          $http.post($scope.url+"/orderInterfaces.api?getOneOrderDetail",$.param({
              member_id:$cookieStore.get("member_id"),
              member_token:$cookieStore.get("member_token"),
              order_id:$location.search()['orderid'],
          }),
          {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
          ).success(function(data){
              console.log(data);
              if(data["status"]=="ok"){
                  if(data['data']['order_state']=='wait_pay'){
                    $timeout($scope.orderstate,3000)
                  }else{
                    location.href="core.html#/"
                  }
              }else if (data["status"] == "pending" && data["error"] == "token failed"){
                  $scope.relogin()
              }else{
                  $scope.alerttxt(data['error'])
              }
          })
        }
        $scope.orderstate();
    })
    //忘记密码
    .controller('wjmm',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
        $scope.gwcjdshows(0);
        $scope.scrolltop(0)
        $scope.wjmmbtn=function(arr,brr,crr,drr){//手机号  验证码  密码 2次密码

          if(!myreg.test(arr)){
            $scope.alerttxt("请输入有效的手机号码！");
            return false;
          }
          if(brr==""){
            $scope.alerttxt("请输入验证码！");
            return false;
          }
          if(crr==""){
            $scope.alerttxt("请输入密码！");
            return false;
          }
          if(crr!=drr){
            $scope.alerttxt("2次密码不一致！");
            return false;
          }
          $http.post($scope.url+"/memberInterfaces.api?memberForgetPassword",$.param({
                member_account:arr,
                code:brr,
                password:crr,
            }),
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
            ).success(function(data){
                console.log(data);
                if(data["status"]=="ok"){
                    $scope.alerttxt("修改成功！");
                    setTimeout("location.href='index.html#/'",1000);
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
                    code_type:"forget_passwrod",
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


