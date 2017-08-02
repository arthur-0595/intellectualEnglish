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

	fnupdateList();

	var mode = new Vue({
		el: "#mode",
		data: {
			total: 20,
			repeatnumber: 8,
			listennumber: 10,
			oralnumber: 12,
			score: 66
		}
	});
	//点击关闭弹出菜单
	$("#closeBox").on('click', function() {
		$("#mode").finish().toggle();
	});

	function fnupdateList() {
		var bigType = 0;
		$.ajax({
			type: "POST",
			url: thisUrl2 + "/Areas/api/Index.ashx",
			dataType: 'json',
			data: {
				method: 'GetSpokeType',
				f_id: bigType
			},
			async: true,
			success: function(data) {
				if(data) {
					var html_ = '';
					$.each(data, function(index, element) {
						html_ += `<li id="${element.id}">${element.spoke_name}</li>`;
					});
					$("#tleft").html(html_);
					//给点击大类的按钮绑定事件
					$("#tleft>li").on("click", function() {
						$("#tleft>li").attr('class', '');
						$(this).attr('class', 'this');

						version_id = $(this).attr('id');
						version_name = $(this).html();
						sessionStorage.version_id = version_id;
						sessionStorage.version_name = version_name;

						fnupdateRightList($(this).attr('id'));
					});
					//默认点击第一个大类的第一个小类
					$("#tleft>li").eq(0).trigger('click');
				}
			}
		});
	}

	function fnupdateRightList(id_) {
		$.ajax({
			type: "post",
			url: thisUrl2 + "/Areas/api/Index.ashx",
			dataType: 'json',
			data: {
				method: 'GetSpokeType',
				f_id: id_
			},
			async: true,
			success: function(data) {
				if(data) {
					var htmlR = '';
					$.each(data, function(index, element) {
						htmlR += `<li id="${element.id}">${element.spoke_name}</li>`;
					});
					$("#tright").html(htmlR);

					//给点击小类的按钮绑定事件
					$("#tright>li").on("click", function() {
						$("#tright>li").attr('class', '');
						$(this).attr('class', 'this');

						textbook_id = $(this).attr('id');
						textbook_name = $(this).html();
						sessionStorage.textbook_id = textbook_id;
						sessionStorage.textbook_name = textbook_name;

						$("#studytop").html($(this).html());
						fnshowallItem($(this).attr('id'));
					});
					$("#tright>li").eq(0).trigger('click');
				}
			}
		});
	}

	function fnshowallItem(id_) {
		$.ajax({
			type: "post",
			url: thisUrl2 + "/Areas/api/Index.ashx",
			dataType: 'json',
			data: {
				method: 'GetSpokeType',
				f_id: id_
			},
			async: true,
			success: function(data) {
				if(data) {
					var htmlbot = '';
					$.each(data, function(index, element) {
						htmlbot += `<li id="${element.id}">${element.spoke_name}</li>`;
					});
					$("#studybot").html(htmlbot)
						.find('li')
						.on('click', function() {
							var thisId = $(this).attr('id');

							chapter_id = thisId;
							chapter_name = $(this).html();
							sessionStorage.chapter_id = chapter_id;
							sessionStorage.chapter_name = chapter_name;

							$("#mode").fadeToggle(150);

							fnupdateMode(thisId);
						});
				}
			}
		});
	}

	function fnupdateMode(id_) {
		$.ajax({
			type: "post",
			url: thisUrl2 + "/Areas/api/Index.ashx",
			dataType: 'json',
			data: {
				method: 'GetSpokenUser',
				user_id: username,
				type_id: id_
			},
			async: true,
			success: function(data) {
				if(data[0]) {
					console.log(data);
					mode.total = data[0].total;
					mode.repeatnumber = parseInt((data[0].repeatnumber/data[0].total)*100) ;
					mode.listennumber = parseInt((data[0].listennumber/data[0].total)*100);
					mode.oralnumber = parseInt((data[0].oralnumber/data[0].total)*100);
					mode.score = data[0].score;
				}
			}
		});
	}

});