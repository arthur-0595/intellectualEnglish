$(function() {
	//获取用户ID
	var userMessage = sessionStorage.userMessage;
	if(userMessage) {
		userMessage = JSON.parse(userMessage);
		var username = userMessage[0].ID;
	} else {
		window.location = '../index.html';
	}

	//当前选择的版本ID，教材ID ,选择的章节
	var textbook_id, chapter_id, version_id;
	var typeStr, textbook_name, version_name, chapter_name;
	//当前语音文件播放路径
	var audioplaySrc;
	//当前听写的单词或句子
	var thisListen;
	//定时器
	var timer;
	//当前类别所有的口语组成的数组，以及数组长度
	var spokenLanguageArr, spokenLanguageArrlength;
	//两次》一次》跳转
	var num = 2;
	//当前在第几个句子
	var thisListenNum = 0;
	//当前句子的ID
	var thisSenId;

	$.getUrlParam = function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if(r != null) return decodeURI(r[2]);
		return null;
	};
	//当前类别，1跟读2听力理解3口语表达
	var thisType = $.getUrlParam('thisType');

	textbook_id = sessionStorage.textbook_id;
	version_id = sessionStorage.version_id;
	chapter_id = sessionStorage.chapter_id;
	typeStr = sessionStorage.typeStr;
	textbook_name = sessionStorage.textbook_name;
	version_name = sessionStorage.version_name;
	chapter_name = sessionStorage.chapter_name;

	var titleBox = new Vue({
		el: "#titleBox",
		data: {
			textbook_name: textbook_name,
			version_name: version_name,
			chapter_name: chapter_name
		}
	})
	//获取当前要听写的单词
	fnupdateWord();
	//显示倒计时
	fnshowcountDown();

	//听语音按钮
	$("#voice").on("click", function() {
		$("#audioplay").attr("src", audioplaySrc);
	})

	function fnupdateWord() {
		$.ajax({
			type: "POST",
			url: thisUrl2 + "/Areas/Api/index.ashx",
			dataType: "json",
			data: {
				method: 'GetStartByWay',
				user_id: username,
				type_id: chapter_id,
				way_id: thisType
			},
			success: function(data) {
				console.log(data);
				if(data[0]) {
					spokenLanguageArr = data;
					spokenLanguageArrlength = data.length;

					fnshowthisWord(spokenLanguageArr[0]);
				}else{
					alert('学习完毕');
					window.close();
					// window.location='ver_tongue.html'
				}
			}
		});
	}
	//载入下一个句子
	function fnnextWords(status_) {
		//认识或不认识，发送对应的信息到后台
		if(status_ == 1) { //认识
			fnKnowor(status_)
		} else if(status_ == 2) { //不认识
			fnKnowor(status_)
		}
		thisListenNum++;
		if(thisListenNum < spokenLanguageArrlength) {
			//下面显示进度
			$("#thisStudy").html(`进度： ${thisListenNum+1}/${spokenLanguageArrlength}`);

			//显示认识或不认识
			$(".btns").hide();
			$("#theFirstTime").show();
			//显示倒计时
			fnshowcountDown();

			fnshowthisWord(spokenLanguageArr[thisListenNum]);
		} else {
			alert('学习完成');
			window.location='ver_tongue.html'
		}
	}
	//载入当前句子的内容
	function fnshowthisWord(obj_) {
		if(thisType == 2) {
			$("#thisWord").html(obj_.sentence);
			$("#answerh3").html(obj_.sentence_mean);
		} else if(thisType == 3) {
			$("#answerh3").html(obj_.sentence);
			$("#thisWord").html(obj_.sentence_mean);
		}
		audioplaySrc = thisUrl2 + obj_.sentence_url;
		$("#audioplay").attr('src', audioplaySrc);

		console.log(obj_.sentence_url);
		console.log(audioplaySrc);
		thisSenId = obj_.id;
	}
	//发送认识或者不认识的信息给后台
	function fnKnowor(knowOr_) {
		$.ajax({
			type: "POST",
			url: thisUrl2 + "/Areas/api/Index.ashx",
			dataType: 'json',
			data: {
				method: 'GetKnow',
				id: thisSenId,
				way_id: thisType,
				is_know: knowOr_
			},
			async: true,
			success: function(data) {
				console.log(data);
			}
		});
	}

	document.onkeyup = function (event) {
		var e = event || window.event || arguments.callee.caller.arguments[0];
		if (e && e.keyCode == 17) {
			$("#voice").trigger('click');
		}
	};

	//点击认识或不认识
	$("#theFirstTime>button").on('click', function(ev) {
		ev.stopPropagation();

		var index = $(this).index();
		if(index == 0) {
			$(".btns").hide();
			$("#secondTime").show();
			//关闭定时器直接显示翻译内容
			clearInterval(timer);
			$("#countDown").hide();
			$("#answer").show();

		} else {
			//关闭定时器直接显示翻译内容
			clearInterval(timer);
			$("#countDown").hide();
			$("#answer").show();

			fnshowstrengthenMemory();
		}
	})

	//点击是或否
	$("#secondTime>button").on("click", function(ev) {
		ev.stopPropagation();

		var index = $(this).index();
		if(index == 0) { //是
			clearInterval(timer);
			$("#countDown").hide();
			$("#answer").show();
			//进入下一个单词
			fnnextWords(1);
		} else { //否
			clearInterval(timer);
			$("#countDown").hide();
			$("#answer").show();

			fnshowstrengthenMemory();
		}
	})

	function fnshowstrengthenMemory() {
		$(".btns").hide();
		$("#strengthenMemory").show();
		//点击两次 》 一次 》 下一步
		num = 2;
		$("#ent_h").removeClass("ent_h").html(`${num}<sub>（跟着读两遍）</sub>`);
	}

	$("#strengthenMemory>button").on("click", function(ev) {
		var ev = ev || window.event;
		ev.cancelBubble = true;
		num--;
		if(num == 1) {
			$("#ent_h").html(`${num}<sub>（跟着读两遍）</sub>`);
			$("#audioplay").attr("src", audioplaySrc);
		} else if(num == 0) {
			$("#ent_h").addClass("ent_h").html(`<sub>（下一个）</sub>`);
			$("#audioplay").attr("src", audioplaySrc);
		} else if(num < 0) {
			//进入下一个单词
			fnnextWords(2);
		}
	})

	function fnshowcountDown() {
		var numT = 5;
		$("#countDownTime").html(numT);

		$("#countDown").show();
		$("#answer").hide();
		timer = setInterval(function() {
			numT--;
			$("#countDownTime").html(numT);

			if(numT <= 0) {
				clearInterval(timer);
				$("#countDown").hide();
				$("#answer").show();
			}
		}, 1000);
	}

})