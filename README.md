# Sklik Scripts
This package of script dedicated for Google Apps Script enviroment to work with Sklik reports.  

# Version
Actual version is first stabile version: 1.0.0 

# Inicializační wizard
*Wizard se za vás postará o vytvoření složek, nahrání skriptů nebo o uložení nastavení. Stačí ho spustit, vyplnit nastavení a povolit mu práci ve vašich složkách na Google Drive. Celý proces jsme popsali v tomto dokumentu.*

**Sklik Wizard v1.0.0**
Adresa wizardu: https://script.google.com/a/macros/firma.seznam.cz/s/AKfycbx3AWRuIYY0J74ZMVnOTZjq6mfBwZZiQEX19EcTCmjYD5kNlC4/exec

Po spuštění je třeba schválit pár bezpečnostních upozornění a kontrol od Googlu. 
![](https://raw.githubusercontent.com/seznam/sklikscripts/master/wiki/manual_01.jpg?token=AH71AfnNNdAzjzAyDdDy24TQGLDMZEO-ks5bH4CkwA%3D%3D)
![](https://raw.githubusercontent.com/seznam/sklikscripts/master/wiki/manual_02.jpg?token=AH71ASd3Jhye4jd_YM9-aOo1NmSa5wtVks5bH4ClwA%3D%3D)

Nejprve rozkliknete nabídku „Zobrazit rozšířené možnosti“ a poté zmáčknete tlačítko „Přejít na web Wizard (nezabezpečené)“. Protože skripty nejsou ověřené Googlem, budete vždy upozorněni na případné hrozby. Radíme nepoužívat skripty, kterým nedůvěřujete.

![](https://raw.githubusercontent.com/seznam/sklikscripts/master/wiki/manual_03.jpg?token=AH71AfIqVxNEQTypXeIAoOTb1mP2o8tPks5bH4CpwA%3D%3D)

## Popis nastavení
**Token** neboli API Klíč je speciální řetězec, který slouží k vašemu ověření. Můžete si ho nechat vytvořit ve svém Skliku – stačí vpravo kliknout na svůj e-mail a poté na tlačítko „Nastavení“ (skryté pod ikonou ozubeného kolečka). V dolní části stránky pak zvolíte nápis „Získat přístup k API“, a tím dojde k vytvoření tokenu.

**Komunikační email**: Na tento e-mail vám skripty budou posílat informační zprávy.  

## Popis nastavení pro skript kontroly URL
**Uživatelské ID**:  Každý účet má přiřazené svoje ID. To své můžete s pomocí tokenu zjistit například zde: https://bit.ly/2uMuKgL. Skript vám vypíše nejen váš účet, ale i všechny ostatní, které právě spravujete. Máte také možnost zadat více účtů najednou, bude ale třeba oddělit je tímto symbolem |.
Pamatujte, že musíte mít vždy právo ke správě účtu.

**ID Kampaní**: Pokud je váš účet příliš velký nebo vás zajímají jen některé kampaně, můžete zadat pouze jejich ID. V takovém případě je budete opět oddělovat prostřednictvím symbolu |.
Ještě malé varování. Pokud zadáte ID kampaní, můžete mít zadané pouze jedno uživatelské ID. Je to dáno tím, že skript kontroluje pouze první uživatelské ID, pod které musí spadat všechny ID kampaní. 

**Zasílání emailu**: Jakmile skript zkontroluje všechny URL (klidně i při více opakováních), posílá e-mail s reportem. Takový report má PDF podobu a obsahuje seznam otestovaných URL i s jejich statusem. Můžete si také nastavit, že vám report přijde pouze tehdy, když se v testu vyskytne neplatná URL.  

**Zkontrolovat u ...**: Je možné specifikovat, které typy URL se kontrolují.  
**Zahrnout ...**: Podobná možnost je i u statusů položek. Každá jednotka s URL (kromě sitelinků) spadá pod určitou skupinu a kampaň. Pokud je jedna z položek označena stavem „smazané“ a podobně, jsou tyto URL na základě nastavení vyřazeny.

## Nainstalované části na Google Drivu
Následně se vám na Google Drivu vytvoří složka SklikAPI a v něm dva soubory gSetting a testUrl
gSetting: Slouží k uchování nastavení účtu (vyplněno, viz obrázek výše). Je možné je kdykoliv měnit
testUrl: Samotný tělo skriptu.

## Popis nastavení pro skript nových vyhledávacích dotazů
**Uživatelské ID**:  Každý účet má přiřazené svoje ID, které lze zjistit s pomocí tokenu na této adrese: https://bit.ly/2uMuKgL. Skript vám vypíše nejen váš, ale i všechny ostatní účty, které spravujete.
Na rozdíl od testu URL ovšem můžete zadat pouze jednoho uživatele.

**Typ entity**: Mohou nastat případy, kdy jsou vyhledávací dotazy objemově velmi náročné, nebo kdy vás třeba zajímá jenom určitá část účtu. V takových situacích si můžete vybrat, pro které entity zadáváte ID – skript pak kontroluje dotazy pouze v těchto částech. Na výběr máte z možností Celý účet, Kampaně, Sestavy nebo Klíčová slova. 

**ID Entity**: Seznam ID entity, které se opět oddělují znaménkem |. 
  
**Počet zobrazení/prokliků/konverzí**: Skript bude upozorňovat nikoliv na nové vyhledávací dotazy, ale na dotazy, které dosáhnou nastaveného limitu zobrazení, prokliků a konverzí. Upozorňujeme, že musí být splněny **všechny** tyto podmínky.

## Nainstalované části na Google Drivu
Na Google Drive se vám vytvoří složka SklikAPI a v ní dva soubory gSetting i jednotlivé skripty.
**gSetting**: Slouží k zachování nastavení účtu (vyplněno, viz obrázek výše), které můžete kdykoli změnit.
**testUrl**: Skript na test URL.
**NewQueryCheck**: Skript na nové vyhledávací dotazy.

# Sklik API: Test URL
Skript testuje validitu neboli platnost URL ve vašem účtu. V praxi to znamená, že kontroluje, zda se nevyskytla chyba v systému nebo chybná URL, která by vedla například na neexistující stránku 404. Za validní URL se považuje také ta, která vrací Status 200 (stránka se nenačetla).

## Popis
Test si na základě nastavení gSetting načte všechny požadované URL. Ty si pak uloží do pomocného souboru (urlHeap) a následně je začne testovat. Pokud nestihne otestovat všechny adresy během jednoho opakování skriptu, pokračuje pak při opětovném spuštění tam, kde přestal.
Co se týče rychlosti testování, na jednu URL připadá 1 sekunda. Google Apps Script pak běží 6 minut a AdWords půl hodiny. Pokud chcete každý den otestovat všechny URL a máte jich na účtu přibližně 8 000, vyjde kompletní test na cca 22 opakování (8000/360). Proto doporučujeme nastavit vykonávání skriptu každou hodinu, aby na konci dne byl zkontrolovaný celý seznam.

## První spuštění
Před nastavením automatického spouštěče je třeba provést první spuštění ručně. Budete tedy muset opět potvrdit přístup skriptu k některým funkcím Googlu a schválit bezpečnostní výjimku.

![](https://raw.githubusercontent.com/seznam/sklikscripts/master/wiki/manual_04.jpg?token=AH71AZDFoypY5MsYd8gsbw_xk4IEgYM1ks5bH4TtwA%3D%3D)

V levém sloupci otevřete soubor „main.gs“. Pak už stačí na horní liště vybrat „main“ a následně kliknout na šipku.

##Vytvoření nových souboru
Jakmile proběhne první spuštění, vytvoří se ve složce SklikAPI dva nové soubory – urlHeap a log.
**urlHeap**: Obsahuje záznam všech testovaných URL adres a jejich status.
**Log**: Loguje události ve skriptu. Je tedy možné zde vyčíst, co se odehrálo v průběhu jeho provádění. Pokud se skript dokončí a otestuje všechny URL adresy v urlHeap, vytvoří se záloha.
**urlHeap_done**: Zde najdete kompletní výsledek, jehož obsah je vám odeslaný na e-mail. Na rozdíl od urlHeap obsahuje urlHeap_done záznamy úplně dokončeného testu. 

# Sklik API: Nové vyhledávací dotazy
## Popis
Skript hledá ve vašem účtu nové vyhledávací dotazy. Pokud na ně narazí, pošle vám je v přehledné tabulce na e-mail. 
V nastavení skriptu je možné omezit kontrolu jenom pro určité kampaně, sestavy nebo klíčová slova. Můžete sledovat pouze častější dotazy a ty, které mají vyšší počet zobrazení, prokliků a konverzí než stanovené hodnoty.

# První spuštění
Dříve, než si nastavíte automatický spouštěč, je potřeba provést první spuštění ručně. To znamená, že budete muset potvrdit přístup skriptu k některým funkcím Googlu a schválit bezpečnostní výjimku.

V levém sloupci pak otevřete soubor „main.gs“, v horní liště vyberete „main“ a nakonec kliknete na šipku.

# Vytvoření nových souborů
Jakmile proběhne první spuštění, vytvoří se ve složce „SklikAPI“ dva nové soubory – queriesHeap a log.
**queriesHeap**: Obsahuje záznam již dříve načtených vyhledávacích dotazů. Skript porovnává, které dotazy jsou pro něj nové.
**Log**: Loguje události ve skriptu – je tu možné vyčíst, co se v průběhu jeho provádění odehrálo.

# Nastavení automatického spuštění
Upravit: Spouštěče aktuálního projektu

![](https://raw.githubusercontent.com/seznam/sklikscripts/master/wiki/manual_05.jpg?token=AH71AZ5fgOtYW2QVqz3FSF02670z1Su0ks5bH4TxwA%3D%3D)

V kolonce „Spustit“ zvolte možnost „main“ a zbytek nastavte podle svých potřeb. Skript by se neměl spouštět častěji než jednou za 6 minut, jinak bude navzájem přepisovat svoje interní složky a bude nekonzistentní.

# Vícenásobné spouštění
Je možné vytvořit i více stejných skriptů, které budou vykonávat to samé, ale pro jiné účty nebo jiné nastavení. Je třeba přejmenovat nainstalovanou složku přes wizard a ve zdrojovém kódu změnit její ID. Na závěr znovu spustíte wizard a nainstalujete druhý skript.
![](https://raw.githubusercontent.com/seznam/sklikscripts/master/wiki/manual_06.jpg?token=AH71AYP9sK86J1F8bo1IsJm03EvjEcWDks5bH4T0wA%3D%3D)

ID složky lze najít v URL 

![](https://raw.githubusercontent.com/seznam/sklikscripts/master/wiki/manual_07.jpg?token=AH71Aca9R5ffjYgs6KSjjdQwPQnyWvgbks5bH4APwA%3D%3D)


# Skript nefunguje
Může se stát, že se vinou špatného nastavení nebo vlivem jiných okolností skript vůbec nespustí, popřípadě že přestane fungovat během práce. Pro tyto případy se ve složce vytvoří i soubor s názvem log (pozor, nefunguje v AdWords). Do tohoto logu se zapisují základní stavy skriptu.
Pokud potřebujete podrobnější informace, je třeba si zapnout debug mode. Ten spustíte tak, že otevřete skript, zvolíte „main.gs“ a dole si najdete řádek var Debug = false. Pak stačí hodnotu změnit na true. Tento postup funguje ale jen pro test URL.

# Spouštění skriptu URL v AdWords
Skript můžete spustit i v rámci účtu AdWords. Hlavní výhoda je doba jeho chodu – 30 minut bez přerušení, zatímco Apps Script běží 6 minut a spouští se několikrát. Prostředí AdWords má ale bohužel pár změn. V první řadě zde není zapnutý log, což znamená, že se ani nevytváří stejnojmenný soubor, a detekce případných chyb je tak daleko komplikovanější. Dále není možné využít wizard pro automatické vytvoření skriptu, ale je třeba vložit zdrojový kód ručně.
Wizard je ale stejně potřeba spustit, protože i tento skript pracuje s gSetting sheetem a do složky pak ukládá pomocný soubor urlHeap i výsledek kontroly urlHeap_done.


## Nastavení skriptu
![](https://raw.githubusercontent.com/seznam/sklikscripts/master/wiki/manual_08.jpg?token=AH71AYifgnO32oGuHWHS0T7xIyr5WPqOks5bH4XEwA%3D%3D)

Nejprve přidáte nový skript, kam vložíte celý zdrojový kód. Ten je na rozdíl od Apps Script redukovaný do jednoho souboru a najdete ho [ZDE](https://github.com/seznam/sklikscripts/tree/master/src/minify/minify_testurl_v100.js). Skript uložíte a provedete první spuštění volbou funkce „main“. 

Nastavení opakování pak najdete v přehledu skriptů ve sloupci „Frekvence“.
