<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/27
 * Time: 上午11:16
 */

namespace app\television\validate;


use think\Validate;

class LiveStore extends Validate
{
    protected $rule = [
        'title'  =>  'require',
        'user_id'  =>  'require',
        'play_img'  =>  'require',
        'url'  =>  'require',
    ];

    protected  $message = [
        'title.require'   => '标题名称不能为空',
        'user_id.require'   => '请选择主播或商家',
        'play_img.require'     => '必须上传封面图片',
        'url.require'    => '请上传视频链接',
    ];
}