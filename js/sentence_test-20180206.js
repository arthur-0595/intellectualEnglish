$(function() {
	//获取用户ID
	var userMessage = sessionStorage.userMessage;
	if(userMessage) {
		userMessage = JSON.parse(userMessage);
		var username = userMessage[0].ID;
	} else {
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
	var testResultArr =  sessionStorage.testResultArr;
	
	$.getUrlParam = function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if(r != null) return decodeURI(r[2]);
		return null;
	};
	var urlScore = $.getUrlParam('score');
	
	 // 根据测试分数显示gif动画
    if(urlScore<=60){
		$('#gifImg').css('background','url(../imgs/14.gif) no-repeat center center');
	}else if(urlScore>60 && urlScore <=80){
		$('#gifImg').css('background','url(../imgs/114.gif) no-repeat center center');
	}else if(urlScore>80 && urlScore <=99){
		$('#gifImg').css('background','url(../imgs/112.gif) no-repeat center center');
	}else if(urlScore==100){
		$('#gifImg').css('background','url(../imgs/113.gif) no-repeat center center');
	}	
	// gif停留5秒消失
	var totalNum = 5;
	setInterval(function(){
		totalNum--;
		if(totalNum<=0){
			$('#gifImg').hide(200);
			return;
		}
	},1000);
	
	
	//初试vue
	var headercon = new Vue({
		el: "#headercon",
		data: {
			textbook_name: textbook_name,
			version_name: version_name,
			chapter_name: chapter_name,
			typeStr: typeStr
		}
	});
	var score = new Vue({
		el: "#score",
		data: {
			score: urlScore
		}
	});
	
	if(testResultArr.length>10){
		testResultArr = JSON.parse(testResultArr);
		// console.log('查看缓存testResultArr--:' + testResultArr);
		fnshowstatus(testResultArr);
	}else if(wordTestsArr.length>10){
		wordTestsArr = JSON.parse(wordTestsArr);
		// console.log('查看缓存wordTestsArr--:' + wordTestsArr);
		fnshowstatus(wordTestsArr);
	}
	
	function fnshowstatus(arr_){
		var conHtml = '';
		$.each(arr_, function(index , element) {
			var status = '';
			if(element.status == 1){
				status = 'correct';
			}else{
				status = 'error';
			}
			
			var re = /^(\,|\.|\!|\?)$/g;
			if( re.test( $.trim(element.myVal) ) ){
				element.myVal = '';
			}
			conHtml+=`<li class="${status}">
					<h4><span>${index+1}.</span>${element.this_name}</h4>
					<div class="myans">
						${element.myVal}
					</div>
					<div class="translate">
						${element.this_mean}
					</div>
				</li>`;
		});
		
		$("#sectionCon").html(conHtml);
	}
	

})