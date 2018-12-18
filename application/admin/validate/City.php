<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/21
 * Time: 下午4:59
 */

namespace app\admin\validate;


use think\Validate;

class City extends Validate
{
    protected $rule = [
        'city'  =>  'require',
        'shouzimu'  =>  'require|alpha|between:A,Z|max:1',
    ];

    protected  $message = [
        'city.require'   => '城市名称不能为空',
        'shouzimu.require'     => '城市首字母必须填写',
        'shouzimu.alpha'     => '城市首字母必须是字母',
        'shouzimu.between'     => '城市首字母必须在A-Z之间',
        'shouzimu.max'     => '城市首字母长度过长',
    ];
}