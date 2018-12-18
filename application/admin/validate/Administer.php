<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/29
 * Time: 下午2:32
 */

namespace app\admin\validate;
use think\Validate;

class Administer extends Validate
{
    protected $rule = [
        'username'      =>  'require|unique:administer,username',
        'name'           => 'require',
        'password'      =>'require'
    ];

    protected  $message = [
        'username.require'      => '登录用户名不能为空',
        'username.unique'       => '此用户已存在',
        'name.require'          => '用户姓名不能为空',
        'password.require'      => '请输入密码',
    ];
    protected $scene = [
        'edit' =>  [
            'username' => 'require|unique:administer,username^id',
            'name'           => 'require',
        ]
    ];
}