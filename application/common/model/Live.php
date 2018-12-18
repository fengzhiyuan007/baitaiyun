<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/27
 * Time: 上午10:19
 */
namespace app\common\model;
use think\Model;
class Live extends Model{
    public function live_test(){
        $re = $this->where(["live_id"=>8415])->find();
        return $re;
    }
}