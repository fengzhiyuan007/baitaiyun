<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/22
 * Time: 下午5:41
 */

namespace app\api\controller;


use think\Controller;
use think\Request;

class MyError extends Controller
{

    public function _empty(){
        header('Content-Type: application/json');
        header("Content-type:text/html;charset=utf-8");
        //根据当前控制器名来判断要执行那个城市的操作
        return error("操作失败");

    }
}