$(function () {
    //获取用户名
    var userMessage = sessionStorage.userMessage;
    if (userMessage) {
        userMessage = JSON.parse(userMessage);
        var username = userMessage[0].ID;
    } else {
        alert('检测到您未登录，请先登录！');
        window.location = '../index.html';
    }
    //当前选择的版本ID，教材ID ,选择的章节
    var textbook_id, chapter_id, version_id;
    var type, typeStr, textbook_name, version_name, chapter_name;
    //选中的文章的id和文章的内容
    var thisReadId, thisReadCon;
    //认字母的听写和闯关页面
    var href1 = 'classicalVoice/wordRead.html';
    var href2 = 'classicalVoice/recognizeWord.html';


    var navs;
    var mainleft;
    fnupdateList();

    var botUlCon = new Vue({
        el: '#botUl',
        data: {
            href1: 'classicalVoice/letterRead.html',
            href2: 'classicalVoice/singleWordRead.html',
            items: 'data'
        },
        methods: {
            fnclickVoiceList: function (allow_, name_, id_, type_, event) {
                if (allow_ == 1) {
                    var thistg = event.target;

                    chapter_name = name_;
                    chapter_id = id_;

                    sessionStorage.chapter_id = chapter_id;
                    sessionStorage.chapter_name = chapter_name;
                    sessionStorage.version_id = version_id;
                    sessionStorage.version_name = version_name;
                    sessionStorage.textbook_id = textbook_id;
                    sessionStorage.textbook_name = textbook_name;

                    if (type_ == 1 || type_ == 3) {
                        if (textbook_id == 2) {
                            window.location = 'classicalVoice/recognizeWord.html';
                        } else {
                            window.location = 'classicalVoice/singleWordRead.html';
                        }
                    }
                }
                return false;

            },
            fnmouseenterVoiceList: function (allow_, type_, event) {
                if (allow_ == 1) {
                    var thistg = event.target;
                    if (type_ == 2) {
                        $(thistg).find('.operate').finish().show('fast')
                            .end().find('span').finish().hide('fast');
                    }
                }
                return false;
            },
            fnmouseleaveVoiceList: function (allow_, type_, event) {
                if (allow_ == 1) {
                    var thistg = event.target;
                    if (type_ == 2) {
                        $(thistg).find('.operate').finish().hide('fast')
                            .end().find('span').finish().show('fast');
                    }
                }
                return false;
            }
        }
    })

    function fnupdateList() {
        $.ajax({
            type: "get",
            url: thisUrl + "/Areas/api/Interface.ashx",
            dataType: "json",
            data: {
                method: 'getvoicetype'
            },
            async: true,
            success: function (data) {
                //				console.log(JSON.stringify(data));
                navs = data;

                mainleft = new Vue({
                    el: '#mainleft',
                    data: {
                        items: navs
                    }
                });

                $("#mainleftul>li .tit").unbind().on('click', function () {
                    if ($(this).parent().find('ul')[0].style.display != 'none') {
                        return false;
                    } else {
                        $("#mainleftul>li").find('ul').slideUp();
                        $(this).parent().find('ul').slideDown();

                        version_id = $(this).parent()[0].id;
                        version_name = $(this).find('b').html();
                    }
                })

                $(".courseA li").unbind().on('click', function () {
                    //添加和删除对应的class
                    $(".courseA li").removeClass('thisColor');
                    $(this).addClass('thisColor');

                    var thisId = $(this).attr('id');
                    var thisCon = $(this).html();

                    textbook_id = thisId;
                    textbook_name = thisCon;

                    if (textbook_id == 2) {
                        botUlCon.href1 = href1;
                        botUlCon.href2 = href2;
                    } else {
                        botUlCon.href1 = 'classicalVoice/letterRead.html';
                        botUlCon.href2 = 'classicalVoice/singleWordRead.html';
                    }

                    $("#studyTit").html(thisCon);
                    fnupdateListRead(thisId);
                })
                //************ */
                $("#mainleftul>li").eq(0).find('.tit').trigger('click');
                $(".courseA li").eq(0).trigger('click');
            }
        });
    }

    function fnupdateListRead(itmeId_) {
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

        $.ajax({
            type: "get",
            url: thisUrl + "/Areas/api/Interface.ashx",
            dataType: "json",
            data: {
                method: 'getvoice',
                type_id: itmeId_,
                user_id: username
            },
            async: true,
            success: function (data) {
                console.log(JSON.stringify(data));

                botUlCon.items = data;

                removeLoading('test');
            }
        });
    }

})