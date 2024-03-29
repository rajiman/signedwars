 var App = {};


/////////////////////////////////////////////////////////////////////////
//
//		Application Functions
//
//

 //Force answer inputs to size=1
 App.limitInputSize = function () {
    $('div.prob input').attr('size', '1');
 }

 //Show modeselect divs if js enabled.
 //Distinguish 'off' condition with grayed out text
 //Hide radio btns when report visible to disable control but leave text
 App.prepModeselect = function () {

    var modesel  = $('div.modeselect'),
        noreport = $('#reportwrap').length == 0;

    modesel.each(function() {
	$(this).show().find('input').each(function() {

	    var $inp    = $(this),
		inpSpan = $inp.parent('span'); //input is wrapped in span

	    if(noreport) {

    	    	if(inpSpan.hasClass('modeon') && $inp.is(':visible') ){ //currently off 

	    	    inpSpan.css({backgroundColor:'gray'});
	    	    inpSpan.siblings('span').css({color:'gray'}); //text span follows
	    	}

	    } else { //hide radio btn and gray out div if report 
	    	inpSpan.hide();
	    	inpSpan.siblings('span').css({color:'gray'}); //text span follows
	    }
	});
    });

 }

 //Show panelctrl divs if js enabled.
 //Animate paneltips on mouseover/mouseout of panelctrl divs
 App.prepPanelctrl = function () {

    var pctrl = $('div.panelctrl'),
        panel = $('div.paneldisplay');

    pctrl.show();

    pctrl.mouseover(function($e) {
	var pid = $(this).attr('id').substr(5); //strip 'panel' from id to get specific panel
  	if ( !panel.is(':visible') ){
	    $('#'+pid+'tip').animate({width: 'toggle' }, 500); //animate panel tip
    	}
    });

    pctrl.mouseout(function($e) {
	var pid = $(this).attr('id').substr(5); //strip 'panel' from id to get specific panel
	if( $('#'+pid+'tip').is(':visible') ) {
	    $('#'+pid+'tip').animate({width: 'toggle' }, 500);
	}
    });
    
 }

  App.prepPaneldisplay = function () {

    $('div.panelctrl').live('click',function($e) {

	var pnlid  = $(this).attr('id'),
	    pset   = $('div.psetwrap'), //either horizontal or vertical
	    report = $('div#reportwrap');

	// Hide previously open panels, keypad, timer, paneltips 
	// before showing new panel.
	// showProblemdisplay() will take care of showing them again.
	$('div.panelcontent').hide(); 
	$('div#keypad').hide(); 
	$('div.timerwrap').hide();
 	$('div.paneltip').hide();

	// If report is open hide w/animation.
	// Otherwise hide problem set w/animation.
	// If they are already hidden just toggle panel.
	if(report.length != 0) {
	    if( report.is(':visible') ) {
  	        report.slideUp(300, function() {
				togglePanels(pnlid);

  	        });
	    } else { //report already hidden
				togglePanels(pnlid);
	    }
	} else { //psetwrap div always present so must check reportwrap first
	    if( pset.is(':visible') ) {
  	    	pset.slideUp(300, function() {//'single' mode doesnt slide due to floated element
				togglePanels(pnlid);
  	    	});
	    } else { //problem set already hidden
				togglePanels(pnlid);
	    }
	    
	}
    });


    // Open or close depending on present state.
    function togglePanels(id) {

    	var thispnl    = $('#'+id), // clicked panelctrl
            pnldisplay = $('#display'+id.substr(5)), // strip 'panel'
            pnlcontent = $('#content'+id.substr(5)),
            pnlctrl    = $('div.panelctrl'), // all panelctrl
            otherpnl; // use to check for other open panel


    	// Toggle class for clicked panel.
    	if(thispnl.hasClass('displayopen') ) {
	    thispnl.removeClass('displayopen'); 
    	} else {
	    thispnl.addClass('displayopen'); 
    	}

    	// Check for other panel(not clicked) being open. 
    	// If open update class and set otherpnl to animate hide (below).
    	pnlctrl.not('#'+id).each(function() { //dont use thispnl because it is a jquery object
	    var $pnl = $(this);
	    if($pnl.hasClass('displayopen') ) {
	    	$pnl.removeClass('displayopen'); 
	    	otherpnl = $pnl.attr('id');
	    }
    	});


    	// animate panel open/close based on current state,
    	// then show content or show problems/report.
    	if (otherpnl == undefined) {
  	    pnldisplay.animate({
    	    		width: 'toggle' }, 
			1000, 
    			'easeOutBounce',
			function() {
				if (!thispnl.hasClass('displayopen')) {
				    showProblemdisplay(); //closing so get problems/report
				} else {
				    pnlcontent.show(); //opening so show content
				}
  	    });
    	} else {
  	    $('#display'+otherpnl.substr(5)).animate({
    	    		width: 'toggle' }, 
			1000, 
    			'easeOutBounce',
			function() {
  			    pnldisplay.animate({
    	    				width: 'toggle' }, 
					1000, 
    					'easeOutBounce',
					function() {
					    if (!thispnl.hasClass('displayopen')) {
					    	showProblemdisplay(); //closing
					    } else {
					    	pnlcontent.show(); //opening so show content
					    }
  			    });
  	    });
    	}
     } //togglePanels


     // If panels closing show problemset/report w/animation and show appropriate modes
     function showProblemdisplay () {


    	var report    = $('div#reportwrap'),
	    pset      = $('div.psetwrap'), //either horizontal or vertical
            padmode   = App.getPadmode(),
            timermode = App.getTimermode();


    	if(report.length != 0) {
  	    report.slideDown( 300, function(){
			    	if(padmode == 'on') {
			    	    $('div#keypad').show();
			    	}
			    	if(timermode == 'on') {
			    	    $('div.timerwrap').show();
			    	}
				App.publish('findFocus', ['get']);
	    });
    	} else { //psetwrap div always present so must check reportwrap first
  	    pset.slideDown( 300, function(){
			    	if(padmode == 'on') {
			    	    $('div#keypad').show();
				}
			    	if(timermode == 'on') {
			    	    $('div.timerwrap').show();
			    	}
				App.publish('findFocus', ['get']);
	    });
    	}
     }//showProblemdisplay

 }//prepPaneldisplay


 App.prepOptionCookies = function () {

/* IE needs binding to 'click'  for radio,select inputs	*/
    $('#opmode input[type=radio]').live('click', function($e) {
	App.setCookie('opmode', this.value, 30, '/');
    });
     
    $("#sizemode select").live('click', function() {
	App.setCookie('sizemode', this.value, 30, '/');
    });
     
    $("#rangemode select:eq(0)").live('click', function() {
	App.setCookie('rangemode0', this.value, 30, '/');
    });
     
    $("#rangemode select:eq(1)").live('click', function() {
	App.setCookie('rangemode1', this.value, 30, '/');
    });
     
    $("#opmode select:eq(0)").live('click', function() {
	App.setCookie('timesmode', this.value, 30, '/');
    });
     
    $("#opmode select:eq(1)").live('click', function() {
	App.setCookie('expmode', this.value, 30, '/');
    });
     

    $("#reportmode input:eq(0)").live('click', function() {
	if($(this).is(':checked')){
	    App.setCookie('reportmode0', this.value, 30, '/');
	} else {
	    App.setCookie('reportmode0', 'off', 30, '/');
	}
    });

    $("#reportmode input:eq(1)").live('click', function() {
	if($(this).is(':checked')){
	    App.setCookie('reportmode1', this.value, 30, '/');
	} else {
	    App.setCookie('reportmode1', 'off', 30, '/');
	}
    });

    $("#reportmode input:eq(2)").live('click', function() {
	if($(this).is(':checked')){
	    App.setCookie('reportmode2', this.value, 30, '/');
	} else {
	    App.setCookie('reportmode2', 'off', 30, '/');
	}
    });
     
 }

 App.prepKeypad = function () {

    $('div#keypad span').live('click',function($e) {
	var key = $(this).text();
	App.publish('findFocus', ['keypad', key]);
    });

 }


 App.checkKeypadmode = function () {
    var padmode = App.getPadmode();

    if(padmode == 'on') {
    	$('div#keypad').show();
    } else {
    	$('div#keypad').hide();
    }
 }


 //use .live to cover both findFocus() and native TAB
 App.updateInputClass = function () {

    $('div.prob input').live('focus',function() { 
	$('div.prob').removeClass('current');
	$(this).parent().parent().addClass('current');
    });
 }



 App.prepControls = function () {


    // Records/Problems, Start Again, Logout
    $('a.control').live('click',function($e) {

	var action = this.href.split('/').reverse()[0];

	if(action != 'logout') {

	    $e.preventDefault();
	    App.stopTimer();

	    $.get(this.href, 
		function(data) {
		    var content = $(data).find('#wrap');
		    $('#content').html(content);

    		    App.loadTimer(App.getTimerStored());//todo:instead use cahced timer?
 		    App.publish('prepApp');
		    App.publish('findFocus', ['post']);
	    });
	}
    });

    //If more than one page
    $('a.getpage').live('click',function($e) {

	$e.preventDefault();
	App.stopTimer();

	var timer   = App.getTimerCurrent(),
	    pagekey = this.href.split('?')[1],
	    posted  = $("form#answerform").serialize()+'&submit=page&timer='+timer+'&'+pagekey;

	$.post('/check', posted,
		function(data) {

		    var content = $(data).find('#wrap');
		    $('#content').html(content);

		    //find appropriate timer value
		    if((data.search('statusnew') != -1)) {
			App.loadTimer(0);
		    } else if((data.search('statusactive') != -1)) {
    		    	App.loadTimer(App.getTimerStored());
			App.startTimer();
		    } else { // done 
    		    	App.loadTimer(App.getTimerStored());
			App.stopTimer();
		    }

 		    App.publish('prepApp');
		    App.publish('findFocus', ['post']);
	});
    });

    //	Check, New, Clear			
    $('div#controls input[type=submit]').live('click', function($e) {

	$e.preventDefault();
	App.stopTimer();

	var timer = App.getTimerCurrent(),
	    posted = $("form#answerform").serialize()+'&submit='+this.value+'&timer='+timer;

	$.post('/check', posted,
		function(data) {

		    var content = $(data).find('#wrap');
		    $('#content').html(content);

		    //find appropriate timer value
		    if((data.search('statusnew') != -1)) {
			App.loadTimer(0);
		    } else if((data.search('statusactive') != -1)) {
    		    	App.loadTimer(App.getTimerStored());
			App.startTimer();
		    } else { // done 
    		    	App.loadTimer(App.getTimerStored());
		    }

 		    App.publish('prepApp');
		    App.publish('findFocus', ['post']);
	});
    });
    
    //	Modeselects: viewmode, runmode, padmode, timermode
    $('div#controls input[type=radio]').live('click', function($e) {

	App.stopTimer();

	var $radio     = $(this),
	    selectmode = $radio.attr('name'),
	    selectval  = $radio.val(),
	    timerval   = App.getTimerCurrent(),
	    posted     = $("form#answerform").serialize()+'&submit=Radio&timer='+timerval,
	    timersav   = $('.timerwrap').html(),
	    statssav   = $('#statistics').html();

	$.post('/check', posted,
		function(data) {

		    var content = $(data).find('#wrap');
		    $('#content').html(content);

    		    // App.findFocus needs adjusted empty flag 
		    // for non db stored but filled answers.
		    $('div.prob').each(function(index){ 
			var $prob = $(this);
	   		if($prob.find('div.answer input').val() != '') {
			    $prob.removeClass('empty');
	   		}
		    });

		    $('.timerwrap').html(timersav); 
		    $('#statistics').html(statssav);

		    App.checkTimermode();

 		    App.publish('prepApp');
		    App.publish('findFocus', ['post']);
	});
    });

    // 	Print Preview, Print Record
    $('div#recordopts a').live('click', function($e) {

	$e.preventDefault();

	var $option  = $(this),
	    winsrc   = $option.attr('href'),
	    wintitle = $option.attr('title'),
    	    winparam = "width=780,height=600",
	    action   = this.href.split('/').reverse()[0];

	if(action == 'printpreview') {

	    window.open( winsrc, 'PrintPreview', winparam);

    	} else if(action == 'print') {

	    window.print();

    	} else if(action == 'close') {

	    $('div#recordWrap').hide();
	}
    });
 }


 //jquerytools tooltips, replaces native title box on hover
 App.registerTips = function () {

    $(".modeselect").not('#timermode').each(function() { 
	var $mode = $(this);
    	if($mode.find('span.modeon').is(':visible')) { //only display if off
	    $mode.tooltip({
			  position: 'top right', 
			  predelay: 800,
			  relative: true,
			  offset:[20, 10]
	    });
	}
    });

    $('a#getrecords').tooltip({
		position: 'bottom center', 
		predelay: 500,
		offset:[5, 0]
		//tipClass: 'titletip2'
    });

    $('a#getproblemset').tooltip({
		position: 'bottom center', 
		predelay: 1000,
		offset:[5, 0],
		tipClass: 'titletip2'
    });

    $('a#alogout').tooltip({
		position: 'bottom left', 
		predelay: 300,
		offset:[5, 10],
		tipClass: 'titletip2'
    });

    $('a#clearrecords').tooltip({
		position: 'bottom right', 
		predelay: 300,
		offset:[5, -10],
		tipClass: 'titletip2'
    });

 }

 App.getRunmode = function () { // problemset show 'all' or 'single'
    var runmode = $('div#runmode input[checked=true]').val() ||
     			$('div#runmode input[checked=checked]').val();

    if(runmode === undefined) { runmode = 'all';}

    return runmode;
 }

 App.getPadmode = function () { // keypad 'on' or 'off'
    var padmode = $('div#padmode input[checked=true]').val() ||
     			$('div#padmode input[checked=checked]').val();

    if(padmode === undefined) { padmode = 'off';}

    return padmode;
 }

 App.getViewmode = function () { // problemset view 'vertical' or 'horizontal'
    var viewmode = $('div#viewmode input[checked=true]').val() ||
     			$('div#viewmode input[checked=checked]').val();

    if(viewmode === undefined) { viewmode = 'all';}

    return viewmode;
 }

 App.getTimermode = function () { // timer 'on' or 'off'
    var timermode = $('div#timermode input[checked=true]').val() ||
     			$('div#timermode input[checked=checked]').val();

    if(timermode === undefined) { timermode = 'on';}

    return timermode;
 }

 App.loadTimer = function (current) {
    if(current === undefined) { current = 0;}
    timerhtml = '<p>&nbsp;&nbsp;&nbsp;Timer&nbsp;:&nbsp;&nbsp;<span id="timer" class="stopped">'+current;
    timerhtml = timerhtml+'</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>';
    $('.timerwrap').prepend(timerhtml);
 }

 App.checkTimermode = function () {
    var timermode = App.getTimermode();

    if(timermode == 'off') {
    	$('.timerwrap').hide();
    } else {
    	$('.timerwrap').show();
    }
 }

 App.stopTimer = function () {
    $('#timer').removeClass('running clear').addClass('stopped');
 }

 App.getTimerCurrent = function () {
    var value = 0
    var timermode = App.getTimermode();
    if((timermode == 'on') && ($('.timerwrap').length != 0)) {
    	value =  parseInt($("#timer").text());
    }
    return  value;
 }

 App.getTimerStored = function () {
    var value = 0
    value = parseInt($('input[name=timervalue]').val());
    return  value;
 }

 App.startTimer = function () {
    $('#timer').removeClass('stopped clear').addClass('running');
 }

 App.clearTimer = function () {
    $('#timer').removeClass('stopped running').addClass('clear');
 }

 App.countUp = function () {
    var state = $('#timer').attr('class');
    var value = parseInt($('#timer').text());
    if(state == 'stopped') {
    } else if (state == 'clear') {
    	$('#timer').removeClass('clear running').addClass('stopped');
    	$('#timer').text(0);
    } else if (state == 'running') {
    	value++;
    	$('#timer').text(value);
    }
    ticker = setTimeout('App.countUp()', 1000);
 }

 /* Function to set cookies		*/
 App.setCookie = function ( name, value, expires, path, domain, secure )  {

  /* set time. default=msecs */
  var today = new Date();
  today.setTime(today.getTime());

  if (expires) {
    expires = expires * 1000 * 60 * 60 * 24;
  }

  var expires_date = new Date(today.getTime() + (expires));

  document.cookie = name + "=" +escape(value) +
  ((expires) ? ";expires=" + expires_date.toGMTString() : "" ) + 
  ((path)    ? ";path=" + path     : "" ) + 
  ((domain)  ? ";domain=" + domain : "" ) +
  ((secure)  ? ";secure"           : "" );
}

 // Used with TAB and ENTER form traversing
 // Sets class for current problem state(since no ajax update).
 App.updateProbClass = function () {
    $('form div.prob').each(function(index) {

	var $prob = $(this),
	    answr = $prob.find('div.answer input'),
	    val   = answr.val();
      
	  
	if(val == '') {
	    $prob.removeClass('yes no filled').addClass('empty');
	    answr.removeClass('incorrect');
	} else {
	    $prob.removeClass('empty no yes').addClass('filled');
	    answr.removeClass('incorrect');
	}
    });
 }

 // Custom key functionality
 document.onkeydown = function (event) {

    var code;
    var e;
    if (document.all) {
	if (!event) {
            var e = window.event;
            code = e.keyCode;
	}
    } else if (event.which) {
    	code = event.which;
    	e = event;
    }

    var runmode = App.getRunmode();

    if (((code == 13) || (code == 9)) && !e.shiftKey) {//ENTER || TAB
    	if ((runmode == 'all') && (code == 9)) {//TAB - use native, wont fire checkanswer
	    App.startTimer();
	} else {
	    App.updateProbClass();
	    App.publish('findFocus', ['keyboard']);
	    return false;
	}
    }

 }
/////////////////////////////////////////////////////////////////////////
//		Plugin Modules
//
//  1)Pub Sub - Decouple Application logic from ajax calls
//


/**********************************************************************/
/* 1.
/* Library Agnostic Pubsub - v1.0
/* Copyright 2010
/* Darcy Clarke http://darcyclarke.me
/*
/**********************************************************************/
 
 App.cache = {};

 App.publish = function(topic, args){

    App.cache[topic] && $.each(App.cache[topic], function(){
	this.apply($, args || []);
    });
 };

 App.subscribe = function(topic, callback){
    if(!App.cache[topic]){
	App.cache[topic] = [];
    }
    App.cache[topic].push(callback);
    return [topic, callback];
 };

 App.unsubscribe = function(handle){
    var t = handle[0];
    App.cache[t] && $.each(App.cache[t], function(idx){
	if(this == handle[1]){
	    App.cache[t].splice(idx, 1);
	}
    });
 };

/////////////////////////////////////////////////////////////////////////
//
//		Application Calls
//
  

 App.subscribe('prepApp',  function  () { //non-event based
    App.prepPanelctrl(); //show div#panelctrl. bind mouseover/mouseout
    App.limitInputSize(); //reduce input size
    App.prepModeselect(); //show and style based on state
    App.registerTips(); //tip handlers need rebinding every update
    App.checkKeypadmode(); //show/hide
    App.checkTimermode(); //show/hide
 });


 App.subscribe ('findFocus',  function (state, value) {
	   
 // 'get':PSet not ajax, not posted
 // 'keyboard':PSet not ajax, not posted; PSet classes updated; Check for PSet done;
 // 'post':PSet ajax, posted;
 //
 // 'done':PSet ajax, posted; Breakes trigger loop for 'single'; 
 // 'active':PSet ajax, posted;
 // 'new':PSet ajax, posted;
 //
 //
 // IE need delay if PSet is ajax updated in order to find focus.
 //

    if(state === undefined) { state = 'get';}
    if(value === undefined) { value = '0';}

    var timer     = App.getTimerCurrent(),
        runmode   = App.getRunmode(),
        viewmode  = App.getViewmode(),
        timermode = App.getTimermode();

    var probs  = $('div.prob'),
        empty  = $('div.prob.empty'),
	wrong  = $('div.prob.no'),
	chkans = $('#controls input[value="Check Answers"]');

    if (state == 'get') { //records; no new pset
	if(empty.length != 0) {
    	    empty.eq(0).find('input').focus();
	} else if (wrong.length != 0) {
    	    wrong.eq(0).find('input').focus();
	}
    } else if (state == 'post') { 


	if (empty.length != 0) {
	    if(timer != 0) { App.startTimer(); }
	    if(runmode == 'single') {
		empty.css({display:'none'});
		empty.eq(0).css({display:'block'}).addClass('single');
	    }

	    if($.browser.msie) {
	    	setTimeout(function(){
    	    	   empty.eq(0).find('input').focus();
	    	}, 1000);
	    } else {
    	    	empty.eq(0).find('input').focus();
	    }

	} else if (wrong.length != 0) { //no empties
	    if($.browser.msie) {
	    	setTimeout(function(){
    	            wrong.eq(0).find('input').focus();
	    	}, 1000);
	    } else {
    	    	wrong.eq(0).find('input').focus();
	    }
	}
    } else if (state == 'keyboard') { 
	App.startTimer();
	if((empty.length != 0) && (runmode == 'single')) {
    	    probs.removeClass('single');
	    empty.eq(0).addClass('single').css({display:'block'}).find('input').focus();
	} else if (empty.length != 0) { //runmode='all'
	    empty.eq(0).find('input').focus();
	} else if (wrong.length != 0) {
	    wrong.eq(0).find('input').focus();
    	} else  { //no empties
	    chkans.trigger('click');
	}
    } else if (state == 'keypad') {
	App.startTimer();
	if(value == 'Next') { //todo:possibly combine Next/Prev.  Use old/new.
	    var cur = $('form div.prob.current');
	    if (viewmode == 'vertical') {
	     	nxt = cur.parent().next().find('div.prob');
	    } else {
	     	nxt = cur.next();
	    }
	    if(runmode == 'single') {
		if(nxt.length != 0) {
    	    	    cur.removeClass('single');
    	    	    nxt.addClass('single').css({display:'block'}).find('input').focus();
		} else {
	    	    cur.find('input').focus();
		}
	    } else {
		if(nxt.length != 0) {
	    	    nxt.find('input').focus();
		} else {
	    	    cur.find('input').focus();
		}
	    }
	} else if(value == 'Prev') {
	    var cur = $('form div.prob.current');
	    if (viewmode == 'vertical') {
	     	prv = cur.parent().prev().find('div.prob');
	    } else {
	     	prv = cur.prev();
	    }
	    if(runmode == 'single') {
		if(prv.length != 0) {
    	    	    cur.removeClass('single');
    	    	    prv.addClass('single').css({display:'block'}).find('input').focus();
		} else {
	    	    cur.find('input').focus();
		}
	    } else {
		if(prv.length != 0) {
	    	    prv.find('input').focus();
		} else {
	    	    cur.find('input').focus();
		}
	    }
	} else if(value == 'Back') {
	    var cur    = $('div.prob.current input'),
	        oldval = cur.val(),
	        newval = oldval.substr(0, oldval.length-1);

	    cur.val(newval).focus();

	} else { //value = digit or -
	    var cur    = $('div.prob.current input'),
	        oldval = cur.val(),
		newval = oldval+value;

	    cur.val(newval).focus();
	}
    }


 });

 $.easing.def = "jswing";
 App.countUp(); //setTimeout recursive
 App.prepPaneldisplay();//live 
 App.prepOptionCookies(); //live 'click' panelctrl
 App.prepControls(); //live
 App.loadTimer(App.getTimerStored()); //.append
 App.publish('prepApp');
 App.publish('findFocus', ['post']);
 App.prepKeypad(); //live
 App.updateInputClass(); //live

