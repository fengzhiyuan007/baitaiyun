<?php
namespace app\api\controller;
use think\Controller;
use think\View;
use think\Db;
use opensearch;
use \think\Session;
use \think\Request;

class Index extends Common
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


    /**
     *@轮播web跳转页
     */
    public function banner_url(){
        $b_id = input('id');
        $content = Db::name('Banner')->where(['b_id'=>$b_id])->value('content');
        $this->assign(['content'=>htmlspecialchars_decode($content)]);
        return $this->fetch();
    }
}
