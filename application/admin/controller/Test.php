<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/12/12
 * Time: 下午3:07
 */

namespace app\admin\controller;


class Test extends Base
{
    public $arr = array();
    public function index(){
        array_push($this->arr,'a');
        pre($this->arr);
    }
}