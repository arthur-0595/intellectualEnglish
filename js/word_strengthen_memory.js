$(function(){
	//当前选择的版本ID，教材ID ,选择的章节
	var textbook_id, chapter_id;
	//当前语音文件播放路径
	var audioplaySrc;
	//该单元下所有单词
	var wordsArr;
	
	$.getUrlParam = function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if(r != null) return decodeURI(r[2]);
		return null;
	};
	textbook_id = $.getUrlParam('textbook_id');
	chapter_id = $.getUrlParam('chapter_id');
	textbook_name = $.getUrlParam('textbook_name');
	version_name = $.getUrlParam('version_name');
	chapter_name = $.getUrlParam('chapter_name');
	
	fnGetAllTheWords();
	
	function fnGetAllTheWords(){
		$.ajax({
			type: "POST",
			url: thisUrl + '/Areas/Api/Interface.ashx',
			dataType: "json",
			data: {
				method: "getwords",
				unit_id: chapter_id,
			},
			success: function(data) {
				wordsArr = data.result;
				
				
			}
		});
	}
	
	function fnshowthisWord(wordObj){
		
	}
	
	
})







































