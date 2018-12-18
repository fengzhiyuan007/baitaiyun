
var url = location.href.split(".com")[0] + '.com/';

var app = angular.module("app", ['ng', 'ngRoute', 'ngCookies', "ngTouch"]);

/*路由*/
app.config(function($routeProvider, $locationProvider,$compileProvider) {
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|sms|javascript):/);
  $routeProvider
  /*首页*/
  .when("/", {
    templateUrl: "app/views/informationList.html",
    controller: "informationList"
  })
  /**************************** 资讯 start *******************************/
  /*资讯列表*/
  .when("/informationList",{
    templateUrl: "app/views/informationList.html",
    controller: "informationList"
  })
  /*资讯详情*/
  .when("/informationDetails",{
    templateUrl: "app/views/informationDetails.html",
    controller: "informationDetails"
  })
  /**************************** 资讯 end *******************************/
  .otherwise({
    redirectTo: "/"
  })
})


