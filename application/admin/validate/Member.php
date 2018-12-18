<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/29
 * Time: 下午2:32
 */

namespace app\admin\validate;


use think\Validate;

class Member extends Validate
{
    protected $rule = [
        'uuid'      =>  'require|unique:member,uuid',
        'phone'  => [
            'require',
            'unique'=>'member,phone',
            'length'=>11,
            'number',
            'regex' => '/^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70|71|73|74|75|76|77|78)\d{8}$/'
        ],
        'password'     =>  'require|length:6,18|regex:/^[a-zA-Z0-9_\.]+$/|different:username',
    ];

    protected  $message = [
        'uuid.require'      => '用户UUID必须填写',
        'uuid.unique'       => '用户UUID已经存在',
        'phone.require'     => '用户账号必须填写',
        'phone.unique'      => '用户账号已经存在',
        'phone.length'      => '用户账号字符长度错误',
        'phone.number'      => '用户账号字符必须是数字',
        'phone.regex'       => '用户账号不满足手机号规则',
        'password.require'  => '用户登录密码必须填写',
        'password.length'   => '用户登录密码长度在6-18位之间',
        'password.regex'    => '密码只能包含大写、小写、数字、下划线和"."',
    ];

    protected $scene = [
        'edit' =>  [
            'uuid' => 'require|unique:member,uuid^member_id',
            'phone'=>  [
                'require',
                'unique'=>'member,phone^member_id',
                'length'=>11,
                'number',
                'regex' => '/^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70|71|73|74|75|76|77|78)\d{8}$/'
            ],
            'password' => 'length:6,18|regex:/^[a-zA-Z0-9_\.]+$/|different:username'
        ]

    ];
}