<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/10/21
 * Time: 下午3:58
 */

namespace app\admin\validate;


use think\Validate;

class GoodsBrand extends  Validate
{
    protected $rule = [
        'brand_name'      =>  'require',
        'brand_uuid'      => 'require|unique:goods_brand',
        'brand_img'       => 'require',
        'brand_desc'      => 'require|min:10'
    ];

    protected  $message = [
        'brand_name.require'      => '品牌名称必须填写',
        'brand_uuid.require'      => '品牌uuid必须存在',
        'brand_uuid.unique'       => '品牌UUID已经存在',
        'brand_img.require'       => '品牌logo图片必须上传',
        'brand_desc.require'      => '品牌简介必须填写',
        'brand_desc.min'          => '品牌简介至少10个字符'
    ];

    protected $scene = [
        'edit' =>  [
            'brand_name'      => 'require',
            'brand_uuid'      => 'require|unique:goods_brand,brand_uuid^brand_id',
            'brand_img'       => 'require',
            'brand_desc'      => 'require|min:10'
        ]

    ];
}