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
	var thistype = 1; //1听力2翻译3默写
	//当前听力的句子变量,由句子的每个单个项组成的数组
	var thisSentence, thisSentenceArr;

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

	fnUpdatesentence();

	$("#listening").on("click", function() {
		$("#audioplay").attr("src", audioplaySrc);
	});

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
				//				console.log(JSON.stringify(data));
				thisSentence = data[0];

				var processorSentence = fnprocessor(thisSentence.sentence);
				//将句子切割成数组
				thisSentenceArr = processorSentence.split(' ');
				console.log(thisSentenceArr);
				//自动播放语音文件
				audioplaySrc = thisUrl2 + thisSentence.sentence_url;
				$("#audioplay").attr("src", audioplaySrc);
				//获取到数据之后更新对应的句子相关内容
				fnUpdateAll(thisSentence, thisSentenceArr);
			}
		});
	}

	function fnprocessor(sentence_) {
		sentence_ = sentence_.replace(/\,+/g, ' ,');
		sentence_ = sentence_.replace(/\.+/g, ' .');
		sentence_ = sentence_.replace(/\?+/g, ' ?');
		sentence_ = sentence_.replace(/\!+/g, ' !');
		return sentence_;
	}

	function fnUpdateAll(thisSentence_, thisSentenceArr_) {
		$("#thisSentence_con").html(thisSentence_.sentence);
		$("#interpret").html(thisSentence_.sentence_mean);
		var re = /^\,|\.|\!|\?$/g;

		thisSentenceArr_.sort(function() {
			return(0.5 - Math.random());
		})
		alert(thisSentenceArr_);

		//把处理过后的数组的每一项填到下面的选项中
		var items_html = '';
		$.each(thisSentenceArr_, function(index, element) {
			if(!re.test(element)) {
				items_html += `<li>${element}</li>`;
			}
		});
		$("#items").show().html(items_html);

		//		$.each($("#answerArr>span"), function(index , element) {
		//			if( re.test(element.innerHTML) ){
		//				$(element).attr('class' , 'punctuation');
		//			}
		//		});
		//当回答错误时，改变字体颜色，并标注对应的符号
		//		$("#answerArr").attr("class" , 'answerArr error')
		//					.find("span").css("color" , '#ff1919');
	}

})