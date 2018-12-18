<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/27
 * Time: 上午10:07
 */

namespace app\admin\validate;


use think\Validate;

class Article extends Validate
{
    protected $rule = [
        'title'  =>  'require',
        'img'  =>  'require',
        'class_id' => 'require',
        'content'  =>  'require',
    ];

    protected  $message = [
        'title.require' => '文章标题不能为空',
        'img.require'     => '图片不能为空',
        'class_id.require'     => '分类选择不能为空',
        'content.require'     => '内容不能为空',
    ];
}