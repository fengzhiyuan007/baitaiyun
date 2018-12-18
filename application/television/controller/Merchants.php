<?php
namespace app\television\controller;
use think\controller;
use think\Db;
use think\Request;
use think\Validate;
use think\session;
class Merchants extends Base{
    /**
     * 商户列表
     * @return mixed
     */
    public function index(){
        $map=[];
        !empty($_GET['username']) && $map['username|phone|merchants_name|contact_name'] = ['like','%'.input('username').'%'];
        $map['a.is_delete'] = 0;
        $map["a.apply_state"] = 2;
        $map["b.type"] = 2;
        $map["a.tv_id"] = session::get('member.member_id');
       $map["a.platform_type"] =1;
        $num  = input('num');
        if (empty($num)){
            $num = 10;
        }
        $count = DB::name("Merchants")
            ->alias('a')
            ->join('__MEMBER__ b','a.member_id = b.member_id')
            ->where($map)
            ->count();
        $list = DB::name("Merchants")
            ->alias("a")
            ->field("a.merchants_id,a.merchants_name,a.merchants_img,a.contact_name,a.create_time,a.update_time,a.contact_mobile,a.member_id,b.phone,b.header_img,a.apply_state,a.pay_state,a.dashang_scale,a.sell_scale,a.tv_sell_scale,a.spread_scale,a.company_name")
            ->join('__MEMBER__ b','a.member_id = b.member_id')
            ->where($map)
            ->order("a.create_time desc")
            ->paginate($num,false);
        $url =$_SERVER['REQUEST_URI'];
        session('url',$url);
        $this->assign(['list'=>$list,'count'=>$count]);
        return $this->fetch();
    }
    /**
     * 删除商户列表
     */
    public function del_merchants_list(){
        $map=[];
        !empty($_GET['username']) && $map['username|phone|merchants_name|contact_name'] = ['like','%'.input('username').'%'];
        $map['a.is_delete'] = 1;
        $map["a.apply_state"] = 2;
        $map["b.type"] = 2;
        $map["a.tv_id"] = session('member')["member_id"];
        $map["a.platform_type"] =1;
        $num  = input('num');
        if (empty($num)){
            $num = 10;
        }
        $count = DB::name("Merchants")
            ->alias('a')
            ->join('__MEMBER__ b','a.member_id = b.member_id')
            ->where($map)
            ->count();
        $this->assign("count",$count);
        $list = DB::name("Merchants")
            ->alias("a")
            ->field("a.merchants_id,a.merchants_name,a.merchants_img,a.contact_name,a.create_time,a.update_time,a.contact_mobile,a.member_id,b.phone,b.header_img,a.apply_state,a.pay_state,a.dashang_scale,a.sell_scale,a.company_name")
            ->join('__MEMBER__ b','a.member_id = b.member_id')
            ->where($map)
            ->paginate($num,false);
        $url =$_SERVER['REQUEST_URI'];
        session('url',$url);
        $this->assign("list",$list);
        return $this->fetch();
    }
    /**
     * 商户直播销售详情
     */
    public function view(){
        $params = Request::instance()->param();
        $member_id = $params["member_id"];
        $view = DB::name("merchants")
            ->alias("a")
            ->join("__MEMBER__ b",'a.member_id = b.member_id')
            ->where(["a.member_id"=>$member_id])
            ->find();
        $type = $params["type"];
        $this->assign(['view'=>$view,"member_id"=>$member_id,"type"=>$type]);
        $num  = input('num');
        if (empty($num)){
            $num = 10;
        }
        switch($type){
            case 1://提现
                $count = DB::name('Withdraw')->where(['user_id' => $member_id])->count();//一共有多少条记录
                $list = DB::name('Withdraw')->where(['user_id' => $member_id])->order('intime desc')->paginate(10,false);;
                $tag = '提现总额';
                break;
            case 3:       // 粉丝
                $map=[];
                $map['a.user_id2']   =  $member_id;
                $count = DB::name('Follow')->alias('a')
                    ->join('__MEMBER__ b', 'a.user_id2=b.member_id')
                    ->where($map)
                    ->count();//一共有多少条记录
                $list = DB::name('Follow')->alias('a')
                    ->field('a.*,b.username,b.phone')
                    ->join('__MEMBER__ b','a.user_id=b.member_id')
                    ->where($map)
                    ->order('a.intime desc')
                    ->paginate($num,false);
                $this->assign(['list'=>$list,"mid"=>$member_id,'type'=>$type]);
                $tag = "粉丝总人数";
                break;
            case 4:       //收礼
                $map=[];
                $map['a.user_id2']   =  $member_id;
                $count = DB::name('Give_gift')->alias('a')
                    ->join('__LIVE__ b','a.live_id=b.live_id','LEFT')
                    ->join('__MEMBER__ c', 'a.user_id=c.member_id','LEFT')
                    ->join('__GIFT__ d' ,'a.gift_id=d.gift_id','LEFT')
                    ->where($map)
                    ->count();//一共有多少条记录
                $list = DB::name('Give_gift')->alias('a')
                    ->field('a.*,b.title,c.username,c.phone,d.name')
                    ->join('__LIVE__ b','a.live_id=b.live_id','LEFT')
                    ->join('__MEMBER__ c', 'a.user_id=c.member_id','LEFT')
                    ->join('__GIFT__ d' ,'a.gift_id=d.gift_id','LEFT')
                    ->where($map)
                    ->order('a.intime desc')
                    ->paginate($num,false);
                $sum = DB::name('Give_gift')->alias('a')
                    ->join('__LIVE__ b','a.live_id=b.live_id','LEFT')
                    ->join('__MEMBER__ c', 'a.user_id=c.member_id','LEFT')
                    ->join('__GIFT__ d' ,'a.gift_id=d.gift_id','LEFT')
                    ->where($map)->sum('a.jewel');
                $tag = '收礼总额';
                $this->assign(['list'=>$list,'sum'=>$sum,'tag'=>$tag,"type"=>$type]);
                break;
            case 5://直播列表
                $map=[];
                $map['a.user_id']   =  $member_id;
                $count = DB::name('Live')->alias('a')
                    ->join('__MEMBER__ b on a.user_id=b.member_id')
                    ->where($map)->count();//一共有多少条记录
                $list = DB::name('Live')->alias('a')
                    ->field("a.*")
                    ->join('__MEMBER__ b on a.user_id=b.member_id')
                    ->where($map)
                    ->order('a.intime desc')
                    ->paginate($num,false);
                foreach ($list as $k=>$v){
                    $data = array();
                    $data = $v;
                    $data['gift_count'] = DB::name('Give_gift')->where(['live_id' => $v['live_id']])->sum('jewel');
                    $data['gift_count'] ? $data['gift_count'] : $data['gift_count'] = '0';
                    $list->offsetSet($k,$data);
                }
                $tag = "直播列表";
                break;
            case 6://录播列表
                $map = [];
                $map['a.user_id'] = $member_id;
                $map['a.is_del'] = '1';
                $count = DB::name('Live_store')->alias('a')
                    ->join('__MEMBER__ b','a.user_id=b.member_id','LEFT')
                    ->join('__LIVE__ c','a.live_id=c.live_id','LEFT')
                    ->where($map)
                    ->count();//一共有多少条记录
                $list = DB::name('Live_store')->alias('a')
                    ->field('a.*,b.username,b.header_img,b.sex,b.phone,b.ID,c.title')
                    ->join('__MEMBER__ b','a.user_id=b.member_id','LEFT')
                    ->join('__LIVE__ c','a.live_id=c.live_id','LEFT')
                    ->where($map)
                    ->order('a.intime desc')
                    ->paginate($num,false);
                $tag = "录播列表";
                break;
        }
        $this->assign(['list'=>$list,"count"=>$count,"tag"=>$tag]);
        return $this->fetch();
    }
    /**
     * @添加商户(主播)
     * @return mixed
     */
    public function  add_merchants(){
        if(request()->isAjax()) {
            $params = Request::instance()->param();
            $params["member_type"] = "merchants";
            $params["spread_scale"] = $this->system['spread_scale'];
            $params["type"] = 2;
            $params["class_id"] = implode(',',$params["goods_class"]);
            $member = model("Member");
            $member->edit_member($params);
        }else{
            $sheng = Db::name('Areas')->where(['level'=>1])->select();
            $re = array();
            $re['province']  = '';
            $re['shi'] = '';
            $re['qu']  = '';
            //获取主播直播标签
            $list= DB::name("live_class")->where("is_del",1)->order("sort desc")->select();
            //商户商品分类
            $goods_class = DB::name("goods_class")->where(["parent_id"=>-1,"is_delete"=>0])->select();
            $re['dashang_scale'] = $this->system['dashang_scale'];
            $re['sell_scale'] = $this->system['sell_scale'];
            $re['tv_sell_scale'] = $this->system['tv_sell_scale'];
            $re['spread_scale'] = $this->system['spread_scale'];
            $this->assign('class',$list);
            $this->assign("parent_class",$goods_class);
            $this->assign(['sheng'=>$sheng,'re'=>$re]);
            return $this->fetch();
        }
    }
    /**
     * 编辑商户（主播）
     */
    public function edit_merchants(){
        $params= Request::instance()->param();
        if(Request::instance()->isAjax()){
            $params["member_type"] = "merchants";
            $params["live_tag"] = implode(',',$params["tag"]);
            $params["class_id"] = implode(',',$params["goods_class"]);
            $member = model("Member");
            $this->assign('member_id',$params['member_id']);
            $member->edit_member($params);
        }else{
            $this->assign('member_id',$params['member_id']);
            $re = DB::name("Member")->alias("a")

                ->join('__MERCHANTS__ b','a.member_id=b.member_id')
                ->join('th_goods_merchants_class c',"a.member_id = c.member_id")
                ->where("a.member_id",$params["member_id"])
                ->find();
            //获取地区
            $sheng = Db::name('Areas')->where(['level'=>1])->select();
            if (!empty($re)) {
                $fid = Db::name('Areas')->where(array('name' => $re['merchants_province'], 'level' => 1))->value('id');
                if ($fid) {
                    $data['pid'] = $fid;
                    $data['level'] = 2;
                    $re['shi'] = Db::name('Areas')->where($data)->select();  //市
                } else {
                    $re['shi'] = null;
                }
                $fid2 = Db::name('Areas')->where(array('name' => $re['merchants_city'], 'level' => 2))->value('id');
                if ($fid2) {
                    $date['pid'] = $fid2;
                    $date['level'] = 3;
                    $re['qu'] = Db::name('Areas')->where($date)->select();  //区
                } else {
                    $re['qu'] = null;
                }
                $re['city_id'] = Db::name('Areas')->where(array('name' => $re['merchants_city'], 'level' => 2))->value('id');
                $re['area_id'] = Db::name('Areas')->where(array('name' => $re['merchants_country'], 'level' => 3))->value('id');
            }
            //获取主播直播标签
            $class= DB::name("live_class")->field("live_class_id,tag")->where("is_del",1)->order("sort desc")->select();
            $live_tag = explode(',',$re["live_tag"]);
            foreach ($class as $k=>$v){
                if(in_array($v["live_class_id"],$live_tag)){
                    $class[$k]["is_selected"] = 1;
                }else{
                    $class[$k]["is_selected"] = 0;
                }
            }
            //商户商品分类
            $goods_class = DB::name("goods_class")->where(["parent_id"=>-1,"is_delete"=>0])->select();
            $goods_tag = explode(',',$re["class_id"]);
            foreach ($goods_class as $k=>$v){
                if(in_array($v["class_id"],$goods_tag)){
                    $goods_class[$k]["is_selected"] = 1;
                }else{
                    $goods_class[$k]["is_selected"] = 0;
                }
            }
            if(!$re['dashang_scale'])  $re['dashang_scale'] = $this->system['dashang_scale'];
            $re['sell_scale'] = $this->system['sell_scale'];
            if(!$re['tv_sell_scale'])  $re['tv_sell_scale'] = $this->system['tv_sell_scale'];
            $this->assign(['sheng'=>$sheng,'re'=>$re,'class'=>$class,'parent_class'=>$goods_class]);
            return $this->fetch("merchants/add_merchants");
        }
    }
    /**
     * 删除商户
     */
    public function del_merchants(){
        $member_id = input("ids");
        empty($member_id) ? error('无法获取电视台信息') : true;
        $map["member_id"]  = ["in",$member_id];
        $res = DB::name("Merchants")->where($map)->update(["is_delete"=>1,"update_time"=> date("Y-m-d H:i:s")]);
        if($res){
            echo json_encode(['status'=>"ok",'info'=>'删除记录成功!','url'=>session('url')]);
        }else{
            echo json_encode(['status'=>"error",'info'=> $member_id]);
        }
    }
    /**
     *恢复商户
     */
    public function recovery_merchants(){
        $member_id = input("ids");
        empty($member_id) ? error('无法获取电视台信息') : true;
        $map["member_id"]  = ["in",$member_id];
        $res = DB::name("Merchants")->where($map)->update(["is_delete"=>0,"update_time"=> date("Y-m-d H:i:s")]);
        if($res){
            echo json_encode(['status'=>"ok",'info'=>'商户恢复成功!','url'=>session('url')]);
        }else{
            echo json_encode(['status'=>"error",'info'=>'商户恢复失败!']);
        }
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


