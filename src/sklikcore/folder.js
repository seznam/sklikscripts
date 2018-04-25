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
    const DEFAULT_FOLDER_NAME = 'SklikAPI';
  
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
  
  
  