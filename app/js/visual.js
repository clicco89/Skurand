/* VISUAL FUNCS */
var getOn = function() {
    $(this).css('z-index', 1);
}
var getOff = function() {
    $(this).css('z-index', 0);
}
var max_num_change = function() {
    if(this.value > 99) {
        this.value = 99;
    } else if(this.value < 1) {
        this.value = 1;
    }
}

var main = function() {
    $('#interr-btn, #non-interr-btn').hover(getOn, getOff);
    $('#max-num').change(max_num_change);
}

/* MAIN */
window.$ = window.jQuery = require('./js/jquery.min.js'); //Load jQuery
$(document).ready(main);