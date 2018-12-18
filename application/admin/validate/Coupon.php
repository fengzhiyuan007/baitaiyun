<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/20
 * Time: 下午5:24
 */

namespace app\admin\validate;


use think\Validate;

class Coupon extends Validate
{
    protected $rule = [
        'title'    =>  'require',
        'type'      => 'require',
//        'img'      => 'require',
        'value'      => 'require|number',
        'limit_value'     => 'require|number',
        'number'     => 'require|number',
        'end_time'     => 'require'
    ];
    protected  $message = [
        'title.require'      => '优惠券名称必须填写',
        'type.require'      => '类型必须选择',
//        'img.require'      => '优惠券图片必须上传',
        'value.require'       => '抵扣金额必须填写',
        'value.number'       => '抵扣金额填写错误',
        'limit_value.require'       => '限制金额必须填写',
        'limit_value.number'       => '限制金额填写错误',
        'goods_id.require'       => '商品必须选择',
        'number.require'       => '发放数量必须填写',
        'number.number'       => '发放数量填写错误',
        'end_time'       => '结束时间必须选择'
    ];

    protected $scene = [
        'common' =>  [
            'title'    =>  'require',
            'type'      => 'require',
            'img'      => 'require',
            'value'      => 'require|number',
            'limit_value'     => 'require|number',
            'number'     => 'require|number',
            'end_time'     => 'require'
        ],
        'special' =>  [
            'title'    =>  'require',
            'type'      => 'require',
            'img'      => 'require',
            'value'      => 'require|number',
            'limit_value'     => 'require|number',
            'goods_id'     => 'require|number',
            'number'     => 'require|number',
            'end_time'     => 'require'
        ]

    ];
}