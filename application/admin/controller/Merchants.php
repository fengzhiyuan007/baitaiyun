<?php
namespace app\admin\controller;
use Think\Db;
use think\Request;
use think\Session;
use lib\Page;
use think\Validate;
class Merchants extends Base{
    /**
     *商户列表
     */
    public function index(){
        $map=[];
        !empty($_GET['username']) && $map['phone|merchants_name|contact_mobile|contact_name'] = ['like','%'.input('username').'%'];
        $map['a.is_delete'] = 0;
        $map["a.apply_state"] = ["not in",['0','1']];
        $map["b.type"] = 2;
        $map['b.is_del'] = 1;
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
        $list = DB::name("Merchants")->alias("a")
                ->field("a.dashang_scale,a.sell_scale,a.tv_sell_scale,a.spread_scale,a.merchants_id,a.merchants_name,a.merchants_img,a.contact_name,a.create_time,a.update_time,a.contact_mobile,a.member_id,b.phone,b.header_img,a.apply_state,a.pay_state")
                ->join('__MEMBER__ b','a.member_id = b.member_id')
                ->where($map)
                ->paginate($num,false);
        $list->toArray();
        foreach ($list as $k=>$v){
            $data = array();
            $data = $v;
            $data['merchant_scale'] = 100 - $v['sell_scale']- $v['tv_sell_scale'] - $v['spread_scale'];
            $list->offsetSet($k,$data);
        }
        $url =$_SERVER['REQUEST_URI'];
        session('url',$url);
        $this->assign("list",$list);
        return $this->fetch();
    }
    /**
     *申请商户列表
     */
    public function apply_list(){
        $map=[];
        !empty($_GET['username']) && $map['username|phone'] = ['like','%'.input('username').'%'];
        $map['a.is_delete'] = 0;
        $map["a.apply_state"] = 1;
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
            ->field("a.dashang_scale,a.sell_scale,a.merchants_id,a.merchants_name,a.merchants_img,a.contact_name,a.create_time,a.update_time,a.contact_mobile,a.member_id,b.phone,b.header_img,a.apply_state,a.pay_state")
            ->join('__MEMBER__ b','a.member_id = b.member_id')
            ->where($map)
            ->paginate($num,false);
        $url =$_SERVER['REQUEST_URI'];
        session('url',$url);
        $this->assign("list",$list);
        return $this->fetch();
    }
    /**
     * 已删除商户
     */
    public function is_del_merchants(){
        $map=[];
        !empty($_GET['username']) && $map['username|phone'] = ['like','%'.input('username').'%'];
        $map['a.is_delete'] = 1;
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
        $list = DB::name("Merchants")->alias("a")
            ->field("a.merchants_id,a.member_id,a.merchants_name,a.merchants_img,a.contact_name,a.create_time,a.update_time,a.contact_mobile,b.phone,b.header_img,a.apply_state,a.pay_state")
            ->join('__MEMBER__ b','a.member_id = b.member_id')
            ->where($map)
            ->paginate($num,false);
        $url =$_SERVER['REQUEST_URI'];
        session('url',$url);
        $this->assign("list",$list);
        return $this->fetch();
    }

    /**
     * 添加商户
     */
    public function  add_merchants(){
        if(request()->isAjax()) {
            $params = Request::instance()->param();
            //商品分类
            $params["goods_class"] = implode(',',$params["goods_class"]);
            //直播分类
            $params["tag"] = implode(',',$params["tag"]);
            $sheng = input('sheng');
            $shi = input('shi');
            $qu = input('qu');
            $params['merchants_province'] = Db::name('Areas')->where(array('id' => $sheng))->value('name');
            $params['merchants_city'] = Db::name('Areas')->where(array('id' => $shi))->value('name');
            $params['merchants_country'] = Db::name('Areas')->where(array('id' => $qu))->value('name');
            $params['merchants_province'] ? $params['merchants_province'] : $params['merchants_province'] = '';
            $params['merchants_city'] ? $params['merchants_city'] : $params['merchants_city'] = '';
            $params['merchants_country'] ? $params['merchants_country'] : $params['merchants_country'] = '';
            $merchants = model("Merchants");
            $merchants ->add_merchants($params);
        }else{
            $sheng = Db::name('Areas')->where(['level'=>1])->select();
            $re = array();
            $re['province']  = '';
            $re['shi'] = '';
            $re['qu']  = '';
            $re['dashang_scale']  = $this->system['dashang_scale'];
            $re['sell_scale']  = $this->system['sell_scale'];
            $re['tv_sell_scale']  = $this->system['tv_sell_scale'];
            //获取主播直播标签
            $list= DB::name("live_class")->where("is_del",1)->order("sort desc")->select();
            //商户商品分类
            $goods_class = DB::name("goods_class")->where(["parent_id"=>-1,"is_delete"=>0])->select();
            $this->assign('class',$list);
            $this->assign("parent_class",$goods_class);
            $this->assign(['sheng'=>$sheng,'re'=>$re]);
            return $this->fetch();
        }
    }
    /**
     * @删除商户
     */
    public function del_merchants(){
        $id = input('ids');
        $data['merchants_id'] = ['in',$id];
        $user = DB::name('Merchants')->where($data)->update(['is_delete'=>1]);
        $member_ids = Db::name('Merchants')->where($data)->column('member_id');
        if($user){
            Db::name('member')->where(['member_id'=>['in',$member_ids]])->update(['type'=>'1']);
            Db::name('goods')->where(['merchants_id'=>['in',$member_ids]])->update(['goods_state'=>'2','is_tuijian'=>'0']);
            echo json_encode(['status'=>"ok",'info'=>'删除记录成功!','url'=>session('url')]);
        }else{
            echo json_encode(['status'=>"error",'info'=>'删除记录失败!']);
        }
    }
    /**
     * @恢复商户
     */
    public function recovery(){
        $id = input('ids');
        $data['merchants_id'] = ['in',$id];
        $merchants = DB::name('Merchants')->where($data)->update(['is_delete'=>0]);
        $member_ids = Db::name('Merchants')->where($data)->column('member_id');
        if($merchants){
            Db::name('member')->where(['member_id'=>['in',$member_ids]])->update(['type'=>'2']);
            echo json_encode(['status'=>"ok",'info'=>'恢复成功!','url'=>session('url')]);
        }else{
            echo json_encode(['status'=>"error",'info'=>'恢复失败!']);
        }
    }
    /**
     * 真删除商户
     */
    public function del_merchants_true(){
        $id = input("ids");
        $data["member_id"] = ["in",$id];
        $merchants = DB::name('member')->where($data)->delete();
        if($merchants){
            DB::name('Merchants')->where($data)->delete();
            echo json_encode(['status'=>"ok",'info'=>'商户删除后无法恢复!','url'=>session('url')]);
        }else{
            echo json_encode(['status'=>"error",'info'=>'删除失败!']);
        }
    }
    /**
     * 编辑商户信息
     */
    public function update_merchants(){
       $params = Request::instance()->param();
       $member_id = $params["mid"];
        if(Request::instance()->isAjax()){
            $merchants_id = DB::name("Merchants")->where(["member_id"=>$member_id])->value("merchants_id");
            $params["live_tag"] = implode(',',$params["tag"]);
            $params["class_id"] = implode(',',$params["goods_class"]);
            $merchants["company_name"] = empty($params["company_name"]) ? true : $params["company_name"];
            $merchants["contact_name"] = empty($params["contact_name"]) ? true : $params["contact_name"];
            $merchants["company_mobile"] = empty($params["company_mobile"]) ? true : $params["company_mobile"];
            $merchants["contact_mobile"] = empty($params["contact_mobile"]) ? true : $params["contact_mobile"];
            $merchants["merchants_address"] = empty($params["merchants_address"]) ? true : $params["merchants_address"];
            $merchants["merchants_img"] = empty($params["merchants_img"]) ? true : $this->domain($params['merchants_img']);
            $merchants["legal_face_img"] = empty($params["legal_face_img"]) ? true : $this->domain($params['legal_face_img']);
            $merchants["legal_hand_img"] = empty($params["legal_hand_img"]) ? true : $this->domain($params['legal_hand_img']);
            $merchants["business_img"] = empty($params["business_img"]) ? true : $this->domain($params['business_img']);
            $merchants["legal_img"] = empty($params["legal_img"]) ? true : $this->domain($params['legal_img']);
            $merchants["legal_opposite_img"] = empty($params["legal_opposite_img"]) ? true : $this->domain($params['legal_opposite_img']);
            $merchants["merchants_content"] = empty($params["merchants_content"]) ? true : $params["merchants_content"];
            $merchants["dashang_scale"] = empty($params["dashang_scale"]) ? true : $params["dashang_scale"];
            $merchants["sell_scale"] = empty($params["sell_scale"]) ? true : $params["sell_scale"];
            $merchants["update_time"] = date("Y-m-d H:i:s");
            $sheng = input('sheng');
            $shi = input('shi');
            $qu = input('qu');
            $merchants['merchants_province'] = Db::name('Areas')->where(array('id' => $sheng))->value('name');
            $merchants['merchants_city'] = Db::name('Areas')->where(array('id' => $shi))->value('name');
            $merchants['merchants_country'] = Db::name('Areas')->where(array('id' => $qu))->value('name');
            $merchants['merchants_province'] ? $merchants['merchants_province'] : $merchants['merchants_province'] = '';
            $merchants['merchants_city'] ? $merchants['merchants_city'] : $merchants['merchants_city'] = '';
            $merchants['merchants_country'] ? $merchants['merchants_country'] : $merchants['merchants_country'] = '';
            $up_merchants = DB::name("merchants")->where(["merchants_id"=>$merchants_id])->update($merchants);
            $member["live_tag"] = empty($params["live_tag"]) ? true : $params["live_tag"];
            $member["uptime"] = time();
            $up_member = DB::name("Member")->where(["member_id"=>$member_id])->update($member);

            $class["class_id"] = empty($params["class_id"]) ? true : $params["class_id"];

            $class["intime"] = date("Y-m-d H:i:s");
            if(DB::name('goods_merchants_class')->where(["member_id"=>$member_id])->find() && isset($params["class_id"])){
                $upclass = DB::name("goods_merchants_class")->where(["member_id"=>$member_id])->update($class);
            }else{
                $addClass= array();
                $addClass['member_id'] = $member_id;
                $addClass['intime'] = date("Y-m-d H:i:s");
                $addClass['class_id'] = $class["class_id"];
                $upclass = DB::name("goods_merchants_class")->insert($addClass);
            }


            if($up_merchants || $up_member || $upclass){
                return success(['info'=>'资料编辑成功']);
            }else{
                return error(['info'=>'无任何操作']);
            }
        }else{
            $map["a.member_id"] = $params["mid"];
            $res = DB::name("Merchants")->alias("a")
                ->field('a.*,b.username,b.phone,b.live_tag,c.class_id')
                ->join("__MEMBER__ b","a.member_id=b.member_id")
                ->join("th_goods_merchants_class c","a.member_id = c.member_id","left")
                ->where($map)
                ->find();
            $sheng = Db::name('Areas')->where("level=1")->select();
            $this->assign('sheng', $sheng);
            if (!empty($res)) {
                $fid = Db::name('Areas')->where(array('name' => $res['merchants_province'], 'level' => 1))->value('id');
                if ($fid) {
                    $data['pid'] = $fid;
                    $data['level'] = 2;
                    $res['shi'] = Db::name('Areas')->where($data)->select();  //市
                } else {
                    $res['shi'] = null;
                }
                $fid2 = Db::name('Areas')->where(array('name' => $res['merchants_city'], 'level' => 2))->value('id');
                if ($fid2) {
                    $date['pid'] = $fid2;
                    $date['level'] = 3;
                    $res['qu'] = Db::name('Areas')->where($date)->select();  //区
                } else {
                    $res['qu'] = null;
                }
                $res['city_id'] = Db::name('Areas')->where(array('name' => $res['merchants_city'], 'level' => 2))->value('id');
                $res['area_id'] = Db::name('Areas')->where(array('name' => $res['merchants_country'], 'level' => 3))->value('id');
            }
            if(!$res['sell_scale'])         $res['sell_scale'] = $this->system['sell_scale'];
            if(!$res['dashang_scale'])      $res['dashang_scale'] = $this->system['dashang_scale'];
            //获取主播直播标签
            $class= DB::name("live_class")->field("live_class_id,tag")->where("is_del",1)->order("sort desc")->select();
            $live_tag = explode(',',$res["live_tag"]);
            foreach ($class as $k=>$v){
                if(in_array($v["live_class_id"],$live_tag)){
                    $class[$k]["is_selected"] = 1;
                }else{
                    $class[$k]["is_selected"] = 0;
                }
            }
            if($res['tv_id']){
                $res['tv'] = Db::name('television')->where(['tv_id'=>$res['tv_id']])->value('username');
            }else{
                $res['tv'] = '归属总平台';
            }
            //商户商品分类
            $goods_class = DB::name("goods_class")->where(["parent_id"=>-1,"is_delete"=>0])->order("sort desc")->select();
            $goods_tag = explode(',',$res["class_id"]);
            foreach ($goods_class as $k=>$v){
                if(in_array($v["class_id"],$goods_tag)){
                    $goods_class[$k]["is_selected"] = 1;
                }else{
                    $goods_class[$k]["is_selected"] = 0;
                }
            }
            $this->assign("class",$class);
            $this->assign('parent_class',$goods_class);
            $this->assign("re",$res);
            return $this->fetch();
        }
    }


    /**
     * @return mixedh 商户信息审核
     */
    public function edit_merchants(){
        $id = input('mid');
        if(Request::instance()->isPost()){
            $params = Request::instance()->param();
            $map["dashang_scale"]=$params["dashang_scale"];
            $map["sell_scale"] = $params["sell_scale"];
            $rule = [
                'dashang_scale'=>'require|number|between:0,100',
                'sell_scale'=>'require|number|between:0,100',
            ];
            $message = [
                'dashang_scale.require'             => '请设置主播获取打赏比例',
                'dashang_scale.number'              => '打赏比例只能为整数',
                'dashang_scale.between'             => '打赏比例值为0~100',
                'sell_scale.require'                => '请设置主播销售分润比例',
                'sell_scale.number'                 => '分润比例只能为整数',
                'sell_scale.between'                => '分润比例值为0~100',
            ];
            $validate = new Validate($rule,$message);
            $result   = $validate->check($map);
            if(!$result){
                error($validate->getError());
            }
            $apply_state = $params["apply_state"];
            $update = date("Y-m-d h:i:s");
            $map["apply_state"]=$apply_state;
            $map["update_time"]=$update;
            if($apply_state==2){
                DB::name("Member")->where("member_id",$id)->update(["type"=>2]);
            }
            DB::name("merchants")->where("member_id",$id)->update($map);
            success(array("satus"=>"ok","info"=>"编辑程成功"));
        }else{
            $sheng = Db::name('Areas')->where("level=1")->select();
            $this->assign('sheng', $sheng);
            $list = DB::name("merchants")->where('member_id',$id)
                ->column('merchants_id,merchants_name,contact_name,contact_mobile,merchants_city,merchants_province,merchants_country,merchants_address,business_img,legal_img,legal_hand_img,legal_face_img,legal_opposite_img,apply_state,pay_state,dashang_scale,sell_scale','member_id');
            $re = $list[$id];
            if(!$re['sell_scale'])      $re['sell_scale'] = $this->system['sell_scale'];
            if(!$re['dashang_scale'])      $re['dashang_scale'] = $this->system['dashang_scale'];
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
            $this->assign("re",$re);
            return $this->fetch();
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