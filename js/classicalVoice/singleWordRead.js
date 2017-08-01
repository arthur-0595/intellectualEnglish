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
    var typeStr, textbook_name, version_name, chapter_name;
    //当前语音文件播放路径
    var audioplay = $("#audioplay");
    var audioplaySrc;
    //是辩音还是其他类别:1辩音，0其他
    var issound = 0;
    var contentUl;
    //本次测试相关答案组成的数组
    var thisTestArr = [];

    textbook_id = sessionStorage.textbook_id;
    version_id = sessionStorage.version_id;
    chapter_id = sessionStorage.chapter_id;
    typeStr = sessionStorage.typeStr;
    textbook_name = sessionStorage.textbook_name;
    version_name = sessionStorage.version_name;
    chapter_name = sessionStorage.chapter_name;

    //type作为区分类别的变量
    var type = 2;
    if (chapter_name == '学前测试') {
        type = 1;
    } else if (chapter_name == '学后测试') {
        type = 3;
    }

    var top = new Vue({
        el: "#top",
        data: {
            textbook_name: textbook_name,
            version_name: version_name,
            chapter_name: chapter_name,
            minute: 5,
            second: 0
        }
    });

    //倒计时
    var onlyTime = 300;
    var onlyminute, onlysecond;
    var timer = setInterval(function () {
        onlyTime--;
        onlyminute = parseInt(onlyTime / 60);
        onlysecond = onlyTime % 60;

        top.minute = onlyminute;
        top.second = onlysecond;

        if (onlyTime <= 0) {
            clearInterval(timer);
            alert('倒计时结束');
            $("#commit").trigger("click");
        };
    }, 1000);

    //获取本次测试所有内容
    fnupdateTestCon();

    $('#commit').click(function (e) {
        //清空数组的内容
        thisTestArr = [];
        e.preventDefault();
        var conArr = $("#contentUl li");
        var Nnum = 0;
        $.each(conArr, function (index, element) {
            var word = element.dataset.word;
            var thisinput = $(element).find('input');
            var thisletter = thisinput[0].dataset.letter;
            var letter_url = thisinput[0].dataset.src;
            var myletter = $.trim(thisinput.val());
            var status = 0;
            var spana = $(element).find('span.word');

            if (thisletter == myletter) {
                status = 1;
                Nnum++;
            }

            var obj = {
                word: word,
                letter: thisletter,
                letter_url: letter_url,
                myletter: [{
                    "model": spana[0].dataset.state==1?myletter:spana[0].innerText,
                    "state": spana[0].dataset.state
                }, {
                    "model": spana[1].dataset.state==1?myletter:spana[1].innerText,
                    "state": spana[1].dataset.state
                }, {
                    "model": spana[2].dataset.state==1?myletter:spana[2].innerText,
                    "state": spana[2].dataset.state
                }],
                status: status
            }
            thisTestArr.push(obj);
        });
        // console.log(thisTestArr);
        //计算本次测试分数
        var thisScore = Math.round((Nnum / thisTestArr.length) * 100);
        //缓存本次测试数组
        sessionStorage.thisTestArr = JSON.stringify(thisTestArr);

        //提交分数
        fnsubmit(thisScore);
    });

    function fnsubmit(score_) {
        $.ajax({
            type: "GET",
            url: thisUrl + "/Areas/api/Interface.ashx",
            data: {
                method: 'submit',
                user_id: username,
                type_id: textbook_id,
                voice_id: chapter_id,
                score: score_,
                type: type
            },
            dataType: "json",
            success: function (data) {
                console.log(data);
                if (data == 1) {
                    //若分数提交成功，则转入成绩单页面
                    window.location = 'singleWordResult.html?score=' + score_;
                }
            }
        });
    }

    function fnupdateTestCon() {
        $.ajax({
            type: "get",
            url: thisUrl + "/Areas/api/Interface.ashx",
            data: {
                method: 'voicetest',
                type_id: textbook_id,
                voice_id: chapter_id,
                type: type,
                issound: issound
            },
            dataType: "json",
            success: function (data) {
                console.log(data);

                contentUl = new Vue({
                    el: '#contentUl',
                    data: {
                        items: data
                    },
                    methods: {
                        fnclickItemPlayer: function (src) {
                            audioplaySrc = thisUrl + src;
                            console.log(audioplaySrc);
                            $("#audioplay").attr('src', audioplaySrc);
                        }
                    }
                })
            }
        });
    }




})