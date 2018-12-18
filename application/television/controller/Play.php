<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/26
 * Time: 下午5:25
 */
namespace app\television\controller;
use think\Controller;
use think\Db;
use think\Request;
class Play extends Base{
    /**
     *@观看直播
     */
    public function play_live(){
        $id = input('id');
        $re = DB::name('live')->where(['live_id'=>$id])->find();
        $this->assign('re',$re);
        $this->view->engine->layout(false);
        return $this->fetch();
    }
    /**
     *@观看录播
     */
    public function play_record(){
        $id = input('id');
        $re = DB::name('LiveStore')->where(['live_store_id'=>$id])->find();
        $this->assign('re',$re);
        $this->view->engine->layout(false);
        return $this->fetch();
    }
}
