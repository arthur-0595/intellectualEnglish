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
	
	textbook_id = sessionStorage.textbook_id;
	version_id = sessionStorage.version_id;
	chapter_id = sessionStorage.chapter_id;
	typeStr = sessionStorage.typeStr;
	textbook_name = sessionStorage.textbook_name;
	version_name = sessionStorage.version_name;
	chapter_name = sessionStorage.chapter_name;
    
    $.getUrlParam = function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if(r != null) return decodeURI(r[2]);
		return null;
    };
    var urlScore = $.getUrlParam('score');
	
    var thisTestArr = JSON.parse(sessionStorage.thisTestArr);
    console.log(thisTestArr);

    var title = new Vue({
        el: "#title",
        data:{
            version_name: version_name,
            textbook_name: textbook_name,
            chapter_name: chapter_name
            // itmes:thisTestArr
        }
    })
    var section = new Vue({
        el: "#section",
        data:{
            urlScore: urlScore,
            items: thisTestArr
        }
    })


})