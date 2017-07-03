$(function(){
	//获取用户名
	var userMessage = sessionStorage.userMessage;
	userMessage = JSON.parse(userMessage);
	var username = userMessage[0].ID;
	
	//切换在学课程及全部课程
	$("#courseNavs>li").on("click",function(){
		var thisindex = $(this).index() ;
		$("#courseNavs>li").removeClass("checked");
		$(this).addClass("checked");
		
		$("#mainBot>li").hide();
		$("#mainBot>li").eq(thisindex).show();
		
		if(thisindex == 0){
			$.ajax({
				type:"POST",
				url:thisUrl + '/Areas/Api/Interface.ashx',
				dataType: "json",
				data:{
					method:"GetSeries",
					user_id:username
				},
				success:function(data){
					alert(JSON.stringify(data) );
				},
				error:function(){
					
				}
			});
		}else{
			$.ajax({
				type:"POST",
				url:thisUrl + '/Areas/Api/Interface.ashx',
				dataType: "json",
				data:{
					method:"GetSeries",
					user_id:username
				},
				success:function(data){
//					alert(JSON.stringify(data) );
					var mainleft = document.getElementById('mainleft');
					var template1 = document.getElementById('template1');
//					alert(template1.innerHTML);
					
					fnupdateDoT(data[0] , mainleft , template1 );
				},
				error:function(){
					
				}
			});
		}
	})
	
	//选择教材
	$("#course").on("click",function(){
		$("#selectingTextbooks").toggle();
		if($("#selectingTextbooks").css("display") == "block"){
			$("#course").css("border-radius","18px 18px 0 0 ");
			$("#course").find("i").css("transform","rotate(180deg)");
		}else{
			$("#course").css("border-radius","18px");
			$("#course").find("i").css("transform","rotate(0deg)");
		}
	})
	
	//选择章节
	$("#sectionBox").on("click",function(){
		$("#chapterList").toggle();
		if($("#chapterList").css("display") == "block"){
			$("#sectionBox").css("border-radius","18px 18px 0 0 ");
			$("#sectionBox").find("i").css("transform","rotate(180deg)");
		}else{
			$("#sectionBox").css("border-radius","18px");
			$("#sectionBox").find("i").css("transform","rotate(0deg)");
		}
	})
	
	//测试相关
	$("#test").on("click",function(){
		$("#testList").toggle();
		if($("#testList").css("display") == "block"){
			$("#test").css("border-radius","18px 18px 0 0 ");
			$("#test").find("i").css("transform","rotate(180deg)");
		}else{
			$("#test").css("border-radius","18px");
			$("#test").find("i").css("transform","rotate(0deg)");
		}
	})
	
})