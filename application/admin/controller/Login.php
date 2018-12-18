<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/9/22
 * Time: 下午3:51
 */

namespace app\admin\controller;



use think\captcha\Captcha;
use think\Controller;
use think\Db;
use think\Request;
use think\Session;
use think\Validate;

class Login extends Controller
{
    public function sign_in(){
        $system = Db::name("system")->where(['id'=>"1"])->value('title');
        if (Request::instance()->isAjax()){
            $rule = [
                'uname'      => 'require|max:16',
                'password'   => 'require',
                'verify_code'     => 'require|number',
//                '__token__' => 'token',
            ];
            $message = [
                'uname.require' => '账号信息必须填写',
                'uname.max'     => '账号最多不能超过16个字符',
                'password.require'   => '账号密码信息必须填写',
                'verify_code.require'  => '验证码信息必须填写',
                'verify_code.number'        => '验证码类型必须是数字',
            ];
            $data = Request::instance()->post(false); // 获取所有的post变量（原始数组）
            $validate = new Validate($rule,$message);
            $result = $validate->check($data);
            if(!$result)            error($validate->getError());
            //if(!check_verify($data['verify_code']))     error("验证码错误啦，请再输入吧");

            $data['password']	= my_encrypt($data['password']);
            $user = Db::name('system_member')->where(['username'=>$data['uname'],'password'=>$data['password']])->find();

            //$user = Db::name('system_member')->where(['username'=>$data['uname']])->find();
            //var_dump($data);exit;
            if (!empty($user)){

                $system_member['last_login_date'] = date("Y-m-d H:i:s");
                $system_member['last_login_ip'] = get_ip();
                $system_member['login_times'] = $user['login_times'] + 1;
                Db::name('system_member')->where(['id'=>$user['id']])->update($system_member);
                $group = Db::name('AuthGroupAccess')->alias('a')
                    ->field("b.title")
                    ->join('__AUTH_GROUP__ b ','a.group_id = b.id')
                    ->where(['a.uid'=>$user['id']])
                    ->find();
                unset($user['password']);
                $user['title'] = $group['title'];
                session::set('user',$user);
                Session::delete('__token__'); // 验证完成销毁session
                success(['info'=>$system.'管理系统登陆成功','url'=>url('Index/index')]);
            } else {
                error("用户名或者密码不正确");
            }
            return;
        } else {
            $this->view->engine->layout(false);
            $user = Session::get('user');
            if(!empty($user)){
                $this->redirect('Index/index');
            }
            $this->assign("system", $system);
            return $this->fetch('common/login-1');
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

    public function map(){
        $this->view->engine->layout(false);
        return $this->fetch();
    }

    public function sign_out(){
        session('user', null);
        return $this->redirect('login/sign_in');
    }

}