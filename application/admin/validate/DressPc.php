<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/27
 * Time: 上午11:16
 */

namespace app\admin\validate;


use think\Validate;

class DressPc extends Validate
{
    protected $rule = [
        'title'  =>  'require',
        'img'  =>  'require',
        'type'  =>  'require',
    ];

    protected  $message = [
        'title.require'   => '标题名称不能为空',
        'img.require'     => '必须上传图片',
        'type.require'    => '请选择跳转类型',
    ];
}