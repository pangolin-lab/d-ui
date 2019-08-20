# d-ui
> download WEB UI


## Command line use

  $ npm install

  $ npm start   `run demo in local`

OR 

  $ npm install -D shelljs
  $ npm install -D bestzip
  $ npm install -D lite-server 


## Publish Remote Host

> Need dependencies Module

  - bestzip
  - shelljs

### remote config json
> Configuration file At ${basedir}/.configs/.remote-server.json 

  {
	"host":"xxx.xxx.xxx.xxx",
	"port":22,
	"user":"root",
	"distPath":"/root/dist",
	"publishPath":"/data/www/proton/",
	"attaPath":"/data/www/proton/",
	"privatekey":"id_rsa",
	"pw":"123456"
  }


* privatekey or pw at lest set one *  

> command line

  $ node bin/publisher.js    		//upload project to remote.
  $ node bin/upload-apk.js 			//upload file to remote.

  
 