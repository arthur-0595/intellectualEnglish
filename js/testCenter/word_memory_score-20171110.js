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
	//本章所有的单词
	var wordsArr;
	//包涵所有中文释义的数组以及包涵所有英文单词的数组
	var itemNum;

	$.getUrlParam = function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if(r != null) return decodeURI(r[2]);
		return null;
	};
	var urlScore = $.getUrlParam('score');
	$("#thisScore").html(urlScore);
	
	// 根据测试分数显示gif动画
    if(urlScore<=60){
		$('#gifImg').css('background','url(../../imgs/14.gif) no-repeat center center');
	}else if(urlScore>60 && urlScore <=80){
		$('#gifImg').css('background','url(../../imgs/114.gif) no-repeat center center');
	}else if(urlScore>80 && urlScore <=99){
		$('#gifImg').css('background','url(../../imgs/112.gif) no-repeat center center');
	}else if(urlScore==100){
		$('#gifImg').css('background','url(../../imgs/113.gif) no-repeat center center');
	}	
	// gif停留5秒消失
	var totalNum = 5;
	setInterval(function(){
		totalNum--;
		if(totalNum<=0){
			$('#gifImg').hide(200);
			return;
		}
	},1000);
	
	//三个类的数组
	var e_c_Arr = [],
		c_e_Arr = [],
        listeningTest = [];
    e_c_Arr = JSON.parse(sessionStorage.e_c_Arr);
    c_e_Arr = JSON.parse(sessionStorage.c_e_Arr);
    wordsArr = JSON.parse(sessionStorage.wordsArr);

	textbook_id = sessionStorage.textbook_id;
	version_id = sessionStorage.version_id;
	chapter_id = sessionStorage.chapter_id;
	typeStr = sessionStorage.typeStr;
	textbook_name = sessionStorage.textbook_name;
	version_name = sessionStorage.version_name;
	chapter_name = sessionStorage.chapter_name;
	type = sessionStorage.type;
	
	var liObjArr = JSON.parse( sessionStorage.liObjArr) ;

	var con = new Vue({
		el: "#con",
		data: {
			textbook_name: textbook_name,
			version_name: version_name,
			typeStr: typeStr
		}
	})
	//显示成绩
    fnshowtopic();

	function fnshowtopic() {
		var e_cHtml = '',
			c_eHtml = '',
			listeningTestHtml = '';

		$.each(e_c_Arr, function(index, element) {
			e_cHtml += `<li data-correct="${element.word_mean}" class="">
							
							<h4>${index+1}.${element.word_name.replace(/\•/g,'')}</h4>
							<ul class="item">
								<li  data-type="${element.meanchinese[0].type}">
									<i class=""></i>
									${element.meanchinese[0].content}
								</li>
								<li data-type="${element.meanchinese[1].type}" >
									<i class=""></i>
									${element.meanchinese[1].content}
								</li>
								<li data-type="${element.meanchinese[2].type}" >
									<i class=""></i>
									${element.meanchinese[2].content}
								</li>
								<li data-type="${element.meanchinese[3].type}">
									<i class=""></i>
									${element.meanchinese[3].content}
								</li>
							</ul>
							<span class="status"></span>
						</li>`;
		});
		$("#e_c .tests").html(e_cHtml);

		$.each(c_e_Arr, function(index, element) {
			c_eHtml += `<li data-correct="${element.word_name.replace(/\•/g,'')}" class=" ">
							<h4>${index+1}.${element.word_mean} </h4>
							<ul class="item">
								<li data-type="${element.meanenglish[0].type}">
									<i class=""></i>
									${element.meanenglish[0].content.replace(/\•/g,'')}
								</li>
								<li data-type="${element.meanenglish[1].type}">
									<i class=""></i>
									${element.meanenglish[1].content.replace(/\•/g,'')}
								</li>
								<li data-type="${element.meanenglish[2].type}">
									<i class=""></i>
									${element.meanenglish[2].content.replace(/\•/g,'')}
								</li>
								<li data-type="${element.meanenglish[3].type}">
									<i class=""></i>
									${element.meanenglish[3].content.replace(/\•/g,'')}
								</li>
							</ul>
							<span class="status"></span>
						</li>`;
		});
		$("#c_e .tests").html(c_eHtml);

		$.each(wordsArr, function(index, element) {
			listeningTestHtml += `<li data-correct="${element.word_mean}"  class="">
							&nbsp;&nbsp;${index+1}. <button class="listenbtns" data-wordurl="${element.word_url}">听读音</button>
							
							<ul class="item">
								<li data-type="${element.meanchinese[0].type}">
									<i class=""></i>
									${element.meanchinese[0].content}
								</li>
								<li data-type="${element.meanchinese[1].type}">
									<i class=""></i>
									${element.meanchinese[1].content}
								</li>
								<li data-type="${element.meanchinese[2].type}">
									<i class=""></i>
									${element.meanchinese[2].content}
								</li>
								<li data-type="${element.meanchinese[3].type}">
									<i class=""></i>
									${element.meanchinese[3].content}
								</li>
							</ul>
							<span class="status"></span>
						</li>`;
		});
		$("#listeningTest .tests").html(listeningTestHtml);
		//点击听语音按钮
		$("#listeningTest li button").on("click", function() {
			var playerSrc = thisUrl2 + this.dataset.url;
			$("#audioplay").attr("src", playerSrc);
		})
		//通过修改class来标注选项的对错
//		console.log(liObjArr);
		var bigLiAll = $(".tests > li > ul");  // 每个 item
		bigLiAll.each(function(){
			$(this).parent().attr('class','error');
		});
		$.each(liObjArr, function(index , element) {
			bigLiAll.eq(element.liIndex).find('li').eq(element.answerIndex)
				.find('i').attr('class',"yes");
			if(element.myCheckedIndex >= 0){
				bigLiAll.eq(element.liIndex).find('li').eq(element.myCheckedIndex)
				.css('background','#ddd');	
				if(!element.isCorrect){
					bigLiAll.eq(element.liIndex).find('li').eq(element.myCheckedIndex)
					.css('background','#ddd').find('i').addClass('no');	
				}
			}
			if(element.isCorrect){
				bigLiAll.eq(element.liIndex).parent().attr('class','correct');
			}
		});	
	}

})





















