<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/22
 * Time: 下午5:41
 */

namespace app\admin\controller;


use think\Controller;
use think\Request;

class MyError extends Controller
{

    public function _empty(){
        //根据当前控制器名来判断要执行那个城市的操作
        $this->view->engine->layout(false);
        return $this->fetch('common/error');

    }
}