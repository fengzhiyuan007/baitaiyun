<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/10/20
 * Time: 下午3:27
 */

namespace app\admin\model;
use think\Db;
use think\Session;
class GoodsClass extends Common
{
    //只读字段
    protected $readonly = ['class_id','class_uuid'];

    protected $pk = 'class_id';   //设置主键
    public function edit_class($data,$scene=''){
        $validate = validate('GoodsClass');
        $valid = $validate->scene($scene)->check($data,'');
        if(!$valid){
            return error($validate->getError());
        }
        if(strpos($data['class_color'],'#') === false){
            $data['class_color'] = '#'.$data['class_color'];
        }
        $data['class_img'] = $this->domain($data['class_img']);
        $data['template_img'] = $this->domain($data['template_img']);
        if(empty($data['class_id'])){
            $data['create_time'] = date("Y-m-d H:i:s",time());
            $action = '新增';
            $where = [];
        }else{
            $data['update_time'] =   date("Y-m-d H:i:s",time());
            $action = '编辑';
            $where['class_id'] = $data['class_id'];
        }

        $result = $this->allowField(true)->save($data,$where);
        $url = Session::get('url');
        if($result){
            return success(['info'=>$action.'分类操作成功','url'=>$url]);
        }else{
            return error($action.'分类操作失败');
        }
    }

    /**
     *删除
     */
    public function del_class($where){
        $result = $this->save(['is_delete'=>'1'],$where);
        if($result){
            $url = Session::get('url');
            return success(['info'=>'删除'.'分类操作成功','url'=>$url]);
        }else{
            error("删除分类操作失败");
        }
    }
}