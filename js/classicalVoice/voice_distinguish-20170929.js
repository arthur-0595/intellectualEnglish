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
	//当前语音文件播放路径
	var audioplay = $("#audioplay");
	var audioplaySrc;
	//是辩音还是其他类别:1辩音，0其他
	var issound = 1;
	//本次智能辩音的单词数组
	var letterArr = [],
		letterArrLength,
		letterArrNum = 0;
	//用来计数的变量，记录Li的点击个数，到达第六个则判定正确与否
	var numLi = 0;

	textbook_id = sessionStorage.textbook_id;
	version_id = sessionStorage.version_id;
	chapter_id = sessionStorage.chapter_id;
	typeStr = sessionStorage.typeStr;
	textbook_name = sessionStorage.textbook_name;
	version_name = sessionStorage.version_name;
	chapter_name = sessionStorage.chapter_name;

	//type作为区分类别的变量
	var type = 2;
	if (chapter_name == '学前测试') {
		type = 1;
	} else if (chapter_name == '学后测试') {
		type = 3;
	}

	var titleBox = new Vue({
		el: "#titleBox",
		data: {
			textbook_name: textbook_name,
			version_name: version_name,
			chapter_name: chapter_name
		}
	});
	$("#listening").on('click', function () {
		audioplay.attr('src', audioplaySrc);
	});

	$("#btnsOk").on('click' , function(){
		window.location="../../html/classicalVoice/letterRead.html";
	});

	//获取本次智能辩音的单词
	fnGetTheWords();

	function fnGetTheWords() {
		$.ajax({
			type: "GET",
			url: thisUrl + "/Areas/api/Interface.ashx",
			data: {
				method: 'voicetest',
				type_id: textbook_id,
				voice_id: chapter_id,
				type: type,
				issound: issound
			},
			dataType: "json",
			success: function (data) {
				console.log(data);
				letterArr = data;
				letterArrLength = data.length;

				//加载第一个单词
				fnUpdateTheWord(letterArr[letterArrNum]);
			}
		});
	}

	function fnUpdateTheWord(arr_) {
		numLi = 0;
		$("#items li").attr('class' , 'unenter');
		$("#answerArr span").attr('class', 'ans_null').html('');
		$("#enter").attr('class' , 'enter actived');

		$("#thisSentence_con").html(arr_.letter);
		audioplaySrc = thisUrl + arr_.letter_url;
		audioplay.attr('src', audioplaySrc);

		var html_ = '';
		for (var i = 0; i < arr_.more.length; i++) {
			var element = arr_.more[i];
			html_ += `<li class="unenter" id="${element.letter}" data-url="${thisUrl + element.letter_url}" data-state="${element.state}">${element.letter}</li>`;
		}
		$("#items").html(html_);
		fnLiClick();
	}
	//点击每个li
	function fnLiClick() {
		$("#items li").off().on('click', function () {
			numLi++;
			console.log(numLi);
			if (numLi < 6) {
				fnclickItem(this.dataset.state, this.innerHTML, this.dataset.url, this);
			} else {
				fnclickItem(this.dataset.state, this.innerHTML, this.dataset.url, this);
				$("#enter").removeClass('actived');
				//判断对错
				fnjudge();
				$("#items li.unenter").off().attr('class', 'enter');
			}
		});
	}
	//li的点击事件fnclickItem
	function fnclickItem(state_, thisword_, url_, thisLi) {
		$(thisLi).attr('class', 'actived').off('click');
		$("#answerArr span.ans_null").first().html(thisword_).attr({
			'class': 'ans_word',
			'data-state': state_
		});

		audioplay.attr('src', url_);
		fnSpanwordClick();
	};
	//点击每个span
	function fnSpanwordClick() {
		$("#answerArr span.ans_word").off().on('click', function () {
			var thisInnerHtml = this.innerHTML;
			$(this).attr('class', 'ans_null').html('');
			numLi--;
			console.log(numLi);

			var itemsLi = $("#items li");
			$.each(itemsLi, function (index, element) {
				if (element.innerHTML == thisInnerHtml) {
					$(element).attr('class', 'unenter');
				};
			});
			fnLiClick();
		});
	}

	//判断对错
	function fnjudge() {
		var correctNum = 0;
		var spanWord = $("#answerArr span.ans_word");
		$.each(spanWord, function (index, element) {
			if (element.dataset.state == 1) {
				correctNum++;
			}
		});

		$("span[data-state=1]").attr('class', 'ans_word correct');
		$("span[data-state=0]").attr('class', 'ans_word error');
		spanWord.off();

		$("#enter").off().on('click', function () {
			fnclickEnter(correctNum);
		});
	}

	function fnclickEnter(num_) {
		console.log(num_);
		if (num_ == 6) { //说明全队，则跳转下一题
			letterArrNum++;
		}
		if(letterArrNum < letterArrLength){
			fnUpdateTheWord(letterArr[letterArrNum]);
		}else{
			$("#masking").show();
		}
	}

})