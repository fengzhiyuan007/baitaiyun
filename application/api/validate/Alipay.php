<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/10/11
 * Time: 上午9:32
 */
namespace app\api\validate;
use think\Validate;
class Alipay extends Validate{
    //验证规则
    protected $rule =   [
        'relname'              => 'require|regex:/^[\x{4e00}-\x{9fa5}]{2,10}$/u',//姓名
        'phone'             => [
            'require',
            'unique'=>'alipay,phone',
            'length'=>11,
            'number',
            'regex' => '/^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70|71|73|74|75|76|77|78)\d{8}$/'
        ],//联系方式
    ];
    //验证信息
    protected $message  =   [
        'relname.require'                      => '请输入身份证上的姓名',
        'relname.regex'                        => '输入的姓名只能是中文',

        'phone.unique'                             => '此账号号已被使用',
        'phone.length'                             => '手机号码为11位数字',
        'phone.num'                                => '手机号码为11位数字',
        'phone.regex'                              => '请输入正确的手机号码',
    ];
    //验证场景
    protected $scene = [
        'edit' =>  [
            'phone'=>  [
                'require',
                'unique'=>'alipay,phone^user_id',
                'length'=>11,
                'number',
                'regex' => '/^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70|71|73|74|75|76|77|78)\d{8}$/'
            ],
            'relname' => 'require|regex:/^[\x{4e00}-\x{9fa5}]{2,10}$/u'
        ]
    ];
}