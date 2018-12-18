<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/10/20
 * Time: 下午3:26
 */

namespace app\admin\validate;


use think\Validate;

class GoodsClass extends Validate
{
    protected $rule = [
        'class_name'      =>  'require',
        'class_uuid'      => 'require|unique',
        'class_color'     => 'require|number|length:6',
        'class_img'       => 'require',
        'template_img'    => 'require'
    ];

    protected  $message = [
        'class_name.require'      => '分类名称必须填写',
        'class_uuid.require'      => '分类uuid必须存在',
        'class_uuid.unique'       => '分类UUID已经存在',
        'class_img.require'       => '分类icon图片必须上传',
        'class_color.require'     => '分类颜色必须填写',
        'class_color.number'      => '分类颜色填写数字',
        'class_color.length'      => '分类颜色长度为6',
        'template_img'            => '分类Banner图片必须上传'
    ];

    protected $scene = [
        'edit' =>  [
            'class_name'      => 'require',
            'class_uuid'      => 'require|unique:goods_class,class_uuid^class_id',
            'class_color'     => 'require|number|length:6',
            'class_img'       => 'require',
            'template_img'    => 'require'
        ]

    ];
}