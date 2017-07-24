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
	var typeStr, textbook_name, version_name, chapter_name;
	//当前语音文件播放路径
	var audioplaySrc;
	
	var answerArr;
	
	$.getUrlParam = function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if(r != null) return decodeURI(r[2]);
		return null;
	};
	var urlScore = $.getUrlParam('score');
	$("#thisScore").html(urlScore);
	
	textbook_id = sessionStorage.textbook_id;
	version_id = sessionStorage.version_id;
	chapter_id = sessionStorage.chapter_id;
	typeStr = sessionStorage.typeStr;
	textbook_name = sessionStorage.textbook_name;
	version_name = sessionStorage.version_name;
	chapter_name = sessionStorage.chapter_name;
	
	answerArr = JSON.parse(sessionStorage.thisTestArr) ;

	var versions = new Vue({
		el: "#versions",
		data: {
			textbook_name: textbook_name,
			version_name: version_name,
			chapter_name: chapter_name
		}
	})
	
	var tabs = new Vue({
		el:'#tabs',
		data:{
			items:answerArr
		}
	})
	fnclickPlayer();
	
	function fnclickPlayer(){
		var listenA = document.getElementsByClassName('listen');
		var audioplay = document.getElementById('audioplay');
		for (var i = 0 ; i < listenA.length ; i++) {
			listenA[i].onclick=function(){
				audioplaySrc = this.dataset.src;
				audioplay.src = audioplaySrc;
			}
		}
	}
	
	

})