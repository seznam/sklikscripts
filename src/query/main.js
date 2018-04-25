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
 * nebo je treba to zmenit primo v kodu, kde se na to odvolava (pouze tady v teto tride)
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
    
        /**
         * Dependency loader and setuper
         */
        this.ini = function () {
            this.rFolder = new SklikAPI.ApiFolder(FOLDER_ID);
            this.rSetup = new SklikAPI.FileOfSetup(FOLDER_ID);
            this.rEmail = new SklikAPI.ReportEmail(this.rSetup);
            this.rLogger = new SklikAPI.ProblemLogger(this.rFolder, this.rSetup, this.rEmail);
            this.rApi = new SklikAPI.APIConnection(this.rSetup, this.rLogger);
            this.rHeap = new Heap(this.rFolder, this.rLogger);
            this.rQueries = new Queries(this.rSetup, this.rLogger, this.rApi, this.rHeap, this.rEmail);
            if (!this.rFolder.loadFolder()) {
                this.rFolder.createFolder();
            }
            this.rSetup.load();
            this.rLogger.setup();
            this.rEmail.setup();
            this.rHeap.setup();
    
        }
    
        this.checkQueries = function () {
            this.rLogger.newTest('Load new Search queries');
            this.rApi.sklikApiLogin();
            this.rQueries.createReport();
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
        var root = new Root();
        root.ini();
        root.checkQueries();
    }
    
    
    
    
    
    
    
    