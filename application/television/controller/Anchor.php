<?php
namespace app\television\controller;
use think\controller;
use think\Db;
use think\Request;
use think\Validate;
use think\session;
class Anchor extends Base{
    /**
     * 主播列表
     * @return mixed
     */
    public function index(){
        $params = Request::instance()->param();
        $map=[];
        !empty($_GET['username']) ? $map['a.username|a.phone'] = ['like','%'.input('username').'%'] : true;
        $num  = input('num');
        if (empty($num)){
            $num = 10;
        }
        $map["a.type"] = 3;
        $map["is_del"] =1;
        $map["b.tv_id"] = session('member')["member_id"];
        if(empty($num)){
            $num = 10;
        }
        $count = DB::name("Member")->alias("a")->join('th_anchor_info b','a.member_id=b.anchor_id')->where($map)->count();
        $list = DB::name("Member")
                ->alias("a")
                ->join("th_anchor_info b","a.member_id=b.anchor_id")
                ->order('a.intime desc')
                ->where($map)
                ->paginate($num,false,["query"=>$params]);
        $url =$_SERVER['REQUEST_URI'];
        Session::set('url',$url);
        $this->assign("count",$count);
        $this->assign("list",$list);
        return $this->fetch();
    }
    /**
     * @删除主播列表
     */
    public function del_anchor_list(){
        $params = Request::instance()->param();
        $map=[];
        !empty($_GET['username']) ? $map['a.username|a.phone'] = ['like','%'.input('username').'%'] : true;
        $num  = input('num');
        if (empty($num)){
            $num = 10;
        }
        $map["a.type"] = 3;
        $map["is_del"] =2;
        $map["b.tv_id"] = session('member')["member_id"];
        if(empty($num)){
            $num = 10;
        }
        $count = DB::name("Member")->alias("a")->join('th_anchor_info b','a.member_id=b.anchor_id')->where($map)->count();
        $list = DB::name("Member")
            ->alias("a")
            ->join("th_anchor_info b","a.member_id=b.anchor_id")
            ->where($map)
            ->order('a.intime desc')
            ->paginate($num,false,["query"=>$params]);
        $url =$_SERVER['REQUEST_URI'];
        Session::set('url',$url);
        $this->assign("count",$count);
        $this->assign("list",$list);
        return $this->fetch();
    }
    /**
     * @添加主播
     * @return mixed
     */
    public function  add_anchor(){
        $system = $this->system;
        if(request()->isAjax()) {
            $params = Request::instance()->param();
            $params["member_type"] = "anchor";
            $params["live_tag"] = implode(',',$params["tag"]);
            $params["type"]=3;
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
            //获取电视台默认百分比
            $re['dashang_scale']  = $this->system['dashang_scale'];
            $this->assign('class',$list);
            $this->assign(['sheng'=>$sheng,'re'=>$re]);
            return $this->fetch();
        }
    }
    /**
     * 编辑页面
     */
    public function edit_anchor(){
        $params= Request::instance()->param();
        if(Request::instance()->isAjax()){
            $params["member_type"] = "anchor";
            $params["live_tag"] = implode(',',$params["tag"]);
            $params["type"]=3;
            $member = model("Member");
            $member->edit_member($params);
        }else{
            $list = DB::name("Member")
                ->alias("a")
                ->join('th_anchor_info b','a.member_id=b.anchor_id')
                ->where("a.member_id",$params["member_id"])
                ->find();
            //获取地区
            $sheng = Db::name('Areas')->where(['level'=>1])->select();
            $re = array();
            $re['province']  = '';
            $re['shi'] = '';
            $re['qu']  = '';
            //获取主播直播标签
            $class= DB::name("live_class")->field("live_class_id,tag")->where("is_del",1)->order("sort desc")->select();
            $live_tag = explode(',',$list["live_tag"]);
            foreach ($class as $k=>$v){
                if(in_array($v["live_class_id"],$live_tag)){
                    $class[$k]["is_selected"] = 1;
                }else{
                    $class[$k]["is_selected"] = 0;
                }
            }
            if(!$re['dashang_scale'])       $re['dashang_scale'] = $this->system['dashang_scale'];
            $this->assign('class',$class);
            $this->assign(['sheng'=>$sheng,'re'=>$re]);
            $this->assign("re",$list);
            return $this->fetch("anchor/add_anchor");
        }
    }
    /**
     * 主播详情
     */
    public function anchor_view(){
        $params = Request::instance()->param();
        $view   = DB::name('Member')
                ->alias("a")
                ->join("th_anchor_info b","a.member_id=b.anchor_id")
                ->find($params["member_id"]);
        $member_id = $params["member_id"];
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
     * 删除主播
     */
    public function del_anchor(){
        $member_id = input("ids");
        empty($member_id) ? error('无法获取电视台信息') : true;
        $map["member_id"]  = ["in",$member_id];
        $res = DB::name("Member")->where($map)->update(["is_del"=>2,"uptime"=>time()]);
        if($res){
            echo json_encode(['status'=>"ok",'info'=>'删除记录成功!','url'=>session('url')]);
        }else{
            echo json_encode(['status'=>"error",'info'=>'删除记录失败!']);
        }
    }
    /**
     *恢复商户
     */
    public function recovery_anchor(){
        $member_id = input("ids");
        empty($member_id) ? error('无法获取电视台信息') : true;
        $map["member_id"]  = ["in",$member_id];
        $res = DB::name("Member")->where($map)->update(["is_del"=>1,"uptime"=> time()]);
        if($res){
            echo json_encode(['status'=>"ok",'info'=>'主播恢复成功!','url'=>session('url')]);
        }else{
            echo json_encode(['status'=>"error",'info'=>'主播恢复失败!']);
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