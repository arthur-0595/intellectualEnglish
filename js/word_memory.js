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
	var textbook_id, version_id, chapter_id;
	var textbook_name, version_name, chapter_name;
	//当前的大类，大类的name
	var type, typeStr, typeEnglish;
	//定时器
	var timer;
	//当前语音文件播放路径
	var audioplaySrc;
	//当前题目ID
	var thiswordId;
	//两次》一次》跳转
	var num = 2;
	//当前单词是不是一个以前听过的单词
	var thisNewOrOld = 0; //默认没听过
	//该单词是生词还是熟词
	var wordState = 1;
	//声明三个变量，生词熟词已经复习
	var newWordNum = 0 ,
		oldWordNum = 0 ,
		reviewWordNum = 0;

	//	$.getUrlParam = function(name) {
	//		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	//		var r = window.location.search.substr(1).match(reg);
	//		if(r != null) return decodeURI(r[2]);
	//		return null;
	//	};
	textbook_id = sessionStorage.textbook_id;
	version_id = sessionStorage.version_id;
	chapter_id = sessionStorage.chapter_id;
	typeStr = sessionStorage.typeStr;
	textbook_name = sessionStorage.textbook_name;
	version_name = sessionStorage.version_name;
	chapter_name = sessionStorage.chapter_name;
	type = sessionStorage.type;
	typeEnglish = sessionStorage.typeEnglish;

	$("#versions_h").html(version_name + ' - ' + textbook_name + ' - ' + chapter_name);

	//	alert(textbook_id+version_id+chapter_id+typeStr+textbook_name+version_name+chapter_name);
	//开始学习
	fnstudyStart();
	//显示倒计时
	fnshowcountDown();

	document.onkeyup = function (event) {
		var e = event || window.event || arguments.callee.caller.arguments[0];
		if (e && e.keyCode == 17) {
			$("#voice").trigger('click');
		}
	};

	function fnstudyStart() {
		$('body').loading({
            loadingWidth: 120,
            title: '',
            name: 'test',
            discription: '',
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

		$.ajax({
			type: "POST",
			url: thisUrl + '/Areas/Api/Interface.ashx',
			dataType: "json",
			data: {
				method: "memory",
				user_id: username,
				unit_id: chapter_id
			},
			success: function (data) {
				console.log(data);
				if (data.result.length >= 1) {
					var thisWord = data.result[0];
					//赋值当前单词题目的ID
					thiswordId = thisWord.id;
					var thisWordName = thisWord.word_name.replace(/\•/g, '');
					
					//如果该单词的记忆强度大于0，则计算本次的复习次数+1
					if (thisWord.memory_percent > 0) {
						thisNewOrOld = 1;
					} else {
						thisNewOrOld = 0;
					}

					// 单词难度系数
					var wordNameLen = thisWordName.length;
					var diffMark = $('.difficulty');
					if(wordNameLen > 0 && wordNameLen < 3){
						diffMark.css('background','url(../imgs/difficulty1.png) no-repeat center').attr('title','难度系数(1)');
					}else if(wordNameLen >= 3 && wordNameLen < 6){
						diffMark.css('background','url(../imgs/difficulty2.png) no-repeat center').attr('title','难度系数(2)');
					}else if(wordNameLen >= 6 && wordNameLen < 9){
						diffMark.css('background','url(../imgs/difficulty3.png) no-repeat center').attr('title','难度系数(3)');
					}else if(wordNameLen >= 9 && wordNameLen < 12){
						diffMark.css('background','url(../imgs/difficulty4.png) no-repeat center').attr('title','难度系数(4)');
					}else if(wordNameLen >= 12 && wordNameLen < 15){
						diffMark.css('background','url(../imgs/difficulty5.png) no-repeat center').attr('title','难度系数(5)');
					}else{
						diffMark.css('background','url(../imgs/difficulty6.png) no-repeat center').attr('title','难度系数(6)');
					}
					
					$("#thisWord").html(`<sub id="soundmark">${thisWord.phonogram}</sub>${thisWordName}`);
					var answerHTML = `<h3>${thisWord.word_mean}</h3>
						<div class="illustrate">
							<p>${thisWord.sentence}</p>
							<p>${thisWord.sentence_mean}</p>
						</div>`;
					$("#answer").html(answerHTML);
					//显示记忆强度
					var atPresentNum = thisWord.memory_percent+'%';
					$("#atPresent").css('width' , atPresentNum);
					$("#schedule").attr('title','记忆强度'+atPresentNum);

					//关闭loading插件
                    removeLoading('test');
					
					//设置播放路径，绑定听语音事件
					audioplaySrc = thisUrl2 + thisWord.word_url;
					$("#audioplay").attr("src", audioplaySrc);

					$("#voice").on("click", function () {
						$("#audioplay").attr("src", audioplaySrc);
					})

					//					fnclickBtns();
					//保存在学课程信息
					fnsavecourse();

				} else if (data.result == 0) {
//					alert("单词获取失败，请重试！");
//					window.location = 'alternativeVersion.html';
					alertBox('单词获取失败，请重试！','alternativeVersion.html');
				} else if (data.result == 2) {
					alertBox('记忆结束，下面开始单词强化！','word_strengthen_memory.html');
//					alert("记忆结束，下面开始单词强化！");
//					window.location = 'word_strengthen_memory.html';
				} else if (data.result == 3) {
					alertBox('学习完毕，下面开始测试！','word_simulationTest.html');
//					alert("检测到您已经学习完毕，下面开始测试！");
//					window.location = "word_simulationTest.html";
				}
			}
		});

		return false;

	}

	function fnshowcountDown() {
		var num = 5;
		$("#countDownTime").html(num);

		$("#countDown").show();
		$("#answer").hide();
		timer = setInterval(function () {
			num--;
			$("#countDownTime").html(num);

			if (num <= 0) {
				clearInterval(timer);
				$("#countDown").hide();
				$("#answer").show();
			}
		}, 1000);
	}
	//点击认识或不认识
	$("#theFirstTime>button").on('click', function (ev) {
		ev.stopPropagation();

		var index = $(this).index();
		if (index == 0) {
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

			//点击不认识，则该句子作为一个生句+1
			wordState++;

			fnshowstrengthenMemory();
		}
	})

	//点击是或否
	$("#secondTime>button").on("click", function (ev) {
		ev.stopPropagation();

		var index = $(this).index();
		if (index == 0) { //是
			clearInterval(timer);
			$("#countDown").hide();
			$("#answer").show();
			//进入下一个单词
			fnnextWords(1);
		} else { //否
			clearInterval(timer);
			$("#countDown").hide();
			$("#answer").show();

			//点击不认识，则该句子作为一个生句+1
			wordState++;

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

	$("#strengthenMemory>button").on("click", function (ev) {
		var ev = ev || window.event;
		ev.cancelBubble = true;
		num--;
		if (num == 1) {
			$("#ent_h").html(`${num}<sub>（跟着读两遍）</sub>`);
			$("#audioplay").attr("src", audioplaySrc);
		} else if (num == 0) {
			$("#ent_h").addClass("ent_h").html(`<sub>（下一个）</sub>`);
			$("#audioplay").attr("src", audioplaySrc);
		} else if (num < 0) {
			//进入下一个单词
			fnnextWords(2);
		}
	})

	function fnnextWords(thisstate) {
		$('body').loading({
            loadingWidth: 120,
            title: '',
            name: 'test',
            discription: '',
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

		if (thisNewOrOld == 0 && wordState == 1) { //熟词
			oldWordNum++;
		} else if (thisNewOrOld == 0 && wordState > 1) { //生词
			newWordNum++;
		} else if (thisNewOrOld == 1) {
			reviewWordNum++;
		}
		fnUpdateThisStudyMessage();
		
		//显示认识或不认识
		$(".btns").hide();
		$("#theFirstTime").show();
		//显示倒计时
		fnshowcountDown();

		$.ajax({
			type: "POST",
			url: thisUrl + '/Areas/Api/Interface.ashx',
			dataType: "json",
			data: {
				method: "getnext",
				id: thiswordId,
				user_id: username,
				unit_id: chapter_id,
				neworold_word: thisstate
			},
			success: function (data) {
				// console.log(data);
				if (data.result.length >= 1) {
					var thisWord = data.result[0];
					//赋值当前单词题目的ID
					thiswordId = thisWord.id;
					var thisWordName = thisWord.word_name.replace(/\•/g, '');

					//如果该单词的记忆强度大于0，则计算本次的复习次数+1
					if (thisWord.memory_percent > 0) {
						thisNewOrOld = 1;
					} else {
						thisNewOrOld = 0;
					}
					//将单词状态重新归为1，熟词
					wordState = 1;
					
					// 单词难度系数
					var wordNameLen = thisWordName.length;
					var diffMark = $('.difficulty');
					if(wordNameLen > 0 && wordNameLen < 3){
						diffMark.css('background','url(../imgs/difficulty1.png) no-repeat center').attr('title','难度系数(1)');
					}else if(wordNameLen >= 3 && wordNameLen < 6){
						diffMark.css('background','url(../imgs/difficulty2.png) no-repeat center').attr('title','难度系数(2)');
					}else if(wordNameLen >= 6 && wordNameLen < 9){
						diffMark.css('background','url(../imgs/difficulty3.png) no-repeat center').attr('title','难度系数(3)');
					}else if(wordNameLen >= 9 && wordNameLen < 12){
						diffMark.css('background','url(../imgs/difficulty4.png) no-repeat center').attr('title','难度系数(4)');
					}else if(wordNameLen >= 12 && wordNameLen < 15){
						diffMark.css('background','url(../imgs/difficulty5.png) no-repeat center').attr('title','难度系数(5)');
					}else{
						diffMark.css('background','url(../imgs/difficulty6.png) no-repeat center').attr('title','难度系数(6)');
					}
					
					$("#thisWord").html(`<sub id="soundmark">${thisWord.phonogram}</sub> ${thisWordName}`);

					var answerHTML = `<h3>${thisWord.word_mean}</h3>
						<div class="illustrate">
							<p>${thisWord.sentence}</p>
							<p>${thisWord.sentence_mean}</p>
						</div>`;
					$("#answer").html(answerHTML);
					//显示记忆强度
					var atPresentNum = thisWord.memory_percent+'%';
					$("#atPresent").css('width' , atPresentNum);
					$("#schedule").attr('title','记忆强度'+atPresentNum);

					//关闭loading插件
                    removeLoading('test');
					
					//设置播放路径，绑定听语音事件
					audioplaySrc = thisUrl2 + thisWord.word_url;
					$("#audioplay").attr("src", audioplaySrc);

					$("#voice").on("click", function () {
						$("#audioplay").attr("src", audioplaySrc);
					})

					//保存在学课程信息
					fnsavecourse();

				} else if (data.result == 0) {
					$("#alertBox").show().find('h4').text('单词获取失败，请联系客服人员！');
					$('#btnOk').on('click',function(){
						$("#alertBox").hide();	
						window.location="../html/alternativeVersion.html"
					});
//					alert("单词获取失败，请联系客服人员！");
				} else if (data.result == 2) {
					alertBox("记忆结束，下面开始单词强化！",'word_strengthen_memory.html');
//					alert("记忆结束，下面开始单词强化！");
//					window.location = 'word_strengthen_memory.html';
				}
			}

		});

		return false;
	}

	//保存在学课程信息
	function fnsavecourse() {
		$.ajax({
			type: "POST",
			url: thisUrl2 + '/Areas/Api/index.ashx',
			dataType: "json",
			data: {
				method: "SaveStudy",
				user_id: username,
				version_id: version_id,
				textbook_id: textbook_id
			},
			success: function (data) {
				//				alert(data.msg);
			}
		});
	}

	//更新本次学习的生词熟词以及复习的数量
	function fnUpdateThisStudyMessage() {
		$("#newWord").html(newWordNum);
		$("#familiarWords").html(oldWordNum);
		$("#review").html(reviewWordNum);
	}
})