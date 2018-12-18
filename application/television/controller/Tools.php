<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/27
 * Time: 下午4:53
 */

namespace app\television\controller;


use think\Controller;
use \think\File;
use think\Image;
use \think\request;
use \think\Validate;

class Tools extends Controller
{
    public function upload($dirname=''){
        $files = request()->file();
        $images = array();
        if(empty($files)){
            error("上传文件不能空");
        }
        foreach($files as $file){
            //移动到框架应用根目录/public/uploads/ 目录下
            $info = $file->validate(
                ['size'=>2000000,'ext'=>'png,jpg,jpeg，gif','mine'=>"image"]
            )->move(ROOT_PATH . 'public' . DS . 'uploads'.DS.'/image'.DS.$dirname);
            if($info){
                // 成功上传后 获取上传信
                if($dirname){
                    $url = config('domain').'/uploads/'.DS.'/image/'.$dirname.'/'.$info->getSaveName();
                }else{
                    $url = config('domain').'/uploads/'.DS.'/image/'.$info->getSaveName();
                }
            }else{
                return error( $file->getError());
            }
        }

            echo json_encode(array('error' => 0, 'url' => $url));
            die;
    }

    public function upload_save_thumb($dirname='',$max=''){
        $files = request()->file();
        if(empty($files)){
            error("上传文件不能空");
        }
        foreach($files as $file){
//            //宽高验证
//            $imageInfo = $file->getInfo();
//            $imagesize = getimagesize($imageInfo['tmp_name']);
//            if($imagesize[0] > 1002){
//                error('请选择宽度不超过<b>1002px</b>的JPG图片...');
//            }
//            if($imagesize[1] > 2500){
//                error('请选择高度不超过<b>2000px</b>的JPG图片...');
//            }
            //移动到框架应用根目录/public/uploads/ 目录下
            $info = $file->validate(
                ['size'=>2000000,'ext'=>'png,jpg,jpeg，gif','mine'=>"image"]
            )->move(ROOT_PATH . 'public' . DS . 'uploads'.DS.'image'.DS.$dirname);
            if($info){
                // 成功上传后 获取上传信
                if($dirname){
                    $url = '/uploads'.DS.'image/'.$dirname.'/';
                }else{
                    $url = '/uploads'.DS.'image/';
                }
                $array = getimagesize('.' . $url.$info->getSaveName());
                if($max){
                    if ($array[0] > $max) {
                        $image = Image::open('.' . $url . $info->getSaveName());
                        // 按照原图的比例生成一个最大为500*500的缩略图并保存为thumb.png
                        $image->thumb($max, $max, Image::THUMB_SCALING)->save('.' . $url . $info->getSaveName());
                    }
                }
                $url = config('domain').$url.$info->getSaveName();
            }else{
                return error( $file->getError());
            }
        }

        echo json_encode(array('error' => 0, 'url' => $url));
        die;
    }
}