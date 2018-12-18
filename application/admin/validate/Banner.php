<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/27
 * Time: 上午11:16
 */

namespace app\admin\validate;


use think\Validate;

class Banner extends Validate
{
    protected $rule = [
        'b_img'  =>  'require',
        'b_type'  =>  'require',
        'title'  =>  'require',
        'type'  =>  'require',
    ];

    protected  $message = [
        'b_img.require' => '请上传轮播banner图',
        'b_type.require'     => '请选择轮播图类型',
        'title.require'     => '请填写轮播主题',
        'type.require'     => '请选择轮播轮播图使用场景',
    ];
}