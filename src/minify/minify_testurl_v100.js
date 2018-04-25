var FileOfSetup=function(FolderId){var SETTING_NAME='gSetting';this.FOLDER_ID=FolderId;this.sFolder=new ApiFolder(FolderId);this.file;this.sheets={};this.params={};this.createFolder=function(){return this.sFolder.createFolder();}
this.getFolder=function(){return this.sFolder.getFolder();}
this.getSettingParam=function(param,type,subtype){if(this.params.length==0){if(!this.getSettingParams()){return false;}}
if(this.params[param]){if((typeof this.params[param]==='string'||this.params[param]instanceof String)&&!/^\d+$/.test(this.params[param])){if(this.params[param].toUpperCase()=='ANO'){return true;}else if(this.params[param].toUpperCase()=='NE'){return false;}}
if(type=='array'){var intArr=[];if(typeof this.params[param]==='string'||this.params[param]instanceof String){var stringArr=this.params[param].split('|');for(var i=0;i<stringArr.length;i++){if(subtype=='int'){var toint=parseInt(stringArr[i]);if(!isNaN(toint)){intArr.push(toint);}}else{intArr.push(parseInt(stringArr[i]));}}}else if(Array.isArray(this.params[param])){return this.params[param];}else if(!isNaN(this.params[param])){return[this.params[param]];}
return intArr;}
return this.params[param];}else{return false;}}
this.getSettingParams=function(){var setting=this.getSettingSheet();if(!setting){return false;}
var paramsArray=setting.getDataRange().getValues();this.params=this.transformSettingArrayToObject(paramsArray);return this.params;}
this.getSettingSheet=function(){if(!this.sheets.setting){if(!this.loadFile()){return false;}
var gSetting=SpreadsheetApp.open(this.file);this.sheets['setting']=gSetting.getSheetByName('setting');}
return this.sheets.setting;}
this.load=function(){this.loadFolder();if(this.loadFile()){if(this.getSettingParams()!=false){return true;}}
return false;}
this.loadFile=function(){this.sFolder.loadFile(SETTING_NAME);this.file=this.sFolder.getFile(SETTING_NAME);if(this.file){return true;}else{return false;}}
this.loadFolder=function(){return this.sFolder.loadFolder();}
this.setup=function(params){var param;var block;for(var blockName in params){block=params[blockName];this.setOptionBlock(this.getSettingSheet(),block.desc);for(var paramName in block){param=block[paramName];if(param.name!=undefined&&param.value!=undefined&&param.type!=undefined){this.setOption(this.getSettingSheet(),param.name,param.value,param.type,param.desc);}}}
return this.file;}
this.setOption=function(sheet,name,value,type,description,row){if(!sheet){sheet=this.getSettingSheet();if(!sheet){return false;}}
if(!row){row=Math.max(sheet.getLastRow()+1,2);}
sheet.getRange(row,1).setValue(description);sheet.getRange(row,2).setValue(name);sheet.getRange(row,3).setValue(value);switch(type){case'int':break;case'boolean':break;default:break;}}
this.setOptionBlock=function(sheet,desc,row){if(!sheet){sheet=this.getSettingSheet();if(!sheet){return false;}}
if(!row){row=Math.max(sheet.getLastRow()+1,2);}
sheet.getRange(row,1).setValue(desc);}
this.transformSettingArrayToObject=function(paramsArray){var object={};var param;for(var i=1;i<paramsArray.length;i++){param=paramsArray[i];if(param[1]!=''){object[param[1]]=param[2];}}
return object;}}
var ProblemLogger=function(rFolder,rSetup,rEmail){this.folder=rFolder;this.setupFile=rSetup;this.reportEmail=rEmail;this.log;this.emailErrorCache=[];this.actualParagraph;this.noErr=true;this.addError=function(text,type,interruption){this.noErr=false;this.emailErrorCache.push(text);this.addRecord(text);if(interruption){this.reportEmail.sendError(this.emailErrorCache);}}
this.addEvent=function(text,type){this.addRecord(text);}
this.addWarning=function(text,type){this.noErr=false;this.emailErrorCache.push(text);this.addRecord(text);}
this.addRecord=function(text){}
this.newTest=function(type){}
this.setup=function(){}}
var ApiFolder=function(FolderId){var DEFAULT_FOLDER_NAME='SklikAPI';this.FOLDER_ID=FolderId;this.apiFolder;this.loadedFiles={};this.createFile=function(name,type){if(!this.getFolder()){if(!this.createFolder()){return false;}}
var ins,insId;switch(type){case'doc':insId=DocumentApp.create(name).getId();break;case'sheet':insId=SpreadsheetApp.create(name).getId();break;default:break;}
ins=DriveApp.getFileById(insId);this.loadedFiles[name]=ins.makeCopy(name,this.apiFolder);DriveApp.removeFile(ins);return this.loadedFiles[name];}
this.createFolder=function(){if(this.getFolder()){return this.apiFolder;}
return this.apiFolder=DriveApp.getRootFolder().createFolder(DEFAULT_FOLDER_NAME);}
this.getFile=function(name){if(!this.loadedFiles[name]){if(!this.loadFile(name)){return false;}}
return this.loadedFiles[name];}
this.getFolder=function(){if(!this.apiFolder){if(!this.loadFolder()){return false;}}
return this.apiFolder;}
this.loadFile=function(name){if(this.apiFolder){if(!this.loadedFiles[name]){var f=this.apiFolder.getFilesByName(name);if(f.hasNext()){this.loadedFiles[name]=f.next();return true;}}}
return false;}
this.loadFolder=function(){if(this.FOLDER_ID!=''&&this.FOLDER_ID!=undefined){var fd=DriveApp.getFolderById(this.FOLDER_ID);if(fd){this.apiFolder=fd;return this.apiFolder;}}else{var fd=DriveApp.getRootFolder().getFoldersByName(DEFAULT_FOLDER_NAME);if(fd.hasNext()){this.apiFolder=fd.next();return this.apiFolder}}
return false;}
this.makeCopy=function(file,nameOfNewFile,unique){if(unique){this.removeFile(nameOfNewFile);}
return file.makeCopy(nameOfNewFile,this.getFolder());}
this.removeFile=function(name){var file=this.getFile(name);if(file){this.getFolder().removeFile(file);}}}
var ReportEmail=function(rSetup){this.setupFile=rSetup;this.recipient;this.setup=function(){this.recipient=this.setupFile.getSettingParam('reportEmail');}
this.sendError=function(errors,email){var recipient=this.recipient;if(email){recipient=email;}
if(!recipient){return false;}
MailApp.sendEmail(recipient,'SklikAPI script: Chybove hlaseni',this.errorTemplate(errors));}
this.sendMessage=function(subject,message,email,tpl){var recipient=this.recipient;if(email){recipient=email;}
if(!recipient){return false;}
if(tpl){MailApp.sendEmail(recipient,subject,message,{htmlBody:tpl.evaluate().getContent()});}else{MailApp.sendEmail(recipient,subject,message);}}
this.errorTemplate=function(errors){var t=HtmlService.createTemplateFromFile('reportEmail');t.errors=errors;return t.evaluate().getContent();}}
var APIConnection=function(rSetup,rLogger){this.setupFile=rSetup;this.logger=rLogger;this.session='';this.sklikApiLogin=function(){this.sklikApi(this.setupFile.getSettingParam('token'),'client.loginByToken',this,'setSessionByLogin');}
this.setSessionByLogin=function(response){this.session=response.session;}
this.getSession=function(){return this.session;}
this.sklikApi=function(parameters,method,cbClass,cbMethod,param,retry){if(method.indexOf('client.')==-1){this.logger.addEvent(method+'[SklikApiCore.APIConnection.sklikApi]');this.logger.addEvent(method+JSON.stringify(parameters)+'[SklikApiCore.APIConnection.sklikApi]');}
Utilities.sleep(200);try{var stat=UrlFetchApp.fetch('https://api.sklik.cz/jsonApi/drak/'+method,{'method':'post','contentType':'application/json','muteHttpExceptions':true,'payload':JSON.stringify(parameters)});}catch(e){if(!retry){Utilities.sleep(2000);return this.sklikApi(parameters,method,cbClass,cbMethod,param,true);}}
var response=JSON.parse(stat);var text=JSON.stringify(response);if(text.length>400){text=text.substring(0,400)+"SHORTED ";}
this.logger.addEvent(method+text+'[SklikApiCore.APIConnection.sklikApi]');if(stat&&stat.getResponseCode()==200){if(response.session){if(cbClass){cbClass[cbMethod](response,param);}}else if(method=='client.logout'){if(cbClass){cbClass[cbMethod](response,param);}}else{this.logger.addEvent(method+' Nevraci session [sklikApi]');return false;}}else if(!retry){Utilities.sleep(2000);return this.sklikApi(parameters,method,cbClass,cbMethod,param,true);}else{this.logger.addEvent(method+' ['+response.status+'] - [sklikApi]');return false;}}}
var Inf=function(RootClass,DataClass,UrlClass){var MAX_LOG_LENGTH=100*10;this.Url=UrlClass;this.Data=DataClass;this.Root=RootClass;this.testUrlConnection=function(cbClass,cbMethod,actionClass,actionMethod,urlPosition,url,retry,isClear){try{var stat=UrlFetchApp.fetch(url,{muteHttpExceptions:true});var statusCode=stat.getResponseCode();}catch(e){var statusCode=404;}
if(statusCode>=300&&url.indexOf("{")!==-1&&!isClear){this.variableRemove(cbClass,cbMethod,actionClass,actionMethod,urlPosition,url,retry);}else if(statusCode>=300&&!retry){this.testUrlConnection(cbClass,cbMethod,actionClass,actionMethod,urlPosition,url,true)}else{actionClass[actionMethod](statusCode,urlPosition);cbClass[cbMethod]();}
return;}
this.variableRemove=function(cbClass,cbMethod,actionClass,actionMethod,urlPosition,url,retry){var clearUrl=url.replace(/[{,}]/g,'');this.testUrlConnection(cbClass,cbMethod,actionClass,actionMethod,urlPosition,clearUrl,retry,true);}
this.loadConfig=function(cbClass,cbMethod,isNonTested){var userIds=this.Root.rSetup.getSettingParam('userIds','array');var token=this.Root.rSetup.getSettingParam('token');if(!token||!userIds){return false;}
var campaignsIds=this.Root.rSetup.getSettingParam('t404campaignsIds','array','int');if(campaignsIds&&campaignsIds.length>0){this.Data.setUsers([userIds[0]]);}else{this.Data.setUsers(userIds);}
if(isNonTested){cbClass[cbMethod]();}else{this.Root.rApi.sklikApiLogin();var session=this.Root.rApi.getSession();if(session){this.Data.setSession(session);}
cbClass[cbMethod]();}}
this.logEvent=function(message,source,debug){if(debug==undefined||Debug===debug){if(message.length>MAX_LOG_LENGTH){var mess=message.substring(0,MAX_LOG_LENGTH)+'[.....]SHORTED';}else{var mess=message;}
this.Root.rLogger.addEvent(mess,source);}}}
var Data4=function(){this.actualUser;this.actualUserInHeap;this.front=[];this.session;this.startDate=new Date();this.userIdsList=[];this.userIdsInHeap=[];this.urlHeap={};this.addUrlToHeap=function(type,urlDetail){if(this.urlHeap[this.getActualUser()].url[urlDetail.url]==undefined){var urlData={'locations':[urlDetail.location],'types':[type],'data':urlDetail};this.urlHeap[this.getActualUser()].url[urlDetail.url]=urlData;}else{if(this.urlHeap[this.getActualUser()].url[urlDetail.url].types.indexOf(type)==-1){this.urlHeap[this.getActualUser()].url[urlDetail.url].types.push(type);}
if(this.urlHeap[this.getActualUser()].url[urlDetail.url].locations.indexOf(urlDetail.location)==-1){this.urlHeap[this.getActualUser()].url[urlDetail.url].locations.push(urlDetail.location);}}}
this.creatHeap=function(){this.urlHeap[this.getActualUser()]={url:{},done:{ads:false,adsDeny:false,keywords:false,sitelinks:false}};this.userIdsInHeap.push(this.getActualUser());}
this.getActualDate=function(){return this.startDate;}
this.getActualUser=function(){return this.actualUser;}
this.setDoneInHeap=function(type){this.urlHeap[this.getActualUser()].done[type]=true;}
this.getFrontLength=function(){return this.urlHeap[this.getActualUser()].url.length;}
this.getHeap=function(userId){if(userId==undefined){userId=this.getActualUser();}
return this.urlHeap[userId];}
this.getNextUrl=function(){if(!this.actualUserInHeap){this.actualUserInHeap=this.userIdsInHeap.shift();}
while(this.actualUserInHeap){for(var urlObject in this.urlHeap[this.actualUserInHeap].url){this.front.push(this.urlHeap[this.actualUserInHeap].url[urlObject]);}
this.actualUserInHeap=this.userIdsInHeap.shift();}
var urlData=this.front.shift();if(urlData&&urlData!=undefined){return urlData;}
return false;}
this.getNextUser=function(){this.actualUser=this.userIdsList.pop();return this.getActualUser();}
this.getSession=function(){return this.session;}
this.setSession=function(session){this.session=session;}
this.setUsers=function(userIdsList){this.userIdsList=userIdsList;}}
var UrlHeap=function(folderClass){this.file;this.rFolder=folderClass;this.sheetUrl;this.totalCount;this.cleanHeap=function(){this.sheetUrl.clear();}
this.loadHeapFile=function(){if(!this.rFolder.loadFile('urlHeap')){if(!this.rFolder.createFile('urlHeap','sheet')){return false;}
this.file=this.rFolder.getFile('urlHeap');this.setupSheet(this.file);}else{this.file=this.rFolder.getFile('urlHeap');this.loadSheet(this.file);}
if(!this.sheetUrl){return false;}
this.totalCount=this.sheetUrl.getLastRow();this.actualPosition=this.findLastTested();return true;}
this.loadSheet=function(file){if(!file){return false;}
var spreadSheet=SpreadsheetApp.open(file);this.sheetUrl=spreadSheet.getSheetByName('urls');return(this.sheetUrl);}
this.setupSheet=function(file){if(!file){return false;}
var spreadSheet=SpreadsheetApp.open(file);var sheets=spreadSheet.getSheets();if(sheets[0].getName()!='urls'){sheets[0].setName('urls');}
this.sheetUrl=sheets[0];this.sheetUrl.setColumnWidth(2,URL_COLUMN_WIDTH);}
this.insertUrlCache=[];this.addUrlToSheet=function(userId,url,types,groups){this.insertUrlCache.push([userId,url,0,types,groups]);if(this.insertUrlCache.length>=500){this.processUrlToSheet(this.insertUrlCache);}}
this.processUrlToSheet=function(lines){var lstLine=this.sheetUrl.getLastRow();if(lstLine==0){lstLine++;this.sheetUrl.insertRows(1,lines.length);}else{this.sheetUrl.insertRowsAfter(lstLine+1,lines.length);}
SpreadsheetApp.flush();var range=this.sheetUrl.getRange(lstLine,1,lines.length,lines[0].length);range.setValues(lines);}
this.pushRemainUrlCache=function(){if(this.insertUrlCache.length>0){this.processUrlToSheet(this.insertUrlCache);}}
var LOAD_URL_LIMIT=200;this.actualPosition=-1;this.actualUrl;this.haveErrors=0;this.urlCache={};this.urlCacheFrom;this.findLastTested=function(){var lastRow=this.sheetUrl.getLastRow();if(lastRow<=0){return-1;}
var startRow=1;var actualRow=Math.min(10000,lastRow);do{if(this.sheetUrl.getLastRow()>0){var range=this.sheetUrl.getRange(startRow,3,actualRow);var values=range.getValues();for(var i=0;i<values.length;i++){if(values[i][0]!=200){if(values[i][0]==0){return i;}else{this.haveErrors++;}}}}
startRow=actualRow;if(actualRow>=lastRow){break;}
actualRow=Math.min(actualRow+10000,lastRow);}while(actualRow<lastRow);this.haveErrors=0;return-1;}
this.getActualUrl=function(){return this.actualUrl;}
this.getNextUrl=function(){if(this.isNonTested()){this.actualPosition++;if(this.actualPosition>this.totalCount){this.actualPosition=-1;return this.actualPosition;}
var val=this.getUrlFromCache(this.actualPosition);if(!val){this.actualPosition=-1;return false;}
this.actualUrl=val;return this.actualPosition;}else{return this.actualPosition;}}
this.getUrlFromCache=function(from,reload){var url;var pos=from-this.urlCacheFrom;if(this.urlCache.length>0&&this.urlCache[pos]!=undefined){url=this.urlCache[pos][0];if(url){return url;}}
if(!reload){if(this.loadUrlCache(from,LOAD_URL_LIMIT)){return this.getUrlFromCache(from,true);}}}
this.isNonTested=function(){return(this.actualPosition>=0);}
this.startNewTest=function(){this.totalCount=this.sheetUrl.getLastRow();this.actualPosition=this.findLastTested();}
this.loadUrlCache=function(from,rows){this.urlCacheFrom=from;var numRows=Math.min(rows,this.totalCount);var range=this.sheetUrl.getRange(from,2,numRows);this.urlCache=range.getValues();return true;}
var URL_COLUMN_WIDTH=300;this.counter=0;this.solvedPack=[];this.startPosition=0;this.completeControl=function(email,sendIfOk){SpreadsheetApp.flush();var fileUrlBeckup=this.copyActualAsLog();var sheet=SpreadsheetApp.open(fileUrlBeckup).getSheetByName('urls');sheet.setColumnWidth(2,URL_COLUMN_WIDTH);sheet.sort(3,false);sheet.insertRows(1);sheet.getRange(1,1).setValue('Uživatelské Id');sheet.getRange(1,2).setValue('Testovane URL');sheet.getRange(1,3).clearFormat().setValue('HTTP status');sheet.getRange(1,4).setValue('Zdroj');sheet.getRange(1,5).setValue('sitelinkId-campaignId-groupId');SpreadsheetApp.flush();if(sendIfOk||this.haveErrors>0){MailApp.sendEmail(email,'Sklik Script Test URL dokončen','Test kontroly URL byl úspěšně dokončen. Seznam všech testovaných a jejich výsledky najdete v příloze. \n Celkem bylo zjištěno '+this.haveErrors+' neplatných adres',{attachments:[sheet.getParent().getAs(MimeType.PDF)]});}}
this.copyActualAsLog=function(){return this.rFolder.makeCopy(this.file,'urlHeap_done',true);}
this.makeNewArray=function(limit){for(var aa=[];aa.push([0])<limit;);return aa;}
this.pushIndividualRecord=function(stat,position){if(!position){position=this.actualPosition;}
if(stat==200){this.sheetUrl.getRange(position,3).setValue(stat).setBackgroundRGB(0,255,0);}else if(stat<400){this.sheetUrl.getRange(position,3).setValue(stat).setBackgroundRGB(255,255,0);this.haveErrors++;}else{this.sheetUrl.getRange(position,3).setValue(stat).setBackgroundRGB(255,0,0);this.haveErrors++;}}
this.pushSolvedPack=function(pack,startPosition){var range=this.sheetUrl.getRange(startPosition,3,pack.length);range.setBackgroundRGB(0,255,0).setValues(pack);}
this.solvedActualUrl=function(stat,position,finish){var limit=50;if(finish){if(this.counter>0){if(this.startPosition+limit>this.totalCount){this.solvedPack.splice(this.totalCount-this.startPosition+1);}
this.pushSolvedPack(this.solvedPack,this.startPosition);this.solvedPack=this.makeNewArray(limit);this.startPosition=0;this.counter=0;}
return;}
if(this.counter==0&&stat>=300){this.pushIndividualRecord(stat,position);return;}
if(this.counter>0&&stat>=300){if(this.startPosition+limit>this.totalCount){this.solvedPack.splice(this.totalCount-this.startPosition+1);}
this.pushSolvedPack(this.solvedPack,this.startPosition);this.pushIndividualRecord(stat,position);this.solvedPack=this.makeNewArray(limit);this.startPosition=0;this.counter=0;return;}
if(this.counter==0){this.startPosition=position;this.solvedPack=this.makeNewArray(limit);}
if(position<this.startPosition){this.pushIndividualRecord(stat,position);return;}
if(this.counter<limit&&stat<300){this.solvedPack[position-this.startPosition][0]=stat;this.counter++;if(this.counter==limit){this.pushSolvedPack(this.solvedPack,this.startPosition);this.solvedPack=this.makeNewArray(limit);this.startPosition=0;this.counter=0;}
return;}}
this.solvedActualUrlClose=function(){this.solvedActualUrl('','',true);}}
var TestUrl=function(RootClass){this.Root=RootClass;this.Heap=new UrlHeap(this.Root.rFolder);this.Data=new Data4();this.Lib=new Inf(RootClass,this.Data,this);this.sendIfOk=true;this.isDeleted=false;this.allowEmpty=false;this.isPaused=false;this.enabledReports={'ads':true,'adsDeny':true,'keywords':true,'sitelinks':true}
this.start404Test=function(){this.setupParams();if(this.Heap.loadHeapFile()){this.Lib.loadConfig(this,'startForUser',this.Heap.isNonTested());}else{throw new Error('Nelze založit soubor urlHeap (klíčová komponenta pro ukládání url)');}}
this.setupParams=function(){this.sendIfOk=false;if(this.Root.rSetup.getSettingParam('t404email')){this.sendIfOk=true;}
this.Lib.logEvent('Nastavena hodnota: t404Email na '+this.sendIfOk,'setupParams',true);this.isDeleted=false;if(this.Root.rSetup.getSettingParam('t404deleted')){this.isDeleted=true;}
this.Lib.logEvent('Nastavena hodnota: t404deleted na '+this.isDeleted,'setupParams',true);this.allowEmpty=false;if(this.Root.rSetup.getSettingParam('t404empty')){this.allowEmpty=true;}
this.Lib.logEvent('Nastavena hodnota: t404empty na '+this.allowEmpty,'setupParams',true);this.isPaused=false;if(this.Root.rSetup.getSettingParam('t404paused')){this.isPaused=true;}
this.Lib.logEvent('Nastavena hodnota: t404paused na '+this.isPaused,'setupParams',true);this.enabledReports.ads=false;if(this.Root.rSetup.getSettingParam('t404ads')){this.enabledReports.ads=true;}
this.enabledReports.adsDeny=false;if(this.Root.rSetup.getSettingParam('t404adsDeny')){this.enabledReports.adsDeny=true;}
this.enabledReports.sitelinks=false;if(this.Root.rSetup.getSettingParam('t404sitelinks')){this.enabledReports.sitelinks=true;}
this.enabledReports.keywords=false;if(this.Root.rSetup.getSettingParam('t404keywords')){this.enabledReports.keywords=true;}
this.Lib.logEvent('Nastavená kontrola dle typu:'+JSON.stringify(this.enabledReports),'setupParams',true);}
this.startForUser=function(){if(this.Heap.isNonTested()){this.Lib.logEvent('Zahajeni testování jednotlivých URL');this.testUrl();}else{try{if(this.Data.getSession()==undefined){throw'Nejsi prihlasen [system nema session]';}
if(this.Data.getNextUser()){this.Lib.logEvent('Nacitani linku pro uzivatele:'+this.Data.getActualUser());this.Data.creatHeap();this.loadUrlForUserId();}else{this.Root.rApi.sklikApi([{session:this.Data.getSession()}],'client.logout');this.Heap.cleanHeap();this.Lib.logEvent('Vkládání načtených do souboru');var url=this.Data.getNextUrl();while(url){this.Heap.addUrlToSheet(url.data.userId,url.data.url,url.types.toString(),url.locations.toString());url=this.Data.getNextUrl();}
this.Heap.pushRemainUrlCache();this.Heap.startNewTest();if(this.Heap.isNonTested()){this.startForUser();}}}catch(e){this.Lib.logEvent('Fatální chyba při testech URL u uživatele: ['+
[this.Data.getActualUser()]+'] Důvod chyby:'+e.message+'['+e.fileName+'|'+e.lineNumber+']');return false;}}}
this.testUrl=function(){var nextUrlPosition=this.Heap.getNextUrl();if(this.Heap.isNonTested()){this.Lib.testUrlConnection(this,'testUrl',this,'solvedActualUrl',nextUrlPosition,this.Heap.getActualUrl());}else{this.Heap.solvedActualUrlClose();this.Root.rLogger.addEvent('Test dokoncen');this.Heap.completeControl(this.Root.rSetup.getSettingParam('reportEmail'),this.sendIfOk);return;}}
this.solvedActualUrl=function(stat,urlPosition){this.Heap.solvedActualUrl(stat,urlPosition);}
this.loadUrlForUserId=function(){try{if(this.enabledReports.ads){this.Lib.logEvent('Načítání url z ADS','loadUrlForUserId',true);this.adsCreateReport();}
if(this.enabledReports.adsDeny){this.Lib.logEvent('Načítání url z ADS Deny','loadUrlForUserId',true);this.adsDenyCreateReport();}
if(this.enabledReports.keywords){this.Lib.logEvent('Načítání url z Keywords','loadUrlForUserId',true);this.keywordsCreateReport();}
if(this.enabledReports.sitelinks){this.Lib.logEvent('Načítání url ze sitelinků','loadUrlForUserId',true);this.sitelinksCreateReport();}}catch(e){this.Lib.logEvent('Fatal error při načítání linků: '+e.message+'['+e.fileName+'|'+e.lineNumber+']');return false;}finally{return true;}}
this.getCampaignRestriction=function(restriction,type){var paramCID=this.Root.rSetup.getSettingParam('t404campaignsIds','array','int');if(paramCID&&paramCID.length>0){restriction.campaign.ids=paramCID;}
return restriction;}
this.getStatusRestriction=function(restriction,type){var status=['active'];if(this.isPaused){status.push('suspend');status.push('noactive');}
if(type=='keywords'){var statusK=['active'];if(this.isPaused){statusK.push('active-noactive');statusK.push('active-never');statusK.push('active-disabled');statusK.push('suspended');}
restriction.mixedStatus=statusK;}else if(type=='sitelinks'){var statusS=['new','waiting','allow'];if(this.isPaused){statusS.push('noactive');}
restriction.status=statusS;}else{restriction.status=status;}
if(type!='sitelinks'){restriction.campaign.status=status;restriction.group.status=status;}
return restriction;}
this.getStatConditions=function(restriction,type){restriction.statisticsConditions=[{'columnName':'clicks','operator':'GTE','intValue':0}];return restriction;}
this.getDateConditions=function(restriction,type,period){var monthAgo=new Date();monthAgo.setUTCMonth(monthAgo.getUTCMonth()-1);monthAgo=monthAgo.toISOString(monthAgo,"GTM - 1",'yyyy-MM-dd');var yesterday=new Date();yesterday.setUTCDate(yesterday.getUTCDate()-1);yesterday=yesterday.toISOString(yesterday,"GTM - 1",'yyyy-MM-dd');if(period=='month'){restriction.dateFrom=monthAgo;}else{restriction.dateFrom=yesterday;}
restriction.dateTo=yesterday;return restriction;}
this.getDeletedConditions=function(restriction,type){if(!this.isDeleted){restriction.isDeleted=this.isDeleted;if(type!='sitelinks'){restriction.campaign.isDeleted=this.isDeleted;restriction.group.isDeleted=this.isDeleted;}}
return restriction;}
this.adsCreateReport=function(){var yesterday=new Date();yesterday.setUTCDate(yesterday.getUTCDate()-1);yesterday=yesterday.toISOString(yesterday,"GTM - 1",'yyyy-MM-dd');var restriction={'campaign':{},'group':{}};restriction=this.getDeletedConditions(restriction,'ads');restriction=this.getDateConditions(restriction,'ads','month');restriction=this.getStatusRestriction(restriction,'ads');restriction=this.getCampaignRestriction(restriction,'ads');restriction=this.getStatConditions(restriction,'ads');if(!this.Root.rApi.sklikApi([{'session':this.Data.getSession(),'userId':this.Data.getActualUser()},restriction,{'source':"Test404ads"}],'ads.createReport',this,'adsReadReport')){return true;}}
this.adsReadReport=function(response,param){if(param==undefined){var totalCount=response.totalCount;var a=0;var root=true;}else{var totalCount=param.totalCount;var a=param.a+1;}
var report_id=response.reportId;var offset=Math.ceil(totalCount / 5000);if((totalCount-a*5000)>0){this.Root.rApi.sklikApi([{'session':this.Data.getSession(),'userId':this.Data.getActualUser()},report_id,{'offset':a*5000,'limit':5000,'allowEmptyStatistics':this.allowEmpty,'displayColumns':['adType','clickthruUrl','finalUrl','clicks','totalMoney','group.id','campaign.id']}],'ads.readReport',this,'adsReadReport',{totalCount:totalCount,a:a});}
if(response.totalCount==undefined){var url='';var urlData={};for(var i=0;i<response.report.length;i++){var report=response.report[i];if(report.adType=='eta'){url=report.finalUrl;}else if(report.adType=='text'){url=report.clickthruUrl;}else if(report.adType=='combined'){url=report.finalUrl;}else{this.Lib.logEvent('Načetla se reklama, která není ani eta, ani text. Její typ je:'+report.adType);}
urlData={url:url,clicks:report.stats[0].clicks,cost:report.stats[0].totalMoney / 100,location:report.campaign.id+'-'+report.group.id,type:'ads',userId:this.Data.getActualUser()};this.Data.addUrlToHeap('ads',urlData);}}
if(root){this.Data.setDoneInHeap('ads');this.loadedDone();return;}}
this.adsDenyCreateReport=function(Data,Lib){var restriction={'adStatus':['deny','deny_invalid_url'],'campaign':{},'group':{}};restriction=this.getDeletedConditions(restriction,'ads4');restriction=this.getDateConditions(restriction,'ads4','month');restriction=this.getStatusRestriction(restriction,'ads4');restriction=this.getCampaignRestriction(restriction,'ads4');restriction=this.getStatConditions(restriction,'ads4');if(!this.Root.rApi.sklikApi([{'session':this.Data.getSession(),'userId':this.Data.getActualUser()},restriction,{'source':"Test404adsdeny"}],'ads.createReport',this,'adsDenyReadReport')){return true;}}
this.adsDenyReadReport=function(response,param){if(param==undefined){var totalCount=response.totalCount;var a=0;var root=true;}else{var totalCount=param.totalCount;var a=param.a+1;}
var report_id=response.reportId;var offset=Math.ceil(totalCount / 5000);if((totalCount-a*5000)>0){this.Root.rApi.sklikApi([{'session':this.Data.getSession(),'userId':this.Data.getActualUser()},report_id,{'offset':a*5000,'limit':5000,'allowEmptyStatistics':this.allowEmpty,'displayColumns':['adType','clickthruUrl','finalUrl','group.id','campaign.id','totalMoney','clicks']}],'ads.readReport',this,'adsDenyReadReport',{totalCount:totalCount,a:a});}
if(response.totalCount==undefined){var url='';var urlData={};for(var i=0;i<response.report.length;i++){var report=response.report[i];if(report.adType=='eta'){url=report.finalUrl;}else if(report.adType=='text'){url=report.clickthruUrl;}else if(report.adType=='combined'){url=report.finalUrl;}else{this.Lib.addEvent('Načetla se reklama, která není ani eta, ani text. Její typ je:'+report.adType);}
urlData={url:url,clicks:report.stats[0].clicks,cost:report.stats[0].totalMoney / 100,location:report.campaign.id+'-'+report.group.id,type:'ads',userId:this.Data.getActualUser()};this.Data.addUrlToHeap('adsDeny',urlData);}}
if(root){this.Data.setDoneInHeap('adsDeny');this.loadedDone();}}
this.keywordsCreateReport=function(){var restriction={'urls':[{'operator':'CONTAINS','value':'http'}],'campaign':{},'group':{}};restriction=this.getDeletedConditions(restriction,'keywords');restriction=this.getDateConditions(restriction,'keywords','month');restriction=this.getStatusRestriction(restriction,'keywords');restriction=this.getCampaignRestriction(restriction,'keywords');restriction=this.getStatConditions(restriction,'keywords');if(!this.Root.rApi.sklikApi([{'session':this.Data.getSession(),'userId':this.Data.getActualUser()},restriction,{'source':"Test404keywords"}],'keywords.createReport',this,'keywordsReadReport')){return true;}}
this.keywordsReadReport=function(response,param){if(param==undefined){var totalCount=response.totalCount;var a=0;var root=true;}else{var totalCount=param.totalCount;var a=param.a+1;}
var report_id=response.reportId;var offset=Math.ceil(totalCount / 5000);if((totalCount-a*5000)>0){this.Root.rApi.sklikApi([{'session':this.Data.getSession(),'userId':this.Data.getActualUser()},report_id,{'offset':a*5000,'limit':5000,'allowEmptyStatistics':this.allowEmpty,'displayColumns':['url','clicks','totalMoney','group.id','campaign.id']}],'keywords.readReport',this,'keywordsReadReport',{totalCount:totalCount,a:a});}
if(response.totalCount==undefined){var url='';var urlData={};for(var i=0;i<response.report.length;i++){var report=response.report[i];url=report.url;urlData={url:url,clicks:report.stats[0].clicks,cost:report.stats[0].totalMoney / 100,location:report.campaign.id+'-'+report.group.id,type:'keywords',userId:this.Data.getActualUser()};this.Data.addUrlToHeap('keywords',urlData);}}
if(root){this.Data.setDoneInHeap('keywords');this.loadedDone();return;}}
this.sitelinksCreateReport=function(){var restriction={'campaign':{},'group':{}};restriction=this.getDeletedConditions(restriction,'sitelinks');restriction=this.getDateConditions(restriction,'sitelinks','month');restriction=this.getStatusRestriction(restriction,'sitelinks');restriction=this.getCampaignRestriction(restriction,'sitelinks');restriction=this.getStatConditions(restriction,'sitelinks');if(!this.Root.rApi.sklikApi([{'session':this.Data.getSession(),'userId':this.Data.getActualUser()},restriction,{'source':"Test404sitelinks"}],'sitelinks.createReport',this,'sitelinksReadReport')){return true;}}
this.sitelinksReadReport=function(response,param){if(param==undefined){var totalCount=response.totalCount;var a=0;var root=true;}else{var totalCount=param.totalCount;var a=param.a+1;}
var report_id=response.reportId;var offset=Math.ceil(totalCount / 5000);if((totalCount-a*5000)>0){this.Root.rApi.sklikApi([{'session':this.Data.getSession(),'userId':this.Data.getActualUser()},report_id,{'offset':a*5000,'limit':5000,'allowEmptyStatistics':this.allowEmpty,'displayColumns':['url','clicks','totalMoney','id','group.id','campaign.id']}],'sitelinks.readReport',this,'sitelinksReadReport',{totalCount:totalCount,a:a});}
if(response.totalCount==undefined){var url='';var urlData={};for(var i=0;i<response.report.length;i++){var report=response.report[i];url=report.url;var loc=report.id;if(report.campaign!=undefined){loc+='-'+report.group.id;}else if(report.group!=undefined){loc+='-'+0;}
if(report.group!=undefined){loc+='-'+report.group.id;}
urlData={url:url,clicks:report.stats[0].clicks,cost:report.stats[0].totalMoney / 100,location:loc,type:'sitelinks',userId:this.Data.getActualUser()};this.Data.addUrlToHeap('sitelinks',urlData);}}
if(root){this.Data.setDoneInHeap('sitelinks');this.loadedDone();return;}}
this.loadedDone=function(){var ready=true;var objt=this.Data.getHeap().done;this.Lib.logEvent(JSON.stringify(this.Data.getHeap().done),'testUrl');for(var key in objt){if(this.enabledReports[key]&&!objt[key]){ready=false;}}
if(ready){this.startForUser();}else{return false;}}
this.getStartDate=function(){var date=this.Data.getActualDate();return date.toString();}}
var Root=function(){var FOLDER_ID='';this.rFolder=new ApiFolder(FOLDER_ID);this.rSetup=new FileOfSetup(FOLDER_ID);this.rEmail=new ReportEmail(this.rSetup);this.rLogger=new ProblemLogger(this.rFolder,this.rSetup,this.rEmail);this.rApi=new APIConnection(this.rSetup,this.rLogger);this.loadEnv=function(){if(!this.rFolder.loadFolder()){this.rFolder.createFolder();}
this.rSetup.load();this.rLogger.setup();this.rEmail.setup();}
this.startTest=function(){try{var Test=new TestUrl(this);this.rLogger.newTest('Zahájená další iterace scriptu : ['+Test.getStartDate()+']');Test.start404Test();}catch(error){this.rLogger.addEvent('Fatální chyba: '+error.message+'['+error.fileName+'|'+error.lineNumber+']');}}}
function main(){var fRoot=new Root();fRoot.loadEnv();fRoot.startTest();return fRoot;}
var Debug=true;