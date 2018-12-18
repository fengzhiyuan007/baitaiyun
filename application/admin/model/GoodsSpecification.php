<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/6
 * Time: 下午5:51
 */

namespace app\admin\model;

use think\Session;
use think\Db;
use think\Validate;
class GoodsSpecification extends Common
{
    //只读字段
    protected $readonly = ['specification_id','parent_id','merchants_id'];

    protected $pk = 'specification_id';   //设置主键

    public function edit($data,$scene=''){
        $rule = [
            'specification_value'      => 'require',
        ];
        $message = [
            'specification_value' => '规格必须填写必须填写',
        ];
        $validate = new Validate($rule,$message);
        $valid = $validate->scene($scene)->check($data, '');
        if (!$valid) {
            return error($validate->getError());
        }
        if(empty($data['specification_id'])){
            $data['create_time'] = date("Y-m-d H:i:s",time());
            $result = $this->allowField(true)->isUpdate(false)->save($data);
            $sort = $this->specification_id;
            $this->allowField(true)->isUpdate(true)->save(['sort' => $sort], ['specification_id' => $this->specification_id]);
            $action = '新增';
        }else{
            $data['update_time'] = date("Y-m-d H:i:s",time());
            $where['specification_id'] = $data['specification_id'];
            $result = $this->allowField(true)->save($data, $where);
            $action = '编辑';
        }
        $url = Session::get('url');
        if ($result) {
            return success(['info' => $action . '规格操作成功', 'url' => $url]);
        } else {
            return error($action . '规格操作失败');
        }
    }

    /**
     * 软删除
     */
    public function soft_del($where){
        $data = [
            'is_delete'        => '1'
        ];
        $result = $this->save($data,$where);
        return $result;
    }

    /**
     * 真实删除
     */
    public function del($id){
        $result = $this->where(['specification_id'=>['in',$id]])->delete();
        return $result;
    }

    /**
     *恢复数据
     */
    public function restore($id){
        $data = [
            'is_delete'        => '0',
        ];
        $result = $this->save($data,['specification_id'=>['in',$id]]);
        return $result;
    }

}