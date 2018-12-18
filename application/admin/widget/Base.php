<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/26
 * Time: 上午11:42
 */

namespace app\admin\widget;


use think\Auth;
use think\Controller;
use think\Request;
use think\Session;
use think\Db;

class Base extends Controller
{
    public $user = array();
    public function _initialize(){
        header("Content-type: text/html; charset=utf-8");
        $this->user = Session::get('user');
    }
    // 左侧菜单
    public function menu(){

        $nav = Db::name("AuthRule")->where(array('pid'=>0,'status'=>1,'is_delete'=>0))->order('sort asc')->select();
        $auth = new Auth();
        $mode = 'url';
        //'or' 表示满足任一条规则即通过验证;
        //'and'则表示需满足所有规则才能通过验证
        $relation = 'or';
        $user = $this->user;
        if($user['username'] != 'admin') {
            foreach ($nav as $key => $val) {
                $arr = explode("/", $val['name']);
                $type = $arr[0];
                $res = $auth->check($val['name'], $user['id'], $type, $mode, $relation);
                if (!$res) {
                    unset($nav[$key]);
                }else{
                    $map["pid"] = $val['id'];
                    $map["is_button"]='1';
                    $map["is_delete"]=0;
                    $map["status"]=1;
                    $menu = Db::name("auth_rule")->where($map)->order("sort asc")->select();
                    if ($user['username'] != 'admin') {
                        foreach($menu as $k=>$v){
                            $arr = explode("/", $v['name']);
                            $type = $arr[0];
                            $res = $auth->check($v['name'], $user['id'], $type, $mode, $relation);
                            if (!$res) {
                                unset($menu[$k]);
                            }
                        }
                    }
                    $nav[$key]['menu'] = array_values($menu);
                }

            }
        }else{
            foreach ($nav as $key => $val) {
                $map["pid"] = $val['id'];
                $map["is_button"]='1';
                $map["is_delete"]=0;
                $map["status"]=1;
                $menu = Db::name("auth_rule")->where($map)->order("sort asc")->select();
                $nav[$key]['menu'] = $menu;
            }
        }
        $nav = array_values($nav);
        $this->assign('nav',$nav);
        $this->view->engine->layout(false);
        return $this->fetch("common/_menu");
    }

    // 面包屑
    public function breadcrumbs($action){
        $request = Request::instance();
        if (empty($action)){
            $menu = $this->currentMenuList();
            if (!empty($menu)){
                if (isset($menu[$request->action()])){
                    $this->assign('action', $menu[$request->action()]['text']);
                }
            }
        } else {
            $this->assign('action', $action);
        }
        if(isset($fields[$request->controller()][$request->action()]['fields'])){
            $this->assign('url',$fields[$request->controller()][$request->action()]['url']);
            $this->assign('table',$fields[$request->controller()][$request->action()]['table']);
            $this->assign('fields',$fields[$request->controller()][$request->action()]['fields']);
        }
        //外来文件比对
        if(isset($fields[$request->controller()][$request->action()]['type'])){
            $this->assign('url',$fields[$request->controller()][$request->action()]['url']);
            $this->assign('type',$fields[$request->controller()][$request->action()]['type']);
        }
        $this->view->engine->layout(false);
        return $this->fetch("common/breadcrumbs");
    }

    // 百度编辑器
    public function ueditor($id,$content=''){
        $this->assign('id',$id);
        $this->assign('content',htmlspecialchars_decode($content));
        $this->view->engine->layout(false);
        return $this->fetch('widget/ueditor');
    }


}