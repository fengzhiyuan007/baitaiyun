<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/27
 * Time: 上午10:07
 */

namespace app\admin\validate;


use think\Validate;

class Alipay extends Validate
{
    protected $rule = [
        'phone'  =>  'require',
        'alipay'  =>  'require',
        'relname' => 'require',
        'where_it_is'  =>  'require',
    ];

    protected  $message = [
        'phone.require'         => '联系方式不能为空',
        'alipay.require'        => '银行卡号不能为空',
        'relname.require'       => '姓名不能为空',
        'where_it_is.require'   => '开户行不能为空',
    ];
}