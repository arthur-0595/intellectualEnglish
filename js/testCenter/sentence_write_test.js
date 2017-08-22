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
    var textbook_id, version_id;
    var type, typeStr, textbook_name, version_name;
    //当前听力的句子变量,由句子的每个单个项组成的数组,顺序没打乱时的数组
    var thisSentence, thisSentenceArr;

    //要测试的所有句子的数组，以及当前句子的计数
    var sentenceArr, sentenceArrLength, num = 0;
    //保存测试结果的数组
    var testsArr = [];

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
    });

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
            fnthisunitAllSen();
            break;
        case '2':
            typeMethod = 'NewWordTest';
            console.log('生词测试');
            fnthisunitAllSen();
            break;
        case '3':
            typeMethod = 'OldWordTest';
            console.log('熟词测试');
            fnthisunitAllSen();
            break;
        case 'review':
            $('title').html('例句默写测试复习');
            fnUpdatesentenceTest();
            break;    
        default:
            typeMethod = 'LearnTest';
            break;
    }

    var word = new Vue({
        el: "#word",
        data: {
            sentence_mean: 'sentence_mean',
            sentence: 'sentence'
        }
    });

    fnthisunitAllSen();

    $("#enter").on('click', function () {
        fnclickEnter();
    })

    function fnclickEnter() {
        var myVal = $.trim($("#input").val());
        if (myVal.length < 1) {
            $("#hint").stop(true, true).fadeIn(200).delay(1500).fadeOut(200);
            $("#input").focus();
            return false;
        }

        var thisStatus;
        if (fndisposeSen(myVal) == fndisposeSen(sentenceArr[num].sentence)) {
            thisStatus = 1;
        } else {
            thisStatus = 2;
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
    }

    //获取所有测试单词
    function fnthisunitAllSen() {
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
                    sentenceArrLength = sentenceArr.length;

                    fntestshowSen(sentenceArr[0]);
                } else {
                    alert('句子获取失败，请尝试刷新！');
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
                    sentenceArrLength = sentenceArr.length;

                    fntestshowSen(sentenceArr[0]);
                } else {
                    alert('句子获取失败，请尝试刷新！');
                }
            }
        });
    }

    function fnnextSen(arrObj_) {
        num++;
        if (num < sentenceArrLength) {
            fntestshowSen(sentenceArr[num]);
        } else if (num >= sentenceArrLength) {
            alert('测试完成');
            // console.log(testsArr);
            sessionStorage.testResultArr = JSON.stringify(testsArr);
            var Nnum = 0;
            $.each(testsArr, function (index, element) {
                if (element.status == 1) {
                    Nnum++;
                }
            });
            var thisScore = Math.round((Nnum / testsArr.length) * 100);
            // console.log(thisScore);
            if (testType == 'review') {
                window.location = "sentence_test_score.html?score=" + thisScore;
            } else {
                fnsavethisScore(thisScore, testsArr.length);
            }
        }
    }

    //测试载入对应单词
    function fntestshowSen(wordObj) {
        $("#input").val("").attr('disabled', false).focus();

        word.sentence_mean = wordObj.sentence_mean;
        word.sentence = wordObj.sentence;

        $("#thisStudy").html('进度：' + (num + 1) + '/' + sentenceArrLength);
    }

    function fndisposeSen(sentence_) {
        if (typeof sentence_ == 'string') {
            return sentence_.replace('.', '');
        } else {
            return sentence_;
        }

    }

    //发送成绩
    function fnsavethisScore(thisScore_, length) {
        var testsType = typeStr + "测试中心(" + version_name + '-' + textbook_name + ")";
        // console.log(testsType);
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
                // console.log(JSON.stringify(data));
                if (data.msg == "保存成功") {
                    window.location = "sentence_test_score.html?score=" + thisScore_;
                } else {
                    alert('成绩上传失败，请重试');
                }
            }
        });
    }
})