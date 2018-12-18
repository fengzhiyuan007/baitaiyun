<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/29
 * Time: 下午2:11
 */

namespace app\television\model;
use lib\Easemob;
use think\Db;
use think\Session;
use lib\Page;
class Member extends Common
{
    //只读字段
    protected $readonly = ['member_id','alias','hx_username','hx_password','wx_openid','qq_openid','wo_openid'];
    protected $pk = 'member_id';   //设置主键
    protected $system = '';
    public function initialize(){
        parent::initialize();
         $this->system = DB::name('system')->where(['id'=>1])->find();
    }

    public function edit_member($params,$scene=''){
        //获取电视台id
        $member = Session::get('member');
        if(empty($member)){
            return $this->fetch('common/login');
        }
        $validate = validate('Member');
        //进行验证
        switch ($params["member_type"]){
            case "anchor":
                if(empty($params["member_id"])){
                    $result = $validate->scene('add_anchor')->check($params,'');
                }else{
                    $result = $validate->scene('edit_anchor')->check($params,'');
                }
                break;
            case "merchants":
                if(empty($params["member_id"])){
                    $result = $validate->scene('add_merchants')->check($params,'');
                }else{
                    $result = $validate->scene('edit_merchants')->check($params,'');
                }
                break;
        };
        //获取验证信息
        if(!$result){
            error($validate->getError());
        }
        $data['province'] = Db::name('Areas')->where(array('id' => $params['sheng']))->value('name');
        $data['city'] = Db::name('Areas')->where(array('id' => $params['shi']))->value('name');
        $data['area'] = Db::name('Areas')->where(array('id' => $params['qu']))->value('name');
        $merchants['merchants_province'] = Db::name('Areas')->where(array('id' => $params['sheng']))->value('name');
        $merchants['merchants_city'] = Db::name('Areas')->where(array('id' => $params['shi']))->value('name');
        $merchants['merchants_country'] = Db::name('Areas')->where(array('id' => $params['qu']))->value('name');
        //进行添加编辑判断
        if(empty($params['member_id'])){
            $chars = "abcdefghijklmnopqrstuvwxyz0123456789";
            mt_srand(10000000 * (double)microtime());
            for ($i = 0, $str = '', $lc = strlen($chars) - 1; $i < 12; $i++) {
                $str .= $chars[mt_rand(0, $lc)];
            }
            for ($i = 0, $str1 = '', $lc = strlen($chars) - 1; $i < 13; $i++) {
                $str1 .= $chars[mt_rand(0, $lc)];
            }
            $hx = new Easemob();
            $re = $hx->huanxin_zhuce($str, '123456');
            if(!$re)       return error("添加用户失败");
            $hx_password = "123456";
            $data['password'] = empty($params["password"]) ? my_encrypt("123456") : my_encrypt($params['password']);
            $data['hx_password'] = $hx_password;
            $data["sex"] = empty($params["sex"]) ? 1 : $params["sex"];
            $data['hx_username'] = $str;
            $data['username']=empty($params["username"]) ? "游荡者GA".$params["phone"] : $params["username"];
            $data['alias'] = $str;
            $data["phone"] = $params["phone"];
            $data["header_img"] = empty($params["header_img"])? config('domain')."/uploads/touxiang/touxiang.png" : $params["header_img"];
            $data["ID"] = get_number();
            $data["alias"]= $str;
            $data["signature"] = "这个人很懒什么都没有留下！！";
            $data["uuid"] = get_guid();
            $data['intime'] = time();
            $data["type"] = $params["type"];
            $tag=implode(',',$params["tag"]);
            $data["live_tag"] = $tag;
            $action = '新增';
            $where = [];
            $info_where = [];
            //主播信息扩展
            $info["tv_id"] = $member["member_id"];
            $info["dashang_scale"] = $params["dashang_scale"];
            $info["create_time"] = date("Y-m-d H:i:s");
            $info["update_time"] = date("Y-m-d H:i:s");
            //商户扩展信息
            $merchants["tv_id"] = $member["member_id"];
            $merchants["apply_state"] = 2;
            $merchants["pay_state"] =1;
            $merchants["platform_type"]=1;
            $merchants["spread_scale"]=$params['spread_scale'];
            $merchants["merchants_name"] = $params["merchants_name"];//店铺名称
            $merchants["contact_name"] = $params["contact_name"];//联系姓名
            $merchants["contact_mobile"] = $params["contact_mobile"];//联系电话
            $merchants["company_name"] = $params["company_name"];//公司名称
            $merchants["company_mobile"] = $params["company_mobile"];//公司电话
            $merchants["merchants_img"] = $params["merchants_img"];//店铺名称
            $merchants["merchants_address"] = $params["merchants_address"];//店铺地址
            $merchants["legal_img"] = $params["legal_img"];//法人照片
            $merchants["legal_face_img"] =$params["legal_face_img"];//身份证正面照
            $merchants["legal_opposite_img"] = $params["legal_opposite_img"];//身份证反面照
            $merchants["legal_hand_img"] = $params["legal_hand_img"];//手持身份证照

            $merchants["dashang_scale"] = $params["dashang_scale"];//平台直播打赏比
            $merchants["sell_scale"] = $params['sell_scale'];//平台销售收益百分比
            $merchants["tv_sell_scale"] = $params["tv_sell_scale"];//电视台销售百分比
            $merchants["spread_scale"] = $params["spread_scale"];//电视台引流销售百分比
            $merchants["merchants_content"] = $params["merchants_content"];//店铺介绍
            $merchants["business_img"] = $params["business_img"];//营业执照1',
            $merchants['create_time'] = date("Y-m-d H:i:s");
            $merchants['update_time'] = date("Y-m-d H:i:s");
            //商家经营分类
            $goodclass["class_id"] = $params["class_id"];
        }else{
            //用户基础信息修改
            empty($params['password']) ? true :$data['password'] = my_encrypt($params["password"]);
            empty($params["username"]) ? true : $data['username']= $params["username"];
            empty($params["phone"]) ? true : $data["phone"] = $params["phone"];
            empty($params["live_tag"]) ? true : $data["live_tag"] = $params["live_tag"];
            $data["header_img"] = empty($params["header_img"])? config('domain')."/uploads/touxiang/touxiang.png" : $params["header_img"];
            $data['uptime'] =   time();
            //更新主播分润信息
            $info["dashang_scale"] = $params["dashang_scale"];
            $info["update_time"] = date("Y-m-d H:i:s");
            $action = '编辑';
            $where['member_id'] = $params["member_id"];
            $info_where["anchor_id"] = $params["member_id"];
            $merchants_where["member_id"] = $params["member_id"];
            //商户扩展信息
            empty($params["merchants_name"]) ? true : $merchants["merchants_name"]= $params["merchants_name"];//店铺名称
            empty($params["contact_name"])? true :  $merchants["contact_name"] = $params["contact_name"];//联系姓名
            empty($params["contact_mobile"]) ? true :  $merchants["contact_mobile"] = $params["contact_mobile"];//联系电话
            empty($params["company_name"]) ? true : $merchants["company_name"] = $params["company_name"];//公司名称
            empty($params["company_mobile"]) ? true : $merchants["company_mobile"] = $params["company_mobile"];//公司电话
            empty($params["merchants_img"]) ? true : $merchants["merchants_img"] = $params["merchants_img"];//店铺名称
            empty($params["merchants_address"]) ? true : $merchants["merchants_address"] = $params["merchants_address"];//店铺地址
            empty($params["legal_img"]) ? true : $merchants["legal_img"] = $params["legal_img"];//法人照片
            empty($params["legal_face_img"]) ? true : $merchants["legal_face_img"] =$params["legal_face_img"];//身份证正面照
            empty($params["legal_opposite_img"]) ? true : $merchants["legal_opposite_img"] = $params["legal_opposite_img"];//身份证反面照
            empty($params["legal_hand_img"]) ? true :  $merchants["legal_hand_img"] = $params["legal_hand_img"];//手持身份证照\
            empty($params["tv_sell_scale"]) ? true : $merchants["tv_sell_scale"] = $params["tv_sell_scale"];//电视台销售百分比
            empty($params["sell_scale"]) ? true : $merchants["sell_scale"] = $params["sell_scale"];//电视台销售百分比
            empty($params["spread_scale"]) ? true : $merchants["spread_scale"] = $params["spread_scale"];//电视台引流销售百分比

            empty($params["merchants_content"]) ? true : $merchants["merchants_content"] = $params["merchants_content"];//店铺介
            empty($params["business_img"]) ? true :$merchants["business_img"] = $params["business_img"];//营业执照1',
            //商户经营商品分类
            empty($params["class_id"]) ? true : $goodclass["class_id"] = $params["class_id"];
            $merchants['update_time'] = date("Y-m-d H:i:s");
        }
        $url = Session::get('url');
        switch ($params["member_type"]) {
            case "anchor":
                if(empty($params["member_id"])){
                    //进行事务处理
                    Db::startTrans();
                    try{
                        //$this->allowField(true)->save($data,$where);
                        $member_id = DB::name('Member')->insertGetId($data);
                        $info["anchor_id"] = $member_id;
                        DB::name("anchor_info")->insertGetId($info);
                        // 提交事务
                        Db::commit();
                        return success(['info'=>$action.'主播操作成功','url'=>$url]);
                    } catch (\Exception $e) {
                        // 回滚事务
                        Db::rollback();
                        return error($action.'主播操作失败');
                    }
                }else{
                    $mres = DB::name('Member')->where($where)->update($data);
                    $ares = DB::name("anchor_info")->where($info_where)->update($info);;
                    if($ares && $mres){
                        return success(['info'=>$action.'主播操作成功','url'=>$url]);
                    }else{
                        return error($action.'主播操作失败');
                    }
                }
                break;
            case "merchants":
                if(empty($params["member_id"])){
                    Db::startTrans();
                    try{
                        $this->allowField(true)->save($data,$where);
                        $merchants['member_id'] = $this->member_id;
                        $goodclass['member_id'] = $this->member_id;
                        $goodclass['intime'] = date("Y-m-d H:i:s");
                        $mres = DB::name("Merchants")->insert($merchants);
                        $gres = DB::name("goods_merchants_class")->insert($goodclass);
                        // 提交事务
                        Db::commit();
                        return success(['info'=>$action.'商户操作成功','url'=>$url]);
                    } catch (\Exception $e) {
                        // 回滚事务
                        Db::rollback();
                        return error($action.'商户操作失败');
                    }
                }else{
                    $mres = $this->allowField(true)->isUpdate(true)->save($data,$where);
                    $ares = DB::name("Merchants")->where($merchants_where)->update($merchants);
                    $gres = DB::name("goods_merchants_class")->where($merchants_where)->update($goodclass);
                    if($ares){
                        return success(['info'=>$action.'商户操作成功','url'=>$url]);
                    }else{
                        return error($action.'商户操作成功');
                    }
                }
                break;
        }
    }
    //根据相关条件查询并分页
    public function queryMember($where = '',$num = ''){
        $list = $this->where($where)->order('intime desc')->paginate($num,false);
        return $list;
    }

    //查询单条会员数据
    public function queryMemberById($id){
        $re = $this->where(['member_id'=>$id])->find();
        return $re;
    }
}