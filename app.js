/* VARS */
var electron = require("electron");
var app = electron.app; //Application
var BrowserWindow = electron.BrowserWindow; //Browser
var mainWin = null; //Window

/* MAIN */
app.on('ready', function() {
    mainWin = new BrowserWindow({ //Creo una nuova finestra non resizabile
        width: 300,
        'minWidth': 300,
        height: 450,
        'minHeight': 450,
        title: "Skurand"
    });
    mainWin.setMenu(null); //Rimuovo l'eventuale menu
    mainWin.loadURL('file://'+__dirname+'/app/main.html'); //Carico la pagina
});

//Esco quando le finestre sono chiuse
app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});
