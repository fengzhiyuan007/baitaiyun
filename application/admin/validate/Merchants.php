<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/29
 * Time: 下午2:32
 */

namespace app\admin\validate;
use think\Validate;
class Merchants extends Validate
{
    protected $rule = [
        'phone'  => [
            'require',
            'length'=>11,
            'unique'=>'member,phone',
            'number',
            'regex' => '/^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70|71|73|74|75|76|77|78)\d{8}$/'
        ],
//        "member_id"              =>'require',//营业执照1',
        "merchants_name"             =>'require|unique:merchants',//店铺名称
        "contact_name"               =>'require',//联系姓名
        "contact_mobile"             =>'require',//联系电话
        "company_name"               =>'require',//公司名称
        "company_mobile"            =>'require',//公司电话
        "merchants_img"             =>'require',//店铺名称
        'merchants_province'      => 'require',
        'merchants_city'      => 'require',
        'merchants_country'      => 'require',
        "merchants_address"         =>'require',//店铺地址
        "legal_img"                  =>'require',//法人照片
        "legal_face_img"            =>'require',//身份证正面照
        "legal_opposite_img"        =>'require',//身份证反面照
        "legal_hand_img"            =>'require',//手持身份证照\
        "merchants_content"         =>'require',//店铺介绍
        "business_img"              =>'require',//营业执照1',
        'dashang_scale'=>'require|number|between:0,100',
        'sell_scale'=>'require|number|between:0,100',
        'tag'=>"require",
//        "business_img2"             =>'require',//营业执照2',
//        "business_img3"             =>'require',//营业执照3',
        "goods_class"                  =>'require'
    ];
    protected  $message = [
        'phone.require'                      => '用户账户不能为空',
        'phone.length'                       => '用户账号字符长度错误',
        'phone.number'                       => '用户账号字符必须是数字',
        'phone.unique'                       => '此手机号已存在',
        'phone.regex'                        => '用户账号不满足手机号规则',
        'dashang_scale.require'             => '请设置主播获取打赏比例',
        'dashang_scale.number'              => '打赏比例只能为整数',
        'dashang_scale.between'             => '打赏比例值为0~100',
        'sell_scale.require'                => '请设置主播销售分润比例',
        'sell_scale.number'                 => '分润比例只能为整数',
        'sell_scale.between'                => '分润比例值为0~100',
        'tag.require'                       =>'请选择直播分类标签',
        //添加商户的相关信息验证
        "merchants_name.require"           =>"请输入店铺名称",
        "merchants_name.unique"            =>"此店铺已存在",
        "contact_name.require"             =>"请输入联系姓名",
        "contact_mobile.require"           =>'请输入联系电话',
        "company_name.require"             =>'请输入公司名称',
        "company_mobile.require"           =>'请输入公司电话',
        "merchants_img.require"            =>'请上传店铺logo',
        'merchants_province.require'       => '省份必须选择',
        'merchants_city.require'       => '城市必须选择',
        'merchants_country.require'       => '区域必须选择',
        "merchants_address.require"        =>'请输入店铺地址',
        "legal_img.require"                 =>'请上传法人照片',
        "legal_face_img.require"           =>"请上传身份证正面照",
        "legal_opposite_img.require"       =>'请上传身份证反面照',
        "legal_hand_img.require"           =>'请上传手持身份证照',
        "merchants_content.require"        =>'请输入店铺介绍',
        "business_img.require"             =>"请上传营业执照或三合一营业执照",
        "member_id.require"             =>"用户信息错误",
        'goods_class'                          =>"商品分类不能为空"
    ];
    //添加验证场景
    protected $scene = [
        'login'   =>  ['phone','password'],
        'add'     =>  [
            'phone'=>  [
                'require',
                'unique'=>'member,phone',
                'length'=>11,
                'number',
                'regex' => '/^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70|71|73|74|75|76|77|78)\d{8}$/'
            ],
            'dashang_scale'=>'require|number|between:0,100',
            'sell_scale'=>'require|number|between:0,100',
            'tag'=>"require",
        ],
        'edit' =>  [
            'phone'=>  [
                'require',
                'unique'=>'member,phone^member_id',
                'length'=>11,
                'number',
                'regex' => '/^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70|71|73|74|75|76|77|78)\d{8}$/'
            ],
            'dashang_scale'=>'require|number|between:0,100',
            'sell_scale'=>'require|number|between:0,100',
            'tag'=>"require",
        ],
        'upgrade' => [
            "member_id"             =>'require',//用户信息
            "merchants_name"             =>'require',//店铺名称
            "contact_name"               =>'require',//联系姓名
            "contact_mobile"             =>'require',//联系电话
            "company_name"               =>'require',//公司名称
            "company_mobile"            =>'require',//公司电话
            "merchants_img"             =>'require',//店铺名称
            "merchants_address"         =>'require',//店铺地址
            "legal_img"                  =>'require',//法人照片
            "legal_face_img"            =>'require',//身份证正面照
            "legal_opposite_img"        =>'require',//身份证反面照
            "legal_hand_img"            =>'require',//手持身份证照\
            "merchants_content"         =>'require',//店铺介绍
            "business_img"              =>'require',//营业执照1',
            'dashang_scale'=>'require|number|between:0,100',
            'sell_scale'=>'require|number|between:0,100',
            'tag'=>"require",
//        "business_img2"             =>'require',//营业执照2',
//        "business_img3"             =>'require',//营业执照3',
            "goods_class"                  =>'require'
        ]
        //添加商户的相关相关信息验证
    ];
}