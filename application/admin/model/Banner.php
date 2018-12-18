<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/27
 * Time: 上午10:11
 */

namespace app\admin\model;


use think\Session;

class Banner extends Common
{
    //protected $table = 'sys_member';
    //新增时自动添加字段
    //protected $insert = ['password','regip','lastip'];
    //更新时自动添加字段
    //protected $update = ['lastip'];
    protected $pk = 'b_id';
    //只读字段
    protected $readonly = ['b_id'];

    /**
     *新增或编辑
     */
    public function edit_banner($data){
        $validate = validate('Banner');
        $valid = $validate->check($data,'');
        if(!$valid){
            return error($validate->getError());
        }

        switch ($data['b_type']){
            case 1:
                break;
            case 2:
                if(empty($data['url'])){
                    error("请填写跳转链接");
                }else{
                    $data['jump'] = $data['url'];
                }
                break;
            case 3:
                if(empty($data['class_uuid'])){
                    error("请选择分类");
                }else{
                    $data['jump'] = $data['class_uuid'];
                }
                break;
            case 4:
                if(empty($data['merchant'])){
                    error("商家不能为空");
                }else{
                    $data['jump'] = $data['merchant'];
                }
                break;
            case 5:
                if(empty($data['goods'])){
                    error("商品不能为空");
                }else{
                    $data['jump'] = $data['goods'];
                }
                break;
            case 6:
                $data['jump'] = $data['coupon'];
                break;
        }
        $data['b_img'] = $this->domain($data['b_img']);
        $banner = new Banner;
        if(empty($data['b_id'])){
            $data['b_intime'] = date("Y-m-d h:i:s",time());
            $action = '新增';
            $result = $banner->allowField(true)->save($data);
        }else{
            $data['uptime'] = date("Y-m-d h:i:s",time());
            $action = '编辑';
            $result = $banner->allowField(true)->save($data,['b_id'=>$data['b_id']]);
        }
        $url = Session::get('url');
        if($result){
            return success(['info'=>$action.'轮播banner图成功','url'=>$url]);
        }else{
            return error($action.'轮播banner图失败');
        }
    }

    /**
     * 软删除
     */
    public function soft_del($id){
        $data = [
            'is_del'        => '2',
            'delete_time'   => date("Y-m-d H:i:s")
            ];
        $result = $this->save($data,['b_id'=>['in',$id]]);
        return $result;
    }

    /**
     * 真实删除
     */
    public function del($id){
        $result = $this->where(['b_id'=>['in',$id]])->delete();
        return $result;
    }

    /**
     *恢复数据
     */
    public function restore($id){
        $data = [
            'is_del'        => '1',
            'delete_time'   => date("Y-m-d H:i:s")
        ];
        $result = $this->save($data,['b_id'=>['in',$id]]);
        return $result;
    }

    /**
     *修改banner状态
     */
    public function change_status($id){
        $status = $this->where(['b_id'=>$id])->value('status');
        if(!$status)     return false;
        $abs = 3 - $status;
        //$arr = ['默认状态','开启状态'];
        $result = $this->save(['status'=>$abs],['b_id'=>$id]);
        if($result){
            return $abs;
        }else{
            return false;
        }
    }

}