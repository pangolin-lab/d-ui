/**
 * ____            _                ____            _                  _   _          _     
 *|  _ \ _ __ ___ | |_ ___  _ __   |  _ \ _ __ ___ | |_ ___   ___ ___ | | | |    __ _| |__  
 *| |_) | '__/ _ \| __/ _ \| '_ \  | |_) | '__/ _ \| __/ _ \ / __/ _ \| | | |   / _` | '_ \ 
 *|  __/| | | (_) | || (_) | | | | |  __/| | | (_) | || (_) | (_| (_) | | | |__| (_| | |_) |
 *|_|   |_|  \___/ \__\___/|_| |_| |_|   |_|  \___/ \__\___/ \___\___/|_| |_____\__,_|_.__/ 
 * 
 * Copyright (c) 2019 PPL,proton-team
 * E-mail : developer-team@proton.one
 * https://github.com/sofanetwork/d-ui
 *
 */
var DLCnst = {
	name:"proton",
	baseUrl:"http://proton.ppn.one",
	separator:"/",
	isWxBrowser:false,
	isQQInstall:false,
	isQQBrowser:false,
	clsVaribles : {
		aBtn:'dl-btn',
		imgCls:'qrcode-img',
		dlTip:'dl-tips'
	},
	cliAtt:{
		android:"-release.apk",
		ios:'',
		macos:'-release.app.zip',
		windows:'-release.exe'
	},
	remark:{
		visible:false,
		cls:'remark-container',
		pContent:''
	}
}; 


function _getAttFileUrl(type){

	if(type == 'ios' || !DLCnst.cliAtt[type])return false;
	let d = new Date();
	let url = DLCnst.baseUrl + DLCnst.separator 
	  + DLCnst.name + DLCnst.cliAtt[type] +'?id='+d.getMilliseconds();
	return url;
}

function _setImgSrc(type){
	let suffix = false;
	switch(type){
		case 'android':
			suffix = DLCnst.name+'-android.png';
			break;
		case 'ios':
			suffix = 'ios.png';
			break;
		case 'macos':
			suffix = 'macos.png';
			break;
		case 'windows':
			suffix = 'window.png';
			break;
	}
	return suffix ? 'img/'+suffix:suffix;
}

function initBrowserType(){
	var ua = navigator.userAgent.toLowerCase();
	if(ua.indexOf(' qq')>-1 && ua.indexOf('mqqbrowser') <0 ){
		//inner QQ
		DLCnst.isQQInstall = true;
		return;
	}

	if(ua.indexOf('mqqbrowser') >-1 && ua.indexOf(' qq')<0){
		DLCnst.isQQBrowser = true;
		return;
	}

	if(ua.match(/MicroMessenger/i) == 'micromessenger'){
		DLCnst.isWxBrowser = true;
		return;
	}
}

function Initialize(){
	initBrowserType();

	var $mainEL = $('div.'+'android');
	let imgSrc = _setImgSrc('android');
	if(imgSrc)$mainEL.find('img.'+DLCnst.clsVaribles.imgCls).attr('src',imgSrc);
	

	if(DLCnst.isWxBrowser || DLCnst.isQQInstall || DLCnst.isQQBrowser){
		$('div.'+DLCnst.clsVaribles.dlTip).removeClass('d-none');
		$mainEL.find('p.'+DLCnst.clsVaribles.dlTip).removeClass('d-none');
		$mainEL.find('a.'+DLCnst.clsVaribles.aBtn).addClass('d-none');

	}else{
		$('div.'+DLCnst.clsVaribles.dlTip).addClass('d-none');
		$mainEL.find('p.'+DLCnst.clsVaribles.dlTip).addClass('d-none');
		$mainEL.find('a.'+DLCnst.clsVaribles.aBtn).removeClass('d-none');
		let href = _getAttFileUrl('android');
		//console.log(href);
		if(href)$mainEL.find('a.'+DLCnst.clsVaribles.aBtn).attr('href',href);
	}



	if(DLCnst.remark.visible){
		$('div.'+DLCnst.remark.cls).removeClass('d-none');
	}else{
		$('div.'+DLCnst.remark.cls).addClass('d-none');
	}
	
}