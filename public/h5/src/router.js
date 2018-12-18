var app=angular.module('app',['ng', 'ngRoute', 'ngAnimate','ngTouch','ngCookies','me-lazyload'])//,'ui.bootstrap'
.config(function($routeProvider){
	$routeProvider
	//首页
	.when("/",{
		templateUrl:"index/home.html",
		controller:"homes",
	})
	.when("",{
		templateUrl:"index/home.html",
		controller:"homes",
	})
	.when("/homes",{
		templateUrl:"index/home.html",
		controller:"homes",
	})
	.when("/shoplist",{
		templateUrl:"index/shoplist.html",
		controller:"shoplist"
	})
	.when("/shop",{
		templateUrl:"index/shop.html",
		controller:"shop"
	})
	.otherwise({
	    redirectTo: "/"
	})
})

app.run(['$rootScope', '$location', '$http', '$cookieStore',function($rootScope, $location, $http,$cookieStore) {
	/* 监听路由的状态变化 */
	$rootScope.$on('$routeChangeSuccess', function(evt, current, previous){
		
		if($location.path() == '/'){
			$rootScope.listShowHide = true;
		}else{
			$rootScope.listShowHide = false;
		}
		//登入内容显示应该
		$rootScope.LoginContentShowHide = true;
		$rootScope.LogoutContentShowHide = false;
		$rootScope.hx_username="";
		$rootScope.phone="";
		if(JSON.parse(sessionStorage.getItem('key')) == "" || JSON.parse(sessionStorage.getItem('key')) == null){
			$rootScope.UsersID = "";
			$rootScope.UsersAppToken="";
		}else{
			var usersData = sessionStorage.getItem('key');
			var users = JSON.parse(usersData);
			$rootScope.LoginContentShowHide = false;
			$rootScope.LogoutContentShowHide = true;
			$rootScope.hx_username=users.hx_username;
			$rootScope.phone=users.phone;
			$rootScope.UsersID = users.member_id;
			$rootScope.UsersAppToken=users.app_token;

			$http.post("http://dspx.tstmobile.com/api/Mall/getShopCarCount",$.param({
					uid:users.member_id,
					token:users.app_token
				}),
				{headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
			).success(function(data){
				if(data["status"]=="ok"){
					$rootScope.ShoppingCartQuantity = data["data"];
				}
			})
		}

	});







}])