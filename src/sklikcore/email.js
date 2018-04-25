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