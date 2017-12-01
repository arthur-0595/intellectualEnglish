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

textbook_id = sessionStorage.textbook_id;
version_id = sessionStorage.version_id;
typeStr = sessionStorage.typeStr;
textbook_name = sessionStorage.textbook_name;
version_name = sessionStorage.version_name;
type = sessionStorage.type;
var type_ = parseInt(type);

(function (type_) {
    var commonTest = $("#testList .commonTest");
    switch (type_) {
        case '01':
            // console.log('type1');
            $("#EnterTheAnswer").attr('href', "../html/intellectualReview/intellectual_memory.html");
            break;
        case '02':
            // console.log('type2');
            $("#EnterTheAnswer").attr('href', "../html/intellectualReview/intellectual_listen.html");
            break;
        case '03':
            // console.log('type3');
            $("#EnterTheAnswer").attr('href', "../html/intellectualReview/intellectual_write.html");
            break;
        case '04':
            // console.log('type4');
            $("#EnterTheAnswer").attr('href', "../html/intellectualReview/sentence_listen.html");
            break;
        case '05':
            // console.log('type5');
            $("#EnterTheAnswer").attr('href', "../html/intellectualReview/sentence_translate.html");
            break;
        case '06':
            // console.log('type6');
            $("#EnterTheAnswer").attr('href', "../html/intellectualReview/sentence_test.html");
            break;
        default:
            return false;
            break;
    }
})(type);

$("#EnterTheAnswer").on('click', function () {
    var allYes = $("#sentenceA span.yes").length;
    if (allYes == 0) {
        $("#maskingVal").text("时间还没到哦，先去学习别的内容：）")
            .parents("#masking").fadeIn(200)
            .find('#btnsOk').off().on('click', function () {
                $(this).parents('#masking').fadeOut(200);
            });
        return false;
    }
})

$("#versions").html(`${version_name} - ${textbook_name} - ${typeStr}`);

fnUpdateSection();
fnupdateTime();

$("#sentenceA").on('mouseenter', "span", function (e) {
    // 获取鼠标坐标
    var x = e.pageX;
    var y = e.pageY;
    var html_ = `<div class="translate" id="translate">翻译：
			<i>${this.dataset.mean}</i>
		</div>
		<div class="thisStudyNum" id="thisStudyNum">
			学习次数：${this.dataset.studynum}  错误次数：${this.dataset.wrongnum}
		</div>
		<div class="memoryNum" id="memoryNum">
			记忆强度：${this.dataset.percent}%
		</div>
		<div class="studyTimeOver" id="studyTimeOver">
			${this.dataset.time}
		</div>`;
    $("#thisPageHint").html(html_).css({
        'left': x + 10,
        'top': y + 10
    }).stop(true, true).fadeIn(200);
})

$("#sentenceA").on('mouseleave', "span", function () {
    $("#thisPageHint").html('').stop(true, true).fadeOut();
})

$("#sentenceA").on('click', "span", function () {
    var playerSrc = thisUrl + this.dataset.src;

    $("#audioplay").attr('src', playerSrc);
})

function fnUpdateSection() {
    var thisMethod;
    if (type_ < 4) {
        thisMethod = 'Memorytracking';
        fnajaxWord(thisMethod);
    } else {
        thisMethod = 'SenMemorytracking';
        fnajaxSen(thisMethod);
    }
}

function fnajaxWord(method_) {
    // console.log(method_+'+'+username+'+'+type_+'+'+textbook_id);
    $.ajax({
        type: 'POST',
        url: thisUrl + "/Areas/api/Interface.ashx",
        data: {
            method: method_,
            user_id: username,
            wordtype: type_,
            textbookid: textbook_id
        },
        dataType: "json",
        success: function (data) {
            console.log(data);
            fnwordUpdate(data);
        }
    });
}

function fnwordUpdate(data_) {
    var html_ = '';
    $.each(data_, function (indexInArray, valueOfElement) {
        var time_ = fnTimeManage(valueOfElement.countdown);
        html_ += `<span id=""  class="${valueOfElement.countdown==0?'yes':'no'}"
             data-src="${valueOfElement.word_url}"
             data-mean="${valueOfElement.word_mean}"
             data-studyNum="${valueOfElement.study_times}"
             data-wrongNum="${valueOfElement.wrong_number}"
             data-percent="${valueOfElement.percent}"
             data-time="${time_}"
             >${valueOfElement.word_name.replace(/\•/g,'')}</span>`;
    });
    $("#sentenceA").html(html_);
}

function fnajaxSen(method_) {
    // console.log(method_+'+'+username+'+'+type_+'+'+textbook_id);
    $.ajax({
        type: 'POST',
        url: thisUrl + "/Areas/api/Interface.ashx",
        data: {
            method: method_,
            user_id: username,
            sentype: type_,
            textbookid: textbook_id
        },
        dataType: "json",
        success: function (data) {
            console.log(data);
            fnsenUpdate(data);
        }
    });
}

function fnsenUpdate(data_) {
    var html_ = '';
    $.each(data_, function (indexInArray, valueOfElement) {
        var time_ = fnTimeManage(valueOfElement.countdown);

        html_ += `<span id="" class="${valueOfElement.countdown==0?'yes':'no'}"
             data-src="${valueOfElement.sentence_url}"
             data-mean="${valueOfElement.sentence_mean}"
             data-studyNum="${valueOfElement.study_times}"
             data-wrongNum="${valueOfElement.wrong_number}"
             data-percent="${valueOfElement.percent}"
             data-time="${time_}"
         >${valueOfElement.sentence.replace(/\•/g,'')}</span>`;
    });
    $("#sentenceA").html(html_);
}

function fnneedStudyNum(arr_) {
    var num = 0;
    for (var i = 0; i < arr_.length; i++) {
        var element = arr_[i];
        if (element.countdown == 0) {
            num++;
        }
    }
    return num;
}

function fnTimeManage(times_) {
    var hour_ = parseInt(times_ / 3600);
    var minute_ = parseInt((times_ % 3600) / 60);
    var second_ = times_ % 60;
    if (second_ == 0) {
        return `记忆点已到，快开始复习吧！`;
    } else {
        return `距离记忆点：${hour_} : ${minute_} : ${second_}`;
    }
}

function fnupdateTime() {
    var date = new Date();
    var year = date.getFullYear(); //获取年
    var month = date.getMonth() + 1; //获取月
    var day = date.getDate(); //获取日 
    var h = date.getHours(); //获取小时
    var m = date.getMinutes(); //获取分钟
    var s = date.getSeconds(); //获取秒

    innerText_ = `当前记忆追踪时间：${year}年 ${month}月 ${day}日 ${h}: ${m}: ${s}`;
    document.getElementById('time').innerText = innerText_;
}