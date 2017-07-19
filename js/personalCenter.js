$(function() {
				var main;
				var userMessage = sessionStorage.userMessage;
				if(userMessage) {
					userMessage = JSON.parse(userMessage);
				} else {
					alert('检测到您未登录，请先登录！');
					window.location = '../index.html';
				}
				fnupdateMessage();

				// 修改性别
				$('.genderBox>div').on('click', function() {
					$('.genderBox>div').removeClass('checked');
					$(this).addClass('checked');
				});

				// 头像修改
				$('.pic').on('click', function() {
					var $this = $(this);
					$('.headPortrait').show();
					$('.headPortrait').find('li').on('click', function() {
						$this.html($(this).find('img'));
						$('.headPortrait').hide(400);
					})
				});

				// 验证家长电话
				$('#parentsInformation').on('blur', function() {
					var reg = /^1\d{10}$/;
					if(reg.test($(this).val())) {
						$('.tel').text('输入正确！');
						$('.tel').fadeIn(200).delay(1000).fadeOut(400);
					} else {
						$('.tel').text('手机号码输入错误！');
						$('.tel').fadeIn(200).delay(1000).fadeOut(400);
						$(this).val('').focus();
					}
				});

				// 验证邮箱
				$('#yourEmail').on('blur', function() {
					var reg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
					if(reg.test($(this).val())) {
						$('.email').text('输入正确！');
						$('.email').fadeIn(200).delay(1000).fadeOut(400)
					} else {
						$('.email').text('请输入正确的邮箱地址！！');
						$('.email').fadeIn(200).delay(1000).fadeOut(400);
						$(this).val('').focus();
					}
				});

				// 验证 qq
				$('#yourQQ').on('blur', function() {
					var reg = /^[1-9][0-9]{4,}$/;
					if(reg.test($(this).val())) {
						$('.qq').text('输入正确！');
						$('.qq').fadeIn(200).delay(1000).fadeOut(400)
					} else {
						$('.qq').text('请输入正确的QQ号!');
						$('.qq').fadeIn(200).delay(1000).fadeOut(400);
						$(this).val('').focus();
					}
				});

				$('.changePassword').on('click', function() {
					$('.changePasswordDialog').toggle(200);
					var oldPassword, newPassword, newPasswordAgain, userCode = userMessage[0]['S_code'];
					$('#oldPwd').on('blur', function() {
						var reg = /^[a-zA-z]\w{5,15}$/;
						if(reg.test($(this).val())) {
							$('.oldInput').fadeOut(200)
						} else {
							$('.oldInput').fadeIn(200)
						}
					});
					$('#newPwd').on('blur', function() {
						var reg = /^[a-zA-z]\w{5,15}$/;
						if(reg.test($(this).val())) {
							$('.newInput').fadeOut(200)
						} else {
							$('.newInput').fadeIn(200)
						}
					});
					$('#newPwdAgain').on('blur', function() {
						if($(this).val() !== $('#newPwd').val()) {
							$('.againInput').fadeIn(200);
							$(this).val('');
							$('#newPwd').val('').focus();
						} else {
							$('.againInput').fadeOut(200);
						}
					})

					// 点击确认按钮修改，验证修改状态
					$('.submit').on('click', function() {
						oldPassword = $.trim($('#oldPwd').val());
						newPassword = $.trim($('#newPwd').val());
						newPasswordAgain = $.trim($('#newPwdAgain').val())
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
									$('.warning').find('span').text('对不起，重置密码失败！');
									$('.warning').show(200).delay(1000).fadeOut(400);
									$('.passwordInput').each(function() {
										$(this).val('');
									});
								} else if(data.result === 1) {
									$('.warning').find('span').text('恭喜您，密码修改成功!');
									$('.warning').show(200).delay(1000).fadeOut(400);

								} else if(data.result === 2) {
									$('.warning').find('span').text('原密码有误！');
									$('.warning').show(200).delay(1000).fadeOut(400);
									$('.passwordInput').each(function() {
										$(this).val('');
									});

								} else if(data.result === 3) {
									$('.warning').find('span').text('该用户不存在！');
									$('.warning').show(200).delay(1000).fadeOut(400);
									$('.passwordInput').each(function() {
										$(this).val('');
									});
								}
							}
						});
					})
				});
				$("#cover").on('click',function(ev){
					ev.
					$(this).hide();
				})
				

				// 修改用户信息
				$('.saveBtn').on('click', function() {
					$.ajax({
						type: 'GET',
						url: 'http://192.168.2.127:8090/Areas/api/Interface.ashx',
						dataType: 'json',
						data: {
							method: 'Editinfo',
							S_code: userMessage[0].S_code,
							S_name: $("#yourName").val(),
							S_sex: userMessage[0].S_sex,
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
								}).fadeIn(400).delay(1000).fadeOut(400)
							} else {
								$('.warning').text('修改信息失敗，请核对!')
								$('.warning').css({
									'right': '60%',
									'top': '40%'
								}).fadeIn(400).delay(1000).fadeOut(400)
							}
						}
					});
				})

				function fnupdateMessage() {
					main = new Vue({
						el: "#main",
						data: {
							userId: userMessage[0].S_code,
							longtime: userMessage[0].S_longtime.substr(0, 10),
							Integral: userMessage[0].Integral,
							Grade: userMessage[0].Grade,
							Today_Integral: userMessage[0].Today_Integral
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
			})