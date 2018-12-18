<?php
namespace app\admin\model;
use think\Model;
use think\Session;
use think\Request;
class Gift extends Common {
    public function auth($data){
        if(empty($data['img'])){
            return array('status'=>'error','info'=>'图片不能为空','class'=>'img');
        }
        if(empty($data['price'])){
            return array('status'=>'error','info'=>'价格不能为空','class'=>'price');
        }
        $data['img'] = $this->domain($data['img']);
        if(empty($data['gift_id'])){
            $data['intime'] = time();
            $result = $this->save($data);
            $action = '新增';
        }else{
            $data['uptime'] = time();
            $result = $this->where(['gift_id'=>$data['gift_id']])->update($data);
            $action = '更新';
        }
        if($result){
            $data= array('status'=>'ok','info'=>$action.'记录成功','url'=>session('url'),'class'=>'');
            return success($data);
        }else{
            $data =array('status'=>'ok','info'=>$action.'记录失败','class'=>'');
            return error($data);
        }
    }
}