<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/7
 * Time: 下午4:20
 */

namespace app\api\validate;


use think\Validate;

class OrderRefund extends Validate
{
    protected $rule =   [
        'order_merchants_id'        => 'require|number',
        'order_goods_id'            => 'require|number',
        'refund_count'              => 'require|number',
        'refund_type'              => 'require|number',
        'refund_reason'            => 'require',
    ];
    protected $message  =   [
        'order_merchants_id.require'                  => '参数错误',
        'order_merchants_id.number'                   => '参数错误',
        'order_goods_id.require'                      => '参数错误',
        'order_goods_id.require'                      => '参数错误',
        'refund_count.require'                        => '数量必须填写',
        'refund_count.number'                         => '数量填写错误',
        'refund_type.require'                         => '退换货类型必须选择',
        'refund_type.number'                        => '退换货类型错误',
        'refund_reason.require'                        => '原因不能为空',
    ];
}