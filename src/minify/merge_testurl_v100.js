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
 * @author Roman Stejskal
 * @version 1.0.0
 * @param {FolderId}  
 */

var FileOfSetup = function (FolderId) {
  
    var SETTING_NAME = 'gSetting';
  
    /**
    * @param {String} - Id of folder where is script
    */
    this.FOLDER_ID = FolderId;
  
    this.sFolder = new ApiFolder(FolderId);
  
    /**
      * @param File
      */
    this.file;
  
    /**
    * @param {Object}
    */
    this.sheets = {};
  
    /**
     * All parameters
     * @param {Object}
     */
    this.params = {};
  
    /**
    * @return {boolean}
    */
    this.createFolder = function () {
      return this.sFolder.createFolder();
    }
  
    /**
    * @return {Folder|boolean}
    */
    this.getFolder = function () {
      return this.sFolder.getFolder();
    }
  
    /**
     * @param {String} - name of param
     * @param {String} - expected type of value (boolean, array)
     * @param {String} - to array need include only this types of items
     * @return {mixed}
     */
    this.getSettingParam = function (param, type, subtype) {
      if (this.params.length == 0) {
        if (!this.getSettingParams()) {
          return false;
        }
      }
      if (this.params[param]) {
        if ((typeof this.params[param] === 'string' || this.params[param] instanceof String) && !/^\d+$/.test(this.params[param])) {
          if (this.params[param].toUpperCase() == 'ANO') {
            return true;
          } else if (this.params[param].toUpperCase() == 'NE') {
            return false;
          }
        }
  
        //if parameter is expected as array 
        if (type == 'array') {
          var intArr = [];
          if (typeof this.params[param] === 'string' || this.params[param] instanceof String) {
            var stringArr = this.params[param].split('|');
            for (var i = 0; i < stringArr.length; i++) {
              if (subtype == 'int') {
                var toint = parseInt(stringArr[i]);
                if (!isNaN(toint)) {
                  intArr.push(toint);
                }
              } else {
                intArr.push(parseInt(stringArr[i]));
              }
            }
          } else if (Array.isArray(this.params[param])) {
            return this.params[param];
          } else if (!isNaN(this.params[param])) {
            return [this.params[param]];
          }
          return intArr;
        }
        return this.params[param];
      } else {
        return false;
      }
    }
  
    /**
    * @return {Object|boolean} - Object of config params
    */
    this.getSettingParams = function () {
      var setting = this.getSettingSheet();
      if (!setting) {
        return false;
      }
      var paramsArray = setting.getDataRange().getValues();
      this.params = this.transformSettingArrayToObject(paramsArray);
      return this.params;
    }
  
    /**
     * @return Sheet|boolean
     */
    this.getSettingSheet = function () {
      if (!this.sheets.setting) {
        if (!this.loadFile()) {
          return false;
        }
        var gSetting = SpreadsheetApp.open(this.file);
        this.sheets['setting'] = gSetting.getSheetByName('setting');
      }
      return this.sheets.setting;
    }
  
     /**
    * @return {Boolean}
    */
    this.load = function () {
      this.loadFolder();
      if (this.loadFile()) {
        if (this.getSettingParams() != false) {
          return true;
        }
      }
      return false;
    }
  
    /**
    * Load setting
    * @return {boolean}
    */
    this.loadFile = function () {
      this.sFolder.loadFile(SETTING_NAME);
      this.file = this.sFolder.getFile(SETTING_NAME);
      if (this.file) {
        return true;
      } else {
        return false; 
      }
    }
  
    /**
     * Try to load root folder
     * @return {Folder|boolean}
     */
    this.loadFolder = function () {
      return this.sFolder.loadFolder();
    }
  
    /**
     * Have some setting parametrs and what to procceed its to save. 
     * We dont know if already exists and need update or have no one
     * @param Object params
     */
    this.setup = function (params) {
      var param;
      var block;
      for (var blockName in params) {
        block = params[blockName];
        this.setOptionBlock(this.getSettingSheet(), block.desc);
        for (var paramName in block) {
          param = block[paramName];
          if (param.name != undefined && param.value != undefined && param.type != undefined) {
            this.setOption(this.getSettingSheet(), param.name, param.value, param.type, param.desc);
          }
        }
      }
      return this.file;
    }
  
    /**
    * Add new options to setting sheet
    * @param {Sheet} sheet 
    * @param {String} name - name of options 
    * @param {mixed} value 
    * @param {String} type - typ of options expect from enum (int, boolean) or will be clasificate as other 
    * @param {String} description - explanation what this option is (show to user in sheet) 
    * @param {number} row - set row in sheet where to save new option (or it will be used last row) 
    */
    this.setOption = function (sheet, name, value, type, description, row) {
      if (!sheet) {
        sheet = this.getSettingSheet();
        if (!sheet) {
          return false;
        }
      }
      if (!row) {
        row = Math.max(sheet.getLastRow() + 1, 2);
      }
      //Add description
      sheet.getRange(row, 1).setValue(description);
      sheet.getRange(row, 2).setValue(name);
      sheet.getRange(row, 3).setValue(value);
  
      switch (type) {
        case 'int':
          break;
        case 'boolean':
          break;
        default:
          break;
      }
    }
  
    /**
      * Separate options record by types (what kind of setting it is)
      * @param {Sheet} sheet 
      * @param {String} desc - name of options 
      * @param {int} row
      */
      this.setOptionBlock = function (sheet, desc, row) {
        if (!sheet) {
          sheet = this.getSettingSheet();
          if (!sheet) {
            return false;
          }
        }
        if (!row) {
          row = Math.max(sheet.getLastRow() + 1, 2);
        }
        //Add description
        sheet.getRange(row, 1).setValue(desc);
      }  
  
    /**
    * To more easy access to variables of setting, need transform to classic object structure
    * @param {String[][]} paramsArray
    * @return Object
    */
    this.transformSettingArrayToObject = function (paramsArray) {
      var object = {};
      var param;
      for (var i = 1; i < paramsArray.length; i++) {
        param = paramsArray[i];
        if (param[1] != '') {
          object[param[1]] = param[2];
        }
      }
      return object;
    }
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
 * All problems need be save in log file 
 * @author Roman Stejskal
 * @version 1.0.0 
 * @param {ApiFolder}
 * @param {FileOfSetup}
 * @param {ReportEmail}
 * @return {boolean}
 */
var ProblemLogger = function (rFolder, rSetup, rEmail) {
  
    /**
     * @param {ApiFolder}
     */
    this.folder = rFolder;

    /**
     * @param {FileOfSetup}
     */
    this.setupFile = rSetup;

    /**
     * @param {ReportEmail}
     */
    this.reportEmail = rEmail;

    /**
     * GDoc log
     * @var {Document}
     */
    this.log;  
        
    /**
     * @var {String[]} - Message cache
     */
    this.emailErrorCache = [];
    
    /**
     * @var {Paragraph} - loaded place to insert log message
     */
    this.actualParagraph;
    
    /**
     * @var {boolean} - indicate if logger have some error
     */
    this.noErr = true;
    
    /**
     * Report error     
     * @param {String} text - message
     * @param {String} type - type of error
     * @param {boolean} interruption - if error interrupting script (send email)
     */
    this.addError = function(text, type, interruption) {
      this.noErr = false;
      this.emailErrorCache.push(text);
      this.addRecord(text);
      if(interruption) {
        this.reportEmail.sendError(this.emailErrorCache);
      }
    }
    
    /**
     * Report some events in script
     * @param {String} text - message
     * @param {String} type - type of error
     */
    this.addEvent = function(text, type) {
     this.addRecord(text);      
    }
  
    /**
     * Report warning
     * @param {String} text - message
     * @param {String} type - type of error
     */
    this.addWarning = function(text, type) {
      this.noErr = false;
      this.emailErrorCache.push(text);
      this.addRecord(text);
    }  

    /**
     * Insert message into file
     * @param {String} text - message 
     */
    this.addRecord = function(text) {
      //this.actualParagraph.appendText(text+'\n');
    }

    /**
     * Setup info about new script run (new paragraph)
     * @param {String} type 
     */
    this.newTest = function(type) {
      //this.actualParagraph = this.log.getBody().appendParagraph(type+'\n');      
    }

      /**
     * mainly setup log file
     * @return {boolean}
     */
    this.setup = function () {
      // var logFile;
      // logFile = this.folder.getFile('log');
      // if (!logFile) {
      //   logFile = this.folder.createFile('log', 'doc');
      //   if(!logFile) {
      //     return false;
      //   }
      // }
      // this.log = DocumentApp.openById(logFile.getId());
      // if(!this.log) {
      //   return false;
      // } else {
      //   this.log.getBody().clear();      
      // }
    }
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
 * GAS class for manage folder and file in GDrive
 * Manage root file for script, load it and create new one (logs, setting, results, etc...)
 * @author Roman Stejskal
 * @version 1.0.0
 * @param {String} FolderId - ID of folder. If not setup, will be use default 
 */

var ApiFolder = function (FolderId) {
  
    /**
     * @var {String} - Name of default root folder (if FOLDER_ID is null)
     */
    var DEFAULT_FOLDER_NAME = 'SklikAPI';
  
    /**
    * @var {String} - Id of root folder
    */
    this.FOLDER_ID = FolderId;
  
    /**
     * @param {Folder}
     */
    this.apiFolder;
  
    /**
     * @param {File[]}
     */
    this.loadedFiles = {};
  
    /**
    * Create new file in folder
    * @param {String} name - name of file
    * @param {String} type - filetype 
    * @return {File|boolean}
    */
    this.createFile = function (name, type) {
      if (!this.getFolder()) {
        if (!this.createFolder()) {
          return false;
        }
      }
      var ins, insId;
      switch (type) {
        case 'doc':
          insId = DocumentApp.create(name).getId();
          break;
        case 'sheet':
          insId = SpreadsheetApp.create(name).getId();
          break;
        default:
          break;
      }
      ins = DriveApp.getFileById(insId);
      this.loadedFiles[name] = ins.makeCopy(name, this.apiFolder);
      DriveApp.removeFile(ins);
      return this.loadedFiles[name];
    }
  
    /**
    * Create root Folder 
    * @return {Folder|boolean}
    */
    this.createFolder = function () {
      if (this.getFolder()) {
        return this.apiFolder;
      }
      return this.apiFolder = DriveApp.getRootFolder().createFolder(DEFAULT_FOLDER_NAME);
    }
  
    /**
    * Return file by name
    * @param {string} name - name of file
    * @return {File|boolean}
    */
    this.getFile = function (name) {
      if (!this.loadedFiles[name]) {
        if (!this.loadFile(name)) {
          return false;
        }
      }
      return this.loadedFiles[name];
    }
  
    /**
    * Return root folder 
    * @return {Folder|boolean}
    */
    this.getFolder = function () {
      if (!this.apiFolder) {
        if (!this.loadFolder()) {
          return false;
        }
      }
      return this.apiFolder;
    }
  
    /**
    * Try to load file from folder
    * @param {string} name
    * @return {boolean}
    */
    this.loadFile = function (name) {
      if (this.apiFolder) {
        if (!this.loadedFiles[name]) {
          var f = this.apiFolder.getFilesByName(name);
          if (f.hasNext()) {
            this.loadedFiles[name] = f.next();
            return true;
          }
        }
      }
      return false;
    }
  
    /**
     * Try to load root folder
     * @return {Folder|boolean}
     */
    this.loadFolder = function () {
      if (this.FOLDER_ID != '' && this.FOLDER_ID != undefined) {
        var fd = DriveApp.getFolderById(this.FOLDER_ID);
        if (fd) {
          this.apiFolder = fd;
          return this.apiFolder;
        }
      } else {
        var fd = DriveApp.getRootFolder().getFoldersByName(DEFAULT_FOLDER_NAME);
        if (fd.hasNext()) {
          this.apiFolder = fd.next();
          return this.apiFolder
        }
      }
  
      return false;
    }
  
    /**
     * Create file copy
    * @return {File}
    */
    this.makeCopy = function (file, nameOfNewFile, unique) {
      if (unique) {
        this.removeFile(nameOfNewFile);
      }
      return file.makeCopy(nameOfNewFile, this.getFolder());
    }
  
    /**
     * Remove file
     */
    this.removeFile = function (name) {
      var file = this.getFile(name);
      if (file) {
        this.getFolder().removeFile(file);
      }
    }
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
 * Manage email duty
 * @todo - has some potential to use
 * @author Roman Stejskal
 * @version 1.0.0 
 * @param {FileOfSetup} rSetup
 */
var ReportEmail = function (rSetup) {
  
    /**
     * @var {FileOfSetup}
     */
    this.setupFile = rSetup;
    
    /**
     * @var {String} - email from reportEmail
     */
    this.recipient;
  
    /**
     * Init setup
     */
    this.setup = function () {
      this.recipient = this.setupFile.getSettingParam('reportEmail');
    }
  
    /**
     * Prepare email and send it 
     * @param {Object} errors - variables (message of errors)
     * @param {String} email - recipient
     * @return {boolean}
     */
    this.sendError = function (errors, email) {
      var recipient = this.recipient;
      if (email) {
        recipient = email;
      }
      if (!recipient) {
        return false;
      }  
      MailApp.sendEmail(recipient, 'SklikAPI script: Chybove hlaseni', this.errorTemplate(errors));
    }
  
    /**
    * @param {HtmlTemplate} tpl
    **/
    this.sendMessage = function(subject, message, email, tpl) {
      var recipient = this.recipient;
      if (email) {
        recipient = email;
      }
      if (!recipient) {
        return false;
      }  
      if(tpl) {
        MailApp.sendEmail(recipient, subject, message, {htmlBody: tpl.evaluate().getContent()}); 
      } else {
        MailApp.sendEmail(recipient, subject, message);
      }
    }
    
    
    /**
     * Insert variables to placeholder in template
     * @param {Object} errors - variables
     * @return {String}
     */
    this.errorTemplate = function (errors) {
      var t = HtmlService.createTemplateFromFile('reportEmail');
      t.errors = errors;
      return t.evaluate().getContent();
    }
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
 * Connector and communicator Sklik API manager.
 * @param {FileOfSetup} rSetup
 * @param {ProblemLogger} rLogger
 */
var APIConnection = function (rSetup, rLogger) {
  
    /**
    * @var {FileOfSetup}
    */
    this.setupFile = rSetup;
  
    /**
     * @var {ProblemLogger}
     */
    this.logger = rLogger;
  
    /**
     * @var {String} - Api session
     */
    this.session = '';
  
    /**
     * Login user to API
     */
    this.sklikApiLogin = function () {
      this.sklikApi(this.setupFile.getSettingParam('token'), 'client.loginByToken', this, 'setSessionByLogin');
    }
  
    /**
     * Save session after login
     * @param {Object}
     */
    this.setSessionByLogin = function (response) {
      this.session = response.session;
    }
  
    /**
     * @return {String}
     */
    this.getSession = function () {
      return this.session;
    }
  
    
  /** 
     * Make gate to call method from API Drak
     * @param {Object}
     * @param {string} method - API method
     * @param {Object} cbClass - Callback class
     * @param {string} cbMethod - Callback method
     * @param {mixed} param - variable params insert into callback 
     */
    this.sklikApi = function (parameters, method, cbClass, cbMethod, param, retry) {
      if(method.indexOf('client.') == -1) {
        this.logger.addEvent(method + '[SklikApiCore.APIConnection.sklikApi]');
        this.logger.addEvent(method + JSON.stringify(parameters) + '[SklikApiCore.APIConnection.sklikApi]');
      }
      //Jenom abych nezasypal API dotazy, proto pred kazdym volani to na chvili uspim
      Utilities.sleep(200);
      try {
        var stat = UrlFetchApp.fetch('https://api.sklik.cz/jsonApi/drak/' + method, {
        'method': 'post',
        'contentType': 'application/json',
        'muteHttpExceptions': true,
        'payload': JSON.stringify(parameters)
       }); 
      } catch (e) {
        if (!retry) {
          Utilities.sleep(2000);
          return this.sklikApi(parameters, method, cbClass, cbMethod, param, true); 
        }
      }    
      var response = JSON.parse(stat);
      var text = JSON.stringify(response);
      if (text.length > 400) {
        text = text.substring(0,400)+"SHORTED ";
      }
      this.logger.addEvent(method + text + '[SklikApiCore.APIConnection.sklikApi]');
      if (stat && stat.getResponseCode() == 200) {
        if (response.session) {
          if (cbClass) {
            cbClass[cbMethod](response, param);
          }
          //Logout do not return session (just status and statusMessage)
        } else if (method == 'client.logout') {
          if (cbClass) {
            cbClass[cbMethod](response, param);
          }
        } else {
          this.logger.addEvent(method + ' Nevraci session [sklikApi]');
          return false;
        }
      //Pokud to failne, tak to zkusim provolat znova za 2 sekundy  
      } else if (!retry) {
        Utilities.sleep(2000);
        return this.sklikApi(parameters, method, cbClass, cbMethod, param, true);    
      } else {
        this.logger.addEvent(method + ' [' + response.status+'] - [sklikApi]');
        return false;
      }
    }
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
 * All functions related of processor of scripts. Specific for GAS
 * @author Roman Stejskal
 * @version 1.0.0
 * @param {Root} RootClass
 * @param {Data4} DataClass
 * @param {TestUrl} UrlClass  
 */
var Inf = function (RootClass, DataClass, UrlClass) {
  
  /**
   * Approx 100 char per line
   * Log report text limit
   * @var {int}
   */
  var MAX_LOG_LENGTH = 100*10;
  
  /**
   * @var {TestUrl}
   */
  this.Url = UrlClass;

  /**
   * @var {Data4}
   */
  this.Data = DataClass;

  /**
   * @var {Root}
   */
  this.Root = RootClass;

  /**
  * Check need real test of existing url (real test of connection)
  * @param {Object} cbClass - Callback class
  * @param {string} cbMethod - Callback method
  * @param {Object} actionClass - will called after testing (expect some like save tested url status)
  * @param {string} actionMethod
  * @param {int} urlPosition - keep information of url position (in cache or file)
  * @param {boolean} retry - information if its first test (false) or trying again (true)
  * @param {boolean} isClear - information if we escape url (need to remove {})
  */
  this.testUrlConnection = function (cbClass, cbMethod, actionClass, actionMethod, urlPosition, url, retry, isClear) {
     try {
        var stat = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
        var statusCode = stat.getResponseCode();
      } catch (e) {
        var statusCode = 404;
      }
    //S největší pravděpodobností link obsahuje Sklik proměnné. Ty odfiltruji a zkusím znova
    if (statusCode >= 300 && url.indexOf("{") !== -1 && !isClear) {
      this.variableRemove(cbClass, cbMethod, actionClass, actionMethod, urlPosition, url, retry);
    //Pokud i přesto je chyba, tak zkusím provolat link znova pro jistotu
    } else if (statusCode >= 300 && !retry) {
      this.testUrlConnection(cbClass, cbMethod, actionClass, actionMethod, urlPosition, url, true)
    } else {      
      actionClass[actionMethod](statusCode, urlPosition);
      cbClass[cbMethod]();
    }
     return;    
  }

  /**
   * If first check of url not valid, try escape variable like keywords etc..
   * @param {Object} cbClass - Callback class
   * @param {string} cbMethod - Callback method
   * @param {Object} actionClass - will called after testing (expect some like save tested url status)
   * @param {string} actionMethod
   * @param {int} urlPosition - keep information of url position (in cache or file)
   * @param {boolean} retry - information if its first test (false) or trying again (true)
   */
   this.variableRemove = function(cbClass, cbMethod, actionClass, actionMethod, urlPosition, url, retry) {
     var clearUrl = url.replace(/[{,}]/g,'');  
     this.testUrlConnection(cbClass, cbMethod, actionClass, actionMethod, urlPosition, clearUrl, retry, true);
   }

  /**
   * Load all users settings, include user authentication, usersId to test and params of api query
   * @param {Object} cbClass - Callback class
   * @param {string} cbMethod - Callback method
   * @param {boolean} isNonTested - if have non tested urls in heap, dont need login to API
   */
  this.loadConfig = function (cbClass, cbMethod, isNonTested) {
    var userIds = this.Root.rSetup.getSettingParam('userIds', 'array');
    var token = this.Root.rSetup.getSettingParam('token');
    if(!token || !userIds) {
      return false;
    }
    var campaignsIds = this.Root.rSetup.getSettingParam('t404campaignsIds', 'array', 'int');    
    if (campaignsIds && campaignsIds.length > 0) {
      this.Data.setUsers([userIds[0]]);
    } else {
      this.Data.setUsers(userIds);
    }
    if(isNonTested) {
      cbClass[cbMethod]();
    } else {
      this.Root.rApi.sklikApiLogin();
      var session = this.Root.rApi.getSession();
      if(session) {
        this.Data.setSession(session);
      }
      cbClass[cbMethod]();
    }      
  }

  /**
   * @param {string} - error message
   * @param {string} - source of error
   * @param {boolean} - if user turn on debug mode
   */
  this.logEvent = function(message, source, debug) {
    if(debug == undefined || Debug === debug) {
      if(message.length > MAX_LOG_LENGTH) {
        var mess = message.substring(0,MAX_LOG_LENGTH) + '[.....]SHORTED';  
      } else {
        var mess = message;
      }
      this.Root.rLogger.addEvent(mess, source);
    }
  }
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
 *  Keep data during testing. Data helper
 *  @author Roman Stejskal
 *  @version 1.0.0
 */
var Data4 = function () {
  
  /**
  * in process of testing user, we need have access to his id
  * @var {int} - actaul user Id (is tested)
  */
  this.actualUser;
  this.actualUserInHeap;
  
  /**
   * Merge all urls of user to one line (need for synchronize proccess - test one, then test second) 
   * @var {Array}
   */
  this.front = [];

  /**
  * @var {string} - actual session to communicate with API
  */
  this.session;

  /**
  * Instance of actual date (mainly for log)
  * @var {Date}
  */
  this.startDate = new Date();

  /**
  * @var {int[]} - list of all users to tested
  */
  this.userIdsList = [];
  this.userIdsInHeap = [];

  /**
   * Central heap, to save loaded data of account
   * Structure of variable string{userId}{type}[] = {url, click, cost} 
   * where type is enum['ads','adsDeny','keywords', 'sitelinks', done{[ads,adsDeny,keywords,sitelinks]}] - 
   * data of all separate loaded types
   * done is for check if is all types loaded - default all parts in done set as false
   * @var {mixed{}{}[]}
   */
  this.urlHeap = {};

  /**
  * Formate loaded Ads report, and add to heap of url
  * @param {string} type - source of url (sitelinks, ads)
  * @param {Object} urlDetail - all info about loaded url
  */
  this.addUrlToHeap = function (type, urlDetail) {
    
        if (this.urlHeap[this.getActualUser()].url[urlDetail.url] == undefined) {
          var urlData = {
            'locations': [urlDetail.location],
            'types': [type],
            'data': urlDetail
          };
          this.urlHeap[this.getActualUser()].url[urlDetail.url] = urlData;
        } else {
          if(this.urlHeap[this.getActualUser()].url[urlDetail.url].types.indexOf(type) == -1) {
            this.urlHeap[this.getActualUser()].url[urlDetail.url].types.push(type);
          }
          if(this.urlHeap[this.getActualUser()].url[urlDetail.url].locations.indexOf(urlDetail.location) == -1) {
            this.urlHeap[this.getActualUser()].url[urlDetail.url].locations.push(urlDetail.location);
          }
        }
      }

  /**
   * Create URL heap for actual user
   */
  this.creatHeap = function () {
    this.urlHeap[this.getActualUser()] = {
      url: {},
      done: { ads: false, adsDeny: false, keywords: false, sitelinks: false }
    };    
    this.userIdsInHeap.push(this.getActualUser());    
  }

  /**
   * @return {Date}
   */
  this.getActualDate = function() {
    return this.startDate;
  }

  /**
  * In process of testing user, we need have access to his id
  * @return {int}
  */
  this.getActualUser = function () {
    return this.actualUser;
  }

  /**
   * Loading urls from four parallely sources (types of API calls). 
   * Need sync, that all of this sources are done
   * @param {string} type - type of loaded url (sitelinks, ads)
   */
  this.setDoneInHeap = function (type) {
    this.urlHeap[this.getActualUser()].done[type] = true;
  }
  
  /**
   * How many urls are in actual user heap
   * @return {int}   
   */
  this.getFrontLength = function () {
    return this.urlHeap[this.getActualUser()].url.length;
  }
    
  /**
   * Get url heap for user
   * @param {int} userId
   * @return {Object[]}
   */
  this.getHeap = function (userId) {
    if (userId == undefined) {
      userId = this.getActualUser();
    }
    return this.urlHeap[userId];
  }

  /**
   * Get next url from cache
   * @return {boolean|Object}
   */
  this.getNextUrl = function() {
    if(!this.actualUserInHeap) {
      this.actualUserInHeap = this.userIdsInHeap.shift();
    }
    while(this.actualUserInHeap) {
      for (var urlObject in this.urlHeap[this.actualUserInHeap].url) {
        this.front.push(this.urlHeap[this.actualUserInHeap].url[urlObject]);      
      }
      this.actualUserInHeap = this.userIdsInHeap.shift();
    }
    var urlData = this.front.shift();
    if (urlData && urlData != undefined) {
      return urlData; 
    }
    return false;
  }

  /**
  * Get next user from array to test
  * @return {int}
  */
  this.getNextUser = function () {
    this.actualUser = this.userIdsList.pop();
    return this.getActualUser();
  }

  /**
  * @return {string}
  */
  this.getSession = function () {
    return this.session;
  }

  /**
  * @param {string} session - API session
  */
  this.setSession = function (session) {
    this.session = session;
  }

  /**
  * Setup all userId what will be check 
  * @param {int[]} userIdsList
  */
  this.setUsers = function (userIdsList) {
    this.userIdsList = userIdsList;
  } 
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
* @param {ApiFolder} folderClass  
*/
var UrlHeap = function (folderClass) {
  // ############# Load file 
  /**
  * @var {File} - heap file
  */
  this.file;
  
  /**
  * @var {ApiFolder}
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
  var LOAD_URL_LIMIT = 200;
  
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
  var URL_COLUMN_WIDTH = 300;
  
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
        restriction, { 'source': "Test404ads" }
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
        restriction, { 'source': "Test404adsdeny" }
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
        restriction,{ 'source': "Test404keywords" }
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
        restriction, { 'source': "Test404sitelinks" }
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
 * Trida pro nastaveni prostredi. 
 * Tato trida vyuziva externi knihovnu (Sklik Api Script Core)
 * Externi knihovna - Zdroje:Knihovny:Pridat knihovnu: M7DNgoK_xxmxWPC7RKKgX92NHdsZuOffq
 * Nejnovejsi verze Externi knihovny: - Zdroje:Knihovny:Verze
 * !!! Externi knihovna musi mit zahchovany nazev "SklikAPI", 
 * nebo je treba to zmenit primo v kodu, kde se na to odvolava (viz line 11-14)
 * @author Roman Stejskal
 * @version 1.0.0
 */
var Root = function () {
  
 /**
  * Je treba zadat id konkretni slozky, kde se nachazi script. 
  * V opacnem pripade bude defaultne hledat slozku SklikApi
  * Diky zmene slozky, je mozne mit vice scriptu na jeden ucet
  * @param {String} FOLDER_ID - Id of app script in Sklik account
  */
 var FOLDER_ID = '';  
 
 //Class for work with main folder 
 this.rFolder = new ApiFolder(FOLDER_ID);
 //Config file services
 this.rSetup = new FileOfSetup(FOLDER_ID);
 //Emailer (to send all information to user)
 this.rEmail = new ReportEmail(this.rSetup);
 //Logging errors or actions at script
 this.rLogger = new ProblemLogger(this.rFolder, this.rSetup, this.rEmail);  
 //Comunicator with Sklik API 
 this.rApi = new APIConnection(this.rSetup, this.rLogger); 

 /**
  * All included classes need setup their main env
  */
 this.loadEnv = function () {
   if (!this.rFolder.loadFolder()) {
     this.rFolder.createFolder();
   }
   this.rSetup.load();
   this.rLogger.setup();
   this.rEmail.setup();
 }

 /**
  * Test start
  */
 this.startTest = function () {   
   try {
     var Test = new TestUrl(this);
     this.rLogger.newTest('Zahájená další iterace scriptu : ['+Test.getStartDate()+']');
     Test.start404Test();
   } catch (error) {
     this.rLogger.addEvent('Fatální chyba: '+error.message +'['+error.fileName+'|'+error.lineNumber+']');
   }
 }
}

/**
* ##################################
* ########## SPUSTIT TEST ##########
* ##################################
* Tato funkce se postara o spusteni testu
* 1) Spustit pouze jednou - Spustit:Spustit funkci:main
* 2) Nastavit pravidelne spousteni - 
*    Upravit:Spoustece aktualniho projektu:
*    Spustit: main
*    Udalosti: Rizeny casem, pocitadlo hodin, kazdych X hodin
*    (Jak casto se script spousti je libovolne na nastaveni uzivatele) *    
*/
function main() {
 var fRoot = new Root();
 fRoot.loadEnv();
 fRoot.startTest();
 return fRoot;
}


/**
* Enable extension log report for development
*/
var Debug = true;








  
  
  