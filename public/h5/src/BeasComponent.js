/**
 * Created by liuweifeng on 17/11/14.
 */
function getPostHttp(index,url,params){
    var scoprUrl = 'http://dspx.tstmobile.com';
    var value = sessionStorage.getItem("key");
    var value1 = JSON.parse(value);
    /*params["ID"] = value1.ID+"";
    params["app_token"] = value1.app_token+"";*/
    console.log(params);
    $.ajax({
        type: "post",
        dataType: "json",
        url:scoprUrl+url,
        data:params,
        success: function(data){
            if(data["status"] == "ok"){
                doSuccess(index,data);
            }else if(data["status"] == "error"){
                doFailed(index,data.error)
            }else{
                doPending(index,data.error)
            }
        },
        error :function(error){
            doFailed(index,data.error)
        }
    });
}


function doSuccess(index,data){

}

function doFailed(index,error){
    //showTipShort(error)
    alert(error);
}


function doPending(index,error){
    if(error==='token failed'){
        //this.props.history.push("/");
        window.location.href= htmlurl+"ai_kang_index.html";
    }else{
        toast.show(error);
    }
}


/*var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
app.controller('/',function($scope, $rootScope, $location, $timeout, $http, $cookies, $cookieStore){
    $scope.url='http://dspx.tstmobile.com';
    $rootScope.getPostHttp = function(index,url,params){
        $http.post($scope.url+url,
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            if(data["status"]=="ok"){
                $rootScope.doSuccess(index,data)
            }else if(data["status"]=="error"){
                $rootScope.doFailed(index,data.error);
            }else{
                $rootScope.doPending(index,error);
            }
        }).error(function(error){
            $rootScope.doFailed(index,error)
        })
    }



    $rootScope.doSuccess = function(index,data){

    }

    $rootScope.doFailed = function(index,error){
        console.log(error);
    }

    $rootScope.doPending = function(index,error){
        if(error==='token failed'){
            //this.props.history.push("/");
            window.location.href= $scope.url+"/h5/index.html";
        }else{

        }
    }

})*/


/*
app.service('myService', function($http) {
    /!*this.name = "service";
    this.myFunc = function (x) {
        return x.toString(16);//转16进制
    }
    this.getData = function(){
        var d = $q.defer();
        $http.get("ursl")//读取数据的函数。
            .success(function(response) {
                d.resolve(response);
            })
            .error(function(){
                alert(0)
                d.reject("error");
            });
        return d.promise;
    }*!/

    //请求的路径
    this.url='http://dspx.tstmobile.com';
    //数据请求的方法
    this.getPostHttp = function(index,url,params){
        $http.post($scope.url+url,
            {headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        ).success(function(data){
            if(data["status"]=="ok"){
                $rootScope.doSuccess(index,data)
            }else if(data["status"]=="error"){
                this.doFailed(index,data.error);
            }else{
                $rootScope.doPending(index,error);
            }
        }).error(function(error){
            $rootScope.doFailed(index,error)
        })
    }

    //成功后要执行的方法
    this.doSuccess = function(index,data){

    }


    //失败后执行的方法
    this.doFailed = function(index,error){
        console.log(error);
    }



    //服务错误执行的方法
    this.doPending = function(index,error){
        if(error==='token failed'){
            //this.props.history.push("/");
            window.location.href= $scope.url+"/h5/index.html";
        }else{

        }
    }


});*/
