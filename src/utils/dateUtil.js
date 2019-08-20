/**
 * ____            _                ____            _                  _   _          _     
 *|  _ \ _ __ ___ | |_ ___  _ __   |  _ \ _ __ ___ | |_ ___   ___ ___ | | | |    __ _| |__  
 *| |_) | '__/ _ \| __/ _ \| '_ \  | |_) | '__/ _ \| __/ _ \ / __/ _ \| | | |   / _` | '_ \ 
 *|  __/| | | (_) | || (_) | | | | |  __/| | | (_) | || (_) | (_| (_) | | | |__| (_| | |_) |
 *|_|   |_|  \___/ \__\___/|_| |_| |_|   |_|  \___/ \__\___/ \___\___/|_| |_____\__,_|_.__/ 
 * 
 * Copyright (c) 2019 PPL,proton-team
 * E-mail : developer-team@proton.one
 * https://github.com/sofanetwork/d-ui
 *
 */
function dateUtil(){}

//(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符
//年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
//(new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
dateUtil.format = function(date, format) {
  var o = {
	"M+": date.getMonth() + 1,
	"d+": date.getDate(),
	"h+": date.getHours(),
	"m+": date.getMinutes(),
	"s+": date.getSeconds(),
	"q+": Math.floor((date.getMonth() + 3) / 3),
	"S": date.getMilliseconds()
  }

  if (/(y+)/.test(format)) {
	format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }

  for (var k in o) {
	if (new RegExp("(" + k + ")").test(format)) {
		format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
	}
  }

  return format;
}

module.exports = dateUtil;


