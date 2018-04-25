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