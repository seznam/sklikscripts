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
 * Control class. Load new queries from API, comparing, sending email.
 * @param {FileOfSetup} rSetup
 * @param {ProblemLogger} rLogger
 * @param {APIConnection} rApi 
 * @param {Heap} rHeap 
 * @param {ReportEmail} rEmail
 */
var Queries = function (rSetup, rLogger, rApi, rHeap, rEmail) {
    /**
     * @var {FileOfSetup}
     */
    this.setupFile = rSetup;

    /**
     * @var {ProblemLogger}
     */
    this.logger = rLogger;

    /**
     * @var {ReportEmail}
     */
    this.email = rEmail;

    /**
     * @var {Heap}
     */
    this.heap = rHeap;

    /**
     * @var {APIConnection}
     */
    this.api = rApi;

    /**
     * Type of entity chosen by user.
     * @var {String|Boolean} - ENUM [user, campaign, group, keyword]
     */
    this.entityFilter = false;

    /**
     * Entity restriction by user setting (list of enabled IDs).
     * @var {Int[]}
     */
    this.entityList = [];

    /**
     * @var {Object[]} - Loaded all actual queries.
     */    
    this.cache = {};

    /**
     * @var {Object} - Technical translate for email report.
     */
    this.translate = { 'campaign': 'Kampaň', 'group': 'Sestavu', 'keyword': 'Klíčové slovo' }

    /**
    * Entity list loader. 
    * If don't want check all account, then have to load a entity list (keyword, group, campaign). 
    * We able to use only one entity type.    
    */
    this.loadEntityList = function () {
        this.entityFilter = this.setupFile.getSettingParam('queryEntity');
        this.entityList = this.setupFile.getSettingParam('queryEntityList','array');
    }

    /**
     * Get userId from seting.
     * @return {Int}
     */
    this.getUserId = function () {
        var userId = this.setupFile.getSettingParam('queryUserId');
        if (!userId) {
            this.logger.addError('Nelze nacist id uzivatele [Queries.getUserId]');
            die;
        }
        return userId;
    }

    /**
     * Setup entity restriction into createReport call
     * @param {Object} restriction
     * @return {Object}
     */
    this.entityFilter = function (restriction) {
        this.loadEntityList();
        if (this.entityFilter != 'user' && this.entityList != '|') {
            restriction[this.entityFilter] = { 'ids': this.entityList };
        } else if (this.entityFilter == 'user') {
            this.entityFilter = 'campaign';
        }
        return restriction;
    }

    /**
     * Setup date restrition into createReport call.
     * @var {Object} restriction
     * @return {Object}
     */
    this.dateRange = function (restriction) {
        var today = new Date();
        var from = new Date('2010-01-01');
        restriction.dateTo = today.toISOString(today, 'yyyy-MM-dd');
        restriction.dateFrom = from.toISOString(from, 'yyyy-MM-dd');
        return restriction;
    }

    /**
     * Setup quality restrition into createReport call.
     * Quality - filter over queries set.
     * @param {Object} restriction
     * @return {Object}
     */
    this.qualityRestriction = function (restriction) {
        var cond = [];
        var condList = {
            'impressions': this.setupFile.getSettingParam('impCount'),
            'clicks': this.setupFile.getSettingParam('clickCount'),
            'conversions': this.setupFile.getSettingParam('convCount'),
        };
        for (var entityName in condList) {
            if (condList[entityName] > 0) {
                cond.push({
                    'columnName': entityName,
                    'operator': 'GT',
                    'intValue': condList[entityName]
                });
            }
        }
        //Just for statistic overveiw
        cond.push({ 'columnName': 'transactions', 'operator': 'GTE', "intValue":0 });
        restriction.statisticsConditions = cond;
        return restriction;
    }

    /**
     * Gather restriction and call API createReport method
     */
    this.createReport = function () {

        var restriction = {};

        restriction = this.entityFilter(restriction);
        restriction = this.dateRange(restriction);
        restriction = this.qualityRestriction(restriction);

        //parameters, method, cbClass, cbMethod, param
        this.api.sklikApi(
            [{ 'session': this.api.getSession(), 'userId': this.getUserId() },
                restriction,
            { "statGranularity": 'total' }],
            'queries.createReport',
            this,
            'readReport'
        );
    }

    /**
     * Read report (recursive). Load all new queries from database.
     * @param {Object} - response previous query
     * @param {Object} - params which previous query want to forward to this one.
     */
    this.readReport = function (response, param) {
        if (param == undefined) {
            var totalCount = response.totalCount;
            var i = 0;          
            var root = true;
        } else {
            var totalCount = param.totalCount;
            var i = param.i + 1;
        }
        if ((totalCount - i * 5000) > 0) {
            this.api.sklikApi([{ 'session': this.api.getSession(), 'userId': this.getUserId() },
            response.reportId,
            {
                'offset': i * 5000,
                'limit': 5000,
                'allowEmptyStatistics': false,
                'displayColumns': ['query', 'impressions', 'clicks', 'group.id', 'campaign.id', 'keyword.id', 'keyword.name']
            }],
                'queries.readReport',
                this,
                'readReport',
                {
                    totalCount: totalCount,
                    i: i
                }
            );
        }

        //Data without totalCount is actual data of adsReadReport
        if (response.totalCount == undefined) {
            var report = response.report;
            for (var j = 0; j < report.length; j++) {
                var id = report[j][this.entityFilter].id;
                if (this.cache[id] == undefined) {
                    this.cache[id] = [];
                }
                this.cache[id].push({
                    'query': report[j].query,
                    'keywordId': report[j].keyword.id,
                    'keywordName': report[j].keyword.name,
                    'campaignId': report[j].campaign.id,
                    'groupId': report[j].group.id
                });
            }
        }
        //When Ill be back in heigher cycle of recurency - root 
        if (root) {
            this.checkQueries();
        }
    }

    /**
     * Chceck all queries after loaded it.
     */
    this.checkQueries = function () {
        for (var id in this.cache) {
            this.heap.setSheet(id);
            if (this.cache[id].length > this.heap.getSheetCount()) {
                this.heap.loadQueries();
                for (var j = 0; j < this.cache[id].length; j++) {
                    this.heap.isQuery(this.cache[id][j]);
                }
                this.heap.insertNewQueries();
            }
        }
        this.sendReport();
    }

    /**
     * Setup email message and push it.
     */
    this.sendReport = function () {
        var newQueries = this.heap.getReport();
        if (newQueries) {
            var tpl = HtmlService.createTemplateFromFile('Report');
            tpl.newQueries = this.heap.getReport();
            tpl.entityType = this.translate[this.entityFilter];
            this.email.sendMessage('Sklik Script: Nové vyhledávací dotazy', '', false, tpl);
        }
    }
}