//本地地址
//var thisUrl = 'http://192.168.2.127:8090';

//var thisUrl2 = 'http://192.168.2.111:8015';
//var thisUrl2 = 'http://192.168.2.127:8090';

var thisUrl = 'http://106.14.64.236:8012';
var thisUrl2 = 'http://106.14.64.236:8012';
//服务器地址
var serverUrl = '';

//dot模版函数
function fnupdateDoT(data_, boxId, temId) {
	// 1. 编译模板函数
	var tempFn = doT.template(temId.innerHTML);
	// 2. 多次使用模板函数
	var resultText = tempFn(data_);
	boxId.innerHTML = resultText;
}