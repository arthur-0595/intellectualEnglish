$(function () {
    //获取用户名
    var userMessage = sessionStorage.userMessage;
    if (userMessage) {
        userMessage = JSON.parse(userMessage);
        var username = userMessage[0].ID;
    } else {
        window.location = '../index.html';
    }
    //当前选择的版本ID，教材ID ,选择的章节
    var textbook_id, version_id, chapter_id;
    var textbook_name, version_name, chapter_name;
    //当前的大类，大类的name
    var type, typeStr, typeEnglish;

    type = sessionStorage.type;
    typeStr = sessionStorage.typeStr;
    typeEnglish = sessionStorage.typeEnglish;

    // version_id = sessionStorage.version_id;
    // textbook_id = sessionStorage.textbook_id;
    // chapter_id = sessionStorage.chapter_id;
    // version_name = sessionStorage.version_name;
    // textbook_name = sessionStorage.textbook_name;
    // chapter_name = sessionStorage.chapter_name;

    //根据大类以及大类的name来显示相应的页面内容
    (function () {
        var typeEnglish = ['Intelligent Memory'];
        $("#centerSpan").html(typeStr);
        var cenBook = `<div class="pic">
						<img src="../imgs/home/${type}.png" />
					</div>
					<h3>${typeStr}</h3>
					<span>${typeEnglish}</span>
					<i>点击开始学习</i>`;
        $("#cen_book").html(cenBook);

        $("#category_h").html(`${type}
							<span>${typeEnglish}</span>`);
        $("#title_h").html(typeStr);
    })();

    //若当前页面的类别是句子相关的，则修改测试中心各选项的点击跳转路径
    (function (type_) {
        switch (type_) {
            case '01':
                console.log('type1');
                var commonTest = $("#testList .commonTest");
                $.each(commonTest, function (index, element) {
                    element.href = "javascript:window.open('../html/testCenter/word_memory_test.html?testType=" + (index + 1) + "')";
                });
                break;
            case '02':
                console.log('type2');
                
                break;
            case '03':
                console.log('type3');

                break;
            case '04':
                console.log('type4');
                $("#overallTest").remove();
                break;
            case '05':
                console.log('type5');
                $("#overallTest").remove();
                break;
            case '06':
                console.log('type6');
                $("#overallTest").remove();
                break;

            default:
                console.log('type1');
                break;
        }
    })(type);

    //跳转智能记忆
    $("#clickBook").on("click", function () {
        if (textbook_id && version_id && chapter_id) {
            if (type == 01) {
                // window.location = 'word_memory.html';
                window.open('word_memory.html');
            } else if (type == 02) {
                // window.location = 'word_listen.html';
                window.open('word_listen.html');
            } else if (type == 03) {
                // window.location = 'word_write.html';
                window.open('word_write.html');
            } else if (type == 04) {
                // window.location = 'sentence_listen.html';
                window.open('sentence_listen.html');
            } else if (type == 05) {
                // window.location = 'sentence_interpret.html';
                window.open('sentence_interpret.html');
            } else if (type == 06) {
                // window.location = 'sentence_write.html';
                window.open('sentence_write.html');
            } else {
                alert("相关页面开发未完成");
            }

        } else {
            alert("请确认已选择好课程及相关章节");
            $("#course").trigger('click');
        }

    });

    //点击"在学一遍"按钮
    $("#onceAgain").on('click', function () {
        if (chapter_id) {
            fnonceAgain();
        } else {
            alert('提示：请先选择教材及章节之后再次使用该功能！');
            $("#course").trigger('click');
        }
    })

    //点击跳转测试记录页面需要判断是否有选择过教材及章节
    $("#testLog").on('click', function () {
        if (textbook_id) {
            this.href = "javascript:window.open('testCenter/chuangguan_record.html')";
        } else {
            alert('提示：请先选择教材再次跳转查看测试记录！');
            $("#course").trigger('click');
            return false;
        }
    })

    //点击跳转单词本页面，需要判断是否选择过教材及章节
    $("#wordBook").on('click', function () {
        if (chapter_id) {
            this.href = "javascript:window.open('./wordsbook.html')";
        } else {
            alert('提示：请先选择教材及章节之后再次跳转查看单词本！');
            $("#course").trigger('click');
            return false;
        }
    })

    //每隔五分钟发送一次通信请求
    fnupdateCommunication(username);
    setInterval(function () {
        fnupdateCommunication(username);
    }, 180 * 1000);

    //切换在学课程及全部课程
    $("#courseNavs>li").on("click", function () {
        $('body').loading({
            loadingWidth: 120,
            title: '',
            name: 'test',
            discription: '',
            direction: 'column',
            type: 'origin',
            // originBg:'#71EA71',
            originDivWidth: 40,
            originDivHeight: 40,
            originWidth: 6,
            originHeight: 6,
            smallLoading: false,
            loadingMaskBg: 'rgba(0,0,0,0.2)'
        });

        var thisindex = $(this).index();
        $("#courseNavs>li").removeClass("checked");
        $(this).addClass("checked");

        $("#mainBot>li").hide();
        $("#mainBot>li").eq(thisindex).show();

        if (thisindex == 0) {
            $.ajax({
                type: "POST",
                url: thisUrl2 + '/Areas/Api/index.ashx',
                dataType: "json",
                data: {
                    method: "GetStudy",
                    user_id: username
                },
                success: function (data) {
                    if (data.length >= 1) {

                        var nhtml = '';
                        $.each(data, function (index, element) {
                            nhtml += `<tr data-textbookid = "${element.textbook_id}" data-versionId = "${element.version_id}" data-versionname = "${element.version_name}" data-textbookname = "${element.textbook_name}">
								<td class="StudycourseName">${element.version_name} - ${element.textbook_name}</td>
								<td>两个小时前</td>
								<td>
									<a href="javascript:;">查看</a>
									<div class="studyRateBox"></div>
								</td>
								<td class="startStudy">学习</td>
							</tr>`;
                        })
                        $("#myCourses tbody").html(nhtml);
                        //关闭loading插件
                        removeLoading('test');

                        $(".startStudy").on("click", function () {
                            fnselectingTextbooksTog();
                            textbook_id = $(this).parent("tr")[0].dataset.textbookid;
                            version_id = $(this).parent("tr")[0].dataset.versionid;
                            textbook_name = $(this).parent("tr")[0].dataset.textbookname;
                            version_name = $(this).parent("tr")[0].dataset.versionname;

                            sessionStorage.textbook_id = textbook_id;
                            sessionStorage.version_id = version_id;
                            sessionStorage.textbook_name = textbook_name;
                            sessionStorage.version_name = version_name;

                            var name = $(this).parent("tr").find("td.StudycourseName").html();
                            $("#course p").html(name);
                            //运行点击选择章节按钮
                            fnchapterList();
                            //本课程的单词量
                            fnupdateWordNum();
                        });
                    }
                }
            });
        } else {
            $.ajax({
                type: "POST",
                url: thisUrl + '/Areas/Api/Interface.ashx',
                dataType: "json",
                data: {
                    method: "GetSeries",
                    user_id: username
                },
                success: function (data) {
                    if (data.length >= 1) {
                        var nhtml = '';
                        $.each(data, function (index, element) {
                            nhtml += `<li class="padL30" data-seseriesId = "${element.series_id}" >${element.series_name}</li>`;
                        });
                        $("#mainleft").html(nhtml);

                        //关闭loading插件
                        removeLoading('test');

                        //所有课程》选择系列
                        $("#mainleft>li").on("click", function () {
                            var thisseseriesid = this.dataset.seseriesid;

                            $.ajax({
                                type: "POST",
                                url: thisUrl + '/Areas/Api/Interface.ashx',
                                dataType: "json",
                                data: {
                                    method: "GetVersionBySeriesID",
                                    user_id: username,
                                    series_id: thisseseriesid
                                },
                                success: function (data) {
                                    if (data.length >= 1) {
                                        //								alert(JSON.stringify(data) );
                                        var nhtml = '';
                                        $.each(data, function (index, element) {
                                            nhtml += `<li class="padL30" data-seseriesId = "${element.series_id}" data-versionId = "${element.version_id}"  data-versionname = "${element.version_name}" >${element.version_name}</li>`;
                                        });
                                        $("#mainmid").show();
                                        $("#mainmid").html(nhtml);

                                        //所有课程》选择系列>选择版本
                                        $("#mainmid>li").on("click", function () {
                                            var thisversionid = this.dataset.versionid;
                                            version_name = this.dataset.versionname;

                                            sessionStorage.version_name = version_name;

                                            $("#course p").html(this.innerHTML);
                                            $("#course p").append(' - ');
                                            $.ajax({
                                                type: "POST",
                                                url: thisUrl + '/Areas/Api/Interface.ashx',
                                                dataType: "json",
                                                data: {
                                                    method: "GetTextBookByVersionID",
                                                    user_id: username,
                                                    version_id: thisversionid
                                                },
                                                success: function (data) {
                                                    if (data.length >= 1) {
                                                        //alert(JSON.stringify(data) );
                                                        var nhtml = '';
                                                        $.each(data, function (index, element) {
                                                            nhtml += `<li class="padL30" data-textbookid = "${element.textbook_id}" data-versionId = "${element.version_id}" data-textbookname = "${element.textbook_name}" >${element.textbook_name}</li>`;
                                                        });
                                                        $("#mainright").show();
                                                        $("#mainright").html(nhtml);

                                                        //所有课程》选择系列>选择版本>选择课程
                                                        $("#mainright>li").on("click", function () {
                                                            var thistextbookid = this.dataset.textbookid;

                                                            textbook_id = this.dataset.textbookid;
                                                            version_id = this.dataset.versionid;
                                                            textbook_name = this.dataset.textbookname;

                                                            sessionStorage.textbook_id = textbook_id;
                                                            sessionStorage.version_id = version_id;
                                                            sessionStorage.textbook_name = textbook_name;

                                                            fnselectingTextbooksTog();
                                                            $("#course p").append(this.innerHTML);

                                                            //运行点击选择章节按钮
                                                            fnchapterList();
                                                            //本课程的单词量
                                                            fnupdateWordNum();
                                                        })
                                                    }
                                                }
                                            });
                                        })
                                    }
                                }
                            });
                        })
                    }
                }
            });
        }
    })

    //选择教材
    $("#course").on("click", function () {
        fnselectingTextbooksTog();
    })

    //选择章节
    $("#sectionBox").on("click", function () {
        fnchapterList();
    })

    //测试相关
    $("#test").on("click", function () {
        if (chapter_id && version_id && textbook_id) {
            fnupdateTestAmount();

            $("#testList").toggle();
            if ($("#testList").css("display") == "block") {
                $("#test").css("border-radius", "18px 18px 0 0 ");
                $("#test").find("i").css("transform", "rotate(180deg)");
            } else {
                $("#test").css("border-radius", "18px");
                $("#test").find("i").css("transform", "rotate(0deg)");
            }
        } else {
            alert('请先选择教材');
            $("#course").trigger('click');
        }

    })

    //显示选择教材的函数
    function fnselectingTextbooksTog() {
        $("#testList").hide();
        $("#chapterList").hide();
        $("#selectingTextbooks").toggle();
        if ($("#selectingTextbooks").css("display") == "block") {
            $("#course").css("border-radius", "18px 18px 0 0 ");
            $("#course").find("i").css("transform", "rotate(180deg)");

            $("#courseNavs li").eq(0).trigger("click");
        } else {
            $("#course").css("border-radius", "18px");
            $("#course").find("i").css("transform", "rotate(0deg)");
        }
    }

    function fnchapterList() {
        if (textbook_id && version_id) {
            $("#testList").hide();
            $("#selectingTextbooks").hide();
            $("#chapterList").toggle();

            if ($("#chapterList").css("display") == "block") {
                $("#sectionBox").css("border-radius", "18px 18px 0 0 ");
                $("#sectionBox").find("i").css("transform", "rotate(180deg)");

                fnshowUnit();
            } else {
                $("#sectionBox").css("border-radius", "18px");
                $("#sectionBox").find("i").css("transform", "rotate(0deg)");
            }
        } else {
            alert('未选择版本及教材');
            $("#course").trigger('click');
        }
    }

    function fnupdateTestAmount() {
        var type_id = type.substr(-1);

        $.ajax({
            type: "POST",
            url: thisUrl2 + "/Areas/api/Index.ashx",
            data: {
                method: 'GetTestNumber',
                user_id: username,
                textbook_id: textbook_id,
                type_id: type_id
            },
            dataType: "json",
            success: function (data) {
                // console.log(data);
                $("#testList span").eq(0).html(data.totalnumber);
                $("#testList span").eq(1).html(data.newwordnumber);
                $("#testList span").eq(2).html(data.oldwordnumber);
            }
        });
    }

    function fnshowUnit() {
        $.ajax({
            type: "POST",
            url: thisUrl2 + '/Areas/Api/index.ashx',
            dataType: "json",
            data: {
                method: "GetUnitByTextBookID",
                textbook_id: textbook_id
            },
            success: function (data) {
                //alert(JSON.stringify(data));
                if (data.length >= 1) {
                    var nhtml = '';
                    $.each(data, function (index, element) {
                        nhtml += `<li id="${element.id}" data-chaptername="${element.unit_name}">${element.unit_name}</li>`;
                    })
                    $("#chapterList").html(nhtml);

                    $("#chapterList>li").on("click", function () {
                        var thisname = $(this).html();
                        $("#sectionBox p").html(thisname);

                        chapter_id = this.id;
                        chapter_name = this.dataset.chaptername;

                        sessionStorage.chapter_id = chapter_id;
                        sessionStorage.chapter_name = chapter_name;

                        fnchapterList();
                        $("#chapterList").hide();

                        //获取进度
                        fnpdatePercent();
                    });
                }
            }
        });
    }
    //点击在学一遍按钮的事件
    function fnonceAgain() {
        var type_id = type.substr(-1);
        // console.log(username +'+'+  chapter_id +'+'+ type_id );
        $.ajax({
            type: "GET",
            url: thisUrl2 + "/Areas/api/Index.ashx",
            data: {
                method: 'AgainLearn',
                user_id: username,
                unit_id: chapter_id,
                type_id: type_id
            },
            dataType: "json",
            success: function (data) {
                console.log(data);
                if (data.msg == '成功') {
                    $("#hintMessage").stop(true, true).fadeIn(200).delay(1000).fadeOut(200);
                }
            }
        });
    }

    //发送请求获取本课程的单词量，以及获取当前的进度
    function fnupdateWordNum() {
        $.ajax({
            type: "POST",
            url: thisUrl2 + "/Areas/api/Index.ashx",
            data: {
                method: 'GetWordsByTextBookID',
                textbook_id: textbook_id
            },
            dataType: "json",
            success: function (data) {
                $("#courseStudyNum p").html(`${data.wordtotal}个`);
            }
        });
    }

    //获取进度
    function fnpdatePercent() {

        $.ajax({
            type: "POST",
            url: thisUrl2 + "/Areas/api/Index.ashx",
            data: {
                method: 'GetProgress',
                user_id: username,
                unit_id: chapter_id,
                type_id: parseInt(type),
                textbook_id: textbook_id
            },
            dataType: "json",
            success: function (data) {
                // console.log(data);
                var coursePercentNum = '0%',
                    unitPercent = '0%';
                if (data.msg == '无数据') {
                    coursePercentNum = '0%';
                    unitPercent = '0%';
                } else {
                    unitPercent = parseInt(data.study_unit / data.unit_total * 100) + '%';
                    coursePercentNum = parseInt(data.study_textbook / data.textbook_total * 100) + '%';
                    if (data.study_unit == 0 && data.unit_total == 0) {
                        unitPercent = '0%';
                    }
                }

                $("#coursePercent").width(coursePercentNum);
                $("#unitPercent").width(unitPercent);

                $("#coursePercentNum").html(coursePercentNum);
                $("#unitPercentString").html(unitPercent);
            }
        });
    }

    //发送后台退出页面的请求，记录时间
    function fnupdateCommunication(username_) {
        $.ajax({
            type: "GET",
            url: thisUrl + "/Areas/api/Interface.ashx",
            data: {
                method: 'UserClose',
                user_id: username_
            },
            dataType: "json",
            success: function (data) {
                // console.log(data);
                if(data.result == 1){
                    $('#onlineTime span').html(fnupdateAllTime(data.Login_all));
                }
            }
        });
        // var ajax_ = new XMLHttpRequest();
        // ajax_.onreadystatechange = function () {
        // 	if (ajax_.readyState == 4) {
        // 		if ((ajax_.status >= 200 && ajax_.status < 300) || ajax_.status == 304) {
        // 			console.log(ajax_.responseText);
        // 		}
        // 	}
        // }
        // ajax_.open('get', thisUrl + '/Areas/api/Interface.ashx?method=UserClose&user_id='+username ? username : '' , true);
        // ajax_.send(null);
    }

    //修改时间的函数
    function fnupdateAllTime(login_all) {
        var hour = parseInt(login_all/3600)<10?('0'+parseInt(login_all/3600)):parseInt(login_all/3600);
        var minute = parseInt( ( login_all-(hour*3600) )/60 )<10?('0'+parseInt( ( login_all-(hour*3600) )/60 )):parseInt( ( login_all-(hour*3600) )/60 );
        var seconds = parseInt( login_all-(hour*3600)-(minute*60) )<10?('0'+parseInt( login_all-(hour*3600)-(minute*60) )):parseInt( login_all-(hour*3600)-(minute*60) );

        var time = `${hour} : ${minute} : ${seconds}`;
        return time;
    }

})