/* VARS */
var remote = require('electron').remote; //Ottengo il processo padre
var app = remote.app; //Richiedo api app
var fs = require('fs'); //Ottengo l'api fs da node.js
var path = require('path'); //Ottengo l'api path da node.js
var dialog = remote.dialog; //Richiedo una finestra di dialogo
var app_path = remote.app.getAppPath(); //Richiedo il percorso dell'applicazione

var settings_path = ""; //Ottengo percorso impostazioni
var settings; //all = tutti gli alunni
              //interr = alunni interrogati
              //estr = alunni estratti per ultimi
var temp_settings; //Settings prima di salvare
var interr_history = []; //Cronologia estrazioni

var selected_stud_index = []; //Studenti selezionati lista esclusioni

var estracted_nums = []; //Numeri estratti (NUMBER-MODE)

let closeWindow = false; //Lascia che la finestra si chiuda

/* EXTENSIONS */
Array.prototype.clean = function(deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {         
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};

/* BASE-FUNCS */
var getUninterr = function() { //Ottiene gli studenti non interrogati e il loro index
    var result = {
        'students': [],
        'index': []
    }

    for(i = 0; i < temp_settings.students.length; i++) {
        if(temp_settings.students[i].interr == 0) {
            if($.inArray(i, selected_stud_index) == -1) { //Se non è nella lista esclusioni
                result.students.push(temp_settings.students[i]);
                result.index.push(i);
            }
        }
    }

    return result;
}
var toggleMenu = function() {
    $('.open-menu').toggleClass('x'); //Cambio il tasto
    //Apre o chiude il menu
    if($('.menu').hasClass('opened')) {
        $('.menu').removeClass('opened');
    } else {
        $('.menu').addClass('opened');
    }
}
var emptyEstractedList = function() { //Svuota la lista studenti
    $('#interr-students').empty();
    interr_history = [];
}
var updateStudList = function() {
    $('#students-panel').empty();
    temp_settings.students.forEach(function(v, i) {
        if(v.interr == 1) {
            $('#students-panel').append('<div><div class="student-selector"><input type="checkbox"/></div><div class="student-name"><input type="text" value="'+v.name+'"/></div><div class="student-state">SI</div></div>');
        } else {
            $('#students-panel').append('<div><div class="student-selector"><input type="checkbox"/></div><div class="student-name"><input type="text" value="'+v.name+'"/></div><div class="student-state">NO</div></div>');
        }
    });
    //Rimpristino il tasto 'seleziona tutto'
    $('#select-all input')[0].checked = false;
    //Imposto gli eventi
    $('.student-name input').change(student_name_change);
}
var updateStudListEsc = function() {
    $('#students-panel-esc').empty();
    temp_settings.students.forEach(function(v, i) {
        if($.inArray(i, selected_stud_index) == -1) {
            $('#students-panel-esc').append('<div><div class="student-selector"><input type="checkbox"/></div><div class="student-name">'+v.name+'</div></div>');
        } else {
            $('#students-panel-esc').append('<div><div class="student-selector"><input type="checkbox" checked/></div><div class="student-name">'+v.name+'</div></div>');
        }
    });
    //Imposto gli eventi
    $('#students-panel-esc .student-selector input').click(student_selector_click);
}
var makeAllUninterr = function() { //Rende tutti gli studenti da interrogare
    for(i = 0; i < temp_settings.students.length; i++) {
        temp_settings.students[i].interr = 0;
    }
    emptyEstractedList();
}
var emptyStudListEsc = function() {
    $('#students-panel-esc').empty();
    selected_stud_index = [];
}
var getUninterrNums = function() { //Ottiene i numeri non estratti
    var numbers = [];

    for(i = 1; i <= $('#max-num')[0].value; i++) {
        if($.inArray(i, estracted_nums) == -1) { //Se non è già stato selezionato
            numbers.push(i);
        }
    }

    return numbers;
}

/* SETTINGS FUNCS */
var saveSett = function() {
    if(settings_path == "") { //
        var temp_path = dialog.showSaveDialog(remote.getCurrentWindow(), {
            title: 'Skurand - Salva come...',
            defaultPath: app_path,
            filters: [{name: 'Interrogazione', extensions: ['skur']}]
        });
        if(temp_path === undefined) return false;
        else settings_path = temp_path;
    }

    document.title = 'Skurand - '+path.basename(settings_path);

    fs.writeFileSync(settings_path, CryptoJS.AES.encrypt(JSON.stringify(temp_settings), "weu89f7823hjdj23I)JA)SD123dsa°ç+àà")); //Scrivo le impostazioni nell'apposito file (cryptate)
    settings = temp_settings;
}
var initSett = function() {
    emptyEstractedList();

    if(settings_path != "") {

        document.title = 'Skurand - '+path.basename(settings_path); //Imposto il titolo del documento

        settings = temp_settings = JSON.parse(CryptoJS.AES.decrypt(fs.readFileSync(settings_path).toString(), "weu89f7823hjdj23I)JA)SD123dsa°ç+àà").toString(CryptoJS.enc.Utf8)); //Ottengo il salvataggio e lo decrypto
 
    } else {

        document.title = 'Skurand - Nuovo';

        settings = temp_settings = JSON.parse('{"students": []}'); //Creo un oggetto contenente le impostazioni
    }
}
var askSaveSett = function() {
    if(JSON.stringify(temp_settings) != JSON.stringify(settings)) { //Se le modifiche non sono state salvate
        var answer = dialog.showMessageBox(remote.getCurrentWindow(), {
            title: 'Skurand',
            message: 'L\'interrogazione non e\' stata salvata...\nSi vuole salvarla ora?',
            buttons: ['Yes', 'No', 'Cancel'],
            type: 'question'
        });
        if(answer == 0) return saveSett();
        else if(answer == 2) return false;
    }
    return true;
}

/* EVENT HANDLER */
/* MENU */
var open_menu_click = toggleMenu;
var menu_btn_click = toggleMenu;
var nuovo_menu_btn_click = function() {
    if(askSaveSett() !== false) {
        settings_path = "";
        initSett();
        //Aggiorno il pannello di controllo
        if(!$('#pannello-di-controllo').hasClass('hidden')) {
            updateStudList();
        } else if(!$('#lista-esclusioni').hasClass('hidden')) {
            updateStudListEsc();
        }
    }
}
var apri_menu_btn_click = function() {
    if(askSaveSett() !== false) {
        var path = dialog.showOpenDialog(remote.getCurrentWindow(), {
            title: 'Skurand - Apri...',
            defaultPath: app_path,
            filters: [{name: 'Interrogazione', extensions: ['skur']}],
            properties: ['openFile']
        });
        if(path !== undefined) {
            settings_path = path[0];
            initSett();

            if(!$('#pannello-di-controllo').hasClass('hidden')) {
                updateStudList();
            } else if(!$('#lista-esclusioni').hasClass('hidden')) {
                updateStudListEsc();
            }
        }
    }
}
var salva_menu_btn_click = saveSett;
var salvacome_menu_btn_click = function() {
    var temp_path = dialog.showSaveDialog(remote.getCurrentWindow(), {
        title: 'Skurand - Salva come...',
        defaultPath: app_path,
        filters: [{name: 'Interrogazione', extensions: ['skur']}]
    });
    if(temp_path !== undefined) {

        document.title = 'Skurand - '+path.basename(settings_path);

        settings_path = temp_path;
        saveSett();
    }
}
var estrazione_menu_btn_click = function() {
    $('#estrazione').removeClass('hidden');
    $('#pannello-di-controllo').addClass('hidden');
    $('#lista-esclusioni').addClass('hidden');
    $('#number-mode').addClass('hidden');
}
var panndicontrol_menu_btn_click = function() {
    $('#estrazione').addClass('hidden');
    $('#pannello-di-controllo').removeClass('hidden');
    $('#lista-esclusioni').addClass('hidden');
    $('#number-mode').addClass('hidden');
    updateStudList();
}
var lista_esc_menu_btn_click = function() {
    $('#estrazione').addClass('hidden');
    $('#pannello-di-controllo').addClass('hidden');
    $('#lista-esclusioni').removeClass('hidden');
    $('#number-mode').addClass('hidden');
    updateStudListEsc();
}
var number_menu_btn_click = function() {
    $('#estrazione').addClass('hidden');
    $('#pannello-di-controllo').addClass('hidden');
    $('#lista-esclusioni').addClass('hidden');
    $('#number-mode').removeClass('hidden');
}

/* ESTRAI SCREEN */
var estrai_click = function() {
    var uninterr_stud = getUninterr();

    if(uninterr_stud.students.length > 0) {
        var num = Math.floor(Math.random() * uninterr_stud.students.length);
        temp_settings.students[uninterr_stud.index[num]].interr = 1;
        interr_history.push(uninterr_stud.index[num]); //Aggiorno la cronologia
        $('#interr-students').append('<div>'+uninterr_stud.students[num].name+'</div>');
    } else {
        var answer = dialog.showMessageBox(remote.getCurrentWindow(),
        {
            title: 'Skurand',
            message: 'Non vi sono studenti da interrogare.\n',
            buttons: ['Reimposta la LISTA ESCLUSIONI','Riinizia il giro','Cancel'],
            type: 'info'
        });
        if(answer == 0) {
            emptyStudListEsc();
            emptyEstractedList();
        } 
        else if(answer == 1) {
            makeAllUninterr();
            emptyEstractedList();
        }
    }
}
var indietro_click = function() {
    if(interr_history.length > 0) {
        var index = interr_history.pop();
        $('#interr-students div:contains('+temp_settings.students[index].name+')').remove(); //Rimuovo il nome dalla lista interrogati
        temp_settings.students[index].interr = 0;
    } else {
        dialog.showMessageBox(remote.getCurrentWindow(), {
            title: 'Skurand',
            message: 'Non e\' presente niente nella lista interrogati!',
            buttons: ['OK'],
            type: 'info'
        });
    }
}
var cancella_click = function() {
    if($('#interr-students > div').length > 0) {
        var answer = dialog.showMessageBox(remote.getCurrentWindow(),
        {
            title: 'Skurand',
            message: 'Si e\' sicuri di volere svuotare la lista?',
            buttons: ['Yes', 'No'],
            type: 'warning'
        });
        if(answer == 0) {
            emptyEstractedList();
        }
    }
}

/* PANNELLO DI CONTROLLO */
var select_all_click = function() {
    if($('#students-panel > div').length == 0) {
        this.checked = false;
    } else if(this.checked) {
        $('#students-panel > div').each(function(i, v) {
            $(v).find('.student-selector input')[0].checked = true;
        });
    } else {
        $('#students-panel > div').each(function(i, v) {
            $(v).find('.student-selector input')[0].checked = false;
        });
    }
}
var student_name_change = function() {
    temp_settings.students[$(this).parent().parent().index()].name = this.value;
}
var interrogato_click = function() {
    $('#students-panel > div').each(function(i, v) {
        if($(v).find('.student-selector input')[0].checked) { //Se e' selezionato
            temp_settings.students[i].interr = 1;
        }
    });
    updateStudList();
}
var non_interrogato_click = function() { //-------------- !NON!
    $('#students-panel > div').each(function(i, v) {
        if($(v).find('.student-selector input')[0].checked) { //Se e' selezionato
            temp_settings.students[i].interr = 0;
        }
    });
    updateStudList();
}
var aggiungi_click = function() {
    temp_settings.students.push({
        name: 'Sconosciuto'+$('#students-panel > div').length,
        interr: 0
    });
    updateStudList();
}
var rimuovi_click = function() {
    if($('#students-panel > div').length > 0) {
        var answer = dialog.showMessageBox(remote.getCurrentWindow(),
        {
            title: 'Skurand',
            message: 'Si e\' sicuri di volere rimuovere gli studenti selezionati?',
            buttons: ['Yes', 'No'],
            type: 'warning'
        });
        if(answer == 0) {
            $('#students-panel > div').each(function(i, v) {
                if($(v).find('.student-selector input')[0].checked) { //Se e' selezionato
                    temp_settings.students[i] = undefined;
                }
            });
            temp_settings.students.clean(undefined);
            updateStudList();
        }
    }
}
var pannello_btns_click = emptyEstractedList; //Reinposto la lista estratti

/* LISTA ESCLUSIONI */
var student_selector_click = function() {
    if(this.checked) {
        selected_stud_index.push($(this).parent().parent().index());
    } else {
        selected_stud_index.splice($.inArray($(this).parent().parent().index()), 1);
    }
}

/* NUMBER-MODE */
var estrai_num_click = function() {
    var numbers = getUninterrNums();

    if($('#max-num')[0].value > 99 || $('#max-num')[0].value < 1) {
        dialog.showMessageBox(remote.getCurrentWindow(),
        {
            title: 'Skurand',
            message: 'Impostare un numero da 1 a 99.',
            buttons: ['OK'],
            type: 'info'
        });
    } 
    else if(numbers.length > 0) {
        var num = Math.floor((Math.random() * numbers.length));
        estracted_nums.push(numbers[num]);
        $('#number-list').append('<div>'+numbers[num]+'</div>');
    } 
    else {
        var answer = dialog.showMessageBox(remote.getCurrentWindow(),
        {
            title: 'Skurand',
            message: 'Non vi sono studenti da interrogare.\nRiiniziare il giro?\n',
            buttons: ['Yes', 'No'],
            type: 'info'
        });
        if(answer == 0) {
            $('#number-list').empty();
            estracted_nums = [];
        } 
    }
}
var cancella_num_click = function() {
    $('#number-list').empty();
    estracted_nums = [];
}

var main = function() {
    initSett();

    /* Set event handler */
    //Menu
    $('.open-menu').click(open_menu_click);
    $('.menu div').click(menu_btn_click);
    $('#nuovo-menu-btn').click(nuovo_menu_btn_click);
    $('#apri-menu-btn').click(apri_menu_btn_click);
    $('#salva-menu-btn').click(salva_menu_btn_click);
    $('#salvacome-menu-btn').click(salvacome_menu_btn_click);
    $('#estrazione-menu-btn').click(estrazione_menu_btn_click);
    $('#panndicontrol-menu-btn').click(panndicontrol_menu_btn_click);
    $('#lista-esc-menu-btn').click(lista_esc_menu_btn_click);
    $('#number-menu-btn').click(number_menu_btn_click);

    //Estrai screen
    $('#estrai').click(estrai_click);
    $('#indietro').click(indietro_click);
    $('#cancella').click(cancella_click);

    //Pannello di controllo
    $('#select-all input').click(select_all_click);
    $('#interr-btn').click(interrogato_click);
    $('#non-interr-btn').click(non_interrogato_click);
    $('#aggiungi-btn').click(aggiungi_click);
    $('#rimuovi-btn').click(rimuovi_click);
    $('#pannello-btns').click(pannello_btns_click);

    //Number-mode
    $('#estrai-num').click(estrai_num_click);
    $('#cancella-num').click(cancella_num_click);
}

/* MAIN */
window.$ = window.jQuery = require('./js/jquery.min.js'); //Load jQuery
$(document).ready(main);

//Close handler
window.addEventListener('beforeunload', function(evt) {

    if (closeWindow) return;

    evt.returnValue = false;

    setTimeout(function() {
        if (askSaveSett() === true) {
            closeWindow = true;
            remote.getCurrentWindow().close();
        }
    });
});
