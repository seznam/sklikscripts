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
  const MAX_LOG_LENGTH = 100*10;
  
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
