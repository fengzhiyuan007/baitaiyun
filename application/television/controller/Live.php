<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/26
 * Time: 下午5:25
 */
namespace app\television\controller;
use Qiniu\QiniuPili;
use lib\Easemob;
use think\Controller;
use think\Db;
use think\Request;
use think\Session;
use lib\Page;
class Live extends Base {
    /**
     * @主播直播列表
     */
    public function live_list(){
        header("Content-type:text/html;charset=utf-8");
        $params = Request::instance()->param();
        if (!empty($params['username'])){
            $data['b.username|b.phone|a.title'] = ['like','%'.$params['username'].'%'];
            $this->assign('username',$params['username']);
        }
        if (!empty($params['live_status'])){
            $data['a.live_status'] = $params['live_status'];
            $this->assign('live_status',$params['live_status']);
        }
        if (!empty($params['start_time']) && empty($params['end_time'])){
            $start = strtotime($params['start_time']);
            $data['a.intime'] = ['gt',$start];
            $this->assign('start_time',$params['start_time']);
        }elseif(empty($params['start_time']) && !empty($params['end_time'])){
            $end = strtotime($params['end_time'])+(24*60*60-1);
            $data['a.intime'] = ['lt',$end];
            $this->assign('end_time',$params['end_time']);
        }elseif(!empty($params['start_time']) && !empty($params['end_time'])){
            $start = strtotime($params['start_time']);
            $end = strtotime($params['end_time'])+(24*60*60-1);
            $data['a.intime'] = ['between',[$start,$end]];
            $this->assign('start_time',$params['start_time']);  $this->assign('end_time',$params['end_time']);
        }
        //每页显示几条
        if (isset($_GET['nums'])){
            $num  = intval($_GET['nums']);
        }else {
            $num  = 10;
        }
        $data["b.type"] = 3;
        $domain= config('domain');
        $count = DB::name("live")->alias("a")
                ->join('__MEMBER__ b','a.user_id = b.member_id')
                ->where($data)->count();
        $list = DB::name("live")
                ->alias("a")
                ->field("live_id,a.play_img,a.live_status,a.title,a.intime,a.nums,a.watch_nums,b.header_img,b.username,a.lebel,b.sex,b.phone,header_img as img")
                ->join("__MEMBER__ b","a.user_id = b.member_id")
                ->order('a.intime desc')
                ->where($data)
                ->paginate($num,false,['query' => Request::instance()->param()]
                    );
        $page = $list->render();
        $this->assign('empty','<span class="empty">暂没有主播直播</span>');
        $this->assign(['list'=>$list,'page'=>$page,'count'=>$count]);
        $this->assign('count',$count);
        return view();
    }
    /**
     * @主播录播列表
     */
    public function record(){
        $params = Request::instance()->param();
        $data = [];
        if (!empty($params['username'])){
            $data['m.username|m.phone|b.title'] = ['like','%'.$params['username'].'%'];
            $this->assign('username',$params['username']);
        }
        if (!empty($params['start_time']) && empty($params['end_time'])){
            $start = strtotime($params['start_time']);
            $data['m.intime'] = ['gt',$start];
            $this->assign('start_time',$params['start_time']);
        }elseif(empty($params['start_time']) && !empty($params['end_time'])){
            $end = strtotime($params['end_time'])+(24*60*60-1);
            $data['m.intime'] = ['lt',$end];
            $this->assign('end_time',$params['end_time']);
        }elseif(!empty($params['start_time']) && !empty($params['end_time'])){
            $start = strtotime($params['start_time']);
            $end = strtotime($params['end_time'])+(24*60*60-1);
            $data['m.intime'] = ['between',[$start,$end]];
            $this->assign('start_time',$params['start_time']);  $this->assign('end_time',$params['end_time']);
        }
        //每页显示几条
        if (isset($params['nums'])){
            $nus  = intval($params['nums']);
        }else {
            $nus  = 10;
        }
        //$data["b.type"] = 3;
        $member =session::get("member");
        $data['a.tv_id'] = $member['member_id'];

        $this->assign("nus",$nus);
        $count = DB::name('anchor_info')->alias('a')
            ->join('__LIVE_STORE__ b', 'a.anchor_id=b.user_id')
            ->join('__MEMBER__ m', 'a.anchor_id=m.member_id')
            ->where($data)
            ->count();//一共有多少条记录


        $list =  DB::name('anchor_info')
            ->alias('a')
            //->field('a.anchor_id,b.username,b.header_img,b.sex,b.phone,b.ID,c.intime')
            ->field('b.*,m.username,m.header_img,m.sex,m.phone,m.ID,m.intime')
            ->join('__LIVE_STORE__ b', 'a.anchor_id=b.user_id')
            ->join('__MEMBER__ m', 'a.anchor_id=m.member_id')
            ->where($data)
            ->order('b.intime desc')
            ->paginate(10,false, ['query' => request()->param()]);
        $url =$_SERVER['REQUEST_URI'];
        session('url',$url);
        $this->assign('list',$list);
        $this->assign ( 'pagetitle', '录播列表' );
        $this->assign('count',$count);
        return view();
    }
    /**
     *@添加录播
     */
    public function add_play_record(){
        if(Request::instance()->isAjax()){
            $data = Request::instance()->post();
            $model = model('LiveStore');
            $result = $model->edit_record($data);
        }else{
            $member =session::get("member");
            $data['a.tv_id'] = $member['member_id'];
            $anchor =  DB::name('anchor_info')
                ->alias('a')
                //->field('a.anchor_id,b.username,b.header_img,b.sex,b.phone,b.ID,c.intime')
                ->field('m.member_id,m.username')
                ->join('__MEMBER__ m', 'a.anchor_id=m.member_id')
                ->where($data)
                ->select();
            $this->assign(['anchor'=>$anchor]);
            return $this->fetch();
        }
    }







    /**
     * @商户直播列表
     */
    public function merchants_live_list(){
        header("Content-type:text/html;charset=utf-8");
        $params = Request::instance()->param();
        if (!empty($params['username'])){
            $data['b.username|b.phone|a.title|c.merchants_name'] = ['like','%'.$params['username'].'%'];
            $this->assign('username',$params['username']);
        }
        if (!empty($params['live_status'])){
            $data['a.live_status'] = $params['live_status'];
            $this->assign('live_status',$params['live_status']);
        }
        if (!empty($params['start_time']) && empty($params['end_time'])){
            $start = strtotime($params['start_time']);
            $data['a.intime'] = ['gt',$start];
            $this->assign('start_time',$params['start_time']);
        }elseif(empty($params['start_time']) && !empty($params['end_time'])){
            $end = strtotime($params['end_time'])+(24*60*60-1);
            $data['a.intime'] = ['lt',$end];
            $this->assign('end_time',$params['end_time']);
        }elseif(!empty($params['start_time']) && !empty($params['end_time'])){
            $start = strtotime($params['start_time']);
            $end = strtotime($params['end_time'])+(24*60*60-1);
            $data['a.intime'] = ['between',[$start,$end]];
            $this->assign('start_time',$params['start_time']);  $this->assign('end_time',$params['end_time']);
        }
        //每页显示几条
        if (isset($_GET['nums'])){
            $num  = intval($_GET['nums']);
        }else {
            $num  = 10;
        }
        $domain= config('domain');
        $count = DB::name("live")->alias("a")
            ->join('__MEMBER__ b','a.user_id = b.member_id')
            ->join("__MERCHANTS__ c","a.user_id=c.member_id")
            ->where($data)->count();
        $list = DB::name("live")
            ->alias("a")
            ->field("c.merchants_name,a.live_id,a.play_img,a.live_status,a.title,a.intime,a.nums,a.watch_nums,b.header_img,b.username,a.lebel,b.sex,b.phone,header_img as img")
            ->join("__MEMBER__ b","a.user_id = b.member_id")
            ->join("__MERCHANTS__ c","a.user_id=c.member_id")
            ->order('a.intime desc')
            ->where($data)
            ->paginate($num,false,['query' => Request::instance()->param()]
            );
        $page = $list->render();
        $this->assign('empty','<span class="empty">暂没有没有商家直播</span>');
        $this->assign(['list'=>$list,'page'=>$page,'count'=>$count]);
        $this->assign('count',$count);
        return view();
    }
    /**
     * @商户录播列表
     */
    public function merchants_record(){
        $params = Request::instance()->param();
        $data = [];
        if (!empty($params['username'])){
            $data['b.username|c.title|d.merchants_name'] = ['like','%'.$params['username'].'%'];
            $this->assign('username',$params['username']);
        }
        if (!empty($params['start_time']) && empty($params['end_time'])){
            $start = strtotime($params['start_time']);
            $data['a.intime'] = ['gt',$start];
            $this->assign('start_time',$params['start_time']);
        }elseif(empty($params['start_time']) && !empty($params['end_time'])){
            $end = strtotime($params['end_time'])+(24*60*60-1);
            $data['a.intime'] = ['lt',$end];
            $this->assign('end_time',$params['end_time']);
        }elseif(!empty($params['start_time']) && !empty($params['end_time'])){
            $start = strtotime($params['start_time']);
            $end = strtotime($params['end_time'])+(24*60*60-1);
            $data['a.intime'] = ['between',[$start,$end]];
            $this->assign('start_time',$params['start_time']);  $this->assign('end_time',$params['end_time']);
        }
        //每页显示几条
        if (isset($params['nums'])){
            $nus  = intval($params['nums']);
        }else {
            $nus  = 10;
        }
        $this->assign("nus",$nus);
        $count = DB::name('Live_store')->alias('a')
            ->join('__MEMBER__ b', 'a.user_id=b.member_id')
            ->join('__LIVE__ c', 'a.live_id = c.live_id')
            ->join("__MERCHANTS__ d",'a.user_id = d.member_id')
            ->where($data)
            ->count();//一共有多少条记录
        $list =  DB::name('Live_store')
            ->alias('a')
            ->field('a.*,b.username,b.header_img,b.sex,b.phone,b.ID,c.intime,d.merchants_name')
            ->join('__MEMBER__ b','a.user_id=b.member_id')
            ->join('__LIVE__ c', 'a.live_id = c.live_id')
            ->join("__MERCHANTS__ d",'a.user_id = d.member_id')
            ->where($data)
            ->order('c.intime desc')
            ->paginate(10,false, ['query' => request()->param()]);
        $url =$_SERVER['REQUEST_URI'];
        session('url',$url);
        $this->assign('list',$list);
        $this->assign ( 'pagetitle', '录播列表' );
        $this->assign('count',$count);
        return view();
    }
    /**
     *@观看直播
     */
    public function play_live(){
        $id = input('id');
        $re = DB::name('live')->where(['live_id'=>$id])->find();
        $this->assign('re',$re);
        $this->view->engine->layout(false);
        return $this->fetch();
    }

    /**
     * 强制下线
     */
    public function offline(){
        $id = Request::instance()->param('id');
        $live = DB::name('Live')->where(['live_id'=>$id])->find();
        //直播间状态修改
        $l_rs = DB::name('Live')->where(['live_id'=>$id])->update(['live_status'=>2,'is_normal_exit'=>2,'end_time'=>time(),'is_offline'=>2,'uptime'=>time()]);
        //商户直播间状态修改
        $c_rs = DB::name("merchants")->where(['member_id'=>$live["user_id"]])->update(["live_id"=>0]);
        //获取七牛对象
        $qn = new QiniuPili();
        //强制下线(并且保存视频)
        $fname = $qn->save_vido($live["stream_key"]);
        $ext = [
            'forced_off'=>"1",
        ];
        $hx = new Easemob();
        $user = DB::name('member')->where(["member_id"=>$live["user_id"]])->find();
        $hx->sendText($user['hx_username'],$live['room_id'],"已被平台强制下线,如有问题,请联系平台!",$ext);   //给聊天室发消息
        echo $l_rs && $c_rs ? 1 : 2;
    }
    /**
     *@观看录播
     */
    public function play_record(){
        $id = input('id');
        $re = DB::name('LiveStore')->where(['live_store_id'=>$id])->find();
        $this->assign('re',$re);
        $this->view->engine->layout(false);
        return $this->fetch();
    }
    /**
     * @删除录播视频
     */
    public function del_live_store(){
        $id = input('ids');
        $result = DB::name('LiveStore')->where('live_store_id','in',$id)->delete();
        if($result){
            echo json_encode(array('status'=>'ok','info'=>'删除记录成功','url'=>session('url')));
        }else{
            echo json_encode(array('status'=>'error','info'=>'删除记录失败'));
        }
    }

    /**
     *@导购视频
     */
    public function video(){
        $map = array();
        !empty($_GET['username']) && $map['a.title|c.merchants_name|c.contact_name|c.contact_mobile'] = array("like","%".input('username')."%");
        if(!empty($_GET['start_time'])) $start_time = strtotime(input('start_time')); else $start_time = 0;
        if(!empty($_GET['end_time']))   $end_time = strtotime(input('end_time')); else $end_time = time();
        $map['a.intime'] = ['between',[$start_time,$end_time]];
        $map['a.is_del'] = 1;
        $num  = input('num');
        if (empty($num)){
            $num = 5;
        }
        $this->assign('nus',$num);
        $data= DB::name("Video")->alias('a')
            ->field("a.video_id,a.title,a.video_img,a.url,a.date,a.intime,a.is_shenhe,a.watch_nums,b.phone,b.username,c.merchants_name,c.merchants_img,c.contact_name,c.contact_mobile")
            ->join("__MERCHANTS__ c",'a.member_id = c.member_id',"LEFT")
            ->join("__MEMBER__ b","a.member_id = b.member_id",'LEFT')
            ->where($map)
            ->order('a.intime desc')
            ->paginate($num,false,["query"=>Request::instance()->param()]);
        $count = DB::name("Video")->alias('a')
            ->join("__MERCHANTS__ c",'a.member_id = c.member_id',"LEFT")
            ->join("__MEMBER__ b","a.member_id = b.member_id",'LEFT')
            ->where($map)
            ->count(); // 查询满足要求的总记录数;
        $page = $data->render();
        $this->assign(['list'=>$data,'count'=>$count,'page'=>$page]);
        $url =$_SERVER['REQUEST_URI'];
        session('url',$url);
        return $this->fetch();
    }

    /**
     *@修改审核状态
     */
    public function change_video_shenhe(){
        if(Request::instance()->isPost()){
            $id = input('id');
            $status = DB::name('Video')->where(['video_id'=>$id])->value('is_shenhe');
            $abs = 3 - $status;
            //$arr = ['默认状态','开启状态'];
            $result = DB::name('Video')->where(['video_id'=>$id])->update(['is_shenhe'=>$abs]);
            if($result){
                echo json_encode(array('status'=>'ok','info'=>$abs));
                exit;
            }else{
                echo json_encode(array('status'=>'error','info'=>'切换状态失败'));
                exit;
            }
        }
    }
    /**
     *@删除视频
     */
    public function del_video(){
        $id = input('ids');
        $data['video_id'] = ['in',$id];
        $user = DB::name('Video')->where($data)->update(['is_del'=>2]);
        if($user){
            echo json_encode(['status'=>"ok",'info'=>'删除记录成功!','url'=>session('url')]);
        }else{
            echo json_encode(['status'=>"error",'info'=>'删除记录失败!']);
        }
    }

    /**
     * @return mixed
     */
    public function add_video(){
        if(Request::instance()->isAjax()){
            $data = Request::instance()->post();
            $model = model('Video');
            $result = $model->edit($data);
        }else{
            $merchants = DB::name("merchants")->field('member_id,merchants_id,merchants_name')->where(['is_delete'=>0,'apply_state'=>2])->select();
            $this->assign(['merchants'=>$merchants]);
            return $this->fetch();
        }
    }

    /**
     * @return mixed
     */
    public function edit_video(){
        if(Request::instance()->isAjax()){
            $data = Request::instance()->post();
            $model = model('Video');
            $result = $model->edit($data);
        }else{
            $id = input('id');
            $re = Db::name('video')->where(['video_id'=>$id])->find();
            $this->assign(['re'=>$re]);
            $this->assign(['merchants'=>0]);
            return $this->fetch('live/add_video');
        }
    }
}