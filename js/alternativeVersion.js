$(function(){
	
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