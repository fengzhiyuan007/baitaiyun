var app=angular.module('app',['ng', 'ngRoute', 'ngAnimate','ngTouch','ngCookies'])
.config(function($routeProvider){
	$routeProvider
	//首页
	.when("/",{
		templateUrl:"gwc/gwc2.html",
		controller:"gwc",
	})
	.when("",{
		templateUrl:"gwc/gwc2.html",
		controller:"gwc",
	})
	.when("/gwcin",{
		templateUrl:"gwc/gwcin.html",
		controller:"gwcin",
	})
	.when("/gwcout",{
		templateUrl:"gwc/gwcout.html",
		controller:"gwcout",
	})
	.when("/qrdd",{
		templateUrl:"gwc/qrdd.html",
		controller:"qrdd"
	})
	.when("/gopay",{
		templateUrl:"gwc/gopay.html",
		controller:"gopay"
	})
	.when("/addbank",{
		templateUrl:"gwc/addbank.html",
		controller:"addbank"
	})
	.when("/kjbank",{
		templateUrl:"gwc/kjbank.html",
		controller:"kjbank"
	})
	.when("/wxpay",{
		templateUrl:"gwc/wxpay.html",
		controller:"wxpay"
	})
	.when("/wjmm",{
		templateUrl:"gwc/wjmm.html",
		controller:"wjmm"
	})

	.otherwise({
	    redirectTo: "/"
	})
})