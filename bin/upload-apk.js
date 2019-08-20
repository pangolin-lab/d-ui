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

/**
 *
 * publicMode : zip ,folder
 * 
 */
const Settings = {
	name:'proton',
	remoteCfg:'.configs/.remote-server.json',
	atta:'atta',
	sourceFile:'proton-release.apk',
	remotePath:'/data/www/proton'
};
let IEnv = {};

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

upload(1);



/* ======================================= */
function upload(type){
	let SCP_CMD = '';
	let _srcFile = Settings.atta+'/'+Settings.sourceFile;
	if(IEnv.sshkey){
		SCP_CMD = getScpCMDByPrivateKey(_srcFile,Settings.remotePath);
	}else{
		SCP_CMD = getScpCMDByPw(_srcFile,Settings.remotePath);
	}
	console.log(SCP_CMD);
	console.log('Begin uploading...');
	var scpProcess = shell.exec(SCP_CMD,{async:true});

	scpProcess.stdout.on('data',(_o)=>{
		shell.echo(_o);
		console.log(">>>>uploaded.")
	});

	console.log("uploaded.")
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