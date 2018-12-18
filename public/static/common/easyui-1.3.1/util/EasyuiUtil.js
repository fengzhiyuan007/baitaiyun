$.fn.tree.defaults.loadFilter = function(data, parent) {
	var opt = $(this).data().tree.options;
	var idField, textField, parentField;
	if (opt.parentField) {
		idField = opt.idField || 'id';
		textField = opt.textField || 'text';
		parentField = opt.parentField;
		var i, l, treeData = [], tmpMap = [];
		for (i = 0, l = data.length; i < l; i++) {
			tmpMap[data[i][idField]] = data[i];
		}
		for (i = 0, l = data.length; i < l; i++) {
			if (tmpMap[data[i][parentField]]
					&& data[i][idField] != data[i][parentField]) {
				if (!tmpMap[data[i][parentField]]['children'])
					tmpMap[data[i][parentField]]['children'] = [];
				data[i]['text'] = data[i][textField];
				tmpMap[data[i][parentField]]['children'].push(data[i]);
			} else {
				data[i]['text'] = data[i][textField];
				treeData.push(data[i]);
			}
		}
		return treeData;
	}
	return data;
};

/**
 * @author 孙宇
 * 
 * @requires jQuery,EasyUI
 * 
 * 扩展treegrid，使其支持平滑数据格式
 */
$.fn.treegrid.defaults.loadFilter = function(data, parentId) {
	var opt = $(this).data().treegrid.options;
	var idField, textField, parentField;
	if (opt.parentField) {
		idField = opt.idField || 'id';
		textField = opt.treeField || 'text';
		parentField = opt.parentField;
		var i, l, treeData = [], tmpMap = [];
		for (i = 0, l = data.length; i < l; i++) {
			tmpMap[data[i][idField]] = data[i];
		}
		for (i = 0, l = data.length; i < l; i++) {
			if (tmpMap[data[i][parentField]]
					&& data[i][idField] != data[i][parentField]) {
				if (!tmpMap[data[i][parentField]]['children'])
					tmpMap[data[i][parentField]]['children'] = [];
				data[i]['text'] = data[i][textField];
				tmpMap[data[i][parentField]]['children'].push(data[i]);
			} else {
				data[i]['text'] = data[i][textField];
				treeData.push(data[i]);
			}
		}
		return treeData;
	}
	return data;
};
/**
 * @author 孙宇
 * 
 * @requires jQuery,EasyUI
 * 
 * 扩展combotree，使其支持平滑数据格式
 */
$.fn.combotree.defaults.loadFilter = $.fn.tree.defaults.loadFilter;

/**
 * 显示提示
 * 
 * @param {}
 *            title
 * @param {}
 *            msg
 * @param {}
 *            isAlert
 */
function showMsg(title, msg, isAlert) {
	if (isAlert !== undefined && isAlert) {
		$.messager.alert(title, msg, 'info');
	} else {
		$.messager.show({
					title : title,
					msg : msg,
					showType : 'show'
				});
	}
};
/**
 * 显示一个确认对话框
 * 
 * @param {显示在窗口头部的文本}
 *            title
 * @param {显示在窗口中的文本}
 *            msg
 * @param {callback(b)回调函数，当用户点击确认按钮时，传递一个true值给回调函数，否则传递一个false值}
 *            callback
 */
function showConfirm(title, msg, callback) {
	$.messager.confirm(title,msg,function(r){
		if(r){
			if($.isFunction(callback)){
				callback.call();
			}
		}
	});
}
/**
 * 显示进度
 * 
 * @param {}
 *            isShow
 * @param {}
 *            title
 * @param {}
 *            msg
 */
function showProcess(isShow, title, msg) {
	if (!isShow) {
		$.messager.progress('close');
		return;
	}
	var win = $.messager.progress({
				title : title,
				msg : msg
			});
};
/**
 * ValidateBox 验证规则：密码确认 使用方式：validType="equals['#pwd']"
 */
$.extend($.fn.validatebox.defaults.rules, {
	equals : {
		validator : function(value, param) {
			return value == $(param[0]).val();
		},
		message : '\u786E\u8BA4\u5BC6\u7801\u4E0D\u4E00\u81F4\uFF0C\u8BF7\u91CD\u65B0\u8F93\u5165\u786E\u8BA4\u5BC6\u7801\uFF01'
	}
});
