/* 轮播图指令 */
app.directive('repeatFinish',function(){
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
/*关闭新增地址model指令*/
.directive("closeAddressModel", [function() {
  return {
    link: function(scope, element, attributes) {
      element.click(function() {
        angular.element(".add_addressModel").hide();
      });
    }
  }
}])
/*倒计时指令*/
.directive("countDown", [function() {
  return {
    scope:{
      timesName:'@'
    },
    link: function(scope, element, attributes) {
      element.append("<div class='down'><span class='intHour'></span>小时<span class='minute'></span>分<span class='second'></span>秒</div>");
      /*倒计时*/
      scope.timers = setInterval(function () {
        scope.thenMillisecond = new Date().getTime();
        scope.Calculation = parseInt((scope.timesName - scope.thenMillisecond));//结束时间减去当前时间
        if (scope.Calculation > 0) {
          scope.int_hour = Math.floor(scope.Calculation / 3600 / 1000);//小时
          scope.int_hour2 = (scope.int_hour > 0 && scope.int_hour < 10) ? '0' + scope.int_hour : scope.int_hour;

          scope.Calculation -= scope.int_hour * 3600000;
          scope.int_minute = Math.floor(scope.Calculation / 60 / 1000);//分钟
          scope.int_minute2 = (scope.int_minute > 0 && scope.int_minute < 10) ? '0' + scope.int_minute : scope.int_minute;

          scope.Calculation -= scope.int_minute * 60000;
          scope.int_second = Math.floor(scope.Calculation / 1000);//秒
          scope.int_second2 = (scope.int_second >= 0 && scope.int_second < 10) ? '0' + scope.int_second : (scope.int_second || 0);
          element.find(".down").find(".intHour").text(scope.int_hour2);
          element.find(".down").find(".minute").text(scope.int_minute2);
          element.find(".down").find(".second").text(scope.int_second2);
        }else{
          clearInterval(scope.timers);
        }
      }, 1000);
    }
  }
}])
/*取消订单or确认收货or删除订单or退款*/
.directive('orderOperation',function($http,$cookieStore,myFactory){
  return {
  	restrict: 'A',
  	scope:{
  		orderMerchantsId:'@',
  		refresh: "&",
  		orderType: "@"
  	},
  	link: function($scope,$element, $attributes){
  		$element.click(function(){
  			console.log($scope.orderType)
  			if($scope.orderType==1){ // 取消订单
  				$scope.api = 'api/Order/cancelOrder';
  			}else if($scope.orderType==2){ // 确认收货
  				$scope.api = 'api/Order/receiveOrder';
  			}else if($scope.orderType==3){ // 删除订单
  				$scope.api = 'api/Order/delOrder';
  			}else if($scope.orderType==4){ // 退款
          $scope.api = 'api/Order/return_order';
        }
  			$http.post(
		      url + $scope.api,$.param({
		        uid : $cookieStore.get("uid"),
		        token : $cookieStore.get("token"),
		        order_merchants_id : $scope.orderMerchantsId
		      }),
		      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
		    ).success(function(data){
		      console.log(data);
		      if(data["status"] == 'ok'){
		      	myFactory.promptFun(data["data"],1300);
		      	$scope.refresh();
		      }else if(data["status"] == 'error'){
		        console.log(data['data']);
		        myFactory.promptFun(data["data"],1300);
		      }
		    })
  		})
  	}
  }
})
/*充值or未付款订单支付*/
.directive('payment',function($http,$cookieStore,myFactory){
  return {
    restrict: 'A',
    scope:{
      parameter: '@',
      payType: '@',
      refresh: "&"
    },
    link: function($scope,$element, $attributes){
      $element.click(function(){
        $scope.paramObj = {
          uid : $cookieStore.get("uid"),
          token : $cookieStore.get("token"),
          type: 'wx_pub',    //微信公众号支付
          openid: $cookieStore.get("openid")
        }
        if($scope.payType == 1){ // 充值
          $scope.payApi = 'api/Pingxx/ping';
          $scope.paramObj.price_list_id = $scope.parameter;
        }else if($scope.payType == 2){ // 未付款订单支付
          $scope.payApi = 'api/Pingxx/ping2';
          $scope.paramObj.order_no = $scope.parameter;
        }
        console.log($scope.paramObj)
        $http.post(
          url + $scope.payApi,$.param($scope.paramObj),
          {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
          console.log(data);
          if(data["status"] == 'ok'){
            $scope.pingCallbackObj = {
              charge : data["data"],
              refresh : $scope.refresh
            }
            myFactory.pingCallbackFun($scope.pingCallbackObj)
          }else if(data["status"] == 'error'){
            console.log(data['data']);
            myFactory.promptFun(data["data"],1300);
          }
        })
      })
    }
  }
})
/*订单评价跳转*/
.directive('goEvaluate',function($http,$cookieStore,$location,myFactory){
  return {
    restrict: 'A',
    scope:{
      orderBeans:'=',
      orderMerchantsId:'@'
    },
    link: function($scope,$element, $attributes){
      $element.click(function(){
        console.log($scope.orderBeans);
        sessionStorage.setItem("evaluateOrderBeans",JSON.stringify($scope.orderBeans));
        // $location.path("evaluateOrder").search({order_merchants_id:$scope.orderMerchantsId});
        window.location.href = "#/evaluateOrder?order_merchants_id=" + $scope.orderMerchantsId;
      })
    }
  }
})
/*商品收藏*/
.directive('commodity',function($http,$cookieStore,myFactory){
  return {
    restrict: 'A',
    scope:{
      parameter: '@',
      payType: '@',
      refresh: "&"
    },
    link: function($scope,$element, $attributes){
      $element.click(function(){
        $scope.paramObj = {
          uid : $cookieStore.get("uid"),
          token : $cookieStore.get("token"),
          goods_id :'',
        }
        $http.post(
          url + 'api/Mall/goods_collect',$.param($scope.paramObj),
          {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
          console.log(data);
          if(data["status"] == 'ok'){
            
          }else if(data["status"] == 'error'){
            console.log(data['data']);
            myFactory.promptFun(data["data"],1300);
          }
        })
      })
    }
  }
})
/*商城首页推荐信息模块指令(layout=3)*/
.directive('mallThreeHtml',function(){
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'app/views/template/mallThree.html',
    scope: {
      data3: '='
    },
    link: function($scope) {
      console.log($scope.data3)
    }
  }
})
/*商城首页推荐信息模块指令(layout=4)*/
.directive('mallFourHtml',function(){
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'app/views/template/mallFour.html',
    scope: {
      data4: '='
    },
    link: function($scope) {
      console.log(4)
    }
  }
})
/*商城首页推荐信息模块指令(layout=5)*/
.directive('mallFiveHtml',function(){
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'app/views/template/mallFive.html',
    scope: {
      data5: '='
    },
    link: function($scope) {
      console.log(5)
    }
  }
})
/*商城首页推荐信息模块指令(layout=6)*/
.directive('mallSixHtml',function(){
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'app/views/template/mallSix.html',
    scope: {
      data6: '='
    },
    link: function($scope) {
      console.log(6)
    }
  }
})





