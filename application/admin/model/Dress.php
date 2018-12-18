<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/2
 * Time: 下午5:04
 */

namespace app\admin\model;

use think\Session;
use think\Db;
class Dress extends Common
{
    //只读字段
    protected $readonly = ['dress_id'];
    protected $pk = 'dress_id';   //设置主键

    public function edit($data,$scene=''){
        $validate = validate('Dress');
        $valid = $validate->scene($scene)->check($data, '');
        if (!$valid) {
            return error($validate->getError());
        }
        $data['img'] = $this->domain($data['img']);
        $array = getimagesize($data['img']);
        $data['width'] = $array[0];
        $data['height'] = $array[1];

        switch ($data['type']){
            case 1:
                break;
            case 2:
                if(empty($data['url'])){
                    error("请填写跳转链接");
                }else{
                    $data['jump'] = $data['url'];
                }
                break;
            case 3:
                if(empty($data['class_uuid'])){
                    error("请选择分类");
                }else{
                    $data['jump'] = $data['class_uuid'];
                }
                break;
            case 4:
                if(empty($data['merchant'])){
                    error("商家不能为空");
                }else{
                    $data['jump'] = $data['merchant'];
                }
                break;
            case 5:
                if(empty($data['goods'])){
                    error("商品不能为空");
                }else{
                    $data['jump'] = $data['goods'];
                }
                break;
            case 6:
                break;
        }
        if(empty($data['dress_id'])){
            $data['create_time'] = date("Y-m-d H:i:s",time());
            $result = $this->allowField(true)->isUpdate(false)->save($data);
            $sort = $this->dress_id;
            $this->allowField(true)->isUpdate(true)->save(['sort' => $sort], ['dress_id' => $this->dress_id]);
            $action = '新增';
        }else{
            $data['update_time'] = date("Y-m-d H:i:s",time());
            $where['dress_id'] = $data['dress_id'];
            $result = $this->allowField(true)->save($data, $where);
            $action = '编辑';
        }
        $url = Session::get('url');
        if ($result) {
            return success(['info' => $action . '模块操作成功', 'url' => $url]);
        } else {
            return error($action . '模块操作失败');
        }
    }

    public function edit_nature($data,$scene=''){
        $validate = validate('Dress');
        $valid = $validate->scene($scene)->check($data, '');
        if (!$valid) {
            return error($validate->getError());
        }
        $data['img'] = $this->domain($data['img']);
        $array = getimagesize($data['img']);
        $data['width'] = $array[0];
        $data['height'] = $array[1];
        switch ($data['type']){
            case 1:
                break;
            case 2:
                if(empty($data['url'])){
                    error("请填写跳转链接");
                }else{
                    $data['jump'] = $data['url'];
                }
                break;
            case 3:
                if(empty($data['class_uuid'])){
                    error("请选择分类");
                }else{
                    $data['jump'] = $data['class'];
                }
                break;
            case 4:
                if(empty($data['merchant'])){
                    error("商家不能为空");
                }else{
                    $data['jump'] = $data['merchant'];
                }
                break;
            case 5:
                if(empty($data['goods'])){
                    error("商品不能为空");
                }else{
                    $data['jump'] = $data['goods'];
                }
                break;
            case 6:
                break;
        }
        if(empty($data['dress_id'])){
            $data['create_time'] = date("Y-m-d H:i:s",time());
            $result = $this->allowField(true)->isUpdate(false)->save($data);
            $sort = $this->dress_id;
            $this->allowField(true)->isUpdate(true)->save(['sort' => $sort], ['dress_id' => $this->dress_id]);
            $action = '新增';
        }else{
            $data['update_time'] = date("Y-m-d H:i:s",time());
            $where['dress_id'] = $data['dress_id'];
            $result = $this->allowField(true)->save($data, $where);
            $action = '编辑';
        }
        $url = Session::get('url');
        if ($result) {
            return success(['info' => $action . '属性操作成功', 'url' => $url]);
        } else {
            return error($action . '属性操作失败');
        }
    }

    /**
     * 软删除
     */
    public function soft_del($id){
        $data = [
            'is_delete'        => '1'
        ];
        $result = $this->save($data,['dress_id'=>['in',$id]]);
        return $result;
    }

    /**
     * 真实删除
     */
    public function del($id){
        $result = $this->where(['dress_id'=>['in',$id]])->delete();
        return $result;
    }

    /**
     *恢复数据
     */
    public function restore($id){
        $data = [
            'is_delete'        => '0',
        ];
        $result = $this->save($data,['dress_id'=>['in',$id]]);
        return $result;
    }

    /**
     *修改状态
     */
    public function change_status($id){
        $status = $this->where(['dress_id'=>$id])->value('status');
        if(!$status)     return false;
        $abs = 3 - $status;
        //$arr = ['默认状态','开启状态'];
        $result = $this->save(['status'=>$abs],['dress_id'=>$id]);
        if($result){
            return $abs;
        }else{
            return false;
        }
    }
}