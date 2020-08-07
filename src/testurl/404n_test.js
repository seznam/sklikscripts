/* 
Sklik connector for Google Data Studio
Copyright (C) 2018 Seznam.cz, a.s.

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.
This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA

Seznam.cz, a.s.
Radlická 3294/10, Praha 5, 15000, Czech Republic
http://www.seznam.cz, or contact: https://napoveda.sklik.cz/casto-kladene-dotazy/kontaktni-formular/
*/

/**
 * Test of validity URL. Main logics part manage processing of test
 * Parts: Load environment, loads URL, test URL, save results
 * @author Roman Stejskal
 * @version 1.0.0
 * @param {Root} RootClass
 */
var TestUrl = function (RootClass) {
  
    /**
     * @var {Root}
     */
    this.Root = RootClass;
  
    /**
     * @var {UrlHeap}
     */
    this.Heap = new UrlHeap(this.Root.rFolder);
  
    /**
     * @var {Data}
     */
    this.Data = new Data4();
  
    /**
     * @var {Inf}
     */
    this.Lib = new Inf(RootClass, this.Data, this);
  
    /**
    * @var {boolean} - send email although every url is ok
    */
    this.sendIfOk = true;
  
    /**
    * @var {boolean} - only deleted records
    */
    this.isDeleted = false;
  
    /**
    * @var {boolean} - include empty lines
    */
    this.allowEmpty = false;
  
    /**
    * @var {boolean} - include suspnded
    */
    this.isPaused = false;
  
    /**
     * @var {Object} - what type of url will be tested
     */
    this.enabledReports = {
      'ads': true,
      'adsDeny': true,
      'keywords': true,
      'sitelinks': true
    }
  
    /**
    * root function to start 404 test
    * @throws {Error} - when failed create of urlHeap
    */
    this.start404Test = function () {
      this.setupParams();
      if (this.Heap.loadHeapFile()) {
        this.Lib.loadConfig(this, 'startForUser', this.Heap.isNonTested());
      } else {
        throw new Error('Nelze založit soubor urlHeap (klíčová komponenta pro ukládání url)');
      }
    }
  
    /**
    * Setup variables from gSetting
    */
    this.setupParams = function () {
      this.sendIfOk = false;
      if (this.Root.rSetup.getSettingParam('t404email')) {
        this.sendIfOk = true;
      }
      this.Lib.logEvent('Nastavena hodnota: t404Email na ' + this.sendIfOk, 'setupParams', true);
  
      this.isDeleted = false;
      if (this.Root.rSetup.getSettingParam('t404deleted')) {
        this.isDeleted = true;
      }
      this.Lib.logEvent('Nastavena hodnota: t404deleted na ' + this.isDeleted, 'setupParams', true);
  
      this.allowEmpty = false;
      if (this.Root.rSetup.getSettingParam('t404empty')) {
        this.allowEmpty = true;
      }
      this.Lib.logEvent('Nastavena hodnota: t404empty na ' + this.allowEmpty, 'setupParams', true);
  
      this.isPaused = false;
      if (this.Root.rSetup.getSettingParam('t404paused')) {
        this.isPaused = true;
      }
      this.Lib.logEvent('Nastavena hodnota: t404paused na ' + this.isPaused, 'setupParams', true);
  
      this.enabledReports.ads = false;
      if (this.Root.rSetup.getSettingParam('t404ads')) {
        this.enabledReports.ads = true;
      }
  
      this.enabledReports.adsDeny = false;
      if (this.Root.rSetup.getSettingParam('t404adsDeny')) {
        this.enabledReports.adsDeny = true;
      }
  
      this.enabledReports.sitelinks = false;
      if (this.Root.rSetup.getSettingParam('t404sitelinks')) {
        this.enabledReports.sitelinks = true;
      }
  
      this.enabledReports.keywords = false;
      if (this.Root.rSetup.getSettingParam('t404keywords')) {
        this.enabledReports.keywords = true;
      }
      this.Lib.logEvent('Nastavená kontrola dle typu:' + JSON.stringify(this.enabledReports), 'setupParams', true);
    }
  
    /**
    * Make all test for one user (start testing function)
    * Processing all task about first user, then go to other user
    */
    this.startForUser = function () {
      //Pokud jsou neotestovane URL tak je zacnu testovat
      if (this.Heap.isNonTested()) {
        this.Lib.logEvent('Zahajeni testování jednotlivých URL');
        this.testUrl();
      } else {
        try {
          if (this.Data.getSession() == undefined) {
            throw 'Nejsi prihlasen [system nema session]';
          }
          if (this.Data.getNextUser()) {
            this.Lib.logEvent('Nacitani linku pro uzivatele:' + this.Data.getActualUser());
            this.Data.creatHeap();
            this.loadUrlForUserId();
          } else {
            this.Root.rApi.sklikApi([{ session: this.Data.getSession() }], 'client.logout');
            this.Heap.cleanHeap();
            this.Lib.logEvent('Vkládání načtených do souboru');
            var url = this.Data.getNextUrl();
            while (url) {
              this.Heap.addUrlToSheet(url.data.userId, url.data.url, url.types.toString(), url.locations.toString());
              url = this.Data.getNextUrl();
            }
            this.Heap.pushRemainUrlCache();
            this.Heap.startNewTest();
            if (this.Heap.isNonTested()) {
              this.startForUser();
            }
          }
        } catch (e) {
          this.Lib.logEvent('Fatální chyba při testech URL u uživatele: [' +
            [this.Data.getActualUser()] + '] Důvod chyby:' + e.message + '[' + e.fileName + '|' + e.lineNumber + ']'
          );
          return false;
        }
      }
  
    }
  
    /**
     * Start testing url
     */
    this.testUrl = function () {
      var nextUrlPosition = this.Heap.getNextUrl();
      if (this.Heap.isNonTested()) {
        this.Lib.testUrlConnection(this, 'testUrl', this, 'solvedActualUrl', nextUrlPosition, this.Heap.getActualUrl());
      } else {
        this.Heap.solvedActualUrlClose();
        this.Root.rLogger.addEvent('Test dokoncen');
        this.Heap.completeControl(this.Root.rSetup.getSettingParam('reportEmail'), this.sendIfOk);
        return;
      }
    }
  
    /**
     * Mark url as tested
     * @param {int} stat - HTTP status of tested url 
     * @param {int} urlPosition - position of url in heap or file
     */
    this.solvedActualUrl = function (stat, urlPosition) {
      this.Heap.solvedActualUrl(stat, urlPosition);
    }
  
    /**
    * Start load all method with url lists (process need things about one userId)
    * @param {Data} Data
    * @param {Inf} Inf
    * @return {boolean}
    */
    this.loadUrlForUserId = function () {
      try {
        if (this.enabledReports.ads) {
          this.Lib.logEvent('Načítání url z ADS', 'loadUrlForUserId', true);
          this.adsCreateReport();
        }
        if (this.enabledReports.adsDeny) {
          this.Lib.logEvent('Načítání url z ADS Deny', 'loadUrlForUserId', true);
          this.adsDenyCreateReport();
        }
        if (this.enabledReports.keywords) {
          this.Lib.logEvent('Načítání url z Keywords', 'loadUrlForUserId', true);
          this.keywordsCreateReport();
        }
        if (this.enabledReports.sitelinks) {
          this.Lib.logEvent('Načítání url ze sitelinků', 'loadUrlForUserId', true);
          this.sitelinksCreateReport();
        }
      } catch (e) {
        this.Lib.logEvent('Fatal error při načítání linků: ' + e.message + '[' + e.fileName + '|' + e.lineNumber + ']');
        return false;
      } finally {
        return true;
      }
    }
  
    /**
    * Setup condition for createReport
    * User is able to load url only for exact list of campaigns
    * @param {Object} restriction - list of restriction 
    * @param {string} type - for what createReport ask restriction
    * @return {Object}
    */
    this.getCampaignRestriction = function (restriction, type) {
      var paramCID = this.Root.rSetup.getSettingParam('t404campaignsIds', 'array', 'int');
      if (paramCID && paramCID.length > 0) {
        restriction.campaign.ids = paramCID;
      }
      return restriction;
    }
  
    /**
     * Setup condition for createReport
     * Setup actual status of items
     * @param {Object} restriction - list of restriction 
     * @param {string} type - for what createReport ask restriction
     * @return {Object}
     */
    this.getStatusRestriction = function (restriction, type) {
      var status = ['active'];
      if (this.isPaused) {
        status.push('suspend');
        status.push('noactive');
      }
      if (type == 'keywords') {
  
        var statusK = ['active'];
        if (this.isPaused) {
          statusK.push('active-noactive');
          statusK.push('active-never');
          statusK.push('active-disabled');
          statusK.push('suspended');
        }
  
        restriction.mixedStatus = statusK;
      } else if (type == 'sitelinks') {
        var statusS = ['new', 'waiting', 'allow'];
        if (this.isPaused) {
          statusS.push('noactive');
        }
        restriction.status = statusS;
      } else {
        restriction.status = status;
      }
      if (type != 'sitelinks') {
        restriction.campaign.status = status;
        restriction.group.status = status;
      }
      return restriction;
    }
  
    /**
     * Setup condition for createReport
     * Can be add statisticsConditions
     * @param {Object} restriction - list of restriction 
     * @param {string} type - for what createReport ask restriction
     * @return {Object}
     */
    this.getStatConditions = function (restriction, type) {
      //Pro statisticky prehled
      restriction.statisticsConditions = [{
        'columnName': 'clicks',
        'operator': 'GTE',
        'intValue': 0
      }];
      return restriction;
    }
  
    /**
     * Setup condition for createReport
     * Setup date interval
     * @param {Object} restriction - list of restriction 
     * @param {string} type - for what createReport ask restriction
     * @return {Object}
     */
    this.getDateConditions = function (restriction, type, period) {
      var monthAgo = new Date();
      monthAgo.setUTCMonth(monthAgo.getUTCMonth() - 1);
      monthAgo = monthAgo.toISOString(monthAgo, "GTM - 1", 'yyyy-MM-dd');
  
      var yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      yesterday = yesterday.toISOString(yesterday, "GTM - 1", 'yyyy-MM-dd');
  
      if (period == 'month') {
        restriction.dateFrom = monthAgo;
      } else {
        restriction.dateFrom = yesterday;
      }
      restriction.dateTo = yesterday;
      return restriction;
    }
  
    /**
     * Setup condition for createReport
     * If need to include deleted items
     * @param {Object} restriction - list of restriction 
     * @param {string} type - for what createReport ask restriction
     * @return {Object}
     */
    this.getDeletedConditions = function (restriction, type) {
      if (!this.isDeleted) {
        restriction.isDeleted = this.isDeleted;
        if (type != 'sitelinks') {
          restriction.campaign.isDeleted = this.isDeleted;
          restriction.group.isDeleted = this.isDeleted;
        }
      }
      return restriction;
    }
  
    this.adsCreateReport = function () {
      var yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      yesterday = yesterday.toISOString(yesterday, "GTM - 1", 'yyyy-MM-dd');
  
      var restriction = {
        'campaign': {},
        'group': {}
      };
      restriction = this.getDeletedConditions(restriction, 'ads');
      restriction = this.getDateConditions(restriction, 'ads', 'month');
      restriction = this.getStatusRestriction(restriction, 'ads');
      restriction = this.getCampaignRestriction(restriction, 'ads');
      restriction = this.getStatConditions(restriction, 'ads');
  
      //Sklik ads
      if (!this.Root.rApi.sklikApi([{ 'session': this.Data.getSession(), 'userId': this.Data.getActualUser() },
        restriction
      ],
        'ads.createReport',
        this,
        'adsReadReport'
      )) {
        return true;
      }
    }
  
    this.adsReadReport = function (response, param) {
      if (param == undefined) {
        var totalCount = response.totalCount;
        var a = 0;
        var root = true;
      } else {
        var totalCount = param.totalCount;
        var a = param.a + 1;
      }
      var report_id = response.reportId;
      var offset = Math.ceil(totalCount / 5000);
  
      if ((totalCount - a * 5000) > 0) {
        this.Root.rApi.sklikApi([{ 'session': this.Data.getSession(), 'userId': this.Data.getActualUser() },
          report_id,
        {
          'offset': a * 5000,
          'limit': 5000,
          'allowEmptyStatistics': this.allowEmpty,
          'displayColumns': ['adType', 'clickthruUrl', 'finalUrl', 'clicks', 'totalMoney', 'group.id', 'campaign.id']
        }],
          'ads.readReport',
          this,
          'adsReadReport',
          {
            totalCount: totalCount,
            a: a
          }
        );
      }
  
      //Data without totalCount is actual data of adsReadReport
      if (response.totalCount == undefined) {
        var url = '';
        var urlData = {};
        for (var i = 0; i < response.report.length; i++) {
          var report = response.report[i];
          if (report.adType == 'eta') {
            url = report.finalUrl;
          } else if (report.adType == 'text') {
            url = report.clickthruUrl;
          } else if (report.adType == 'combined') {
            url = report.finalUrl; 
          } else {  
            this.Lib.logEvent('Načetla se reklama, která není ani eta, ani text. Její typ je:' + report.adType);
          }
          //url = url.substr(0, (url.toLowerCase().indexOf("utm") >= 0) ? url.toLowerCase().indexOf("utm") - 1 : url.length);
          urlData = {
            url: url,
            clicks: report.stats[0].clicks,
            cost: report.stats[0].totalMoney / 100,
            location: report.campaign.id+'-'+report.group.id,
            type: 'ads',
            userId: this.Data.getActualUser()
          };
          this.Data.addUrlToHeap('ads', urlData);
        }
      }
      //When Ill be back in heigher cycle of recurency - root 
      if (root) {
        this.Data.setDoneInHeap('ads');
        this.loadedDone();
        return;
      }
    }
  
    this.adsDenyCreateReport = function (Data, Lib) {
  
      var restriction = {
        'adStatus': ['deny', 'deny_invalid_url'],
        'campaign': {},
        'group': {}
      };
  
      restriction = this.getDeletedConditions(restriction, 'ads4');
      restriction = this.getDateConditions(restriction, 'ads4', 'month');
      restriction = this.getStatusRestriction(restriction, 'ads4');
      restriction = this.getCampaignRestriction(restriction, 'ads4');
      restriction = this.getStatConditions(restriction, 'ads4');
  
  
      if (!this.Root.rApi.sklikApi([{ 'session': this.Data.getSession(), 'userId': this.Data.getActualUser() },
        restriction
      ],
        'ads.createReport',
        this,
        'adsDenyReadReport'
      )) {
  
        return true;
      }
    }
  
    this.adsDenyReadReport = function (response, param) {
      if (param == undefined) {
        var totalCount = response.totalCount;
        var a = 0;
        var root = true;
      } else {
        var totalCount = param.totalCount;
        var a = param.a + 1;
      }
      var report_id = response.reportId;
      var offset = Math.ceil(totalCount / 5000);
  
      if ((totalCount - a * 5000) > 0) {
        this.Root.rApi.sklikApi([{ 'session': this.Data.getSession(), 'userId': this.Data.getActualUser() },
          report_id,
        {
          'offset': a * 5000,
          'limit': 5000,
          'allowEmptyStatistics': this.allowEmpty,
          'displayColumns': ['adType', 'clickthruUrl', 'finalUrl', 'group.id', 'campaign.id', 'totalMoney', 'clicks']
        }],
          'ads.readReport',
          this,
          'adsDenyReadReport',
          {
            totalCount: totalCount,
            a: a
          }
        );
      }
      if (response.totalCount == undefined) {
        var url = '';
        var urlData = {};
        for (var i = 0; i < response.report.length; i++) {
          var report = response.report[i];
          if (report.adType == 'eta') {
            url = report.finalUrl;
          } else if (report.adType == 'text') {
            url = report.clickthruUrl;
          } else if (report.adType == 'combined') {
            url = report.finalUrl; 
          } else {
            this.Lib.addEvent('Načetla se reklama, která není ani eta, ani text. Její typ je:' + report.adType);
          }
          //url = url.substr(0, (url.toLowerCase().indexOf("utm") >= 0) ? url.toLowerCase().indexOf("utm") - 1 : url.length);
          urlData = {
            url: url,
            clicks: report.stats[0].clicks,
            cost: report.stats[0].totalMoney / 100,
            location: report.campaign.id+'-'+report.group.id,
            type: 'ads',
            userId: this.Data.getActualUser()
          };
          this.Data.addUrlToHeap('adsDeny', urlData);
        }
      }
      //When Ill be back in heigher cycle of recurency - root 
      if (root) {
        this.Data.setDoneInHeap('adsDeny');
        this.loadedDone();
      }
    }
  
    this.keywordsCreateReport = function () {
  
      var restriction = {
        'urls': [{ 'operator': 'CONTAINS', 'value': 'http' }],
        'campaign': {},
        'group': {}
      };
      restriction = this.getDeletedConditions(restriction, 'keywords');
      restriction = this.getDateConditions(restriction, 'keywords', 'month');
      restriction = this.getStatusRestriction(restriction, 'keywords');
      restriction = this.getCampaignRestriction(restriction, 'keywords');
      restriction = this.getStatConditions(restriction, 'keywords');
  
      if (!this.Root.rApi.sklikApi([{ 'session': this.Data.getSession(), 'userId': this.Data.getActualUser() },
        restriction
      ],
        'keywords.createReport',
        this,
        'keywordsReadReport'
      )) {
        return true;
      }
    }
  
    this.keywordsReadReport = function (response, param) {
      if (param == undefined) {
        var totalCount = response.totalCount;
        var a = 0;
        var root = true;
      } else {
        var totalCount = param.totalCount;
        var a = param.a + 1;
      }
      var report_id = response.reportId;
      var offset = Math.ceil(totalCount / 5000);
  
      if ((totalCount - a * 5000) > 0) {
        this.Root.rApi.sklikApi([{ 'session': this.Data.getSession(), 'userId': this.Data.getActualUser() },
          report_id,
        {
          'offset': a * 5000,
          'limit': 5000,
          'allowEmptyStatistics': this.allowEmpty,
          'displayColumns': ['url', 'clicks', 'totalMoney', 'group.id', 'campaign.id']
        }],
          'keywords.readReport',
          this,
          'keywordsReadReport',
          {
            totalCount: totalCount,
            a: a
          }
        );
      }
  
      //Data without totalCount is actual data of adsReadReport
      if (response.totalCount == undefined) {
        var url = '';
        var urlData = {};
        for (var i = 0; i < response.report.length; i++) {
          var report = response.report[i];
          url = report.url;
          //url = url.substr(0, (url.toLowerCase().indexOf("utm") >= 0) ? url.toLowerCase().indexOf("utm") - 1 : url.length);
          urlData = {
            url: url,
            clicks: report.stats[0].clicks,
            cost: report.stats[0].totalMoney / 100,
            location: report.campaign.id+'-'+report.group.id,
            type: 'keywords',
            userId: this.Data.getActualUser()
          };
          this.Data.addUrlToHeap('keywords', urlData);
        }
      }
  
      //When Ill be back in heigher cycle of recurency - root 
      if (root) {
        this.Data.setDoneInHeap('keywords');
        this.loadedDone();
        return;
      }
    }
  
    this.sitelinksCreateReport = function () {
  
      var restriction = {
        'campaign': {},
        'group': {}
      };
      restriction = this.getDeletedConditions(restriction, 'sitelinks');
      restriction = this.getDateConditions(restriction, 'sitelinks', 'month');
      restriction = this.getStatusRestriction(restriction, 'sitelinks');
      restriction = this.getCampaignRestriction(restriction, 'sitelinks');      
      restriction = this.getStatConditions(restriction, 'sitelinks');
  
      if (!this.Root.rApi.sklikApi([{ 'session': this.Data.getSession(), 'userId': this.Data.getActualUser() },
        restriction
      ],
        'sitelinks.createReport',
        this,
        'sitelinksReadReport'
      )) {
  
        return true;
      }
    }
  
    this.sitelinksReadReport = function (response, param) {
      if (param == undefined) {
        var totalCount = response.totalCount;
        var a = 0;
        var root = true;
      } else {
        var totalCount = param.totalCount;
        var a = param.a + 1;        
      }
      var report_id = response.reportId;
      var offset = Math.ceil(totalCount / 5000);
  
      if ((totalCount - a * 5000) > 0) {
        this.Root.rApi.sklikApi([{ 'session': this.Data.getSession(), 'userId': this.Data.getActualUser() },
          report_id,
        {
          'offset': a * 5000,
          'limit': 5000,
          'allowEmptyStatistics': this.allowEmpty,
          'displayColumns': ['url', 'clicks', 'totalMoney', 'id', 'group.id', 'campaign.id']
        }],
          'sitelinks.readReport',
          this,
          'sitelinksReadReport',
          {
            totalCount: totalCount,
            a: a
          }
        );
      }
  
      //Data without totalCount is actual data of adsReadReport
      if (response.totalCount == undefined) {
        var url = '';
        var urlData = {};
        for (var i = 0; i < response.report.length; i++) {
          var report = response.report[i];
          url = report.url;
          //url = url.substr(0, (url.toLowerCase().indexOf("utm") >= 0) ? url.toLowerCase().indexOf("utm") - 1 : url.length);
          var loc = report.id;          
          if (report.campaign != undefined) {
            loc +='-'+report.group.id;
          } else if(report.group != undefined){
            loc +='-'+0;
          }
          if (report.group != undefined) {
            loc +='-'+report.group.id;
          }          
          urlData = {
            url: url,
            clicks: report.stats[0].clicks,
            cost: report.stats[0].totalMoney / 100,
            location: loc,
            type: 'sitelinks',
            userId: this.Data.getActualUser()
          };
          this.Data.addUrlToHeap('sitelinks', urlData);
        }
      }
  
      //When Ill be back in heigher cycle of recurency - root 
      if (root) {
        this.Data.setDoneInHeap('sitelinks');
        this.loadedDone();
        return;
      }
    }
  
    /**
    * Start testing urls
    * - make one line of urls (include params) and send it to testing cycle
    * @return {void|boolean}
    */
    this.loadedDone = function () {
      var ready = true;
      var objt = this.Data.getHeap().done;
      this.Lib.logEvent(JSON.stringify(this.Data.getHeap().done), 'testUrl');
      for (var key in objt) {
        if (this.enabledReports[key] && !objt[key]) {
          ready = false;
        }
      }
      if (ready) {
        this.startForUser();
      } else {
        return false;
      }
    }
  
    /**
     * Need notice, when script start
     * @return {string}
     */
    this.getStartDate = function () {
      var date = this.Data.getActualDate();
      return date.toString();
    }
  
  }