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
 const FOLDER_ID = '';  
 
 //Class for work with main folder 
 this.rFolder = new SklikAPI.ApiFolder(FOLDER_ID);
 //Config file services
 this.rSetup = new SklikAPI.FileOfSetup(FOLDER_ID);
 //Emailer (to send all information to user)
 this.rEmail = new SklikAPI.ReportEmail(this.rSetup);
 //Logging errors or actions at script
 this.rLogger = new SklikAPI.ProblemLogger(this.rFolder, this.rSetup, this.rEmail);  
 //Comunicator with Sklik API 
 this.rApi = new SklikAPI.APIConnection(this.rSetup, this.rLogger); 

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

