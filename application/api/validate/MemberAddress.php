<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/10/11
 * Time: 上午9:32
 */

namespace app\api\validate;


use think\Validate;

class MemberAddress extends Validate
{
    protected $rule = [
        'member_id'      =>  'require',
        'address_name'      =>  'require',
        'address_mobile'  => [
            'require',
            'length'=>11,
            'number',
            'regex' => '/^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70|71|73|74|75|76|77|78)\d{8}$/'
        ],
        'address_province'      =>  'require',
        'address_city'      =>  'require',
        'address_country'      =>  'require',
        'address_detailed'      =>  'require',
    ];

    protected  $message = [
        'member_id.require'         => '用户ID必须填写',
        'address_name.require'      => '收货人名字必须填写',
        'address_mobile.require'    => '联系方式必须填写',
        'address_mobile.length'     => '联系方式字符长度错误',
        'address_mobile.number'     => '必须是数字',
        'address_mobile.regex'      => '联系方式不满足手机号规则',
        'address_province.require'  => '省份必须填写',
        'address_city.require'      => '城市必须填写',
        'address_country.require'   => '区县必须填写',
        'address_detailed.require'  => '收货详细地址必须填写',
    ];

}