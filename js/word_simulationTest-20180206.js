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
	//本章所有的单词
	var wordsArr, wordArrlength, wordsArrClone;
	//包涵所有中文释义的数组以及包涵所有英文单词的数组
	var itemNum;

	//三个类的数组
	var e_c_Arr = [],
		c_e_Arr = [],
		listeningTest = [];
	//是否是学前测试
	var beforeLearning = 1;//默认不是学前测试
	//是否是直接进入测试
	var countTest = 1;//默认是经过了学习之后进入的

	textbook_id = sessionStorage.textbook_id;
	version_id = sessionStorage.version_id;
	chapter_id = sessionStorage.chapter_id;
	typeStr = sessionStorage.typeStr;
	textbook_name = sessionStorage.textbook_name;
	version_name = sessionStorage.version_name;
	chapter_name = sessionStorage.chapter_name;
	type = sessionStorage.type;

	//	alert(Math.random()*30+1 );//1~30之间的随机数
	var con = new Vue({
		el: "#con",
		data: {
			textbook_name: textbook_name,
			version_name: version_name,
			chapter_name: chapter_name,
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
	var beforeLearningType = $.getUrlParam('beforeLearning');
	var countTestType = $.getUrlParam('countTest');

	if (testType == 'review') {
		$("title").html('智能记忆测试复习');
		con.chapter_name = '智能记忆'
		//获取所有单词
		fngetAllTestWords();
	} else {
		//获取所有单词
		fnGetAllTheWords();
	}
	//如果检测到有该参数，则说明是学前测试，在传分数的时候要把对应的状态值传过去
	if(beforeLearningType){
		beforeLearning = beforeLearningType;
	}
	//如果检测到有该参数，则说明是没有经过学习直接进入测试，在传分数的时候要把对应的状态值传过去
	if(countTestType){
		countTest = countTestType;
	}


	//倒计时
	function fnsetInterval() {
		var onlyTime = 300;
		var onlyminute, onlysecond;
		var timer = setInterval(function () {
			onlyTime--;
			onlyminute = parseInt(onlyTime / 60);
			onlysecond = onlyTime % 60;

			con.minute = onlyminute;
			con.second = onlysecond;

			if (onlyTime <= 0) {
				clearInterval(timer);
				$("#alertBox").show().find('h4').text('倒计时结束');
				$('#btnOk').on('click',function(){
					$("#alertBox").hide();
					$("#submitTheAnswer").trigger("click");
				});
				//alert('倒计时结束');
				//$("#submitTheAnswer").trigger("click");
			};
		}, 1000);
	}


	//获取本章所有的单词
	function fnGetAllTheWords() {
		$.ajax({
			type: "POST",
			url: thisUrl + '/Areas/Api/Interface.ashx',
			dataType: "json",
			data: {
				method: "getwords",
				unit_id: chapter_id,
			},
			success: function (data) {
				console.log(data)
				wordsArr = data;
				wordArrlength = wordsArr.length;

				//前两类各自下面题目的数量
				itemNum = parseInt(wordArrlength / 3);

				fnshowtopic();
			}
		});
	}

	function fngetAllTestWords() {
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
			url: thisUrl + '/Areas/Api/Interface.ashx',
			dataType: "json",
			data: {
				method: "TestReview",
				user_id: username,
				wordtype: type_id,
				textbookid: textbook_id
			},
			success: function (data) {
				console.log(data)
				wordsArr = data;
				wordArrlength = wordsArr.length;

				//前两类各自下面题目的数量
				itemNum = parseInt(wordArrlength / 3);

				fnshowtopic();
			}
		});
	}

	//点击交卷按钮
	$("#submitTheAnswer").on("click", function () {
		var scoreNum = 0;
		var liObjArr = [];
		//获取每一题，判定每一题下面的四个选项若某一项被选中并且其父级盒子label的自定义属性type为1时，则该题正确
		//所有题遍历结束之后计算分数并且跳转页面，分数通过传值来传递，并且缓存对应的正确的题目的数组，以方面在成绩单页面显示对应的正确题目
		var liArr = $(".tests>li");
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
				scoreNum++;
			}
		});
		sessionStorage.liObjArr = JSON.stringify(liObjArr);
		var thisScore = Math.round((scoreNum / liArr.length) * 100);

		if (testType == 'review') {
			window.location = "score.html?score=" + thisScore +"&testType=review";
		} else {
			//得到分数，并发送
			fnsavethisScore(thisScore, liArr.length);
		}

	})

	function fnshowtopic() {
		//给e_c_Arr数组添加元素
		fnpushArr(e_c_Arr);
		//给c_e_Arr数组添加元素
		fnpushArr(c_e_Arr);

		var e_cHtml = '',
			c_eHtml = '',
			listeningTestHtml = '';

		$.each(e_c_Arr, function (index, element) {
			e_cHtml += `<li data-correct="${element.word_mean}" >
							<h4>${index+1}.${element.word_name.replace(/\•/g,'')}</h4>
							<div class="item">
								<label>
									<input type="radio" name="${element.id}"  data-type="${element.chinese[0].type}"/>
									${element.chinese[0].content}
								</label>
								<label>
									<input type="radio" name="${element.id}"  data-type="${element.chinese[1].type}"/> 
									${element.chinese[1].content}
								</label>
								<label>
									<input type="radio" name="${element.id}"  data-type="${element.chinese[2].type}"/>
									${element.chinese[2].content}
								</label>
								<label>
									<input type="radio" name="${element.id}"  data-type="${element.chinese[3].type}"/>
									${element.chinese[3].content}
								</label>
							</div>
						</li>`;
		});
		$("#e_c .tests").html(e_cHtml);

		$.each(c_e_Arr, function (index, element) {
			c_eHtml += `<li data-correct="${element.word_name.replace(/\•/g,'')}" >
							<h4>${index+1}.${element.word_mean}</h4>
							<div class="item">
								<label>
									<input type="radio" name="${element.id}"  data-type="${element.english[0].type}"/>
									${element.english[0].content.replace(/\•/g,'')}
								</label>
								<label>
									<input type="radio" name="${element.id}"  data-type="${element.english[1].type}"/>
									${element.english[1].content.replace(/\•/g,'')}
								</label>
								<label>
									<input type="radio" name="${element.id}" data-type="${element.english[2].type}"/>
									${element.english[2].content.replace(/\•/g,'')}
								</label>
								<label>
									<input type="radio" name="${element.id}" data-type="${element.english[3].type}"/>
									${element.english[3].content.replace(/\•/g,'')}
								</label>
							</div>
						</li>`;
		});
		$("#c_e .tests").html(c_eHtml);

		$.each(wordsArr, function (index, element) {
			listeningTestHtml += `<li data-correct="${element.word_name.replace(/\•/g,'')}">
					&nbsp;&nbsp;${index+1}. <button class="listenbtns" data-url="${element.word_url}">听读音</button>
					<div class="item">
						<label>
							<input type="radio" name="${element.id}"  data-type="${element.chinese[0].type}"/>
							${element.chinese[0].content}
						</label>
						<label>
							<input type="radio" name="${element.id}" data-type="${element.chinese[1].type}"/>
							${element.chinese[1].content}
						</label>
						<label>
							<input type="radio" name="${element.id}" data-type="${element.chinese[2].type}"/>
							${element.chinese[2].content}
						</label>
						<label>
							<input type="radio" name="${element.id}" data-type="${element.chinese[3].type}"/>
							${element.chinese[3].content}
						</label>
					</div>
				</li>`;
		});
		$("#listeningTest .tests").html(listeningTestHtml);

		//关闭loading插件
		removeLoading('test');
		//加载完成之后开启倒计时
		fnsetInterval();

		//点击听语音按钮
		$("#listeningTest li button").on("click", function () {
			var playerSrc = thisUrl2 + this.dataset.url;
			$("#audioplay").attr("src", playerSrc);
		})
		//点击选中选项事件
		$(".tests label").on("click", function () {
			$(this).parents("li").css("background-color", '#eee')
		})

		sessionStorage.e_c_Arr = JSON.stringify(e_c_Arr);
		sessionStorage.c_e_Arr = JSON.stringify(c_e_Arr);
		sessionStorage.wordsArr = JSON.stringify(wordsArr);
	}

	//给英译汉和汉译英数组添加元素
	function fnpushArr(arrName) {
		for (var i = 0; i < itemNum; i++) {
			wordArrlength--;
			var random = parseInt(Math.random() * wordArrlength + 1);
			arrName.push(wordsArr.splice(random, 1)[0]);
			// console.log(random);
		}
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

		// console.log(textbook_id);

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
					window.location = "score.html?score=" + thisScore_;
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