<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/17
 * Time: 上午10:40
 */

namespace app\admin\model;

use think\Validate;
use think\Db;
use think\Session;
class Bank extends Common
{
    //只读字段
    protected $readonly = ['bank_id'];

    protected $pk = 'bank_id';   //设置主键
    public function edit($data){
        $rule = [
            'name'  =>  'require',
            'img'  =>  'require',
        ];

       $message = [
            'name.require'   => '银行名称不能为空',
            'img.require'     => '银行标示图必须上传',
        ];
        $validate = new Validate($rule,$message);
        $result = $validate->check($data);
        if(!$result)            error($validate->getError());
        $data['img'] = $this->domain($data['img']);
        if(empty($data['bank_id'])){
            $data['intime'] = date('Y-m-d H:i:s',time());
            $result = $this->allowField(true)->save($data);
            $action = '新增';
        }else{
            $data['uptime'] = date('Y-m-d H:i:s',time());
            $result = $this->allowField(true)->save($data,[$this->pk=>$data['bank_id']]);
            $action = '编辑';
        }
        $url = Session::get('url');
        if ($result) {
            return success(['info' => $action . '银行信息操作成功', 'url' => $url]);
        } else {
            return error($action . '银行信息操作失败');
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

}