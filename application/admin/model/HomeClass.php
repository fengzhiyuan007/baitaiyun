<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/4
 * Time: 下午4:48
 */

namespace app\admin\model;

use think\Session;
class HomeClass extends Common
{
    public function edit($data,$scene=''){
        $validate = validate('HomeClass');
        $valid = $validate->scene($scene)->check($data, '');
        if (!$valid) {
            return error($validate->getError());
        }
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
        $data['img'] = $this->domain($data['img']);
        if(empty($data['id'])){
            $data['create_time'] = date("Y-m-d H:i:s",time());
            $result = $this->allowField(true)->isUpdate(false)->save($data);
            $sort = $this->id;
            $this->allowField(true)->isUpdate(true)->save(['sort' => $sort], ['id' => $this->id]);
            $action = '新增';
        }else{
            $data['update_time'] = date("Y-m-d H:i:s",time());
            $where['id'] = $data['id'];
            $result = $this->allowField(true)->save($data, $where);
            $action = '编辑';
        }
        $url = Session::get('url');
        if ($result) {
            return success(['info' => $action . '首页分类操作成功', 'url' => $url]);
        } else {
            return error($action . '首页分类操作失败');
        }
    }

    /**
     * 软删除
     */
    public function soft_del($id){
        $data = [
            'is_delete'        => '1'
        ];
        $result = $this->save($data,['id'=>['in',$id]]);
        return $result;
    }

    /**
     * 真实删除
     */
    public function del($id){
        $result = $this->where(['id'=>['in',$id]])->delete();
        return $result;
    }

    /**
     *恢复数据
     */
    public function restore($id){
        $data = [
            'is_delete'        => '0',
            'delete_time'   => date("Y-m-d H:i:s")
        ];
        $result = $this->save($data,['dress_id'=>['in',$id]]);
        return $result;
    }

    /**
     *修改状态
     */
    public function change_status($id){
        $status = $this->where(['id'=>$id])->value('status');
        if(!$status)     return false;
        $abs = 3 - $status;
        //$arr = ['默认状态','开启状态'];
        $result = $this->save(['status'=>$abs],['id'=>$id]);
        if($result){
            return $abs;
        }else{
            return false;
        }
    }
}