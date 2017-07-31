$(function() {
	var main;
	var userMessage = sessionStorage.userMessage;
	if(userMessage) {
		userMessage = JSON.parse(userMessage);
	} else {
		window.location = '../index.html';
	}

	fnupdateMessage();

	// 修改性别
	var newSex;
	$('.genderBox>div').on('click', function() {
		$('.genderBox>div').removeClass('checked');
		$(this).addClass('checked');
	});

	

	// 头像修改
	var imgUrl;
	$('#userPic img').on('click', function() {
		$('#headPortrait').toggle();
		$("#headPortrait img").on('click', function() {
			var thisId = $(this).attr('id');
			var thisSrc = $(this).attr('src');
			$('#userPic img').attr({
				src: thisSrc,
				id: thisId
			});
			$('#headPortrait').hide();
		})
	});
//	console.log($('#userPic img')attr('id'));

	var isTelTrue, isEmailTrue, isQqTrue;
	var TelReg = /^1\d{10}$/,
		EmailReg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/,
		QqReg = /^[1-9][0-9]{4,}$/;
	// 密码框
	$('.changePassword').on('click', function() {
		$('.cover').show();
		$('.changePasswordDialog').show();
		var oldPassword, newPassword, newPasswordAgain, userCode = userMessage[0]['S_code'];
		$('#newPwd').on('keyup', function() {
			var reg = /^[a-zA-z]\w{5,15}$/;
			if(reg.test($(this).val())) {
				$('.newInput').fadeOut(200)
			} else {
				$('.newInput').fadeIn(200)
			}
		});
		$('#newPwdAgain').on('keyup', function() {
			if($(this).val() !== $('#newPwd').val()) {
				$('.againInput').fadeIn(200);
			} else {
				$('.againInput').fadeOut(200);
			}
		})

		// 验证密码修改状态
		$('.submit').on('click', function() {
			oldPassword = $.trim($('#oldPwd').val());
			newPassword = $.trim($('#newPwd').val());
			newPasswordAgain = $.trim($('#newPwdAgain').val());

			if(oldPassword && newPassword && newPasswordAgain) {
				if(newPassword === newPasswordAgain) {
					$.ajax({
						type: 'POST',
						url: thisUrl + '/Areas/api/Interface.ashx',
						dataType: 'json',
						data: {
							method: 'Editpwd',
							S_code: userCode,
							pwd: oldPassword,
							newpwd: newPassword
						},
						success: function(data) {
							if(data.result === 0) {
								$('.warning').stop();
								$('.warning').find('span').text('对不起，重置密码失败！');
								$('.warning').stop(true);
								$('.warning').show(200).delay(800).fadeOut(400);
								$('.passwordInput').each(function() {
									$(this).val('');
								});
							} else if(data.result === 1) {
								$('.warning').find('span').text('恭喜您，密码修改成功!');
								$('.warning').stop(true);
								$('.warning').show(200).delay(800).fadeOut(400);
								$("#cover").delay(1600).fadeOut(200);

							} else if(data.result === 2) {
								$('.warning').find('span').text('原密码有误！');
								$('.warning').stop(true);
								$('.oldInput').show();
								$('.warning').show(200).delay(800).fadeOut(400);

								$('.passwordInput').each(function() {
									$(this).val('');
								});

							} else if(data.result === 3) {
								$('.warning').find('span').text('该用户不存在！');
								$('.warning').stop(true);

								$('.warning').show(200).delay(800).fadeOut(400);
								$('.passwordInput').each(function() {
									$(this).val('');
								});
							}
						}

					});
				} else if(newPassword !== newPasswordAgain) {
					$('.warning').find('span').text('两次密码不一致！');
					$('.warning').stop(true);
					$('.warning').show(200).delay(800).fadeOut(400);
				}
			} else if(!oldPassword || !newPassword || !newPasswordAgain) {
				$('.warning').find('span').text('请填写完整！');
				$('.warning').stop(true);
				$('.warning').show(200).delay(800).fadeOut(400);

			}
		});
	});

	// 点击蒙版隐藏密码框
	$("#cover").on('click', function(ev) {
		if(ev.target.className === 'cover') {
			$(this).hide();
		}
	});
	// 修改信息保存
	$('.saveBtn').on('click', function() {
		$('.genderBox>div').each(function() {
			if($(this).hasClass('checked')) {
				newSex = $(this).html();
			}
		});				
		isTelTrue = TelReg.test($('#parentsInformation').val());
		isEmailTrue = EmailReg.test($('#yourEmail').val());
		isQqTrue = QqReg.test($('#yourQQ').val());
		// 验证家长电话
		if(isTelTrue && isEmailTrue && isQqTrue) {
			changeMessageajax();
			$('.tel').text('');
			$('.email').text('');
			$('.qq').text('');
		} else if(!isTelTrue) {
			$('.tel').text('请输入正确的号码！');
		}
		// 验证邮箱
		else if(!isEmailTrue) {
			$('.email').text('请输入正确的邮箱地址！');
		} else if(!isQqTrue) {
			$('.qq').text('请输入正确的qq号！');
		}
	})

	function fnupdateMessage() {
		main = new Vue({
			el: "#main",
			data: {
				userId: userMessage[0].S_code,
				longtime: userMessage[0].S_longtime.substr(0, 10),
				Integral: userMessage[0].Integral,
				Grade: userMessage[0].Grade,
				Today_Integral: userMessage[0].Today_Integral,

			}
		})
		if(userMessage[0].S_sex == "男") {
			$('.genderBox>div').removeClass('checked');
			$("#man").attr('class', 'man checked');
		} else {
			$('.genderBox>div').removeClass('checked');
			$("#woman").attr('class', 'woman checked');
		}

		$("#userPic img").attr('src', thisUrl + userMessage[0].S_picurl);
		$("#yourName").val(userMessage[0].S_name);
		$("#parentsInformation").val(userMessage[0].S_phone);
		$("#yourQQ").val(userMessage[0].S_qq);
		$("#yourEmail").val(userMessage[0].S_email);
		$("#yoursite").val(userMessage[0].S_address);
	}

	function changeMessageajax() {
		$.ajax({
			type: 'GET',
			url: thisUrl + '/Areas/api/Interface.ashx',
			dataType: 'json',
			data: {
				method: 'Editinfo',
				S_code: userMessage[0].S_code,
				S_name: $("#yourName").val(),
				S_sex: newSex,
				S_phone: $("#parentsInformation").val(),
				S_picurl: $("#userPic img").attr('id'),
				S_address: $("#yoursite").val(),
				S_qq: $("#yourQQ").val(),
				S_email: $("#yourEmail").val()
			},
			success: function(data) {
				if(data.result === 1) {
					$('.warning').text('修改信息成功!')
					$('.warning').css({
						'right': '60%',
						'top': '40%'
					}).fadeIn(400).delay(400).fadeOut(400);
					//setNewStorage();
				} else {
					$('.warning').text('修改信息失败，请核对!')
					$('.warning').css({
						'right': '60%',
						'top': '40%'
					}).fadeIn(400).delay(400).fadeOut(400)
				}
			}
		});
	}

					

//	function setNewStorage(){
//		userMessage[0].S_name = $("#yourName").val();
//		userMessage[0].S_sex = newSex;
//		userMessage[0].S_phone = $("#parentsInformation").val();
//		userMessage[0].S_picurl = $("#userPic img").attr('id');
//		userMessage[0].S_address = $("#yoursite").val();
//		userMessage[0].S_qq = $("#yourQQ").val();
//		userMessage[0].S_email = $("#yourEmail").val();	
//		
//		var userMessageStr = JSON.stringify(userMessage);
//	    sessionStorage.userMessage = userMessageStr;
//		userMessage = JSON.parse(sessionStorage.userMessage);	
//		return userMessage;			
//	}

	// 验证家长电话
	//				$('#parentsInformation').on('blur', function() {	
	//					isTelTrue = TelReg.test($(this).val());
	//					//console.log(isTelTrue);
	//					if(isTelTrue) {
	//						$('.tel').html('<img  src="../imgs/personalCenter/yes.png">');
	//						$('.tel').fadeIn(200);
	//					} else {
	//						$('.tel').html('<img src="../imgs/no.png">');
	//						$('.tel').fadeIn(200);
	//						
	//					}
	//				});

	// 验证邮箱
	//				$('#yourEmail').on('blur', function() {
	//					isEmailTrue = EmailReg.test($(this).val());
	//					if(isEmailTrue) {
	//						$('.email').html('<img src="../imgs/personalCenter/yes.png">');
	//						$('.email').fadeIn(200);
	//					} else {
	//						$('.email').html('<img src="../imgs/no.png">');
	//						$('.email').fadeIn(200);
	//						
	//					}
	//				});

	// 验证 qq
	//				$('#yourQQ').on('blur', function() {
	//					a = $('#yourQQ').val();
	//					isQqTrue = QqReg.test($(this).val());					
	//					if(isQqTrue) {
	//						$('.qq').html('<img src="../imgs/personalCenter/yes.png">');
	//						$('.qq').fadeIn(200);
	//					} else {
	//						$('.qq').html('<img src="../imgs/no.png">');
	//						$('.qq').fadeIn(200);												
	//					}
	//				});
})