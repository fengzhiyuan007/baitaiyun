/* 服务 */
app.factory('myFactory', function($http,$q,$timeout,$cookieStore,$cookies,$window) {
  var service = {};
  //post请求
  service.httpPost = function(api,data){
    console.log(api,data)
    var d = $q.defer();
    $http.post(
      url + api,
      $.param(data),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    )
    .success(function(res) { //读取数据的函数。
      d.resolve(res);
    })
    .error(function(){
      d.reject("error");
    });
    return d.promise;
  }
  /***************
  * 提示方法
  * 用于显示提示信息
  ***************/
  service.promptFun = function(txt, time) { //txt(提示文本)，time(时间)
    // $scope.promptTxt = txt;
    angular.element("#promptTxt").text(txt);
    angular.element("#promptBox").fadeIn(300);
    $timeout(function() {
      angular.element("#promptBox").fadeOut(300);
    }, time)
  }
  /***************
  * 提示方法
  * 用于提示后返回上一页
  ***************/
  service.promptBackFun = function(txt, time) { //txt(提示文本)，time(时间)
    angular.element("#promptTxt").text(txt);
    angular.element("#promptBox").fadeIn(300);
    $timeout(function() {
      angular.element("#promptBox").fadeOut(300);
      history.back();
    }, time)
  }
  /***************
  * 提示方法
  * 用于提示后返回上上一页
  ***************/
  service.promptBackTwoFun = function(txt, time) { //txt(提示文本)，time(时间)
      angular.element("#promptTxt").text(txt);
    angular.element("#promptBox").fadeIn(300);
    $timeout(function() {
      angular.element("#promptBox").fadeOut(300);
      history.go(-2);
    }, time)
  }
  /***************
  * 刷新页面
  ***************/
  service.reloadRoute = function () {
    $window.location.reload();
  }
  /* 登录失效方法 */
  service.loginFun = function(){
    $cookies.put("url", window.location.href, {path: "/"});
    window.location.href = url + "api/login/weixin"
  }
  /*获取店铺详情*/
  service.getShopDetails = function(merchants_id){
    return $http.post(
      url + "api/Mall/merchants_info",$.param({
        uid: $cookieStore.get("uid"),
        token: $cookieStore.get("token"),
        merchants_id : merchants_id
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(res){
      return Promise.resolve(res.data)
    }).error(function(e){
      return Promise.resolve(e)
    });
  }
  /*
  * 根据id获取html
  */
  // service.getHtml = function(id){
  //   return $http.post(
  //     url + "api/Merchant/ajax_agreement/id/" + id,$.param({}),
  //   ).success(function(res){
  //     return Promise.resolve(res.data)
  //   }).error(function(e){
  //     return Promise.resolve(e)
  //   });
  // }
  /*ping++支付回调*/
  service.pingCallbackFun = function (pingCallbackObj){
    console.log(pingCallbackObj)
    pingpp.createPayment(pingCallbackObj.charge, function (result, error) {
      if (result == "success") { 
        service.promptFun("支付成功",1300);
        pingCallbackObj.refresh();
      } else if (result == "fail") {
        service.promptFun("支付取消",1300);
      } else if (result == "cancel") {
        service.promptFun("支付失败",1300);
      }
    })
  }

  return service;
});