function myFunction() {
    
  }
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
   * This script needs to save loaded queries to see what's new next time.
   * Class manage all actions associated with the SpreadSheet heap 
   * where are previously loaded queries saved.
   * @param {ApiFolder} rFolder 
   * @param {ProblemLogger} rLogger 
   */
  var Heap = function (rFolder, rLogger) {  
          /**
           * Name of SpreadSheet document on Drive.
           */
          const HEAP_NAME = 'queriesHeap';
      
          /**
          * @var {ProblemLogger}
          */
          this.logger = rLogger;
      
          /**
           * @var {ApiFolder}
           */
          this.folder = rFolder;
          
          /**
           * @var {File} - Loaded instance of heap document.
           */
          this.file;
  
          /**
           * @var {Spreadsheet} - Opened file as Spreadsheet.
           */
          this.spread;
  
          /**
           * In spreadsheet are sheets for each entity. 
           * Class work with only one current entity(sheet).
           * @var {Sheet}
           */
          this.sheet;
  
          /**
           * @var {String[]} - All avaliable queries from actual sheet.
           */
          this.queriesList = [];
  
          /**
           * @var {String[]} - New (not exists yet) query in sheet.
           */
          this.newQueries = [];
          
          /**
           * For new sheet automat will not send a email notification.
           * @var {Boolean} - Indicate if a sheet is a new (was added).
           */
          this.newSheet = false;
          
          /**
           * @var {Object[]} - Extended cache with new queries.
           */
          this.reportCache = {};
  
          /**
           * @var {String} - Actual sheet name and id of actual entity either.
           */
          this.actualEntity = false;
      
          /**
           * Loads file and open spreadsheet.
           */
          this.setup = function () {
              this.file = this.folder.loadFile(HEAP_NAME);
              if (!this.file) {
                  this.folder.createFile(HEAP_NAME, 'sheet');
              }
              this.file = this.folder.getFile(HEAP_NAME);
              this.spread = SpreadsheetApp.open(this.file);
          }
  
          /**
           * Setup new sheet (new entity).
           * @param {String} - Sheet name/Entity ID.
           */    
          this.setSheet = function (name) {
              this.actualEntity = name;
              this.newSheet = false;
              this.sheet = this.spread.getSheetByName(name);
              if (!this.sheet) {
                  this.sheet = this.spread.insertSheet(name);
                  this.newSheet = true;
              }
              this.sheet.activate();
          }
      
          /**
           * Load all queries saved in heap for actual sheet.
           */
          this.loadQueries = function () {
              this.queriesList = [];
              if (this.getSheetCount() > 0) {
                  var ldy = this.sheet.getSheetValues(1, 1, this.getSheetCount(), 1);
                  ldy.forEach(function (query, index, arr) {
                      return arr[index] = query[0];
                  });
                  this.queriesList = ldy;
              }
          }
      
          /**
           * Get number of rows for actual sheet load.
           * @return {Int}
           */
          this.getSheetCount = function () {
              return this.sheet.getLastRow();
          }
  
          /**
           * Compare every current single query with the heap and add new ones.
           * @param {Object}
           */
          this.isQuery = function (q) {
              if (this.newSheet) {
                  this.newQueries.push([q.query + q.keywordId]);
                  return false;
              } else {
                  if (this.queriesList.indexOf(q.query + q.keywordId) < 0) {
                      this.newQueries.push([q.query + q.keywordId]);
                      this.addQueryToReport(this.actualEntity, q);
                      return false;
                  }
              }
              return true;
          }
      
          /**
           * Save new queries into heap (generally at the end of the iteration above the actual sheet).
           */
          this.insertNewQueries = function () {
              if (this.newQueries.length > 0) {
                  var range = this.sheet.getRange(this.getSheetCount() + 1, 1, this.newQueries.length, 1);
                  range.setValues(this.newQueries);
                  this.newQueries = [];
              }
          }
      
          /**
           * Insert new query into the list that is intended as an email report.
           * @param {String} - sheet name/entity Id
           * @param {String} - query
           */
          this.addQueryToReport = function (id, query) {
              if (this.reportCache[id] == undefined) {
                  this.reportCache[id] = [];
              }
              this.reportCache[id].push(query);
          }
      
          /**
           * Get the new queries list.
           * @return {Object[]|Boolean}
           */
          this.getReport = function () {
              if (Object.keys(this.reportCache).length > 0) {
                  return this.reportCache;
              } else {
                  return false;
              }
          }
      }