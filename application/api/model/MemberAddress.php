<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/10/11
 * Time: 上午9:26
 */

namespace app\api\model;

use think\Db;
class MemberAddress extends Common
{
    //只读字段
    protected $readonly = ['address_id','member_id'];

    protected $pk = 'address_id';   //设置主键

    public function edit_address($data){
        $validate = validate('MemberAddress');
        $valid = $validate->check($data);
        if(!$valid){
            return error($validate->getError());
        }

        $model = new MemberAddress();
        $address = $data['address_province'].$data['address_city'].$data['address_country'].$data['address_detailed'];
        if(empty($data['address_id'])){
            $data['create_time'] = date("Y-m-d H:i:s",time());
            $position = $this->getLonLat($address);// 获取地址经纬度
            if($position[0]) {
                $data['address_longitude'] = $position[0];
                $data['address_latitude'] = $position[1];
            }
            $action = '新增';
            $check = $this->where(['member_id'=>$data['member_id'],'is_default'=>'1','is_delete'=>'0'])->find();//查询是否存在默认地址
            if(!$check){
                $data['is_default'] = 1;
            }
            $result = $model->allowField(true)->save($data);
            $address_id = $model->address_id;
        }else{
            $check = $this->queryAddressByID(['address_id'=>$data['address_id']]);
            $address2 = $check['address_province'].$check['address_city'].$check['address_country'].$check['address_detailed'];
            if($address != $address2){
                $position = $this->getLonLat($address);// 获取地址经纬度
                if($position[0]) {
                    $data['address_longitude'] = $position[0];
                    $data['address_latitude'] = $position[1];
                }
            }
            $data['update_time'] = date("Y-m-d H:i:s",time());
            $where = [
                'address_id'    =>  $data['address_id']
            ];
            $result = $model->allowField(true)->save($data,$where);
            $address_id = $check['address_id'];
            $action = '编辑';
        }
        if($result){
            if($data['is_default'] == '1'){
                $model->where(['member_id'=>$data['member_id'],'address_id'=>['neq',$address_id],'is_delete'=>'0'])->update(['is_default'=>'0']);
            }
            return success($action.'收货地址成功');
        }else{
            return error($action.'收货地址失败');
        }

    }


    //根据条件查询单条记录
    public function queryAddressByID($where=[]){
        $address = $this->where($where)->find();
        return $address;
    }

    //根据查询记录总数
    public function queryAddressCount($where=[]){
        $count = $this->where($where)->count();
        return $count;
    }

    //根据相关条件查询并分页
    public function queryMember($where = []){
        $list = $this->where($where)
                ->order("is_default desc,create_time desc")->select();
        return $list;
    }

    /**
     * 软删除
     */
    public function soft_del($where){
        $data = [
            'is_delete'        => '1',
        ];
        $result = $this->save($data,$where);
        $check = $this->where($where)->find();
        if($result && $check['is_default'] == '1'){
            $last = $this->where(['member_id'=>$where['member_id'],'is_delete'=>'0'])->limit(1)->order("address_id desc")->find();
            if($last){
                $this->where(['address_id'=>$last['address_id']])->update(['is_default'=>'1']);
            }
        }
        return $result;
    }

    /**
     * 真实删除
     */
    public function del($id){
        $result = $this->where(['address_id'=>$id])->delete();
        return $result;
    }

    /**
     * 默认操作
     */
    public function defaultAddress($address_id,$member_id){
        $result = $this->save(['is_default'=>'1'],['address_id'=>$address_id,'member_id'=>$member_id]);
        if(!$result)    return false;
        $this->save(['is_default'=>'0'],['address_id'=>['neq',$address_id],'member_id'=>$member_id,'is_delete'=>'0']);
        return true;
    }

}