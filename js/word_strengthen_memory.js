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
	var textbook_id, chapter_id,version_id;
	var type,typeStr,textbook_name,version_name,chapter_name;
	//当前语音文件播放路径
	var audioplaySrc;
	//该单元下所有单词
	var wordsArr;

	var num = 0;
	//设定点击enter按钮的计数
	var numEnt = 2;
	//本章单词的数量
	var wordArrlength;
	//当前错误次数
	var errorNum = 0;

	//	$.getUrlParam = function(name) {
	//		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	//		var r = window.location.search.substr(1).match(reg);
	//		if(r != null) return decodeURI(r[2]);
	//		return null;
	//	};
	textbook_id = sessionStorage.textbook_id;
	version_id = sessionStorage.version_id;
	chapter_id = sessionStorage.chapter_id;
	typeStr = sessionStorage.typeStr;
	textbook_name = sessionStorage.textbook_name;
	version_name = sessionStorage.version_name;
	chapter_name = sessionStorage.chapter_name;
	type = sessionStorage.type;

	fnGetAllTheWords();

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

				fnshowthisWord(wordsArr[num]);
			}
		});
	}
	//载入对应单词
	function fnshowthisWord(wordObj) {
		$("#thisStudy").html('进度：'+(num+1)+'/'+wordArrlength);
		
		$("#wordinput").val("").attr('disabled',false);
		$("#wordinput")[0].focus();
		$("#answer").hide();
		$("#status").hide();
		
		$("#translate").html(wordObj.word_mean);
		$("#answer").html(wordObj.word_name);

		//设置播放路径，绑定听语音事件
		audioplaySrc = thisUrl2 + wordObj.word_url;
		$("#audioplay").attr("src", audioplaySrc);

		numEnt = 2;
	}
	//听语音按钮
	$("#voice").on("click", function() {
		$("#audioplay").attr("src", audioplaySrc);
	})
	//enter按钮
	$("#enter").on("click", function() {
		if(numEnt == 2) {
			numEnt--;
			
			$("#answer").show();
			$("#status").show();

			//输入的内容和正确答案进行对比
			var inputVal = $.trim( $("#wordinput").val() );
			if(inputVal == $("#answer").html()) {//输入正确
				$("#audioplay").attr("src", audioplaySrc);
				
				$("#answer").css("color", "#57b3ff");
				$("#status").attr("class", "status correct");
				$("#wordinput").attr("disabled", true);
				
				numEnt--;
			} else {//输入错误
				$("#answer").css("color", "#ff1919");
				$("#status").attr("class", "status");
				$("#wordinput").attr("disabled", true);
								
			}
		}else if(numEnt == 1){
			$("#wordinput").val("").attr('disabled', false);
			$("#wordinput")[0].focus();
			
			numEnt = 2;
			
		}else if(numEnt <= 0){
			fnnextWord();
		}
	})

	function fnnextWord() {
		num++;
		if(num < wordArrlength){
			fnshowthisWord(wordsArr[num]);
		}else if(num >= wordArrlength){
			alert("记忆强化完成，下面开始测试");
			fnintensifycomplete();
			window.location="word_simulationTest.html";
		}
		
	}
	
	function fnintensifycomplete(){
		$.ajax({
			type: "POST",
			url: thisUrl + '/Areas/Api/Interface.ashx',
			dataType: "json",
			data: {
				method: "memoryintersive",
				unit_id: chapter_id,
				user_id: username
			},
			success: function(data) {
				alert(data.result);
			}
		});
	}
})