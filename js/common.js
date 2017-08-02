//本地地址
var thisUrl = 'http://192.168.2.127:8090';

//var thisUrl2 = 'http://192.168.2.111:8015';
var thisUrl2 = 'http://192.168.2.127:8090';

//var thisUrl = 'http://106.14.64.236:8012';
//var thisUrl2 = 'http://106.14.64.236:8012';
//服务器地址
var serverUrl = '';
//若页面内存在ID为studyTime的标签，则运行倒计时函数
var studyTime = document.getElementById('studyTime');
if (studyTime) {
	timer(studyTime);
}
//若页面内存在ID为enter的表现，则点击回车按钮时模拟该标签的点击事件
var enter = document.getElementById('enter');
if (enter) {
	enter_key();
}

//dot模版函数
function fnupdateDoT(data_, boxId, temId) {
	// 1. 编译模板函数
	var tempFn = doT.template(temId.innerHTML);
	// 2. 多次使用模板函数
	var resultText = tempFn(data_);
	boxId.innerHTML = resultText;
}

function enter_key(callback) {
	document.onkeyup = function (event) {
		var e = event || window.event || arguments.callee.caller.arguments[0];
		if (e && e.keyCode == 13) {
			$("#enter").trigger('click');
		}
	};
}

function timer(selector) {
	// 设置学习时长
	var oldTime = Date.now();
	setInterval(function () {
		// 获取学习总毫秒数
		var durationTime = Date.now() - oldTime;
		// 转化为时，分，秒
		var h = parseInt(durationTime / 1000 / 60 / 60);
		var m = parseInt(durationTime / 1000 / 60 % 60);
		var s = parseInt(durationTime / 1000 % 60);
		h = h < 10 ? '0' + h : h;
		m = m < 10 ? '0' + m : m;
		s = s < 10 ? '0' + s : s;
		selector.innerText = '学习时长：' + h + ' : ' + m + ' : ' + s;
	}, 1000);
}