<?php
namespace lib;
use \think\File;
use \think\Image;
use \think\request;
use \think\Validate;
class Upload extends Validate{
    /**
     * 多文件上传和单文件上传
     */
    public function upload($dirname=''){
        $files = request()->file();
        $images = array();
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
                        ['size'=>2000000,'ext'=>'png,jpg,jpeg,gif','mine'=>"image"]
                        )->move(ROOT_PATH . 'public' . DS . 'uploads'.DS.$dirname);
            if($info){
                // 成功上传后 获取上传信
                array_push($images,config('domain').'/uploads/'.$dirname.'/'.$info->getSaveName());
            }else{
                error( $file->getError());
            }
        }
        success($images);

    }

    public function upload_img($dirname=''){
        $files = request()->file();
        $images = array();
        if(empty($files)){
            error("上传文件不能空");
        }

        foreach ($files as $arr) {
            foreach ($arr as $file) {
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
                    ['size' => 2000000, 'ext' => 'png,jpg,jpeg,gif', 'mine' => "image"]
                )->move(ROOT_PATH . 'public' . DS . 'uploads' . DS . $dirname);
                if ($info) {
                    // 成功上传后 获取上传信
                    array_push($images, config('domain') . '/uploads/' . $dirname . '/' . $info->getSaveName());
                } else {
                    error($file->getError());
                }
            }
        }
        success($images);

    }

    /**
     *@param $img 图片
     *@param $max 裁减最大值
     */
    public function save_thumb($img,$max){
        $array = getimagesize($img);
        $url = '/uploads/thumb/'.time() . rand(100, 999) . '.png';
        if($max){
            if ($array[0] > $max) {
                $image = Image::open('.'.$img);
                // 按照原图的比例生成一个最大为500*500的缩略图并保存为thumb.png
                $image->thumb($max, $max, Image::THUMB_CENTER)->save('.' . $url);
                return $url;
            }
        }
        return $img;
    }
}
