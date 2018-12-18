/*成为卖家*/
app.controller('becomeSeller', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('成为卖家');
  /*
  * 获取入驻协议
  */
  $scope.getHtml(3);

}])
/*填写资料*/
.controller('fillUserInfo', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('填写资料');
  //初始化资料json
  $scope.dataJson = {
  	contact_name: '',  //姓名
  	contact_mobile: '',  //联系电话
  	merchants_name: '',  //店铺名称
  	merchants_address: '',  //店铺地址
  	business_number: ''  //营业证号
  }
}])