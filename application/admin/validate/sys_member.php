<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/22
 * Time: 下午4:21
 */

namespace app\admin\validate;


use think\Validate;

class sys_member extends Validate
{
    protected  $rule = [
        'username'      =>      ''
    ];
}