$(function(){
	//获取用户ID
	var userMessage = sessionStorage.userMessage;
	if(userMessage) {
		userMessage = JSON.parse(userMessage);
		var username = userMessage[0].ID;
	} else {
		window.location = '../../index.html';
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
	
    //五个类的数组
	var e_c_Arr = [], // 英译汉
		c_e_Arr = [],  // 汉译英
		listeningTest = [], // 根据读音选择中文
		listenWrite = [], // 根据读音写单词
		wordWrite = [],// 根据中文写单词
		liObjArr = [],// 正确答案是数组
		wordObjArr = [];
		
    e_c_Arr = JSON.parse(sessionStorage.e_c_Arr);
    c_e_Arr = JSON.parse(sessionStorage.c_e_Arr);
    listeningTest = JSON.parse(sessionStorage.listeningTest);
    listenWrite = JSON.parse(sessionStorage.listenWrite);
    wordWrite = JSON.parse(sessionStorage.wordWrite);
    liObjArr = JSON.parse(sessionStorage.liObjArr);
	wordObjArr = JSON.parse(sessionStorage.wordObjArr);
	
	textbook_id = sessionStorage.textbook_id;
	version_id = sessionStorage.version_id;
	chapter_id = sessionStorage.chapter_id;
	typeStr = sessionStorage.typeStr;
	textbook_name = sessionStorage.textbook_name;
	version_name = sessionStorage.version_name;
	chapter_name = sessionStorage.chapter_name;
	type = sessionStorage.type;		
	$('#versions').html(version_name + ' - ' + textbook_name + ' - ' + chapter_name);
	
	
	showTitles(e_c_Arr,c_e_Arr,listeningTest,listenWrite,wordWrite);
	function showTitles(e_c_Arr,c_e_Arr,listeningTest,listenWrite,wordWrite){
		var e_c_html = '',
			c_e_html  = '',
			listen_test_html = '',
			listen_write_html = '',
			word_write_html = '';	
		// 英译汉
		$.each(e_c_Arr, function (index, element) {
			e_c_html += `<li data-correct="${element.word_mean}" class="correct">
							
							<h4>${index+1}.${element.word_name.replace(/\•/g,'')} <span class="unsel" style="margin-left:40px;"></span></h4>
							<ul class="item">
								<li  data-type="${element.meanchinese[0].type}">
									<i class="yes"></i>
									${element.meanchinese[0].content}
								</li>
								<li data-type="${element.meanchinese[1].type}" >
									<i class="no"></i>
									${element.meanchinese[1].content}
								</li>
								<li data-type="${element.meanchinese[2].type}" >
									<i class="no"></i>
									${element.meanchinese[2].content}
								</li>
								<li data-type="${element.meanchinese[3].type}">
									<i class="yes"></i>
									${element.meanchinese[3].content}
								</li>
							</ul>
							<span class="status"></span>
						</li>`;
						
		});
		$("#e_c .tests").html(e_c_html);
		
		// 汉译英
		$.each(c_e_Arr, function (index, element) {
			c_e_html += `<li data-correct="${element.word_name.replace(/\•/g,'')}" class=" ">
							<h4>${index+1}.${element.word_mean} <span class="unsel" style="margin-left:40px;"></span></h4>
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
						</li> `;
		});
		$("#c_e .tests").html(c_e_html);
		
		// 听力
		$.each(listeningTest,function( index,element ){
			listen_test_html += `<li data-correct="${element.word_mean}"  class="error">
							&nbsp;&nbsp;${index+1}. <button class="listenbtns" data-wordurl="${element.word_url}">听读音</button>
							<span class="unsel" style="margin-left:40px;"></span>
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
		$("#listeningTest .tests").html(listen_test_html);
		
		// 根据读音写单词
		$.each(listenWrite,function( index, element ){
			listen_write_html += `<li class="item_listen clearfix">
						 	<div>
						 		<span class="mark" id="mark">${index+1}.</span>
								<input type="text" class="wordInput" value="" data-url="${element.word_url}"/>
								<span class="noWord" style="display: none;"></span>
						 	</div>
					 		<p class="answer">${element.word_name.replace(/\•/g,'')}</p>	
					 		<i class="status"></i>
						</li>  `;						
		});
		$("#listenWrite .testOther").html(listen_write_html);
		
		// 根据中文默写单词
		$.each(wordWrite,function( index, element ){
			word_write_html += `<li class="item_listen clearfix">
							<div>
						 		<span class="mark">${index+1}.</span>
								<input type="text" class="wordInput" value=""/>	
								<sapn class="word_mean">${element.word_mean}</sapn>
								<span class="noWord" style="display: none;"></span>
						 	</div>
					 		<p class="answer">${element.word_name.replace(/\•/g,'')}</p>	
					 		<i class="status"></i>					 		
						</li> `;
		});
		$("#wordWrite .testOther").html(word_write_html);	
		
		
		// 点击语音按钮播放语音
		$('#listeningTest li button').on('click',function(){
			$('#audioplay').attr('src',thisUrl2 + this.dataset.wordurl);
		});		
		// 点击input框听读音
		$('#listenWrite li input').on('click',function(){
			$('#audioplay').attr('src',thisUrl2 + this.dataset.url);
		});	
		
		//通过修改class来标注选项的对错
		console.log(liObjArr);
		var bigLiAll = $(".tests > li > ul");  // 每个 item
		bigLiAll.each(function(){
			$(this).find('li i').attr('class',"no");
			$(this).parent().attr('class','error');
		});
		$.each(liObjArr, function(index , element) {
			bigLiAll.eq(element.liIndex).find('li').eq(element.answerIndex)
				.find('i').attr('class',"yes");
			if(element.myCheckedIndex >= 0){
				bigLiAll.eq(element.liIndex).find('li').eq(element.myCheckedIndex)
				.css('background','#eee');	
			}else{
				bigLiAll.eq(element.liIndex).parent().find('.unsel').text('未作答');
			}
			if(element.isCorrect){
				bigLiAll.eq(element.liIndex).parent().attr('class','correct');
			}
		});			
		// 给对应的input框添加样式
		var wordInput = $('.wordInput');
		console.log(wordObjArr);
		$.each(wordObjArr,function(index , element){
			
			if(element.myWord === ""){							
				wordInput.eq(index).parent().find('.noWord').text('未作答').show();
			}else{
				wordInput.eq(index).val(element.myWord)
				.parent().find('.noWord').hide();
			}
			if(element.isCorrect){
				wordInput.eq(element.index).attr('class','wordInput correct');
				wordInput.eq(element.index).parent().siblings('i').attr('class','status correct')
			}else{
				wordInput.eq(element.index).attr('class','wordInput error');
				wordInput.eq(element.index).parent().siblings('i').attr('class','status error')
			}
		})
		
	}
	
	
	
})
