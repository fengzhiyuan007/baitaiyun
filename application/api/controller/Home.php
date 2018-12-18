<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/10/9
 * Time: 上午8:57
 */

namespace app\api\controller;
use think\Db;
use think\Request;
class Home extends Common
{
    //轮播
    public function banner_list(){
        /****轮播****/
        $type = input('type');
        $type ? $map['type'] = $type : $map['type'] = '1';
        $map['is_del'] = '1';
        $map['status'] = '2';
        $map['is_del'] = '1';
        $list = Db::name('Banner')->field("b_id,b_img,url,b_type,title,jump")
            ->where($map)->order("sort asc")->select();
//        if(!empty($list)){
//            foreach($list as &$v){
//                switch($v['b_type']){
//                    case 1:
//                        $v['jump'] = '';
//                        break;
//                    case 2:
//                        $v['jump'] = $this->url.'/api/Home/banner_url/id/'.$v['b_id'];
//                        break;
//                    case 3:
//                        $v['jump'] = $v['value'];
//                        break;
//                    case 4:
//                        $v['jump'] = $v['value'];
//                        break;
//                }
//            }
//        }else{
//            $list = [];
//        }
        return success($list);
    }

    public function company_info(){
        $info = Db::name('aboutus')->where(['id'=>'1'])->find();
        if (empty($info))  $info =  (object)[];
        success($info);
    }

    /**
     *@轮播web跳转页
     */
    public function banner_url(){
        $id = input('id');
        $content = Db::name('Banner')->where(['b_id'=>$id])->value('content');
        $this->assign(['content'=>htmlspecialchars_decode($content)]);
        return $this->fetch();
    }

    //模块
    public function dress(){
        $list = Db::name('dress')->where(['pid'=>'-1','is_delete'=>'0','status'=>'2'])->order('sort asc')->select();
        if(!empty($list)){
            foreach ($list as &$v){
                $v['seedBeans'] = Db::name('dress')->where(['pid'=>$v['dress_id'],'is_delete'=>'0','status'=>'2'])->order('sort asc')->select();
            }
        }
        success($list);
    }

    //模块
    public function dress_pc(){
        $list = Db::name('dress_pc')->where(['pid'=>'-1','is_delete'=>'0','status'=>'2'])->order('sort asc')->select();
        if(!empty($list)){
            foreach ($list as $k=>$v){
                $seedBeans = Db::name('dress_pc')->alias('a')
                    ->field('a.*,b.goods_name,b.goods_origin_price,b.goods_now_price,b.goods_img,b.goods_id,b.total_sales')
                    ->join('th_goods b','a.jump = b.goods_id')
                    ->where(['a.pid'=>$v['dress_id'],'a.is_delete'=>'0','a.status'=>'2'])
                    ->order('sort asc')->select();
                if($seedBeans){
                    foreach ($seedBeans as $key=>$val){
                        $seedBeans[$key]['comment_count'] = Db::name('goods_comment')->where(['goods_id'=>$val['goods_id'],'is_delete'=>'0'])->count();
                    }
                    $list[$k]['seedBeans'] = $seedBeans;
                }else{
                    $list[$k]['seedBeans'] = [];
                }
            }
        }
        success($list);
    }

    public function text(){
        $id = input('id');
        $re = Db::name('Text')->where(['text_id'=>$id])->find();
        $this->assign(['re'=>$re]);
        return $this->fetch();
    }

    public function home_class(){
        $list = Db::name('home_class')->where(['is_delete'=>'0','status'=>'2'])->order("sort asc")->select();
        success($list);
    }

    public function home_class_pc(){
        $list = Db::name('home_class_pc')->where(['is_delete'=>'0','status'=>'2'])->order("sort asc")->select();
        success($list);
    }

    public function city(){
        $name = input('name');
        !empty($name)   &&   $map['shouzimu'] = ['in',$name];
        $map['is_delete'] = 0;
        $list = Db::name('city')->field('city,shouzimu')
            ->where($map)->order('shouzimu asc')->select();
        success($list);
    }

    /**
     *推荐商品(猜你喜欢)
     */
    public function maybeEnjoy(){
        if (Request::instance()->isPost()) {
//            $uid = input('uid');
            $p = input('p');
            $p  ?   $p  :   $p = 1;
            $pagesize = input('pagesize');
            $pagesize ? $pagesize  :  $pagesize = 10;
            $map['is_delete'] = '0';
            $map['goods_state'] = '1';
            $map['is_review'] = 1;
            $map['is_tuijian'] = 1;
            $count = Db::name('goods')->where($map)->count();
            $page = ceil($count/$pagesize);
            if($count) {
                $goods = Db::name('goods')
                    ->field("goods_id,goods_name,goods_img,goods_origin_price,goods_pc_price,goods_now_price,total_sales,month_sales,day_sales")
                    ->where($map)->limit(($p - 1) * $pagesize, $pagesize)
                    ->select();
            }else{
                $goods = [];
            }
            success(['page'=>$page,'goods'=>$goods]);
        }
    }

    /**
     *@param 资讯文章分类
     */
    public function article_class(){
        $list = Db::name('article_class')->tfield('class_id,title,img')
            ->where(['is_del'=>'1','status'=>'2'])->select();
        success($list);
    }
    /**
     *@param 资讯文章列表
     */
    public function article(){
        $class_id = input('class_id');
        !empty($class_id)    &&  $map['class_id']   =   $class_id;
        $map['is_delete'] = '0';
        $map['status'] = '2';
        $p = input('p');
        $p  ?   $p  :   $p = 1;
        $pagesize = input('pagesize');
        $pagesize ? $pagesize  :  $pagesize = 10;
        $count = Db::name('article')->where($map)->count();
        $page = ceil($count/$pagesize);
        if($count){
            $list = Db::name('article')->field('id,title,img,browse,intime,author')
                ->where($map)->order('intime desc')
                ->limit(($p-1)*$pagesize,$pagesize)
                ->select();
        }else{
            $list = [];
        }
        success(['page'=>$page,'list'=>$list]);
    }

    /**
     *@param 资讯文章详情
     */
    public function article_view(){
        $id = input('id');
        $re = Db::name('article')->where(['id'=>$id])->find();
        if($re){
            $result = Db::name('article')->where(['id'=>$id])->setInc('browse');
            if($result){
                $re['browse'] ++;
            }
            success($re);
        }else{
            error("资讯错误");
        }
    }

    public function app_version_control(){
        $re = Db::name('app_version_control')->where(['id'=>1])->find();
        success($re);
    }
}