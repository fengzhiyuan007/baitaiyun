<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/15
 * Time: 下午5:43
 */

namespace app\admin\validate;


use think\Validate;

class Aboutus extends Validate
{
    protected $rule = [
        'company'  =>  'require',
        'tel'  =>  'require',
        'wechat'  =>  'require',
        'record'  =>  'require',
        'address'  =>  'require',
    ];

    protected  $message = [
        'company.require' => '企业名称不能为空',
        'tel.require'     => '企业电话不能为空',
        'wechat.require'     => '企业微信不能为空',
        'record.require'     => '企业备案号不能为空',
        'address.require'     => '企业地址不能为空',
    ];
}