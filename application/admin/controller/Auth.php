<?php
namespace app\admin\controller;
use think\Db;
use think\Request;
use think\Validate;
class Auth extends Base{
    /**
     *权限规则列表
     */
    public function index(){
        $map['pid'] = 0;
        $map['is_delete'] = 0;
        $count = DB::name('AuthRule')->where($map)->count();
        $list = DB::name('AuthRule')->where($map)->order('sort asc')->paginate(10,false);
        $this->assign(['list' => $list,'count'=>$count]);
        $url =$_SERVER['REQUEST_URI'];
        session('url',$url);
        return $this->fetch();
    }

    /**
     *下级规则列表
     */
    public function seed(){
        $pid = input('pid');
        $pid ? $map['pid'] = $pid : $pid = 0;
        $map['is_delete'] = 0;
        $count = DB::name('AuthRule')->where($map)->count();
        $parent = Db::name('AuthRule')->where(['id'=>$pid])->find();
        $list = DB::name('AuthRule')->where($map)->order('sort asc')->paginate(10,false);
        $this->assign(['list' => $list,'count'=>$count,'parent'=>$parent]);
        $url =$_SERVER['REQUEST_URI'];
        session('url',$url);
        return $this->fetch();
    }
    /*
     * 编辑规则
     */
    public function editRule(){
        $id = input('id');
        if(Request::instance()->isPost()){
            $data = Request::instance()->post(false); // 获取所有的post变量（原始数组）
            $rule = [
                'title'      => 'require',
                'name'       => 'require',
            ];
            $message = [
                'title.require' => '规则名必须填写',
                'name.require'     => '节点名称必须填写',
            ];
            $validate = new Validate($rule,$message);
            $result = $validate->check($data);
            if(!$result)            error($validate->getError());

            $obj		= Db::name('AuthRule');
            $name = $data['name'];
            $arr = explode('/',$name);
            if (empty($id)){
                $last_id = $obj->insertGetId($data);
                $sort = $last_id;
                $result = $obj->where(['id'=>$last_id])->update(['type'=>$arr[0],'sort'=>$sort]);
                $action	= '添加';
            } else {
                $data['type'] = $arr[0];
                $obj->where(['id'=>$id])->update($data);
                $action		= '编辑';
            }
            if ($result !==false){
                $url = session('url');
                success(array('info'=>$action.'规则成功','url'=>$url));
            }else{
               error($action.'操作失败');
            }

            return ;
        } else {
            $authRule = DB::name('AuthRule');
            !empty($id) && $this->assign('d', $authRule->find($id));
            // 获取所有模块儿
            $blocks	= $authRule->where(['pid'=>'0','status'=>'1'])->order("sort asc")->select();
            $this->assign('blocks', $blocks);
            return $this->fetch();
        }
    }
    /*
     * 分组规则
     */
    public function authGroup(){
        $list = DB::name('AuthGroup')->select();
        $count = DB::name('AuthGroup')->count();
        foreach ($list as $key=>$val){
            $list[$key]['rules'] = DB::name('AuthRule')->where('id','in', $val['rules'])->select();
        }
        $this->assign(['list'=>$list,'count'=>$count]);
        $url =$_SERVER['REQUEST_URI'];
        session('url',$url);
        return $this->fetch();
    }
    /**
     * @管理员列表
     */
    public function administer(){
        !empty($_GET['username'])	&&	$map['a.name'] = ['like','%'.I('username').'%'];
        $count = DB::name('system_member')->alias('a')
            ->join('__AUTH_GROUP_ACCESS__ b', 'a.id=b.uid','LEFT')
            ->join('__AUTH_GROUP__ c', 'b.group_id=c.id','LEFT')->count();
        $list = DB::name('system_member')->alias('a')
            ->field('a.id,a.username,a.realname,a.last_login_date,a.last_login_ip,a.login_times,a.status,c.id as gid,c.title')
            ->join('__AUTH_GROUP_ACCESS__ b','a.id=b.uid','LEFT')
            ->join('__AUTH_GROUP__ c','b.group_id=c.id','LEFT')
            ->order('a.status desc')
            ->paginate(10,false);
        $this->assign(['list'=>$list,'count'=>$count]);
        $url =$_SERVER['REQUEST_URI'];
        session('url',$url);
        return $this->fetch();
    }
    /**
     * 修改或添加管理员用户
     */
    public function editAdminister(){
        if (Request::instance()->isPost()) {
            $params = Request::instance()->param();
            $validate  = validate('SysMember');
            $data["username"] = $params["username"];
            $data["realname"] = $params["realname"];
            $data["status"] = $params["status"];
            if (!empty($params['password'])) $data["password"] = my_encrypt($params["password"]);
            if (empty($params['id'])){
                if(!$validate->check($data)){
                    success(['status'=>'error','info'=>$validate->getError()]);
                }
                if(empty($params["gid"])){
                   success(['status'=>'error','info'=>"请选择用户权限分组"]);
                }
                $group['uid'] = DB::name('system_member')->allowField(true)->insertGetId($data);
                $group["group_id"]= $params["gid"];
                $res = DB::name('AuthGroupAccess')->insert($group);
                $action = '添加';
            } else {
                $data["id"] = $params["id"];
                if(!$validate->scene("edit")->check($data)){
                    success(['status'=>'error','info'=>$validate->getError()]);
                }
                //var_dump(!empty($params["password"]));exit;
                if(!empty($params["password"])){
                    $data["password"] = my_encrypt($params["password"]);
                }

                $where['id']	= input("id");
                if(empty($params["gid"])){
                    success(['status'=>'error','info'=>"请选择用户权限分组"]);
                }
                $res = DB::name('system_member')->where("id",$params["id"])->update($data);
                DB::name('AuthGroupAccess')->where('uid',$params["id"])->update(['group_id'=>$params["gid"]]);
                $action = '修改';
            }
            if ($res !==false){
                success(['status'=>'ok','info'=>$action.'管理员成功', 'url'=>url('auth/administer')]);
            } else {
                success(['status'=>'error','info'=>$action.'管理员失败']);
            }
        } else {
            $map['a.id'] = input('id');
            if (!empty($map)){
                $data = DB::name('system_member')->alias('a')
                    ->field('a.*,b.group_id')
                    ->join('th_auth_group_access b','a.id = b.uid')
                    ->where($map)->find();
                $this->assign('d',$data);
            }
            $groups = DB::name('AuthGroup')->where(['status'=>'1'])->select();
            $this->assign('groups', $groups);
            return $this->fetch();
        }
    }

    /**
     * @修改添加管理规则
     */
    public function editAuthGroup(){
        if (Request::instance()->isPost()){
            $data['title']	= input('title');
            $data['status']	= input('status');
            $data['rules']	= input('rules');
            if (empty($data['title'])){
                success(['status'=>'error', 'info'=>'分组规则名称不能为空']);
            }
            if (empty($data['rules'])){
                success(['status'=>'error', 'info'=>'规则列表不能为空']);
            }
            $map['id']		= input('id');
            if (empty($map['id'])){
                $res = DB::name('AuthGroup')->insert($data);
            } else {
                $res = DB::name('AuthGroup')->where($map)->update($data);
            }

            if ($res) {
                success(['status'=>'ok','info'=>'编辑规则分组成功','url'=>url('auth/authGroup')]);
            } else {
                success(['status'=>'error','info'=>'编辑规则分组失败']);
            }

        } else {
            $map['id'] = input('id');
            if (!empty($map['id'])) {
                $data = DB::name('AuthGroup')->where($map)->find();
                $this->assign('d',$data);
            }
            $rules = array();
            if($data){
                $rules = explode(',', $data['rules']);
            }

            $auth_rule_model = DB::name('AuthRule');
            $list = $auth_rule_model->where(['status'=>1])
                                    ->where('pid','gt',0)
                                    ->order("sort desc")
                                    ->select();
            $one_list = $auth_rule_model->where(['status'=>1, 'pid'=>0])->order("sort desc")->select();
            foreach($one_list as &$val){
                $val['son'] = array();
                foreach($list as $k => $v1){
                    if($v1['pid'] == $val['id']){
                        $val['son'][$k] = $v1;
                        $val['son'][$k]['son'] = array();
                        foreach($list as $v2){
                            if($v2['pid'] == $v1['id']){
                                $val['son'][$k]['son'][] = $v2;
                            }
                        }
                    }
                }
            }
            $this->assign(['rules'=>$rules,'list'=>$one_list]);
            return $this->fetch();
        }
    }
    /**
     * 分组权限列表
     */
    public function editGroupRule(){
        $auth_rule_model = DB::name('AuthRule');
        $count = $auth_rule_model->where(['status'=>1])->count();
        $list = $auth_rule_model->where(['pid'=>['gt',0],'status'=>1])->select();
        $one_list = $auth_rule_model->where(['pid'=>0,'status'=>1])->select();
        $data = array();
        foreach($one_list as $val){
            $data[] = $val;
            foreach($list as $v1){
                if($v1['pid'] == $val['id']){
                    $data[] = $v1;
                    foreach($list as $v2){
                        if($v2['pid'] == $v1['id']){
                            $data[] = $v2;
                        }
                    }
                }
            }
        }
        $this->assign(['list'=>$data,'count'=>$count]);

        $id	= input('id');
        $rule = DB::name("AuthGroup")->field("rules")->find($id);
        $this->assign('rules', $rule['rules']);
        $this->view->engine->layout(false);
        return $this->fetch();
    }

    // 删除节点
    public function delRule(){
        $ids = input('ids');
        $map['id'] = ['in',$ids];
        $res = Db::name('AuthRule')->where($map)->update(['is_delete'=>1]);
        if ($res){
            echo json_encode(['status'=>'ok','info'=>'删除成功']);
        } else {
            echo json_encode(['status'=>'error','info'=>'删除失败,请稍后再试']);
        }

        return;
    }

    /**
     *删除分组
     */
    public function del_group(){
        $id = input('ids');
        $data['id'] = array('in',$id);
        $result = DB::name('AuthGroup')->where($data)->delete();
        if($result){
            echo json_encode(['status'=>"ok",'info'=>'删除记录成功!','url'=>session('url')]);
        }else{
            echo json_encode(['status'=>"error",'info'=>'删除记录失败!']);
        }
    }
    /**
     * 删除用户,包括分组
     */
    public function delUser(){
        $id = input('ids');
        if (empty($id)){
            success(['code'=>'400','msg'=>'参数获取失败']);
        }
        $map['id'] = ['in',$id];
        Db::startTrans();
        $res1 = DB::name('system_member')->where($map)->delete();
        $res2 = DB::name('AuthGroupAccess')->where(['uid'=>['in',$id]])->delete();
        if($res1 && $res2){
            DB::commit();
            success(['status'=>'ok','info'=>'删除用户成功','url'=>session('url')]);
        } else {
            DB::rollback();
            success(['status'=>'error','info'=>'删除用户失败']);
        }
    }

    /**
     *@上移排序
     */
    public function plus_rule_sort(){
        if(Request::instance()->isAjax()){
            $id = input('id');
            $pid = input('pid');
            $pid  ?  $map['pid'] = $pid : $map['pid'] = 0;
            $check = Db::name('auth_rule')->where(['id'=>$id])->find();
            $map['sort'] = ['lt',$check['sort']];
            $map['is_delete'] = '0';

            $last = Db::name('auth_rule')->where($map)
                ->order("sort desc")->limit(1)->select();
            if(empty($last)){
                error('不能移动');
            }else{
                $sort = $last[0]['sort'];
                $result = Db::name('auth_rule')->where(['id'=>$id])->update(['sort'=>$sort]);
                Db::name('auth_rule')->where(['id'=>$last[0]['id']])->update(['sort'=>$check['sort']]);
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
    public function minus_rule_sort(){
        if(Request::instance()->isAjax()){
            $id = input('id');
            $pid = input('pid');
            $pid  ?  $map['pid'] = $pid : $map['pid'] = 0;
            $check = Db::name('auth_rule')->where(['id'=>$id])->find();
            $map['sort'] = ['gt',$check['sort']];
            $map['is_delete'] = '0';

            $last = Db::name('auth_rule')->where($map)
                ->order("sort asc")->limit(1)->select();
            if(empty($last)){
                error('不能移动');
            }else{
                $sort = $last[0]['sort'];
                $result = Db::name('auth_rule')->where(['id'=>$id])->update(['sort'=>$sort]);
                Db::name('auth_rule')->where(['id'=>$last[0]['id']])->update(['sort'=>$check['sort']]);
            }
            if($result){
                success('操作成功');
            }else{
                error('操作失败');
            }
        }
    }

    /**
     *@上架信息
     */
    public function change_rule_status(){
        if(Request::instance()->isAjax()){
            $id = input('id');
            $status = Db::name('auth_rule')->where(['id'=>$id])->value('status');
            $abs = 3 - $status;
            $arr = ['1','2'];
            $result = Db::name('auth_rule')->where(['id'=>$id])->update(['status'=>$abs]);
            if($result){
                success($arr[2-$status]);
            }else{
                error('切换状态失败');
            }
        }
    }

}