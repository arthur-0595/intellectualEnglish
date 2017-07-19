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
	//当前听写的单词
	var thisListenWord;
	//当前听写的单词的ID和状态
	var thiswordId ,
		thiswordState = 1;//默认熟词，不为1则为生词
	//要测试的所有单词数组
	var wordArr , wordArrLength;
	var num = 0;
	//保存测试结果的数组
	var testsArr = [];
	
	var numEnt;

	textbook_id = sessionStorage.textbook_id;
	version_id = sessionStorage.version_id;
	chapter_id = sessionStorage.chapter_id;
	typeStr = sessionStorage.typeStr;
	textbook_name = sessionStorage.textbook_name;
	version_name = sessionStorage.version_name;
	chapter_name = sessionStorage.chapter_name;
	type = sessionStorage.type;

	//初试vue
	var titleBox = new Vue({
		el: "#titleBox",
		data: {
			textbook_name: textbook_name,
			version_name: version_name,
			chapter_name: chapter_name,
			typeStr: typeStr
		}
	})
	//获取当前要听写的单词
	fnupdateWord();

	//enter按钮
	$("#enter").on("click", function() {
		var inputVal = $("#wordinput").val();
		if(numEnt == 2) {
			numEnt--;
			$("#answer").show();

			if(inputVal == $("#answer").html()) {
				$("#status").show().attr("class", "status correct");
				$("#answer").attr("class", "answer");
				$("#wordinput").attr("disabled", true);

				numEnt--;
			} else {
				$("#status").show().attr("class", "status error");
				$("#answer").attr("class", "answer error");
				$("#wordinput").attr("disabled", true);
				
				thiswordState++;
			}
		} else if(numEnt == 1) {
			$("#wordinput").val("").attr('disabled', false);
			$("#wordinput")[0].focus();
			
			numEnt = 2;
		}else if(numEnt <= 0){
			fnsendWordState(thiswordId , thiswordState)
			
		}else if(numEnt == 666){//该值为666表示当前处于测试状态
			var thisStatus;
			if(inputVal == wordArr[num].word_name){
				thisStatus =  1;
			}else{
				thisStatus =  0;
			}
			
			var newObj = {
				index: wordArr[num].id,
				this_name: wordArr[num].word_name,
				this_mean: wordArr[num].word_mean,
				myVal: inputVal,
				status: thisStatus
			}
//			alert(JSON.stringify(newObj) );
			//构建测试的单词对象保存进数组，然后载入下一个单词
			testsArr.push(newObj);
			
			fnnextWord(); 
		}

	})
	
	function fnsendWordState(word_id , word_state){
		$.ajax({
			type:"POST",
			url:thisUrl2+"/Areas/Api/index.ashx",
			dataType: "json",
			data: {
				method: 'UpdateWriteState',
				id: word_id,
				word_state: word_state
			},
			success: function(data) {
//				console.log(JSON.stringify(data));
				if(data.msg == '更改成功'){
					fnupdateWord();
				}
			}
		});
	}

	function fnupdateWord() {
		$.ajax({
			type: "POST",
			url: thisUrl2 + "/Areas/Api/index.ashx",
			dataType: "json",
			data: {
				method: 'GetWrite',
				user_id: username,
				unit_id: chapter_id
			},
			success: function(data) {
				console.log(JSON.stringify(data));
				if(data[0]){
					fnshowthisWord(data[0]);
				}else if(data.msg == "默写完毕"){
					alert('听写完毕，下面进入测试！');
					//获取要测试的所有单词
					fnthisunitAllWord();
				}else if(data.msg == "无数据"){
					alert('注意，没有新的单词数据，请联系相关客服！');
				}else if(data.status == 0){
					alert('警告，错误信息，请尝试刷新，若该问题依然存在请联系相关客服！');
				}
				
			}
		});
	}

	//听写载入对应单词
	function fnshowthisWord(wordObj) {
		$("#wordinput").val("").attr('disabled',false);
		$("#wordinput")[0].focus();
		$("#answer").hide();
		$("#status").hide();
//		$("#translate").hide();
//		var word = new Vue({
//			el: "#word",
//			data: {
//				word_mean: wordObj.word_mean,
//				word_name: wordObj.word_name
//			}
//		})
		$("#translate").html(wordObj.word_mean);
		$("#answer").html(wordObj.word_name);

		numEnt = 2;
		
		thiswordId = wordObj.id;
	}
	
	//听写测试载入对应单词
	function fntestshowWord(wordObj){
		$("#wordinput").val("").attr('disabled',false);
		$("#wordinput")[0].focus();
		
		$("#translate").html(wordObj.word_mean);
		
		$("#thisStudy").html('进度：'+(num+1)+'/'+wordArrLength);
		
		numEnt = 666;
	}
	//下一个
	function fnnextWord() {
		num++;
		if(num < wordArrLength){
			fntestshowWord(wordArr[num]);
			
		}else if(num >= wordArrLength){
			alert('测试完成');
			console.log(JSON.stringify(testsArr) );
			sessionStorage.wordTestsArr = JSON.stringify(testsArr);
			var Nnum = 0;
			$.each(testsArr, function(index , element) {
				if(element.status == 1){
					Nnum++;
				}
			});
			var thisScore = Math.round( (Nnum/testsArr.length)*100 );
//			alert(thisScore);
			
			window.location="sentence_test.html?score="+thisScore;
		}
	}
	
	//获取所有测试单词
	function fnthisunitAllWord(){
		$("#answer").hide();
		$("#status").hide();
//		$("#translate").hide();
		$("#schedule").hide();
		
		
		$.ajax({
			type:"POST",
			url:thisUrl2 + "/Areas/Api/index.ashx",
			dataType: "json",
			data: {
				method: 'GetDictationTest',
				user_id: username,
				unit_id: chapter_id
			},
			success: function(data) {
//				console.log(JSON.stringify(data));
				if(data[0]){
					wordArr = data;
					wordArrLength = wordArr.length;
					
					fntestshowWord(wordArr[0]);
				}else{
					alert('单词获取失败，请尝试刷新！');
				}
				
			}
		});
	}

})





















































