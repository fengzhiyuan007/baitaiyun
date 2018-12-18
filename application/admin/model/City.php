<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/21
 * Time: 下午4:41
 */

namespace app\admin\model;

use think\Session;
use think\Request;
use think\Db;
class City extends Common
{
    //只读字段
    protected $readonly = ['id'];
    protected $pk = 'id';   //设置主键
    public function edit($data,$scene=''){
        $validate = validate('City');
        $valid = $validate->scene($scene)->check($data, '');
        if (!$valid) {
            return error($validate->getError());
        }
        if(empty($data['id'])){
            $data['intime'] = date('Y-m-d H:i:s',time());
            $result = $this->allowField(true)->save($data);
            $action = '添加';
        }else{
            $data['uptime'] = date('Y-m-d H:i:s',time());
            $result = $this->allowField(true)->save($data,[$this->pk=>$data['id']]);
            $action = '编辑';
        }
        $url = Session::get('url');
        if ($result) {
            return success(['info' => $action . '城市操作成功', 'url' => $url]);
        } else {
            return error($action . '城市操作失败');
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