$(function(){
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
	//当前语音文件播放路径
	var audioplaySrc;
	//当前听写的单词或句子
	var thisListen;
	//当前类别
	var type = 1;
	//当前类别所有的口语组成的数组，以及数组长度
	var spokenLanguageArr , spokenLanguageArrlength;
	var num = 0;
	
	textbook_id = sessionStorage.textbook_id;
	version_id = sessionStorage.version_id;
	chapter_id = sessionStorage.chapter_id;
	typeStr = sessionStorage.typeStr;
	textbook_name = sessionStorage.textbook_name;
	version_name = sessionStorage.version_name;
	chapter_name = sessionStorage.chapter_name;
	
	var versions = new Vue({
		el: '#versions',
		data:{
			version_name: version_name,
			textbook_name: textbook_name,
			chapter_name: chapter_name
		}
	})
	var con = new Vue({
		el: '#con',
		data:{
			thisEnglish: version_name,
			thisChinese: textbook_name,
		}
	})
	var audioplay = new Vue({
		el: '#audioplay',
		data:{
			thisSrc: version_name
		}
	})
	
	fnAjaxSen();
	
	$("#player").on("click" , function(){
		$("#audioplay").attr('src' , audioplaySrc);
	});
	$("#enter").on('click' , function(){
		fnUpdateNextSen();
	});
	
	document.onkeyup = function (event) {
		var e = event || window.event || arguments.callee.caller.arguments[0];
		if (e && e.keyCode == 13) {
			$("#enter").trigger('click');
		}else if(e && e.keyCode == 17){
			$("#player").trigger('click');
		}
	};

	// 录音按钮动画				
	var num = 0;
	$('#record').on('click',function(){
		num++;
		if( num%2 != 0 ){
			$(this).addClass('a');
			recorder && recorder.record();
		}
		else{
			$(this).removeClass('a');
			recorder && recorder.stop(); 
		}		
	});
	
	$('#listenIn').on('click',function(){
		createLink();
		recorder.clear();
	})
	
	var audio_context;
  	var recorder;

	function startUserMedia(stream) {
	   var input = audio_context.createMediaStreamSource(stream);
	   recorder = new Recorder(input);
	}

  function createLink() {
    recorder && recorder.exportWAV(function(blob) {
      var url = URL.createObjectURL(blob);
      $("#audioplay").attr('src' , url);
      
    });
  }      
	navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
      console.log('No live audio input: ' + e);
   });
   
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
    window.URL = window.URL || window.webkitURL;     
    audio_context = new AudioContext;
    
  
					
	function fnAjaxSen(){
		$.ajax({
			type:"POST",
			url: thisUrl2 + "/Areas/api/Index.ashx",
			async:true,
			dataType: 'json',
			data:{
				method: 'GetStartByWay',
				user_id: username,
				type_id: chapter_id,
				way_id: type
			},
			success:function(data){
				spokenLanguageArr = data;
				spokenLanguageArrlength = data.length;				
				fnUpdateSen(spokenLanguageArr[0]);
			}
		});
	}
	//点击下一句
	function fnUpdateNextSen(){
		num++;
		if(num < spokenLanguageArrlength){
			fnUpdateSen(spokenLanguageArr[num]);
		}else{
			$("#alertBox").show().find('h4').text('学习完成!');
			$('#btnOk').on('click',function(){
				$("#alertBox").hide();
				window.close();
			});
			//alert('学习完成');
			//window.close();
			// window.location = 'ver_tongue.html';
		}
	}
	//加载数组内当前项的内容到页面
	function fnUpdateSen(obj_){
		con.thisEnglish = obj_.sentence;
		con.thisChinese = obj_.sentence_mean;		
		audioplaySrc = thisUrl2 + obj_.sentence_url;
		audioplay.thisSrc = audioplaySrc;
	}
	
})



































