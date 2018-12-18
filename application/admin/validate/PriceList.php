<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/27
 * Time: 上午11:16
 */

namespace app\admin\validate;


use think\Validate;

class PriceList extends Validate
{
    protected $rule = [
        'diamond'  =>  'require|number|integer',
        'price'  =>  'require|number|integer',
    ];

    protected  $message = [
        'diamond.require' => '钻石数量不能为空',
        'diamond.number'     => '钻石数量为整数',
        'diamond.integer'     => '钻石数量为整数',
        'price.require'     => '金额设置不能为空',
        'price.number'     => '金额为整数',
        'price.integer'     => '金额为整数',
    ];
}