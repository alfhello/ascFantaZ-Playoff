// Initialize app
var myApp = new Framework7({
	template7Pages: true,
	smartSelectOpenIn: 'page',
	smartSelectSearchbar: true,
	smartSelectBackOnSelect: true,
});

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;
var JSLink = 'http://privacy.ascdevelop.com:8500/CFIDE/ASCWS/CFC/';
//var defHomeData = {APP:'DictA', VALUE:0, CHKPASS:0, APPVER:'', FReady:0};
var defPageProp = {url:'', ignoreCache:true, animatePages:false, reload:false, context:{}};
var AppINI = {'AppName':'DictA', 'AppVer':0};
var logOb;
var INIOb;
//var chkCount = 0;

var P010 = {};
P010.url = 'newhome.html';
P010.defData = {APP:AppINI.AppName, VALUE:0, CHKPASS:0, APPVER:AppINI.AppVer};

// Add view  
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true,
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
	displayConsole('my-App','deviceReady.PASS');
// get device parameter
	upGPS();
	if (device.platform != "browser") {
		beforeStartApp(function(INIStatus) {
// check if INI file is new created or it AppName can't matched. It return false
			if (!INIStatus)	{
				alert(INIStatus);			
				return false;
			} else { 
//			alert(INIStatus);
				setTimeout( function() {
					doAppStartUp();
				}, 1200)	
			}
		});
	} else {
		console.log('browser - skip INI checking');	
		setLStorage('AppINI',JSON.stringify(AppINI));
		setTimeout(function() {
			doAppStartUp();
		}, 1200)
	}
});

function upGPS() {
	displayConsole('call upGPS');
	navigator.geolocation.getCurrentPosition(onPOSSuccess, onPOSError); 
}

function beforeStartApp(oStatus) {
	CreateINIFile(function(readINI) {
		if (readINI.isFile) {
//			alert('it is True' + readINI.fullPath);	
				readINIFileLen(function(fLen) {
					if (fLen == 0) {
//	INI file can't be found. create new and write default value to INI.
						writeINI(AppINI);
						oStatus(false);
					} else {
						JSPath = cordova.file.dataDirectory;
						$$.getJSON(JSPath + readINI.fullPath, function(readRes) {
							if (readRes.AppName == AppINI.AppName) {
// update system variable AppINI
								AppINI = readRes;
// AppINI save to Local Storage as name AppINI	
								setLStorage('AppINI',JSON.stringify(AppINI));
								setLStorage('userId',AppINI.userName);								
								oStatus(true);
							} else {
//	INI file may be crash. write empty and default value to INI.								
								writeINI(AppINI);
								oStatus(false);
							}
						});
					}
				});
		}
	});
}

function doAppStartUp() {
	displayConsole('index','doAppStart');

	StartPageProp = defPageProp;
	StartPageProp.url = P010.url;
	goPagewData(StartPageProp);

	setTimeout(function() {
		var JSFile = 'ascDict_JS_proxy.cfm'
		var JSMethod = '?method=doStartApp'
		var JSParam = '&inName=' + getLStorage('userId') + '&inApp=' + P010.defData.APP + getLStorage('inParam');
		console.log(JSLink + JSFile + JSMethod + JSParam);
		$$.getJSON(JSLink + JSFile + JSMethod + JSParam, function (json) {	
			if (json.VALUE == "1") {
				setLStorage('lastKey', json.LASTKEY);
				var upPageData = defPageProp;
				upPageData.url = P010.url;
				upPageData.reload = true;
				upPageData.context = json;
				goPagewData(upPageData)
			}
		});
	}, 2000);
}

myApp.onPageInit('index', function(page) {
	displayConsole('index','pageInit');
});

myApp.onPageInit('newHome', function(page) {
	displayConsole('newHome','pageInit');
	doShowHeaderFooter(false);
	
	$$("#freadyVar").html('Fready' + JSON.stringify(AppINI));
	
	$$("#listFS").on('click', function() {
		showDir(cordova.file.dataDirectory);
	})
	$$("#delLog").on('click', function() {
		delAppFile(cordova.file.dataDirectory, 'log.txt');
	})	
	$$("#delINI").on('click', function() {
		delAppFile(cordova.file.dataDirectory, 'APP.js');
	})	
	$$("#appendINI").on('click', function() {
//		AppINI.newLn = 'newLn added';
		writeINI(AppINI);
	})	
	$$("#viewINI").on('click', function() {
		showINIFile();
	})		
	$$("#viewLog").on('click', function() {
		showLogFile();
	})		
	$$("#viewVar").on('click', function() {
		showAppINIVar();
	})	
	$$("#viewINIStr").on('click', function() {
		showINIStr();
	})					
});

// Footer Toolbar 
$$(".link").on('click', function(event) {
	displayConsole('index', 'toolbar', event, this);

	$$(".link").removeClass("active");
	$$("#" + this.id).addClass("active");

	switch (this.id) {
		case 'toolbarPrepA':
			var JSFile = 'ascDict_JS_proxy.cfm'
			var JSMethod = '?method=doChkBookSpace'
			var JSParam = '&inName=' + getLStorage('userId') + getLStorage('inParam');
			
			$$.getJSON(JSLink + JSFile + JSMethod + JSParam, function (json) {
				setLStorage('lastKey', json.LASTKEY);
				mainView.router.loadPage({url:'pagePrepA.html', ignoreCache:true, reload:true, context: json });
			});
			break;
		case 'toolbarLessA':
			var json = {};
//			$$.getJSON(JSLink + JSFile + JSMethod + JSParam, function (json) {
//				setLStorage('lastKey', json.LASTKEY);
				mainView.router.loadPage({url:'pageLessA.html', ignoreCache:true, reload:true, context: json });
//			});
			break;
	}
});

function displayConsole(iPage, iFx, iAct, iObj) {
	if (arguments[3]) {
		if (typeof(iObj.id) === 'undefined') {
			dObj = iObj.class;
		} else {
			dObj = iObj.id
		}
		console.log('Page:' + iPage + ' ; Fx:' + iFx + ' ; Act:' + iAct.type + ' ; Id: ' + dObj);	
	} else {
		if (arguments[2]) {
			console.log('Page:' + iPage + ' ; Fx:' + iFx + ' ; Act:' + iAct.type);	
		} else {
			console.log('Page:' + iPage + ' ; Fx:' + iFx);		
		}
	}
}

function displayReturn(iName, iRet) {
	console.log('display JSON [' + iName + '] return in below line');	
	console.log(iRet);
	console.log('End display JSON Return');
};

function displayVar() {
	console.log('displayVar in Next line');
	var oName = arguments[0];
	var oVal = arguments;
	
	$$.each(oName.split(','), function(iName, iValue) {
		console.log(' --> ' + iValue + ':' + oVal[iName+1]);
	});
	console.log('End display Var');
}

function doShowHeaderFooter(iVal) {
	if (iVal) {
		mainView.showNavbar();
		mainView.showToolbar();			
	} else {
		mainView.hideNavbar();
		mainView.hideToolbar();			
	}
}

function HomewData() {
	displayConsole('myApp.js','HomewData');
	if (arguments[0]) {
		mainView.router.load({url:P010.url, ignoreCache:true, reload:false, context:arguments[0]})
	} else {
		console.log('missing parameters: HomewData');
	}
}

function doForceLogout(iUser) {
	var JSFile = 'ascDict_JS_proxy.cfm';
	var JSMethod = '?method=doForceLogout';
	var JSParam = '&inName=' + getLStorage('userId') + getLStorage('inParam');	
	
	$$.getJSON(JSLink + JSFile + JSMethod + JSParam, function(lOut) {
		if (lOut.DONE) {
			console.log('logout clicked. Localstorage cleared');
		}
		delLStorage('lastKey');		
		HomewData(P010.defData);
		setTimeout( function() {
			readInAppJS('ascDictA.js');
		}, 2000)
	});	
}

function setLStorage(iKey, iValue) {
	localStorage.setItem(iKey, iValue);	
}

function getLStorage(iKey) {
	return	localStorage.getItem(iKey);
}

function delLStorage(iKey) {
	localStorage.removeItem(iKey);
}

function listLStorage() {
	for (i = 0; i < localStorage.length; i++)   {
		console.log(localStorage.key(i) + "=[" + localStorage.getItem(localStorage.key(i)) + "]");
	}	
}

function setInParam() {
//	setLStorage('inParam','&inParam='+device.platform+"|"+device.version+"|"+device.uuid+"|"+device.manufacturer+"|"+device.isVirtual+"|"+getLStorage('inLati')+","+getLStorage('inLongi')+","+getLStorage('inAlti'));
	setLStorage('inParam','&inParam='+device.platform+"|"+device.version+"|"+device.uuid+"|"+device.manufacturer+"|"+device.isVirtual+"|"+getLStorage('inLati')+","+getLStorage('inLongi')+","+getLStorage('inAlti'));
	delLStorage('inLati');
	delLStorage('inLongi');
	delLStorage('inAlti');
	displayConsole('call setInParam');
}

function chkLoginStatus() {
	if (!localStorage.userId) {
		setLStorage('userId','NoData');
		return false;
	} else {
		return true
	}
};

function readInAppJS(iLocalVar) {
	displayConsole('','readInAppJS');
	
	var JSFile = 'ascDict_JS_proxy.cfm'
	var JSMethod = '?method=doChkValidLogin'
	var JSParam = '&inName=' + getLStorage('userId') + '&inKey=' + getLStorage('lastKey') + '&inApp=DictA' + getLStorage('inParam');

	$$.ajax({
		url: JSLink + JSFile + JSMethod + JSParam,
		dataType: 'json',
		success: function(chkPassValue) {
			displayReturn('chkPassValue',chkPassValue);
			if (chkPassValue.VALUE == 1) {
				mainView.router.loadPage({url:P010.url, ignoreCache:true, reload:true, context: chkPassValue})
			}
		},
		error: function(e, ts, et) { 
			console.log('Error found: ' + e + ':' + ts + ':' + et);
		}
	 });
}

function onPOSSuccess(position) {
	setLStorage('inLati', position.coords.latitude);
	setLStorage('inLongi', position.coords.longitude);
	setLStorage('inAlti', position.coords.altitude);	
	setInParam();
}

function onPOSError(error) {
	setLStorage('inLati','null-Lati');
	setLStorage('inLongi','null-Longi');
	setLStorage('inAlti','null-Alti');
	setInParam();
}

function readINIFileLen(fileLen) {
	INIOb.file(function(INIFile) {	
	var reader = new FileReader();
    reader.onloadend = function(e) {
		fileLen(this.result.length)
    };
    reader.readAsText(INIFile);	
	})
}

function CreateLOGFile(successCallback, failCallback) {
	window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {	
		dir.getFile("log.txt", {create:true}, function(logFile) {
			logOb = logFile;
//			alert(logFile.isFile +':'+chkCount);
			writeLog("App started");  
			successCallback(logFile);        
		});
	});
}

function CreateINIFile(successCallback) {
	window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {	
		dir.getFile("APP.js", {create:true}, function(iniFile) {
			INIOb = iniFile;		
			successCallback(iniFile);
		});
	});
}

function writeLog(str) {
	if(!logOb) return;
	var log = str + " [" + (new Date()) + "]\n";
	logOb.createWriter(function(fileWriter) {
		fileWriter.seek(fileWriter.length);
		var blob = new Blob([log], {type:'text/plain'});
		fileWriter.write(blob);
	}, Filefail);
}

function writeINI(str) {
//	alert('doing Write INI');
	if(!INIOb) return;
	var iniStr = JSON.stringify(str);
	INIOb.createWriter(function(fileWriter) {
		fileWriter.seek(0);
		var blob = new Blob([iniStr], {type:'text/plain'});
		fileWriter.write(blob);
	}, Filefail);
}

function Filefail(e) {
	console.log("FileSystem Error");
	console.dir(e);
	alert('FS error' + e);
}

function showLogFile() {
	if (device.platform != "browser") {
		logOb.file(function(logfile) {
			var reader = new FileReader();
			reader.onloadend = function(e) {
				alert(this.result);
//				updGVar(this.result);
			};
			reader.readAsText(logfile);
		}, Filefail);
	}
}

function showINIFile() {
//	alert(device.platform);
// browser not work. So bypass it
	if (device.platform != "browser") {
		INIOb.file(function(INIFile) {
			var reader = new FileReader();
			reader.onloadend = function(e) {
				alert(this.result);
//				INIOb = this.result;
			};
			reader.readAsText(INIFile);
		}, Filefail);
	}
}

function showINIStr() {
	alert(INIStr);
}

function showDir(path){
//		alert(path);
	$$("#listFiles").empty();
	window.resolveLocalFileSystemURL(path, function(fileSystem) {
		var listPath;
		var listFile = fileSystem.createReader();
		listFile.readEntries(function(entries) {
			for(i=0;i<=entries.length;i++) {
				if (entries[i].name.slice(-3) == 'wav') {
//					alert(path + ":+:" + entries[i].name +"-\n");
					$$("#listFiles").append("<p class='selfFile'>" + path + ":+:" + entries[i].name + "</p>");
				} else {				
//					alert(path + ":+:" + entries[i].name +"-\n");
					$$("#listFiles").append("<p>" + path + ":+:" + entries[i].name + "</p>");						
				}
			}
		});
	});
}

function showAppINIVar() {
	alert(JSON.stringify(AppINI));
}

function delAppFile(path, filename) {
	window.resolveLocalFileSystemURL(path, function(dir) {
		dir.getFile(filename, {create:false}, function(fileEntry) {
				  fileEntry.remove(function(){
					  // The file has been removed succesfully
					  alert('File removed');
				  },function(error){
					  // Error deleting the file
					  alert('delAppFile error');
				  },function(){
					 // The file doesn't exist
					 alert('Target file not existed');
				  });
		});
	});	
}

function updGVar(str) {
	var lines = str.split("\n");
// -2: Substrate First Index 0 and Last Empty Row
	AppINI.lastAccessDT = lines[parseInt(lines.length)-2];
	alert("Last Login DT:" + AppINI.lastAccessDT);
}

function goPagewData(pageObj) {
	mainView.router.loadPage(pageObj);
}

function formBoolean(iVar) {
	if (iVar.indexOf("on") >= 0) {
		ret = 1;	
	} else {
		ret = 0;			
	}
	return ret;
}

function json2URLparam(iCase, iData) {
	var ret = "";
	switch (iCase) {
		case 'regForm':
			if ((iData.gender).length <= 0) {
				alert('gender can\'t empty');
				return false;	
			} 
			if ((iData.DOB).length <= 0) {
				alert('DOB can\'t empty');
				return false;	
			} 
			if ((iData.liveat).length <= 0) {
				alert('LiveAt can\'t is empty');
				return false;	
			} 
			
			ret = iData.gender + "|" + iData.DOB + "|" + iData.liveat + "|" + iData.yrschool + "|" + iData.yrschoolgrade + "|" + formBoolean(iData.rTerms) + "|" + formBoolean(iData.rRemoveAd);
			break;
	}
	return ret;
};
