$(function() {
	//获取用户名
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
	//当前阅读文章内容
	var readCon;

	textbook_id = sessionStorage.textbook_id;
	chapter_id = sessionStorage.chapter_id;
	version_id = sessionStorage.version_id;
	textbook_name = sessionStorage.textbook_name;
	version_name = sessionStorage.version_name;
	chapter_name = sessionStorage.chapter_name;

	readCon = sessionStorage.readCon;
	typeStr = sessionStorage.typeStr;

	var versions = new Vue({
		el: '#versions',
		data: {
			version_name: version_name,
			textbook_name: textbook_name,
			chapter_name: chapter_name
		}
	})
	fnupdatetopic();
	
	//点击交卷按钮，提交本次测试的答案
	var num = 0;
	$("#enterTheAnswer").on('click', function() {
		//该变量表示本次测试的正确的题目数量
		var  n = 0;
		if(num < 1) {
			num++;
			
			var liArr = $("#sectionBoxId li");
			$.each(liArr, function(index, element) {
				$.each($(element).find('input'), function(index_, element_) {
					//alert( $(element_).prop('checked') );
					if($(element_).prop('checked')) {
						if($(element_).parent('label')[0].id == 1) {
							n++;//正确时，则该值+1
							$('#box li').eq(index).find('span').html('正确');
						}
					}
				})
			});
			//提交本次测试
			fncommitthisTest(n);
		}
		$("#mode").show();

		return false;
	});
	//点击蒙版任意位置，关闭显示本次测试结果
	$("#mode").on('click', function(ev) {
		ev.cancelBubble = true;
		$(this).hide();
	})
	
	function fncommitthisTest(num_){
		$.ajax({
			type: "GET",
			url: thisUrl + "/Areas/api/Interface.ashx",
			dataType: 'json',
			data: {
				method: 'readingtest',
				user_id: username,
				read_id: chapter_id,
				type_id: textbook_id,
				score: num_
			},
			async: true,
			success: function(data) {
				if(data != 1){
					$("#alertBox").show().find('h4').text('本次交卷提交失败');
					$('#btnOk').on('click',function(){				
						$("#alertBox").hide();
					});
				}
			}
		});
	}

	function fnupdatetopic() {
		$.ajax({
			type: "GET",
			url: thisUrl + "/Areas/api/Interface.ashx",
			dataType: 'json',
			data: {
				method: 'getreadingsubject',
				read_id: chapter_id
			},
			async: true,
			success: function(data) {
				var sectionBoxId = new Vue({
					el: "#sectionBoxId",
					data: {
						items: data
					}
				});
			}
		});
	}

})