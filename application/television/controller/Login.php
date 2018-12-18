<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/22
 * Time: 下午3:51
 */

namespace app\television\controller;
use think\captcha\Captcha;
use think\Controller;
use think\Db;
use think\Request;
use think\Session;
use think\Validate;

class Login extends Controller
{
    public function _initialize(){
        header("Content-type: text/html; charset=utf-8");
        header("Access-Control-Allow-Origin: *");
    }
    public function login(){
        $system = Db::name("system")->where(['id'=>"1"])->value('title');
        if (Request::instance()->isAjax()){
            $validate =validate('Member');
            $data = Request::instance()->param();
            $result = $validate->scene('login')->check($data);
            if(!$result)           error($validate->getError());
            //if(!check_verify($data['verify_code']))     error("验证码错误啦，请再输入吧");
            $data['password']	= my_encrypt($data['password']);
            $user = Db::name('Television')->where(['phone'=>$data['phone'],'password'=>$data['password']])->find();
            if(!empty($user)){
                $uptime = date("Y-m-d H:i:s");
                DB::name("Television")->where("tv_id",$user["tv_id"])->update(["update_time"=>$uptime]);
                $member["member_id"]=$user["tv_id"];
                $member["phone"]= $user["phone"];
                $member["dashang_scale"] = $user['dashang_scale'];
                $member['sell_scale'] = $user['sell_scale'];
                session::set('member',$member);
                Session::delete('__token__'); // 验证完成销毁session
                success(['info'=>$system.'电视台管理系统登陆成功','url'=>url('Index/index')]);
            } else {
                error("用户名或者密码不正确");
            }
            return;
        }else{
            $this->view->engine->layout(false);
            $member = Session::get('member');
            if(!empty($user)){
                $this->redirect('Index/index');
            }
            $this->assign("system", $system);
            return $this->fetch('common/login');
        }
    }

    // 空方法
    public function _empty(){
        $this->view->engine->layout(false);
        return $this->fetch('common/error');
    }
    //验证码
    public function verify_code(){
        $config =    [
            // 验证码字体大小
            'fontSize'    =>    30,
            // 验证码位数
            'length'      =>    4,
            // 关闭验证码杂点
            'useNoise'    =>    true,
            'codeSet'     =>    '0123456789'
        ];
        $captcha = new Captcha($config);
        return $captcha->entry();
    }
    //切换退出账号
    public function sign_out(){
        session('member', null);
        return $this->redirect('login/login');
    }

}