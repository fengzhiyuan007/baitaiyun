<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/11/15
 * Time: 下午5:52
 */

namespace app\admin\model;


class Aboutus extends Common
{
    public function edit($data){
        $validate = validate('Aboutus');
        $valid = $validate->check($data, '');
        if (!$valid) {
            return error($validate->getError());
        }
        $result = $this->allowField(true)->save($data,['id'=>'1']);
        return $result;
    }
}