<?php
/**
 * Created by PhpStorm.
 * User: zhengan
 * Date: 18/1/9
 * Time: 下午3:23
 */

namespace app\api\model;

use think\Db;
use think\Request;
use think\Session;
class Merchants extends Common
{
    protected $readonly = ['merchants_id','member_id'];

    protected $pk = 'merchants_id';   //设置主键
    public function edit_merchants($param){
        $result = $this->allowField(true)->save($param);
        return $result;
    }
}