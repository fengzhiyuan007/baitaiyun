<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/10/20
 * Time: 上午10:25
 */

namespace app\admin\controller;

use think\Request;
use think\Db;
use think\Session;
use lib\Page;
class Goods extends Base
{
    /**
     *@商品分类
     */
    public function index(){
        $map=[];
        $title = input('title');
        $title && $map['class_name'] = ['like','%'.$title.'%'];
        $num  = input('num');
        $map['parent_id'] = '-1';
        $map['is_delete'] = '0';
        if (empty($num)){
            $num = 8;
        }
        $this->assign('nus',$num);
        $count = Db::name('goods_class')->where($map)->count();
        $list = Db::name('goods_class')->where($map)->order("sort desc")->paginate($num,false,$config = ['query'=>array('title'=>$title)]);
        $page = $list->render($count);
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page]);
        $url =$_SERVER['REQUEST_URI'];
        session('url',$url);
        return $this->fetch();
    }

    /**
     *@子分类
     */
    public function seed(){
        $map=[];
        $title = input('title');
        $title && $map['a.class_name'] = ['like','%'.$title.'%'];
        $uuid = input('uuid');
        $parent = Db::name('goods_class')->where(['class_uuid'=>$uuid])->find();
        $map['is_delete'] = '0';
        if(!empty($parent)){
            $map['parent_id'] = $parent['class_id'];
        }else{
            return $this->fetch();
        }
        $num  = input('num');
        if (empty($num)){
            $num = 8;
        }
        $this->assign('nus',$num);
        $count = Db::name('goods_class')->where($map)->count();
        $data = Db::name("goods_class")->where($map)->order("sort desc")->paginate($num,false,$config = ['query'=>array('title'=>$title)]);
        $page = $data->render();
        $first_category = Db::name('goods_class')->where(['parent_id'=>['eq','-1'],'is_delete'=>'0'])->select();
        $this->assign(['list'=>$data,'page'=>$page,'first_category'=>$first_category,'count'=>$count,'parent'=>$parent]);
        $url =$_SERVER['REQUEST_URI'];
        session('url',$url);
        return $this->fetch();
    }

    /**
     *@编辑商品一级分类
     */
    public function edit_parent_class(){
        if(Request::instance()->isAjax()){
            $data = Request::instance()->post(false); // 获取所有的post变量（原始数组）
            if(empty($data['class_id'])){
                $data['class_uuid'] = get_guid();
            }
            $model = model('GoodsClass');
            $result = $model->edit_class($data,'edit');
        }else{
            $id = input('id');
            $re = Db::name('goods_class')->where(['class_id'=>$id])->find();
            $re['class_color'] = explode('#',$re['class_color'])[1];
            $this->assign(['re'=>$re]);
            $this->view->engine->layout(false);
            return $this->fetch();
        }
    }

    /**
     *@编辑商品子分类分类
     */
    public function edit_seed_class(){
        if(Request::instance()->isAjax()){
            $data = Request::instance()->post(false); // 获取所有的post变量（原始数组）
            if(empty($data['class_id'])){
                $data['class_uuid'] = get_guid();
            }
            $model = model('GoodsClass');
            $result = $model->edit_class($data,'edit');
        }else{
            $id = input('id');
            $re = Db::name('goods_class')->where(['class_id'=>$id])->find();
            $re['class_color'] = explode('#',$re['class_color'])[1];
            $this->assign(['re'=>$re]);
            $this->view->engine->layout(false);
            return $this->fetch();
        }
    }

    /**
     *@改变分类状态
     */
    public function change_class_status(){
        if(Request::instance()->isAjax()){
            $id = input('id');
            $status = Db::name('goods_class')->where(['class_id'=>$id])->value('class_state');
            $abs = 1 - $status;
            $arr = ['0','1'];
            $result = Db::name('goods_class')->where(['class_id'=>$id])->update(['class_state'=>$abs]);
            if($result){
                return success($arr[1-$status]);
            }else{
                return error('切换状态失败');
            }
        }
    }

    /**
     *@改变分类状态
     */
    public function change_class_recommend(){
        if(Request::instance()->isAjax()){
            $id = input('id');
            $status = Db::name('goods_class')->where(['class_id'=>$id])->value('is_recommend');
            $abs = 1 - $status;
            $arr = ['0','1'];
            $result = Db::name('goods_class')->where(['class_id'=>$id])->update(['is_recommend'=>$abs]);
            if($result){
                return success($arr[1-$status]);
            }else{
                return error('切换状态失败');
            }
        }
    }
    /**
     *@删除
     */
    public function del_class(){
        if(Request::instance()->isAjax()){
            $id = input('ids');
            if(empty($id))      error("参数错误");
            $model = model('GoodsClass');
            $map['class_id']    =   ['in',$id];
            $result = $model->del_class($map);
        }
    }

    /**
     *品牌列表
     */
    public function brand(){
        $map = [];
        $name = input('name'); //
        $brand_state = input('brand_state'); //
        !empty($name) &&  $map['brand_name'] = ['like', '%' . $name . '%'];
        !empty($brand_state) && $map['brand_state'] = $brand_state;
        $map['is_delete'] = '0';
        $num = input('num');
        if (empty($num)) {
            $num = 10;
        }
        $this->assign('nus', $num);
        $count = Db::name('goods_brand')->where($map)->count();
        $data = Db::name("goods_brand")->where($map)->order("brand_state asc,sort desc")
            ->paginate($num,false,$config = ['query'=>array('name'=>$name,'brand_state'=>$brand_state)]);
        $page = $data->render();
        $this->assign(['list' => $data, 'page' => $page,'count'=>$count]);
        $url = $_SERVER['REQUEST_URI'];
        session('url', $url);
        return $this->fetch();
    }

    /**
     *添加品牌
     */
    public function edit_brand(){
        $model = model('GoodsBrand');
        if(Request::instance()->isAjax()){
            $data = Request::instance()->post(false); // 获取所有的post变量（原始数组）
//            $merchant = $this->merchant;
//            $data['merchant_id']    =   $merchant['member_id'];
            if(empty($data['brand_id'])){
                $data['brand_uuid'] = get_guid();
            }
            $result = $model->edit($data,'edit');
        }else{
            $brand_uuid = input('uuid');
            $where['brand_uuid'] = $brand_uuid;
            $re = $model->queryByCode($where);
            $this->assign(['re'=>$re]);
            return $this->fetch('goods/insert_brand');
        }
    }

    /**
     *删除品牌
     */
    public function del_brand(){
        if(Request::instance()->isAjax()) {
            $ids = input('ids');
            if(empty($ids))     error("删除失败");
            $merchant = $this->merchant;
            $map['merchant_id']    =   $merchant['member_id'];
            $map['brand_id']    =   ['in',$ids];
            $model = model('GoodsBrand');
            $result = $model->soft_del($map);
        }
    }

    /**
     *@品牌状态
     */
    public function change_brand_state(){
        if(Request::instance()->isAjax()){
            $id = input('id');
            $status = Db::name('goods_brand')->where(['brand_id'=>$id])->value('brand_state');
            $abs = 3 - $status;
            $arr = ['1','2'];
            $result = Db::name('goods_brand')->where(['brand_id'=>$id])->update(['brand_state'=>$abs]);
            if($result){
                echo json_encode(array('status'=>'ok','info'=>$arr[2-$status]));
                exit;
            }else{
                echo json_encode(array('status'=>'error','info'=>'切换状态失败'));
                exit;
            }
        }

    }

    /**
     *商品列表
     */
    public function goods_list(){
        $map = [];
        $name = input('name'); // 获取所有的post变量（原始数组）
        $merchants_id = input('merchants_id');
        $goods_state = input('goods_state'); // 获取所有的post变量（原始数组）
        $parent_class = input('parent_class'); // 获取所有的post变量（原始数组）
        $seed_class = input('seed_class'); // 获取所有的post变量（原始数组）
        !empty($name) &&  $map['goods_name'] = ['like', '%' . $name . '%'];
        !empty($goods_state) && $map['goods_state'] = $goods_state;
        !empty($parent_class) && $map['parent_class'] = $parent_class;
        !empty($seed_class) && $map['seed_class'] = $seed_class;
        !empty($merchants_id) && $map['merchants_id'] = $merchants_id;
        $map['is_delete'] = '0';
        $num = input('num');
        if (empty($num)) {
            $num = 10;
        }
        $this->assign('nus', $num);
        $count = Db::name('goods')->where($map)->count();
        $data = Db::name("goods")
            ->where($map)->order("goods_state asc,sort desc,create_time desc")
            ->paginate($num,false,$config = ['query'=>array('name'=>$name,'goods_state'=>$goods_state,'parent_class'=>$parent_class,'seed_class'=>$seed_class)]);
        $page = $data->render();
        $parent_class = Db::name('goods_class')
            ->field('class_id,class_name')
            ->where(['class_state'=>'1','is_delete'=>'0','parent_id'=>'-1'])
            ->select();
        $this->assign(['list' => $data, 'page' => $page,'count'=>$count, 'parent_class'=>$parent_class]);
        $url = $_SERVER['REQUEST_URI'];
        session('url', $url);
        return $this->fetch();
    }

    /**
     *商品列表
     */
    public function is_del_goods(){
//        $merchant = $this->merchant;
        $map = [];
        $name = input('name'); // 获取所有的post变量（原始数组）
        $merchants_id = input('merchants_id');
        $goods_state = input('goods_state'); // 获取所有的post变量（原始数组）
        $parent_class = input('parent_class'); // 获取所有的post变量（原始数组）
        $seed_class = input('seed_class'); // 获取所有的post变量（原始数组）
        !empty($name) &&  $map['goods_name'] = ['like', '%' . $name . '%'];
        !empty($goods_state) && $map['goods_state'] = $goods_state;
        !empty($parent_class) && $map['parent_class'] = $parent_class;
        !empty($seed_class) && $map['seed_class'] = $seed_class;
        !empty($merchants_id) && $map['merchants_id'] = $merchants_id;
        $map['is_delete'] = '1';
        $num = input('num');
        if (empty($num)) {
            $num = 10;
        }
        $this->assign('nus', $num);
        $count = Db::name('goods')->where($map)->count();
        $data = Db::name("goods")
            ->where($map)->order("goods_state asc,sort desc,create_time desc")
            ->paginate($num,false,$config = ['query'=>array('name'=>$name,'goods_state'=>$goods_state,'parent_class'=>$parent_class,'seed_class'=>$seed_class)]);
        $page = $data->render();
        $parent_class = Db::name('goods_class')
            ->field('class_id,class_name')
            ->where(['class_state'=>'1','is_delete'=>'0','parent_id'=>'-1'])
            ->select();
        $this->assign(['list' => $data, 'page' => $page,'count'=>$count, 'parent_class'=>$parent_class]);
        $url = $_SERVER['REQUEST_URI'];
        session('url', $url);
        return $this->fetch();
    }


    /**
     *分类联动
     */
    public function get_seed_class(){
        if(Request::instance()->isAjax()){
            $parent = input('parent');
            $seed = Db::name('goods_class')->where(['parent_id'=>$parent,'is_delete'=>'0'])->select();
            $option= "<option value=''>选择二级分类</option>";
            if(!empty($seed)){
                foreach($seed as $k=>$v){
                    $option.="<option value=".$v['class_id'].">".$v['class_name']."</option>";
                }
            }else{
                $option= "<option value=''>暂无二级分类</option>";
            }
            echo $option;
        }
    }

    /**
     *@改变分类状态
     */
    public function change_goods_review(){
        if(Request::instance()->isAjax()){
            $id = input('id');
            $status = Db::name('goods')->where(['goods_id'=>$id])->value('is_review');
            $abs = 1 - $status;
            $arr = ['0','1'];
            $result = Db::name('goods')->where(['goods_id'=>$id])->update(['is_review'=>$abs]);
            if($result){
                return success($arr[1-$status]);
            }else{
                return error('切换状态失败');
            }
        }
    }

    /**
     *@改变商品的上架信息
     */
    public function change_goods_status(){
        if(Request::instance()->isAjax()){
            $id = input('id');
            $status = Db::name('Goods')->where(['goods_id'=>$id])->value('goods_state');
            $abs = 3 - $status;
            $arr = ['1','2'];
            $result = Db::name('Goods')->where(['goods_id'=>$id])->update(['goods_state'=>$abs]);
            if($result){
                success($arr[2-$status]);
            }else{
                error('切换状态失败');
            }
        }
    }

    /**
     *@改变商品的推荐信息
     */
    public function change_goods_tuijian(){
        if(Request::instance()->isAjax()){
            $id = input('id');
            $status = Db::name('Goods')->where(['goods_id'=>$id])->value('is_tuijian');
            $abs = 1 - $status;
            $arr = ['1','2'];
            $result = Db::name('Goods')->where(['goods_id'=>$id])->update(['is_tuijian'=>$abs]);
            if($result){
                success($arr[1-$status]);
            }else{
                error('切换状态失败');
            }
        }
    }

    /**
     *添加商品
     */
    public function insert_goods(){
        if(Request::instance()->isAjax()) {
            $data = Request::instance()->post();
            $data['goods_class'] = join(',',$data['goods_class']);
            if(empty($data['goods_uuid'])){
                $data['goods_uuid'] = get_guid();
            }
            $model = model('Goods');
            $result = $model->edit($data);
        }else{
            $parent_class = Db::name('goods_class')
                ->field('class_id,class_name')
                ->where(['a.class_state'=>'1','a.is_delete'=>'0'])
                ->select();
            $brand = Db::name('goods_brand')->where(['is_delete'=>'0','brand_state'=>'1'])->select();
            $specification = Db::name('goods_specification')->where(['parent_id'=>'-1'])->select();
            $this->assign(['parent_class'=>$parent_class,'brand'=>$brand,'specification'=>$specification]);
            return $this->fetch();
        }
    }

    /**
     *编辑商品
     */
    public function edit_goods(){
        if(Request::instance()->isAjax()) {
            $data = Request::instance()->post();
            $data['goods_class'] = join(',',$data['goods_class']);
            $data['imgs'] = join(',',$data['imgs']);
            if(empty($data['goods_uuid'])){
                $data['goods_uuid'] = get_guid();
            }
            $model = model('Goods');
            $result = $model->edit($data,'edit');
        }else{
            $goods_uuid = input('goods_uuid');
            $model = model('Goods');
            $where['goods_uuid'] = $goods_uuid;
            $goods = $model->queryGoods($where);
            $goods['imgs'] = explode(',',$goods['imgs']);
            $merchant = Db::name('member')->where(['member_id'=>$goods['merchants_id']])->find();//商家
            $parent_class = Db::name('goods_class')->alias('a')
                ->field('a.class_id,a.class_name')
                ->join('th_goods_merchants_class b','FIND_IN_SET(a.class_id,b.class_id)')
                ->where(['a.class_state'=>'1','a.is_delete'=>'0','b.member_id'=>$merchant['member_id']])
                ->select();
            $brand = Db::name('goods_brand')->where(['merchant_id'=>$merchant['member_id'],'is_delete'=>'0','brand_state'=>'1'])->select();
            if(!empty($goods['goods_tag']))  $goods['goods_tag'] = unserialize($goods['goods_tag']);
            if(!empty($goods['goods_nature']))  $goods['goods_nature'] = unserialize($goods['goods_nature']);
            $specification = Db::name('goods_specification')->where(['parent_id'=>'-1'])->select();
            //产品规格详情
            $goods_specification_relation = Db::name('goods_relation_specification')->where(['goods_id'=>$goods['goods_id'],'is_delete'=>'0'])->select();

            $arr = [];    //选中的规格
            foreach ($goods_specification_relation as $v){
                $arr1 = explode(',',$v['specification_ids']);
                foreach ($arr1 as $val){
                    array_push($arr,$val);
                }
            }

            //父级分类
//            $goodsSpecificationBeans = Db::name('goods_relation_specification')->alias('a')
//                ->field('c.specification_id,c.specification_value')
//                ->join('th_goods_specification b', 'FIND_IN_SET(b.specification_id,a.specification_ids)')
//                ->join('th_goods_specification c', 'b.parent_id=c.specification_id')
//                ->where(['a.is_delete' => '0', 'a.goods_id' => $goods['goods_id'], 'b.is_delete' => '0', 'c.is_delete' => '0'])
//                ->group('c.specification_id')
//                ->select();
            $beans = Db::name('goods_relation_specification')->where(['goods_id'=>$goods['goods_id'],'is_delete'=>'0'])->order("specification_id desc")->value('specification_ids');
            $beans = explode(',',$beans);
            $goodsSpecificationBeans = array();
            foreach ($beans as $v){
                $arr1 = Db::name('goods_specification')->alias('a')
                    ->field('b.specification_id,b.specification_value')
                    ->join('th_goods_specification b','a.parent_id = b.specification_id')
                    ->where(['a.specification_id'=>$v])
                    ->find();
                if(!empty($arr1)) {
                    if (!in_array($arr1, $goodsSpecificationBeans)) {
                        array_push($goodsSpecificationBeans, $arr1);
                    }
                }
            }

            foreach ($goodsSpecificationBeans as &$v){
                $v['specification'] = Db::name('goods_specification')->where(['parent_id'=>$v['specification_id'],'merchants_id'=>['in',['0',$merchant['member_id']]]])->select();
            }
            $seed_class = Db::name('goods_class')->where(['parent_id'=>$goods['parent_class']])->select();
            $this->assign(['parent_class'=>$parent_class,'brand'=>$brand,'re'=>$goods,
                'specification'=>$specification,'goods_specification_relation'=>$goods_specification_relation]);
            $this->assign(['arr'=>$arr,'goodsSpecificationBeans'=>$goodsSpecificationBeans,'seed_class'=>$seed_class]);
            return $this->fetch('goods/insert_goods');
        }
    }

    /**
     *删除商品
     */
    public function del_goods(){
        if(Request::instance()->isAjax()) {
            $ids = input('ids');
            if(empty($ids))     error("删除失败");
            $map['goods_id']    =   ['in',$ids];
            $model = model('Goods');
            $result = $model->soft_del($map);
        }
    }

    /**
     *删除商品
     */
    public function recovery_goods(){
        if(Request::instance()->isAjax()) {
            $ids = input('ids');
            if(empty($ids))     error("删除失败");
            $map['goods_id']    =   ['in',$ids];
            $model = model('Goods');
            $result = $model->recovery_del($map);
        }
    }

    /**
     *复制商品
     */
    public function copy_goods(){
        if(Request::instance()->isAjax()) {
            $id = input('id');
            $goods = Db::name('goods')->where(['goods_id'=>$id])->find();
            unset($goods['goods_id']);
            $goods['goods_state'] = '2';
            $goods['goods_uuid'] = get_guid();
            $goods['code'] = uniqid();
            $goods['create_time'] = date("Y-m-d H:i:s",time());
            $lastId = Db::name('goods')->insertGetId($goods);
            $create_time = date("Y-m-d H:i:s",time());
            if($lastId){
                Db::name('goods')->where(['goods_id'=>$lastId])->update(['sort'=>$lastId]);

                $specification = Db::name('goods_relation_specification')->where(['goods_id'=>$id,'is_delete'=>'0'])->select();
                if(!empty($specification)){
                    foreach ($specification as $v){
                        $newSpecification[] = [
                            'goods_id' => $lastId,
                            'specification_sku' => $v['specification_sku'],
                            'specification_ids' => $v['specification_ids'],
                            'specification_names'=> $v['specification_names'],
                            'specification_sales'=> $v['specification_sales'],
                            'specification_stock'=> $v['specification_stock'],
                            'specification_img'=> $v['specification_img'],
                            'specification_price'=> $v['specification_price'],
                            'specification_cost_price'=> $v['specification_cost_price'],
                            'specification_sale_price'=> $v['specification_sale_price'],
                            'create_time'=> $create_time

                        ];
                    }
                    if(!empty($newSpecification)){
                        Db::name('goods_relation_specification')->insertAll($newSpecification);
                    }
                }
                success("复制商品成功");
            }else{
                error("复制商品失败");
            }
        }
    }

    /**
     *查找规格
     */
    public function querySpecification(){
        //if(Request::instance()->isAjax()) {
        $specification_id = input('id');
        $list = Db::name('goods_specification')->where(['parent_id'=>$specification_id])->select();
        if(empty($list)){
            error("该规格暂无数据，请自行添加或更换另一个");
        }else{
            $value = Db::name('goods_specification')->where(['specification_id'=>$specification_id])->value('specification_value');
            success(['value'=>$value,'list'=>$list]);
        }
        //}
    }

    /**
     * @商品规格
     */
    public function specifications(){
        $map['parent_id'] = -1;
        $map['is_delete'] = 0;
        $title = input('title');
        $title && $map['specification_value'] = ['like','%'.$title.'%'];
        $num  = input('num');
        if (empty($num)){
            $num = 8;
        }
        $this->assign('nus',$num);
        $count = Db::name('goods_specification')->where($map)->count();
        $list = Db::name('goods_specification')->where($map)->order("sort asc")->paginate($num,false,$config = ['query'=>array('title'=>$title)]);
        $page = $list->render($count);
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page]);
        $url =$_SERVER['REQUEST_URI'];
        session('url',$url);
        return $this->fetch();
    }

    /**
     * @规格属性
     */
    public function seed_specifications(){
        $id = input('parent_id');
        $map['parent_id'] = $id;
        $map['is_delete'] = 0;
        $title = input('title');
        $title && $map['specification_value'] = ['like','%'.$title.'%'];
        $num  = input('num');
        if (empty($num)){
            $num = 8;
        }
        $this->assign('nus',$num);
        $count = Db::name('goods_specification')->where($map)->count();
        $list = Db::name('goods_specification')->where($map)->order("sort asc")->paginate($num,false,$config = ['query'=>array('title'=>$title)]);
        $page = $list->render($count);
        $parent = Db::name('goods_specification')->where(['specification_id'=>$id])->find();
        $this->assign(['list'=>$list,'count'=>$count,'page'=>$page,'parent'=>$parent]);
        $url =$_SERVER['REQUEST_URI'];
        session('url',$url);
        return $this->fetch();
    }


    /**
     *@编辑规格属性
     */
    public function edit_specifications(){
        if(Request::instance()->isAjax()){
            $data = Request::instance()->post(false); // 获取所有的post变量（原始数组）
            $model = model('GoodsSpecification');
            $result = $model->edit($data,'edit');
        }else{
            $id = input('id');
            $re = Db::name('goods_specification')->where(['specification_id'=>$id])->find();
            $this->assign(['re'=>$re]);
            $this->view->engine->layout(false);
            return $this->fetch();
        }
    }

    public function edit_seed_specifications(){
        if(Request::instance()->isAjax()){
            $data = Request::instance()->post(false); // 获取所有的post变量（原始数组）
            $model = model('GoodsSpecification');
            $result = $model->edit($data,'edit');
        }else{
            $id = input('id');
            $re = Db::name('goods_specification')->where(['specification_id'=>$id])->find();
            $this->assign(['re'=>$re]);
            $this->view->engine->layout(false);
            return $this->fetch();
        }
    }

    public function del_specifications(){
        if(Request::instance()->isAjax()){
            $id = input('ids');
            if(empty($id))      error("参数错误");
            $model = model('GoodsSpecification');
            $map['specification_id']    =   ['in',$id];
            $result = $model->soft_del($map);
            if($result){
                $url = Session::get('url');
                success(['info'=>'删除'.'操作成功','url'=>$url]);
            }else{
                error("操作失败");
            }
        }
    }
    //二维码
    public function goods_qrcode(){
        $this->view->engine->layout(false);
        $goods_id = input('goods_id');
        $goods = Db::name('goods')->where(['goods_id'=>$goods_id])->find();
        $this->assign(['goods'=>$goods]);
        return $this->fetch();
    }
    // 空方法
    public function _empty(){
        $this->view->engine->layout(false);
        return $this->fetch('common/error');
    }


}