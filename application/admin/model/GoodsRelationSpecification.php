<?php
/**
 * Created by PhpStorm.
 * User: ljy
 * Date: 17/10/27
 * Time: 下午3:22
 */

namespace app\admin\model;


class GoodsRelationSpecification extends Common
{
    public function updateAllSpecification($data){

        $result = $this->saveAll($data);
        return $result;
    }
}