$(function () {
    //获取用户ID
    var userMessage = sessionStorage.userMessage;
    if (userMessage) {
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
    var thistype = 1; //1听力2翻译3默写
    //当前听力的句子变量,由句子的每个单个项组成的数组,顺序没打乱时的数组
    var thisSentence, thisSentenceArr, sentenceInTheRightOrderArr;
    //当前测试所有句子的数组，数组长度，以及构建的一个作为测试结果的数组缓存下来
    var dataArr,
        dataArrLength,
        testResultArr = [];
    var num = 0; //用来记录当前题目
    //是否是学前测试
	var beforeLearning = 1;//默认不是学前测试
	//是否是直接进入测试
	var countTest = 1;//默认是经过了学习之后进入的

    textbook_id = sessionStorage.textbook_id;
    version_id = sessionStorage.version_id;
    chapter_id = sessionStorage.chapter_id;
    typeStr = sessionStorage.typeStr;
    textbook_name = sessionStorage.textbook_name;
    version_name = sessionStorage.version_name;
    chapter_name = sessionStorage.chapter_name;
    type = sessionStorage.type;

    var titleBox = new Vue({
        el: "#titleBox",
        data: {
            textbook_name: textbook_name,
            version_name: version_name,
            chapter_name: chapter_name,
            typeStr: typeStr
        }
    });

    $.getUrlParam = function (name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) return decodeURI(r[2]);
		return null;
	};
	var beforeLearningType = $.getUrlParam('beforeLearning');
	var countTestType = $.getUrlParam('countTest');
	//如果检测到有该参数，则说明是学前测试，在传分数的时候要把对应的状态值传过去
	if(beforeLearningType){
		beforeLearning = beforeLearningType;
	}
	//如果检测到有该参数，则说明是没有经过学习直接进入测试，在传分数的时候要把对应的状态值传过去
	if(countTestType){
		countTest = countTestType;
    }

    fnUpdatesentence();

    $("#listening").on("click", function () {
        $("#audioplay").attr("src", audioplaySrc);
    });

    $("#clear").on("click", function () {
        $("span.ans_word").html('').attr('class', 'ans_null');
        $("li.actived").attr('class', '')
            .css('cursor', 'pointer');
        fnclickItems();
    });

    document.onkeyup = function (event) {
		var e = event || window.event || arguments.callee.caller.arguments[0];
		if (e && e.keyCode == 17) {
			$("#listening").trigger('click');
		}else if(e && e.keyCode == 16){
			$("#clear").trigger('click');
		}else if(e && e.keyCode == 13){
			$("#enter").trigger('click');
		}
	};

    function fnUpdatesentence() {
        $.ajax({
            type: "POST",
            url: thisUrl + "/Areas/Api/Interface.ashx",
            dataType: "json",
            data: {
                method: 'getSentence',
                unit_id: chapter_id,
                type: thistype
            },
            success: function (data) {
                if (data[0]) {
                    dataArr = data;
                    dataArrLength = data.length;

                    fnArrEvent(dataArr[0]);
                }
            }
        });
    }

    function fnArrEvent(arr_o) {
        $("#thisStudy").html(`进度： ${num + 1}/${dataArrLength}`);

        thisSentence = arr_o;
        var processorSentence = fnprocessor(thisSentence.sentence);
        // console.log(processorSentence);
        //将句子切割成数组
        thisSentenceArr = processorSentence.split(' ');
        sentenceInTheRightOrderArr = processorSentence.split(' ');
        //自动播放语音文件
        audioplaySrc = thisUrl2 + thisSentence.sentence_url;
        $("#audioplay").attr("src", audioplaySrc);
        //获取到数据之后更新对应的句子相关内容
        fnUpdateAll(thisSentence, thisSentenceArr, sentenceInTheRightOrderArr);
    }

    function fnUpdateAll(thisSentence_, thisSentenceArr_, sentenceInTheRightOrderArr_) {
        $("#thisSentence_con").html(thisSentence_.sentence);
        $("#interpret").html(thisSentence_.sentence_mean);
        var re = /\,|\.|\!|\?/g;
        //趁数组还没有进行随机打乱的时候，填充上面答案列表的内容
        var answerArr_html = '';
        $.each(sentenceInTheRightOrderArr_, function (index, element) {
           if (re.test(element)) {
				answerArr_html += `<span class="punctuation">${element}</span>`;
			} else {
				answerArr_html += `<span class="ans_null" id="${element}"></span>`;
			}
        });
        $("#answerArr").attr('class', 'answerArr').html(answerArr_html);
        //打乱数组的内容
        thisSentenceArr_.sort(function () {
            return (0.5 - Math.random());
        });
        // console.log(thisSentenceArr_);
        //把处理过后的数组的每一项填到下面的选项中
        var items_html = '';
        $.each(thisSentenceArr_, function (index, element) {
            if (!re.test(element)) {
                items_html += `<li id="${element}1">${element}</li>`;
            }
        });
        $("#itemsAnswer").show().html(items_html);
        //答案选项的点击事件
        fnclickItems();

        $("#enter").unbind().on("click", function () {
            fncontrast();
        })
    }

    function fncontrast() {
        if($("span.ans_word").length == 0){
            $("#hint").fadeIn(200).delay(1500).fadeOut(200);
            return false;
        }
        
        num++;
        //首先获取下面正确选项的答案组成字符串
        var botString = '';
        botString = fnprocessor2(thisSentence.sentence);
        // console.log(botString);
        //获取上面回答的选项内容组成字符串
        var topString = '';
        $.each($(".answerArr>span"), function (index, element) {
            topString += element.innerHTML;
        });
        topString = fnprocessor2(topString);
        // console.log(topString);
        //对本次回答的答案进行判断
        var answerType = 1;
        if (botString == topString) {
            answerType = 1;
        } else {
            answerType = 2;
        }
        //构建本次回答答案的句子
        var thisanswerSentence = '';
        $.each($("#answerArr>span"), function (index, element) {
            thisanswerSentence += element.innerHTML + ' ';
        });
        //构建当前题目相关信息的对象
        var newObj = {
            index: num,
            this_name: $.trim(thisSentence.sentence),
            this_mean: $.trim(thisSentence.sentence_mean),
            status: answerType,
            myVal: thisanswerSentence
        };
        testResultArr.push(newObj);

        if (num + 1 <= dataArrLength) {
            fnupdateNext();
        } else {
        	$("#alertBox").show().find('h4').text('测试结束，公布答案');
			$('#btnOk').on('click',function(){				
				$("#alertBox").hide();
                sessionStorage.testResultArr = JSON.stringify(testResultArr);
                sessionStorage.wordTestsArr = null;          
	            var Nnum = 0;
				$.each(testResultArr, function(index , element) {
					if(element.status == 1){
						Nnum++;
					}
				});
				var thisScore = Math.round( (Nnum/testResultArr.length)*100 );	            
	            fnsavethisScore(thisScore, testResultArr.length);
			});            
        }
    }

    //更新下一个例句的相关内容
    function fnupdateNext() {
        fnArrEvent(dataArr[num]);
    }

    function fnrecallEvent() {
        $("span.ans_word").unbind()
            .on('click', function () {
                var topVal = this.innerHTML;

                $(this).html('').attr('class', 'ans_null');

                $.each($("#itemsAnswer>li.actived"), function (index, element) {
                    if ( element.id == (topVal+'1') ) {
                        $(element).attr('class', '')
                            .css("cursor", 'pointer');
                        return false
                    }
                });

                fnclickItems();
            })
    }

    function fnclickItems() {
        $("#itemsAnswer>li").unbind().on("click", function () {
            var thisVal = $(this).html();
            $(".ans_null").eq(0).html(thisVal).attr('class', "ans_word");
            $(this).attr('class', 'actived').css("cursor", 'default').unbind();

            $("#itemsAnswer>li").on("selectstart", function () {
                return false;
            })

            fnrecallEvent();
        })
    }

    function fnclickresetBtn() {
        $("#enter").unbind()
            .on("click", function () {
                fncontrast();
            })

        $("#audioplay").attr("src", audioplaySrc);
        fnUpdateAll(thisSentence, thisSentenceArr, sentenceInTheRightOrderArr);
    }

    function fnprocessor(sentence_) {
        // console.log(sentence_);
        sentence_ = $.trim(sentence_);
        sentence_ = sentence_.replace(/(\,|\?|\!)([a-zA-z]+)/g, '$1 $2');
        // console.log(sentence_);
        sentence_ = sentence_.replace(/(\w+)(\,|\?|\!)([^0-9]+)/g, '$1 $2$3');
        // console.log(sentence_);
        sentence_ = sentence_.replace(/(\w)(\.|\?|\!{1})$/g, '$1 $2');
        // console.log(sentence_);
        sentence_ = sentence_.replace(/(\w+)([\s]{1})([\.]{1})(\w+)/g, '$1$3$4');
        // console.log(sentence_);
        sentence_ = sentence_.replace(/(\w+)(\,|\.|\?|\!{1})(\s{1})/g, '$1 $2$3');
        // console.log(sentence_);
        return sentence_;
    }

    function fnprocessor2(sentence_) {
        sentence_ = sentence_.replace(/\s/g, '');
        sentence_ = sentence_.replace(/[\.\?\!\,]/g, '');
        return sentence_;
    }

    function fnsavethisScore(thisScore_, length) {
        var stringLearnType;
		if(beforeLearning == 0){
			stringLearnType = "学前测试";
		}else{
			stringLearnType = "闯关测试";
		}
        var testsType = typeStr + stringLearnType +"(" + version_name + '-' + textbook_name + ")";
        var typeId = parseInt(type);
        
		$.ajax({
			type: "POST",
			url: thisUrl2 + '/Areas/Api/index.ashx',
			dataType: "json",
			data: {
				method: "SaveTestRecord",
				user_id: username,
				textbook_id: textbook_id,
				test_type: testsType,
				test_score: thisScore_,
                test_number: length,
                study_type: typeId,
				type: beforeLearning,
				unit_id: chapter_id,
				count: countTest
			},
			success: function (data) {
				// console.log(JSON.stringify(data));
				if (data.msg == "保存成功") {
					window.location = 'sentence_test.html?score='+thisScore_;
				} else {
					$("#alertBox").show().find('h4').text('成绩上传失败，请重试');
					$('#btnOk').on('click',function(){				
						$("#alertBox").hide();
					});
				}
			}
		});
	}

});