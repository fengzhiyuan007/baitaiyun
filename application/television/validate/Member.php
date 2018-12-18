<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/29
 * Time: 下午2:32
 */

namespace app\television\validate;


use think\Validate;

class Member extends Validate
{
    protected $rule = [
        'phone'  => [
            'require',
            'length'=>11,
            'number',
            'regex' => '/^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70|71|73|74|75|76|77|78)\d{8}$/'
        ],
        'password'     =>  'require',
        'tv_dashang_scale'=>'require|number|between:0,100',
        'tv_sell_scale'=>'require|number|between:0,50',
        'spread_scale'=>'require|number',
        'sell_scale'=>'require|number|between:0,100',
        'tag'=>"require",
        'merchants_name'=>"require",
        'contact_name'=>"require",
        'contact_mobile'=>"require",
        'company_name'=>"require",
        'company_mobile'=>"require",
        'merchants_address'=>"require",
        'merchants_img'=>"require",
        'business_img'=>"require",
        'goods_class'=>"require",
        'verify_code'     => 'require|number',
        '__token__' => 'token',
    ];
    protected  $message = [
        'phone.require'              => '用户账户不能为空',
        'phone.length'               => '用户账号字符长度错误',
        'phone.number'               => '用户账号字符必须是数字',
        'phone.unique'              => '此手机号已存在',
        'phone.regex'                => '用户账号不满足手机号规则',
        'password.require'          => '用户登录密码必须填写',
        'tv_dashang_scale.require'    => '请设置主播获取打赏比例',
        'tv_dashang_scale.number'      => '打赏比例只能为整数',
        'tv_sell_scale.require'      => '电视台比例值必须填写',
        'tv_sell_scale.between'      => '电视台比例值为0~50',
        'spread_scale.require'      => '电视台引流比例值必须填写',
//        'spread_scale.between'      => '电视台引流比例值为0~5',
        'sell_scale.require'        => '请设置主播销售分润比例',
        'sell_scale.number'         => '分润比例只能为整数',
        'sell_scale.between'         => '分润比例值为0~100',
        'tag.require'                =>'请选择直播分类标签',
        'merchants_name.require'                =>'店铺名称必须填写',
        'contact_name.require'                =>'联系人名字必须填写',
        'contact_mobile.require'                =>'联系方式名字必须填写',
        'company_name.require'                =>'公司名称必须填写',
        'company_mobile.require'                =>'公司电话必须填写',
        'merchants_address.require'                =>'公司地址必须填写',
        'merchants_img.require'                =>'店铺图片logo必须上传',
        'business_img.require'                =>'营业执照必须上传',
        'goods_class.require'                =>'商品分类必须选择',
        'verify_code.require'       => '验证码信息必须填写',
        'verify_code.number'        => '验证码类型必须是数字',
    ];
    //添加验证场景
    protected $scene = [
        'login'   =>  [
            'phone' => "require",
            'password'=>"require",
        ],
        'add_merchants'     =>  [
            'phone'=>  [
                'require',
                'unique'=>'member,phone',
                'length'=>11,
                'number',
                'regex' => '/^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70|71|73|74|75|76|77|78)\d{8}$/'
            ],
            'dashang_scale'=>'require|number|between:0,100',
            'sell_scale'=>'require|number|between:0,100',
            'spread_scale'=>'require|number',
            'tv_sell_scale'=>'require|number|between:0,50',
            'tag'=>"require",
            'merchants_name'=>"require",
            'contact_name'=>"require",
            'contact_mobile'=>"require",
            'company_name'=>"require",
            'company_mobile'=>"require",
            'merchants_address'=>"require",
            'merchants_img'=>"require",
            'business_img'=>"require",
            'goods_class'=>"require",
        ],
        'edit_merchants' =>  [
            'phone'=>  [
                'require',
                'unique'=>'member,phone^member_id',
                'length'=>11,
                'number',
                'regex' => '/^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70|71|73|74|75|76|77|78)\d{8}$/'
            ],
            'dashang_scale'=>'require|number|between:0,100',
            'spread_scale'=>'require|number',
            'sell_scale'=>'require|number|between:0,100',
            'tv_sell_scale'=>'require|number|between:0,50',
            'tag'=>"require",
            'merchants_name'=>"require",
            'contact_name'=>"require",
            'contact_mobile'=>"require",
            'company_name'=>"require",
            'company_mobile'=>"require",
            'merchants_address'=>"require",
            'merchants_img'=>"require",
            'business_img'=>"require",
            'goods_class'=>"require",
        ],
          'add_anchor'     =>  [
            'phone'=>  [
                'require',
                'unique'=>'member,phone',
                'length'=>11,
                'number',
                'regex' => '/^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70|71|73|74|75|76|77|78)\d{8}$/'
            ],
            'dashang_scale'=>'require|number|between:0,100',
//            'sell_scale'=>'require|number|between:0,100',
//            'tv_sell_scale'=>'require|number|between:0,50',
            'tag'=>"require",
        ],
        'edit_anchor' =>  [
            'phone'=>  [
                'require',
                'unique'=>'member,phone^member_id',
                'length'=>11,
                'number',
                'regex' => '/^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70|71|73|74|75|76|77|78)\d{8}$/'
            ],
            'dashang_scale'=>'require|number|between:0,100',
//            'sell_scale'=>'require|number|between:0,100',
//            'tv_sell_scale'=>'require|number|between:0,50',
            'tag'=>"require",
        ],
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
            'tv_sell_scale'=>'require|number|between:0,50',
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
            'tv_sell_scale'=>'require|number|between:0,50',
            'tag'=>"require",
        ]
    ];





}