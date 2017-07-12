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
	
	textbook_id = sessionStorage.textbook_id;
	version_id = sessionStorage.version_id;
	chapter_id = sessionStorage.chapter_id;
	typeStr = sessionStorage.typeStr;
	textbook_name = sessionStorage.textbook_name;
	version_name = sessionStorage.version_name;
	chapter_name = sessionStorage.chapter_name;
	type = sessionStorage.type;
	
	var wordTestsArr =  sessionStorage.wordTestsArr;
	wordTestsArr = JSON.parse(wordTestsArr);
	
	$.getUrlParam = function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if(r != null) return decodeURI(r[2]);
		return null;
	};
	var urlScore = $.getUrlParam('score');
	//初试vue
	var headercon = new Vue({
		el: "#headercon",
		data: {
			textbook_name: textbook_name,
			version_name: version_name,
			chapter_name: chapter_name,
			typeStr: typeStr
		}
	})
	var score = new Vue({
		el: "#score",
		data: {
			score: urlScore
		}
	})
	fnshowstatus();
	
	function fnshowstatus(){
		var conHtml = '';
		$.each(wordTestsArr, function(index , element) {
			var status = '';
			if(element.status == 1){
				status = 'correct';
			}else{
				status = 'error';
			}
			conHtml+=`<li class="${status}">
					<h4><span>${index+1}.</span>${element.word_name}</h4>
					<div class="myans">
						${element.myVal}
					</div>
					<div class="translate">
						${element.word_mean}
					</div>
				</li>`;
		});
		
		$("#sectionCon").html(conHtml);
	}
	

})