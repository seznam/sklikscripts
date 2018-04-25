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
      this.actualParagraph.appendText(text+'\n');
    }

    /**
     * Setup info about new script run (new paragraph)
     * @param {String} type 
     */
    this.newTest = function(type) {
      this.actualParagraph = this.log.getBody().appendParagraph(type+'\n');      
    }

      /**
     * mainly setup log file
     * @return {boolean}
     */
    this.setup = function () {
      var logFile;
      logFile = this.folder.getFile('log');
      if (!logFile) {
        logFile = this.folder.createFile('log', 'doc');
        if(!logFile) {
          return false;
        }
      }
      this.log = DocumentApp.openById(logFile.getId());
      if(!this.log) {
        return false;
      } else {
        this.log.getBody().clear();      
      }
    }
  }