<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/25
 * Time: 下午2:30
 */

namespace app\admin\validate;


use think\Validate;

class SysMember extends Validate
{
    protected $rule = [
        'username'      =>  'require|unique:system_member,username',
        'realname'           => 'require',
        'password'      =>'require'
    ];

    protected  $message = [
        'username.require'      => '登录用户名不能为空',
        'username.unique'       => '此用户已存在',
        'realname.require'          => '用户姓名不能为空',
        'password.require'      => '请输入密码',
    ];
    protected $scene = [
        'edit' =>  [
            'username' => 'require|unique:system_member,username^id',
            'realname'           => 'require',
        ]
    ];
}