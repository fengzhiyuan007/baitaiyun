<?php
namespace app\api\controller;
use lib\Easemob;
use lib\Upload;
use think\Controller;
use think\View;
use think\Db;
use opensearch;
use \think\Session;
use \think\Request;
class Merchant extends Common{
    /**
     * 提交申请资料
     * @param
     * @param legal_img ; //法人照片
     * @param legal_hand_img; //手持身份证照
     * @param  legal_face_img //身份证正面
     * @params legal_opposite_img; //身份证反面
     */
    /**
     *用户提交信息验证
     */
    public function  message_authentication(){
        $user = $this->checklogin();
        //用户信息验证
        $params = Request::instance()->request();
        $validate = validate('Merchant');
        if(!$validate->check($params)){
            error($validate->getError());
        }else{
            success("验证成功");
        }
    }

    /**
     * 提交用户信息
     */
    public function  sub_material(){
        $user = $this->checklogin();
        //资料审核状态判断
        $apply_state= DB::name("merchants")->where("member_id",$user["member_id"])->value("apply_state");
        switch ($apply_state){
            case "1":
                error("资料审核中无法进行修改");
                break;
            case "2":
                error("资料审核已通过，如需修改请联系商家");
            break;
        }
        if($apply_state==3){
            DB::name("merchants")->where('member_id',$user["member_id"])->delete();
        }
        //用户信息验证
        $params = Request::instance()->request();
        $validate = validate('Merchant');
        if(!$validate->check($params)){
           error($validate->getError());
        }
        //证件验证
        $params["apply_state"] = 1;
        $params["member_id"] = $user["member_id"];
        $params["create_time"] = date("Y-m-d H:i:s");
        unset($params["uid"]);
        unset($params["token"]);
        $model = model('Merchants');
        if(!empty($params["business_img"])){
            $params["business_img"];
            $re = $model->edit_merchants($params);
            if($re){
                success("提交成功，请等待审核");
            }else{
                error("提交失败，请核对信息");
            }
        }else{
            if($params["legal_img"] && $params["legal_hand_img"] && $params["legal_face_img"] && $params["legal_opposite_img"]){
                $re = $model->edit_merchants($params);
                if($re){
                    success("提交成功，请等待审核");
                }else{
                    error("提交失败，请核对信息");
                }
            }else{
                error("提交失败，请核对信息");
            }
        }
    }

    /**
     *获取提交信息
     */
    public function  material_info(){
        $user = $this->checklogin();
        $list = DB::name("merchants")->where('member_id',$user["member_id"])
                                ->column('business_number,merchants_id,merchants_name,contact_name,contact_mobile,merchants_address,business_img,legal_img,legal_hand_img,legal_face_img,legal_opposite_img,apply_state,pay_state','member_id');
        //押金支付信息
        $deposit = DB::name("system")->where("id",1)->value("deposit");
        $data = $list[$user["member_id"]];
        $data["deposit"] = $deposit;
        success($data);
    }
    /**
     * 上传证件
     */
    public function upload(){
        $up = new Upload();
        $up->upload("Documen");
    }
    /**
     * 经营分类
     */
    public function operate_class(){
        $user = $this->checklogin();
        $params = Request::instance()->param();
        //全部分类
        $data = ["class_state"=>1,'is_delete'=>0];
        $all_list = DB::name("goods_class")->field("class_name,class_id")->where($data)->select();
        if(!empty($params["operate_class"])){
            //修改商户经营分类
            $update["class_id"]=$params['operate_class'];
            $update['intime'] = date("Y-m-d H:i:s", time());
            if(DB::name("goods_merchants_class")->where("member_id",$user["member_id"])->find()){
                $res = DB::name("goods_merchants_class")->where("member_id",$user["member_id"])->update($update);
            }else{
                $update["member_id"]=$user["member_id"];
                $res = DB::name("goods_merchants_class")->where("member_id",$user["member_id"])->insert($update);
            }
            if(!$res){
                error("修改分类失败，请重新尝试修改");
            }
        }
        //商家选择已选的分类
        $class_id = DB::name("goods_merchants_class")->where("member_id",$user["member_id"])->value('class_id');
        $class_array = explode(",",$class_id);
        foreach ($all_list as $k=>$v){
            if(in_array($v["class_id"],$class_array)){
                $all_list[$k]["type"] = 1;
            }else{
                $all_list[$k]["type"] = 2;
            }
        }
        //$oper_list = DB::name("goods_class")->field("class_name,class_id")->where('class_id','in',$class_id)->select();
        success($all_list);
    }
    /**
     *清除已选经营分类
     */
    public function clean_class(){
        $user = $this->checklogin();
        $re = DB::name("goods_merchants_class")->where("member_id",$user["member_id"])->update(["class_id"=>0]);
        if($re){
            success("经营分类已清除完，建议您重新选择");
        }else{
            error("经营分类清除失败,请重新新尝试清除");
        }
    }
    /**
     * 商户入驻协议
     */
    public function agreement(){
        $id = input("id");
        $data = ["id"=>$id,'is_del'=>1];
        $content = DB::name("notice")->where($data)->value('content');
        $content = htmlspecialchars_decode($content);
        $this->assign(['content'=>$content]);
        return $this->fetch();
    }

    public function ajax_agreement(){
        $id = input("id");
        $data = ['id'=>$id,'is_del'=>1];
        $content = DB::name("notice")->where($data)->value('content');
//        $content = htmlspecialchars_decode($content);
        success($content);
    }

    /**
     *商户商品分类
     */
    public function merchants_class()
    {
        if (Request::instance()->isPost()) {
            $member = $this->checklogin();
            $array[] = ['class_id'=>'','class_name'=>'全部','class_uuid'=>''];
            $merchants_id = $member['member_id'];//商家商户id
            if (!$merchants_id) error("商户店铺id不能为空");
            $list = Db::name('goods_merchants_class')->alias('a')
                ->field('b.class_id,b.class_name,b.class_uuid')
                ->join('th_goods_class b', 'FIND_IN_SET(b.class_id,a.class_id)')
                ->where(['a.member_id' => $merchants_id, 'b.is_delete' => 0])
                ->select();
            if(!empty($list)){
                $list = array_merge($array,$list);
            }
            return success($list);
        }
    }

    /**
     *商户分类商品
     */
    public function merchants_class_goods()
    {
        if (Request::instance()->isPost()) {
            $member = $this->checklogin();
            $merchants_id = $member['member_id'];//商家商户id
            if (!$merchants_id) error("商户店铺id不能为空");
            $p = input('p');
            empty($p) && $p = 1;
            $pageSize = input('pagesize');
            $pageSize ? $pageSize : $pageSize = 10;
            $class_uuid = input('class_uuid');
            if ($class_uuid){
                $class = Db::name('goods_class')->where(['class_uuid' => $class_uuid])->find();
                if (!$class) error("商户分类id错误");
                $where['parent_class|seed_class'] = $class['class_id'];
            }
//            $where['b.merchants_id'] = $merchants_id;
            $where['is_delete'] = '0';
            $where['goods_state'] = '1';
            $where['is_review'] = '1';
            $list = Db::name('goods')
                ->field('goods_id,goods_name,goods_img,goods_origin_price,goods_pc_price,goods_now_price')
                ->where($where)->order('is_tuijian desc,sort desc,create_time asc')
                ->page($p, $pageSize)->select();
            $count = Db::name('goods')->where($where)->count();
            $page = ceil($count / $pageSize);
            return success(['page' => $page, 'list' => $list]);
        }
    }

    /**
     *直播商品
     */
    public function live_goods(){
        $member = $this->checklogin();
        $live_id = input('live_id');
        if(!$live_id)       error("直播错误");
        $list = Db::name('live_goods')->alias('a')
            ->field('a.live_goods_id,a.is_top,b.goods_id,b.goods_name,b.goods_img,b.goods_origin_price,b.goods_pc_price,b.goods_now_price')
            ->join('th_goods b','a.goods_id = b.goods_id')
            ->where(['a.live_id'=>$live_id,'a.is_delete'=>'0','b.is_delete'=>'0','b.goods_state'=>'1'])
            ->order("a.is_top desc")
            ->select();
        success($list);
    }

    /**
     *商品置顶与取消
     */
    public function operateGoodsTop(){
        $member = $this->checklogin();
        $live_goods_id = input('live_goods_id');
        $check = Db::name('live_goods')->where(['live_goods_id'=>$live_goods_id,'member_id'=>$member['member_id']])->find();
        if(!$check)         error("商品错误");
        if($check['is_top'] == '0'){
            $is_top = '1';
        }else{
            $is_top = '0';
        }
        $result = Db::name('live_goods')->where(['live_goods_id'=>$live_goods_id])->update(['is_top'=>$is_top]);
        if($result){
            if($is_top == '1'){
                Db::name('live_goods')->where(['live_id'=>$check['live_id'],'live_goods_id'=>['neq',$live_goods_id]])->update(['is_top'=>'0']);
            }
            success("操作成功");
        }else{
            error("操作失败");
        }
    }
    public function delGoods(){
        $member = $this->checklogin();
        $live_goods_id = input('live_goods_id');
        $result = Db::name('live_goods')->where(['live_goods_id'=>$live_goods_id,'member_id'=>$member['member_id']])->update(['is_delete'=>'1']);
        if($result){
            success("操作成功");
        }else{
            error("操作失败");
        }
    }
    public function delAllGoods(){
        $member = $this->checklogin();
        $live_id = input('live_id');
        $result = Db::name('live_goods')->where(['live_id'=>$live_id,'member_id'=>$member['member_id']])->update(['is_delete'=>'1']);
        if($result){
            success("操作成功");
        }else{
            error("操作失败");
        }
    }

}