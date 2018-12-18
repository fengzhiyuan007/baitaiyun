<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/4
 * Time: 下午4:52
 */

namespace app\admin\validate;


use think\Validate;

class HomeClass extends Validate
{
    protected $rule = [
        'title'  =>  'require',
        'img'  =>  'require',
//        'class_uuid'  =>  'require',
    ];

    protected  $message = [
        'title.require'   => '标题名称不能为空',
        'img.require'     => '必须上传图片',
//        'class_uuid.require'    => '请选择分类',
    ];
}