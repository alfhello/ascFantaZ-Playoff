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
var defHomeData = {VALUE:0, CHKPASS:0, APPVER:''};

// Add view  
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true,
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
	displayConsole('my-App','deviceReady.PASS');
	setTimeout( function() {
		HomewData(defHomeData);
		setTimeout( function() {
			readInAppJS();
		}, 2000)
	}, 3000)
});

myApp.onPageInit('index', function(page) {
	displayConsole('index','pageInit');
});

myApp.onPageInit('login-screen', function (page) {
	
	displayConsole('login-sreen','pageInit');
	var pageContainer = $$(page.container);

	pageContainer.find('input[name="loginInfo"]').hide();
	pageContainer.find('input[name="username"]').val(getLStorage('userId'));

	$$("input[name='username']").on('keydown', function() {
		pageContainer.find('input[name="loginInfo"]').hide();
		pageContainer.find('input[name="username"]').css("color","black");;
	});

	$$("input[name='password']").on('keydown', function() {
		pageContainer.find('input[name="loginInfo"]').hide();
		pageContainer.find('input[name="username"]').css("color","black");;
	});

	$$("#logsrcSignIn").on('click', function() {		
		displayConsole('login-screen','Sign-In', event, this);
		var username = pageContainer.find('input[name="username"]').val();
		var password = pageContainer.find('input[name="password"]').val();

		var JSFile = 'ascDict_JS_proxy.cfm';
		var JSMethod = '?method=doUserLogin';
		var JSParam = '&inName=' + username + '&inPass=' + password + '&inApp=DictA' + getLStorage('inParam');

		$$.getJSON(JSLink + JSFile + JSMethod + JSParam, function (chkPass) {
			if (chkPass.CHKPASS == "1") {	
				
				displayConsole('login-screen','Sign-In.PASS', event);	
				setLStorage('userId',chkPass.LASTUSER);
				setLStorage('lastKey',chkPass.LASTKEY);
				
				JSFile = 'ascDict_JS_proxy.cfm';
				JSMethod = '?method=doChkBookSpace';
				JSParam = '&inName=' + username + getLStorage('inParam');
alert(JSParam);
				$$.getJSON(JSLink + JSFile + JSMethod + JSParam, function (json) {
					if (json.BOOKSPACE.length >= 1) {
						
						displayConsole('login-screen','read BookSpace Done', event);
						setLStorage('lastKey',json.LASTKEY);
						
						mainView.router.loadPage({url:'pagePrepA.html', ignoreCache:true, reload:true, context: json });
					} else {
						pageContainer.find('input[name="loginInfo"]').val("Your account did not activate.");
						pageContainer.find('input[name="loginInfo"]').show();
					}
				});
			} else {
//				myApp.alert('Login Fail');
				pageContainer.find('input[name="username"]').css("color","red");
				pageContainer.find('input[name="password"]').val("");
				pageContainer.find('input[name="loginInfo"]').val("Login Fail. Please try again");				
				pageContainer.find('input[name="loginInfo"]').show();
				displayConsole('login-screen','Sign-In.FAIL', event);			 
			}
		});
	});
	
	$$("#logsrcNewReg").on('click', function() {
		// Value temp hard coded by https://jsoneditoronline.org/
		var aboutSchool =  {"schools":[{"district":"east","schoollist":[{"name":"聖保羅書院小學"},{"name":"嘉諾撒聖心學校私立部"},{"name":"聖類斯中學 (小學部)"},{"name":"救恩學校"},{"name":"聖嘉勒小學"},{"name":"港島基督教學校"},{"name":"香島華德福學校"},{"name":"李陞小學"}]},{ "district":"west","schoollist":[{"name":"般咸道官立小學"},{"name":"聖公會聖馬太小學"},{"name":"天主教總堂區學校"},{"name":"英皇書院同學會小學第二校"},{"name":"新會商會學校"},{"name":"中西區聖安多尼學校"},{"name":"嘉諾撒聖心學校"},{"name":"聖士提反女子中學附屬小學"},{"name":"香港潮商學校"},{"name":"英皇書院同學會小學"},{"name":"聖公會基恩小學"},{"name":"聖嘉祿學校"},{"name":"聖公會呂明才紀念小學"},{"name":"聖安多尼學校"},{"name":"聖公會聖彼得小學"}]}],"grade":[{"level":"primary","gradeLv":[{"name":"P01"},{"name":"P02"},{"name":"P03"},{"name":"P04"},{"name":"P05"},{"name":"P06"}]},{"level":"secondary","gradeLv":[{"name":"S01"},{"name":"S02"},{"name":"S03"},{"name":"S04"},{"name":"S05"},{"name":"S06"}]}],"AppList":[{"AppDspName":"DictA ~ 默書寶", "AppVal":"DictA","AppEnable":"1","AppPath":""},{"AppDspName":"Roto FantaZ", "AppVal":"FantaZ","AppEnable":"0","AppPath":""}]};
		
		displayConsole('login-screen','NewReg', event, this);
		mainView.router.loadPage({url:'pageNewReg.html', ignoreCache:true, reload:true, context: aboutSchool })
	});
	
	$$("#logsrcHome").on('click', function(event) {
		displayConsole('login-screen','backHome', event, this);
		HomewData(defHomeData);
		setTimeout( function() {
			readInAppJS('ascDictA.js');
		}, 2000)
	});
	
});  

myApp.onPageInit('pagePrepA', function(page) {
	console.log('page PrepA loaded');
	doShowHeaderFooter(true);
});

myApp.onPageInit('newHome', function(page) {
	displayConsole('newHome','pageInit');
	setTimeout( function() {
		delLStorage('regForm');
		upGPS();
	}, 500)
	doShowHeaderFooter(false);
});

myApp.onPageInit('newReg', function(page) {
	displayConsole('newReg', 'pageInit');
//	$$("input[name='inLati']").val(getLStorage('inLati'));
//	$$("input[name='inLongi']").val(getLStorage('inLongi'));	
	
	$$("input[name='username_wrn']").hide();
	$$("input[name='orpassword_wrn']").hide();
	
	var calendar_DOB = myApp.calendar({
		input: '#calendar-DOB',
	});  
	var picker_Living = myApp.picker({
		input: '#picker-Living',
		cols: [
			{
				textAlign: 'center',
				values: ['-港島-','中西區','東區','灣仔區','南區','離島區','-九龍-','九龍城區','黃大仙區','觀塘區','油尖旺區','深水埗區','-新界-','葵青區','荃灣區','沙田區','大埔區','西貢區','屯門區','元朗區','北區']
			}
		]
	});	

	$$("input[name='username']").on('focusout', function() {
//		alert('onFocusOut');
		if (this.value.length > 3) {
	
			var JSFile = 'ascDict_JS_proxy.cfm';
			var JSMethod = '?method=doUserChkExist';
			var JSParam = '&inName=' + this.value + getLStorage('inParam');
//			alert(JSParam);
			$$.getJSON(JSLink + JSFile + JSMethod + JSParam, function (chkRes) {
				if (chkRes.CHKPASS == "1") {
//					alert('CHKPASS');
					console.log(chkRes.STATUS + ' No same userID existed');
					$$("input[name='username']").css('color','black');
					$$("input[name='username_wrn']").hide();					
					$$(".sendRegForm").removeAttr('disabled');		
				} else {
//					alert('CHKPASS FAIL');
//					alert('userID occupied. Please choose others');
					$$("input[name='username']").css('color','red');
					$$(".sendRegForm").attr('disabled',true);
					$$("input[name='username_wrn']").val(chkRes.STATUS);
					$$("input[name='username_wrn']").show();
				}
			})
		} else {
//			alert('userID must at least have 4 characters');
			$$("input[name='username']").css('color','red');
			$$("input[name='username_wrn']").val("Enter Your Email");
			$$("input[name='username_wrn']").show();
		}
	})
	
	$$("input[name='orpassword']").on('focusout', function() {
		if (this.value.length < 4) {
//			alert('password must at least have 4 characters');
			$$("input[name='orpassword_wrn']").css('color','red');
			$$("input[name='orpassword']").val("");			
			$$("input[name='orpassword_wrn']").val("Password required at least 4 characters");			
			$$("input[name='orpassword_wrn']").show();
		} else {
			$$("input[name='orpassword_wrn']").css('color','black');			
			$$("input[name='orpassword_wrn']").hide();
		}
	})


	$$('.sendRegForm').on('click', function(){
//		assignRegFormHiddenVal();
		var nrformData = myApp.formToJSON('#userNewRegForm');
		setLStorage('regForm',JSON.stringify(nrformData));
		var inPersonParam = json2URLparam('regForm', nrformData)
		if (inPersonParam) {
			displayConsole('pageNewReg', '.sendRegForm', event);
			
			var JSFile = 'ascDict_JS_proxy.cfm';
			var JSMethod = '?method=doUserRegister';
			var JSParam = '&inName=' + nrformData.username + '&inPass=' + nrformData.orpassword + '&inApp=' + nrformData.inAppName + '&inPersonParam=' + inPersonParam + getLStorage('inParam');
			alert(JSParam);
			$$.getJSON(encodeURI(JSLink + JSFile + JSMethod + JSParam), function (chkRes) {
				if (chkRes.CHKPASS == "1") {
					alert('new account register in DB successfully.');		
					setTimeout(
						doForceLogout(nrformData.username), 3000
					);
				} else {
					alert('Some Error. No account registered.');	
				}
			});
		} else {
			alert('Form not complete');	
		}
	});
	
	$$("#asclogout").on('click', function() {
		doForceLogout(getLStorage('userId'));
	});

});

myApp.onPageInit('pageSettA', function (page) {

	$$("#asclogout").on('click', function() {
		doForceLogout(getLStorage('userId'));
	});

})

$$(document).on('pageInit', function (e) {
    var page = e.detail.page;

    if (page.name === 'about') {
        myApp.alert('Here comes About page');
    }
})

$$(document).on('pageInit', '.page[data-page="about"]', function (e) {
    myApp.alert('Here comes About page');
})

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
		mainView.router.load({url:'newhome.html', ignoreCache:true, reload:true, context: arguments[0]})
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
		HomewData(defHomeData);
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
				mainView.router.loadPage({url:'newhome.html', ignoreCache:true, reload:true, context: chkPassValue})
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

function upGPS() {
	displayConsole('call upGPS');
	navigator.geolocation.getCurrentPosition(onPOSSuccess, onPOSError); 
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

/*
{"inAppName":"DictA","username":"asdcad","username_wrn":"","orpassword":"asdcad","orpassword_wrn":"","gender":"- Select Gender-","DOB":"","liveat":"","yrschool":"聖保羅書院小學","yrschoolgrade":"P01","rTerms":[],"rRemoveAd":["on"]}*/

/*
function assignRegFormHiddenVal() {
//	$$('input[name="inOS"]').val(device.platform);
//	$$('input[name="inOSver"]').val(device.version);
//	$$('input[name="inUUID"]').val(device.uuid);
//	$$('input[name="inMfger"]').val(device.manufacturer);
//	$$('input[name="inIsVM"]').val(device.isVirtual);

	$$('input[name="inOS"]').val(getLStorage('inOS'));
	$$('input[name="inOSver"]').val(getLStorage('inOSver'));
	$$('input[name="inUUID"]').val(getLStorage('inUUID'));
	$$('input[name="inMfger"]').val(getLStorage('inMfger'));
	$$('input[name="inIsVM"]').val(getLStorage('inIsVM'));
	$$('input[name="inLati"]').val(getLStorage('inLati'));
	$$('input[name="inLongi"]').val(getLStorage('inLongi'));	
	$$('input[name="inAlti"]').val(getLStorage('inAlti'));		
}

var ptrContent = $$('.pull-to-refresh-content');
ptrContent.on('ptr:refresh', function(e) {
	setTimeout(function() {
		console.log(e);
		myApp.alert(e);
		myApp.pullToRefreshDone();
	}, 2000);
});

var pri_district = {
	d01:['聖保羅書院小學','嘉諾撒聖心學校私立部','聖類斯中學(小學部)','救恩學校','聖嘉勒小學','港島基督教學校','香島華德福學校','李陞小學','般咸道官立小學','聖公會聖馬太小學','天主教總堂區學校','英皇書院同學會小學第二校','新會商會學校','中西區聖安多尼學校','嘉諾撒聖心學校','聖士提反女子中學附屬小學','香港潮商學校','英皇書院同學會小學','聖公會基恩小學','聖嘉祿學校','聖公會呂明才紀念小學','聖安多尼學校','聖公會聖彼得小學'],
	d02:['東區','21'],
	d03:['灣仔區'],
	d04:['南區'],
	d05:['離島區'],
	d06:['九龍城區'],
	d07:['黃大仙區'],
	d08:['觀塘區'],
	d09:['油尖旺區'],
	d10:['深水埗區'],
	d11:['葵青區'],
	d12:['荃灣區'],
	d13:['沙田區'],
	d14:['大埔區'],
	d15:['西貢區'],
	d16:['屯門區'],
	d17:['元朗區'],
	d18:['北區']
}
var sec_district = {
	d01:['中西區','中學'],
	d02:['東區','21'],
	d03:['灣仔區'],
	d04:['南區'],
	d05:['離島區'],
	d06:['九龍城區'],
	d07:['黃大仙區'],
	d08:['觀塘區'],
	d09:['油尖旺區'],
	d10:['深水埗區'],
	d11:['葵青區'],
	d12:['荃灣區'],
	d13:['沙田區'],
	d14:['大埔區'],
	d15:['西貢區'],
	d16:['屯門區'],
	d17:['元朗區'],
	d18:['北區']
}
var gradeLevel = {"sgrade":["pri","sec"], 
"slevelvalue":{"pri":["p01","p02","p03","p04","p05","p06"],"sec":["s01","s02","s03","s04","s05","s06"]},"sleveldisplay":{"pri":["小一","小二","小三","小四","小五","小六"],"sec":["中一","中二","中三","中四","中五","中六"]}}
*/