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
	.when("/gwc.html",{
		templateUrl:"gwc/gwc2.html",
		controller:"gwc",
	})
	.otherwise({
	    redirectTo: "/"
	})
})