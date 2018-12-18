<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/10/23
 * Time: 下午5:48
 */

namespace app\Admin\validate;


use think\Validate;

class Goods extends Validate
{
    protected $rule = [
        'goods_uuid'      =>  'require|unique:goods',
        'goods_name'      => 'require',
        'code'       => 'require|unique:goods',
        'parent_class'     => 'require',
        'seed_class'     => 'require',
        //'unit'            => 'require',
        'goods_origin_price'            => 'require|number',
        'goods_now_price'            => 'require|number',
        'sale_ratio'            => 'number|between:0,100',
        'goods_stock'            => 'require|number',
        'goods_desc'      => 'require|min:10',
        'goods_img'      => 'require',
        'imgs'      => 'require',
        'goods_detail'      => 'require',
    ];

    protected  $message = [
        'goods_uuid.require'      => '商家信息必须填写',
        'goods_uuid.unique'      => '商品uuid必须唯一',
        'goods_name.require'      => '商品名称必须填写',
        'code.require'       => '商品编码必须填写',
        'code.unique'       => '商品编码已存在',
        'parent_class.require'       => '产品一级分类必须选择',
        'seed_class.require'       => '产品二级分类必须选择',
        //'unit.require'      => '计价单位必须填写',
        'goods_origin_price.require'      => '商品原价必须填写',
        'goods_now_price.require'      => '商品现价必须填写',
        'sale_ratio.number'      => '销售比例需填写数字',
        'sale_ratio.between'      => '销售比例填写0到100之间的数字',
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
            'sale_ratio'            => 'number|between:0,100',
            'goods_stock'            => 'require|number',
            'goods_desc'      => 'require|min:10',
            'goods_img'      => 'require',
            'imgs'      => 'require',
            'goods_detail'      => 'require',
        ]

    ];
}