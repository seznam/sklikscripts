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
* Class for test of URL
* If we are not able to finish all test in one session, 
* need different what we already tested in some previous sessions and start from this point.
* This class saved loaded URL to heap, and keep information about tested urls
* 
* Tato třída slouží jako mezivrstava mezi SpreadSheetem a scriptem testovací URL
* Má tři logické celky
* I. Umí uložit získané URL do Sheetu (kvůli optimalizaci rychlosti se to cachuje a vkládá po balíku)
* II. Načítá se Sheetu neotestované url (Načítá url do cache)
* III. Otestované statusy uloží zpět do souboru k URL (opět přes cache) 
* 
* @author Roman Stejskal
* @version 1.0.0
* @param {SklikAPI.ApiFolder} folderClass  
*/
var UrlHeap = function (folderClass) {
  // ############# Load file 
  /**
  * @var {File} - heap file
  */
  this.file;
  
  /**
  * @var {SklikAPI.ApiFolder}
  */
  this.rFolder = folderClass;
  
  /**
  * @var {Sheet}
  */
  this.sheetUrl;
  
  
  /**
  * How many urls are in document (without difference what have test)
  * @param {int}
  */
  this.totalCount;
  
  /**
  * Make complete new url set for testing
  */
  this.cleanHeap = function () {
    this.sheetUrl.clear();
  }
  
  /**
  * Urls are saved in sheet. Need load it all information about it
  * @return {boolean}
  */
  this.loadHeapFile = function () {
    if (!this.rFolder.loadFile('urlHeap')) {
      if (!this.rFolder.createFile('urlHeap', 'sheet')) {
        return false;
      }
      this.file = this.rFolder.getFile('urlHeap');
      this.setupSheet(this.file);
    } else {
      this.file = this.rFolder.getFile('urlHeap');
      this.loadSheet(this.file);
    }
    if (!this.sheetUrl) {
      return false;
    }
    this.totalCount = this.sheetUrl.getLastRow();
    this.actualPosition = this.findLastTested();
    return true;
  }
  
  /**
  * Load Sheet with urls
  * @type {File}
  * @return {boolean}
  */
  this.loadSheet = function (file) {
    if (!file) {
      return false;
    }
    var spreadSheet = SpreadsheetApp.open(file);
    this.sheetUrl = spreadSheet.getSheetByName('urls');
    return (this.sheetUrl);
  }
  
  /**
  * Create new sheet called urls
  * @type {File} 
  * @return {boolean}
  */
  this.setupSheet = function (file) {
    if (!file) {
      return false;
    }
    var spreadSheet = SpreadsheetApp.open(file);
    var sheets = spreadSheet.getSheets();
    if (sheets[0].getName() != 'urls') {
      sheets[0].setName('urls');
    }
    this.sheetUrl = sheets[0];
    this.sheetUrl.setColumnWidth(2, URL_COLUMN_WIDTH);
  }
  
  // ############# I. save loaded url to sheet
  
  /** 
  * @var {Object[]} - cache for insert url to sheet
  */
  this.insertUrlCache = [];
  
  /**
  * Insert loaded url to cache
  * @param {int} userId - if of user
  * @param {string} url - tested url
  * @param {string} types - (type of source url in account - sitelinks etc)
  * @param {string} groups - list of groups where url is 
  */
  this.addUrlToSheet = function (userId, url, types, groups) {
    this.insertUrlCache.push([userId, url, 0, types, groups]);
    if (this.insertUrlCache.length >= 500) {
      this.processUrlToSheet(this.insertUrlCache);
    }
  }
  
  /**
  * Insert package with loaded url to file
  * Access to file is slow, urls will insert in package
  * @param {Object[]} lines - Array of object with url info  
  */
  this.processUrlToSheet = function (lines) {
    var lstLine = this.sheetUrl.getLastRow();
    if (lstLine == 0) {
      lstLine++;
      this.sheetUrl.insertRows(1, lines.length);
    } else {
      this.sheetUrl.insertRowsAfter(lstLine + 1, lines.length);
    }
    SpreadsheetApp.flush();
    var range = this.sheetUrl.getRange(lstLine, 1, lines.length, lines[0].length);
    range.setValues(lines);
  }
  
  /**
  * Is pushed cache with urls to file after reached 500 url. 
  * If finish pushing urls to cache, and cache is under 500, need push forced manually to heap - this way
  */
  this.pushRemainUrlCache = function () {
    if (this.insertUrlCache.length > 0) {
      this.processUrlToSheet(this.insertUrlCache);
    }
  }
  
  // ############# II. load non tested url from sheet
  
  /**
  * @var {int} - setup how many urls load from file to cache
  */
  const LOAD_URL_LIMIT = 200;
  
  /**
  * @var {int} - Actual position in document (row of actual loaded url)
  * -1 mean: no url to tested (finish or empty)
  */
  this.actualPosition = -1;
  
  /**
  * @var {string} - actual loaded url to testing
  */
  this.actualUrl;
  
  /**
  * @var {int} - After control url, keep information if found result diferent then 200
  */
  this.haveErrors = 0;
  
  /**
  * @var {Array[][]} - cache for loaded urls from file
  */
  this.urlCache = {};
  
  /**
  * @var {int} - last start row position of loading file to cache
  */
  this.urlCacheFrom;
  
  /**
  * We assume that not all links are tested. So need position of last tested (only if it isn't last one)
  * @return {int}
  */
  this.findLastTested = function () {
    var lastRow = this.sheetUrl.getLastRow();
    if (lastRow <= 0) {
      return -1;
    }
    var startRow = 1;
    var actualRow = Math.min(10000, lastRow);
    do {
      if (this.sheetUrl.getLastRow() > 0) {
        var range = this.sheetUrl.getRange(startRow, 3, actualRow);
        var values = range.getValues();
        
        for (var i = 0; i < values.length; i++) {
          if (values[i][0] != 200) {
            if (values[i][0] == 0) {
              return i;
            } else {
              this.haveErrors++;
            }
          }
        }
      }
      startRow = actualRow;
      if (actualRow >= lastRow) {
        break;
      }
      actualRow = Math.min(actualRow + 10000, lastRow);
    } while (actualRow < lastRow);
    //If have no tested URL -> reset counter, because it start from new
    this.haveErrors = 0;
    return -1;
  }
  
  /**
  * Get first non tested url (actual in heap)
  * @return {string}
  */
  this.getActualUrl = function () {
    return this.actualUrl;
  }
  
  /**
  * Need next url for test
  * @return {int|boolen}
  */
  this.getNextUrl = function () {
    if (this.isNonTested()) {
      this.actualPosition++;
      if (this.actualPosition > this.totalCount) {
        this.actualPosition = -1;
        return this.actualPosition;
      }
      var val = this.getUrlFromCache(this.actualPosition);
      if (!val) {
        this.actualPosition = -1;
        return false;
      }
      this.actualUrl = val;
      return this.actualPosition;
    } else {
      return this.actualPosition;
    }
  }
  
  /**
  * Return next url from cache
  * @param {int} from - relative position in cache (0 means first url in cache)
  * @param {boolean} reload - try load from cache for second time
  */
  this.getUrlFromCache = function (from, reload) {
    var url;
    var pos = from - this.urlCacheFrom;
    if (this.urlCache.length > 0 && this.urlCache[pos] != undefined) {
      url = this.urlCache[pos][0];
      if (url) {
        return url;
      }
    }
    if (!reload) {
      if (this.loadUrlCache(from, LOAD_URL_LIMIT)) {
        return this.getUrlFromCache(from, true);
      }
    }
  }
  
  /**
  * Have same urls in list that haven't tested
  * @return {boolean}
  */
  this.isNonTested = function () {
    return (this.actualPosition >= 0);
  }
  
  /**
  * We change urls in documents and need start new test 
  * (same condition as @see loadHeapFile - start tested from last non tested url)
  */
  this.startNewTest = function () {
    this.totalCount = this.sheetUrl.getLastRow();
    this.actualPosition = this.findLastTested();
  }
  
  /**
  * Load new pack of urls from file
  * @param {int} from - from row
  * @param {int} rows - how many rows will load
  */
  this.loadUrlCache = function (from, rows) {
    this.urlCacheFrom = from;
    var numRows = Math.min(rows, this.totalCount);
    var range = this.sheetUrl.getRange(from, 2, numRows);
    this.urlCache = range.getValues();
    return true;
  }
  
  // ############# III. tested url status save to sheet
  
  /**
  * @var {int} - For better reading, column with url will be more width than default
  */
  const URL_COLUMN_WIDTH = 300;
  
  /**
  * @var {int} - how many statuses are in cache
  */
  this.counter = 0;
  
  /**
  * @var {int[][]} - cache for tested statuses
  */
  this.solvedPack = [];
  
  /**
  * @var {int} - from what row in heap file will tested urls
  */
  this.startPosition = 0;
  
  /**
  * Create final file (copy from heap to heap_final) and send to email
  * @param {string} email - reportEmail from config
  * @param {Boolean} sendIfOk - if check have no errors, user will not recived email
  */
  this.completeControl = function (email, sendIfOk) {
    SpreadsheetApp.flush();
    var fileUrlBeckup = this.copyActualAsLog();
    var sheet = SpreadsheetApp.open(fileUrlBeckup).getSheetByName('urls');
    sheet.setColumnWidth(2, URL_COLUMN_WIDTH);
    sheet.sort(3, false);
    sheet.insertRows(1);
    sheet.getRange(1, 1).setValue('Uživatelské Id');
    sheet.getRange(1, 2).setValue('Testovane URL');
    sheet.getRange(1, 3).clearFormat().setValue('HTTP status');
    sheet.getRange(1, 4).setValue('Zdroj');
    sheet.getRange(1, 5).setValue('sitelinkId-campaignId-groupId');
    SpreadsheetApp.flush();
    if (sendIfOk || this.haveErrors > 0) {
      MailApp.sendEmail(email,
                        'Sklik Script Test URL dokončen',
                        'Test kontroly URL byl úspěšně dokončen. Seznam všech testovaných a jejich výsledky najdete v příloze. \n Celkem bylo zjištěno ' + this.haveErrors + ' neplatných adres',
                        { attachments: [sheet.getParent().getAs(MimeType.PDF)] }
    );
  }
}

/**
* This file is as cache for testing. We need make file with last complete test
* @return {File}
*/
this.copyActualAsLog = function () {
  return this.rFolder.makeCopy(this.file, 'urlHeap_done', true);
}

/**
* Setup package array
* @see solvedActualUrl
* @param {int} - array dimension
* @return {Array}
*/
this.makeNewArray = function (limit) {
  //this.solvedPack = new Array(5).fill(0).map(x => new Array(1).fill(0));  
  for (var aa = []; aa.push([0]) < limit;);
  return aa;
}

/**
* Sometimes need push single HTTP status to sheet.
* Because when insert statuses in package we can setup only one bgcolor, 
* therefore error statuses must be insert as single operation
* @param {int} - HTTP stat code
* @param {int} - Position in file (line)
*/
this.pushIndividualRecord = function (stat, position) {
  if (!position) {
    position = this.actualPosition;
  }
  if (stat == 200) {
    this.sheetUrl.getRange(position, 3).setValue(stat).setBackgroundRGB(0, 255, 0);
  } else if (stat < 400) {
    this.sheetUrl.getRange(position, 3).setValue(stat).setBackgroundRGB(255, 255, 0);
    this.haveErrors++;
  } else {
    this.sheetUrl.getRange(position, 3).setValue(stat).setBackgroundRGB(255, 0, 0);
    this.haveErrors++;
  }
}

/**
* Update package or tested HTTP status (only green one - less 300)
* @param {Array} - statuses 
* @param {int} - row of first statuses in pack (position of url what was tested)
*/
this.pushSolvedPack = function (pack, startPosition) {
  var range = this.sheetUrl.getRange(startPosition, 3, pack.length);
  range.setBackgroundRGB(0, 255, 0).setValues(pack);
}

/**
* Add new tested status. Manage it (push to cache or save to file)  
* @param {int} stat - HTTP status of tested url 
* @param {int} position - position of url in file  
* @param {boolean} finish - push package to file directly
*/
this.solvedActualUrl = function (stat, position, finish) {
  var limit = 50;
  
  //Pokud dojde prikaz uzavrit balik, uzavru
  if (finish) {
    if (this.counter > 0) {
      if (this.startPosition + limit > this.totalCount) {
        this.solvedPack.splice(this.totalCount - this.startPosition + 1);
      }
      this.pushSolvedPack(this.solvedPack, this.startPosition);
      this.solvedPack = this.makeNewArray(limit);
      this.startPosition = 0;
      this.counter = 0;
    }
    return;
  }
  
  //Pokud nemam pack a dojde chybova, tak jenom zpracuji
  if (this.counter == 0 && stat >= 300) {
    this.pushIndividualRecord(stat, position);
    return;
  }
  
  //Pokud mam otevreny pack ale dojde chybova, uzavru pack a zapisu chybu
  if (this.counter > 0 && stat >= 300) {
    if (this.startPosition + limit > this.totalCount) {
      this.solvedPack.splice(this.totalCount - this.startPosition + 1);
    }
    this.pushSolvedPack(this.solvedPack, this.startPosition);
    this.pushIndividualRecord(stat, position);
    this.solvedPack = this.makeNewArray(limit);
    this.startPosition = 0;
    this.counter = 0;
    return;
  }
  
  //Definování nového balíku
  if (this.counter == 0) {
    this.startPosition = position;
    this.solvedPack = this.makeNewArray(limit);
  }
  
  //Pokud je pozice menci nez startujici, tak je to divne a musim individualne
  if (position < this.startPosition) {
    this.pushIndividualRecord(stat, position);
    return;
  }
  
  //Pokud neni kompletni pack a dojde normalni -> pak ulozim
  //Kdyz tim naplnim pack, tak i vyhodnotim
  if (this.counter < limit && stat < 300) {
    this.solvedPack[position - this.startPosition][0] = stat;
    this.counter++;
    if (this.counter == limit) {
      this.pushSolvedPack(this.solvedPack, this.startPosition);
      this.solvedPack = this.makeNewArray(limit);
      this.startPosition = 0;
      this.counter = 0;
    }
    return;
  }
}

  /**
   * Update all statuses to file (close cache)
   */
  this.solvedActualUrlClose = function () {
    this.solvedActualUrl('', '', true);
  }
}
