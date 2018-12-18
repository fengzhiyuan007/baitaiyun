<?php
namespace app\admin\model;
use think\Model;
use think\Session;
use think\Request;
class PriceList extends Common {

    public function auth($data){
//        if(empty($data['price'])){
//            return array('status'=>'error','info'=>'价格不能为空','class'=>'price');
//        }
//        if(!ctype_digit($data['price'])){
//            return array('status'=>'error','info'=>'请填写整型数字','class'=>'price');
//        }
//        if(empty($data['diamond'])){
//            return array('status'=>'error','info'=>'充值秘豆不能为空','class'=>'diamond');
//        }
//        if(!ctype_digit($data['diamond'])){
//            return array('status'=>'error','info'=>'请填写整型数字','class'=>'diamond');
//        }

        if(empty($data['id'])){
            $data['intime'] = time();
            $result = DB::name('PriceList')->save($data);
            $action = '新增';
        }else{
            $data['uptime'] = time();
            $result = DB::name('PriceList')->where(['price_list_id'=>$data['id']])->update($data);
            $action = '编辑';
        }
        if($result){
            return array('status' => 'ok', 'info' => $action . '记录成功!', 'url' => session('url'));
        }else{
            return array('status' => 'error', 'info' => $action . '记录失败','url'=> session('url'));
        }
    }
}