<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/10/21
 * Time: 下午3:55
 */

namespace app\merchant\model;

use think\Session;

class GoodsBrand extends Common
{
    //只读字段
    protected $readonly = ['brand_id','brand_uuid'];

    protected $pk = 'brand_id';   //设置主键

    public function edit($data,$scene=''){
        $validate = validate('GoodsBrand');
        $valid = $validate->scene($scene)->check($data,'');
        if(!$valid){
            return error($validate->getError());
        }
        $data['brand_img'] = $this->domain($data['brand_img']);
        if(empty($data['brand_id'])){
            $data['create_time'] = date("Y-m-d H:i:s",time());
            $action = '新增';
            $result = $this->isUpdate(false)->save($data);
            $sort = $this->brand_id;
            $this->isUpdate(true)->save(['sort'=>$sort],['brand_id'=>$this->brand_id]);
        }else{
            $data['update_time'] =   date("Y-m-d H:i:s",time());
            $action = '编辑';
            $where['brand_id'] = $data['brand_id'];
            $result = $this->allowField(true)->save($data,$where);
        }

        $url = Session::get('url');
        if($result){
            return success(['info'=>$action.'商品品牌操作成功','url'=>$url]);
        }else{
            return error($action.'商品品牌操作失败');
        }
    }

    /**
     *删除
     */
    public function soft_del($where){
        $result = $this->save(['is_delete'=>'1'],$where);
        if($result){
            $url = Session::get('url');
            return success(['info'=>'删除'.'品牌操作成功','url'=>$url]);
        }else{
            error("删除品牌操作失败");
        }
    }

    /**
     *删除
     */
    public function del($where){
        $result = $this->where($where)->delete();
        if($result){
            $url = Session::get('url');
            return success(['info'=>'删除'.'品牌操作成功','url'=>$url]);
        }else{
            error("删除品牌操作失败");
        }
    }

    /**
     *查询
     */
    public function queryByCode($where){
        $result = $this->where($where)->find();
        return $result;
    }
}