$(function() {
	//获取用户ID
	var userMessage = sessionStorage.userMessage;
	if(userMessage) {
		userMessage = JSON.parse(userMessage);
		var username = userMessage[0].ID;
	} else {
		window.location = '../../index.html';
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

	textbook_id = sessionStorage.textbook_id;
	version_id = sessionStorage.version_id;
	chapter_id = sessionStorage.chapter_id;
	typeStr = sessionStorage.typeStr;
	textbook_name = sessionStorage.textbook_name;
	version_name = sessionStorage.version_name;
	chapter_name = sessionStorage.chapter_name;
	type = sessionStorage.type;

	//获取所有单词
	fnGetAllTheWords();

	var con = new Vue({
		el: "#con",
		data: {
			textbook_name: textbook_name,
			version_name: version_name,
			typeStr: typeStr,
			minute: 5,
			second: 0
		}
	})

	//倒计时
	var onlyTime = 300;
	var onlyminute, onlysecond;
	var timer = setInterval(function() {
		onlyTime--;
		onlyminute = parseInt(onlyTime / 60);
		onlysecond = onlyTime % 60;

		con.minute = onlyminute;
		con.second = onlysecond;

		if(onlyTime <= 0) {
			clearInterval(timer);
			alert('倒计时结束');
			$("#submitTheAnswer").trigger("click");
		};
	}, 1000);

	//获取本章所有的单词
	function fnGetAllTheWords() {
		var type_id = type.substr(-1);
		
		$.ajax({
			type: "POST",
			url: thisUrl2 + '/Areas/Api/Index.ashx',
			dataType: "json",
			data: {
				method: "LearnTest",
                user_id: username,
                textbook_id: textbook_id,
                type_id: type_id
			},
			success: function(data) {
				console.log(data);
				wordsArr = data;
				wordArrlength = wordsArr.length;

				//前两类各自下面题目的数量
				itemNum = parseInt(wordArrlength / 3);

				fnshowtopic();
			}
		});
	}

	//点击交卷按钮
	var scoreNum = 0;
	var correctArr = [];
	$("#submitTheAnswer").on("click", function() {
		//获取每一题，判定每一题下面的四个选项若某一项被选中并且其父级盒子label的自定义属性type为1时，则该题正确
		//所有题遍历结束之后计算分数并且跳转页面，分数通过传值来传递，并且缓存对应的正确的题目的数组，以方面在成绩单页面显示对应的正确题目
		var liArr = $(".tests>li");
		$.each(liArr, function(index , element) {
			$.each( $(element).find("input") , function(index_ , element_) {
				if(element_.checked == true){
//					alert($(element_).parent()[0].dataset.type);
					if( $(element_).parent()[0].dataset.type == 1 ){
						scoreNum++;
						correctArr.push(index);
					}
				}
			});
		});
		console.log(correctArr);
		sessionStorage.correctArr = JSON.stringify(correctArr);
		var thisScore = Math.round( (scoreNum/liArr.length)*100 );
		//得到分数，并发送
		fnsavethisScore(thisScore , liArr.length);
	})

	function fnshowtopic() {
		//给e_c_Arr数组添加元素
		fnpushArr(e_c_Arr);
		//给c_e_Arr数组添加元素
		fnpushArr(c_e_Arr);

		var e_cHtml = '',
			c_eHtml = '',
			listeningTestHtml = '';

		$.each(e_c_Arr, function(index, element) {
			e_cHtml += `<li data-correct="${element.word_mean}" >
							<h4>${index+1}.${element.word_name.replace(/\•/g,'')}</h4>
							<div class="item">
								<label data-type="${element.meanchinese[0].type}">
									<input type="radio" name="${element.id}"/>
									${element.meanchinese[0].content}
								</label>
								<label data-type="${element.meanchinese[1].type}">
									<input type="radio" name="${element.id}"/> 
									${element.meanchinese[1].content}
								</label>
								<label data-type="${element.meanchinese[2].type}">
									<input type="radio" name="${element.id}"/>
									${element.meanchinese[2].content}
								</label>
								<label data-type="${element.meanchinese[3].type}">
									<input type="radio" name="${element.id}"/>
									${element.meanchinese[3].content}
								</label>
							</div>
						</li>`;
		});
		$("#e_c .tests").html(e_cHtml);

		$.each(c_e_Arr, function(index, element) {
			c_eHtml += `<li data-correct="${element.word_name.replace(/\•/g,'')}" >
							<h4>${index+1}.${element.word_mean}</h4>
							<div class="item">
								<label data-type="${element.meanenglish[0].type}">
									<input type="radio" name="${element.id}"/>
									${element.meanenglish[0].content.replace(/\•/g,'')}
								</label>
								<label data-type="${element.meanenglish[1].type}">
									<input type="radio" name="${element.id}"/>
									${element.meanenglish[1].content.replace(/\•/g,'')}
								</label>
								<label data-type="${element.meanenglish[2].type}">
									<input type="radio" name="${element.id}"/>
									${element.meanenglish[2].content.replace(/\•/g,'')}
								</label>
								<label data-type="${element.meanenglish[3].type}">
									<input type="radio" name="${element.id}"/>
									${element.meanenglish[3].content.replace(/\•/g,'')}
								</label>
							</div>
						</li>`;
		});
		$("#c_e .tests").html(c_eHtml);

		$.each(wordsArr, function(index, element) {
			listeningTestHtml += `<li data-correct="${element.word_name.replace(/\•/g,'')}" >
							&nbsp;&nbsp;${index+1}. <button class="listenbtns" data-wordurl="${element.word_url}">听读音</button>
							<div class="item">
								<label data-type="${element.meanchinese[0].type}">
									<input type="radio" name="${element.id}"/>
									${element.meanchinese[0].content}
								</label>
								<label data-type="${element.meanchinese[1].type}">
									<input type="radio" name="${element.id}"/>
									${element.meanchinese[1].content}
								</label>
								<label data-type="${element.meanchinese[2].type}">
									<input type="radio" name="${element.id}"/>
									${element.meanchinese[2].content}
								</label>
								<label data-type="${element.meanchinese[3].type}">
									<input type="radio" name="${element.id}"/>
									${element.meanchinese[3].content}
								</label>
							</div>
						</li>`;
		});
		$("#listeningTest .tests").html(listeningTestHtml);
		//点击听语音按钮
		$("#listeningTest li button").on("click", function() {
			var playerSrc = thisUrl2 + this.dataset.wordurl;
			$("#audioplay").attr("src", playerSrc);
		})
		//点击选中选项事件
		$(".tests label").on("click", function() {
			$(this).parents("li").css("background-color",'#eee')
		})

		sessionStorage.e_c_Arr = JSON.stringify(e_c_Arr);
		sessionStorage.c_e_Arr = JSON.stringify(c_e_Arr);
		sessionStorage.wordsArr = JSON.stringify(wordsArr);
	}

	//给英译汉和汉译英数组添加元素
	function fnpushArr(arrName) {
		for(var i = 0; i < itemNum; i++) {
			wordArrlength--;
			arrName.push(wordsArr.splice(i, 1)[0]);
		}
	}

	//发送成绩
	function fnsavethisScore(thisScore_ , length){
		var testsType = typeStr + "测试中心(" + version_name +'-'+ textbook_name + ")";
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
			success: function(data) {
				console.log(JSON.stringify(data) );

				if(data.msg == "保存成功"){
					window.location="../../html/testCenter/word_memory_score.html?score="+thisScore_;
				}else{
					alert('成绩上传失败，请重试');
				}
			}
		});
	}
	
})