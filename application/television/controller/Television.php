<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/12/15
 * Time: 上午10:46
 */

namespace app\television\controller;

use think\Request;
use think\Db;
use think\Session;
class Television extends Base
{
    public function relation(){
        $tv = $this->television;
        $tv = Db::name('television')->where(['tv_id'=>$tv['member_id']])->find();
        $num = 10;
        $type = input('type');
        if(!$type)          $type = 1;
        switch ($type){
            case 1://区市省关系
                $map['a.is_del'] = '1';
                $map['a.tv_type'] = '3';
                !empty($username) && $map['a.username|b.username|c.username'] = ['like','%'.$username.'%'];
                $map['a.tv_id|b.tv_id|c.tv_id'] = $tv['tv_id'];
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
                $map['b.tv_id|c.tv_id'] = $tv['tv_id'];
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
                $map['a.tv_id'] = $tv['tv_id'];
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
                $map['a.tv_id|b.tv_id|c.tv_id'] = $tv['tv_id'];
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
        $this->assign(['list'=>$list,'count'=>$count,'type'=>$type,'tv'=>$tv]);
        return $this->fetch();
    }
}