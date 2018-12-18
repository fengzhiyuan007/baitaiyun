<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/16
 * Time: 下午1:41
 */

namespace app\admin\validate;


use think\Validate;

class SystemNotice extends Validate
{
    protected $rule = [
        'title'  =>  'require|max:16',
        'object' =>  'require',
        'content' =>  'require',
    ];

    protected  $message = [
        'title.require' => '公告标题必须填写',
        'object.require'        => '发送对象必须选择',
        'content.require'       => '公告内容必须填写',
    ];
}