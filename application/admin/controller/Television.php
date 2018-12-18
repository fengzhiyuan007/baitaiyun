<?php
namespace app\admin\controller;
use Think\Db;
use think\Request;
use think\Session;
use lib\Page;
use think\Validate;
class Television extends Base{
    /**
     *电视台列表
     */
    public function index(){
        $params = Request::instance()->param();
        $map["is_del"] =1;
        empty($params['username']) ? true : $map['username|phone'] = ['like','%'.$params['username'].'%'];
        if(empty($params["num"])){
            $num = 10;
        }
        $count = DB::name("Television")->where($map)->count();
        $list = DB::name("Television")->where($map)->order("create_time desc")->paginate($num,false,["query"=>$params]);
        $this->assign("count",$count);
        $this->assign("list",$list);
        $url =$_SERVER['REQUEST_URI'];
        Session::set('url',$url);
        return $this->fetch();
    }

    /**
     *@省级电视台
     */
    public function province(){
        $params = Request::instance()->param();
        $map["is_del"] =1;
        $map['tv_type'] = 1;
        empty($params['username']) ? true : $map['username|phone'] = ['like','%'.$params['username'].'%'];
        if(empty($params["num"])){
            $num = 10;
        }
        $count = DB::name("Television")->where($map)->count();
        $list = DB::name("Television")->where($map)
            ->order("create_time desc")->paginate($num,false,["query"=>$params]);
        $this->assign("count",$count);
        $this->assign("list",$list);
        $url =$_SERVER['REQUEST_URI'];
        Session::set('url',$url);
        return $this->fetch();
    }

    /**
     *@市级电视台
     */
    public function city(){
        $params = Request::instance()->param();
        $map["a.is_del"] =1;
        $map['a.tv_type'] = 2;
        empty($params['username']) ? true : $map['a.username|a.phone'] = ['like','%'.$params['username'].'%'];
        !empty($params['province'])     &&  $map['a.pid'] = $params['province'];
        if(empty($params["num"])){
            $num = 10;
        }
        $count = DB::name("Television")->alias('a')
            ->join('th_television b','a.pid = b.tv_id','left')
            ->where($map)->count();
        $list = DB::name("Television")->alias('a')
            ->field('a.*,b.username as pusername')
            ->join('th_television b','a.pid = b.tv_id','left')
            ->where($map)
            ->order("a.create_time desc")->paginate($num,false,["query"=>$params]);
        $province = Db::name('Television')->where(['tv_type'=>'1'])->select();
        $this->assign(['list'=>$list,'count'=>$count,'province'=>$province]);
        $url =$_SERVER['REQUEST_URI'];
        Session::set('url',$url);
        return $this->fetch();
    }

    /**
     *@区县电视台
     */
    public function country(){
        $params = Request::instance()->param();
        $map["a.is_del"] =1;
        $map['a.tv_type'] = 3;
        empty($params['username']) ? true : $map['a.username|a.phone'] = ['like','%'.$params['username'].'%'];
        !empty($params['province'])     &&  $map['a.pid'] = $params['province'];
        if(empty($params["num"])){
            $num = 10;
        }
        $count = DB::name("Television")->alias('a')
            ->join('th_television b','a.pid = b.tv_id','left')
            ->where($map)->count();
        $list = DB::name("Television")->alias('a')
              ->field('a.*,b.username as pusername')
              ->join('th_television b','a.pid = b.tv_id','left')
              ->where($map)
              ->order("a.create_time desc")->paginate($num,false,["query"=>$params]);
        $province = Db::name('Television')->where(['tv_type'=>'2'])->select();
        $this->assign(['list'=>$list,'count'=>$count,'province'=>$province]);
        $url =$_SERVER['REQUEST_URI'];
        Session::set('url',$url);
        return $this->fetch();
    }

    /**
     * 已删除电视台
     */
    public function is_televison(){
        $params = Request::instance()->param();
        $map["is_del"] =2;
        empty($params['username']) ? true : $map['username|phone'] = ['like','%'.$params['username'].'%'];
        if(empty($params["num"])){
            $num = 10;
        }
        $count = DB::name("Television")->where($map)->count();
        $list = DB::name("Television")
            ->where($map)
            ->order("create_time desc")
            ->paginate($num,false,["query"=>$params]);
        $this->assign("count",$count);
        $this->assign("list",$list);
        $url =$_SERVER['REQUEST_URI'];
        Session::set('url',$url);
        return $this->fetch();
    }
    /**
     * @return mixed|void 添加省级电视台
     */
    public function add_province_television(){
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('Television');
            $result = $model->edit($data,'');
        }else{
            return $this->fetch();
        }
    }
    /**
     * 电视台编辑
     */
    public function edit_province_television(){
        $params = Request::instance()->param();
        $tv_id = $params['tv_id'];
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('Television');
            $result = $model->edit($data,'edit');
        }else{
            $res = DB::name("Television")->where(['tv_id'=>$tv_id])->find();
            $this->assign("re",$res);
            return $this->fetch('television/add_province_television');
        }
    }

    /**
     * @return mixed|void 添加省级电视台
     */
    public function add_city_television(){
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('Television');
            $result = $model->edit($data);
        }else{
            $tv = Db::name('television')->where(['tv_type'=>'1'])->select();
            $this->assign(['tv'=>$tv]);
            return $this->fetch();
        }
    }
    /**
     * 电视台编辑
     */
    public function edit_city_television(){
        $params = Request::instance()->param();
        $tv_id = $params["tv_id"];
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('Television');
            $result = $model->edit($data,'edit');
        }else{
            $res = DB::name("Television")->where(['tv_id'=>$tv_id])->find();
            $tv = Db::name('television')->where(['tv_type'=>'1'])->select();
            $this->assign(['tv'=>$tv,'re'=>$res]);
            return $this->fetch('television/add_city_television');
        }
    }

    /**
     * @return mixed|void 添加省级电视台
     */
    public function add_country_television(){
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('Television');
            $result = $model->edit($data);
        }else{
            $tv = Db::name('television')->where(['tv_type'=>['neq','3']])
                ->order('tv_type asc')->select();
            $this->assign(['tv'=>$tv]);
            return $this->fetch();
        }
    }
    /**
     * 电视台编辑
     */
    public function edit_country_television(){
        $params = Request::instance()->param();
        $tv_id = $params["tv_id"];
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('Television');
            $result = $model->edit($data,'edit');
        }else{
            $res = DB::name("Television")->where(['tv_id'=>$tv_id])->find();
            $tv = Db::name('television')->where(['tv_type'=>['neq','3']])
                ->order('tv_type asc')->select();
            $this->assign(['tv'=>$tv,'re'=>$res]);
            return $this->fetch('television/add_country_television');
        }
    }
    /**
     * 删除电视台
     */
    public function del_television(){
        $member_id = input("ids");
        empty($member_id) ? error('无法获取电视台信息') : true;
        $map["tv_id"]  = ["in",$member_id];
        $res = DB::name("Television")->where($map)->update(["is_del"=>2,"update_time"=>date("Y-m-d H:i:s")]);
        if($res){
            echo json_encode(['status'=>"ok",'info'=>'删除记录成功!','url'=>session('url')]);
        }else{
            echo json_encode(['status'=>"error",'info'=>'删除记录失败!']);
        }
    }
    /**
     * 恢复电视台
     */
    public function recovery_television(){
        $tv_id = input("ids");
        empty($tv_id) ? error('无法获取电视台信息') : true;
        $map["tv_id"]  = ["in",$tv_id];
        $res = DB::name("Television")->where($map)->update(["is_del"=>1,"update_time"=>date("Y-m-d H:i:s")]);
        if($res){
            echo json_encode(['status'=>"ok",'info'=>'电视台恢复成功!','url'=>session('url')]);
        }else{
            echo json_encode(['status'=>"error",'info'=>'电视台恢复失败!']);
        }
    }
    /**
     * 详情信息
     */
    public function television_view(){
        $params = Request::instance()->param();
        empty($params["tv_id"]) ? error("无法获电视台信息") : $tv_id = $params["tv_id"];
        $type = empty($params["type"]) ? 1 : $params["type"];
        $anthor["tv_id"] = $tv_id;
        $system = DB::name("system")->where(["id"=>1])->find();
        $withdraw_scale = $system["convert_scale4"]/$system["convert_scale3"];
        //基础信息
        $tv = DB::name("Television")
            ->where($anthor)
            ->find();
        $tv["case_money"] = $tv["e_ticket"]*$withdraw_scale;
        $tv["ticket_count"] = DB::name("television_earnings")->where($anthor)->sum("e_ticket");
        $this->assign(["view"=>$tv,"tv_id"=>$tv["tv_id"]]);
        if(empty($params["num"])){
            $num =10;
        }
        //扩展信息
        switch($type) {
            case 1:       //商家列表
                $map["a.tv_id"] = $tv_id;

                $count = DB::name("Merchants")
                    ->alias('a')
                    ->join('__MEMBER__ b', 'a.member_id = b.member_id')
                    ->where($map)
                    ->count();
                $this->assign("count", $count);
                $data = DB::name("Merchants")
                    ->alias("a")
                    ->field("a.merchants_id,a.merchants_name,a.merchants_img,a.contact_name,a.create_time,a.update_time,a.contact_mobile,a.member_id,b.phone,b.header_img,a.apply_state,a.pay_state,a.dashang_scale,a.sell_scale,a.company_name")
                    ->join('__MEMBER__ b', 'a.member_id = b.member_id')
                    ->where($map)
                    ->paginate($num, false);
                $this->assign(['list' => $data, 'count' => $count, 'tv_id' => $tv_id, 'type' => $type]);
                break;
            case 2://主播列表
                if (empty($num)) {
                    $num = 10;
                }
                $map["a.type"] = 2;
                $map["is_del"] = 1;
                $map["b.tv_id"] = $tv_id;
                if (empty($num)) {
                    $num = 10;
                }
                $count = DB::name("Member")->alias("a")->join('th_anchor_info b', 'a.member_id=b.anchor_id')->where($map)->count();
                $data = DB::name("Member")
                    ->alias("a")
                    ->join("th_anchor_info b", "a.member_id=b.anchor_id")
                    ->where($map)
                    ->paginate($num, false, ["query" => $params]);
                $this->assign(['list' => $data, 'count' => $count, 'tv_id' => $tv_id, 'type' => $type]);
                return $this->fetch();
                break;
            case 3:       //直播打赏记录
                $map['a.is_delete'] = 0;
                $map["b.type"] = 2;
                $num = input('num');
                if (empty($num)) {
                    $num = 10;
                }
                $count = DB::name("give_gift")
                    ->alias('a')
                    ->join("__MEMBER__ b", "a.user_id2 = b.member_id", "LEFT")
                    ->join("__GIFT__ c", "a.gift_id = c.gift_id")
                    ->join("__LIVE__ d", "a.live_id = d.live_id")
                    ->where(["a.tv_id" => $tv_id])
                    ->count();
                $data = DB::name("give_gift")
                    ->field("a.*,b.username,b.header_img,b.phone,c.*,d.title")
                    ->alias('a')
                    ->join("__MEMBER__ b", "a.user_id2 = b.member_id", "LEFT")
                    ->join("__GIFT__ c", "a.gift_id = c.gift_id", 'LEFT')
                    ->join("__LIVE__ d", "a.live_id = d.live_id")
                    ->where(["a.tv_id" => $tv_id])
                    ->order("a.intime desc")
                    ->paginate($num, false);
                //砖石打赏转化比
                $system = DB::name("system")->where(["id" => 1])->find();
                $change_scale = $change_scale = $system["convert_scale1"] / $system["convert_scale2"];
                $data->toArray();
                foreach ($data as $k => $v) {
                    $platform_scale = explode(',', $v["dashang_scale"])[0] / 100;
                    $anchor_scale = explode(",", $v["dashang_scale"])[1] / 100;
                    $scale = $v["price"] * $change_scale * $platform_scale * (1 - $anchor_scale);
                    $list = array();
                    $list = $v;
                    $list['amount'] = $scale;
                    $data->offsetSet($k, $list);
                }
                $this->assign(['list' => $data, 'count' => $count, 'tv_id' => $tv_id, 'type' => $type]);
                return $this->fetch();
            case 4:        //销售比例

                break;

        }
        $this->assign(["type"=>$type,''=>$params["member_id"]]);
        return $this->fetch();
    }

    //二维码
    public function qrcode_img(){
        $this->view->engine->layout(false);
        $tv_id = input('tv_id');
        $re = Db::name('television')->where(['tv_id'=>$tv_id])->find();
        $this->assign(['re'=>$re]);
        return $this->fetch();
    }

    /**
     *@省市区利益关系
     */
    public function relation(){
        $type = input('type');
        $username = input('username');
        empty($type) &&     $type = 1;
        $num = 10;
        switch ($type){
            case 1://区市省关系
                $map['a.is_del'] = '1';
                $map['a.tv_type'] = '3';
                !empty($username) && $map['a.username|b.username|c.username'] = ['like','%'.$username.'%'];
                $count = Db::name('Television')->alias('a')
                    ->join('th_television b','a.pid = b.tv_id','left')
                    ->join('th_television c','b.pid = c.tv_id','left')
                    ->where($map)->count();
                $list = Db::name('Television')->alias('a')
                    ->field('a.tv_id,a.username,a.dashang_scale,a.tv_sell_scale,b.tv_id as btv_id,b.username as busername,b.dashang_scale as bdashang_scale,b.tv_sell_scale as btv_sell_scale,b.pid,
            c.tv_id as ctv_id,c.username as cusername,c.dashang_scale as cdashang_scale,b.tv_type,c.tv_sell_scale as ctv_sell_scale,d.*')
                    ->join('th_television b','a.pid = b.tv_id','left')
                    ->join('th_television c','b.pid = c.tv_id','left')
                    ->join('th_television_relation d','a.tv_id = d.tv_id','left')
                    ->order("a.pid asc")->where($map)
                    ->paginate($num,false,["query"=>['username'=>$username,'type'=>$type]]);
                break;
            case 2://市省关系
                $map['b.is_del'] = '1';
                $map['b.tv_type'] = '2';
                !empty($username) && $map['b.username|c.username'] = ['like','%'.$username.'%'];
                $count = Db::name('Television')->alias('b')
                    ->join('th_television c','b.pid = c.tv_id','left')
                    ->where($map)->count();
                $list = Db::name('Television')->alias('b')
                    ->field('b.username as busername,b.dashang_scale as bdashang_scale,b.tv_sell_scale as btv_sell_scale,b.pid,
            c.tv_id as ctv_id,c.username as cusername,c.dashang_scale as cdashang_scale,c.tv_sell_scale as ctv_sell_scale,d.*')
                    ->join('th_television c','b.pid = c.tv_id','left')
                    ->join('th_television_relation d','b.tv_id = d.tv_id','left')
                    ->order("b.pid asc")->where($map)
                    ->paginate($num,false,["query"=>['username'=>$username,'type'=>$type]]);
                break;
            case 3://省
                $map['a.is_del'] = '1';
                $map['a.tv_type'] = '1';
                !empty($username) && $map['a.username'] = ['like','%'.$username.'%'];
                $count = Db::name('Television')->alias('a')
                    ->join('th_television_relation b','a.tv_id = b.tv_id','left')
                    ->where($map)->count();
                $list = Db::name('Television')->alias('a')
                    ->field('a.tv_id,a.username,b.*')
                    ->join('th_television_relation b','a.tv_id = b.tv_id','left')
                    ->where($map)
                    ->paginate($num,false,["query"=>['username'=>$username,'type'=>$type]]);
                break;
            default :
                $map['a.is_del'] = '1';
                $map['a.tv_type'] = '3';
                !empty($username) && $map['a.username|b.username|c.username'] = ['like','%'.$username.'%'];
                $count = Db::name('Television')->alias('a')
                    ->join('th_television b','a.pid = b.tv_id','left')
                    ->join('th_television c','b.pid = c.tv_id','left')
                    ->where($map)->count();
                $list = Db::name('Television')->alias('a')
                    ->field('a.tv_id,a.username,a.dashang_scale,a.tv_sell_scale,b.tv_id as btv_id,b.username as busername,b.tv_type,b.dashang_scale as bdashang_scale,b.tv_sell_scale as btv_sell_scale,b.pid,
            c.tv_id as ctv_id,c.username as cusername,c.dashang_scale as cdashang_scale,c.tv_sell_scale as ctv_sell_scale,a.*')
                    ->join('th_television b','a.pid = b.tv_id','left')
                    ->join('th_television c','b.pid = c.tv_id','left')
                    ->join('th_television_relation d','a.tv_id = d.tv_id','left')
                    ->order("a.pid asc")->where($map)
                    ->paginate($num,false,["query"=>['username'=>$username,'type'=>$type]]);
                break;
        }
        $this->assign(['list'=>$list,'count'=>$count,'type'=>$type]);
        return $this->fetch();
    }

    public function update_television_relation(){
        $tv_id = input('tv_id');
        $data['gift_ratio'] = input('gift_ratio');
        $data['city_tv_id'] = input('city_tv_id');
        $data['province_tv_id'] = input('province_tv_id');
        $data['shop_ratio'] = input('shop_ratio');
        $data['city_gift_ratio'] = input('city_gift_ratio');
        $data['city_shop_ratio'] = input('city_shop_ratio');
        $data['province_gift_ratio'] = input('province_gift_ratio');
        $data['province_shop_ratio'] = input('province_shop_ratio');
        if($data['gift_ratio']<0||$data['gift_ratio']>100||$data['city_gift_ratio']<0||$data['city_gift_ratio']>100|$data['province_gift_ratio']<0||$data['province_gift_ratio']>100){
            error('直播收益填写错误');
        }
        if($data['shop_ratio']<0||$data['shop_ratio']>100||$data['city_shop_ratio']<0||$data['city_shop_ratio']>100||$data['province_shop_ratio']<0||$data['province_shop_ratio']>100){
            error('商品收益填写错误');
        }
        if($data['gift_ratio']+$data['city_gift_ratio']+$data['province_gift_ratio']>100){
            error("直播收益比例超过满额100");
        }

        if($data['shop_ratio']+$data['city_shop_ratio']+$data['province_shop_ratio']>100){
            error("商品收益比例超过满额100");
        }

        $result = Db::name('television_relation')->where(['tv_id'=>$tv_id])->update($data);
        if($result !== false){
            Db::name('Television')->where(['tv_id'=>$tv_id])->update(['dashang_scale'=>$data['gift_ratio'],'sell_scale'=>$data['shop_ratio']]);
            success("数据保存成功");
        }else{
            error("数据更新失败");
        }

    }
}