$(function() {
	//获取用户名
	var userMessage = sessionStorage.userMessage;
	if(userMessage) {
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
	var thisReadId , thisReadCon ;
	
	var navs;
	var mainleft;
	fnupdateList();
	
	
	function fnupdateList() {
		$.ajax({
			type: "get",
			url: thisUrl + "/Areas/api/Interface.ashx",
			dataType: "json",
			data: {
				method: 'getreadtype'
			},
			async: true,
			success: function(data) {
				//				console.log(JSON.stringify(data));
				navs = data;

				mainleft = new Vue({
					el: '#mainleft',
					data: {
						items: navs
					}
				});

				$("#mainleftul>li .tit").on('click', function() {
					$("#mainleftul>li").find('ul').slideUp();
					$(this).parent().find('ul').slideDown();
				})

				$(".courseA li").on('click', function() {
					var thisId = $(this).attr('id');
					var thisCon = $(this).html();
					
					$("#studyTit").html(thisCon);
					fnupdateListRead(thisId);
				})
				$("#mainleftul>li").eq(0).find('.tit').trigger('click');
				$(".courseA li").eq(0).trigger('click');
			}
		});
	}
	
	function fnupdateListRead(itmeId_) {
		$.ajax({
			type: "get",
			url: thisUrl + "/Areas/api/Interface.ashx",
			dataType: "json",
			data: {
				method: 'getreading',
				type_id: itmeId_ , 
				user_id: username
			},
			async: true,
			success: function(data) {
				console.log(JSON.stringify(data));
				fnshowReadList(data);
			}
		});
	}
	
	function fnshowReadList(data_){
		var html_ = '';
		$.each(data_, function(index , element) {
			var status;
			if(element.allow == 1){
				status = 'complete';
			}else{
				status = '';
			}
			
			html_ += `<li class="${status}" id="${element.id}">
									<div class="pic">
									</div>
									${element.title}
								</li>`;
		});
		
		$("#botUl").html(html_)
			.find('li')
			.on('click' , function(){
				alert($(this).attr('id') );
				
				alert('跳转阅读页面');
			});
		
	}


})