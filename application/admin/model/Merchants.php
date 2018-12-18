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
class Merchants extends Common
{
    //只读字段
    protected $readonly = ['member_id','alias','hx_username','hx_password','wx_openid','qq_openid','wo_openid'];
    protected $pk = 'member_id';   //设置主键
    public function add_merchants($params,$scene='')
    {
        $validate = validate('Merchants');
        $result = $validate->check($params);
        if (!$result) {
            error($validate->getError());
        }
        $data['province'] = Db::name('Areas')->where(array('id' => $params['sheng']))->value('name');
        $data['city'] = Db::name('Areas')->where(array('id' => $params['shi']))->value('name');
        $data['area'] = Db::name('Areas')->where(array('id' => $params['qu']))->value('name');
        $merchants['merchants_province'] = Db::name('Areas')->where(array('id' => $params['sheng']))->value('name');
        $merchants['merchants_city'] = Db::name('Areas')->where(array('id' => $params['shi']))->value('name');
        $merchants['merchants_country'] = Db::name('Areas')->where(array('id' => $params['qu']))->value('name');

        //进行添加编辑判断
        $domain =  config("domain");
        $merchants['merchants_img'] = $this->domain($data['merchants_img']);
        $merchants['legal_img'] = $this->domain($data['legal_img']);
        $merchants['legal_face_img'] = $this->domain($data['legal_face_img']);
        $merchants['legal_opposite_img'] = $this->domain($data['legal_opposite_img']);
        $merchants['legal_hand_img'] = $this->domain($data['legal_hand_img']);
        $merchants['business_img'] = $this->domain($data['business_img']);        $merchants['merchants_province'] = Db::name('Areas')->where(array('id' => $params['sheng']))->value('name');
        $merchants['merchants_city'] = Db::name('Areas')->where(array('id' => $params['shi']))->value('name');
        $merchants['merchants_country'] = Db::name('Areas')->where(array('id' => $params['qu']))->value('name');
        $merchants['merchants_province'] ? $merchants['merchants_province'] : $merchants['merchants_province'] = '';
        $merchants['merchants_city'] ? $merchants['merchants_city'] : $merchants['merchants_city'] = '';
        $merchants['merchants_country'] ? $merchants['merchants_country'] : $merchants['merchants_country'] = '';
        if (empty($data['member_id'])) {
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
            if (!$re) return error("添加用户失败");
            $hx_password = "123456";
            $data['password'] = empty($params["password"]) ? my_encrypt("123456") : my_encrypt($params['password']);
            $data['hx_password'] = $hx_password;
            $data["sex"] = empty($params["sex"]) ? 1 : $params["sex"];
            $data['hx_username'] = $str;
            $data['username'] = empty($params["username"]) ? "游荡者".rand(100000,999999) : $params["username"];
            $data['alias'] = $str;
            $data["phone"] = $params["phone"];
            $data["header_img"] = empty($params["header_img"]) ? config('domain') . "/uploads/touxiang/touxiang.png" : $params["header_img"];
            $data["ID"] = get_number();
            $data["alias"] = $str;
            $data["signature"] = "这个人很懒什么都没有留下！！";
            $data["uuid"] = get_guid();
            $data['intime'] = time();
            $data["type"] = 2;
            $tag = $params["tag"];
            $data["live_tag"] = $tag;
            $action = '新增';
            //商户扩展信息
            $merchants["merchants_name"] = $params["merchants_name"];//店铺名称
            $merchants["contact_name"] = $params["contact_name"];//联系姓名
            $merchants["contact_mobile"] = $params["contact_mobile"];//联系电话
            $merchants["company_name"] = $params["company_name"];//公司名称
            $merchants["company_mobile"] = $params["company_mobile"];//公司电话
            $merchants["merchants_img"] = $domain.$params["merchants_img"];//店铺名称
            $merchants["dashang_scale"] = $params["dashang_scale"];//直播打赏比例
            $merchants["sell_scale"] = $params["sell_scale"];//销售打赏比例
            $merchants["tv_sell_scale"] = $params["tv_sell_scale"];//销售打赏比例
            $merchants["merchants_content"] = $params["merchants_content"];//店铺介绍
            $merchants["business_img"] = $domain.$params["business_img"];//营业执照1',
            $merchants["business_img2"] = $domain.$params["business_img2"];//营业执照2',
            $merchants["business_img3"] = $domain.$params["business_img3"];//营业执照3',
            $merchants["apply_state"] = 2;
            $merchants["pay_state"] = 0;
            $merchants['create_time'] = date("Y-m-d H:i:s");
            $merchants['update_time'] = date("Y-m-d H:i:s");
            //商家经营分类
            $goodclass["class_id"] = $params["goods_class"];
            $where = [];
        } else {
            //用户基础信息修改
            empty($params["username"]) ? true : $data['username'] = $params["username"];
            empty($params["phone"]) ? true : $data["phone"] = $params["phone"];
            empty($params["live_tag"]) ? true : $data["live_tag"] = $params["live_tag"];
            $data["header_img"] = empty($params["header_img"]) ? config('domain') . "/uploads/touxiang/touxiang.png" : $params["header_img"];
            $data['uptime'] = time();
            //商户扩展信息
            empty($params["merchants_name"]) ? true : $merchants["merchants_name"] = $params["merchants_name"];//店铺名称
            empty($params["contact_name"]) ? true : $merchants["contact_name"] = $params["contact_name"];//联系姓名
            empty($params["contact_mobile"]) ? true : $merchants["contact_mobile"] = $params["contact_mobile"];//联系电话
            empty($params["company_name"]) ? true : $merchants["company_name"] = $params["company_name"];//公司名称
            empty($params["company_mobile"]) ? true : $merchants["company_mobile"] = $params["company_mobile"];//公司电话
            empty($params["merchants_img"]) ? true : $merchants["merchants_img"] = $params["merchants_img"];//店铺名称
            empty($params["merchants_address"]) ? true : $merchants["merchants_address"] = $params["merchants_address"];//店铺地址
            empty($params["legal_img"]) ? true : $merchants["legal_img"] = $params["legal_img"];//法人照片
            empty($params["legal_face_img"]) ? true : $merchants["legal_face_img"] = $params["legal_face_img"];//身份证正面照
            empty($params["legal_opposite_img"]) ? true : $merchants["legal_opposite_img"] = $params["legal_opposite_img"];//身份证反面照
            empty($params["legal_hand_img"]) ? true : $merchants["legal_hand_img"] = $params["legal_hand_img"];//手持身份证照\
            empty($params["sell_scale"]) ? true : $merchants["sell_scale"] = $params["sell_scale"];//销售打赏比例
            empty($params["merchants_content"]) ? true : $merchants["merchants_content"] = $params["merchants_content"];//店铺介
            empty($params["business_img"]) ? true : $merchants["business_img"] = $params["business_img"];//营业执照1',
            empty($params["business_img2"]) ? true : $merchants["business_img2"] = $params["business_img2"];//营业执照2',
            empty($params["business_img3"]) ? true : $merchants["business_img3"] = $params["business_img3"];//营业执照3',
            //商户经营商品分类
            empty($params["class_id"]) ? true : $goodclass["class_id"] = $params["class_id"];
            $merchants['update_time'] = date("Y-m-d H:i:s");
            $action = '编辑';
        }
        file_put_contents('1.txt',json_encode($data),FILE_APPEND);
        $url = Session::get('url');
        if(empty($params["member_id"])){
            Db::startTrans();
            try{
                $member_id = DB::name("Member")->insertGetId($data);
                $merchants["member_id"] = $member_id;
                $goodclass["member_id"] = $member_id;
                $mres = DB::name("Merchants")->insert($merchants);
                $gres = DB::name("goods_merchants_class")->insert($goodclass);
                Db::commit();
                return success(['info'=>$action.'用户操作成功','url'=>$url]);
            } catch (\Exception $e) {
                // 回滚事务
                Db::rollback();
                return error($action.'用户操作失败');
            }
        }else{
            $mres = $this->allowField(true)->save($data,$where);
            $ares = DB::name("Merchants")->where(["member_id"=>$params["member_id"]])->update($merchants);
            $gres = DB::name("goods_merchants_class")->where(["member_id"=>$params["member_id"]])->update($goodclass);
            if($ares || $mres || $gres){
                return success(['info'=>$action.'用户操作成功','url'=>$url]);
            }else{
                return error($action.'用户操作失败');
            }
        }
    }

    public function upgrade_merchants($param){
        $validate = validate('Merchants');
        $result = $validate->scene('upgrade')->check($param,'');
        if (!$result) {
            error($validate->getError());
        }
        $param['merchants_img'] = $this->domain($param['merchants_img']);
        $param['legal_img'] = $this->domain($param['legal_img']);
        $param['legal_face_img'] = $this->domain($param['legal_face_img']);
        $param['legal_opposite_img'] = $this->domain($param['legal_opposite_img']);
        $param['legal_hand_img'] = $this->domain($param['legal_hand_img']);
        $param['business_img'] = $this->domain($param['business_img']);
        $param['apply_state'] = '2';
        $result = $this->allowField(true)->save($param);
        if($result){
            Db::name('member')->where(['member_id'=>$param['member_id']])->update(['type'=>'2']);
            $url = Session::get('url');
            return success(['info'=>'用户升级操作成功','url'=>$url]);
        }else{
            return error('用户操作失败');
        }
    }

    /**
     * @param string $where
     * @param string $num
     * @return \think\paginator\Collection
     */

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