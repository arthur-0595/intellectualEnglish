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
	var textbook_id , version_id;
	var type, typeStr, textbook_name, version_name;
	
	textbook_id = sessionStorage.textbook_id;
	version_id = sessionStorage.version_id;
	typeStr = sessionStorage.typeStr;
	textbook_name = sessionStorage.textbook_name;
	version_name = sessionStorage.version_name;
	type = sessionStorage.type;
	
    var testResultArr =  sessionStorage.testResultArr;
    testResultArr = JSON.parse(testResultArr);
	
	$.getUrlParam = function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if(r != null) return decodeURI(r[2]);
		return null;
	};
    var urlScore = $.getUrlParam('score');
    
	var title = new Vue({
		el: "#title",
		data: {
			textbook_name: textbook_name,
			version_name: version_name
		}
    });
    
	var section = new Vue({
		el: "#section",
		data: {
            score: urlScore,
            items: testResultArr
		}
	});
	
})