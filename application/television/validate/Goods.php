<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/10/23
 * Time: 下午5:48
 */

namespace app\merchant\validate;


use think\Validate;

class Goods extends Validate
{
    protected $rule = [
        'merchants_id'    =>  'require',
        'goods_uuid'      =>  'require|unique:goods',
        'goods_name'      => 'require',
        'code'       => 'require|unique:goods',
        'goods_class'     => 'require',
        'unit'            => 'require',
        'goods_origin_price'            => 'require|number',
        'goods_now_price'            => 'require|number',
        'goods_stock'            => 'require|number',
        'goods_desc'      => 'require|min:10',
        'goods_img'      => 'require',
        'imgs'      => 'require',
        'goods_detail'      => 'require',
    ];

    protected  $message = [
        'merchants_id.require'      => '商家信息必须填写',
        'goods_uuid.require'      => '商家信息必须填写',
        'goods_uuid.unique'      => '商品uuid必须唯一',
        'goods_name.require'      => '商品名称必须填写',
        'code.require'       => '商品编码必须填写',
        'code.unique'       => '商品编码必须已存在',
        'goods_class.require'       => '产品分类必须选择',
        'unit.require'      => '计价单位必须填写',
        'goods_origin_price.require'      => '商品原价必须填写',
        'goods_now_price.require'      => '商品现价必须填写',
        'goods_stock.require'      => '商品库存必须填写',
        'goods_desc.require'      => '商品简介必须填写',
        'goods_desc.min'          => '商品简介至少10个字符',
        'goods_img.require'          => '商品图片必须上传',
        'imgs.require'          => '商品轮播图片必须上传',
        'goods_detail.require'          => '商品图文信息必须填写',
    ];

    protected $scene = [
        'edit' =>  [
            'merchants_id'    =>  'require',
            'goods_uuid'      => 'require|unique:goods,goods_uuid^goods_id',
            'goods_name'      => 'require',
            'code'      => 'require|unique:goods,code^goods_id',
            'goods_class'     => 'require',
            'unit'            => 'require',
            'goods_origin_price'            => 'require|number',
            'goods_now_price'            => 'require|number',
            'goods_stock'            => 'require|number',
            'goods_desc'      => 'require|min:10',
            'goods_img'      => 'require',
            'imgs'      => 'require',
            'goods_detail'      => 'require',
        ]

    ];
}