<?php
/**
 * Created by PhpStorm.
 * User: zhengan
 * Date: 2018/1/29
 * Time: 下午7:18
 */

namespace app\admin\model;

use think\Request;
use think\Session;
class LiveStore extends Common
{
    protected $pk = 'live_store_id';
    //只读字段
    protected $readonly = ['live_store_id'];

    /**
     *新增或编辑
     */
    public function edit_record($data){
        $validate = validate('LiveStore');
        $valid = $validate->check($data,'');
        if(!$valid){
            return error($validate->getError());
        }
        $data['play_img'] = $this->domain($data['play_img']);
        $str = 'http://play.100ytv.com/';
        if(strpos($data['url'],$str) ===false){
            $data['url'] = $str.$data['url'];
        }
        if(empty($data['live_store_id'])){
            $data['intime'] = time();
            $data['date'] = date('Y-m-d H:i',time());
            $action = '新增';
            $result = $this->allowField(true)->save($data);
        }else{
            $action = '编辑';
            $result = $this->allowField(true)->save($data,['live_store_id'=>$data['live_store_id']]);
        }
        $url = Session::get('url');
        if($result){
            return success(['info'=>$action.'录播视频成功','url'=>$url]);
        }else{
            return error($action.'录播视频成功失败');
        }
    }
}