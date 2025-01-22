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
 * Make all needed setup for Sklik script
 */
var Wizard = function () {
  
    /** 
    * @var {String} FILE_SETTING_ID - Id of setting template
    */
    const FILE_SETTING_ID = '1q9ozdA_SLaM7fkkH9r5x_I1tkV7ROMBVx3tjOU-9f44';
  
    /** 
    * @var {String} FILE_SCRIPT_TESTURL - Id of app scripts
    */
    const FILE_SCRIPT_TESTURL = '1SPsIXj-fOHUQnMMHhCEFjvyx1bc2i8QX3A-hKdWyUjm1Jlsy2AAwpure';
  
   /**
    * @var {String} TEST_QUERY - Id of the new query script
    */
    const TEST_QUERY = '1AP3zkRfpr8Ulebyyc3oCN5lMAyNM5s6bVy9-MhZF2Dpr80flxZP0OGM3';
  
    /**
    * Je treba zadat id konkretni slozky, kde se nachazi script. 
    * V opacnem pripade bude defaultne hledat slozku SklikApi
    * Diky zmene slozky, je mozne mit vice scriptu na jeden ucet
    * @param {String} FOLDER_ID - Id of app script in Sklik account
    */
    const FOLDER_ID = '';
  
    /**
      * @var {ApiFolder}
      */
    this.Fil = new SklikAPI.ApiFolder(FOLDER_ID);
  
    /**
    * @var {File} - loaded setting template
    */
    this.fileSetting;
  
    /**
    * @var {Object} - loaded file with script codes
    */
   this.fileScript = {};
   
   /**
   * @var {Object} - url to created scripts
   */
   this.fileScriptUrl = {};
  
    /**
     * @var {FileOfSetup}
     */
    this.Setting = new SklikAPI.FileOfSetup(FOLDER_ID);
  
    /**
     * Make copy of script to user folder
     * @param {Object} params - all information from wizard form
     * @return {boolean}
     */
    this.copyScript = function (params) {
      if (params.t404 != undefined) {
        try {        
          var folder = this.Fil.getFolder();
          var file = DriveApp.getFileById(FILE_SCRIPT_TESTURL);
          this.fileScript.t404 = file.makeCopy('TestUrl');
          folder.addFile(this.fileScript.t404);
          //DriveApp.removeFile(file);
          this.fileScriptUrl.t404 = this.fileScript.t404.getUrl();
        } catch (e) {
          this.fileScript.t404 = false;
        }
      }
      if (params.query != undefined) {
        try {        
          var folder = this.Fil.getFolder();
          var file = DriveApp.getFileById(TEST_QUERY);
          this.fileScript.query = file.makeCopy('NewQueryCheck');
          folder.addFile(this.fileScript.query);
          //DriveApp.removeFile(file);
          this.fileScriptUrl.query = this.fileScript.query.getUrl();
        } catch (e) {
          this.fileScript.query = false;
        }
      }
      return true;      
    }
  
    /**
     * Make copy of setting template to user folder
     * @return {boolen} 
     */
    this.copySetting = function () {
      try {
        var folder = this.Fil.getFolder();
        var file = DriveApp.getFileById(FILE_SETTING_ID);
        this.fileSetting = file.makeCopy('gSetting');
        folder.addFile(this.fileSetting);
        //DriveApp.removeFile(file);
        return true;
      } catch (e) {
        return false;
      }
    }
  
    /**
    * @return {String}
    */
    this.getFolderId = function () {
      return FOLDER_ID;
    }
  
    /**
     * Insert all setup parametrs loaded from form
     * @param {Object} params
     * @return {boolean}
     */
    this.setup = function (params) {
      this.Setting.load();
      if ((this.setting = this.Setting.setup(params))) {
        return true;
      } else {
        return false;
      }
    }
  
    /**
     * Create a root folder of SklikAPI on user drive
     * @return {boolean}
     */
    this.makeUserFolder = function () {
      if (!this.Fil.loadFolder()) {
        if (!this.Fil.createFolder()) {
          return false;
        }
      }
      return true;
    }        
  }
  
  /**
  * GAS init function for setup wizard
  * @return {HtmlOutput}
  */
  function doGet() {
    var Wiz = new Wizard();
    var File = new SklikAPI.FileOfSetup(Wiz.getFolderId());
    if (!File.load()) {
      return HtmlService.createHtmlOutputFromFile('register');
    } else {
      return HtmlService.createHtmlOutputFromFile('already');
    }
  }
  
  /**
   * Root function to setup new user (create file and save user settings)
   * @param {Object} params
   * @return {Object}
   */
  function setupNewUser(params) {
    var response = {};
    var Wiz = new Wizard();
    if (makeCopy(Wiz, params)) {
      if (Wiz.setup(params)) {
        response['setting'] = Wiz.fileSetting.getUrl();
        response['scripts'] = Wiz.fileScriptUrl;
      } else {
        response['fail'] = 'No setting saved';
      }
    } else {
      response['fail'] = 'No file';
    }
    return response;
  }
  
  /**
   * Creat copy of files to user folder
   * @param {Wiz}
   * @return {boolean}
   */
  function makeCopy(Wiz, params) {
    if (Wiz.makeUserFolder()) {
      if (Wiz.copyScript(params) && Wiz.copySetting()) {
        return true;
      }
    }
    return false;
  }
  
