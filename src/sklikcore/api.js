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
     * @param {int} retry - try same query one more time
     */
  this.sklikApi = function (parameters, method, cbClass, cbMethod, param, retry) {
    if (retry == undefined) {
      retry = 1;
    } else {
      retry = retry + 1;
    }

    if (method.indexOf('client.') == -1) {
      this.logger.addEvent(method + '[SklikApiCore.APIConnection.sklikApi]');
      this.logger.addEvent(method + JSON.stringify(parameters) + '[SklikApiCore.APIConnection.sklikApi]');
    }
    //Jenom abych nezasypal API dotazy, proto pred kazdym volani to na chvili uspim
    Utilities.sleep(200);
    try {
      var stat = UrlFetchApp.fetch('https://api.sklik.cz/drak/json/' + method, {
        'method': 'post',
        'contentType': 'application/json',
        'muteHttpExceptions': true,
        'payload': JSON.stringify(parameters)
      });
      var response = JSON.parse(stat);
      var text = JSON.stringify(response);
      if (response == undefined || response.status == undefined || text == undefined) {
        throw 'Have no status message';
      }
      if (text.length > 400) {
        text = text.substring(0, 400) + "SHORTED ";
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
      } else if (retry < 5 || retry == undefined) {
        Utilities.sleep(2000);
        return this.sklikApi(parameters, method, cbClass, cbMethod, param, retry);
      } else {
        this.logger.addEvent(method + ' [' + response.status + '] - [sklikApi]');
        return false;
      }

    } catch (e) {
      if (retry < 5) {
        Utilities.sleep(2000);
        return this.sklikApi(parameters, method, cbClass, cbMethod, param, retry);
      } else {
        return false;
      }
    }
  } 
  }
  
  