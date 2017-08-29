$(function () {
	//获取用户ID
	var userMessage = sessionStorage.userMessage;
	if (userMessage) {
		userMessage = JSON.parse(userMessage);
		var username = userMessage[0].ID;
	} else {
		window.location = '../../index.html';
	}
	//当前选择的版本ID，教材ID ,选择的章节
	var textbook_id, chapter_id, version_id;
	var type, typeStr, textbook_name, version_name, chapter_name;
	//audio播放路径
	var audioPlayerSrc;
	//本章所有的单词
	var wordsArr, wordArrlength;

	textbook_id = sessionStorage.textbook_id;
	version_id = sessionStorage.version_id;
	chapter_id = sessionStorage.chapter_id;
	typeStr = sessionStorage.typeStr;
	textbook_name = sessionStorage.textbook_name;
	version_name = sessionStorage.version_name;
	chapter_name = sessionStorage.chapter_name;
	type = sessionStorage.type;

	var top = new Vue({
		el: "#top",
		data: {
			textbook_name: textbook_name,
			version_name: version_name,
			typeStr: typeStr,
			minute: 5,
			second: 0
		}
	})

	$.getUrlParam = function (name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) return decodeURI(r[2]);
		return null;
	};
	var testType = $.getUrlParam('testType');
	var typeMethod;
	switch (testType) {
		case '1':
			typeMethod = 'LearnTest';
			console.log('已学测试');
			//获取所有单词
			fnGetAllTheWords();
			break;
		case '2':
			typeMethod = 'NewWordTest';
			console.log('生词测试');
			//获取所有单词
			fnGetAllTheWords();
			break;
		case '3':
			typeMethod = 'OldWordTest';
			console.log('熟词测试');
			//获取所有单词
			fnGetAllTheWords();
			break;
		case 'review':
			$('title').html('智能听写测试复习');
			//本次是测试复习，载入测试复习的内容
			fnGetAllTestWords();

		default:
			typeMethod = 'LearnTest';
			break;
	}

	document.onkeyup = function (event) {
		var e = event || window.event || arguments.callee.caller.arguments[0];
		if (e && e.keyCode == 17) {
			// $("#voice").trigger('click');
			fnplayer();
		}
	};

	var contentUl = new Vue({
		el: "#contentUl",
		data: {
			items: ''
		},
		methods: {
			fnListenInput:fnplayer
		}
	})

	function fnplayer(audioSrc) {
		if(audioSrc){
			audioPlayerSrc = thisUrl2 + audioSrc;
		}
		$("#audioplay").attr('src', audioPlayerSrc);
	}

	//倒计时
	function fnsetInterval() {
		var onlyTime = 300;
		var onlyminute, onlysecond;
		var timer = setInterval(function () {
			onlyTime--;
			onlyminute = parseInt(onlyTime / 60);
			onlysecond = onlyTime % 60;

			top.minute = onlyminute;
			top.second = onlysecond;

			if (onlyTime <= 0) {
				clearInterval(timer);
				$("#alertBox").show().find('h4').text('倒计时结束，显示测试分数');
				$('#btnOk').on('click',function(){
					$("#alertBox").hide();
					$("#commit").trigger("click");
				});
			};
		}, 1000);
	}

	//获取本章所有的单词
	function fnGetAllTheWords() {
		//显示正在加载的图标
		$('body').loading({
			loadingWidth: 120,
			title: '',
			name: 'test',
			discription: '加载中，请稍候：）',
			direction: 'column',
			type: 'origin',
			// originBg:'#71EA71',
			originDivWidth: 40,
			originDivHeight: 40,
			originWidth: 6,
			originHeight: 6,
			smallLoading: false,
			loadingMaskBg: 'rgba(0,0,0,0.2)'
		});

		var type_id = type.substr(-1);

		$.ajax({
			type: "POST",
			url: thisUrl2 + '/Areas/Api/Index.ashx',
			dataType: "json",
			data: {
				method: typeMethod,
				user_id: username,
				textbook_id: textbook_id,
				type_id: type_id
			},
			success: function (data) {
				wordsArr = data;
				wordArrlength = wordsArr.length;
				fnshowtopic(wordsArr);
			}
		});
	}

	//复习测试获取当前教材的所有单词
	function fnGetAllTestWords() {
		$('body').loading({
			loadingWidth: 120,
			title: '',
			name: 'test',
			discription: '加载中，请稍候：）',
			direction: 'column',
			type: 'origin',
			// originBg:'#71EA71',
			originDivWidth: 40,
			originDivHeight: 40,
			originWidth: 6,
			originHeight: 6,
			smallLoading: false,
			loadingMaskBg: 'rgba(0,0,0,0.2)'
		});

		var type_id = type.substr(-1);
		$.ajax({
			type: "POST",
			url: thisUrl + '/Areas/Api/Interface.ashx',
			dataType: "json",
			data: {
				method: 'TestReview',
				user_id: username,
				textbookid: textbook_id,
				wordtype: type_id
			},
			success: function (data) {
				wordsArr = data;
				wordArrlength = wordsArr.length;
				fnshowtopic(wordsArr);
			}
		});
	}

	//点击交卷按钮
	var scoreNum = 0;
	var correctArr;
	$("#commit").on("click", function () {
		correctArr = [];
		var liArr = $("#contentUl input.line");
		$.each(liArr, function (index, element) {
			var status;
			if (element.value == element.id) {
				status = 0;
				scoreNum++;
			} else {
				status = 1;
			}

			var newObj = {
				id: index,
				status: status,
				word_name: element.id,
				word_mean: element.dataset.mean,
				myValue: element.value
			}
			correctArr.push(newObj);
		});
		sessionStorage.correctArr = JSON.stringify(correctArr);
		var thisScore = Math.round((scoreNum / liArr.length) * 100);
		//得到分数，并发送
		if (testType == 'review') {
			window.location = "../../html/testCenter/word_score2.html?score=" + thisScore;
		} else {
			fnsavethisScore(thisScore, liArr.length);
		}
	})

	function fnshowtopic(wordsArr_) {
		contentUl.items = wordsArr_;
		//关闭loading插件
		removeLoading('test');
		//加载完成之后开启倒计时
		fnsetInterval();
	}

	//发送成绩
	function fnsavethisScore(thisScore_, length) {
		var testsType = typeStr + "测试中心(" + version_name + '-' + textbook_name + ")";
		// console.log(testsType);
		$.ajax({
			type: "POST",
			url: thisUrl2 + '/Areas/Api/index.ashx',
			dataType: "json",
			data: {
				method: "SaveTestRecord",
				user_id: username,
				textbook_id: textbook_id,
				test_type: testsType,
				test_score: thisScore_,
				test_number: length
			},
			success: function (data) {
				if (data.msg == "保存成功") {
					window.location = "../../html/testCenter/word_score2.html?score=" + thisScore_;
				} else {
					$("#alertBox").show().find('h4').text('成绩上传失败，请重试');
					$('#btnOk').on('click',function(){
						$("#alertBox").hide();
					});
				}
			}
		});
	}

})