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
  
    const SETTING_NAME = 'gSetting';
  
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
  
  