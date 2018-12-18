<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/26
 * Time: 下午5:25
 */

namespace app\admin\controller;
use think\Db;
use think\Request;
use think\Session;
use lib\Page;
class Home extends Base
{
    /**
     *顶部轮播
     */
    public function index(){
        $count = Db::name('Banner')->where(['is_del'=>'1'])->count();

        $num= input('num'); // 获取分页显示数
        $num ? $num : $num = 10;
        $params = Request::instance()->param();
        $list = Db::name('Banner')->where(['is_del'=>'1'])
                ->order('b_intime desc')->paginate($num,false,["query"=>$params]);
        $page = $list->render($count);
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page]);
        $url =$_SERVER['REQUEST_URI'];
        Session::set('url',$url);
        return $this->fetch();
    }

    /**
     *添加顶部轮播
     */
    public function add_carousel(){
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('Banner');
            $result = $model->edit_banner($data);
        }else{
            $merchants = Db::name('merchants')->alias('a')
                ->join('th_member b','a.member_id = b.member_id')
                ->where(['a.is_delete'=>'0','a.apply_state'=>'2','b.is_del'=>'1'])->select();
            $goods = Db::name('goods')->where(['is_delete'=>'0','goods_state'=>'1','is_review'=>'1'])->select();
            $this->assign(['merchants'=>$merchants,'goods'=>$goods]);
            return $this->fetch();
        }
    }

    /**
     *编辑顶部轮播
     */
    public function edit_carousel(){
        $banner_id = input('id');
        if(request()->isAjax()){
            $data = Request::instance()->post();
            $model = model('Banner');
            $result = $model->edit_banner($data);
        }else{
            $re = Db::name('Banner')->where(['b_id'=>$banner_id])->find();
            $merchants = Db::name('merchants')->alias('a')
                ->join('th_member b','a.member_id = b.member_id')
                ->where(['a.is_delete'=>'0','a.apply_state'=>'2','b.is_del'=>'1'])->select();
            $goods = Db::name('goods')->where(['is_delete'=>'0','goods_state'=>'1','is_review'=>'1'])->select();
            $this->assign(['merchants'=>$merchants,'goods'=>$goods]);
            if($re['b_type'] == 3){
                $class = Db::name('goods_class')->where(['class_uuid'=>$re['jump']])->find();
            }
            $this->assign(['re'=>$re,'class'=>$class]);
            return $this->fetch('home/add_carousel');
        }
    }

    /**
     *删除carousel
     */
    public function del_carousel(){
        if(request()->isAjax()) {
            $id = input('ids');
            if(empty($id))      return error('删除记录失败!');
            $model = model('Banner');
            $result = $model->del($id);
            if ($result) {
                return success([ 'info' => '删除记录成功!', 'url' => session('url')]);
            } else {
                return error('删除记录失败!');
            }
        }
    }

    /**
     *@修改Banner推荐状态
     */
    public function change_banner_status(){
        if(request()->isAjax()){
            $id = input('id');
            if(empty($id))      return error('切换状态失败!');
            $model = model('Banner');
            $result = $model->change_status($id);
            if($result){
                return success(array('status'=>'ok','info'=>$result));
            }else{
                return error('切换状态失败');
            }
        }
    }

    /**
     *首页管理
     */
    public function dress(){
        $map['pid'] = -1;
        $map['is_delete'] = 0;
        $count = Db::name('Dress')->where($map)->count();

        $num= input('num'); // 获取分页显示数
        $num ? $num : $num = 10;
        $list = Db::name('Dress')->where($map)
            ->order('sort asc')->paginate($num,false);
        $page = $list->render($count);
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page]);
        $url =$_SERVER['REQUEST_URI'];
        Session::set('url',$url);
        return $this->fetch();
    }

    /**
     *添加首页模块
     */
    public function add_dress(){
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('Dress');
            $result = $model->edit($data);
        }else{
            $merchants = Db::name('merchants')->alias('a')
                ->join('th_member b','a.member_id = b.member_id')
                ->where(['a.is_delete'=>'0','a.apply_state'=>'2','b.is_del'=>'1'])->select();
            $goods = Db::name('goods')->where(['is_delete'=>'0','goods_state'=>'1','is_review'=>'1'])->select();
            $this->assign(['merchants'=>$merchants,'goods'=>$goods]);
            return $this->fetch();
        }
    }

    /**
     *编辑首页模块
     */
    public function edit_dress(){
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('Dress');
            $result = $model->edit($data);
        }else{
            $dress_id = input('id');
            $re = Db::name('dress')->where(['dress_id'=>$dress_id])->find();
            $merchants = Db::name('merchants')->alias('a')
                ->join('th_member b','a.member_id = b.member_id')
                ->where(['a.is_delete'=>'0','a.apply_state'=>'2','b.is_del'=>'1'])->select();
            $goods = Db::name('goods')->where(['is_delete'=>'0','goods_state'=>'1','is_review'=>'1'])->select();
            $this->assign(['merchants'=>$merchants,'goods'=>$goods]);
            if($re['type'] == 3){
                $class = Db::name('goods_class')->where(['class_uuid'=>$re['jump']])->find();
            }
            $this->assign(['re'=>$re,'class'=>$class]);
            return $this->fetch('home/add_dress');
        }
    }

    /**
     *@修改Banner推荐状态
     */
    public function change_dress_status(){
        if(request()->isAjax()){
            $id = input('id');
            if(empty($id))      return error('切换状态失败!');
            $model = model('Dress');
            $result = $model->change_status($id);
            if($result){
                return success(array('status'=>'ok','info'=>$result));
            }else{
                return error('切换状态失败');
            }
        }
    }

    /**
     *@上移排序
     */
    public function plus_dress_sort(){
        if(Request::instance()->isAjax()){
            $id = input('id');
            $check = Db::name('dress')->where(['dress_id'=>$id])->find();
            $map['sort'] = ['lt',$check['sort']];
            $map['is_delete'] = '0';
            $pid = input('pid');
            $pid ?  $map['pid'] = $pid : $map['pid'] = -1;
            $last = Db::name('dress')->where($map)
                ->order("sort desc")->limit(1)->select();
            if(empty($last)){
                error('不能移动');
            }else{
                $sort = $last[0]['sort'];
                $result = Db::name('dress')->where(['dress_id'=>$id])->update(['sort'=>$sort]);
                Db::name('dress')->where(['dress_id'=>$last[0]['dress_id']])->update(['sort'=>$check['sort']]);
            }
            if($result){
                success('操作成功');
            }else{
                error('操作失败');
            }
        }
    }

    /**
     *@下移排序
     */
    public function minus_dress_sort(){
        if(Request::instance()->isAjax()){
            $id = input('id');
            $pid = input('pid');
            $check = Db::name('dress')->where(['dress_id'=>$id])->find();
            $map['sort'] = ['gt',$check['sort']];
            $map['is_delete'] = '0';
            $pid ?  $map['pid'] = $pid : $map['pid'] = -1;
            $last = Db::name('dress')->where($map)
                ->order("sort asc")->limit(1)->select();
            if(empty($last)){
                error('不能移动');
            }else{
                $sort = $last[0]['sort'];
                $result = Db::name('dress')->where(['dress_id'=>$id])->update(['sort'=>$sort]);
                Db::name('dress')->where(['dress_id'=>$last[0]['dress_id']])->update(['sort'=>$check['sort']]);
            }
            if($result){
                success('操作成功');
            }else{
                error('操作失败');
            }
        }
    }

    /**
     *分类
     */
    public function getClass(){
        $parent = Db::name('goods_class')->where(['parent_id'=>'-1','is_delete'=>'0','class_state'=>1])->select();
        foreach ($parent as &$v){
            $v['seed'] = Db::name('goods_class')->where(['parent_id'=>$v['class_id'],'is_delete'=>'0','class_state'=>1])->select();
        }

        success($parent);
    }

    //下级商品
    public function seed_dress(){
        $id = input('id');
        $map['pid'] = $id;
        $map['is_delete'] = 0;
        $dress = Db::name('dress')->where(['dress_id'=>$id])->find();
        $count = Db::name('Dress')->where($map)->count();

        $num= input('num'); // 获取分页显示数
        $num ? $num : $num = 10;
        $list = Db::name('Dress')->where($map)
            ->order('sort asc')->paginate($num,false);
        $page = $list->render($count);
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page,'dress'=>$dress]);
        $url =$_SERVER['REQUEST_URI'];
        Session::set('url',$url);
        return $this->fetch();
    }

    /**
     *添加首页模块
     */
    public function add_dress_nature(){
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('Dress');
            $result = $model->edit_nature($data);
        }else{
            $merchants = Db::name('merchants')->alias('a')
                ->join('th_member b','a.member_id = b.member_id')
                ->where(['a.is_delete'=>'0','a.apply_state'=>'2','b.is_del'=>'1'])->select();
            $goods = Db::name('goods')->where(['is_delete'=>'0','goods_state'=>'1','is_review'=>'1'])->select();

            $this->assign(['merchants'=>$merchants,'goods'=>$goods]);
            return $this->fetch();
        }
    }

    /**
     *添加首页模块
     */
    public function edit_dress_nature(){
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('Dress');
            $result = $model->edit_nature($data);
        }else{
            $dress_id = input('id');
            $re = Db::name('dress')->where(['dress_id'=>$dress_id])->find();
            $merchants = Db::name('merchants')->alias('a')
                ->join('th_member b','a.member_id = b.member_id')
                ->where(['a.is_delete'=>'0','a.apply_state'=>'2','b.is_del'=>'1'])->select();
            $goods = Db::name('goods')->where(['is_delete'=>'0','goods_state'=>'1','is_review'=>'1'])->select();
            $this->assign(['merchants'=>$merchants,'goods'=>$goods]);
            if($re['type'] == 3){
                $class = Db::name('goods_class')->where(['class_uuid'=>$re['jump']])->find();
            }
            $this->assign(['re'=>$re,'class'=>$class]);
            return $this->fetch('home/add_dress_nature');
        }
    }

    /**
     *删除dress
     */
    public function del_dress(){
        if(request()->isAjax()) {
            $id = input('ids');
            if(empty($id))      return error('删除记录失败!');
            $model = model('dress');
            $result = $model->soft_del($id);
            if ($result) {
                return success([ 'info' => '删除记录成功!', 'url' => session('url')]);
            } else {
                return error('删除记录失败!');
            }
        }
    }

    /**
     *首页管理
     */
    public function dress_pc(){
        $map['pid'] = -1;
        $map['is_delete'] = 0;
        $count = Db::name('DressPc')->where($map)->count();

        $num= input('num'); // 获取分页显示数
        $num ? $num : $num = 10;
        $list = Db::name('DressPc')->where($map)
            ->order('sort asc')->paginate($num,false);
        $page = $list->render($count);
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page]);
        $url =$_SERVER['REQUEST_URI'];
        Session::set('url',$url);
        return $this->fetch();
    }

    /**
     *添加首页模块
     */
    public function add_dress_pc(){
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('DressPc');
            $result = $model->edit($data);
        }else{
            $merchants = Db::name('merchants')->alias('a')
                ->join('th_member b','a.member_id = b.member_id')
                ->where(['a.is_delete'=>'0','a.apply_state'=>'2','b.is_del'=>'1'])->select();
            $goods = Db::name('goods')->where(['is_delete'=>'0','goods_state'=>'1','is_review'=>'1'])->select();
            $this->assign(['merchants'=>$merchants,'goods'=>$goods]);
            return $this->fetch();
        }
    }

    /**
     *编辑首页模块
     */
    public function edit_dress_pc(){
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('DressPc');
            $result = $model->edit($data);
        }else{
            $dress_id = input('id');
            $re = Db::name('dress_pc')->where(['dress_id'=>$dress_id])->find();
            $merchants = Db::name('merchants')->alias('a')
                ->join('th_member b','a.member_id = b.member_id')
                ->where(['a.is_delete'=>'0','a.apply_state'=>'2','b.is_del'=>'1'])->select();
            $goods = Db::name('goods')->where(['is_delete'=>'0','goods_state'=>'1','is_review'=>'1'])->select();
            $this->assign(['merchants'=>$merchants,'goods'=>$goods]);
            if($re['type'] == 3){
                $class = Db::name('goods_class')->where(['class_uuid'=>$re['jump']])->find();
            }
            $this->assign(['re'=>$re,'class'=>$class]);
            return $this->fetch('home/add_dress_pc');
        }
    }

    /**
     *@修改Banner推荐状态
     */
    public function change_dress_pc_status(){
        if(request()->isAjax()){
            $id = input('id');
            if(empty($id))      return error('切换状态失败!');
            $model = model('DressPc');
            $result = $model->change_status($id);
            if($result){
                return success(array('status'=>'ok','info'=>$result));
            }else{
                return error('切换状态失败');
            }
        }
    }

    /**
     *@上移排序
     */
    public function plus_dress_pc_sort(){
        if(Request::instance()->isAjax()){
            $id = input('id');
            $check = Db::name('dress_pc')->where(['dress_id'=>$id])->find();
            $map['sort'] = ['lt',$check['sort']];
            $map['is_delete'] = '0';
            $pid = input('pid');
            $pid ?  $map['pid'] = $pid : $map['pid'] = -1;
            $last = Db::name('dress_pc')->where($map)
                ->order("sort desc")->limit(1)->select();
            if(empty($last)){
                error('不能移动');
            }else{
                $sort = $last[0]['sort'];
                $result = Db::name('dress_pc')->where(['dress_id'=>$id])->update(['sort'=>$sort]);
                Db::name('dress_pc')->where(['dress_id'=>$last[0]['dress_id']])->update(['sort'=>$check['sort']]);
            }
            if($result){
                success('操作成功');
            }else{
                error('操作失败');
            }
        }
    }

    /**
     *@下移排序
     */
    public function minus_dress_pc_sort(){
        if(Request::instance()->isAjax()){
            $id = input('id');
            $pid = input('pid');
            $check = Db::name('dress_pc')->where(['dress_id'=>$id])->find();
            $map['sort'] = ['gt',$check['sort']];
            $map['is_delete'] = '0';
            $pid ?  $map['pid'] = $pid : $map['pid'] = -1;
            $last = Db::name('dress_pc')->where($map)
                ->order("sort asc")->limit(1)->select();
            if(empty($last)){
                error('不能移动');
            }else{
                $sort = $last[0]['sort'];
                $result = Db::name('dress_pc')->where(['dress_id'=>$id])->update(['sort'=>$sort]);
                Db::name('dress_pc')->where(['dress_id'=>$last[0]['dress_id']])->update(['sort'=>$check['sort']]);
            }
            if($result){
                success('操作成功');
            }else{
                error('操作失败');
            }
        }
    }


    //下级商品
    public function seed_dress_pc(){
        $id = input('id');
        $map['pid'] = $id;
        $map['is_delete'] = 0;
        $dress = Db::name('dress_pc')->where(['dress_id'=>$id])->find();
        $count = Db::name('Dress_pc')->where($map)->count();

        $num= input('num'); // 获取分页显示数
        $num ? $num : $num = 10;
        $list = Db::name('DressPc')->where($map)
            ->order('sort asc')->paginate($num,false);
        $page = $list->render($count);
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page,'dress'=>$dress]);
        $url =$_SERVER['REQUEST_URI'];
        Session::set('url',$url);
        return $this->fetch();
    }

    /**
     *添加首页模块
     */
    public function add_dress_pc_nature(){
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('DressPc');
            $result = $model->edit_nature($data);
        }else{
            $merchants = Db::name('merchants')->alias('a')
                ->join('th_member b','a.member_id = b.member_id')
                ->where(['a.is_delete'=>'0','a.apply_state'=>'2','b.is_del'=>'1'])->select();
            $goods = Db::name('goods')->where(['is_delete'=>'0','goods_state'=>'1','is_review'=>'1'])->select();

            $this->assign(['merchants'=>$merchants,'goods'=>$goods]);
            return $this->fetch();
        }
    }

    /**
     *添加首页模块
     */
    public function edit_dress_pc_nature(){
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('DressPc');
            $result = $model->edit_nature($data);
        }else{
            $dress_id = input('id');
            $re = Db::name('dress_pc')->where(['dress_id'=>$dress_id])->find();
            $merchants = Db::name('merchants')->alias('a')
                ->join('th_member b','a.member_id = b.member_id')
                ->where(['a.is_delete'=>'0','a.apply_state'=>'2','b.is_del'=>'1'])->select();
            $goods = Db::name('goods')->where(['is_delete'=>'0','goods_state'=>'1','is_review'=>'1'])->select();
            $this->assign(['merchants'=>$merchants,'goods'=>$goods]);
            if($re['type'] == 3){
                $class = Db::name('goods_class')->where(['class_uuid'=>$re['jump']])->find();
            }
            $this->assign(['re'=>$re,'class'=>$class]);
            return $this->fetch('home/add_dress_pc_nature');
        }
    }

    /**
     *删除dress
     */
    public function del_dress_pc(){
        if(request()->isAjax()) {
            $id = input('ids');
            if(empty($id))      return error('删除记录失败!');
            $model = model('DressPc');
            $result = $model->soft_del($id);
            if ($result) {
                return success([ 'info' => '删除记录成功!', 'url' => session('url')]);
            } else {
                return error('删除记录失败!');
            }
        }
    }


    /**
     *搜索商家
     */
    public function searchMerchant(){
        $name = input('name');
        $name && $map['merchants_name'] = ['like','%'.$name.'%'];
        $map['is_delete'] = '0';
        $map['apply_state'] = '2';
        $merchants = Db::name('merchants')->where($map)->select();
        $type_list="<option value=''>请选择商家店铺</option>";
        if($merchants){
            foreach ($merchants as $v){
                $type_list.='<option value='.$v['member_id'].'>'.$v['merchants_name'].'</option>';
            }
        }
        echo $type_list;
    }

    /**
     *搜索商家
     */
    public function searchGoods(){
        $name = input('name');
        $name && $map['goods_name|goods_uuid|code'] = ['like','%'.$name.'%'];
        $map['is_delete'] = '0';
        $map['goods_state'] = '2';
        $map['is_review'] = '1';
        $goods = Db::name('goods')->where(['is_delete'=>'0','goods_state'=>'1','is_review'=>'1'])->select();
        $type_list="<option value=''>请选择商品</option>";
        if($goods){
            foreach ($goods as $v){
                $type_list.='<option value='.$v['goods_id'].'>'.$v['goods_name'].'</option>';
            }
        }
        echo $type_list;
    }

    /**
     *@ Web图文
     */
    public function text(){
        $map = array();
        $title = input('title');
        !empty($title)  &&  $map['title'] = ['like','%'.$title.'%'];
        $map['is_delete'] = 0;
        $num = input('num');
        if (empty($num)){
            $num = 10;
        }
        $count = DB::name('text')->where($map)->count();
        $list  = DB::name('text')->where($map)
            ->paginate($num,false,["query"=>['title'=>$title]]);
        $this->assign("list",$list);
        $this->assign('count',$count);
        $url =$_SERVER['REQUEST_URI'];
        session('url',$url);
        return $this->fetch();
    }

    public function insert_text(){
        if(Request::instance()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('Text');
            $result = $model->edit($data);
        }else{
            return $this->fetch();
        }
    }

    public function edit_text(){
        if(Request::instance()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('Text');
            $result = $model->edit($data);
        }else{
            $id = input('id');
            $re = Db::name('text')->where(['text_id'=>$id])->find();
            $this->assign(['re'=>$re]);
            return $this->fetch('home/insert_text');
        }
    }

    public function home_class(){
        $map['is_delete'] = 0;
        $count = Db::name('home_class')->where($map)->count();

        $num= input('num'); // 获取分页显示数
        $num ? $num : $num = 10;
        $list = Db::name('home_class')->where($map)
            ->order('sort asc')->paginate($num,false);
        $page = $list->render($count);
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page]);
        $url =$_SERVER['REQUEST_URI'];
        Session::set('url',$url);
        return $this->fetch();
    }

    /**
     *添加首页模块
     */
    public function add_home_class(){
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('HomeClass');
            $result = $model->edit($data);
        }else{
            return $this->fetch();
        }
    }

    /**
     *添加首页模块
     */
    public function edit_home_class(){
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('HomeClass');
            $result = $model->edit($data);
        }else{
            $id = input('id');
            $re = Db::name('HomeClass')->where(['id'=>$id])->find();
            if($re['type'] == 3){
                $class = Db::name('goods_class')->where(['class_uuid'=>$re['jump']])->find();
            }
            $this->assign(['re'=>$re,'class'=>$class]);
            return $this->fetch('home/add_home_class');
        }
    }

    /**
     *@修改Banner推荐状态
     */
    public function change_class_status(){
        if(request()->isAjax()){
            $id = input('id');
            if(empty($id))      return error('切换状态失败!');
            $model = model('HomeClass');
            $result = $model->change_status($id);
            if($result){
                return success(array('status'=>'ok','info'=>$result));
            }else{
                return error('切换状态失败');
            }
        }
    }

    /**
     *@上移排序
     */
    public function plus_class_sort(){
        if(Request::instance()->isAjax()){
            $id = input('id');
            $check = Db::name('home_class')->where(['id'=>$id])->find();
            $map['sort'] = ['lt',$check['sort']];
            $map['is_delete'] = '0';
            $last = Db::name('home_class')->where($map)
                ->order("sort desc")->limit(1)->select();
            if(empty($last)){
                error('不能移动');
            }else{
                $sort = $last[0]['sort'];
                $result = Db::name('home_class')->where(['id'=>$id])->update(['sort'=>$sort]);
                Db::name('home_class')->where(['id'=>$last[0]['id']])->update(['sort'=>$check['sort']]);
            }
            if($result){
                success('操作成功');
            }else{
                error('操作失败');
            }
        }
    }

    /**
     *@下移排序
     */
    public function minus_class_sort(){
        if(Request::instance()->isAjax()){
            $id = input('id');
            $check = Db::name('home_class')->where(['id'=>$id])->find();
            $map['sort'] = ['gt',$check['sort']];
            $map['is_delete'] = '0';
            $last = Db::name('home_class')->where($map)
                ->order("sort asc")->limit(1)->select();
            if(empty($last)){
                error('不能移动');
            }else{
                $sort = $last[0]['sort'];
                $result = Db::name('home_class')->where(['id'=>$id])->update(['sort'=>$sort]);
                Db::name('home_class')->where(['id'=>$last[0]['id']])->update(['sort'=>$check['sort']]);
            }
            if($result){
                success('操作成功');
            }else{
                error('操作失败');
            }
        }
    }

    public function del_home_class(){
        if(request()->isAjax()) {
            $id = input('ids');
            if(empty($id))      return error('删除记录失败!');
            $model = model('HomeClass');
            $result = $model->soft_del($id);
            if ($result) {
                return success([ 'info' => '删除记录成功!', 'url' => session('url')]);
            } else {
                return error('删除记录失败!');
            }
        }
    }

    public function home_class_pc(){
        $map['is_delete'] = 0;
        $count = Db::name('home_class_pc')->where($map)->count();

        $num= input('num'); // 获取分页显示数
        $num ? $num : $num = 10;
        $list = Db::name('home_class_pc')->where($map)
            ->order('sort asc')->paginate($num,false);
        $page = $list->render($count);
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page]);
        $url =$_SERVER['REQUEST_URI'];
        Session::set('url',$url);
        return $this->fetch();
    }

    /**
     *添加首页模块
     */
    public function add_home_class_pc(){
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('HomeClassPc');
            $result = $model->edit($data);
        }else{
            return $this->fetch();
        }
    }

    /**
     *添加首页模块
     */
    public function edit_home_class_pc(){
        if(request()->isAjax()) {
            $data = Request::instance()->post();
            $model = model('HomeClassPc');
            $result = $model->edit($data);
        }else{
            $id = input('id');
            $re = Db::name('HomeClassPc')->where(['id'=>$id])->find();
            if($re['type'] == 3){
                $class = Db::name('goods_class')->where(['class_uuid'=>$re['jump']])->find();
            }
            $this->assign(['re'=>$re,'class'=>$class]);
            return $this->fetch('home/add_home_class_pc');
        }
    }

    /**
     *@修改Banner推荐状态
     */
    public function change_class_pc_status(){
        if(request()->isAjax()){
            $id = input('id');
            if(empty($id))      return error('切换状态失败!');
            $model = model('HomeClassPc');
            $result = $model->change_status($id);
            if($result){
                return success(array('status'=>'ok','info'=>$result));
            }else{
                return error('切换状态失败');
            }
        }
    }

    /**
     *@上移排序
     */
    public function plus_class_pc_sort(){
        if(Request::instance()->isAjax()){
            $id = input('id');
            $check = Db::name('home_class_pc')->where(['id'=>$id])->find();
            $map['sort'] = ['lt',$check['sort']];
            $map['is_delete'] = '0';
            $last = Db::name('home_class_pc')->where($map)
                ->order("sort desc")->limit(1)->select();
            if(empty($last)){
                error('不能移动');
            }else{
                $sort = $last[0]['sort'];
                $result = Db::name('home_class_pc')->where(['id'=>$id])->update(['sort'=>$sort]);
                Db::name('home_class_pc')->where(['id'=>$last[0]['id']])->update(['sort'=>$check['sort']]);
            }
            if($result){
                success('操作成功');
            }else{
                error('操作失败');
            }
        }
    }

    /**
     *@下移排序
     */
    public function minus_class_pc_sort(){
        if(Request::instance()->isAjax()){
            $id = input('id');
            $check = Db::name('home_class_pc')->where(['id'=>$id])->find();
            $map['sort'] = ['gt',$check['sort']];
            $map['is_delete'] = '0';
            $last = Db::name('home_class_pc')->where($map)
                ->order("sort asc")->limit(1)->select();
            if(empty($last)){
                error('不能移动');
            }else{
                $sort = $last[0]['sort'];
                $result = Db::name('home_class_pc')->where(['id'=>$id])->update(['sort'=>$sort]);
                Db::name('home_class_pc')->where(['id'=>$last[0]['id']])->update(['sort'=>$check['sort']]);
            }
            if($result){
                success('操作成功');
            }else{
                error('操作失败');
            }
        }
    }

    public function del_home_pc_class(){
        if(request()->isAjax()) {
            $id = input('ids');
            if(empty($id))      return error('删除记录失败!');
            $model = model('HomeClassPc');
            $result = $model->soft_del($id);
            if ($result) {
                return success([ 'info' => '删除记录成功!', 'url' => session('url')]);
            } else {
                return error('删除记录失败!');
            }
        }
    }
    /**
     *删除text
     */
    public function del_text(){
        if(request()->isAjax()) {
            $id = input('ids');
            if(empty($id))      return error('删除记录失败!');
            $model = model('text');
            $result = $model->soft_del($id);
            if ($result) {
                return success([ 'info' => '删除记录成功!', 'url' => session('url')]);
            } else {
                return error('删除记录失败!');
            }
        }
    }

    /**
     *@相关协议
     */
    public function xieyi(){
        $map = array();
        $map['type'] = 1;
        $map['is_del'] = 1;
        $num = input('num');
        if (empty($num)){
            $num = 10;
        }
        $count = DB::name('Notice')->where($map)->count();
        $list  = DB::name('Notice')->where($map)
            ->order("is_top asc")
            ->paginate($num,false);
        $this->assign("list",$list);
        $this->assign('count',$count);
        $url =$_SERVER['REQUEST_URI'];
        session('url',$url);
        return $this->fetch();
    }

    public function state_xieyi()
    {
        if(Request::instance()->isAjax()){
            $id = input('id');
            $status = Db::name('Notice')->where(['id'=>$id])->value('state');
            $abs = 1 - $status;
            $arr = ['1','2'];
            $result = Db::name('Notice')->where(['id'=>$id])->update(['state'=>$abs]);
            if($result){
                success($arr[1-$status]);
            }else{
                error('切换状态失败');
            }
        }
    }
    /**
     *@编辑协议
     */
    public function edit_xieyi(){
        $id = input('id');
        if(Request::instance()->isPost()){
            $data = [
                'title' => input('title'),
                'content' => input('content'),
                'id' => input('id'),
                'summary'=>input('summary')
            ];
            if(empty($data['title'])){
                error('协议标题不能为空');
                die;
            }
            if(empty($data['content'])){
                error('协议内容不能为空');
                die;
            }
            $data['uptime'] = date("Y-m-d H:i:s",time());
            $result = DB::name('Notice')->where(['id'=>$id])->update($data);
            if($result){
                success(['info'=>'编辑协议成功','url'=>session('url')]);
            }else{
                error('编辑协议失败');
            }
        }else{

            $re = DB::name('Notice')->where(['id'=>$id,'type'=>'1'])->find();
            $this->assign(['re'=>$re]);
            return $this->fetch();
        }
    }

    /**
     *关于我们
     */
    public function about_us(){
        $re = DB::name('Aboutus')->where(['id'=>1])->find();
        if(Request::instance()->isPost()){
            $data = Request::instance()->post();
            $model = model('Aboutus');
            $result = $model->edit($data);
            if($result){
                success(['info'=>'保存成功']);
            }else{
                error("保存失败");
            }
        }else{
            $this->assign(['re'=>$re]);
            return $this->fetch();
        }
    }

    /**
     *广告位管理
     */
    public function advert(){
        $count = Db::name('Advert')->where(['is_del'=>'1'])->count();

        $num= input('num'); // 获取分页显示数
        $num ? $num : $num = 10;
        $list = Db::name('Advert')->where(['is_del'=>'1'])
            ->order('b_intime desc')->paginate($num,false);
        $page = $list->render($count);
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page]);
        $url =$_SERVER['REQUEST_URI'];
        Session::set('url',$url);
        return $this->fetch();
    }

    /**
     *添加广告位
     */
    public function add_advert(){
        if(IS_POST) {
            echo json_encode(D('Banner')->auth());
        }else{
            $this->display();
        }
    }

    /**
     *编辑广告位
     */
    public function edit_advert(){
        $banner_id = I('id');
        if(IS_POST){
            echo json_encode(D('Banner')->auth());
        }else{
            $banner = M('Banner')->where(['banner_id'=>$banner_id])->find();
            $this->assign(['banner'=>$banner]);
            $this->display('Home/add_advert');
        }
    }

    /**
     *公告信息
     */
    public function notice(){
        $map=[];
        $title = input('title');
        $state = input('state');
        !empty($title) && $map['title'] = ['like','%'.$title.'%'];
        !empty($state) && $map['state'] = $state;
        $map['is_delete'] = '0';
        $num  = input('num');
        if (empty($num)){
            $num = 10;
        }
        $this->assign('nus',$num);
        $count = Db::name('system_notice')->where($map)->count();
        $list = Db::name('system_notice')->where($map)
              ->order("state desc,is_top desc")
              ->paginate($num,false);
        $page = $list->render($count);
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page]);
        $url =$_SERVER['REQUEST_URI'];
        Session::set('url',$url);
        return $this->fetch();
    }

    /**
     *@添加公告
     */
    public function add_notice(){
        if(Request::instance()->isAjax()){
            $obj = model('SystemNotice');
            $data = Request::instance()->post();
            $result = $obj->edit($data);
        }else{
            //$grade = Db::name('Grade')->select();
            $grade = [['id'=>'1','name'=>'普通会员'],['id'=>'2','name'=>'店铺商家'],['id'=>'3','name'=>'网红主播']];
            $this->assign(['grade'=>$grade]);
            return $this->fetch();
        }
    }

    /**
     *@编辑公告
     */
    public function edit_notice(){
        $id = input('id');
        if(Request::instance()->isAjax()){
            $obj = model('SystemNotice');
            $data = Request::instance()->post();
            $result = $obj->edit($data);
        }else{
            $re = Db::name('system_notice')->where(['id'=>$id])->find();
            $re['object'] = explode(',',$re['object']);
            //$grade = ('Grade')->select();
            $grade = [['id'=>'1','name'=>'普通会员'],['id'=>'2','name'=>'店铺商家'],['id'=>'3','name'=>'网红主播']];
            $this->assign(['re'=>$re,'grade'=>$grade]);
            return $this->fetch('home/add_notice');
        }
    }

    /**
     *@删除公告
     */
    public function del_notice(){
        $id = input('ids');
        $data['id'] = array('in',$id);
        $result = Db::name('system_notice')->where($data)->update(['is_delete'=>1]);
        if($result){
            success(['info'=>'删除记录成功!','url'=>session('url')]);
        }else{
            error('删除记录失败!');
        }
    }


    /**
     *@切换置顶
     */
    public function change_notice_top(){
        if(Request::instance()->isAjax()){
            $id = input('id');
            $status = Db::name('system_notice')->where(['id'=>$id])->value('is_top');
            $abs = 3 - $status;
            $arr = ['1','2'];
            $result = Db::name('system_notice')->where(['id'=>$id])->update(['is_top'=>$abs]);
            if($result){
                success($arr[2-$status]);
            }else{
                error('切换状态失败');
            }
        }
    }

    /**
     *切换公告状态
     */
    public function change_notice_state(){
        if(Request::instance()->isAjax()){
            $id = input('id');
            $status = Db::name('system_notice')->where(['id'=>$id])->value('state');
            $abs = 3 - $status;
            $arr = ['1','2'];
            $result = Db::name('system_notice')->where(['id'=>$id])->update(['state'=>$abs]);
            if($result){
                success($arr[2-$status]);
            }else{
                error('切换状态失败');
            }
        }
    }


    /**
     *发送公告
     */
    public function send_notice(){
        if(IS_POST){
            $id = I('id');
            $notice = M('Notice')->where(['id'=>$id])->find();
            if($notice['is_send'] == '2'){
                echo json_encode(array('status'=>'error','info'=>'该公告已经发送过了'));
                die;
            }
            $notice['object'] = explode(',',$notice['object']);
            $data['intime'] = date("Y-m-d H:i:s",time());
            $data['notice_id'] = $notice['id'];
            if(empty($data['object'])){
                $member = M('Member')->where(['is_del'=>'1'])->select();
            }else{
                $member = M('Member')->where(['is_del'=>'1','grade'=>['in',$notice['object']]])->select();
            }
            foreach($member as $k=>$v){
                $data['member_id'] = $v['member_id'];
                M('MemberNotice')->add($data);
            }
            M('Notice')->where(['id'=>$id])->save(['is_send'=>'2']);
            echo json_encode(array('status'=>'ok','info'=>'发送成功'));
        }
    }


    /**
     *@功能模块
     */
    public function module(){
        $map['is_del'] = '1';
        $count = M('Module')->where($map)->count();
        $num = I('num');
        if (empty($num)) {
            $num = 10;
        }
        $p = $this->getpage($count, $num);
        $list = M('Module')->where($map)
            ->limit($p->firstRow, $p->listRows)->order('is_tuijian desc,sort desc')->select();
        $this->assign('list',$list);
        $url =$_SERVER['REQUEST_URI'];
        session('url',$url);
        $this->display();
    }

    /**
     *@编辑论坛模块
     */
    public function edit_module(){
        $id = I('id');
        if(IS_POST){
            echo json_encode(D('Module')->auth());
        }else{
            $re = M('Module')->where(['module_id'=>$id])->find();
            $this->assign(['re'=>$re]);
            $this->display("Home/add_module");
        }
    }
    /**
     *资讯文章
     */
    public function article_class(){
        $map['is_del'] = '1';
        $count = Db::name('ArticleClass')->where($map)->count();

        $num= input('num'); // 获取分页显示数
        $num ? $num : $num = 10;
        $params = Request::instance()->param();
        $list = Db::name('ArticleClass')->where($map)
            ->order('sort asc')->paginate($num,false,["query"=>$params]);
        $page = $list->render($count);
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page]);
        $url =$_SERVER['REQUEST_URI'];
        Session::set('url',$url);
        return $this->fetch();
    }

    /**
     *添加资讯分类
     */
    public function add_article_class(){
        if(Request::instance()->isPost()) {
            $obj = model('ArticleClass');
            $data = Request::instance()->post();
            $result = $obj->edit($data);
        }else{
            return $this->fetch();
        }
    }

    /**
     *编辑资讯分类
     */
    public function edit_article_class(){
        if(Request::instance()->isPost()) {
            $obj = model('ArticleClass');
            $data = Request::instance()->post();
            $result = $obj->edit($data);
        }else{
            $id = input('id');
            $re = Db::name('article_class')->where(['class_id'=>$id])->find();
            $this->assign(['re'=>$re]);
            return $this->fetch('home/add_article_class');
        }
    }

    /**
     *删除分类
     */
    public function del_article_class(){
        if(request()->isAjax()) {
            $id = input('ids');
            if(empty($id))      return error('删除记录失败!');
            $model = model('ArticleClass');
            $result = $model->soft_del($id);
            if ($result) {
                return success([ 'info' => '删除记录成功!', 'url' => session('url')]);
            } else {
                return error('删除记录失败!');
            }
        }
    }

    /**
     *@修改分类状态
     */
    public function change_article_class(){
        if(request()->isAjax()){
            $id = input('id');
            if(empty($id))      return error('切换状态失败!');
            $model = model('ArticleClass');
            $result = $model->change_status($id);
            if($result){
                return success(array('status'=>'ok','info'=>$result));
            }else{
                return error('切换状态失败');
            }
        }
    }

    /**
     *@上移排序
     */
    public function plus_article_class_sort(){
        if(Request::instance()->isAjax()){
            $id = input('id');
            $check = Db::name('article_class')->where(['class_id'=>$id])->find();
            $map['sort'] = ['lt',$check['sort']];
            $map['is_del'] = '1';

            $last = Db::name('article_class')->where($map)
                ->order("sort desc")->limit(1)->find();
            if(empty($last)){
                error('不能移动');
            }else{
                $sort = $last['sort'];
                $result = Db::name('article_class')->where(['class_id'=>$id])->update(['sort'=>$sort]);
                Db::name('article_class')->where(['class_id'=>$last['class_id']])->update(['sort'=>$check['sort']]);
            }
            if($result){
                success('操作成功');
            }else{
                error('操作失败');
            }
        }
    }

    /**
     *@下移排序
     */
    public function minus_article_class_sort(){
        if(Request::instance()->isAjax()){
            $id = input('id');
            $check = Db::name('article_class')->where(['class_id'=>$id])->find();
            $map['sort'] = ['gt',$check['sort']];
            $map['is_del'] = '1';

            $last = Db::name('article_class')->where($map)
                ->order("sort asc")->limit(1)->find();
            if(empty($last)){
                error('不能移动');
            }else{
                $sort = $last['sort'];
                $result = Db::name('article_class')->where(['class_id'=>$id])->update(['sort'=>$sort]);
                Db::name('article_class')->where(['class_id'=>$last['class_id']])->update(['sort'=>$check['sort']]);
            }
            if($result){
                success('操作成功');
            }else{
                error('操作失败');
            }
        }
    }

    /**
     *资讯文章
     */
    public function article(){
        $map['is_delete'] = '0';
        $title = input('title');
        $class_id = input('class_id');
        !empty($class_id)  &&  $map['class_id'] = $class_id;
        !empty($title)  &&  $map['title|author'] = ['like','%'.$title.'%'];
        $count = Db::name('Article')->where($map)->count();

        $num= input('num'); // 获取分页显示数
        $num ? $num : $num = 10;
        $params = Request::instance()->param();
        $list = Db::name('Article')->where($map)
            ->order('sort desc')->paginate($num,false,["query"=>$params]);
        $list->toArray();
        foreach ($list as $k=>$v){
            $data = $v;
            $data['class_name'] = Db::name('article_class')->where(['class_id'=>$v['class_id']])->value('title');
            $list->offsetSet($k,$data);
        }
        $page = $list->render($count);
        $class = Db::name('article_class')->where(['is_del'=>'1','status'=>'2'])->order('sort asc')->select();
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page,'class'=>$class]);
        $url =$_SERVER['REQUEST_URI'];
        Session::set('url',$url);
        return $this->fetch();
    }

    /**
     *添加资讯
     */
    public function add_article(){
        if(Request::instance()->isPost()) {
            $obj = model('Article');
            $data = Request::instance()->post();
            $result = $obj->edit($data);
        }else{
            $class = Db::name('article_class')->where(['is_del'=>'1','status'=>'2'])->order('sort asc')->select();
            $this->assign(['class'=>$class]);
            return $this->fetch();
        }
    }

    /**
     *编辑文章
     */
    public function edit_article(){
        $id = input('id');
        if(Request::instance()->isPost()){
            $obj = model('Article');
            $data = Request::instance()->post();
            $result = $obj->edit($data);
        }else{
            $re = Db::name('Article')->where(['id'=>$id])->find();
            $class = Db::name('article_class')->where(['is_del'=>'1','status'=>'2'])->order('sort asc')->select();
            $this->assign(['re'=>$re,'class'=>$class]);
            return $this->fetch('home/add_article');
        }
    }

    /**
     *删除游记
     */
    public function del_article(){
        if(request()->isAjax()) {
            $id = input('ids');
            if(empty($id))      return error('删除记录失败!');
            $model = model('Article');
            $result = $model->soft_del($id);
            if ($result) {
                return success([ 'info' => '删除记录成功!', 'url' => session('url')]);
            } else {
                return error('删除记录失败!');
            }
        }
    }

    /**
     *@修改游记状态
     */
    public function change_article_status(){
        if(request()->isAjax()){
            $id = input('id');
            if(empty($id))      return error('切换状态失败!');
            $model = model('Article');
            $result = $model->change_status($id);
            if($result){
                return success(array('status'=>'ok','info'=>$result));
            }else{
                return error('切换状态失败');
            }
        }
    }

    /**
     *图片模糊
     */
    public function change_img(){
        $srcImg = 'Uploads/image/city/20161014/5800320bd06be.jpg';
        $savepath = 'Uploads/image/city/20161013';
        $savename = '3.png';

        $result = gaussian_blur($srcImg,$savepath,$savename,$blurFactor=3);
        echo $result;
    }

    // 空方法
    public function _empty(){
        $this->view->engine->layout(false);
        return $this->fetch('common/error');
    }

}