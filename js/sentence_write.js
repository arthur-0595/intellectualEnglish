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
	//当前语音文件播放路径
	var audioplaySrc;
	//当前例句大类的类型
	var thistype = 3; //1听力2翻译3默写
	//当前听力的句子变量,由句子的每个单个项组成的数组,顺序没打乱时的数组
	var thisSentence, thisSentenceArr;
	//当前正确或者错误的状态值
	var typeNum = 2;

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
				if(data[0]) {
					thisSentence = data[0];

					//自动播放语音文件
					audioplaySrc = thisUrl2 + thisSentence.sentence_url;
					//获取到数据之后更新对应的句子相关内容
					fnUpdateAll(thisSentence);
				} else {
					alert('学习完毕，下面进行测试');
					//					window.location="sentence_listen_test.html"
				}
			}
		});
	}

	function fnUpdateAll(senObj) {
		typeNum = 2;
		word.sentence_mean = senObj.sentence_mean;
		word.sentence = senObj.sentence;

		document.getElementById('input').focus();
	}

	function fnclickEnter() {
		typeNum--;
		var myVal = $.trim($("#input").val());
		var answer = $.trim(thisSentence.sentence);

		if(typeNum == 1) {
			if(fndisposeSen(myVal) == fndisposeSen(answer)) {
				alert('正确');
				typeNum--;
			}else{
				alert('错误');
				typeNum == 2;
			}
		} else if(typeNum == 0) {
			alert('载入下一个句子');
		}

	}

	function fndisposeSen(sentence_) {
		return sentence_.replace('.', '');
	}

})