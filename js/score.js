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
	var wordsArr, wordArrlength;
	//包涵所有中文释义的数组以及包涵所有英文单词的数组
	var itemNum;

	$.getUrlParam = function (name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) return decodeURI(r[2]);
		return null;
	};
	var urlScore = $.getUrlParam('score');
	var testType = $.getUrlParam('testType');

	$("#thisScore").html(urlScore);

	//三个类的数组
	var e_c_Arr = [],
		c_e_Arr = [],
		listeningTest = [];
	e_c_Arr = JSON.parse(sessionStorage.e_c_Arr);
	c_e_Arr = JSON.parse(sessionStorage.c_e_Arr);
	wordsArr = JSON.parse(sessionStorage.wordsArr);


	textbook_id = sessionStorage.textbook_id;
	version_id = sessionStorage.version_id;
	chapter_id = sessionStorage.chapter_id;
	typeStr = sessionStorage.typeStr;
	textbook_name = sessionStorage.textbook_name;
	version_name = sessionStorage.version_name;
	chapter_name = sessionStorage.chapter_name;
	type = sessionStorage.type;

	var liObjArr = JSON.parse( sessionStorage.liObjArr) ;

	var con = new Vue({
		el: "#con",
		data: {
			textbook_name: textbook_name,
			version_name: version_name,
			chapter_name: chapter_name,
			typeStr: typeStr
		}
	})

	if (testType == 'review') {
		con.chapter_name = '智能记忆'
	}

	fnshowtopic();

	function fnshowtopic() {
		var e_cHtml = '',
			c_eHtml = '',
			listeningTestHtml = '';

		$.each(e_c_Arr, function (index, element) {
			e_cHtml += `<li data-correct="${element.word_mean}" class="correct">
							
							<h4>${index+1}.${element.word_name.replace(/\•/g,'')} <span class="unsel" style="margin-left:40px;"></span></h4>
							<ul class="item">
								<li  data-type="${element.chinese[0].type}">
									<i class="yes"></i>
									${element.chinese[0].content}
								</li>
								<li data-type="${element.chinese[1].type}" >
									<i class="no"></i>
									${element.chinese[1].content}
								</li>
								<li data-type="${element.chinese[2].type}" >
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

		$.each(c_e_Arr, function (index, element) {
			c_eHtml += `<li data-correct="${element.word_name.replace(/\•/g,'')}" class=" ">
							<h4>${index+1}.${element.word_mean} <span class="unsel" style="margin-left:40px;"></span></h4>
							<ul class="item">
								<li data-type="${element.english[0].type}">
									<i class=""></i>
									${element.english[0].content.replace(/\•/g,'')}
								</li>
								<li data-type="${element.english[1].type}">
									<i class=""></i>
									${element.english[1].content.replace(/\•/g,'')}
								</li>
								<li data-type="${element.english[2].type}">
									<i class=""></i>
									${element.english[2].content.replace(/\•/g,'')}
								</li>
								<li data-type="${element.english[3].type}">
									<i class=""></i>
									${element.english[3].content.replace(/\•/g,'')}
								</li>
							</ul>
							<span class="status"></span>
						</li>`;
		});
		$("#c_e .tests").html(c_eHtml);

		$.each(wordsArr, function (index, element) {
			listeningTestHtml += `<li data-correct="${element.word_mean}"  class="error">
							&nbsp;&nbsp;${index+1}. <button class="listenbtns" data-wordurl="${element.word_url}">听读音</button>
							<span class="unsel" style="margin-left:40px;"></span>
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
		$("#listeningTest li button").on("click", function () {
			var playerSrc = thisUrl2 + this.dataset.wordurl;
			$("#audioplay").attr("src", playerSrc);
		});
		//通过修改class来标注选项的对错
		console.log(liObjArr);
		var bigLiAll = $(".tests > li > ul");  // 每个 item
		bigLiAll.each(function(){
			$(this).find('li i').attr('class',"no");
			$(this).parent().attr('class','error');
		});
		$.each(liObjArr, function(index , element) {
			bigLiAll.eq(element.liIndex).find('li').eq(element.answerIndex)
				.find('i').attr('class',"yes");
			if(element.myCheckedIndex >= 0){
				bigLiAll.eq(element.liIndex).find('li').eq(element.myCheckedIndex)
				.css('background','#eee');	
			}else{
				bigLiAll.eq(element.liIndex).parent().find('.unsel').text('未作答');
			}
			if(element.isCorrect){
				bigLiAll.eq(element.liIndex).parent().attr('class','correct');
			}
		});	

//		sessionStorage.e_c_Arr = undefined;
//		sessionStorage.c_e_Arr = undefined;
//		sessionStorage.wordsArr = undefined;
	}
})