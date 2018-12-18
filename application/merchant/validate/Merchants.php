<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/10/31
 * Time: 下午3:53
 */

namespace app\merchant\validate;


use think\Validate;

class Merchants extends Validate
{
    protected $rule = [
        'merchants_name'    =>  'require',
        'contact_name'      =>  'require',
        'contact_mobile'      => 'require|number|length:11',
        'company_name'      => 'require',
        'company_mobile'      => 'require',
        'merchants_province'      => 'require',
        'merchants_city'      => 'require',
        'merchants_country'      => 'require',
        'merchants_address'       => 'require',
        'merchants_img'     => 'require',
        'legal_img'            => 'require',
        'legal_face_img'            => 'require',
        'legal_opposite_img'            => 'require',
        'legal_hand_img'            => 'require',
        'business_img'            => 'require',
        'goods_class'            => 'require'
    ];

    protected  $message = [
        'merchants_name.require'      => '店铺名称必须填写',
        'contact_name.require'      => '联系人必须填写',
        'contact_mobile.require'      => '联系方式必须填写',
        'contact_mobile.number'      => '联系方式必须是数字',
        'contact_mobile.length'      => '联系方式长度为11位',
        'company_name.require'       => '公司名称必须填写',
        'company_mobile.require'       => '公司电话必须填写',
        'company_mobile.number'       => '公司电话必须为数字',
        'company_mobile.length'      => '公司电话长度为11位',
        'merchants_province.require'       => '省份必须选择',
        'merchants_city.require'       => '城市必须选择',
        'merchants_country.require'       => '区域必须选择',
        'merchants_address.require'       => '详细地址必须填写',
        'merchants_img.require'      => '商家图片必须填写',
        'legal_img.require'      => '法人照片必须上传',
        'legal_face_img.require'      => '法人身份证正面照必须上传',
        'legal_opposite_img.require'      => '法人身份证反面照必须上传',
        'legal_hand_img.require'      => '法人身份证手持照必须上传',
        'business_img.require'      => '请上传三证合一营业执照',
        'merchants_content.require'      => '店铺简介必须填写',
        'goods_class.require'      => '店铺经营分类必须填写'
    ];
}