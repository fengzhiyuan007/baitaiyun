<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/20
 * Time: 下午5:22
 */

namespace app\admin\model;

use think\Db;
use think\Request;
use think\Session;
use think\Validate;
class Coupon extends Common
{
    //只读字段
    protected $readonly = ['coupon_id'];
    protected $pk = 'coupon_id';   //设置主键
    public function edit_common($data,$scene){
        $validate = validate('Coupon');
        $valid = $validate->scene($scene)->check($data, '');
        if (!$valid) {
            return error($validate->getError());
        }
//        $data['img'] = $this->domain($data['img']);
        if(empty($data['start_time'])){
            $data['start_strtotime'] = time();
            $data['start_time'] = date('Y-m-d',time());
        }else{
            $data['start_strtotime'] = strtotime($data['start_time']);
        }
        $data['end_strtotime'] = strtotime($data['end_time']);
        if(empty($data['coupon_id'])){
            $data['intime'] = date('Y-m-d H:i:s',time());
            $result = $this->allowField(true)->save($data);
            $action = '添加';
        }else{
            $data['uptime'] = date('Y-m-d H:i:s',time());
            $result = $this->allowField(true)->save($data,[$this->pk=>$data['coupon_id']]);
            $action = '编辑';
        }
        $url = Session::get('url');
        if ($result) {
            return success(['info' => $action . '优惠券操作成功', 'url' => $url]);
        } else {
            return error($action . '优惠券操作失败');
        }
    }

    /**
     * 软删除
     */
    public function soft_del($id){
        $data = [
            'is_delete'        => '1'
        ];
        $result = $this->save($data,[$this->pk=>['in',$id]]);
        return $result;
    }

    /**
     * 真实删除
     */
    public function del($id){
        $result = $this->where([$this->pk=>['in',$id]])->delete();
        return $result;
    }

    /**
     *恢复数据
     */
    public function restore($id){
        $data = [
            'is_delete'        => '0',
        ];
        $result = $this->save($data,[$this->pk=>['in',$id]]);
        return $result;
    }

    /**
     *修改状态
     */
    public function change_status($id){
        $status = $this->where([$this->pk=>$id])->value('status');
        if(!$status)     return false;
        $abs = 3 - $status;
        //$arr = ['默认状态','开启状态'];
        $result = $this->save(['status'=>$abs],[$this->pk=>$id]);
        if($result){
            return $abs;
        }else{
            return false;
        }
    }
}