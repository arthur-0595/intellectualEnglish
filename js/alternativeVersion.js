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

    (function () {
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

        var type_id = type.substr(-1);
        $.ajax({
            type: "GET",
            url: thisUrl + "/Areas/api/Interface.ashx",
            data: {
                method: 'SelectStudy',
                user_id: username,
                type: type_id
            },
            dataType: "json",
            success: function (data) {
                // console.log(data.length);
                if (data.length < 1) {
                    //关闭loading插件
                    removeLoading('test');
                    return false;
                } else {
                    version_id = data[0].version_id;
                    textbook_id = data[0].textbook_id;
                    chapter_id = data[0].unit_id;
                    version_name = data[0].version_name;
                    textbook_name = data[0].textbook_name;
                    chapter_name = data[0].unit_name;

                    sessionStorage.version_id = version_id;
                    sessionStorage.textbook_id = textbook_id;
                    sessionStorage.chapter_id = chapter_id;
                    sessionStorage.version_name = version_name;
                    sessionStorage.textbook_name = textbook_name;
                    sessionStorage.chapter_name = chapter_name;

                    $("#course p").html(`${version_name} - ${textbook_name}`);
                    $("#sectionBox p").html(chapter_name);
                    //获取到最后一次学习的记录之后直接获取该章节的学习进度
                    fnpdatePercent();
                    //获取课程总单词量
                    fnupdateWordNum();
                }
            }
        });
    })();

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
    //根据当前选择的类别修改智能复习和测试复习的点击跳转链接
    (function (type_) {
        var commonTest = $("#testList .commonTest");
        switch (type_) {
            case '01':
                console.log('type1');
                $.each(commonTest, function (index, element) {
                    element.href = "../html/testCenter/word_memory_test.html?testType=" + (index + 1);
                });
                $("#intelligentReview").attr('href', "../html/intellectualReview/intellectual_memory.html");
                $("#testReview").attr('href', "../html/word_simulationTest.html?testType=review");
                break;
            case '02':
                console.log('type2');
                $.each(commonTest, function (index, element) {
                    element.href = "../html/testCenter/word_listen_test.html?testType=" + (index + 1);
                });
                $("#intelligentReview").attr('href', "../html/intellectualReview/intellectual_listen.html");
                $("#testReview").attr('href', "../html/testCenter/word_listen_test.html?testType=review");
                break;
            case '03':
                console.log('type3');
                $.each(commonTest, function (index, element) {
                    element.href = "../html/testCenter/word_write_test.html?testType=" + (index + 1);
                });
                $("#intelligentReview").attr('href', "../html/intellectualReview/intellectual_write.html");
                $("#testReview").attr('href', "../html/testCenter/word_write_test.html?testType=review");
                break;
            case '04':
                console.log('type4');
                $("#overallTest").remove();
                $.each(commonTest, function (index, element) {
                    element.href = "../html/testCenter/sentence_listen_test.html?testType=" + (index + 1);
                });
                $("#intelligentReview").attr('href', "../html/intellectualReview/sentence_listen.html");
                $("#testReview").attr('href', "../html/testCenter/sentence_listen_test.html?testType=review");
                break;
            case '05':
                console.log('type5');
                $("#overallTest").remove();
                $.each(commonTest, function (index, element) {
                    element.href = "../html/testCenter/sentence_translate_test.html?testType=" + (index + 1);
                });
                $("#intelligentReview").attr('href', "../html/intellectualReview/sentence_translate.html");
                $("#testReview").attr('href', "../html/testCenter/sentence_translate_test.html?testType=review");
                break;
            case '06':
                console.log('type6');
                $("#overallTest").remove();
                $.each(commonTest, function (index, element) {
                    element.href = "../html/testCenter/sentence_write_test.html?testType=" + (index + 1);
                });
                $("#intelligentReview").attr('href', "../html/intellectualReview/sentence_test.html");
                $("#testReview").attr('href', "../html/testCenter/sentence_write_test.html?testType=review");
                break;
            default:
                console.log('type1');
                return false;
                break;
        }
    })(type);

    //跳转智能记忆   
    $("#clickBook").on("click", function () {
        if (textbook_id && version_id && chapter_id) {
            if (type == 01) {
                window.location = 'word_memory.html';
                // window.open('word_memory.html');
            } else if (type == 02) {
                window.location = 'word_listen.html';
                // window.open('word_listen.html');
            } else if (type == 03) {
                window.location = 'word_write.html';
                // window.open('word_write.html');
            } else if (type == 04) {
                window.location = 'sentence_listen.html';
                // window.open('sentence_listen.html');
            } else if (type == 05) {
                window.location = 'sentence_interpret.html';
                // window.open('sentence_interpret.html');
            } else if (type == 06) {
                window.location = 'sentence_write.html';
                // window.open('sentence_write.html');
            } else {
                $("#maskingVal").text("相关页面开发未完成!")
                    .parents("#masking").fadeIn(200)
                    .find('#btnsOk').off().on('click', function () {
                        $(this).parents('#masking').fadeOut(200);
                        return false;
                    });
            }

        } else {
            $("#maskingVal").text("请先选择教材和章节哦：）")
                .parents("#masking").fadeIn(200)
                .find('#btnsOk').off().on('click', function () {
                    $(this).parents('#masking').fadeOut(200);
                    $("#course").trigger('click');
                });
        }

    });

    //点击"在学一遍"按钮
    $("#onceAgain").on('click', function () {
        if (chapter_id) {
            fnonceAgain();
        } else {
            $("#maskingVal").text("请先选择教材和章节哦：）")
                .parents("#masking").fadeIn(200)
                .find('#btnsOk').off().on('click', function () {
                    $(this).parents('#masking').fadeOut(200);
                    $("#course").trigger('click');
                });
        }
    })

    //点击跳转测试记录页面需要判断是否有选择过教材及章节
    $("#testLog").on('click', function () {
        if (textbook_id) {
            this.href = "testCenter/chuangguan_record.html";
        } else {
            $("#maskingVal").text("请先选择教材和章节哦：）")
                .parents("#masking").fadeIn(200)
                .find('#btnsOk').off().on('click', function () {
                    $(this).parents('#masking').fadeOut(200);
                    $("#course").trigger('click');
                });
            return false;
        }
    })

    //点击跳转单词本页面，需要判断是否选择过教材及章节
    $("#wordBook").on('click', function () {
        if (chapter_id) {
            this.href = "./wordsbook.html";
        } else {
            $("#maskingVal").text("请先选择教材和章节哦：）")
                .parents("#masking").fadeIn(200)
                .find('#btnsOk').off().on('click', function () {
                    $(this).parents('#masking').fadeOut(200);
                    $("#course").trigger('click');
                });
            return false;
        }
    })

    //点击跳转记忆追踪页面，需要判断是否选择过教材及章节
    $("#memory").on('click', function () {
        fnpdatePercent();

        if (chapter_id) {
            if (this.dataset.num == 0) {
                // $("#maskingVal").text("可复习的单词数为0，快去学习吧：）")
                //     .parents("#masking").fadeIn(200)
                //     .find('#btnsOk').off().on('click', function () {
                //         $(this).parents('#masking').fadeOut(200);
                //     });
                return false;
            } else {
                this.href = "./traceMemory.html?type=" + type;
            }
        } else {
            $("#maskingVal").text("请先选择教材和章节哦：）")
                .parents("#masking").fadeIn(200)
                .find('#btnsOk').off().on('click', function () {
                    $(this).parents('#masking').fadeOut(200);
                    $("#course").trigger('click');
                });
            return false;
        }
    })

    //点击"测试复习"按钮
    $("#testReview").on('click', function () {
        fnpdatePercent();

        if (chapter_id) {
            if (this.dataset.num == 0) {
                // $("#maskingVal").text("可复习的单词数为0，快去学习吧：）")
                //     .parents("#masking").fadeIn(200)
                //     .find('#btnsOk').off().on('click', function () {
                //         $(this).parents('#masking').fadeOut(200);
                //     });
                return false;
            }
        } else {
            $("#maskingVal").text("请先选择教材和章节哦：）")
                .parents("#masking").fadeIn(200)
                .find('#btnsOk').off().on('click', function () {
                    $(this).parents('#masking').fadeOut(200);
                    $("#course").trigger('click');
                });
            return false;
        }
    })

    //点击"智能复习"按钮
    $("#intelligentReview").on('click', function () {
        fnpdatePercent();

        if (chapter_id) {
            if (this.dataset.num == 0) {
                // $("#maskingVal").text("可复习的单词数为0，快去学习吧：）")
                //     .parents("#masking").fadeIn(200)
                //     .find('#btnsOk').off().on('click', function () {
                //         $(this).parents('#masking').fadeOut(200);
                //     });
                return false;
            }
        } else {
            $("#maskingVal").text("请先选择教材和章节哦：）")
                .parents("#masking").fadeIn(200)
                .find('#btnsOk').off().on('click', function () {
                    $(this).parents('#masking').fadeOut(200);
                    $("#course").trigger('click');
                });
            return false;
        }
    })

    //每隔4分钟发送一次通信请求
    fnupdateCommunication(username);
    // setInterval(function () {
    //     fnupdateCommunication(username);
    // }, 240 * 1000);

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
                    // console.log(data);
                    if (data.msg == '无数据') {
                        //关闭loading插件
                        removeLoading('test');
                    }
                    if (data.length >= 1) {

                        var nhtml = '';
                        $.each(data, function (index, element) {
                            nhtml += `<tr data-textbookid = "${element.textbook_id}" data-versionId = "${element.version_id}" data-versionname = "${element.version_name}" data-textbookname = "${element.textbook_name}">
								<td class="StudycourseName">${element.version_name} - ${element.textbook_name}</td>
								<td>两个小时前</td>
								<td>
									<a href="javascript:;" class="studySchedule">查看</a>
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

                        //点击查看所有学习进度
                        $(".studySchedule").off().on('click', function () {
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

                            $(".studyRateBox").html('');
                            var thisTextbookid = $(this).parents('tr')[0].dataset.textbookid;
                            fnupdateMyStudySchedule(thisTextbookid, $(this).next()[0]);
                        })
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
            $("#maskingVal").text("请先选择教材哦：）")
                .parents("#masking").fadeIn(200)
                .find('#btnsOk').off().on('click', function () {
                    $(this).parents('#masking').fadeOut(200);
                    $("#course").trigger('click');
                });
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
                //根据span里面的值来确定是否可以点击跳转
                fnclickTestA();
            }
        });
    }
    //根据span里面的值来确定是否可以点击跳转
    function fnclickTestA() {
        $("#testList .commonTest").on('click', function () {
            if ($(this).find('span').text() < 10) {
                return false;
            }
        })
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
        // console.log(chapter_id + '+' + parseInt(type) + '+' + textbook_id);
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
                    alert('这本书没有内容，请联系管理员！');
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

                $("#memory").html('记忆追踪(' + data.Memorytracking_count + ')')
                    .attr('data-num', data.Memorytracking_count);
                $("#intelligentReview").html('智能复习(' + data.Review_count + ')')
                    .attr('data-num', data.Review_count);
                $("#testReview").html('测试复习(' + data.Review_count + ')')
                    .attr('data-num', data.Review_count);
                //关闭loading插件
                removeLoading('test');
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
                var thisStudy = data.study_words + data.study_sentence;
                //定义每小时应该学习的数量为40
                var oneHourStudyNum = 40;
                if (data.result == 1) {
                    var thisToken = data.token;
                    var loginToken = sessionStorage.token;
                    if (thisToken !== loginToken) {
                        alert("账号已在其他设备登录，请检查或者及时联系管理员");
                        window.location = '../index.html';
                    }
                    //今日学习速度
                    var todaySpeed = Math.round(thisStudy / (data.Login_today / 3600));

                    $('#onlineTime span').html(fnupdateAllTime(data.Login_all));
                    $('#validTime span').html(fnupdateAllTime(data.Login_today));
                    $("#speed span").html(todaySpeed);
                    //今日学习效率
                    var todayPercentage = Math.round(todaySpeed / oneHourStudyNum * 100) > 100 ? 100 : Math.round(todaySpeed / oneHourStudyNum * 100);
                    $("#percentage").html(todayPercentage + '%');

                    fnupdateStudyTime(data.Login_all, data.Login_today);
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

    function fnupdateStudyTime(time1_, time2_) {
        setInterval(function () {
            time1_++;
            time2_++;
            $('#onlineTime span').html(fnupdateAllTime(time1_));
            $('#validTime span').html(fnupdateAllTime(time2_));
        }, 1000);
    }

    function fnupdateMyStudySchedule(textbookid_, thisdom_) {
        $.ajax({
            type: "GET",
            url: thisUrl + "/Areas/api/Interface.ashx",
            data: {
                method: 'studyprogress',
                user_id: username,
                textbookid: textbookid_
            },
            dataType: "json",
            success: function (data) {
                // console.log(data);
                var tempFn = doT.template($("#template").html());
                var resultText = tempFn(data);
                thisdom_.innerHTML = resultText;

                //关闭loading插件
                removeLoading('test');

                //关闭学习进度页面
                $("#closeBtn").on('click', function () {
                    thisdom_.innerHTML = '';
                })
            }
        });
    }

})