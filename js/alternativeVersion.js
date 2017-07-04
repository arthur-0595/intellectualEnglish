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
	var textbook_id, version_id, chapter_id;
	var textbook_name, version_name, chapter_name;
	//当前的大类，大类的name
	var type, typeStr, typeEnglish;

	$.getUrlParam = function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if(r != null) return decodeURI(r[2]);
		return null;
	};
	type = $.getUrlParam('type');
	typeStr = $.getUrlParam('typeStr');
	typeEnglish = $.getUrlParam('typeEnglish');
	//根据大类以及大类的name来显示相应的页面内容
	(function() {
		var typeEnglish = ['Intelligent Memory'];
		$("#centerSpan").html(typeStr);
		var cenBook = `<div class="pic">
						<img src="../imgs/home/${type}.png" />
					</div>
					<h3>${typeStr}</h3>
					<span>${typeEnglish}</span>
					<i>点击开始学习</i>`;
		$("#cen_book").html(cenBook);

		$("#category_h").html(`${type}
							<span>${typeEnglish}</span>`);
		$("#title_h").html(typeStr);
	})();
	//跳转智能记忆

	$("#clickBook").on("click", function() {
		if(type == 01) {
			fnopenLocationHref();
		} else {
			alert("相关页面开发未完成");
		}
	});

	function fnopenLocationHref() {
		if(textbook_id && version_id && chapter_id) {
			window.location = 'word_memory.html?textbook_id=' + textbook_id + '&version_id=' + version_id + '&chapter_id=' + chapter_id + '&typeStr=' + typeStr + '&version_name=' + version_name + '&textbook_name=' + textbook_name + '&chapter_name=' + chapter_name;
		} else {
			alert("请确认已选择好课程及相关章节");
		}
	}

	//切换在学课程及全部课程
	$("#courseNavs>li").on("click", function() {
		var thisindex = $(this).index();
		$("#courseNavs>li").removeClass("checked");
		$(this).addClass("checked");

		$("#mainBot>li").hide();
		$("#mainBot>li").eq(thisindex).show();

		if(thisindex == 0) {
			//			username = 1;
			$.ajax({
				type: "POST",
				url: thisUrl2 + '/Areas/Api/index.ashx',
				dataType: "json",
				data: {
					method: "GetStudy",
					user_id: username
				},
				success: function(data) {
					//					alert(JSON.stringify(data));
					if(data.length >= 1) {

						var nhtml = '';
						$.each(data, function(index, element) {
							nhtml += `<tr data-textbookid = "${element.textbook_id}" data-versionId = "${element.version_id}" data-versionname = "${element.version_name}" data-textbookname = "${element.textbook_name}">
								<td class="StudycourseName">${element.version_name} - ${element.textbook_name}</td>
								<td>两个小时前</td>
								<td>
									<a href="javascript:;">查看</a>
									<div class="studyRateBox"></div>
								</td>
								<td class="startStudy">学习</td>
							</tr>`;
						})
						$("#myCourses tbody").html(nhtml);

						$(".startStudy").on("click", function() {
							fnselectingTextbooksTog();
							textbook_id = $(this).parent("tr")[0].dataset.textbookid;
							version_id = $(this).parent("tr")[0].dataset.versionid;
							textbook_name = $(this).parent("tr")[0].dataset.textbookname;
							version_name = $(this).parent("tr")[0].dataset.versionname;

							var name = $(this).parent("tr").find("td.StudycourseName").html();
							$("#course p").html(name);
						});
					}
				}
			});
		} else {
			$.ajax({
				type: "POST",
				url: thisUrl + '/Areas/Api/Interface.ashx',
				dataType: "json",
				data: {
					method: "GetSeries",
					user_id: username
				},
				success: function(data) {
					if(data.length >= 1) {
						var nhtml = '';
						$.each(data, function(index, element) {
							nhtml += `<li class="padL30" data-seseriesId = "${element.series_id}" >${element.series_name}</li>`;
						});
						$("#mainleft").html(nhtml);

						//所有课程》选择系列
						$("#mainleft>li").on("click", function() {
							var thisseseriesid = this.dataset.seseriesid;

							$.ajax({
								type: "POST",
								url: thisUrl + '/Areas/Api/Interface.ashx',
								dataType: "json",
								data: {
									method: "GetVersionBySeriesID",
									user_id: username,
									series_id: thisseseriesid
								},
								success: function(data) {
									if(data.length >= 1) {
										//								alert(JSON.stringify(data) );
										var nhtml = '';
										$.each(data, function(index, element) {
											nhtml += `<li class="padL30" data-seseriesId = "${element.series_id}" data-versionId = "${element.version_id}" >${element.version_name}</li>`;
										});
										$("#mainmid").show();
										$("#mainmid").html(nhtml);

										//所有课程》选择系列>选择版本
										$("#mainmid>li").on("click", function() {
											var thisversionid = this.dataset.versionid;

											$("#course p").html(this.innerHTML);
											$("#course p").append(' - ');
											$.ajax({
												type: "POST",
												url: thisUrl + '/Areas/Api/Interface.ashx',
												dataType: "json",
												data: {
													method: "GetTextBookByVersionID",
													user_id: username,
													version_id: thisversionid
												},
												success: function(data) {
													if(data.length >= 1) {
														//																			alert(JSON.stringify(data) );
														var nhtml = '';
														$.each(data, function(index, element) {
															nhtml += `<li class="padL30" data-textbookid = "${element.textbook_id}" data-versionId = "${element.version_id}">${element.textbook_name}</li>`;
														});
														$("#mainright").show();
														$("#mainright").html(nhtml);

														//所有课程》选择系列>选择版本>选择课程
														$("#mainright>li").on("click", function() {
															var thistextbookid = this.dataset.textbookid;

															textbook_id = this.dataset.textbookid;
															version_id = this.dataset.versionid;

															//												alert(version_id);
															fnselectingTextbooksTog();
															$("#course p").append(this.innerHTML);
														})
													}
												}
											});
										})
									}
								}
							});
						})
					}
				}
			});
		}
	})

	//选择教材
	$("#course").on("click", function() {
		fnselectingTextbooksTog();
	})

	//选择章节
	$("#sectionBox").on("click", function() {
		fnchapterList();
	})

	//测试相关
	$("#test").on("click", function() {
		$("#testList").toggle();
		if($("#testList").css("display") == "block") {
			$("#test").css("border-radius", "18px 18px 0 0 ");
			$("#test").find("i").css("transform", "rotate(180deg)");
		} else {
			$("#test").css("border-radius", "18px");
			$("#test").find("i").css("transform", "rotate(0deg)");
		}
	})

	//显示选择教材的函数
	function fnselectingTextbooksTog() {
		$("#selectingTextbooks").toggle();
		if($("#selectingTextbooks").css("display") == "block") {
			$("#course").css("border-radius", "18px 18px 0 0 ");
			$("#course").find("i").css("transform", "rotate(180deg)");

			$("#courseNavs li").eq(0).trigger("click");
		} else {
			$("#course").css("border-radius", "18px");
			$("#course").find("i").css("transform", "rotate(0deg)");
		}
	}

	function fnchapterList() {
		$("#chapterList").toggle();
		if($("#chapterList").css("display") == "block") {
			$("#sectionBox").css("border-radius", "18px 18px 0 0 ");
			$("#sectionBox").find("i").css("transform", "rotate(180deg)");

			fnshowUnit();
		} else {
			$("#sectionBox").css("border-radius", "18px");
			$("#sectionBox").find("i").css("transform", "rotate(0deg)");
		}
	}

	function fnshowUnit() {
		$.ajax({
			type: "POST",
			url: thisUrl2 + '/Areas/Api/index.ashx',
			dataType: "json",
			data: {
				method: "GetUnitByTextBookID",
				textbook_id: textbook_id
			},
			success: function(data) {
				//									alert(JSON.stringify(data));
				if(data.length >= 1) {
					var nhtml = '';
					$.each(data, function(index, element) {
						nhtml += `<li id="${element.id}" data-chaptername="${element.unit_name}">${element.unit_name}</li>`;
					})
					$("#chapterList").html(nhtml);

					$("#chapterList>li").on("click", function() {
						var thisname = $(this).html();
						$("#sectionBox p").html(thisname);

						chapter_id = this.id;
						chapter_name = this.dataset.chaptername;

						$("#chapterList").toggle();
					});
				}
			}
		});
	}

})