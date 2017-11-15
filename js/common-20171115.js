//本地地址
// var thisUrl = 'http://192.168.2.127:8090';

// var thisUrl2 = 'http://192.168.2.111:8015';
// var thisUrl2 = 'http://192.168.2.127:8090';

var thisUrl = 'http://106.15.91.62:8012';
var thisUrl2 = 'http://106.15.91.62:8012';

//服务器地址
var serverUrl = '';
//若页面内存在ID为studyTime的标签，则运行倒计时函数
var studyTime = document.getElementById('studyTime');
if(studyTime) {
	timer(studyTime);
}
//若页面内存在ID为enter的表现，则点击回车按钮时模拟该标签的点击事件
var enter = document.getElementById('enter');
if(enter) {
	enter_key();
}
//禁用粘贴功能
// (function () {
// 	var inputAll = document.getElementsByTagName('input');
// 	for (var i = 0; i < inputAll.length; i++) {
// 		var element = inputAll[i];
// 		element.onpaste = function () {
// 			return false;
// 		}
// 	}
// })();
$(":input").attr('onpaste', 'return false');

//禁用鼠标右键事件
window.oncontextmenu = function() {
	return false;
}

//dot模版函数
function fnupdateDoT(data_, boxId, temId) {
	// 1. 编译模板函数
	var tempFn = doT.template(temId.innerHTML);
	// 2. 多次使用模板函数
	var resultText = tempFn(data_);
	boxId.innerHTML = resultText;
}

//enter键盘按键代号13，Ctrl为17，Shift为16
function enter_key(callback) {
	document.onkeyup = function(event) {
		var e = event || window.event || arguments.callee.caller.arguments[0];
		if(e && e.keyCode == 13) {
			$("#enter").trigger('click');
		}
	};
}

function timer(selector) {
	// 设置学习时长
	var oldTime = Date.now();
	setInterval(function() {
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

function fnWindowClose() {
	var _t;
	window.onbeforeunload = function() {
		setTimeout(function() {
			_t = setTimeout(onunloadcancel, 0)
		}, 0);
		fnupdateCloseWindow();
		return "真的离开?";
	}
	window.onunloadcancel = function() {
		clearTimeout(_t);
	}
};

//修改时间的函数
function fnupdateAllTime(login_all) {
	var hour = parseInt(login_all / 3600) < 10 ? ('0' + parseInt(login_all / 3600)) : parseInt(login_all / 3600);
	var minute = parseInt((login_all - (hour * 3600)) / 60) < 10 ? ('0' + parseInt((login_all - (hour * 3600)) / 60)) : parseInt((login_all - (hour * 3600)) / 60);
	var seconds = parseInt(login_all - (hour * 3600) - (minute * 60)) < 10 ? ('0' + parseInt(login_all - (hour * 3600) - (minute * 60))) : parseInt(login_all - (hour * 3600) - (minute * 60));

	var time = `${hour} : ${minute} : ${seconds}`;
	return time;
}

// 机器人 	
var robbotBox = document.getElementById('robbot');
if(robbotBox) {
	//获取用户名
	var userMessage = sessionStorage.userMessage;
	userMessage = JSON.parse(userMessage);
	var username = userMessage[0].ID;

	var isShow = false;
	$(document.body).on('click', function(event) {
		var target = event.target;
		if(!isShow) {
			if(target.id === 'robbotSpan') {
				robbotGetStudyTime();
				$('#dialog').animate({
					'left': '187px',
					'opacity': 1
				}, '2s');
				isShow = true;
			}
		} else {
			if(target.id !== 'dialog' && target.id !== 'todayStudyTime' && target.id !== 'todayWords' &&
				target.id !== 'todaySentences') {
				$('#dialog').animate({
					'left': '-187px',
					'opacity': 0
				}, '2s');
				isShow = false;
			}
		}
	});

	if($(document.body).width() >= 1200) {
		$('#robbot').css({
			'left': '16px',
			'bottom': '25%'
		});
	} else {
		$('#robbot').css({
			'left': '-195px',
			'bottom': '25%'
		});
	}
	$(window).resize(function() {
		var docWidth = $(document.body).width();
		if(docWidth >= 1200) {
			$('#robbot').css({
				'left': '16px',
				'bottom': '25%'
			});
		} else {
			$('#robbot').css({
				'left': '-195px',
				'bottom': '25%'
			});
		}
	});

	function robbotGetStudyTime() {
		$.ajax({
			type: 'GET',
			url: thisUrl + '/Areas/api/Interface.ashx',
			dataType: 'json',
			data: {
				method: 'robot',
				user_id: username
			},
			success: function(data) {
				var todayWords = data[0].study_words;
				var todaySentences = data[0].study_sentence;
				var thisStudyTime = Number(data[0].Login_today); // 转化为时分秒
				var h = parseInt(thisStudyTime / 60 / 60);
				var m = parseInt(thisStudyTime / 60 % 60);
				var s = thisStudyTime % 60;
				h = h < 10 ? "0" + h : h;
				m = m < 10 ? "0" + m : m;
				s = s < 10 ? "0" + s : s;
				$('#todayStudyTime').text('今日在线时长：' + h + '时' + m + '分' + s + '秒');
				$('#todayWords').text('今日已学单词：' + todayWords);
				$('#todaySentences').text('今日已学句子：' + todaySentences);
			}
		});
	}
}
//句子听力和句子翻译功能用来处理打乱的数组函数
function fnsenProcessor(arr) {
	// var reg = /^[A-z\'\-A-z]+$/;
	// var newArr = [];
	// for(var i = 0, len = arr.length; i < len; i++) {
	// 	if(reg.test(arr[i])) {
	// 		newArr.push(arr[i]);
	// 	}
	// }
	// return newArr;
	return arr;
}

// 学习结束弹框
function alertBox(text, location) {
	var el = document.getElementById('alertBox');
	var btnOk = document.getElementById('btnOk');
	var h4 = document.querySelector('.reminder>h4');
	el.style.display = "block";
	h4.innerText = text;
	btnOk.onclick = function() {
		window.location = location;
	}	
	//关闭loading插件
	removeLoading('test');
}

// 判断底部的出现位置
var footer = document.querySelector('footer');
if(footer){
	if(document.body.clientHeight > 840){
		footer.style.position = 'fixed';
		footer.style.left = 0;
		footer.style.bottom = 0;
		footer.style.lineHeight = '60px';
	}
}
function showFooter(){	
	if(footer){		
		window.onresize = function(){
			var bodyHeight = document.body.clientHeight;
			if( bodyHeight <= 840 ){
				footer.style.position = 'static';
			}else{
				footer.style.position = 'fixed';
				footer.style.left = 0;
				footer.style.bottom = 0;
				footer.style.lineHeight = '60px';
			}
		}
	}else{
		return;
	}
}
showFooter();

