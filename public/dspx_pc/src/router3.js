var app=angular.module('app',['ng', 'ngRoute', 'ngAnimate','ngTouch','ngCookies'])
.config(function($routeProvider){
	$routeProvider
	//首页
	.when("/",{
		templateUrl:"core/index2.html",
		controller:"core",
	})
	.when("",{
		templateUrl:"core/index2.html",
		controller:"core",
	})
	.when("/core",{
		templateUrl:"core/index2.html",
		controller:"core",
	})
	.when("/wddd",{
		templateUrl:"core/wddd.html",
		controller:"wddd",
	})
	.when("/ddxq",{
		templateUrl:"core/ddxq.html",
		controller:"ddxq",
	})
	.when("/spsc",{
		templateUrl:"core/spsc.html",
		controller:"spsc"
	})
	.when("/wdjf",{
		templateUrl:"core/wdjf.html",
		controller:"wdjf"
	})
	.when("/yhq",{
		templateUrl:"core/yhq.html",
		controller:"yhq"
	})
	.when("/yhk",{
		templateUrl:"core/yhk.html",
		controller:"yhk"
	})
	.when("/xyed",{
		templateUrl:"core/xyed.html",
		controller:"xyed"
	})
	.when("/tksq",{
		templateUrl:"core/tksq.html",
		controller:"tksq"
	})
	.when("/tkdd",{
		templateUrl:"core/tkdd.html",
		controller:"tkdd"
	})
	.when("/tkddxq",{
		templateUrl:"core/tkddxq.html",
		controller:"tkddxq"
	})
	.when("/tixian",{
		templateUrl:"core/tixian.html",
		controller:"tixian"
	})
	.when("/shdz",{
		templateUrl:"core/shdz.html",
		controller:"shdz"
	})
	.when("/qbcz",{
		templateUrl:"core/qbcz.html",
		controller:"qbcz"
	})
	.when("/pjdd",{
		templateUrl:"core/pjsd.html",
		controller:"pjdd"
	})
	.when("/sdxq",{
		templateUrl:"core/sdxq.html",
		controller:"sdxq"
	})
	.when("/pingjia",{
		templateUrl:"core/pingjia.html",
		controller:"pingjia"
	})
	.when("/grzl",{
		templateUrl:"core/grzl.html",
		controller:"grzl"
	})
	.when("/dpsc",{
		templateUrl:"core/dpsc.html",
		controller:"dpsc"
	})
	.when("/wdqb",{
		templateUrl:"core/wdqb.html",
		controller:"wdqb"
	})
	.when("/aqsz",{
		templateUrl:"core/aqsz.html",
		controller:"aqsz"
	})
	.when("/wdrz",{
		templateUrl:"core/wdrz.html",
		controller:"wdrz"
	})
	.when("/xyrz",{
		templateUrl:"core/xyrz.html",
		controller:"xyrz"
	})
	.when("/xyrzlist",{
		templateUrl:"core/xyrzlist.html",
		controller:"xyrzlist"
	})
	.when("/xyrzxq",{
		templateUrl:"core/xyrzxq.html",
		controller:"xyrzxq"
	})
	.when("/bzzx",{
		templateUrl:"core/bzzx.html",
		controller:"bzzx"
	})
	.when("/rule",{
		templateUrl:"core/rule.html",
		controller:"rule"
	})
	.when("/yjfk",{
		templateUrl:"core/yjfk.html",
		controller:"yjfk"
	})
	.otherwise({
	    redirectTo: "/"
	})
})