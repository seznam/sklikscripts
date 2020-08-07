var FileOfSetup=function(e){this.FOLDER_ID=e,this.sFolder=new ApiFolder(e),this.file,this.sheets={},this.params={},this.createFolder=function(){return this.sFolder.createFolder()},this.getFolder=function(){return this.sFolder.getFolder()},this.getSettingParam=function(e,t,a){if(0==this.params.length&&!this.getSettingParams())return!1;if(this.params[e]){if(("string"==typeof this.params[e]||this.params[e]instanceof String)&&!/^\d+$/.test(this.params[e])){if("ANO"==this.params[e].toUpperCase())return!0;if("NE"==this.params[e].toUpperCase())return!1}if("array"==t){var s=[];if("string"==typeof this.params[e]||this.params[e]instanceof String){for(var o=this.params[e].split("|"),r=0;r<o.length;r++)if("int"==a){var l=parseInt(o[r]);isNaN(l)||s.push(l)}else s.push(parseInt(o[r]));}else{if(Array.isArray(this.params[e]))return this.params[e];if(!isNaN(this.params[e]))return[this.params[e]]}return s}return this.params[e]}return!1},this.getSettingParams=function(){var e=this.getSettingSheet();if(!e)return!1;var t=e.getDataRange().getValues();return this.params=this.transformSettingArrayToObject(t),this.params},this.getSettingSheet=function(){if(!this.sheets.setting){if(!this.loadFile())return!1;var e=SpreadsheetApp.open(this.file);this.sheets.setting=e.getSheetByName("setting")}return this.sheets.setting},this.load=function(){return this.loadFolder(),!!(this.loadFile()&&!1!=this.getSettingParams())},this.loadFile=function(){return this.sFolder.loadFile("gSetting"),this.file=this.sFolder.getFile("gSetting"),!!this.file},this.loadFolder=function(){return this.sFolder.loadFolder()},this.setup=function(e){var t,a;for(var s in e)for(var o in a=e[s],this.setOptionBlock(this.getSettingSheet(),a.desc),a)t=a[o],null!=t.name&&null!=t.value&&null!=t.type&&this.setOption(this.getSettingSheet(),t.name,t.value,t.type,t.desc);return this.file},this.setOption=function(e,t,a,s,o,r){if(!e&&(e=this.getSettingSheet(),!e))return!1;switch(r||(r=Math.max(e.getLastRow()+1,2)),e.getRange(r,1).setValue(o),e.getRange(r,2).setValue(t),e.getRange(r,3).setValue(a),s){case"int":break;case"boolean":break;default:}},this.setOptionBlock=function(e,t,a){return(e||(e=this.getSettingSheet(),!!e))&&void(!a&&(a=Math.max(e.getLastRow()+1,2)),e.getRange(a,1).setValue(t))},this.transformSettingArrayToObject=function(e){for(var t,a={},s=1;s<e.length;s++)t=e[s],""!=t[1]&&(a[t[1]]=t[2]);return a}},ProblemLogger=function(e,t,a){this.folder=e,this.setupFile=t,this.reportEmail=a,this.log,this.emailErrorCache=[],this.actualParagraph,this.noErr=!0,this.addError=function(e,t,a){this.noErr=!1,this.emailErrorCache.push(e),this.addRecord(e),a&&this.reportEmail.sendError(this.emailErrorCache)},this.addEvent=function(e){this.addRecord(e)},this.addWarning=function(e){this.noErr=!1,this.emailErrorCache.push(e),this.addRecord(e)},this.addRecord=function(){},this.newTest=function(){},this.setup=function(){}},ApiFolder=function(e){this.FOLDER_ID=e,this.apiFolder,this.loadedFiles={},this.createFile=function(e,t){if(!this.getFolder()&&!this.createFolder())return!1;var a,s;switch(t){case"doc":s=DocumentApp.create(e).getId();break;case"sheet":s=SpreadsheetApp.create(e).getId();break;default:}return a=DriveApp.getFileById(s),this.loadedFiles[e]=a.makeCopy(e,this.apiFolder),DriveApp.removeFile(a),this.loadedFiles[e]},this.createFolder=function(){return this.getFolder()?this.apiFolder:this.apiFolder=DriveApp.getRootFolder().createFolder("SklikAPI")},this.getFile=function(e){return!!(this.loadedFiles[e]||this.loadFile(e))&&this.loadedFiles[e]},this.getFolder=function(){return!!(this.apiFolder||this.loadFolder())&&this.apiFolder},this.loadFile=function(e){if(this.apiFolder&&!this.loadedFiles[e]){var t=this.apiFolder.getFilesByName(e);if(t.hasNext())return this.loadedFiles[e]=t.next(),!0}return!1},this.loadFolder=function(){if(""!=this.FOLDER_ID&&this.FOLDER_ID!=null){var e=DriveApp.getFolderById(this.FOLDER_ID);if(e)return this.apiFolder=e,this.apiFolder}else{var e=DriveApp.getRootFolder().getFoldersByName("SklikAPI");if(e.hasNext())return this.apiFolder=e.next(),this.apiFolder}return!1},this.makeCopy=function(e,t,a){return a&&this.removeFile(t),e.makeCopy(t,this.getFolder())},this.removeFile=function(e){var t=this.getFile(e);t&&this.getFolder().removeFile(t)}},ReportEmail=function(e){this.setupFile=e,this.recipient,this.setup=function(){this.recipient=this.setupFile.getSettingParam("reportEmail")},this.sendError=function(e,t){var a=this.recipient;return t&&(a=t),!!a&&void MailApp.sendEmail(a,"SklikAPI script: Chybove hlaseni",this.errorTemplate(e))},this.sendMessage=function(e,t,a,s){var o=this.recipient;return a&&(o=a),!!o&&void(s?MailApp.sendEmail(o,e,t,{htmlBody:s.evaluate().getContent()}):MailApp.sendEmail(o,e,t))},this.errorTemplate=function(e){var a=HtmlService.createTemplateFromFile("reportEmail");return a.errors=e,a.evaluate().getContent()}},APIConnection=function(e,t){this.setupFile=e,this.logger=t,this.session="",this.sklikApiLogin=function(){this.sklikApi(this.setupFile.getSettingParam("token"),"client.loginByToken",this,"setSessionByLogin")},this.setSessionByLogin=function(e){this.session=e.session},this.getSession=function(){return this.session},this.sklikApi=function(t,a,s,o,r,l){l==null?l=1:++l,-1==a.indexOf("client.")&&(this.logger.addEvent(a+"[SklikApiCore.APIConnection.sklikApi]"),this.logger.addEvent(a+JSON.stringify(t)+"[SklikApiCore.APIConnection.sklikApi]")),Utilities.sleep(200);try{var i=UrlFetchApp.fetch("https://api.sklik.cz/drak/json/"+a,{method:"post",contentType:"application/json",muteHttpExceptions:!0,payload:JSON.stringify(t)}),n=JSON.parse(i),d=JSON.stringify(n);if(null==n||null==n.status||null==d)throw"Have no status message";if(400<d.length&&(d=d.substring(0,400)+"SHORTED "),this.logger.addEvent(a+d+"[SklikApiCore.APIConnection.sklikApi]"),!(i&&200==i.getResponseCode()))return 3>l||null==l?(Utilities.sleep(2e3),this.sklikApi(t,a,s,o,r,l)):(this.logger.addEvent(a+" ["+n.status+"] - [sklikApi]"),!1);if(n.session)s&&s[o](n,r);else if("client.logout"==a)s&&s[o](n,r);else return this.logger.addEvent(a+" Nevraci session [sklikApi]"),!1}catch(i){return!!(3>l)&&(Utilities.sleep(2e3),this.sklikApi(t,a,s,o,r,l))}}},Inf=function(e,t,a){this.Url=a,this.Data=t,this.Root=e,this.testUrlConnection=function(e,t,a,s,o,r,l,i){try{var n=UrlFetchApp.fetch(r,{muteHttpExceptions:!0}),d=n.getResponseCode()}catch(t){var d=404}300<=d&&-1!==r.indexOf("{")&&!i?this.variableRemove(e,t,a,s,o,r,l):300<=d&&!l?this.testUrlConnection(e,t,a,s,o,r,!0):(a[s](d,o),e[t]())},this.variableRemove=function(e,t,a,s,o,r,l){var i=r.replace(/[{,}]/g,"");this.testUrlConnection(e,t,a,s,o,i,l,!0)},this.loadConfig=function(e,t,a){var s=this.Root.rSetup.getSettingParam("userIds","array"),o=this.Root.rSetup.getSettingParam("token");if(!o||!s)return!1;var r=this.Root.rSetup.getSettingParam("t404campaignsIds","array","int");if(r&&0<r.length?this.Data.setUsers([s[0]]):this.Data.setUsers(s),a)e[t]();else{this.Root.rApi.sklikApiLogin();var l=this.Root.rApi.getSession();l&&this.Data.setSession(l),e[t]()}},this.logEvent=function(e,t,a){if(a==null||Debug===a){if(e.length>1000)var s=e.substring(0,1000)+"[.....]SHORTED";else var s=e;this.Root.rLogger.addEvent(s,t)}}},Data4=function(){this.actualUser,this.actualUserInHeap,this.front=[],this.session,this.startDate=new Date,this.userIdsList=[],this.userIdsInHeap=[],this.urlHeap={},this.addUrlToHeap=function(e,t){if(this.urlHeap[this.getActualUser()].url[t.url]==null){var a={locations:[t.location],types:[e],data:t};this.urlHeap[this.getActualUser()].url[t.url]=a}else-1==this.urlHeap[this.getActualUser()].url[t.url].types.indexOf(e)&&this.urlHeap[this.getActualUser()].url[t.url].types.push(e),-1==this.urlHeap[this.getActualUser()].url[t.url].locations.indexOf(t.location)&&this.urlHeap[this.getActualUser()].url[t.url].locations.push(t.location)},this.creatHeap=function(){this.urlHeap[this.getActualUser()]={url:{},done:{ads:!1,adsDeny:!1,keywords:!1,sitelinks:!1}},this.userIdsInHeap.push(this.getActualUser())},this.getActualDate=function(){return this.startDate},this.getActualUser=function(){return this.actualUser},this.setDoneInHeap=function(e){this.urlHeap[this.getActualUser()].done[e]=!0},this.getFrontLength=function(){return this.urlHeap[this.getActualUser()].url.length},this.getHeap=function(e){return null==e&&(e=this.getActualUser()),this.urlHeap[e]},this.getNextUrl=function(){for(this.actualUserInHeap||(this.actualUserInHeap=this.userIdsInHeap.shift());this.actualUserInHeap;){for(var e in this.urlHeap[this.actualUserInHeap].url)this.front.push(this.urlHeap[this.actualUserInHeap].url[e]);this.actualUserInHeap=this.userIdsInHeap.shift()}var t=this.front.shift();return!!(t&&null!=t)&&t},this.getNextUser=function(){return this.actualUser=this.userIdsList.pop(),this.getActualUser()},this.getSession=function(){return this.session},this.setSession=function(e){this.session=e},this.setUsers=function(e){this.userIdsList=e}},UrlHeap=function(e){this.file,this.rFolder=e,this.sheetUrl,this.totalCount,this.cleanHeap=function(){this.sheetUrl.clear()},this.loadHeapFile=function(){if(!this.rFolder.loadFile("urlHeap")){if(!this.rFolder.createFile("urlHeap","sheet"))return!1;this.file=this.rFolder.getFile("urlHeap"),this.setupSheet(this.file)}else this.file=this.rFolder.getFile("urlHeap"),this.loadSheet(this.file);return!!this.sheetUrl&&(this.totalCount=this.sheetUrl.getLastRow(),this.actualPosition=this.findLastTested(),!0)},this.loadSheet=function(e){if(!e)return!1;var t=SpreadsheetApp.open(e);return this.sheetUrl=t.getSheetByName("urls"),this.sheetUrl},this.setupSheet=function(e){if(!e)return!1;var a=SpreadsheetApp.open(e),s=a.getSheets();"urls"!=s[0].getName()&&s[0].setName("urls"),this.sheetUrl=s[0],this.sheetUrl.setColumnWidth(2,t)},this.insertUrlCache=[],this.addUrlToSheet=function(e,t,a,s){this.insertUrlCache.push([e,t,0,a,s]),500<=this.insertUrlCache.length&&this.processUrlToSheet(this.insertUrlCache)},this.processUrlToSheet=function(e){var t=this.sheetUrl.getLastRow();0==t?(t++,this.sheetUrl.insertRows(1,e.length)):this.sheetUrl.insertRowsAfter(t+1,e.length),SpreadsheetApp.flush();var a=this.sheetUrl.getRange(t,1,e.length,e[0].length);a.setValues(e)},this.pushRemainUrlCache=function(){0<this.insertUrlCache.length&&this.processUrlToSheet(this.insertUrlCache)};this.actualPosition=-1,this.actualUrl,this.haveErrors=0,this.urlCache={},this.urlCacheFrom,this.findLastTested=function(){var e=this.sheetUrl.getLastRow();if(0>=e)return-1;var t=1,a=Math.min(1e4,e);do{if(0<this.sheetUrl.getLastRow())for(var s=this.sheetUrl.getRange(t,3,a),o=s.getValues(),r=0;r<o.length;r++)if(200!=o[r][0]){if(0==o[r][0])return r;this.haveErrors++}if(t=a,a>=e)break;a=Math.min(a+1e4,e)}while(a<e);return this.haveErrors=0,-1},this.getActualUrl=function(){return this.actualUrl},this.getNextUrl=function(){if(this.isNonTested()){if(this.actualPosition++,this.actualPosition>this.totalCount)return this.actualPosition=-1,this.actualPosition;var e=this.getUrlFromCache(this.actualPosition);return e?(this.actualUrl=e,this.actualPosition):(this.actualPosition=-1,!1)}return this.actualPosition},this.getUrlFromCache=function(e,t){var a,s=e-this.urlCacheFrom;return 0<this.urlCache.length&&null!=this.urlCache[s]&&(a=this.urlCache[s][0],a)?a:!t&&this.loadUrlCache(e,200)?this.getUrlFromCache(e,!0):void 0},this.isNonTested=function(){return 0<=this.actualPosition},this.startNewTest=function(){this.totalCount=this.sheetUrl.getLastRow(),this.actualPosition=this.findLastTested()},this.loadUrlCache=function(e,t){this.urlCacheFrom=e;var a=Math.min(t,this.totalCount),s=this.sheetUrl.getRange(e,2,a);return this.urlCache=s.getValues(),!0};var t=300;this.counter=0,this.solvedPack=[],this.startPosition=0,this.completeControl=function(e,t){SpreadsheetApp.flush();var a=this.copyActualAsLog(),s=SpreadsheetApp.open(a).getSheetByName("urls");s.setColumnWidth(2,300),s.sort(3,!1),s.insertRows(1),s.getRange(1,1).setValue("U\u017Eivatelsk\xE9 Id"),s.getRange(1,2).setValue("Testovane URL"),s.getRange(1,3).clearFormat().setValue("HTTP status"),s.getRange(1,4).setValue("Zdroj"),s.getRange(1,5).setValue("sitelinkId-campaignId-groupId"),SpreadsheetApp.flush(),(t||0<this.haveErrors)&&MailApp.sendEmail(e,"Sklik Script Test URL dokon\u010Den","Test kontroly URL byl \xFAsp\u011B\u0161n\u011B dokon\u010Den. Seznam v\u0161ech testovan\xFDch a jejich v\xFDsledky najdete v p\u0159\xEDloze. \n Celkem bylo zji\u0161t\u011Bno "+this.haveErrors+" neplatn\xFDch adres",{attachments:[s.getParent().getAs(MimeType.PDF)]})},this.copyActualAsLog=function(){return this.rFolder.makeCopy(this.file,"urlHeap_done",!0)},this.makeNewArray=function(e){for(var t=[];t.push([0])<e;);return t},this.pushIndividualRecord=function(e,t){t||(t=this.actualPosition),200==e?this.sheetUrl.getRange(t,3).setValue(e).setBackgroundRGB(0,255,0):400>e?(this.sheetUrl.getRange(t,3).setValue(e).setBackgroundRGB(255,255,0),this.haveErrors++):(this.sheetUrl.getRange(t,3).setValue(e).setBackgroundRGB(255,0,0),this.haveErrors++)},this.pushSolvedPack=function(e,t){var a=this.sheetUrl.getRange(t,3,e.length);a.setBackgroundRGB(0,255,0).setValues(e)},this.solvedActualUrl=function(e,t,a){return a?void(0<this.counter&&(this.startPosition+50>this.totalCount&&this.solvedPack.splice(this.totalCount-this.startPosition+1),this.pushSolvedPack(this.solvedPack,this.startPosition),this.solvedPack=this.makeNewArray(50),this.startPosition=0,this.counter=0)):0==this.counter&&300<=e?void this.pushIndividualRecord(e,t):0<this.counter&&300<=e?(this.startPosition+50>this.totalCount&&this.solvedPack.splice(this.totalCount-this.startPosition+1),this.pushSolvedPack(this.solvedPack,this.startPosition),this.pushIndividualRecord(e,t),this.solvedPack=this.makeNewArray(50),this.startPosition=0,void(this.counter=0)):(0==this.counter&&(this.startPosition=t,this.solvedPack=this.makeNewArray(50)),t<this.startPosition?void this.pushIndividualRecord(e,t):50>this.counter&&300>e?(this.solvedPack[t-this.startPosition][0]=e,this.counter++,void(50==this.counter&&(this.pushSolvedPack(this.solvedPack,this.startPosition),this.solvedPack=this.makeNewArray(50),this.startPosition=0,this.counter=0))):void 0)},this.solvedActualUrlClose=function(){this.solvedActualUrl("","",!0)}},TestUrl=function(e){this.Root=e,this.Heap=new UrlHeap(this.Root.rFolder),this.Data=new Data4,this.Lib=new Inf(e,this.Data,this),this.sendIfOk=!0,this.isDeleted=!1,this.allowEmpty=!1,this.isPaused=!1,this.enabledReports={ads:!0,adsDeny:!0,keywords:!0,sitelinks:!0},this.start404Test=function(){if(this.setupParams(),this.Heap.loadHeapFile())this.Lib.loadConfig(this,"startForUser",this.Heap.isNonTested());else throw new Error("Nelze zalo\u017Eit soubor urlHeap (kl\xED\u010Dov\xE1 komponenta pro ukl\xE1d\xE1n\xED url)")},this.setupParams=function(){this.sendIfOk=!1,this.Root.rSetup.getSettingParam("t404email")&&(this.sendIfOk=!0),this.Lib.logEvent("Nastavena hodnota: t404Email na "+this.sendIfOk,"setupParams",!0),this.isDeleted=!1,this.Root.rSetup.getSettingParam("t404deleted")&&(this.isDeleted=!0),this.Lib.logEvent("Nastavena hodnota: t404deleted na "+this.isDeleted,"setupParams",!0),this.allowEmpty=!1,this.Root.rSetup.getSettingParam("t404empty")&&(this.allowEmpty=!0),this.Lib.logEvent("Nastavena hodnota: t404empty na "+this.allowEmpty,"setupParams",!0),this.isPaused=!1,this.Root.rSetup.getSettingParam("t404paused")&&(this.isPaused=!0),this.Lib.logEvent("Nastavena hodnota: t404paused na "+this.isPaused,"setupParams",!0),this.enabledReports.ads=!1,this.Root.rSetup.getSettingParam("t404ads")&&(this.enabledReports.ads=!0),this.enabledReports.adsDeny=!1,this.Root.rSetup.getSettingParam("t404adsDeny")&&(this.enabledReports.adsDeny=!0),this.enabledReports.sitelinks=!1,this.Root.rSetup.getSettingParam("t404sitelinks")&&(this.enabledReports.sitelinks=!0),this.enabledReports.keywords=!1,this.Root.rSetup.getSettingParam("t404keywords")&&(this.enabledReports.keywords=!0),this.Lib.logEvent("Nastaven\xE1 kontrola dle typu:"+JSON.stringify(this.enabledReports),"setupParams",!0)},this.startForUser=function(){if(this.Heap.isNonTested())this.Lib.logEvent("Zahajeni testov\xE1n\xED jednotliv\xFDch URL"),this.testUrl();else try{if(null==this.Data.getSession())throw"Nejsi prihlasen [system nema session]";if(this.Data.getNextUser())this.Lib.logEvent("Nacitani linku pro uzivatele:"+this.Data.getActualUser()),this.Data.creatHeap(),this.loadUrlForUserId();else{this.Root.rApi.sklikApi([{session:this.Data.getSession()}],"client.logout"),this.Heap.cleanHeap(),this.Lib.logEvent("Vkl\xE1d\xE1n\xED na\u010Dten\xFDch do souboru");for(var e=this.Data.getNextUrl();e;)this.Heap.addUrlToSheet(e.data.userId,e.data.url,e.types.toString(),e.locations.toString()),e=this.Data.getNextUrl();this.Heap.pushRemainUrlCache(),this.Heap.startNewTest(),this.Heap.isNonTested()&&this.startForUser()}}catch(t){return this.Lib.logEvent("Fat\xE1ln\xED chyba p\u0159i testech URL u u\u017Eivatele: ["+[this.Data.getActualUser()]+"] D\u016Fvod chyby:"+t.message+"["+t.fileName+"|"+t.lineNumber+"]"),!1}},this.testUrl=function(){var e=this.Heap.getNextUrl();return this.Heap.isNonTested()?void this.Lib.testUrlConnection(this,"testUrl",this,"solvedActualUrl",e,this.Heap.getActualUrl()):(this.Heap.solvedActualUrlClose(),this.Root.rLogger.addEvent("Test dokoncen"),void this.Heap.completeControl(this.Root.rSetup.getSettingParam("reportEmail"),this.sendIfOk))},this.solvedActualUrl=function(e,t){this.Heap.solvedActualUrl(e,t)},this.loadUrlForUserId=function(){try{this.enabledReports.ads&&(this.Lib.logEvent("Na\u010D\xEDt\xE1n\xED url z ADS","loadUrlForUserId",!0),this.adsCreateReport()),this.enabledReports.adsDeny&&(this.Lib.logEvent("Na\u010D\xEDt\xE1n\xED url z ADS Deny","loadUrlForUserId",!0),this.adsDenyCreateReport()),this.enabledReports.keywords&&(this.Lib.logEvent("Na\u010D\xEDt\xE1n\xED url z Keywords","loadUrlForUserId",!0),this.keywordsCreateReport()),this.enabledReports.sitelinks&&(this.Lib.logEvent("Na\u010D\xEDt\xE1n\xED url ze sitelink\u016F","loadUrlForUserId",!0),this.sitelinksCreateReport())}catch(t){return this.Lib.logEvent("Fatal error p\u0159i na\u010D\xEDt\xE1n\xED link\u016F: "+t.message+"["+t.fileName+"|"+t.lineNumber+"]"),!1}finally{return!0}},this.getCampaignRestriction=function(e){var t=this.Root.rSetup.getSettingParam("t404campaignsIds","array","int");return t&&0<t.length&&(e.campaign.ids=t),e},this.getStatusRestriction=function(e,t){var a=["active"];if(this.isPaused&&(a.push("suspend"),a.push("noactive")),"keywords"==t){var s=["active"];this.isPaused&&(s.push("active-noactive"),s.push("active-never"),s.push("active-disabled"),s.push("suspended")),e.mixedStatus=s}else if("sitelinks"==t){var o=["new","waiting","allow"];this.isPaused&&o.push("noactive"),e.status=o}else e.status=a;return"sitelinks"!=t&&(e.campaign.status=a,e.group.status=a),e},this.getStatConditions=function(e){return e.statisticsConditions=[{columnName:"clicks",operator:"GTE",intValue:0}],e},this.getDateConditions=function(e,t,a){var s=new Date;s.setUTCMonth(s.getUTCMonth()-1),s=s.toISOString(s,"GTM - 1","yyyy-MM-dd");var o=new Date;return o.setUTCDate(o.getUTCDate()-1),o=o.toISOString(o,"GTM - 1","yyyy-MM-dd"),e.dateFrom="month"==a?s:o,e.dateTo=o,e},this.getDeletedConditions=function(e,t){return this.isDeleted||(e.isDeleted=this.isDeleted,"sitelinks"!=t&&(e.campaign.isDeleted=this.isDeleted,e.group.isDeleted=this.isDeleted)),e},this.adsCreateReport=function(){var e=new Date;e.setUTCDate(e.getUTCDate()-1),e=e.toISOString(e,"GTM - 1","yyyy-MM-dd");var t={campaign:{},group:{}};if(t=this.getDeletedConditions(t,"ads"),t=this.getDateConditions(t,"ads","month"),t=this.getStatusRestriction(t,"ads"),t=this.getCampaignRestriction(t,"ads"),t=this.getStatConditions(t,"ads"),!this.Root.rApi.sklikApi([{session:this.Data.getSession(),userId:this.Data.getActualUser()},t],"ads.createReport",this,"adsReadReport"))return!0},this.adsReadReport=function(e,t){if(null==t)var s=e.totalCount,o=0,r=!0;else var s=t.totalCount,o=t.a+1;var l=e.reportId,n=Math.ceil(s/5e3);if(0<s-5e3*o&&this.Root.rApi.sklikApi([{session:this.Data.getSession(),userId:this.Data.getActualUser()},l,{offset:5e3*o,limit:5e3,allowEmptyStatistics:this.allowEmpty,displayColumns:["adType","clickthruUrl","finalUrl","clicks","totalMoney","group.id","campaign.id"]}],"ads.readReport",this,"adsReadReport",{totalCount:s,a:o}),null==e.totalCount)for(var d,p="",u={},g=0;g<e.report.length;g++)d=e.report[g],"eta"==d.adType?p=d.finalUrl:"text"==d.adType?p=d.clickthruUrl:"combined"==d.adType?p=d.finalUrl:this.Lib.logEvent("Na\u010Detla se reklama, kter\xE1 nen\xED ani eta, ani text. Jej\xED typ je:"+d.adType),u={url:p,clicks:d.stats[0].clicks,cost:d.stats[0].totalMoney/100,location:d.campaign.id+"-"+d.group.id,type:"ads",userId:this.Data.getActualUser()},this.Data.addUrlToHeap("ads",u);return r?(this.Data.setDoneInHeap("ads"),void this.loadedDone()):void 0},this.adsDenyCreateReport=function(){var e={adStatus:["deny","deny_invalid_url"],campaign:{},group:{}};if(e=this.getDeletedConditions(e,"ads4"),e=this.getDateConditions(e,"ads4","month"),e=this.getStatusRestriction(e,"ads4"),e=this.getCampaignRestriction(e,"ads4"),e=this.getStatConditions(e,"ads4"),!this.Root.rApi.sklikApi([{session:this.Data.getSession(),userId:this.Data.getActualUser()},e],"ads.createReport",this,"adsDenyReadReport"))return!0},this.adsDenyReadReport=function(e,t){if(null==t)var s=e.totalCount,o=0,r=!0;else var s=t.totalCount,o=t.a+1;var l=e.reportId,n=Math.ceil(s/5e3);if(0<s-5e3*o&&this.Root.rApi.sklikApi([{session:this.Data.getSession(),userId:this.Data.getActualUser()},l,{offset:5e3*o,limit:5e3,allowEmptyStatistics:this.allowEmpty,displayColumns:["adType","clickthruUrl","finalUrl","group.id","campaign.id","totalMoney","clicks"]}],"ads.readReport",this,"adsDenyReadReport",{totalCount:s,a:o}),null==e.totalCount)for(var d,p="",u={},g=0;g<e.report.length;g++)d=e.report[g],"eta"==d.adType?p=d.finalUrl:"text"==d.adType?p=d.clickthruUrl:"combined"==d.adType?p=d.finalUrl:this.Lib.addEvent("Na\u010Detla se reklama, kter\xE1 nen\xED ani eta, ani text. Jej\xED typ je:"+d.adType),u={url:p,clicks:d.stats[0].clicks,cost:d.stats[0].totalMoney/100,location:d.campaign.id+"-"+d.group.id,type:"ads",userId:this.Data.getActualUser()},this.Data.addUrlToHeap("adsDeny",u);r&&(this.Data.setDoneInHeap("adsDeny"),this.loadedDone())},this.keywordsCreateReport=function(){var e={urls:[{operator:"CONTAINS",value:"http"}],campaign:{},group:{}};if(e=this.getDeletedConditions(e,"keywords"),e=this.getDateConditions(e,"keywords","month"),e=this.getStatusRestriction(e,"keywords"),e=this.getCampaignRestriction(e,"keywords"),e=this.getStatConditions(e,"keywords"),!this.Root.rApi.sklikApi([{session:this.Data.getSession(),userId:this.Data.getActualUser()},e],"keywords.createReport",this,"keywordsReadReport"))return!0},this.keywordsReadReport=function(e,t){if(null==t)var s=e.totalCount,o=0,r=!0;else var s=t.totalCount,o=t.a+1;var l=e.reportId,n=Math.ceil(s/5e3);if(0<s-5e3*o&&this.Root.rApi.sklikApi([{session:this.Data.getSession(),userId:this.Data.getActualUser()},l,{offset:5e3*o,limit:5e3,allowEmptyStatistics:this.allowEmpty,displayColumns:["url","clicks","totalMoney","group.id","campaign.id"]}],"keywords.readReport",this,"keywordsReadReport",{totalCount:s,a:o}),null==e.totalCount)for(var d,p="",u={},g=0;g<e.report.length;g++)d=e.report[g],p=d.url,u={url:p,clicks:d.stats[0].clicks,cost:d.stats[0].totalMoney/100,location:d.campaign.id+"-"+d.group.id,type:"keywords",userId:this.Data.getActualUser()},this.Data.addUrlToHeap("keywords",u);return r?(this.Data.setDoneInHeap("keywords"),void this.loadedDone()):void 0},this.sitelinksCreateReport=function(){var e={campaign:{},group:{}};if(e=this.getDeletedConditions(e,"sitelinks"),e=this.getDateConditions(e,"sitelinks","month"),e=this.getStatusRestriction(e,"sitelinks"),e=this.getCampaignRestriction(e,"sitelinks"),e=this.getStatConditions(e,"sitelinks"),!this.Root.rApi.sklikApi([{session:this.Data.getSession(),userId:this.Data.getActualUser()},e],"sitelinks.createReport",this,"sitelinksReadReport"))return!0},this.sitelinksReadReport=function(e,t){if(null==t)var s=e.totalCount,o=0,r=!0;else var s=t.totalCount,o=t.a+1;var l=e.reportId,n=Math.ceil(s/5e3);if(0<s-5e3*o&&this.Root.rApi.sklikApi([{session:this.Data.getSession(),userId:this.Data.getActualUser()},l,{offset:5e3*o,limit:5e3,allowEmptyStatistics:this.allowEmpty,displayColumns:["url","clicks","totalMoney","id","group.id","campaign.id"]}],"sitelinks.readReport",this,"sitelinksReadReport",{totalCount:s,a:o}),null==e.totalCount)for(var d,p="",u={},g=0;g<e.report.length;g++){d=e.report[g],p=d.url;var c=d.id;null==d.campaign?null!=d.group&&(c+="-0"):c+="-"+d.group.id,null!=d.group&&(c+="-"+d.group.id),u={url:p,clicks:d.stats[0].clicks,cost:d.stats[0].totalMoney/100,location:c,type:"sitelinks",userId:this.Data.getActualUser()},this.Data.addUrlToHeap("sitelinks",u)}return r?(this.Data.setDoneInHeap("sitelinks"),void this.loadedDone()):void 0},this.loadedDone=function(){var e=!0,t=this.Data.getHeap().done;for(var a in this.Lib.logEvent(JSON.stringify(this.Data.getHeap().done),"testUrl"),t)this.enabledReports[a]&&!t[a]&&(e=!1);return!!e&&void this.startForUser()},this.getStartDate=function(){var e=this.Data.getActualDate();return e.toString()}},Root=function(){this.rFolder=new ApiFolder(""),this.rSetup=new FileOfSetup(""),this.rEmail=new ReportEmail(this.rSetup),this.rLogger=new ProblemLogger(this.rFolder,this.rSetup,this.rEmail),this.rApi=new APIConnection(this.rSetup,this.rLogger),this.loadEnv=function(){this.rFolder.loadFolder()||this.rFolder.createFolder(),this.rSetup.load(),this.rLogger.setup(),this.rEmail.setup()},this.startTest=function(){try{var e=new TestUrl(this);this.rLogger.newTest("Zah\xE1jen\xE1 dal\u0161\xED iterace scriptu : ["+e.getStartDate()+"]"),e.start404Test()}catch(e){this.rLogger.addEvent("Fat\xE1ln\xED chyba: "+e.message+"["+e.fileName+"|"+e.lineNumber+"]")}}};function main(){var e=new Root;return e.loadEnv(),e.startTest(),e}var Debug=!0;