<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/29
 * Time: 下午2:11
 */

namespace app\admin\model;

use lib\Easemob;
use think\Db;
use think\Session;
use lib\Page;
class Member extends Common
{
    //只读字段
    protected $readonly = ['member_id','alias','hx_username','hx_password','wx_openid','qq_openid','wo_openid'];
    protected $pk = 'member_id';   //设置主键

    /**
     * @param $data
     * @param string $scene
     * @param int $type 1：普通会员 3：主播
     */
    public function edit_member($data,$type=1,$scene=''){
        $system_change_scale = DB::name("system")->where(["id"=>1])->value("change_scale");
        $validate = validate('Member');
        $valid = $validate->scene($scene)->check($data,'');
        if(!$valid){
            return error($validate->getError());
        }
        $data['header_img'] = $this->domain($data['header_img']);
        $data['province'] = Db::name('Areas')->where(array('id' => $data['sheng']))->value('name');
        $data['city'] = Db::name('Areas')->where(array('id' => $data['shi']))->value('name');
        $data['area'] = Db::name('Areas')->where(array('id' => $data['qu']))->value('name');
        $data["address"] = $data["province"].$data["city"].$data["area"];
        if(empty($data['mid'])){
            $data['password'] = my_encrypt($data['password']);
            $chars = "abcdefghijklmnopqrstuvwxyz0123456789";
            mt_srand(10000000 * (double)microtime());
            for ($i = 0, $str = '', $lc = strlen($chars) - 1; $i < 12; $i++) {
                $str .= $chars[mt_rand(0, $lc)];
            }
            for ($i = 0, $str1 = '', $lc = strlen($chars) - 1; $i < 13; $i++) {
                $str1      .= $chars[mt_rand(0, $lc)];
            }
            $hx_password = "123456";
            $data['hx_password'] = $hx_password;
            $data['hx_username'] = $str;
            $data['alias'] = $str;
            $hx = new Easemob();
            $re = $hx->huanxin_zhuce($str, '123456');
            if(!$re){
                if($type==1){
                    return error("添加用户失败");
                }elseif ($type){
                    return error("添加主播失败");
                }
            }
            $data['intime'] = time();
            $data["type"] = $type;
            $action = '新增';
            $where = [];
        }else{
            if(!empty($data['password']))   $data['password'] = my_encrypt($data['password']);
            $data['uptime'] =   time();
            $action = '编辑';
            $where['member_id'] = $data['mid'];
        }
        $result = $this->allowField(true)->save($data,$where);
        $url = Session::get('url');
        if($result){
            if($type==1){
                return success(['info'=>$action.'用户操作成功','url'=>$url]);
            }elseif ($type==3){
                $anchor["update_time"] = date("Y-m-d H:s:i");
                $anchor["dashang_scale"] = empty($data["dashang_scale"])? $system_change_scale : $data["dashang_scale"];
                if( DB::name("anchor_info")->where(["anchor_id"=>$this->member_id])->find()){
                    DB::name("anchor_info")->where(["anchor_id"=>$this->member_id])->update($anchor);
                }else{
                    $anchor["create_time"]=date("Y-m-d H:s:i");
                    $anchor["anchor_id"] = $this->member_id;
                    DB::name("anchor_info")->insert($anchor);
                }
                return success(['info'=>$action.'主播操作成功','url'=>$url]);
            }
        }else{
            if($type==1){
                return success(['info'=>$action.'用户操作成功','url'=>$url]);
            }elseif ($type==3){
                return success(['info'=>$action.'主播操作成功','url'=>$url]);
            }
        }
    }

    //根据相关条件查询并分页
    public function queryMember($where = '',$num = '',$params=''){
        $list = $this->where($where)->order('intime desc')->paginate($num,false,["query"=>$params]);
        return $list;
    }

    //查询单条会员数据
    public function queryMemberById($id){
        $re = $this->where(['member_id'=>$id])->find();
        return $re;
    }
    //根据相关条件查询分页（主播）
    public function queryAnchor($where ='',$num='',$params=''){
        $count =  $list = DB::name("Member")->where($where)->count();
        $list = DB::name("Member")
            ->where($where)
            ->order('is_recommend desc,intime desc')
            ->paginate($num,false,["query"=>$params]);
        $list->toArray();
        foreach ($list as $k=>$v){
            $data = array();
            $data = $v;
            $tv_name = DB::name("anchor_info")
                ->alias('a')
                ->join("__TELEVISION__ b",'a.tv_id=b.tv_id')
                ->where(['a.anchor_id'=>$v['member_id']])
                ->value('username');
            if($tv_name){
                $data['tv_name']=$tv_name;
            }else{
                $data['tv_name']="平台";
            }
            if($v["type"]==2){
                $data['platform_type']='商户';
                $data["dashang_scale"] = DB::name("merchants")->where(["member_id"=>$v["member_id"]])->value("dashang_scale");
            }elseif ($v["type"]==3){
                $data['platform_type']='主播';
                $data["dashang_scale"] = DB::name("anchor_info")->where(["anchor_id"=>$v["member_id"]])->value("dashang_scale");
            }
            $list->offsetSet($k,$data);
        }
        return ["count"=>$count,'list'=>$list];
    }
}