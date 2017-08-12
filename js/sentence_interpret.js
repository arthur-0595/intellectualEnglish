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
	var thistype = 2; //1听力2翻译3默写
	//当前听力的句子变量,由句子的每个单个项组成的数组,顺序没打乱时的数组
	var thisSentence, thisSentenceArr, sentenceInTheRightOrderArr;
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

	fnUpdatesentence();
//	$("#listening").on("click", function() {
//		$("#audioplay").attr("src", audioplaySrc);
//	});

	$("#clear").on("click", function() {
		$("span.ans_word").html('').attr('class', 'ans_null');
		$("li.actived").attr('class', '')
			.css('cursor', 'pointer');
		fnclickItems();
	});

	$("#reset").unbind().on("click", function() {
		fnclickresetBtn();
//		$("#thisSentence_con").show();
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
				// console.log('返回的数据'+JSON.stringify(data));
				if(data[0]) {
					thisSentence = data[0];

					var processorSentence = fnprocessor(thisSentence.sentence);
					//将句子切割成数组
					thisSentenceArr = processorSentence.split(' ');
					sentenceInTheRightOrderArr = processorSentence.split(' ');
					console.log(thisSentenceArr);
					//自动播放语音文件
					audioplaySrc = thisUrl2 + thisSentence.sentence_url;
//					$("#audioplay").attr("src", audioplaySrc);
					//获取到数据之后更新对应的句子相关内容
					fnUpdateAll(thisSentence, thisSentenceArr, sentenceInTheRightOrderArr);
				} else if(data == 2){
					alert('学习完毕，下面进行测试');
					window.location="sentence_interpret_test.html"
				}else if(data == 3){
					alert('没有可学习的内容，请联系客服人员！');
					window.close();
				}

			}
		});
	}

	function fnUpdateAll(thisSentence_, thisSentenceArr_, sentenceInTheRightOrderArr_) {
		typeNum = 2;

		$("#clear").show();
		$("#reset").hide();

		$("#thisSentence_con").html(thisSentence_.sentence_mean);
		$("#interpret").html(thisSentence_.sentence);
		var re = /\,|\.|\!|\?/g;
		//趁数组还没有进行随机打乱的时候，填充上面答案列表的内容
		var answerArr_html = '';
		$.each(sentenceInTheRightOrderArr_, function(index, element) {
			if(!re.test(element)) {
				answerArr_html += `<span class="ans_null" id="${element}"></span>`;
			} else {
				answerArr_html += `<span class="punctuation">${element}</span>`;
			}
		});
		$("#answerArr").attr('class', 'answerArr').html(answerArr_html);
		//打乱数组的内容
		thisSentenceArr_.sort(function() {
			return(0.5 - Math.random());
		});
		console.log(thisSentenceArr_);

		//把处理过后的数组的每一项填到下面的选项中
		var items_html = '';
		$.each(thisSentenceArr_, function(index, element) {
			if(!re.test(element)) {
				items_html += `<li id="${element}">${element}</li>`;
			}
		});
		$("#items").show().html(items_html);
		//答案选项的点击事件
		fnclickItems();

		$("#enter").unbind().on("click", function() {
			fncontrast();
		})
	}

	function fncontrast() {
		typeNum--;

		if(typeNum == 1) {
			//首先获取下面正确选项的答案组成字符串
			var botString = '';
			botString = fnprocessor2(thisSentence.sentence);
			console.log(botString);
			//获取上面回答的选项内容组成字符串
			var topString = '';
			$.each($("span.ans_word"), function(index, element) {
				topString += element.innerHTML;
			});
			console.log(topString);

//			$("#thisSentence_con").show();
			$("#clear").hide();
			$("#reset").show();
			$("#items").html(thisSentence.sentence);
			if(botString === topString) { //校验正确时
				$("#answerArr").attr("class", 'answerArr correct')
					.find("span").css("color", '#57b3ff');
				//清除重组按钮的点击事件	
				$("#reset").attr('class', 'reset')
					.unbind()
					.css("cursor", 'default');
				//给enter按钮改变相应的样式，并绑定点击事件
				$("#enter").css({
					backgroundColor: '#ff7b57',
					cursor: 'pointer'
				}).unbind().on("click", function() {
					fncontrast();
				})
				//播放句子语音文件
				$("#audioplay").attr("src", audioplaySrc);

				$("span.ans_word").css('color', '#57b3ff');

			} else { //校验错误时，改变字体颜色，并标注对应的符号
				$("#answerArr").attr("class", 'answerArr error')
					.find("span").css("color", '#ff1919');
				//给重组按钮绑定对应的点击事件	
				$("#reset").attr('class', 'reset err')
					.unbind()
					.css("cursor", 'pointer')
					.on('click', function() {
						fnclickresetBtn();
//						$("#thisSentence_con").show();
					});
				//改变enter按钮的状态和颜色，取消其点击事件
				$("#enter").css({
					backgroundColor: '#999',
					cursor: 'default',
					boxShadow: 'none'
				}).unbind();
				
				//播放句子语音文件
				$("#audioplay").attr("src", audioplaySrc);

				fnestimateType();

				typeNum = 2;
			}
		} else if(typeNum <= 0) {
			fnupdateNext();
		}

	}
	//更新下一个例句的相关内容
	function fnupdateNext() {
		var sentenceType = 1;
		$.ajax({
			type: "POST",
			url: thisUrl + "/Areas/api/Interface.ashx",
			dataType: "json",
			data: {
				method: 'getnextSentence',
				id: thisSentence.id,
				neworold_word: sentenceType,
				user_id: username,
				unit_id: chapter_id,
				type: thistype
			},
			success: function(data) {
				if(data[0]) {
					console.log(JSON.stringify(data));
					thisSentence = data[0];

					var processorSentence = fnprocessor(thisSentence.sentence);
					//将句子切割成数组
					thisSentenceArr = processorSentence.split(' ');
					sentenceInTheRightOrderArr = processorSentence.split(' ');
					console.log(thisSentenceArr);
					//自动播放语音文件
					audioplaySrc = thisUrl2 + thisSentence.sentence_url;
//					$("#audioplay").attr("src", audioplaySrc);
					//获取到数据之后更新对应的句子相关内容
					fnUpdateAll(thisSentence, thisSentenceArr, sentenceInTheRightOrderArr);
				} else {
					alert('学习完毕，下面进行测试');
					window.location="sentence_interpret_test.html"
				}

			}
		});
	}

	function fnestimateType() {
		$.each($("span.ans_word"), function(index, element) {
			if(element.innerHTML == element.id) {
				$(element).css('color', '#57b3ff');
			} else {
				$(element).css('color', '#ff1919');
			}
		});

	}

	function fnrecallEvent() {
		$("span.ans_word").unbind()
			.on('click', function() {
				var topVal = this.innerHTML;

				$(this).html('').attr('class', 'ans_null');

				$.each($("#items>li"), function(index, element) {
					if(element.id == topVal) {
						$(element).attr('class', '')
							.css("cursor", 'pointer');
					}
				});

				fnclickItems();
			})
	}

	function fnclickItems() {
		$("#items>li").unbind().on("click", function() {
			var thisVal = $(this).html();
			$(".ans_null").eq(0).html(thisVal).attr('class', "ans_word");
			$(this).attr('class', 'actived').css("cursor", 'default').unbind();

			$("#items>li").on("selectstart", function() {
				return false;
			})

			fnrecallEvent();
		})
	}

	function fnclickresetBtn() {
		$("#enter").css({
				backgroundColor: '#ff7b57',
				cursor: 'pointer'
			})
			.unbind()
			.on("click", function() {
				fncontrast();
			})

//		$("#audioplay").attr("src", audioplaySrc);
		fnUpdateAll(thisSentence, thisSentenceArr, sentenceInTheRightOrderArr);
	}

	function fnprocessor(sentence_) {
		sentence_ = sentence_.replace(/\,+/g, ' ,');
		sentence_ = sentence_.replace(/\.+/g, ' .');
		sentence_ = sentence_.replace(/\?+/g, ' ?');
		sentence_ = sentence_.replace(/\!+/g, ' !');
		return sentence_;
	}

	function fnprocessor2(sentence_) {
		sentence_ = sentence_.replace(/\,+/g, '');
		sentence_ = sentence_.replace(/\.+/g, '');
		sentence_ = sentence_.replace(/\?+/g, '');
		sentence_ = sentence_.replace(/\!+/g, '');
		sentence_ = sentence_.replace(/\s+/g, '');
		return sentence_;
	}

});