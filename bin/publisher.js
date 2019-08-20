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
'use strict';


var fs = require('fs');
var shell = require('shelljs');
var zip = require("bestzip");
var path = require('path');

var DateUtil = require('../src/utils/dateUtil.js');


/**
 *
 * publicMode : zip ,folder
 * 
 */
const Settings = {
	name:'proton',
	includeAtta:true,
	uploadEnabled:true,
	remoteCfg:'.configs/.remote-server.json',
	TMP:'tmp',
	DEST:'dest',
	PUBLIC:'public',
	BUILD:'build',
	ATTA:'atta',
	publicMode:'zip'
}
/**
 *
 */

let IEnv = {
	hasRemote:false
};


function remoteDest(){
	if(IEnv.remoteConfig&&IEnv.remoteConfig.distPath)
		return IEnv.remoteConfig.distPath;
	return false;
}

IEnv.BASE_DIR = shell.pwd();
IEnv.SSH_HOME = process.env['HOME']||process.env['USERPROFILE'];

if(!shell.which('ssh') || !shell.which('scp')){
	shell.echo('Sorry,this script requires SSH and SCP.');
	shell.exit(1);
}
if(Settings.uploadEnabled){
	let loadRS = readRemoteConfig(Settings.remoteCfg);
	if(loadRS !=null && loadRS.length >0){
		showLogs(loadRS,"!!! Remote Config Error");
		shell.exit(1);
	}
}

buildTmp();

//let pathDay = getDayPath();
//console.log(pathDay);

//showLogs(IEnv,"ienv");


// Build Tmp
function buildTmp(){
	shell.rm('-rf',Settings.TMP);

	shell.mkdir(Settings.TMP);
	shell.mkdir('-p',Settings.DEST);
	shell.cp('-Rf',Settings.PUBLIC+"/*",Settings.TMP);

	//shell.cp('-Rf',Settings.BUILD+'/*',Settings.TMP);

	if(Settings.includeAtta){
		shell.cp('-Rf',Settings.ATTA+'/*',Settings.TMP);
	}
	return published();
}

function published(){
	console.log('begin publishing...');
	let daySuffix = getDayPath();
	if(Settings.publicMode == 'zip'){
		let distZip = Settings.DEST+"/"
			+ Settings.name + '-' + daySuffix + '.zip';

		shell.rm('-f',distZip);

		zip({
			source:Settings.TMP+"/*",
			destination:distZip
		}).then(()=>{
			console.log('zip completed.');
			shell.rm('-rf',Settings.TMP);

			console.log('begin scp zip to remote...');
			ScpZip(distZip);
			
		}).catch(err=>{
			console.log(err.message);
			process.exit(1);
		});
	}else{
		let dist = Settings.DEST+"/"
			+ Settings.name + '-' + daySuffix;
		shell.rm('-rf',dist);
		shell.mv('-f',Settings.TMP,dist);
	}
}

function ScpZip(source){
	if(Settings.uploadEnabled){
		let cmd = null;
		let _dest = IEnv.remoteConfig.distPath;
		console.log(_dest);
		if(!_dest)return;
		if(IEnv.sshkey){
			cmd = getScpCMDByPrivateKey(source,_dest);
		}else{
			cmd = getScpCMDByPw(source,_dest);
		}
		showLogs(cmd,"SCP CMD");
		shell.exec(cmd,{async:true},(code,stdout,stderr)=>{
			if(code != 0){
				showLogs(cmd,"Upload successful");
			}else{
				showLogs(stderr,"!!!Error");
			}
		});	
	}
}

function showLogs(message,title){
	if(typeof message == 'undefined') return;
	if(typeof title === 'undefined'){
		title = '';
	}
	else{
		title = title + ' >>>\n\t';
	}
	let ostr = title + ((typeof message !== 'object') ? message : JSON.stringify(message));
	shell.echo(ostr);
}


function readRemoteConfig(file){
	let txt = fs.readFileSync(file);
	if(txt){
		let cfgJson = JSON.parse(txt);
		if(!cfgJson.host || !IPv4Valid(cfgJson.host))return "remote host invalid.";
		if(!cfgJson.privatekey && !cfgJson.pw){
			return "no private key or pw config.";
		}else if(cfgJson.privatekey){
			let sshkey = IEnv.SSH_HOME.replace(/\\/g,'/') + '/.ssh/'+cfgJson.privatekey;
			if(shell.find(sshkey).length == 0){
				return "private key file not find.";
			}
			IEnv.sshkey = sshkey;
		}else{
			if(cfgJson.pw.length ==0)return "remote pw invalid.";
		}

		IEnv.hasRemote = true;
		if(!cfgJson.port)cfgJson.port=22;
		if(!cfgJson.user)cfgJson.user = "root";
		if(!cfgJson.distPath)cfgJson.distPath="/root/dist/";
		IEnv.remoteConfig = cfgJson;

		return null;
	}
}

function IPv4Valid(ip){
	if(typeof ip != 'string')return false;
	let regExpIPv4 = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
	return regExpIPv4.test(ip);
}

/**
 * return scp cmd
 * 	scp -i ~/.ssh/id_rsa -P22 xxx.txt user@host:/root/dist/
 */
function getScpCMDByPrivateKey(source,dt){
	let cmd = "SCP -i "+ IEnv.sshkey +' -P'+IEnv.remoteConfig.port +' '
		+source + ' ' + IEnv.remoteConfig.user +'@'+IEnv.remoteConfig.host+':'
		+ dt;
	return cmd;
}

function getScpCMDByPw(source,dt){
	let cmd = 'SCP -p"'+ IEnv.remoteConfig.pw +'" -P'+IEnv.remoteConfig.port +' '
		+ source + ' ' + IEnv.remoteConfig.user +'@'+IEnv.remoteConfig.host+':'
		+ dt;
	return cmd;
}





//get 20130625
function getDayPath(){
	let d = new Date();
	return DateUtil.format(d,"yyyyMMddhh");
}