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

$("#versions").html(`${version_name} - ${textbook_name} - ${typeStr}`);

fnUpdateSection();

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
    $("#thisPageHint").html(html_).css({'left':x+10,'top':y+10}).stop(true , true).fadeIn(200);
})

$("#sentenceA").on('mouseleave', "span", function () {
    $("#thisPageHint").html('').stop(true , true).fadeOut();
})

$("#sentenceA").on('click', "span", function () {
    var playerSrc = thisUrl + this.dataset.src;
    
    $("#audioplay").attr('src' , playerSrc);
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
        html_ += `<span id=""  class="${valueOfElement.countdown==0?'':'no'}"
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

        html_ += `<span id="" class="${valueOfElement.countdown==0?'':'no'}"
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