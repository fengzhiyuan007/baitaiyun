<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/27
 * Time: 下午7:03
 */

namespace app\admin\validate;


use think\Validate;

class ArticleClass extends Validate
{
    protected $rule = [
        'title'  =>  'require',
    ];

    protected  $message = [
        'title.require' => '分类名称不能为空',
    ];
}