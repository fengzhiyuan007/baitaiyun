<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/29
 * Time: 下午2:10
 */

namespace app\admin\controller;
use Think\Db;
use think\Request;
use think\Session;
use lib\Page;
class Member extends Base
{
    /**
     *@会员列表
     */
    public function index(){
       $params = Request::instance()->param();
        !empty($params['username']) && $map['username|phone'] = ['like','%'.$params['username'].'%'];
        $map['type'] = 1;
        $map['is_del'] = 1;
        $map['is_fans'] = 1;
        $num  = input('num');
        if (empty($num)){
            $num = 10;
        }
        $count = Db::name('Member')->where($map)->count();
        $list = model('Member')->queryMember($map,$num,$params);
        $page = $list->render($count);
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page]);
        $url =$_SERVER['REQUEST_URI'];
        Session::set('url',$url);
        return $this->fetch();
    }

    /**
     * @已删除会员
     */
    public function is_del_member(){
       $params = Request::instance()->param();
        !empty($_GET['username']) && $map['username|phone'] = $_GET['username'];
        $map['is_del'] = 2;
        $map['type'] = 1;
        $num  = input('num');
        if (empty($num)){
            $num = 10;
        }
        $this->assign('num',$num);
        $count = Db::name('Member')->where($map)->count();
        $list = model('Member')->queryMember($map,$num,$params);
        $page = $list->render($count);
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page]);
        $act=input("get.act");
        if($act=="download"){
            $dat=DB::name('User')->where($map)->order('member_id desc')->select();
            $str = '已删除会员表格'.date('YmdHis');
            header("Content-type:application/vnd.ms-excel");
            header("Content-Disposition:filename={$str}.csv");
            echo "\xEF\xBB\xBF"."序号,用户名称,手机号码,性别,省,市,区(县),具体地址,充值总额,消费总额,充值积分,普通积分,注册时间\n";
            foreach ($dat as $k=>$v){
                switch($v['sex']){
                    case 1 :
                        $v['sex'] = '男';
                        break;
                    case 2 :
                        $v['sex'] = '女';
                        break;
                    case 3 :
                        $v['sex'] = '保密';
                        break;
                }
                $v['recharge'] = DB::name('Recharge')->where(['member_id'=>$v['member_id'],'pay_status'=>2])->sum('amount');
                echo $k.","
                    .$v["nickname"]."\t,"
                    .$v["phone"]."\t,"
                    .$v["sex"]."\t,"
                    .$v["province"]."\t,"
                    .$v["city"]."\t,"
                    .$v["area"]."\t,"
                    .$v["address"]."\t,"
                    .$v["recharge"]."\t,"
                    .$v["consumption"]."\t,"
                    .$v["amount"]."\t,"
                    .$v["score"]."\t,"
                    .$v["intime"]."\t,"
                    ."\n";
            }
        }else {
            $url =$_SERVER['REQUEST_URI'];
            session('url',$url);
            return $this->fetch();
        }
    }

    /**
     *@粉丝列表
     */
    public function fans(){
        $params = Request::instance()->param();
        !empty($params['username']) && $map['username|phone'] = ['like','%'.$params['username'].'%'];
        $map['type'] = 1;
        $map['is_del'] = 1;
        $map['is_fans'] = 2;
        $num  = input('num');
        if (empty($num)){
            $num = 10;
        }
        $count = Db::name('Member')->where($map)->count();
        $list = model('Member')->queryMember($map,$num,$params);
        $page = $list->render($count);
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page]);
        $url =$_SERVER['REQUEST_URI'];
        Session::set('url',$url);
        return $this->fetch();
    }

    /**
     *@会员信息
     */
    public function member_show(){
        $this->view->engine->layout(false);
        $mid = input('mid');
        $re = Db::name('Member')->where(['member_id'=>$mid])->find();
        if(!empty($re['tv_id'])){
            $re['tv'] = Db::name('television')->where(['tv_id'=>$re['tv_id']])->value('username');
        }else{
            $re['tv'] = '暂无';
        }
        $this->assign(['re'=>$re]);
        return $this->fetch();
    }

    /**
     *@添加会员
     */
    public function add_member(){
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('Member');
            $data['uuid'] = get_guid();
            $result = $model->edit_member($data);
        }else{
            $sheng = Db::name('Areas')->where(['level'=>1])->select();
            $re = array();
            $re['province']  = '';
            $re['shi'] = '';
            $re['qu']  = '';
            //获取主播直播标签
            $this->assign(['sheng'=>$sheng,'re'=>$re]);
            return $this->fetch();
        }
    }

    /**
     *@添加会员
     */
    public function add_fans(){
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('Member');
            $data['uuid'] = get_guid();
            $data['is_fans'] = 2;
            $result = $model->edit_member($data);
        }else{
            $sheng = Db::name('Areas')->where(['level'=>1])->select();
            $re = array();
            $re['province']  = '';
            $re['shi'] = '';
            $re['qu']  = '';
            //获取主播直播标签
            $this->assign(['sheng'=>$sheng,'re'=>$re]);
            return $this->fetch();
        }
    }

    /**
     * 添加商户
     */
    public function  add_merchants(){
        if(request()->isAjax()) {
            $params = Request::instance()->post();
            //商品分类
            $params["goods_class"] = implode(',',$params["goods_class"]);
            //直播分类
            $params["tag"] = implode(',',$params["tag"]);
            $merchants = model("Merchants");
            $merchants ->upgrade_merchants($params);
        }else{
            $system = db::name('system')->where(['id'=>'1'])->find();
            $sheng = Db::name('Areas')->where(['level'=>1])->select();
            $re = array();
            $re['province']  = '';
            $re['shi'] = '';
            $re['qu']  = '';
            $re['dashang_scale']  = $system['dashang_scale'];
            $re['sell_scale']  = $system['sell_scale'];
            //获取主播直播标签
            $list= DB::name("live_class")->where("is_del",1)->order("sort desc")->select();
            //商户商品分类
            $goods_class = DB::name("goods_class")->where(["parent_id"=>-1,"is_delete"=>0])->select();
            $this->assign('class',$list);
            $this->assign("parent_class",$goods_class);
            $this->assign(['sheng'=>$sheng,'re'=>$re,'system'=>$system]);
            $this->view->engine->layout(false);
            return $this->fetch();
        }
    }
    /**
     *@编辑会员
     */
    public function edit_member(){
        $id = input('mid');
        $re = model('Member')->queryMemberById($id);
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $re['uuid']     ?   $data['uuid'] = $re['uuid'] :   $data['uuid'] = get_guid();
            $model = model('Member');
            $data['member_id'] = $data['mid'];
            $result = $model->edit_member($data,1,'edit');
        }else{
            //省
            $sheng = Db::name('Areas')->where("level=1")->select();
            $this->assign('sheng',$sheng);
            if(!empty($re)) {
                $fid = Db::name('Areas')->where(array('name' => $re['province'], 'level' => 1))->value('id');
                if ($fid) {
                    $data['pid'] = $fid;
                    $data['level'] = 2;
                    $re['shi'] = Db::name('Areas')->where($data)->select();  //市
                } else {
                    $re['shi'] = null;
                }
                $fid2 = Db::name('Areas')->where(array('name' => $re['city'], 'level' => 2))->value('id');
                if ($fid2) {
                    $date['pid'] = $fid2;
                    $date['level'] = 3;
                    $re['qu'] = Db::name('Areas')->where($date)->select();  //区
                } else {
                    $re['qu'] = null;
                }
                $re['city_id'] = Db::name('Areas')->where(array('name' => $re['city'], 'level' => 2))->value('id');
                $re['area_id'] = Db::name('Areas')->where(array('name' => $re['area'], 'level' => 3))->value('id');
            }
            $this->assign(['re'=>$re]);
            return $this->fetch('member/add_member');
        }
    }
    /**
     * 升级为主播
     */
    public function become_anchor(){
        $system = Db::name('system')->where(['id'=>1])->find();
        $params = Request::instance()->param();
        $member_id = $params["member_id"];
        if(Request::instance()->isPost()){
            $data["dashang_scale"] = $params["dashang_scale"];
            $data["update_time"] =date("Y-m-d H:i:s");
            $info["type"] = 3;
            $info["uptime"] = time();
            if(DB::name("anchor_info")->where(["anchor_id"=>$member_id])->find()){
                $mer = DB::name("Member")->where(["member_id"=>$member_id])->update($info);
                DB::name("anchor_info")->where(["anchor_id"=>$member_id])->update($data);
            }else{
                $data["anchor_id"] = $params["member_id"];
                $data["create_time"] = date("Y-m-d H:i:s");
                $mer = DB::name("Member")->where(["member_id"=>$member_id])->update($info);
                $result = DB::name('anchor_info')->where(["anchor_id"=>$member_id])->insert($data);
            }
            if ($result && $mer) {
                echo json_encode(['status' => "ok", 'info' => '修改记录成功!', 'url' => session('url')]);
                die;
            } else {
                echo json_encode(['status' => "error", 'info' => '修改记录失败!']);
                die;
            }
        }else{
            $this->view->engine->layout(false);
            $re = DB::name("Member")
                ->field('username,phone')
                ->where(["member_id"=>$member_id])
                ->find();
            $this->assign(['member_id'=>$member_id,'re'=>$re,'system'=>$system]);
            return $this->fetch();
        }
    }
    /**
     * @删除会员
     */
    public function del_member(){
        $id = input('ids');
        $data['member_id'] = ['in',$id];
        $anchor = DB::name('Member')->where($data)->update(['is_del'=>2]);
        if($anchor){
            echo json_encode(['status'=>"ok",'info'=>'删除记录成功!','url'=>session('url')]);
        }else{
            echo json_encode(['status'=>"error",'info'=>'删除记录失败!']);
        }
    }
    /**
     * @恢复会员
     */
    public function recovery_member(){
        $id = input('ids');
        $data['member_id'] = ['in',$id];
        $anchor = DB::name('Member')->where($data)->update(['is_del'=>1]);
        if($anchor){
            echo success(['status'=>"ok",'info'=>'恢复成功!','url'=>session('url')]);
        }else{
            echo success(['status'=>"error",'info'=>'恢复失败!']);
        }
    }
    /**
     * 真删除会员
     */
    public function del_member_true(){
        $id = input("ids");
        $data["member_id"] = ["in",$id];
        $anchor = DB::name('Member')->where($data)->delete();
        if($anchor){
            echo json_encode(['status'=>"ok",'info'=>'商户删除后无法恢复!','url'=>session('url')]);
        }else{
            echo json_encode(['status'=>"error",'info'=>'删除失败!']);
        }
    }
    /**
     * @会员详情
     */
    public function member_view(){
        $mid    =   input('mid');
        $view = DB::name('Member')->find($mid);
        if(!empty($view)){
            $view['tv'] = Db::name('television')->where(['tv_id'=>$view['tv_id']])->value('username');
        }else{
            $view['tv'] = '暂无';
        }
        //充值总额
        $view["amount_count"] = DB::name("recharge")->where(["member_id"=>$view["member_id"],"pay_state"=>2])->sum("amount");
        $meters = DB::name("recharge")->where(["member_id"=>$view["member_id"],"pay_state"=>2])->sum("meters");
        $zeng = DB::name("recharge")->where(["member_id"=>$view["member_id"],"pay_state"=>2])->sum("zeng");
        $view["meters_count"] = $meters+$zeng;
        $this->assign(['view'=>$view]);
        $type = input('type');
        $num  = input('num');
        if (empty($num)){
            $num = 10;
        }
        switch($type){
            case 1:       //充值
                $map['member_id'] = $mid;
                $map['pay_state'] = 2;
                $page=input("get.p");
                $data=DB::name("Recharge")
                    ->field('pay_number,amount,pay_type,intime,meters')
                    ->where($map)
                    ->order('intime desc')
                    ->paginate($num,false);
                $count =DB::name("Recharge")->where($map)->count(); // 查询满足要求的总记录数
                $sum = DB::name('Recharge')->where($map)->sum('amount');
                $tag = '充值总额';
                $this->assign(['list'=>$data,'sum'=>$sum,'tag'=>$tag,'mid'=>$mid,'type'=>$type]);
                break;
            case 5:         //关注
                $map=[];
                $map['a.user_id']   =  $mid;
                $count = DB::name('Follow')->alias('a')
                    ->join('__MEMBER__ b','a.user_id=b.member_id')
                    ->where($map)
                    ->count();//一共有多少条记录
                $data = DB::name('Follow')->alias('a')
                    ->field('a.*,b.username,b.phone')
                    ->join('__MEMBER__ b', 'a.user_id=b.member_id')
                    ->order('a.intime desc')
                    ->where($map)
                    ->paginate($num,false);
                $tag = "关注总人数";
                $this->assign(['list'=>$data,'tag'=>$tag,'mid'=>$mid,'type'=>$type]);
                break;
            case 7:        //送礼
                $map=[];
                $map['a.user_id']   =  $mid;
                $count = DB::name('Give_gift')->alias('a')
                    ->join('__LIVE__ b','a.live_id=b.live_id','LEFT')
                    ->join('__MEMBER__ c','a.user_id2=c.member_id','LEFT')
                    ->join('__GIFT__ d','a.gift_id=d.gift_id','LEFT')
                    ->where($map)
                    ->count();//一共有多少条记录
                $list = DB::name('Give_gift')->alias('a')
                    ->field('a.*,b.title,c.username,c.phone,d.name')
                    ->join('__LIVE__ b','a.live_id=b.live_id','LEFT')
                    ->join('__MEMBER__ c','a.user_id2=c.member_id','LEFT')
                    ->join('__GIFT__ d','a.gift_id=d.gift_id','LEFT')
                    ->where($map)
                    ->order('a.intime desc')
                    ->paginate($num,false);
                $sum = DB::name('Give_gift')->alias('a')
                    ->join('__LIVE__ b','a.live_id=b.live_id','LEFT')
                    ->join('__MEMBER__ c','a.user_id2=c.member_id','LEFT')
                    ->join('__GIFT__ d','a.gift_id=d.gift_id','LEFT')
                    ->where($map)->sum('a.jewel');
                $tag = '送礼总额';
                $this->assign(['list'=>$list,'tag'=>$tag]);
                break;
            case 8://订单情况
                $map["a.member_id"] =$mid;
                $map["a.is_delete"]=0;
                $count = DB::name("order_merchants")
                    ->alias("a")
                    ->join("__MERCHANTS__ b","a.merchants_id = b.member_id")
                    ->where($map)
                    ->count();
                $list =DB::name("order_merchants")
                    ->alias("a")
                    ->field("a.*,b.merchants_img,b.merchants_name")
                    ->join("__MERCHANTS__ b","a.merchants_id = b.member_id")
                    ->where($map)
                    ->order("a.create_time desc")
                    ->paginate($num,false);
                $tag = "下单总量";
                $this->assign(['list'=>$list,'tag'=>$tag]);
                break;
        }
        $this->assign(["type"=>$type,'mid'=>$mid]);
        return $this->fetch();
    }
    /**
     * @获取市
     */
    public function get_area(){
        $value = input('value');
        $type = input('type');
        if (isset($value)){
            if ($type==1){
                $data['level'] = 2;
                $data['pid'] = array('eq',$value);
                $type_list="<option value=''>请选择（市）</option>";
                $shi = Db::name('Areas')->where($data)->select();
            }else {
                $data['level'] = 3;
                $data['pid'] = array('eq',$value);
                $type_list="<option value=''>请选择（区/县）</option>";
                $shi = Db::name('Areas')->where($data)->select();
            }
            foreach($shi as $k=>$v){
                $type_list.="<option value=".$shi[$k]['id'].">".$shi[$k]['name']."</option>";
            }
            echo $type_list;
        }
    }
}