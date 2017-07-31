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
	//当前语音文件播放路径
	var audioplaySrc;
	//当前例句大类的类型
	var thistype = 3; //1听力2翻译3默写
	//当前听力的句子变量,由句子的每个单个项组成的数组,顺序没打乱时的数组
	var thisSentence, thisSentenceArr;
	//当前正确或者错误的状态值
	var typeNum = 2;
	var thisState = 1; //默认熟词，不为1则为生词
	//要测试的所有句子的数组，以及当前句子的计数
	var sentenceArr, sentenceArrLength, num = 0;
	//保存测试结果的数组
	var testsArr = [];

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
	});

	var word = new Vue({
		el: "#word",
		data: {
			sentence_mean: 'sentence_mean',
			sentence: 'sentence'
		}
	});

	fnUpdatesentence();

	$("#enter").on('click', function() {
		fnclickEnter();
	})

	function fnUpdatesentence() {
		$.ajax({
			type: "POST",
			url: thisUrl + "/Areas/Api/Interface.ashx",
			dataType: "json",
			data: {
				method: 'Sentence',
				user_id: username,
				unit_id: chapter_id,
				type: thistype
			},
			success: function(data) {
				console.log(JSON.stringify(data));
				if(!data[0].sentence){
					alert('没有可学习的内容，请联系客服人员！');	
					window.close();
				}
				if(data[0]) {
					thisSentence = data[0];

					//自动播放语音文件
					audioplaySrc = thisUrl2 + thisSentence.sentence_url;
					//获取到数据之后更新对应的句子相关内容
					fnUpdateAll(thisSentence);
				} else {
					alert('学习完毕，下面进行测试');
					fnthisunitAllSen();
				}
			}
		});
	}

	function fnUpdateAll(senObj) {
		$("#status").hide();
		$("#input").val("").attr('disabled', false).css('color', '#333');
		$("#input")[0].focus();
		$("#answer").attr("class", "answer");

		typeNum = 2;
		word.sentence_mean = senObj.sentence_mean;
		word.sentence = senObj.sentence;

		document.getElementById('input').focus();
	}

	function fnclickEnter() {
		var myVal = $.trim($("#input").val());
		if(typeNum == 2) {
			var answer = $.trim(thisSentence.sentence);
			typeNum--;
			if(fndisposeSen(myVal) == fndisposeSen(answer)) {
				$("#status").show().attr("class", "status correct");
				$("#answer").attr("class", "answer show");
				$("#input").attr("disabled", true).css('color', '#57B3FF');

				typeNum--;
			} else {
				$("#status").show().attr("class", "status ");
				$("#answer").attr("class", "answer show");
				$("#input").attr("disabled", true).css('color', '#ff1919');

				thisState++; //只要答错一次该值就加1，后台接收只要该值不为1则为生词
			};
		} else if(typeNum == 1) {
			$("#status").hide();
			$("#input").val("").attr('disabled', false).css('color', '#333');
			$("#input")[0].focus();

			typeNum = 2;
		} else if(typeNum == 0) {
			fnupdateNext();
			
		} else if(typeNum == 666) { //该值为666表示当前处于测试状态
			var thisStatus;
			if(fndisposeSen(myVal) == fndisposeSen(sentenceArr[num].sentence)) {
				thisStatus = 1;
			} else {
				thisStatus = 0;
			}
			
			var newObj = {
				index: sentenceArr[num].id,
				this_name: sentenceArr[num].sentence,
				this_mean: sentenceArr[num].sentence_mean,
				myVal: myVal,
				status: thisStatus
			}
			//构建测试的单词对象保存进数组，然后载入下一个单词
			testsArr.push(newObj);

			fnnextSen();
		};
	}

	function fnupdateNext() {
		$.ajax({
			type: "POST",
			url: thisUrl + "/Areas/Api/Interface.ashx",
			dataType: "json",
			data: {
				method: 'getnextSentence',
				id: thisSentence.id,
				neworold_word: thisState,
				user_id: username,
				unit_id: chapter_id,
				type: thistype
			},
			success: function(data) {
				if(data[0]) {
					thisSentence = data[0];

					//自动播放语音文件
					audioplaySrc = thisUrl2 + thisSentence.sentence_url;
					//获取到数据之后更新对应的句子相关内容
					fnUpdateAll(thisSentence);
				} else {
					alert('学习完毕，下面进行测试');

					fnthisunitAllSen();
				}
			}
		});
	}

	//获取所有测试单词
	function fnthisunitAllSen() {
		$("#answer").attr('class', 'answer');
		$("#status").hide();
		$("#progressBar").hide();

		$.ajax({
			type: "POST",
			url: thisUrl + "/Areas/Api/Interface.ashx",
			dataType: "json",
			data: {
				method: 'getSentence',
				user_id: username,
				unit_id: chapter_id
			},
			success: function(data) {
				if(data[0]) {
					sentenceArr = data;
					sentenceArrLength = sentenceArr.length;

					fntestshowSen(sentenceArr[0]);
				} else {
					alert('单词获取失败，请尝试刷新！');
				}

			}
		});
	}

	function fnnextSen(arrObj_) {
		num++;
		if(num < sentenceArrLength) {
			fntestshowSen(sentenceArr[num]);
		} else if(num >= sentenceArrLength) {
			alert('测试完成');
			console.log(JSON.stringify(testsArr));
			sessionStorage.testResultArr = JSON.stringify(testsArr);
			var Nnum = 0;
			$.each(testsArr, function(index, element) {
				if(element.status == 1) {
					Nnum++;
				}
			});
			var thisScore = Math.round((Nnum / testsArr.length) * 100);
			//			alert(thisScore);

			window.location = "sentence_test.html?score=" + thisScore;
		}
	}

	//听写测试载入对应单词
	function fntestshowSen(wordObj) {
		$("#input").val("").attr('disabled', false);
		$("#input")[0].focus();

		word.sentence_mean = wordObj.sentence_mean;
		word.sentence = wordObj.sentence;

		$("#thisStudy").html('进度：' + (num + 1) + '/' + sentenceArrLength);

		typeNum = 666;
	}

	function fndisposeSen(sentence_) {
		if(typeof sentence_ == 'string'){
			return sentence_.replace('.', '');
		}else{
			return sentence_;
		}
		
	}

})