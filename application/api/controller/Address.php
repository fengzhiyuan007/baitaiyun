<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/10/11
 * Time: 上午9:19
 */

namespace app\api\controller;


use think\Request;

class Address extends Common
{
    /**
     *增加收获地址
     */
    public function insertAddress(){
        if (Request::instance()->isPost()) {
            $member = $this->checklogin();
            $data = Request::instance()->post();
            $model = model('MemberAddress');
            $data['member_id'] = $member['member_id'];
            $result = $model->edit_address($data);
            return $result;
        }
    }

    /**
     *编辑收货地址
     */
    public function saveAddress(){
        if (Request::instance()->isPost()) {
            $member = $this->checklogin();
            $data = Request::instance()->post();
            if(empty($data['address_id']))    error("编辑地址错误");
            $where = [
                'address_id'    =>  $data['address_id'],
                'member_id'     =>  $member['member_id']
            ];
            $model = model('MemberAddress');
            $check = $model->queryAddressByID($where);
            if(!$check)                      error("编辑地址错误");
            $data['member_id'] = $member['member_id'];
            $result = $model->edit_address($data);
            return $result;
        }
    }

    /**
     *地址列表
     */
    public function queryAddressList(){
        if (Request::instance()->isPost()) {
            $member = $this->checklogin();
//            $p = input('p');
//            $p ? $p  :  $p = 1;
//            $pagesize = input('pagesize');
//            $pagesize  ?    $pagesize   :   $pagesize = 10;
            $model = model('MemberAddress');
            $where = [
                'member_id' =>  $member['member_id'],
                'is_delete' =>  '0'
            ];
//            $count = $model->queryAddressCount($where);
//            $page = ceil($count/$pagesize);
            $list = $model->queryMember($where);
            success($list);
        }
    }

    /**
     *地址查询单条
     */
    public function queryAddress(){
        if (Request::instance()->isPost()) {
            $member = $this->checklogin();
            $address_id = input('address_id');
            if(!$address_id)        error("地址id错误");
            $where = [
                'member_id' =>  $member['member_id'],
                'address_id' => $address_id,
            ];
            $model = model('MemberAddress');
            $address = $model->queryAddressByID($where);
            if($address){
                success($address);
            }else{
                error("地址id错误");
            }
        }
    }

    /**
     *地址默认操作
     */
    public function saveDefaultAddress(){
        if (Request::instance()->isPost()) {
            $member = $this->checklogin();
            $address_id = input('address_id');
            if(!$address_id)        error("地址id错误");
            $model = model('MemberAddress');
            $address = $model->defaultAddress($address_id,$member['member_id']);
            if($address){
                success("地址默认操作成功");
            }else{
                error("地址默认操作失败");
            }
        }
    }

    /**
     *删除地址
     */
    public function delAddress(){
        if (Request::instance()->isPost()) {
            $member = $this->checklogin();
            $address_id = input('address_id');
            if(!$address_id)        error("地址id错误");
            $where = [
                'member_id' =>  $member['member_id'],
                'address_id' =>  $address_id
            ];
            $model = model('MemberAddress');
            $address = $model->soft_del($where);
            if($address){
                success("地址删除成功");
            }else{
                error("地址删除失败");
            }
        }
    }

    /**
     *查询默认地址
     */
    public function queryDefaultAddress(){
        if (Request::instance()->isPost()) {
            $member = $this->checklogin();
            $where = [
                'member_id'     =>  $member['member_id'],
                'is_delete'     =>  '0',
                'is_default'    =>  '1'
            ];
            $model = model('MemberAddress');
            $address = $model->queryAddressByID($where);
            if($address){
                success($address);
            }else{
                success((object)null);
            }
        }
    }
}