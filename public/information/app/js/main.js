/*资讯列表*/
app.controller('informationList', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce) {
  console.log('资讯列表');
  /****************
  * 返回上一页
  ****************/
  $scope.backFun = function(){
    history.back();
  }

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
        console.log(data["data"])
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
.controller('informationDetails', ['$scope', '$rootScope', '$location', '$timeout', '$http', '$cookies', '$cookieStore', '$sce', function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore, $sce) {
  console.log('资讯详情');
  /****************
  * 返回上一页
  ****************/
  $scope.backFun = function(){
    history.back();
  }
  /*
  * 获取资讯详情
  */
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
        console.log(data["data"],1300)
      }
    })
}])





