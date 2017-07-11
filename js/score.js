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
	var wordsArr, wordArrlength;
	//包涵所有中文释义的数组以及包涵所有英文单词的数组
	var itemNum;

	$.getUrlParam = function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if(r != null) return decodeURI(r[2]);
		return null;
	};
	var urlScore = $.getUrlParam('score');
	$("#thisScore").html(urlScore);

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
	
	var correctArr = JSON.parse( sessionStorage.correctArr ) ;
//	alert(typeof correctArr);

	//	alert(Math.random()*30+1 );//1~30之间的随机数
	//初试vue
	var con = new Vue({
		el: "#con",
		data: {
			textbook_name: textbook_name,
			version_name: version_name,
			chapter_name: chapter_name,
			typeStr: typeStr
		}
	})
	
	//获取所有单词
	fnGetAllTheWords();

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
			e_cHtml += `<li data-correct="${element.word_mean}" class="correct">
							<h4>${index+1}.${element.word_name}</h4>
							<ul class="item">
								<li  data-type="${element.chinese[0].type}">
									<i class="yes"></i>
									${element.chinese[0].content}
								</li>
								<li data-type="${element.chinese[1].type}">
									<i class="no"></i>
									${element.chinese[1].content}
								</li>
								<li data-type="${element.chinese[2].type}">
									<i class="no"></i>
									${element.chinese[2].content}
								</li>
								<li data-type="${element.chinese[3].type}">
									<i class="yes"></i>
									${element.chinese[3].content}
								</li>
							</ul>
							<span class="status"></span>
						</li>`;
		});
		$("#e_c .tests").html(e_cHtml);

		$.each(c_e_Arr, function(index, element) {
			c_eHtml += `<li data-correct="${element.word_name}" class=" ">
							<h4>${index+1}.${element.word_mean}</h4>
							<ul class="item">
								<li data-type="${element.english[0].type}">
									<i class=""></i>
									${element.english[0].content}
								</li>
								<li data-type="${element.english[1].type}">
									<i class=""></i>
									${element.english[1].content}
								</li>
								<li data-type="${element.english[2].type}">
									<i class=""></i>
									${element.english[2].content}
								</li>
								<li data-type="${element.english[3].type}">
									<i class=""></i>
									${element.english[3].content}
								</li>
							</ul>
							<span class="status"></span>
						</li>`;
		});
		$("#c_e .tests").html(c_eHtml);

		$.each(wordsArr, function(index, element) {
			listeningTestHtml += `<li data-correct="${element.word_mean}"  class="error">
							&nbsp;&nbsp;${index+1}. <button class="listenbtns" data-wordurl="${element.word_url}">听读音</button>
							<ul class="item">
								<li data-type="${element.chinese[0].type}">
									<i class=""></i>
									${element.chinese[0].content}
								</li>
								<li data-type="${element.chinese[1].type}">
									<i class=""></i>
									${element.chinese[1].content}
								</li>
								<li data-type="${element.chinese[2].type}">
									<i class=""></i>
									${element.chinese[2].content}
								</li>
								<li data-type="${element.chinese[3].type}">
									<i class=""></i>
									${element.chinese[3].content}
								</li>
							</ul>
							<span class="status"></span>
						</li>`;
		});
		$("#listeningTest .tests").html(listeningTestHtml);
		//点击听语音按钮
		$("#listeningTest li button").on("click", function() {
			var playerSrc = thisUrl2 + this.dataset.wordurl;
			$("#audioplay").attr("src", playerSrc);
		})
		//通过修改class来标注选项的对错
		var liA = $(".item > li");
		$.each(liA, function(index , element) {
			if(element.dataset.type == 1){
				$(element).find('i').attr('class',"yes");
			}else{
				$(element).find('i').attr('class',"no");
			}
		});
		//对应题目的状态标识出来
		$(".tests>li").attr('class','error');
		$.each(correctArr, function(index , element) {
			$(".tests>li").eq(correctArr[index]).attr('class','correct');
		});
	}

	//给英译汉和汉译英数组添加元素
	function fnpushArr(arrName) {
		for(var i = 0; i < itemNum; i++) {
			wordArrlength--;
			var random = parseInt(Math.random() * wordArrlength + 1);
			arrName.push(wordsArr.splice(random, 1)[0]);
		}
	}

})





















