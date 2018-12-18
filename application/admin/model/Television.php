<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/12/8
 * Time: 上午11:23
 */

namespace app\admin\model;

use think\Db;
use think\Session;
use think\Validate;
use think\Request;
use lib\Upload;
class Television extends Common
{
    //只读字段
    protected $readonly = ['tv_id','tv_type'];

    protected $pk = 'tv_id';   //设置主键

    public function edit($data,$scene=''){
        $validate = validate('Television');
        $result   = $validate->scene($scene)->check($data,'');
        if(!$result){
            error($validate->getError());
        }
        if(empty($data['header_img'])){
            $header_img = '/uploads/image/touxiang.png';
            $data['header_img'] = $this->domain_url.'/uploads/image/touxiang.png';
        }else{
            $header_img = $data['header_img'];
            $data['header_img'] = $this->domain($data['header_img']);
        }

        if(!empty($data['password'])){
            $data['password'] = my_encrypt($data['password']);
        }else{
            unset($data['password']);
        }
        if(empty($data['tv_id'])){
            $data['create_time'] = date("Y-m-d H:i:s",time());
            $action = '添加';
            $result = $this->allowField(true)->save($data);
            $url = $this->domain_url.'/mallBinding/?tv_id='.$this->tv_id;
            $qrcode_path = "/qrcode/" . time() . rand(100, 999) . '_qrcode.png';
            $obj = new Upload();
            $img = $obj->save_thumb($header_img,500);
            if($img)      $img = $this->domain($img);
            $path = qrcodeLogo($url,$img,'./'.$qrcode_path,8,9);
            $tv_relation['gift_ratio'] = $data['dashang_scale'];
            $tv_relation['shop_ratio'] = $data['sell_scale'];
            $tv_relation['tv_id'] = $this->tv_id;
            Db::name('television_relation')->insert($tv_relation);
            $this->allowField(true)->isUpdate(true)->save(['qrcode_img'=>$this->domain($path)],[$this->pk=>$this->tv_id]);
        }else{
            $relation = $this->queryTvRelation($data['tv_id']);
            if(!$relation){
                 $tv_relation['gift_ratio'] = $data['dashang_scale'];
                 $tv_relation['shop_ratio'] = $data['sell_scale'];
                 $tv_relation['tv_id'] = $data['tv_id'];
                 Db::name('television_relation')->insert($tv_relation);
            }else{
                if($data['dashang_scale']+$relation['city_gift_ratio'] + $relation['province_gift_ratio']>100){
                    error("存在省市台，自己的直播收益比例不能超过".(100-$relation['city_gift_ratio']-$relation['province_gift_ratio']));
                }else{
                    $tv_relation['gift_ratio'] = $data['dashang_scale'];
                    $tv_relation['shop_ratio'] = $data['sell_scale'];
                    Db::name('television_relation')->where(['tv_id'=>$data['tv_id']])->update($tv_relation);
                }
            }
            $data['update_time'] = date('Y-m-d H:i:s',time());
            $action = '编辑';
            $check = $this->queryTv(['tv_id'=>$data['tv_id']]);
            if($data['header_img'] != $check['header_img']) {
                $url = $this->domain_url . '/mallBinding/?tv_id=' . $data['tv_id'];
                $qrcode_path = "/qrcode/" . time() . rand(100, 999) . '_qrcode.png';
                $obj = new Upload();
                $img = $obj->save_thumb($header_img, 500);
                if ($img) $img = $this->domain($img);
                $path = qrcodeLogo($url, $img, './' . $qrcode_path, 8, 9);
                $data['qrcode_img'] = $this->domain($path);
            }
            $result = $this->allowField(true)->save($data,[$this->pk=>$data['tv_id']]);
        }
        if($result){
            $url = Session::get('url');
            return success(['info'=>$action.'电视台添加成功','url'=>$url]);
        }else{
           return error("电视台添加失败");
        }
    }

    /**
     * 软删除
     */
    public function soft_del($id){
        $data = [
            'is_del'        => '2'
        ];
        $result = $this->save($data,[$this->pk=>['in',$id]]);
        return $result;
    }

    /**
     * 真实删除
     */
    public function del($id){
        $result = $this->where([$this->pk=>['in',$id]])->delete();
        return $result;
    }

    /**
     *恢复数据
     */
    public function restore($id){
        $data = [
            'is_del'        => '1',
        ];
        $result = $this->save($data,[$this->pk=>['in',$id]]);
        return $result;
    }

    public function queryTvRelation($tv_id){
        $re = Db::name('television_relation')->where(['tv_id'=>$tv_id])->find();
        return $re;
    }
    public function queryTv($where){
        $re = $this->where($where)->find();
        return $re;
    }
}