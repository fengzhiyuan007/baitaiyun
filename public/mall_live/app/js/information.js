/*资讯列表*/
app.controller('informationList', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('资讯列表');
  /*
  * 获取资讯列表
  */
  $scope.informationListInfo = []
  $scope.getInformationListFun = function (page) {
    $scope.page = page;
    $http.post(
      url + 'api/Home/article',
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data)
      if(data["status"] == 'ok'){
        $scope.allPage = data["data"]["page"];
        $scope.informationListInfo.push.apply($scope.informationListInfo, data["data"]["list"]);
      }else if(data["status"] == 'error'){
        myFactory.promptFun(data["data"],1300);
      }
    })
  }
  $scope.getInformationListFun();
  /*滚动加载*/
  angular.element(window).scroll(function() {
    $scope.wTop = angular.element(window).scrollTop();
    $scope.bTop = angular.element("body").height();
    $scope.dTop = angular.element(document).height();
    if ($scope.wTop + $scope.bTop >= $scope.dTop) { //下拉到底部加载
      if ($scope.allPage > $scope.page) {
        $scope.getInformationListFun(++$scope.page);
      }
    }
  })
}])
/*资讯详情*/
.controller('informationDetails', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce','myFactory', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce,myFactory) {
  console.log('资讯详情');
  $http.post(
      url + 'api/Home/article_view',$.param({
      	id: $location.search()["info_id"]
      }),
      {headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'}}
    ).success(function(data){
      console.log(data)
      if(data["status"] == 'ok'){
      	$scope.informationDetails = data["data"];
      	$scope.informationContent = $sce.trustAsHtml(data["data"].content); 
      }else if(data["status"] == 'error'){
        myFactory.promptFun(data["data"],1300);
      }
    })
}])