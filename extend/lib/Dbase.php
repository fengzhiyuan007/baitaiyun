<?php
namespace lib;
class Dbase{
    //获取表的名称
    function list_tables($database)
    {
        $rs = mysql_list_tables($database);
        $tables = array();
        while ($row = mysql_fetch_row($rs)) {
            $tables[] = $row[0];
        }
        mysql_free_result($rs);
        return $tables;
    }
    //导出数据库
    function dump_table($table, $fp = null)
    {
        $need_close = false;
        if (is_null($fp)) {
            $fp = fopen($table . '.sql', 'w');
            $need_close = true;
        }
        $a  = mysql_query("show create table `{$table}`");
        $row = mysql_fetch_assoc($a);fwrite($fp,$row['Create Table'].';');//导出表结构
        $rs = mysql_query("SELECT * FROM `{$table}`");
        while ($row = mysql_fetch_row($rs)) {
            fwrite($fp, $this->get_insert_sql($table, $row));
        }
        mysql_free_result($rs);
        if ($need_close) {
            fclose($fp);
        }
    }

    //导出表数据
    function get_insert_sql($table, $row)
    {
        $sql = "INSERT INTO `{$table}` VALUES (";
        $values = array();
        foreach ($row as $value) {
            $values[] = "'" . mysql_real_escape_string($value) . "'";
        }
        $sql .= implode(', ', $values) . ");";
        return $sql;
    }
}
