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
	//当前听写的单词或句子
	var thisListen;
	//当前类别所有的口语组成的数组，以及数组长度
	var spokenLanguageArr = [],
		spokenLanguageArrlength;
	//当前在第几个句子
	var thisListenNum = 0;
	//当前句子的ID
	var thisSenId;
	//该次测试的数组
	var thisTestArr = [];

	textbook_id = sessionStorage.textbook_id;
	version_id = sessionStorage.version_id;
	chapter_id = sessionStorage.chapter_id;
	typeStr = sessionStorage.typeStr;
	textbook_name = sessionStorage.textbook_name;
	version_name = sessionStorage.version_name;
	chapter_name = sessionStorage.chapter_name;

	var versions = new Vue({
		el: "#versions",
		data: {
			textbook_name: textbook_name,
			version_name: version_name,
			chapter_name: chapter_name
		}
	})
	fnupdateTest();

	//点击播放按钮
	$("#player").on('click', function() {
		$("#audioplay").attr('src', audioplaySrc);
	});

	//点击下一个按钮
	$("#enter").on('click', function() {
		fnclickEnter();
	});

	function fnupdateTest() {
		$.ajax({
			type: "post",
			url: thisUrl2 + "/Areas/api/Index.ashx",
			dataType: 'json',
			data: {
				method: 'GetSpokenTest',
				type_id: chapter_id
			},
			async: true,
			success: function(data) {
				console.log(data);

				spokenLanguageArr = data;
				//考一轮听力理解，考一轮口语表达
				$.each(spokenLanguageArr, function(index, element) {
					spokenLanguageArr.push(element);
				});
				spokenLanguageArrlength = spokenLanguageArr.length;

				fnupdateItem(spokenLanguageArr[0], 1);
			}
		});
	}

	var centent = new Vue({
		el: '#centent',
		data: {
			thisLabelId: 1,
			items: [{
					"type": 0,
					"content": "我来自中国北京，您呢？++"
				},
				{
					"type": 1,
					"content": "您好！我叫约翰史密斯，很高兴见到您。++"
				},
				{
					"type": 0,
					"content": "噢，谢谢。++"
				},
				{
					"type": 0,
					"content": "丹，您来自哪里？++"
				}
			]
		}
	})
	//听力理解
	function fnupdateItem(obj_) {
		thisListen = obj_;
		centent.thisLabelId = obj_.id;

		audioplaySrc = thisUrl + obj_.sentence_url;
		$('#audioplay').attr('src', audioplaySrc);

		centent.items = obj_.chinese;
		
		//清空每一个input的checked
		$("input").attr('checked' , false);
	}
	//口语表达
	function fnupdateSpoken(obj_){
		
	}

	function fnclickEnter() {
		thisListenNum++;
		
		//对本次回答的答案进行判断
        var answerType = 1;//默认错误
        $.each( $("#centent input") , function(index , element) {
        	if($(element).prop('checked') == true && $(element).parent()[0].id == 1){
 				answerType = 2;//修改状态为正确      		
        	}
        });
        
        //构建该题的相关信息，push进数组里
        var newObj = {
            index: thisListenNum,
            this_name: thisListen.sentence,
            this_mean: thisListen.sentence_mean,
            status: answerType,
            audioplaySrc: audioplaySrc
        };
        thisTestArr.push(newObj);
        
		if(thisListenNum < spokenLanguageArrlength) {
			if(thisListenNum < 9) {
				fnupdateItem(spokenLanguageArr[thisListenNum]);
			} else {
				console.log(thisTestArr);
				alert('听力理解完成，下面是口语表达，不过还没做好');
				return false;
				fnupdateSpoken(obj_);
			}
		}else{
			alert('测试完成');
			window.location='read_advance_answer.html';
		}
	}

})