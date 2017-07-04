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
	var textbook_id, version_id, chapter_id;
	var textbook_name, version_name, chapter_name;
	//当前的大类，大类的name
	var type, typeStr;

	$.getUrlParam = function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if(r != null) return decodeURI(r[2]);
		return null;
	};
	textbook_id = $.getUrlParam('textbook_id');
	version_id = $.getUrlParam('version_id');
	chapter_id = $.getUrlParam('chapter_id');
	typeStr = $.getUrlParam('typeStr');
	textbook_name = $.getUrlParam('textbook_name');
	version_name = $.getUrlParam('version_name');
	chapter_name = $.getUrlParam('chapter_name');

	$("#versions_h").html(version_name + ' - ' + textbook_name + ' - ' + chapter_name);

	//	alert(textbook_id+version_id+chapter_id+typeStr+textbook_name+version_name+chapter_name);
	//开始学习
	fnstudyStart();
	//显示倒计时
	fnshowcountDown();

	function fnstudyStart() {
		$.ajax({
			type: "POST",
			url: thisUrl + '/Areas/Api/Interface.ashx',
			dataType: "json",
			data: {
				method: "memory",
				user_id: username,
				unit_id: chapter_id
			},
			success: function(data) {
//				alert(JSON.stringify(data));
//				alert(data.result.length);
				if(data.result.length >= 1){
					var thisWord = data.result[0];
					$("#thisWord").html(`<sub id="soundmark">${thisWord.phonogram}</sub> ${thisWord.word_name}`);
					
					var answerHTML = `<h3>${thisWord.word_mean}</h3>
						<div class="illustrate">
							<p>Let me give an example to illustrate the point.</p>
							<p>让我举个例子来说明这一点。</p>
						</div>`;
					$("#answer").html(answerHTML);	
					
					var audioplaySrc = thisUrl2+thisWord.word_url;
					$("#audioplay").attr("src",audioplaySrc);
//					$("#audioplay").attr("autoplay", true);
					
					$("#voice").on("click",function(){
						$("#audioplay").attr("src",audioplaySrc);
					})
				}else if(data.result == 0){
					alert("单词获取失败，请尝试刷新！");
					window.location.reload();
				}else if(data.result == 2){
					alert("记忆结束，下面开始测试！");
				}
			}
		});

	}

	function fnshowcountDown() {
		var num = 5;
		$("#countDown").show();
		$("#answer").hide();
		var timer = setInterval(function() {
			num -= 1;
			$("#countDownTime").html(num);

			if(num <= 0) {
				clearInterval(timer);
				$("#countDown").hide();
				$("#answer").show();
			}
		}, 1000);

	}
})