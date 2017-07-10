$(function() {
	//获取用户ID
	var userMessage = sessionStorage.userMessage;
	if(userMessage) {
		userMessage = JSON.parse(userMessage);
		var username = userMessage[0].ID;
	} else {
		alert('检测到您未登录，请先登录！');
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

	textbook_id = sessionStorage.textbook_id;
	version_id = sessionStorage.version_id;
	chapter_id = sessionStorage.chapter_id;
	typeStr = sessionStorage.typeStr;
	textbook_name = sessionStorage.textbook_name;
	version_name = sessionStorage.version_name;
	chapter_name = sessionStorage.chapter_name;
	type = sessionStorage.type;

	//	alert(Math.random()*30+1 );//1~30之间的随机数

	//获取所有单词
	fnGetAllTheWords();

	//初试vue
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
		};
	}, 1000);

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
			success: function(data) {
				wordsArr = data;
				wordArrlength = wordsArr.length;

				//前两类各自下面题目的数量
				itemNum = parseInt(wordArrlength / 3);

				fnshowtopic();
			}
		});
	}

	function fnshowtopic() {
		//给e_c_Arr数组添加元素
		fnpushArr(e_c_Arr);
		//给c_e_Arr数组添加元素
		fnpushArr(c_e_Arr);

		var e_cHtml = '',
			c_eHtml = '',
			listeningTestHtml = '';

		$.each(e_c_Arr, function(index, element) {
			e_cHtml += `<li data_correct="${element.word_mean}" >
							<h4>${index}.${element.word_name}</h4>
							<div class="item">
								<label data_type="${element.chinese[0].type}">
									<input type="radio" name="${element.id}"/>
									${element.chinese[0].content}
								</label>
								<label data_type="${element.chinese[1].type}">
									<input type="radio" name="${element.id}"/> 
									${element.chinese[1].content}
								</label>
								<label data_type="${element.chinese[2].type}">
									<input type="radio" name="${element.id}"/>
									${element.chinese[2].content}
								</label>
								<label data_type="${element.chinese[3].type}">
									<input type="radio" name="${element.id}"/>
									${element.chinese[3].content}
								</label>
							</div>
						</li>`;
		});
		$("#e_c .tests").html(e_cHtml);

		$.each(c_e_Arr, function(index, element) {
			c_eHtml += `<li data_correct="${element.word_name}" >
							<h4>${index}.${element.word_mean}</h4>
							<div class="item">
								<label data_type="${element.chinese[0].type}">
									<input type="radio" name="${element.id}"/>
									${element.english[0].content}
								</label>
								<label data_type="${element.chinese[1].type}">
									<input type="radio" name="${element.id}"/>
									${element.english[1].content}
								</label>
								<label data_type="${element.chinese[2].type}">
									<input type="radio" name="${element.id}"/>
									${element.english[2].content}
								</label>
								<label data_type="${element.chinese[3].type}">
									<input type="radio" name="${element.id}"/>
									${element.english[3].content}
								</label>
							</div>
						</li>`;
		});
		$("#c_e .tests").html(c_eHtml);

		$.each(wordsArr, function(index, element) {
			listeningTestHtml += `<li data_correct="${element.word_mean}" >
							&nbsp;&nbsp;01. <button class="listenbtns" data_wordurl="${element.word_url}">听读音</button>
							<div class="item">
								<label data_type="${element.chinese[0].type}">
									<input type="radio" name="${element.id}"/>
									${element.chinese[0].content}
								</label>
								<label data_type="${element.chinese[1].type}">
									<input type="radio" name="${element.id}"/>
									${element.chinese[1].content}
								</label>
								<label data_type="${element.chinese[2].type}">
									<input type="radio" name="${element.id}"/>
									${element.chinese[2].content}
								</label>
								<label data_type="${element.chinese[3].type}">
									<input type="radio" name="${element.id}"/>
									${element.chinese[3].content}
								</label>
							</div>
						</li>`;
		});
		$("#listeningTest .tests").html(listeningTestHtml);

		$("#listeningTest li button").on("click", function() {
			alert(this.dataset.wordurl);
		})
	}

	//给英译汉和汉译英数组添加元素
	function fnpushArr(arrName) {
		for(var i = 0; i < itemNum; i++) {
			wordArrlength--;
			var random = parseInt(Math.random() * wordArrlength + 1);
			arrName.push(wordsArr.splice(random, 1)[0]);
			console.log(random);
		}
	}

})