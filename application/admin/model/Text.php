<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/3
 * Time: 上午11:31
 */

namespace app\admin\model;


use think\Validate;
use think\Session;
class Text extends Common
{
    protected $pk = 'text_id';
    //只读字段
    protected $readonly = ['text_id'];
    public function edit($data){
        $rule = [
            'title'  =>  'require',
            'content'  =>  'require',
        ];

        $message = [
            'title.require' => '标题不能为空',
            'content.require'     => '内容不能为空',
        ];
        $validate = new Validate($rule,$message);
        $result = $validate->check($data);
        if(!$result){
            error($validate->getError());
        }
        if(empty($data['text_id'])){
            $data['create_time'] = date("Y-m-d h:i:s",time());
            $action = '新增';
            $result = $this->allowField(true)->save($data);
        }else{
            $data['update_time'] = date("Y-m-d h:i:s",time());
            $action = '编辑';
            $result = $this->allowField(true)->save($data,['text_id'=>$data['text_id']]);
        }
        $url = Session::get('url');
        if($result){
            return success(['info'=>$action.'图文信息成功','url'=>$url]);
        }else{
            return error($action.'图文信息失败');
        }
    }

    /**
     * 软删除
     */
    public function soft_del($id){
        $data = [
            'is_delete'        => '1',
        ];
        $result = $this->save($data,['text_id'=>['in',$id]]);
        return $result;
    }
}