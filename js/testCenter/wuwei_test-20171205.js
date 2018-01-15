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

	textbook_id = sessionStorage.textbook_id;
	version_id = sessionStorage.version_id;
	chapter_id = sessionStorage.chapter_id;
	typeStr = sessionStorage.typeStr;
	textbook_name = sessionStorage.textbook_name;
	version_name = sessionStorage.version_name;
	chapter_name = sessionStorage.chapter_name;
	type = sessionStorage.type;
	//本章所有的单词
	var wordsArr, wordArrlength, wordsArrClone;
	//包涵所有中文释义的数组以及包涵所有英文单词的数组

	//五个类的数组
	var e_c_Arr = [], // 英译汉
		c_e_Arr = [], // 汉译英
		listeningTest = []; // 根据读音选择中文
	listenWrite = []; // 根据读音写单词
	wordWrite = []; // 根据中文写单词

	var itemNum;
	$('#versions').html(version_name + ' - ' + textbook_name + ' - ' + chapter_name);
	$('#title').html(typeStr + '测试');



	//倒计时
	function fnsetInterval() {
		var onlyTime = 300;
		var onlyminute, onlysecond;
		var timer = setInterval(function () {
			onlyTime--;
			onlyminute = parseInt(onlyTime / 60);
			onlysecond = onlyTime % 60;
			$('#timeRemaining').text(onlyminute + '分' + onlysecond + '秒');
			if (onlyTime <= 0) {
				clearInterval(timer);
				$("#alertBox").show().find('h4').text('倒计时结束，显示测试分数');
				$('#btnOk').on('click', function () {
					$("#alertBox").hide();
					$("#submitTheAnswer").trigger("click");
				});
			};
		}, 1000);
	}


	getAllWords();
	// 获取所有测试单词
	function getAllWords() {
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

		$.ajax({
			type: 'POST',
			url: thisUrl2 + '/Areas/Api/Index.ashx',
			dataType: 'json',
			data: {
				method: 'FiveTest',
				textbook_id: textbook_id
			},
			success: function (res) {
				wordsArr = res;
				wordArrlength = wordsArr.length;
				// 获取每个测试栏目的题目数量
				itemNum = parseInt(wordArrlength / 5);
				// 获取每个测试栏目的题目
				e_c_Arr = wordsArr.slice(0, itemNum);
				c_e_Arr = wordsArr.slice(itemNum, itemNum * 2);
				listeningTest = wordsArr.slice(itemNum * 2, itemNum * 3);
				listenWrite = wordsArr.slice(itemNum * 3, itemNum * 4);
				wordWrite = wordsArr.slice(itemNum * 4, itemNum * 5);
				showTitles(e_c_Arr, c_e_Arr, listeningTest, listenWrite, wordWrite);
			}
		})
	}

	function showTitles(e_c_Arr, c_e_Arr, listeningTest, listenWrite, wordWrite) {
		var e_c_html = '',
			c_e_html = '',
			listen_test_html = '',
			listen_write_html = '',
			word_write_html = '';
		// 英译汉
		$.each(e_c_Arr, function (index, element) {
			e_c_html += `<li data-correct="${element.word_mean}" >
							<h4>${index+1}.${element.word_name.replace(/\•/g,'')}</h4>
							<div class="item">
								<label>
									<input type="radio" name="${element.id}"  data-type="${element.meanchinese[0].type}"/>
									${element.meanchinese[0].content}
								</label>
								<label>
									<input type="radio" name="${element.id}"  data-type="${element.meanchinese[1].type}"/> 
									${element.meanchinese[1].content}
								</label>
								<label>
									<input type="radio" name="${element.id}"  data-type="${element.meanchinese[2].type}"/>
									${element.meanchinese[2].content}
								</label>
								<label>
									<input type="radio" name="${element.id}"  data-type="${element.meanchinese[3].type}"/>
									${element.meanchinese[3].content}
								</label>
							</div>
						</li>`;

		});
		$("#e_c .tests").html(e_c_html);

		// 汉译英
		$.each(c_e_Arr, function (index, element) {
			c_e_html += `<li data-correct="${element.word_name.replace(/\•/g,'')}" >
							<h4>${index+1}.${element.word_mean}</h4>
							<div class="item">
								<label>
									<input type="radio" name="${element.id}"  data-type="${element.meanenglish[0].type}"/>
									${element.meanenglish[0].content.replace(/\•/g,'')}
								</label>
								<label>
									<input type="radio" name="${element.id}"  data-type="${element.meanenglish[1].type}"/>
									${element.meanenglish[1].content.replace(/\•/g,'')}
								</label>
								<label>
									<input type="radio" name="${element.id}" data-type="${element.meanenglish[2].type}"/>
									${element.meanenglish[2].content.replace(/\•/g,'')}
								</label>
								<label>
									<input type="radio" name="${element.id}" data-type="${element.meanenglish[3].type}"/>
									${element.meanenglish[3].content.replace(/\•/g,'')}
								</label>
							</div>
						</li>`;
		});
		$("#c_e .tests").html(c_e_html);

		// 听力
		$.each(listeningTest, function (index, element) {
			listen_test_html += `<li data-correct="${element.word_name.replace(/\•/g,'')}">
					&nbsp;&nbsp;${index+1}. <button class="listenbtns" data-url="${element.word_url}">听读音</button>
					<div class="item">
						<label>
							<input type="radio" name="${element.id}"  data-type="${element.meanchinese[0].type}"/>
							${element.meanchinese[0].content}
						</label>
						<label>
							<input type="radio" name="${element.id}" data-type="${element.meanchinese[1].type}"/>
							${element.meanchinese[1].content}
						</label>
						<label>
							<input type="radio" name="${element.id}" data-type="${element.meanchinese[2].type}"/>
							${element.meanchinese[2].content}
						</label>
						<label>
							<input type="radio" name="${element.id}" data-type="${element.meanchinese[3].type}"/>
							${element.meanchinese[3].content}
						</label>
					</div>
				</li>`;
		});
		$("#listeningTest .tests").html(listen_test_html);

		// 根据读音写单词
		$.each(listenWrite, function (index, element) {
			listen_write_html += `<li class="item_listen clearfix">
					 		<span class="mark">${index+1}.</span>
							<input type="text" class="wordInput" data-url="${element.word_url}"  data-correct="${element.word_name.replace(/\•/g,'')}"/>						
						</li> `;
		});
		$("#listenWrite .testOther").html(listen_write_html);

		// 根据中文默写单词
		$.each(wordWrite, function (index, element) {
			word_write_html += `<li class="item_listen clearfix">
					 		<span class="mark" >${index+1}.</span>
							<input type="text" class="wordInput" data-correct="${element.word_name.replace(/\•/g,'')}"/>	
							<sapn class="word_mean">${element.word_mean}</sapn>
						</li>`;
		});
		$("#wordWrite .testOther").html(word_write_html);


		// 点击语音按钮播放语音
		$('#listeningTest li button').on('click', function () {
			$('#audioplay').attr('src', thisUrl2 + this.dataset.url);
		});

		//点击选中选项事件
		$(".tests label").on("click", function () {
			$(this).parents("li").css("background-color", '#eee')
		});

		// 点击input框听读音
		$('#listenWrite li input').on('click', function () {
			$('#audioplay').attr('src', thisUrl2 + this.dataset.url);
		});

		// 按“Ctrl”键听读音
		$('#listenWrite li input').on('keyup', function (event) {
			if (event.keyCode === 17) {
				$('#audioplay').attr('src', thisUrl2 + this.dataset.url);
			}
		});


		//关闭loading插件
		removeLoading('test');
		//加载完成之后开启倒计时
		fnsetInterval();

		sessionStorage.e_c_Arr = JSON.stringify(e_c_Arr);
		sessionStorage.c_e_Arr = JSON.stringify(c_e_Arr);
		sessionStorage.listeningTest = JSON.stringify(listeningTest);
		sessionStorage.listenWrite = JSON.stringify(listenWrite);
		sessionStorage.wordWrite = JSON.stringify(wordWrite);
	}

	//点击交卷按钮
	$("#submitTheAnswer").on("click", function () {
		var totalScore = 0,
			liScore = 0,
			otherLiScore = 0;
		var liObjArr = [];
		var wordObjArr = [];
		//获取每一题，判定每一题下面的四个选项若某一项被选中并且其父级盒子label的自定义属性type为1时，则该题正确
		//所有题遍历结束之后计算分数并且跳转页面，分数通过传值来传递，并且缓存对应的正确的题目的数组，以方面在成绩单页面显示对应的正确题目
		var liArr = $(".tests>li");
		var otherLiArr = $('.testOther>li');
		var totalLen = liArr.length + otherLiArr.length;
		$.each(liArr, function (index, element) {
			var myCheckedIndex = -2,
				answerIndex = -1,
				isCorrect = false,
				liInputObj = {};
			$.each($(element).find("input"), function (index_, element_) {
				this.index = index_;
				if (element_.dataset.type === "1") {
					answerIndex = index_;
				}
				if (element_.checked) {
					myCheckedIndex = index_;
				};
				if (myCheckedIndex === answerIndex) {
					isCorrect = true;
				} else {
					isCorrect = false;
				}
			});
			liInputObj.myCheckedIndex = myCheckedIndex;
			liInputObj.answerIndex = answerIndex;
			liInputObj.isCorrect = isCorrect;
			liInputObj.liIndex = index;
			liObjArr.push(liInputObj);
		});

		$.each(liObjArr, function (index, element) {
			if (element.isCorrect) {
				liScore++;
			}
		});
		$.each(otherLiArr, function (index, element) {
			var $index = index;
			$.each($(element).find('input'), function (index_, element_) {
				var inputVal = $.trim($(this).val());
				var answer = this.dataset.correct;
				var isCorrect = false;
				if (inputVal === answer) {
					otherLiScore++;
					isCorrect = true;
				} else {
					isCorrect = false;
				}
				var wordObj = {
					myWord: inputVal,
					isCorrect: isCorrect,
					answer: answer,
					index: $index
				};
				wordObjArr.push(wordObj);
			});
		});
		totalScore = liScore + otherLiScore;
		sessionStorage.liObjArr = JSON.stringify(liObjArr);
		sessionStorage.wordObjArr = JSON.stringify(wordObjArr);
		var thisScore = Math.round((totalScore / wordArrlength) * 100);
		//得到分数，并发送
		fnsavethisScore(thisScore, wordArrlength);
	})
	//发送成绩
	function fnsavethisScore(thisScore_, length) {
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
		var testsType = typeStr + "测试中心(" + version_name + '-' + textbook_name + ")";
		var typeId = parseInt(type);
		var beforeLearning = 2,
			countTest = 0;

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
				if (data.msg == "保存成功") {
					window.location = "../../html/testCenter/wuwei_test_score.html?score=" + thisScore_;
				} else {
					//关闭loading插件
					removeLoading('test');
					$("#alertBox").show().find('h4').text('成绩上传失败，请重试');
					$('#btnOk').on('click', function () {
						$("#alertBox").hide();
					});
				}
			}
		});
	}

})