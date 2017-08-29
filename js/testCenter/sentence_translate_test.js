$(function () {
    //获取用户ID
    var userMessage = sessionStorage.userMessage;
    if (userMessage) {
        userMessage = JSON.parse(userMessage);
        var username = userMessage[0].ID;
    } else {
        window.location = '../../index.html';
    }
    //当前选择的版本ID，教材ID ,选择的章节
    var textbook_id, chapter_id, version_id;
    var type, typeStr, textbook_name, version_name, chapter_name;
    //audio播放路径
    var audioplaySrc;
    //所有的要测试的句子的数组，数组的长度，以及声明一个作为测试结果的数组
    var sentenceArr,
        sentenceArrlength,
        testResultArr = [];
    //当前要测试的句子,以及当前句子所有单个单词组成的数组，然后保留一份顺序没打乱时的数组
    var thisSentence, thisSentenceArr, sentenceInTheRightOrderArr;
    //声明一个记录当前题目的变量
    var num = 0;
    var typeMethod;

    textbook_id = sessionStorage.textbook_id;
    version_id = sessionStorage.version_id;
    typeStr = sessionStorage.typeStr;
    textbook_name = sessionStorage.textbook_name;
    version_name = sessionStorage.version_name;
    type = sessionStorage.type;

    var titleBox = new Vue({
        el: "#titleBox",
        data: {
            textbook_name: textbook_name,
            version_name: version_name,
            typeStr: typeStr
        }
    })

    //根据URL传过来的测试类别，分别赋予typeMethod不同的值
    $.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]);
        return null;
    };
    var testType = $.getUrlParam('testType');
    switch (testType) {
        case '1':
            typeMethod = 'LearnTest';
            console.log('已学测试');
            fnUpdatesentence();
            break;
        case '2':
            typeMethod = 'NewWordTest';
            console.log('生词测试');
            fnUpdatesentence();
            break;
        case '3':
            typeMethod = 'OldWordTest';
            console.log('熟词测试');
            fnUpdatesentence();
            break;
        case 'review':
            $('title').html('例句翻译测试复习');
            fnUpdatesentenceTest();
            break;    
        default:
            typeMethod = 'LearnTest';
            break;
    }

    $("#clear").on("click", function () {
        $("span.ans_word").html('').attr('class', 'ans_null');
        $("li.actived").attr('class', '')
            .css('cursor', 'pointer');
        fnclickItems();
    });
    //键盘按键模拟点击事件
    document.onkeyup = function (event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if (e && e.keyCode == 16) {
            $("#clear").trigger('click');
        } else if (e && e.keyCode == 13) {
            $("#enter").trigger('click');
        }
    };

    function fnUpdatesentence() {
        var type_id = type.substr(-1);
        $.ajax({
            type: "POST",
            url: thisUrl + "/Areas/api/index.ashx",
            data: {
                method: typeMethod,
                user_id: username,
                textbook_id: textbook_id,
                type_id: type_id
            },
            dataType: "json",
            success: function (data) {
                // console.log(data);
                if (data[0]) {
                    sentenceArr = data;
                    sentenceArrlength = data.length;
                    fnupdateSentenceArr(sentenceArr[0]);
                }
            }
        });
    }
    //复习测试时，获取本教材所有可复习的单词
    function fnUpdatesentenceTest() {
        var type_id = type.substr(-1);
        $.ajax({
            type: "POST",
            url: thisUrl + "/Areas/api/Interface.ashx",
            data: {
                method: 'SenTestReview',
                user_id: username,
                textbookid: textbook_id,
                sentype: type_id
            },
            dataType: "json",
            success: function (data) {
                // console.log(data);
                if (data[0]) {
                    sentenceArr = data;
                    sentenceArrlength = data.length;

                    fnupdateSentenceArr(sentenceArr[0]);
                }
            }
        });
    }

    function fnupdateSentenceArr(obj_) {
        $("#thisStudy").html(`进度： ${num + 1}/${sentenceArrlength}`);

        thisSentence = obj_;
        var processorSentence = fnprocessor(thisSentence.sentence);
        //将句子切割成数组
        thisSentenceArr = processorSentence.split(' ');
        sentenceInTheRightOrderArr = processorSentence.split(' '); //保留顺序未打乱时的数组
        // console.log('顺序未打乱时：'+thisSentenceArr);

        //自动播放语音文件
        // audioplaySrc = thisUrl2 + thisSentence.sentence_url;
        // $("#audioplay").attr("src", audioplaySrc);

        //获取到数据之后更新对应的句子相关内容
        fnUpdateAll(thisSentence, thisSentenceArr, sentenceInTheRightOrderArr);
    }

    function fnUpdateAll(thisSentence_, thisSentenceArr_, sentenceInTheRightOrderArr_) {
        $("#thisSentence_con").html(thisSentence_.sentence_mean);
        $("#interpret").html(thisSentence_.sentence);
        var re = /\,|\.|\!|\?/g;
        //趁数组还没有进行随机打乱的时候，填充上面答案列表的内容
        var answerArr_html = '';
        $.each(sentenceInTheRightOrderArr_, function (index, element) {
            if (!re.test(element)) {
                answerArr_html += `<span class="ans_null" id="${element}"></span>`;
            } else {
                answerArr_html += `<span class="punctuation">${element}</span>`;
            }
        });
        $("#answerArr").attr('class', 'answerArr').html(answerArr_html);
        //打乱数组的内容
        thisSentenceArr_.sort(function () {
            return (0.5 - Math.random());
        });
        // console.log('顺序打乱时'+thisSentenceArr_);

        //把处理过后的数组的每一项填到下面的选项中
        var items_html = '';
        $.each(thisSentenceArr_, function (index, element) {
            if (!re.test($.trim(element))) {
                items_html += `<li id="${element}">${element}</li>`;
            }
        });
        $("#items").show().html(items_html);
        //答案选项的点击事件
        fnclickItems();

        $("#enter").unbind().on("click", function () {
            fncontrast();
        })
    }

    function fncontrast() {
        if ($("span.ans_word").length == 0) {
            $("#hint").stop(true, true).fadeIn(200).delay(1500).fadeOut(200);
            return false;
        }

        num++;
        //首先获取下面正确选项的答案组成字符串
        var botString = '';
        botString = fnprocessor2(thisSentence.sentence);
        // console.log('正确答案'+botString);
        //获取上面回答的选项内容组成字符串
        var topString = '';
        $.each($("span.ans_word"), function (index, element) {
            topString += element.innerHTML;
        });
        // console.log('我的回答'+topString);
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
            this_name: thisSentence.sentence,
            this_mean: thisSentence.sentence_mean,
            status: answerType,
            myVal: thisanswerSentence
        };
        testResultArr.push(newObj);

        if (num + 1 <= sentenceArrlength) {
            fnupdateNext();
        } else {
        	$("#alertBox").show().find('h4').text('测试结束，公布答案');
			$('#btnOk').on('click',function(){
				$("#alertBox").hide();
				sessionStorage.testResultArr = JSON.stringify(testResultArr);
	            var Nnum = 0;
	            $.each(testResultArr, function (index, element) {
	                if (element.status == 1) {
	                    Nnum++;
	                }
	            });
	            var thisScore = Math.round((Nnum / testResultArr.length) * 100);
	            if (testType == 'review') {
	                window.location = "sentence_test_score.html?score=" + thisScore;
	            } else {
	                fnsavethisScore(thisScore, testResultArr.length);
	            }
			});           
        }

    }

    //更新下一个例句的相关内容
    function fnupdateNext() {
        fnupdateSentenceArr(sentenceArr[num]);
    }

    function fnrecallEvent() {
        $("span.ans_word").unbind()
            .on('click', function () {
                var topVal = this.innerHTML;

                $(this).html('').attr('class', 'ans_null');

                $.each($("#items>li"), function (index, element) {
                    if (element.id == topVal) {
                        $(element).attr('class', '')
                            .css("cursor", 'pointer');
                    }
                });

                fnclickItems();
            })
    }

    function fnclickItems() {
        $("#items>li").unbind().on("click", function () {
            var thisVal = $(this).html();
            $(".ans_null").eq(0).html(thisVal).attr('class', "ans_word");
            $(this).attr('class', 'actived').css("cursor", 'default').unbind();

            $("#items>li").on("selectstart", function () {
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

        // $("#audioplay").attr("src", audioplaySrc);
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

    //发送成绩
    function fnsavethisScore(thisScore_, length) {
        var testsType = typeStr + "测试中心(" + version_name + '-' + textbook_name + ")";
        console.log(testsType);
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
                test_number: length
            },
            success: function (data) {
                console.log(JSON.stringify(data));

                if (data.msg == "保存成功") {
                    window.location = "sentence_test_score.html?score=" + thisScore_;
                } else {
                    alert('成绩上传失败，请重试');
                }
            }
        });
    }
})