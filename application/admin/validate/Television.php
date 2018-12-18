<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/29
 * Time: 下午2:32
 */
namespace app\admin\validate;
use think\Validate;
class Television extends Validate
{
    protected $rule = [
        'username'              =>'require|unique:television,username',
//        'phone'  => [
//            'require',
//            'unique'=>'television,phone',
//            'length'=>11,
//            'number',
//            'regex' => '/^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70|71|73|74|75|76|77|78)\d{8}$/'
//        ],
        'phone' => [
            'require',
            'unique'=>'television,phone',
            'length' =>'6,18'
        ],
        'password'              =>  'require',
        'dashang_scale'         =>'require|number|between:0,100',
        'sell_scale'=>'require|number|between:0,100',
    ];
    protected  $message = [
        'username.require'                  =>'请设置电视台名称',
        'username,unique'                  =>'此电视台名称已存在',
        'phone.require'                     => '用户账号必须填写',
        'phone.unique'                      => '用户账号已经存在',
        'phone.length'                      => '用户账号字符规则是6到18个字符',
        'phone.number'                      => '用户账号字符必须是数字',
        'phone.regex'                      => '用户账号不满足手机号规则',
        'password.require'                  => '用户登录密码必须填写',
        'dashang_scale.require'            => '请设置主播获取打赏比例',
        'dashang_scale.number'             => '直播收益比例只能为整数',
        'dashang_scale.between'            => '直播收益比例值为0~100',
        'sell_scale.require'               => '请设置商品销售分润比例',
        'sell_scale.number'                => '商品收益比例只能为整数',
        'sell_scale.between'               => '商品比例值为0~100',
    ];
    protected $scene = [
        'edit' =>  [
            'phone'=>  [
                'require',
                'unique'=>'television,phone^tv_id',
                'length' =>'6,18'
            ],
           'usernmae'=>[
               'require',
               'unique'=>'television,username^tv_id',
           ],
           'dashang_scale' =>[
               'require',
               'number',
               'between'=>'0,100'
           ],
            'sell_scale' =>[
               'require',
               'number',
               'between'=>'0,100'
           ]
        ]

    ];

}