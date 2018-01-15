$(function () {
	//获取用户ID
	var userMessage = sessionStorage.userMessage;
	if (userMessage) {
		userMessage = JSON.parse(userMessage);
		var username = userMessage[0].ID;
	} else {
		window.location = '../index.html';
	}
	//当前选择的版本ID，教材ID ,选择的章节
	var textbook_id, chapter_id, version_id;
	var type, typeStr, textbook_name, version_name, chapter_name;
	//当前语音文件播放路径
	var audioplaySrc;
	//当前听写的单词
	var thisListenWord;
	//当前听写的单词的ID和状态
	var thiswordId,
		thiswordState; //默认熟词，不为1则为生词
	//当前单词是不是一个以前听过的单词
	var thisNewOrOld = 0;//默认没听过
	//要测试的所有单词数组
	var wordArr, wordArrLength;
	var num = 0;
	//保存测试结果的数组
	var testsArr = [];
	//声明三个变量，生词熟词已经复习
	var newWordNum = 0,
		oldWordNum = 0,
		reviewWordNum = 0;

	var numEnt;
	//是否是学前测试
	var beforeLearning = 1;//默认不是学前测试
	//是否是直接进入测试
	var countTest = 0;//默认是未学习直接进入测试

	textbook_id = sessionStorage.textbook_id;
	version_id = sessionStorage.version_id;
	chapter_id = sessionStorage.chapter_id;
	typeStr = sessionStorage.typeStr;
	textbook_name = sessionStorage.textbook_name;
	version_name = sessionStorage.version_name;
	chapter_name = sessionStorage.chapter_name;
	type = sessionStorage.type;

	var titleBox = new Vue({
		el: "#titleBox",
		data: {
			textbook_name: textbook_name,
			version_name: version_name,
			chapter_name: chapter_name,
			typeStr: typeStr
		}
	})

	document.onkeyup = function (event) {
		var e = event || window.event || arguments.callee.caller.arguments[0];
		if (e && e.keyCode == 13) {
			$("#enter").trigger('click');
		} else if (e && e.keyCode == 17) {
			$("#voice").trigger('click');
		}
	};

	//获取当前要听写的单词
	fnupdateWord();

	//听语音按钮
	$("#voice").on("click", function () {
		$("#audioplay").attr("src", audioplaySrc);
	})
	//enter按钮
	$("#enter").on("click", function () {
		var inputVal = $.trim($("#wordinput").val());
		// thiswordState = 1;

		if (numEnt == 2) {
			numEnt--;

			$("#translate").show();
			$("#answer").show();

			if (inputVal == $.trim($("#answer").html()) ) {
				$("#status").show().attr("class", "status correct");
				$("#answer").attr("class", "answer");
				$("#wordinput").attr("disabled", true);

				numEnt--;
			} else {
				$("#status").show().attr("class", "status error");
				$("#answer").attr("class", "answer error");
				$("#wordinput").attr("disabled", true);

				thiswordState++;
			}
		} else if (numEnt == 1) {
			$("#wordinput").val("").attr('disabled', false);
			$("#wordinput")[0].focus();
			$("#answer").hide();

			numEnt = 2;
		} else if (numEnt <= 0) {
			// console.log('thiswordState:'+thiswordState);
			fnsendWordState(thiswordId, thiswordState);

		} else if (numEnt == 666) { //该值为666表示当前处于测试状态
			if (inputVal.length == 0) {
				$("#hint").fadeIn(200).delay(1500).fadeOut(200);
				$("#thisStudy").html('进度：' + (num + 1) + '/' + wordArrLength);
				return false;
			}

			var thisWordName = $.trim( wordArr[num].word_name.replace(/\•/g, ''));

			var thisStatus;
			if (inputVal == thisWordName) {
				thisStatus = 1;
			} else {
				thisStatus = 0;
			}

			var newObj = {
				index: wordArr[num].id,
				this_name: thisWordName,
				this_mean: wordArr[num].word_mean,
				myVal: inputVal,
				status: thisStatus
			}
			//构建测试的单词对象保存进数组，然后载入下一个单词
			testsArr.push(newObj);

			fnnextWord();
		}

	})

	function fnsendWordState(word_id, word_state) {
		if (thisNewOrOld == 0 && word_state == 1) { //熟词
			oldWordNum++;
		} else if(thisNewOrOld == 0 && word_state > 1){ //生词
			newWordNum++;
		} else if(thisNewOrOld == 1){
			reviewWordNum++;
		}
		fnUpdateThisStudyMessage();

		$.ajax({
			type: "POST",
			url: thisUrl2 + "/Areas/Api/index.ashx",
			dataType: "json",
			data: {
				method: 'UpdateState',
				id: word_id,
				word_state: word_state,
				userid: username
			},
			success: function (data) {
				if (data.msg == '更改成功') {
					fnupdateWord();
				}
			}
		});
	}

	function fnupdateWord() {
		$.ajax({
			type: "POST",
			url: thisUrl2 + "/Areas/Api/index.ashx",
			dataType: "json",
			data: {
				method: 'GetDictation',
				user_id: username,
				unit_id: chapter_id
			},
			success: function (data) {
				if (data[0]) {
					// console.log(data[0].word_name);
					fnshowthisWord(data[0]);
					countTest++;
				} else if (data.msg == "听写完毕") {
					$("#alertBox").show().find('h4').text('听写完毕，下面进入测试！');
					$('#btnOk').on('click',function(){
						$("#alertBox").hide();
						fnthisunitAllWord();
					});
				} else if (data.msg == "无数据") {
					$("#alertBox").show().find('h4').text('注意，没有新的单词数据，请联系相关客服！');
					$('#btnOk').on('click',function(){
						$("#alertBox").hide();
						window.location="../alternativeVersion.html";
					});
				} else if (data.status == 0) {
					$("#alertBox").show().find('h4').text('警告，错误信息，请尝试刷新，若该问题依然存在请联系相关客服！');
					$('#btnOk').on('click',function(){
						$("#alertBox").hide();
						window.location="../alternativeVersion.html";
					});
				}else if (data.msg == "学前测试") {
					$("#alertBox").show().find('h4').text('先来学前测试一下吧：）');
					$('#btnOk').on('click',function(){
						$("#alertBox").hide();
						beforeLearning = 0;//学前测试变量改为对应的状态
						fnthisunitAllWord();
					});
				}
			}
		});
	}

	//听写载入对应单词
	function fnshowthisWord(wordObj) {
		if(wordObj.dictation_percent > 0){
			thisNewOrOld = 1;
		}else{
			thisNewOrOld = 0;
		}
		//将单词状态重新归为1，熟词
		thiswordState = 1;
		//根据记忆强度设置该单词的记忆强度条的长度
		var atPresentNum = wordObj.dictation_percent+'%';
		$("#atPresent").css('width',atPresentNum);
		$("#schedule").attr('title' , '记忆强度'+atPresentNum);

		$("#wordinput").val("").attr('disabled', false);
		$("#wordinput")[0].focus();
		$("#answer").hide();
		$("#status").hide();
		$("#translate").hide();

		$("#translate").html(wordObj.word_mean);

		var thisWordName = wordObj.word_name.replace(/\•/g, '');
		$("#answer").html(thisWordName);

		//设置播放路径，绑定听语音事件
		audioplaySrc = thisUrl2 + wordObj.word_url;
		$("#audioplay").attr("src", audioplaySrc);
		numEnt = 2;
		thiswordId = wordObj.id;
	}

	//听写测试载入对应单词
	function fntestshowWord(wordObj) {
		$("#wordinput").val("").attr('disabled', false);
		$("#wordinput")[0].focus();

		//设置播放路径，绑定听语音事件
		audioplaySrc = thisUrl2 + wordObj.word_url;
		$("#audioplay").attr("src", audioplaySrc);

		$("#thisStudy").html('进度：' + (num + 1) + '/' + wordArrLength);

		numEnt = 666;
	}
	//下一个
	function fnnextWord() {
		num++;
		if (num < wordArrLength) {
			fntestshowWord(wordArr[num]);

		} else if (num >= wordArrLength) {
			$("#alertBox").show().find('h4').text('测试完成，点击查看分数');
			$('#btnOk').on('click',function(){
				$("#alertBox").hide();
				sessionStorage.wordTestsArr = JSON.stringify(testsArr);
				sessionStorage.testResultArr = null;

				var Nnum = 0;
				$.each(testsArr, function (index, element) {
					if (element.status == 1) {
						Nnum++;
					}
				});
				var thisScore = Math.round((Nnum / testsArr.length) * 100);
				// window.location = "sentence_test.html?score=" + thisScore;
				fnsavethisScore(thisScore, testsArr.length);
			});
		}
	}

	//获取所有测试单词
	function fnthisunitAllWord() {
		$("#answer").hide();
		$("#status").hide();
		$("#translate").hide();
		$("#schedule").hide();
		$.ajax({
			type: "POST",
			url: thisUrl2 + "/Areas/Api/index.ashx",
			dataType: "json",
			data: {
				method: 'GetDictationTest',
				user_id: username,
				unit_id: chapter_id,
				before: beforeLearning
			},
			success: function (data) {
				if (data[0]) {
					wordArr = data;
					wordArrLength = wordArr.length;
					fntestshowWord(wordArr[0]);
				} else {
					$("#alertBox").show().find('h4').text('单词获取失败，请联系客服人员！');
					$('#btnOk').on('click',function(){
						$("#alertBox").hide();
						window.location="../alternativeVersion.html";
					});
				}

			}
		});
	}

	//更新本次学习的生词熟词以及复习的数量
	function fnUpdateThisStudyMessage() {
		$("#thisStudy").html(`本次学习【生词：${newWordNum} 个&nbsp;  熟词：${oldWordNum} 个 &nbsp; 复习：${reviewWordNum} 个】`);
	}

	//显示测试的进度
	function fnuodateTestNum(num_, arrLength_) {
		$("#thisStudy").html(`进度： ${num_}/${arrLength_}`);
	}

	//发送成绩
	function fnsavethisScore(thisScore_, length) {
		var stringLearnType;
		if(beforeLearning == 0){
			stringLearnType = "学前测试";
		}else{
			stringLearnType = "闯关测试";
		}
		var testsType = typeStr + stringLearnType +"(" + chapter_name + ")";
		var typeId = parseInt(type);

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
				test_number: length,
				study_type: typeId,
				type: beforeLearning,
				unit_id: chapter_id,
				count: countTest

			},
			success: function (data) {
				// console.log(JSON.stringify(data));
				if (data.msg == "保存成功") {
					// window.location = "score.html?score=" + thisScore_;

					window.location = "sentence_test.html?score=" + thisScore_;
				} else {
					$("#alertBox").show().find('h4').text('成绩上传失败，请重试');
					$('#btnOk').on('click',function(){
						$("#alertBox").hide();
					});
					//alert('成绩上传失败，请重试');
				}
			}
		});
	}
})