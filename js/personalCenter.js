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
	var newSex = userMessage[0].S_sex;
	$('.genderBox>div').on('click', function() {
		$('.genderBox>div').removeClass('checked');
		$(this).addClass('checked');
		newSex = this.id.substr(-1);
	});	
	// 头像修改
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

	var isTelTrue, isEmailTrue, isQqTrue;
	var TelReg = /^1\d{10}$/,
		EmailReg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/,
		QqReg = /^[1-9][0-9]{4,}$/;		
		$('#newPwd').on('blur', function() {
			if($(this).val()){
				var reg = /^\w{6,16}$/;
				if(!reg.test($(this).val())) {
					$('.newInput').text('密码应为6-16位！').css('color','red').fadeIn(200);
				} else {
					$('.newInput').fadeOut(200);
				}
			}			
		});
		$('#newPwd').on('focus',function(){
			$('.newInput').text('6-16位数字、字母、下划线').css('color','#999').fadeIn(200);
		});
	// 密码框
	$('.changePassword').on('click', function() {		
		$('#cover').show();
		$('#changePasswordDialog').show();
		$('#oldPwd').focus();
		$('.passwordInput').each(function() {
			$(this).val('');
		});
		$('.oldInput').hide();
		$('.newInput').text('6-16位数字、字母、下划线').css('color','#999').fadeIn(200);
		$('.againInput').hide();
		var oldPassword, newPassword, newPasswordAgain, userCode = userMessage[0]['S_code'];
		// 验证密码修改状态
		$('.submit').on('click', function() {
			oldPassword = $.trim($('#oldPwd').val());
			newPassword = $.trim($('#newPwd').val());
			newPasswordAgain = $.trim($('#newPwdAgain').val());
			if(oldPassword && newPassword && newPasswordAgain) {
				if(newPassword === newPasswordAgain) {						
						var reg = /^\w{6,16}$/;
						if(!reg.test($('#newPwd').val())) {
							$('#newPwd').focus();
							$('.newInput').text('密码应为6-16位！').css('color','red').fadeIn(200);	
							$('.againInput').hide();
						} 
						else {
							$('.newInput').fadeOut(200);
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
										clearInput('对不起，重置密码失败');
									} else if(data.result === 1) {
										$('.againInput').hide();
										warnMsg('恭喜您，密码修改成功');												
										$("#cover").delay(1600).fadeOut(200);
										return false;
									} else if(data.result === 2) {
										warnMsg('原密码有误');
										$('#oldPwd').focus();
										$('.oldInput').show();
										$('.newInput').text('6-16位数字、字母、下划线').css('color','#999').fadeIn(200);
										$('.againInput').hide();
		
									} else if(data.result === 3) {								
										clearInput('该用户不存在');
									}
								}
							});
						}					
						
					
				} else {
					warnMsg('两次密码不一致');
					$('#newPwdAgain').val('').focus();
					$('.againInput').css('color','red').fadeIn(200);
				}
			} else if(!oldPassword || !newPassword || !newPasswordAgain) {
				warnMsg('请填写完整信息');
				$('#oldPwd').focus();
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
	$('#saveBtn').on('click', function() {
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
	});
	
	// 密码框提示信息
	function warnMsg( msg ){
		$('#warning').stop(true,true).html(msg).show(200).delay(800).fadeOut(400);
	}
	
	// 修改信息后清除input值
	function clearInput(msg){
		$('#warning').stop(true,true).html(msg).show(200).delay(800).fadeOut(400);
		$('.passwordInput').each(function() {
			$(this).val('');
		});
	}

	function fnupdateMessage() {
		main = new Vue({
			el: "#main",
			data: {
				userId: userMessage[0].S_code,
				longtime: userMessage[0].S_longtime.substr(0, 10),
				Integral: userMessage[0].Integral,
				Grade: userMessage[0].Grade,
				Today_Integral: userMessage[0].Today_Integral,
				sex: userMessage[0].S_sex,
				phone: userMessage[0].S_phone,
				email: userMessage[0].S_email,
				qq: userMessage[0].S_qq,
				address: userMessage[0].S_address,
				uesrName: userMessage[0].S_name,
				userPicSrc: thisUrl + userMessage[0].S_picurl
			}
		})
	}

	function changeMessageajax() {
		var code = userMessage[0].S_code,
			name = $("#yourName").val(),
			phone = $("#parentsInformation").val(),
			picurl = $("#userPic img").attr('id'),
			address = $("#yoursite").val(),
			qq = $("#yourQQ").val(),
			email = $("#yourEmail").val();
		
		$.ajax({
			type: 'GET',
			url: thisUrl + '/Areas/api/Interface.ashx',
			dataType: 'json',
			data: {
				method: 'Editinfo',
				S_code: code,
				S_name: name,
				S_sex: newSex,
				S_phone: phone,
				S_picurl: picurl,
				S_address: address,
				S_qq: qq,
				S_email: email
			},
			success: function(data) {
				console.log(data);
				if(data.result === 1) {
					$('.warning').text('修改信息成功!')
					$('.warning').css({
						'right': '60%',
						'top': '40%'
					}).fadeIn(400).delay(400).fadeOut(400);

					//更新用户信息的缓存
					sessionStorage.userMessage = JSON.stringify(data.update);
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
})
