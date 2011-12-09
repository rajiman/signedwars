 var App = {};


 App.callPreps = function  () { //non-event based
    App.prepPanelctrl(); //show div#panelctrl
    App.prepInputSize(); //reduce input size
    App.prepModeselect(); //show unselected state
    App.registerTips(); //tip handlers need rebinding every update
    App.checkKeypadmode(); //show/hide
    App.checkTimermode(); //show/hide
 }


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
    	if ((runmode == 'all') && (code == 9)) {//TAB - use native
	    App.startTimer();
	} else {
	    App.updateProbClass();
	    App.findFocus('key');
	    return false;
	}
    }

 }


/*
 * 
 * Sets class for current problem state(since no ajax update).
 * Used with TAB and ENTER form traversing
 * 
 */

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

 App.prepInputSize = function () {
    $('div.prob input').attr('size', '1');
 }

 App.prepModeselect = function () {

    var $modesel = $('div.modeselect');
    var noreport = $('#reportwrap').length == 0;

    $modesel.each(function() {
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

 App.prepPanelctrl = function () {

    var $pctrl = $('div.panelctrl');
    var $panel = $('div.paneldisplay');

    $pctrl.show();

    $pctrl.mouseover(function($e) {
	var pid = $(this).attr('id').substr(5); //strip 'panel' from id to get specific panel
  	if ( !$panel.is(':visible') ){
	    $('#'+pid+'tip').animate({width: 'toggle' }, 500); //animate panel tip
    	}
    });

    $pctrl.mouseout(function($e) {
	var pid = $(this).attr('id').substr(5); //strip 'panel' from id to get specific panel
	if( $('#'+pid+'tip').is(':visible') ) {
	    $('#'+pid+'tip').animate({width: 'toggle' }, 500);
	}
    });
    
 }

  App.prepPaneldisplay = function () {
    var padmode = App.getPadmode();
    var timermode = App.getTimermode();
    $('#controls div.panelctrl').live('click',function($e) {


	$('.panelcontent').hide();
	$('div#keypad').hide();
	$('div.timerwrap').hide();

 	$('div.paneltip').each(function() {
	    if( $(this).is(':visible') ) {
		openid =$(this).attr('id');
 		$('#'+openid).hide();
			/*
 		$('#'+openid).animate({
    	    		width: 'toggle' }, 
			0 
  		);
		*/
	    }
  	});

	thisid = $(this).attr('id');
	if($('.psetwrap').length != 0) {
	    if( $('.psetwrap').is(':visible') ) {
  	    	$('.psetwrap').slideUp(
    	    		300,
			function() {
				App.togglePanels(thisid);
  	    	});
	    } else {
				App.togglePanels(thisid);
	    }
	} else if($('#reportwrap').length != 0) {
	    if( $('#reportwrap').is(':visible') ) {
  	        $('#reportwrap').slideUp(
    	    		300,
			function() {
				App.togglePanels(thisid);

  	        });
	    } else {
				App.togglePanels(thisid);
	    }
	}
    });
 }


 App.togglePanels = function (id) {
   var done = 'true';
    $('#controls div.panelctrl').each(function($e) {
    	if(id == $(this).attr('id')) {
    	    if($('#'+id).hasClass('displayopen') ) {
    	    	$('#'+id).removeClass('displayopen'); 
    	    } else {
    	    	$('#'+id).addClass('displayopen'); 
    	    }
	} else {
    	    if($(this).hasClass('displayopen') ) {
		done= $(this).attr('id');
    		$(this).removeClass('displayopen'); 
	    }
	}

    });

    if (done == 'true') {
  	$('#display'+id.substr(5)).animate({
    	    		width: 'toggle' }, 
			1000, 
    			'easeOutBounce',
			function() {
				$('.panelcontent').show();
				$('.paneltip').hide();
				App.showProblemdisplay();
  	});
    } else {
  	$('#display'+done.substr(5)).animate({
    	    		width: 'toggle' }, 
			1000, 
    			'easeOutBounce',
			function() {
  			    $('#display'+id.substr(5)).animate({
    	    				width: 'toggle' }, 
					1000, 
    					'easeOutBounce',
					function() {
					    $('.panelcontent').show();
					    $('.paneltip').hide();
					    App.showProblemdisplay();
  			    });
  	});
    }
 }

 App.showProblemdisplay = function () {
    var padmode = App.getPadmode();
    var timermode = App.getTimermode();
    var done = 'true';
    $('#controls div.panelctrl').each(function($e) {
    	if($(this).hasClass('displayopen') ) {
	    done = 'false';
	}
    });
    if (done == 'true') {


    	if($('.psetwrap').length != 0) {
  	    $('.psetwrap').slideDown( 300, function(){
			    	if(padmode == 'on') {
			    	    $('div#keypad').show();
				}
			    	if(timermode == 'on') {
			    	    $('div.timerwrap').show();
			    	}
		    		App.findFocus('get')
	    });
	} else if($('#reportwrap').length != 0) {
  	    $('#reportwrap').slideDown( 300, function(){
			    	if(padmode == 'on') {
			    	    $('div#keypad').show();
			    	}
			    	if(timermode == 'on') {
			    	    $('div.timerwrap').show();
			    	}
	 			App.findFocus('get')
	    });
    	}
    }
 }

 App.prepOptionCookies = function () {

/* IE needs binding to 'click'  for radio,select inputs	*/
    if ($.browser.msie) {
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
     
    } else {
    
    	$('#opmode input[type=radio]').live('change', function($e) {
	    App.setCookie('opmode', this.value, 30, '/');
    	});
     
    	$("#sizemode select").live('change', function() {
	    App.setCookie('sizemode', this.value, 30, '/');
    	});
     
    	$("#rangemode select:eq(0)").live('change', function() {
	    App.setCookie('rangemode0', this.value, 30, '/');
    	});

    	$("#rangemode select:eq(1)").live('change', function() {
	    App.setCookie('rangemode1', this.value, 30, '/');
    	});

    	$("#opmode select:eq(0)").live('change', function() {
	    App.setCookie('timesmode', this.value, 30, '/');
    	});

    	$("#opmode select:eq(1)").live('change', function() {
	    App.setCookie('expmode', this.value, 30, '/');
    	});

    }


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
		App.findFocus('keypad', $(this).text());
    });

    $('div.prob input').live('focus',function($e) {
    		$('form div.prob').removeClass('current');
		$(this).parent().parent().addClass('current');
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



/*
 * 'get':PSet not ajax, not posted
 * 'key':PSet not ajax, not posted; PSet classes updated; Check for PSet done;
 * 'post':PSet ajax, posted;
 *
 * 'done':PSet ajax, posted; Breakes trigger loop for 'single'; 
 * 'active':PSet ajax, posted;
 * 'new':PSet ajax, posted;
 *
 *
 * IE need delay if PSet is ajax updated in order to find focus.
 *
 */

 App.findFocus = function (state, value) {
    if(state === undefined) { state = 'get';}
    if(value === undefined) { value = '0';}

    var runmode = App.getRunmode();
    var viewmode = App.getViewmode();
    var timermode = App.getTimermode();


    if (state == 'get') { //records; no new pset
	if($('form div.prob.empty').length != 0) {
    	    $('form div.prob.empty').find('input')[0].focus();
	} else if ($('form div.prob.no').length != 0) {
    	    $('form div.prob.no').find('input')[0].focus();
	}
    } else if (state == 'key') {
	App.startTimer();
	if(($('form div.prob.empty').length != 0) && (runmode == 'single')) {
    	    $('form div.prob').removeClass('single');
    	    $('form div.prob.empty').each(function(index) {
	    	if(index == 0) {
    	    	    $(this).addClass('single');
    	    	    $(this).css({display:'block'});
    	    	    $('div.prob.empty').find('input')[index].focus();
	    	}
    	    });
	} else if ($('form div.prob.empty').length != 0) { //runmode='all'
    	    $('form div.prob.empty').find('input')[0].focus();
	} else if ($('form div.prob.no').length != 0) {
    	    $('form div.prob.no').find('input')[0].focus();
    	} else  { //no empties
	    $('#controls input[value="Check Answers"]').trigger('click');
	}
    } else if (state == 'keypad') {
	App.startTimer();
	if(value == 'Next') {
	    var done = 'false';
	    $('form div.prob').each(function () {
		if($(this).hasClass('current') && (done=='false')) {
		    if((viewmode == 'vertical') && (runmode == 'single')) {
		        if($(this).parent().next().length != 0) {
    	    	    	    $(this).removeClass('single');
    	    	    	    $(this).parent().next().find('div.prob').addClass('single');
    	    	    	    $(this).parent().next().find('div.prob').css({display:'block'});
	    	    	    $(this).parent().next().find('input').focus();
		        } else {
	    	    	    $(this).find('input').focus();
		    	}
		    } else if(viewmode == 'vertical') {
		        if($(this).parent().next().length != 0) {
	    	    	    $(this).parent().next().find('input').focus();
		        } else {
	    	    	    $(this).find('input').focus();
		    	}
		    } else if((viewmode == 'horizontal') && (runmode == 'single')){
		        if($(this).next().length != 0) {
    	    	    	    $(this).removeClass('single');
    	    	    	    $(this).next().addClass('single');
    	    	    	    $(this).next().css({display:'block'});
	    	    	    $(this).next().find('input').focus();
		        } else {
	    	    	    $(this).find('input').focus();
		    	}
		    } else {
		        if($(this).next().length != 0) {
	    	    	    $(this).next().find('input').focus();
		        } else {
	    	    	    $(this).find('input').focus();
		    	}
		    }
	    	    done = 'true';
		}
	    });
	} else if(value == 'Prev') {
	    var done = 'false';
	    $('form div.prob').each(function () {
		if($(this).hasClass('current') && (done=='false')) {
		    if((viewmode == 'vertical') && (runmode == 'single')) {
		        if($(this).parent().prev().length != 0) {
    	    	    	    $(this).removeClass('single');
    	    	    	    //$(this).css({display:'none'});
	    	    	    $(this).parent().prev().find('div.prob').addClass('single');
	    	    	    //$(this).parent().prev().find('div.prob').css({display:"block"});
	    	    	    $(this).parent().prev().find('input').focus();
		        } else {
	    	    	    $(this).find('input').focus();
		    	}
		    } else if(viewmode == 'vertical') {
		        if($(this).parent().prev().length != 0) {
	    	    	    $(this).parent().prev().find('input').focus();
		        } else {
	    	    	    $(this).find('input').focus();
		    	}
		    } else if((viewmode == 'horizontal') && (runmode == 'single')){
		        if($(this).prev().length != 0) {
    	    	    	    $(this).removeClass('single');
    	    	    	    //$(this).css({display:'none'});
    	    	    	    $(this).prev().addClass('single');
	    	    	    $(this).prev().find('input').focus();
		        } else {
	    	    	    $(this).find('input').focus();
		    	}
		    } else {
		        if($(this).prev().length != 0) {
	    	    	    $(this).prev().find('input').focus();
		        } else {
	    	    	    $(this).find('input').focus();
		    	}
		    }
	    	    done = 'true';
		}
	    });
	} else if(value == 'Back') {
	    oldval = $('form div.prob.current input').val();
	    newval = oldval.substr(0, oldval.length-1);
	    $('form div.prob.current input').val(newval);
	    $('form div.prob.current input').focus();
	} else {
	    oldval = $('form div.prob.current input').val();
	    $('form div.prob.current input').val(oldval+value);
	    $('form div.prob.current input').focus();
	}
    } else if (state == 'post') { 
	if(($('form div.prob.empty').length != 0) && (runmode == 'single')) {
	    var timer = App.getTimerCurrent();
	    if(timer != 0) {
	    	App.startTimer();
	    }
    	    $('form div.prob.empty').each(function(index) {
	    	if(index != 0) {
            	    $(this).css({display:'none'})
	    	} else {
    	    	    $(this).css({display:'block'})
    	    	    $(this).addClass('single')
		    if($.browser.msie) {
		  	setTimeout(function(){
    	    	    	$('div.prob.empty').find('input')[index].focus();
		  	}, 1000);
		    } else {
    	    	    	$('div.prob.empty').find('input')[index].focus();
		    }
	    	}
    	    });

	} else if($('form div.prob.empty').length != 0) { //runmode='all'
	    var timer = App.getTimerCurrent();
	    if(timer != 0) {
	    	App.startTimer();
	    }
	    if($.browser.msie) {
	    	setTimeout(function(){
    	    	    $('form div.prob.empty').find('input')[0].focus();
	    	}, 1000);
	    } else {
    	    	$('form div.prob.empty').find('input')[0].focus();
	    }

	} else if ($('form div.prob.no').length != 0) { //no empties
	    if($.browser.msie) {
	  	setTimeout(function(){
    	    	    $('form div.prob.no').find('input')[0].focus();
	  	}, 1000);
	    } else {
    	        $('form div.prob.no').find('input')[0].focus();
	    }
	}
    }


 }


 App.prepControls = function () {


/*	Records/Problems, Start Again, Logout			*/
    $('a.control').live('click',function($e) {

	var action = this.href.split('/').reverse()[0];

	if(action != 'logout') {
	    $e.preventDefault();
	    App.stopTimer();
	    $.get(this.href, 
		function(data) {
		    var content = $(data).find('#wrap');
		    $('#content').html(content);

    		    App.loadTimer(App.getTimerStored());
		    App.callPreps();
		    App.findFocus('post');
	    });
	}
    });

    $('a.getpage').live('click',function($e) {
	$e.preventDefault();
	App.stopTimer();
	var timer   = App.getTimerCurrent();
	var pagekey = this.href.split('?')[1];
	var posted  = $("form#answerform").serialize()+'&submit=page&timer='+timer+'&'+pagekey;
	$.post('/check', posted,
		function(data) {

		    var content = $(data).find('#wrap');
		    $('#content').html(content);

		    if((data.search('statusnew') != -1)) {
			App.loadTimer(0);
		    } else if((data.search('statusactive') != -1)) {
    		    	App.loadTimer(App.getTimerStored());
			App.startTimer();
		    } else { // done 
    		    	App.loadTimer(App.getTimerStored());
		    }

		    App.callPreps();
    		    App.findFocus('post');
	});
    });

/*	Check, New, Clear			*/
    $('div#controls input[type=submit]').live('click', function($e) {
	$e.preventDefault();
	App.stopTimer();
	var timer = App.getTimerCurrent();
	posted = $("form#answerform").serialize()+'&submit='+this.value+'&timer='+timer;
	$.post('/check', posted,
		function(data) {

		    var content = $(data).find('#wrap');
		    $('#content').html(content);

		    if((data.search('statusnew') != -1)) {
			App.loadTimer(0);
		    } else if((data.search('statusactive') != -1)) {
    		    	App.loadTimer(App.getTimerStored());
			App.startTimer();
		    } else { // done 
    		    	App.loadTimer(App.getTimerStored());
		    }

		    App.callPreps();
    		    App.findFocus('post');
	});
    });
    
/*	Modeselects: viewmode, runmode, padmode, timermode		*/
    $('div#controls input[type=radio]').live('click', function($e) {

	App.stopTimer();
	var timer    = App.getTimerCurrent();
	var posted   = $("form#answerform").serialize();
	    posted   = posted+'&submit=Radio&timer='+timer;
	var timersav = $('.timerwrap').html();
	var statssav = $('#statistics').html();

	var selectmode = ($(this).attr('name'));
	var selectval  = ($(this).val());

	$.post('/check', posted,
		function(data) {

		    var content = $(data).find('#wrap');
		    $('#content').html(content);

    /* App.findFocus needs adjusted empty flag for non stored filled answers */
		    $('div.prob').each(function(index){ 
	   		if($(this).find('div.answer input').val() != '') {
			    $(this).removeClass('empty');
	   		}
		    });

		    $('.timerwrap').html(timersav);
		    $('#statistics').html(statssav);

		    App.checkTimermode();

		    App.callPreps();
    		    App.findFocus('post');
	});
    });

/* 	Print Preview, Print Record		*/
    $('div#recordopts a').live('click', function($e) {
	$e.preventDefault();
	var winsrc   = $(this).attr('href');
	var wintitle = $(this).attr('title');

	/*
    	var winparam = "width=780,height=600,toolbar=yes,"+
						"scrollbars=yes,location=yes";
						*/
    	var winparam = "width=780,height=600";

	if(this.href.split('/').reverse()[0] == 'printpreview') {
	window.open( winsrc, 'PrintPreview', winparam);
	}
	if(this.href.split('/').reverse()[0] == 'print') {
	window.print();
	}
	if(this.href.split('/').reverse()[0] == 'close') {
	$('div#recordWrap').hide();
	}
    });
 }


 App.registerTips = function () {
	 /*
    $('#submitwrap').tooltip({
		position: 'bottom center', 
		tipClass: 'titletip3'
    });
    */

    $(".modeselect").not('#timermode').each(function() { 
    	if($(this).find('span.modeon').is(':visible')) {
	    $(this).tooltip({
			  position: 'top right', 
			  predelay: 800,
			  relative: true,
			  offset:[20, 10]
	    });
	}
    });

    $('#sessionctrl a#getrecords').tooltip({
		position: 'bottom center', 
		predelay: 500,
		offset:[5, 0]
		//tipClass: 'titletip2'
    });

    $('#sessionctrl a#getproblemset').tooltip({
		position: 'bottom center', 
		predelay: 1000,
		offset:[5, 0],
		tipClass: 'titletip2'
    });

    $('#sessionctrl a#alogout').tooltip({
		position: 'bottom left', 
		predelay: 300,
		offset:[5, 10],
		tipClass: 'titletip2'
    });

    $('#sessionctrl a#clearrecords').tooltip({
		position: 'bottom right', 
		predelay: 300,
		offset:[5, -10],
		tipClass: 'titletip2'
    });

 }

 App.getRunmode = function () {
    var runmode = $('div#runmode input[checked=true]').val() ||
     			$('div#runmode input[checked=checked]').val();

    if(runmode === undefined) { runmode = 'all';}

    return runmode;
 }

 App.getPadmode = function () {
    var padmode = $('div#padmode input[checked=true]').val() ||
     			$('div#padmode input[checked=checked]').val();

    if(padmode === undefined) { padmode = 'off';}

    return padmode;
 }

 App.getViewmode = function () {
    var viewmode = $('div#viewmode input[checked=true]').val() ||
     			$('div#viewmode input[checked=checked]').val();

    if(viewmode === undefined) { viewmode = 'all';}

    return viewmode;
 }

 App.getTimermode = function () {
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


 $.easing.def = "jswing";
 App.countUp(); //setTimeout recursive
 App.prepPaneldisplay();
 App.prepOptionCookies(); //live 'click' panelctrl
 App.prepControls(); //live
 App.prepKeypad(); //live
 App.loadTimer(App.getTimerStored()); //.append
 App.callPreps();
 App.findFocus('post');
