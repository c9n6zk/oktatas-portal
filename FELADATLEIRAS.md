# Modern fullStack és mobil fejlesztői verseny – Feladatleírás

> A 2026-05-11-i verseny során kapott eredeti feladatleírás teljes szövege, referenciaként megőrizve.

A verseny feladata egy oktatásszervezéssel kapcsolatos portál megvalósítása, mely elsősorban a középiskolai felhasználást célozza meg.

A cél egy olyan teljes alkalmazás elkészítése, amely backendből, adatbázisból, frontendből/mobil felületből áll. Ezeknek a helyes inicializálása, konfigurálása is a versenyfeladat része, a zsűrinek biztosítani kell a saját gépen való tesztelés lehetőségét.

A következőekben a rendszerrel szemben elvárt, illetve opcionálisan megvalósítható feladatötleteket írunk le.

## 1. Kötelezően megvalósítandó funkcionalitás

A portál használatához a felhasználóknak mindenképp szükséges bejelentkezniük, ugyanis ez fogja azonosítani és az elérhető funkciókat biztosítani. Három fő felhasználói típust kell megvalósítani:

- **Diák**: Tárgyak, tárgyeredmények megtekintése.
- **Oktató**: Tanított tárgyak kezelése, eredmények beírása
- **Adminisztrátor**: Hallgató/Oktató fiókok kezelése, tárgyak létrehozása, hozzárendelése osztályokhoz.
- **Szuper-adminisztrátor**: Adminisztrátorok és Szuper-adminisztrátorok kezelése

Minden diák egy osztályhoz tartozik, melyet egyértelműen azonosít a kezdés időpontja és az osztály azonosítója (pl. 2009/C).

Egy tárgy tartalmaz általános információkat, mint például leírás a tárgyról, milyen könyv szükséges, milyen leckékből áll stb. Minden évben az osztályokhoz hozzá kell rendelni az osztályhoz tartozó tárgyakat. Ez a hozzárendelés tartalmazza, hogy melyik oktató tartja az évben az osztálynak a tárgyat.

Az oktató az adott évben a hozzá rendelt tárgyakból tud jegyet beírni egy hallgatónak. Az év végén az oktatónak képesnek kell lennie egy év végi jegy beírására.

## 2. Opcionális feladatok

A verseny része a rendszer részletes kitalálása és megtervezése, melybe a pontos funkciók is beletartoznak. Érdemes figyelni arra, hogy a teljes feladat megvalósítására csak 3 óra áll rendelkezésre: többet ér egy egyszerűbb, de teljesen elkészített funkció, mint egy bonyolultabb, de csak részben működő. Itt felsorolunk pár ötletet, melyeket elég akár csak részben teljesíteni, és ezek mellett saját ötleteket is értékelünk!

- **Féléves jegy beírása**: Az oktató legyen képes egy félévi jegy beírására.
- **Átlagok számítása**: A beírt érdemjegyekből a rendszer számoljon átlagokat, melyeket megjelenít az oktatónak az év végi jegy beírásánál. Lehessen a jegyeket különböző súlyokkal ellátni (pl. felelés 1x, témazáró 3x), ezeket vegye figyelembe az átlagszámításnál. Statisztikákon keresztül egy oktató láthassa egy osztály átlagos eredményeit is.
- **Események létrehozása**: Adminisztrátor létre tud hozni iskolai eseményeket, melyeket a hallgatók és oktatók meg tudnak tekinteni.
- **Üzenetküldő funkció**: Hallgató-Oktató között kétirányú üzenetküldési funkció.
- **Iskola térkép**: A hallgatók és oktatók meg tudják tekinteni az iskola épületét, termek helyét.
- **Szavazás – kérdőív**: Az adminok létre tudnak hozni kérdőíveket, amikre a hallgatók és oktatók tudnak válaszolni. A kérdőíveket opcionálisan lehet szűkíteni hallgatókra, oktatókra, illetve osztályokra.
- **Iskolai AI chatbot**: Chatbot integrálása a platformba.
- **Social Network integráció**.
- **Beadandók online kezelése**: Egy oktató egy adott tárgyhoz ki tud írni feladatokat, melyre a hallgatók online fel tudják tölteni a megoldásukat. Az oktató ezeket ki tudja értékelni. Az eredmény beíródik a tárgy eredményei közé.
- **Órarendek**: A tárgy-osztály hozzárendelésnél tárolásra kerül, hogy a hét melyik napján melyik órájában tartják a tárgyat (több óra is lehet egy héten). A hozzárendelést adminisztrátor kezeli. Hallgatók és oktatók meg tudják tekinteni, mikor milyen tárgyon kell lenniük. Az oktatók tudnak jelenlétet jelölni a hallgatóknak. Egy-egy időpontra lehessen helyettesítőtanárt is keresni!
- **Csoportok**: Gyakran előfordul, hogy osztályok vegyülnek bizonyos tárgyaknál, illetve hogy az osztályon belül külön részekre szakadnak a hallgatók (pl. nyelvi tárgyak oktatása több osztálynak, haladó – kezdő matematika, specializáció). Biztosítson csoportkezelést, melyben tetszőleges hallgatót egy csoporthoz lehet rendelni, és ezt a csoportot ugyanúgy egy tárgyhoz lehet rendelni, mint az osztályokat!
- **Accessibility funkciók** (light/dark mód, kontrasztos mód).

## 3. Egyéb követelmények

A rendszerrel szembeni elvárások megegyeznek egy átlagos publikusan is elérhető szolgáltatás követelményeivel, mint például:

- Az adatbázis perzisztensen tárolja az adatokat.
- A szerver képes legyen párhuzamosan több felhasználót is kiszolgálni.
- A belépési adatokat biztonságosan tárolja a rendszer.

A weboldalnak mobil eszközön is megfelelően kell megjelennie egy reszponzív felület formájában. Extra pont jár egy különálló natív vagy cross-platform mobilalkalmazásért, ha az valamilyen mobil-specifikus funkcionalitást tartalmaz, mint például értesítések, kamera vagy helyadatok felhasználása.

A feladat megoldásához tetszőleges nyílt forráskódú könyvtár, keretrendszer (akár CMS) használható!

AI technológiák használata megengedett, de a felhasznált eszközöket és a segítség mértékét egy külön nyilatkozatban dokumentálni kell!

## 4. Dokumentáció és leadás

Az elkészült rendszer komponenseit értékelés szempontjából egy vagy több zsűritag tesztelni fogja. Ennek biztosításához a két lehetőséget tudunk felajánlani:

- Felhőben futó megoldás esetén elég egy link a weboldalra, alkalmazás esetén a telepítőfájl megosztása a beadásnál. Ilyenkor a szerver és adatbázis futtatása a hallgató felelőssége.
- A zsűritagok saját eszközeik futtatják az adatbázist, a szervert és a weboldalt is. Ebben az esetben világos és könnyen követhető telepítési, inicializálási lépéseket kell mellékelni.

A szükséges információkat a `README.md` fájlban kell mellékelni.

A végső beadás egy megosztott GitHub repository formájában történik. A repository rendezettségére is jár pont.

## 5. Értékelési szempontok

| Értékelési terület | Szempont | Pont |
|---|---|---|
| Kompakt működés | Kulcs funkciók, menüpontok és funkciók átláthatósága, kompakt működés | 10 |
| Részletes funkcionalitás | Üzleti logika átgondoltsága és funkcionalitás gazdagsága | 10 |
| Szerepkörök és kapcsolódó funkciók megvalósítása | Szerepkörkezelés és jogosultsági modell kidolgozottsága | 5 |
| Kommunikáció | Kommunikációs technológiák, gyors és hatékony adatelérés | 10 |
| Adatkezelés és architektúra | Adatmodell bővíthetősége | 5 |
| Architektúra | Architektúra, modularitás, skálázhatóság | 10 |
| Karbantarthatóság | Kódminőség, karbantarthatóság, hatékonyság | 10 |
| Hibakezelés | Hibakezelés, naplózás, megbízhatóság | 5 |
| Minőség és megbízhatóság | Biztonsággal kapcsolatos implementációk | 5 |
| Felhasználói felület és élmény | Felhasználói élmény, UX, accessibility, logikus navigáció, reszponzivitás | 5 |
| Mobilitás | Mobil kliens megléte és funkcionalitása (dedikált natív vagy cross-platform mobil kliens / natív funkciók előny, elég csak egy platformra) | 10 |
| Fejlesztési és üzemeltetési érettség | Telepíthetőség és futtatási dokumentáció minősége | 5 |
| Fejlesztési és üzemeltetési érettség | GitHub repository rendezettsége, projektstruktúra átláthatósága | 5 |
| Innováció | Kreativitás és innovatív megoldások | 5 |
| **Összesen** | | **100** |
