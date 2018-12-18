<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/14
 * Time: 下午2:34
 */

namespace app\television\model;

use think\Validate;
use think\Session;
class Video extends Common
{
    //只读字段
    protected $readonly = ['video_id','member_id'];

    protected $pk = 'video_id';   //设置主键
    public function edit($data){
        $rule = [
            'title'      =>  'require',
            'video_img'      => 'require',
            'url'       => 'require',
        ];

        $message = [
            'title.require'      => '名称必须填写',
            'video_img.require'      => '视频封面图片必须存在',
            'url.require'       => '视频必须上传',
        ];
        $validate = new Validate($rule,$message);
        $result = $validate->check($data);
        if(!$result)            error($validate->getError());
        $str = 'http://msplay.qqyswh.com/';
        if(strpos($data['url'],$str) ===false){
            $data['url'] = $str.$data['url'];
        }
        $data['video_img'] = $this->domain($data['video_img']);
        if(empty($data['video_id'])){
            $data['intime'] = time();
            $result = $this->allowField(true)->save($data);
            $action = '新增';
        }else{
            $data['uptime'] = time();
            $result = $this->allowField(true)->save($data,['video_id'=>$data['video_id']]);
            $action = '编辑';
        }
        $url = Session::get('url');
        if ($result) {
            return success(['info' => $action . '视频操作成功', 'url' => $url]);
        } else {
            return error($action . '视频操作失败');
        }
    }
}