jQuery(document).ready(function(){

    jQuery.easing.def = "jswing";

    countUp(); //setTimeout recursive
    prepPaneldisplay(); //live 'click' panelctrl
    prepOptionCookies(); //live 'click' panelctrl
    prepControls(); //live
    prepKeypad(); //live
    loadTimer(getTimerStored()); //.append
    callPreps();
    findFocus('post');
});

 function callPreps () { //non-event based
    prepPanelctrl(); //show div#panelctrl
    prepInputSize(); //reduce input size
    prepModeselect(); //show unselected state
    registerTips(); //tip handlers need rebinding every update
    checkKeypadmode(); //show/hide
    checkTimermode(); //show/hide
 }

 document.onkeydown = keydown;

 function keydown(event) {

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

    var runmode = getRunmode();

    if (((code == 13) || (code == 9)) && !e.shiftKey) {//ENTER || TAB
    	if ((runmode == 'all') && (code == 9)) {//TAB - use native
	    startTimer();
	} else {
	    updateProbClass(runmode);
	    findFocus('key');
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

 function updateProbClass(mode) {
    jQuery('form div.prob').each(function(index) {
	var ans = jQuery(this).find('div.answer input').val();
	if(ans == '') {
	    jQuery(this).removeClass('yes no filled').addClass('empty');
	    jQuery(this).find('div.answer input').removeClass('incorrect');
	} else {
	    jQuery(this).removeClass('empty no yes').addClass('filled');
	    jQuery(this).find('div.answer input').removeClass('incorrect');
	}
    });
 }

 function prepInputSize() {
    jQuery('div.prob input').attr('size', '1');
 }

 function prepModeselect() {

    jQuery('div#controls div#runmode').show();
    jQuery('div#controls div#timermode').show();
    jQuery('div#controls div#padmode').show(0, function() {});

    jQuery('div.modeselect input').each(function() {
	if(jQuery('#reportwrap').length == 0) {

    	    if(jQuery(this).parent().hasClass('modeon') && 
				jQuery(this).is(':visible') ){

	    	jQuery(this).parent().siblings().css({color:'gray'});
	    	jQuery(this).parent().css({backgroundColor:'gray'});
	    }

	} else {
	    	jQuery(this).parent().hide();
	    	jQuery(this).parent().parent().css({color:'gray'});
	}

    });
 }

 function prepPanelctrl () {
    jQuery('#controls div.panelctrl').show();

    jQuery('#controls div.panelctrl').mouseover(function($e) {
  	if ( (!jQuery('.paneldisplay').is(':visible')) ){
	    jQuery('#'+jQuery(this).attr('id').substr(5)+'tip').animate({
    	    		width: 'toggle' }, 
			500 
  	    );
	}
    });

    jQuery('#controls div.panelctrl').mouseout(function($e) {
	if( jQuery('div.paneltip').is(':visible') ) {
	    jQuery('#'+jQuery(this).attr('id').substr(5)+'tip').animate({
    	    		width: 'toggle' }, 
			500 
  	    );
	}
    });
 }

 function prepPaneldisplay () {
    var padmode = getPadmode();
    var timermode = getTimermode();
    jQuery('#controls div.panelctrl').live('click',function($e) {


	jQuery('.panelcontent').hide();
	jQuery('div#keypad').hide();
	jQuery('div.timerwrap').hide();

 	jQuery('div.paneltip').each(function() {
	    if( jQuery(this).is(':visible') ) {
		openid =jQuery(this).attr('id');
 		jQuery('#'+openid).hide();
			/*
 		jQuery('#'+openid).animate({
    	    		width: 'toggle' }, 
			0 
  		);
		*/
	    }
  	});

	thisid = jQuery(this).attr('id');
	if(jQuery('.psetwrap').length != 0) {
	    if( jQuery('.psetwrap').is(':visible') ) {
  	    	jQuery('.psetwrap').slideUp(
    	    		300,
			function() {
				togglePanels(thisid);
  	    	});
	    } else {
				togglePanels(thisid);
	    }
	} else if(jQuery('#reportwrap').length != 0) {
	    if( jQuery('#reportwrap').is(':visible') ) {
  	        jQuery('#reportwrap').slideUp(
    	    		300,
			function() {
				togglePanels(thisid);

  	        });
	    } else {
				togglePanels(thisid);
	    }
	}
    });
 }


 function togglePanels (id) {
   var done = 'true';
    jQuery('#controls div.panelctrl').each(function($e) {
    	if(id == jQuery(this).attr('id')) {
    	    if(jQuery('#'+id).hasClass('displayopen') ) {
    	    	jQuery('#'+id).removeClass('displayopen'); 
    	    } else {
    	    	jQuery('#'+id).addClass('displayopen'); 
    	    }
	} else {
    	    if(jQuery(this).hasClass('displayopen') ) {
		done= jQuery(this).attr('id');
    		jQuery(this).removeClass('displayopen'); 
	    }
	}

    });

    if (done == 'true') {
  	jQuery('#display'+id.substr(5)).animate({
    	    		width: 'toggle' }, 
			1000, 
    			'easeOutBounce',
			function() {
				jQuery('.panelcontent').show();
				jQuery('.paneltip').hide();
				showProblemdisplay();
  	});
    } else {
  	jQuery('#display'+done.substr(5)).animate({
    	    		width: 'toggle' }, 
			1000, 
    			'easeOutBounce',
			function() {
  			    jQuery('#display'+id.substr(5)).animate({
    	    				width: 'toggle' }, 
					1000, 
    					'easeOutBounce',
					function() {
					    jQuery('.panelcontent').show();
					    jQuery('.paneltip').hide();
					    showProblemdisplay();
  			    });
  	});
    }
 }

 function showProblemdisplay () {
    var padmode = getPadmode();
    var timermode = getTimermode();
    var done = 'true';
    jQuery('#controls div.panelctrl').each(function($e) {
    	if(jQuery(this).hasClass('displayopen') ) {
	    done = 'false';
	}
    });
    if (done == 'true') {


    	if(jQuery('.psetwrap').length != 0) {
  	    jQuery('.psetwrap').slideDown( 300, function(){
			    	if(padmode == 'on') {
			    	    jQuery('div#keypad').show();
				}
			    	if(timermode == 'on') {
			    	    jQuery('div.timerwrap').show();
			    	}
		    		findFocus('get')
	    });
	} else if(jQuery('#reportwrap').length != 0) {
  	    jQuery('#reportwrap').slideDown( 300, function(){
			    	if(padmode == 'on') {
			    	    jQuery('div#keypad').show();
			    	}
			    	if(timermode == 'on') {
			    	    jQuery('div.timerwrap').show();
			    	}
	 			findFocus('get')
	    });
    	}
    }
 }

 function prepOptionCookies () {

/* IE needs binding to 'click'  for radio,select inputs	*/
    if (jQuery.browser.msie) {
    	jQuery('#opmode input[type=radio]').live('click', function($e) {
	    setCookie('opmode', this.value, 30, '/');
    	});
     
    	jQuery("#sizemode select").live('click', function() {
	    setCookie('sizemode', this.value, 30, '/');
    	});
     
    	jQuery("#rangemode select:eq(0)").live('click', function() {
	    setCookie('rangemode0', this.value, 30, '/');
    	});
     
    	jQuery("#rangemode select:eq(1)").live('click', function() {
	    setCookie('rangemode1', this.value, 30, '/');
    	});
     
    	jQuery("#opmode select:eq(0)").live('click', function() {
	    setCookie('timesmode', this.value, 30, '/');
    	});
     
    	jQuery("#opmode select:eq(1)").live('click', function() {
	    setCookie('expmode', this.value, 30, '/');
    	});
     
    } else {
    
    	jQuery('#opmode input[type=radio]').live('change', function($e) {
	    setCookie('opmode', this.value, 30, '/');
    	});
     
    	jQuery("#sizemode select").live('change', function() {
	    setCookie('sizemode', this.value, 30, '/');
    	});
     
    	jQuery("#rangemode select:eq(0)").live('change', function() {
	    setCookie('rangemode0', this.value, 30, '/');
    	});

    	jQuery("#rangemode select:eq(1)").live('change', function() {
	    setCookie('rangemode1', this.value, 30, '/');
    	});

    	jQuery("#opmode select:eq(0)").live('change', function() {
	    setCookie('timesmode', this.value, 30, '/');
    	});

    	jQuery("#opmode select:eq(1)").live('change', function() {
	    setCookie('expmode', this.value, 30, '/');
    	});

    }


    jQuery("#reportmode input:eq(0)").live('click', function() {
	if(jQuery(this).is(':checked')){
	    setCookie('reportmode0', this.value, 30, '/');
	} else {
	    setCookie('reportmode0', 'off', 30, '/');
	}
    });

    jQuery("#reportmode input:eq(1)").live('click', function() {
	if(jQuery(this).is(':checked')){
	    setCookie('reportmode1', this.value, 30, '/');
	} else {
	    setCookie('reportmode1', 'off', 30, '/');
	}
    });

    jQuery("#reportmode input:eq(2)").live('click', function() {
	if(jQuery(this).is(':checked')){
	    setCookie('reportmode2', this.value, 30, '/');
	} else {
	    setCookie('reportmode2', 'off', 30, '/');
	}
    });
     
 }

 function prepKeypad() {

    jQuery('div#keypad span').live('click',function($e) {
		findFocus('keypad', jQuery(this).text());
    });

    jQuery('div.prob input').live('focus',function($e) {
    		jQuery('form div.prob').removeClass('current');
		jQuery(this).parent().parent().addClass('current');
    });

 }

 function checkKeypadmode() {
    var padmode = getPadmode();

    if(padmode == 'on') {
    	jQuery('div#keypad').show();
    } else {
    	jQuery('div#keypad').hide();
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

 function findFocus(state, value) {
    if(state === undefined) { state = 'get';}
    if(value === undefined) { value = '0';}

    var mode = getRunmode();
    var viewmode = getViewmode();
    var timermode = getTimermode();


    if (state == 'get') { //records; no new pset
	if(jQuery('form div.prob.empty').length != 0) {
    	    jQuery('form div.prob.empty').find('input')[0].focus();
	} else if (jQuery('form div.prob.no').length != 0) {
    	    jQuery('form div.prob.no').find('input')[0].focus();
	}
    } else if (state == 'key') {
	startTimer();
	if((jQuery('form div.prob.empty').length != 0) && (mode == 'single')) {
    	    jQuery('form div.prob').removeClass('single');
    	    jQuery('form div.prob.empty').each(function(index) {
	    	if(index == 0) {
    	    	    jQuery(this).addClass('single');
    	    	    jQuery(this).css({display:'block'});
    	    	    jQuery('div.prob.empty').find('input')[index].focus();
	    	}
    	    });
	} else if (jQuery('form div.prob.empty').length != 0) { //mode='all'
    	    jQuery('form div.prob.empty').find('input')[0].focus();
	} else if (jQuery('form div.prob.no').length != 0) {
    	    jQuery('form div.prob.no').find('input')[0].focus();
    	} else  { //no empties
	    jQuery('#controls input[value="Check Answers"]').trigger('click');
	}
    } else if (state == 'keypad') {
	startTimer();
	if(value == 'Next') {
	    var done = 'false';
	    jQuery('form div.prob').each(function () {
		if(jQuery(this).hasClass('current') && (done=='false')) {
		    if((viewmode == 'vertical') && (mode == 'single')) {
		        if(jQuery(this).parent().next().length != 0) {
    	    	    	    jQuery(this).removeClass('single');
    	    	    	    jQuery(this).parent().next().find('div.prob').addClass('single');
    	    	    	    jQuery(this).parent().next().find('div.prob').css({display:'block'});
	    	    	    jQuery(this).parent().next().find('input').focus();
		        } else {
	    	    	    jQuery(this).find('input').focus();
		    	}
		    } else if(viewmode == 'vertical') {
		        if(jQuery(this).parent().next().length != 0) {
	    	    	    jQuery(this).parent().next().find('input').focus();
		        } else {
	    	    	    jQuery(this).find('input').focus();
		    	}
		    } else if((viewmode == 'horizontal') && (mode == 'single')){
		        if(jQuery(this).next().length != 0) {
    	    	    	    jQuery(this).removeClass('single');
    	    	    	    jQuery(this).next().addClass('single');
    	    	    	    jQuery(this).next().css({display:'block'});
	    	    	    jQuery(this).next().find('input').focus();
		        } else {
	    	    	    jQuery(this).find('input').focus();
		    	}
		    } else {
		        if(jQuery(this).next().length != 0) {
	    	    	    jQuery(this).next().find('input').focus();
		        } else {
	    	    	    jQuery(this).find('input').focus();
		    	}
		    }
	    	    done = 'true';
		}
	    });
	} else if(value == 'Prev') {
	    var done = 'false';
	    jQuery('form div.prob').each(function () {
		if(jQuery(this).hasClass('current') && (done=='false')) {
		    if((viewmode == 'vertical') && (mode == 'single')) {
		        if(jQuery(this).parent().prev().length != 0) {
    	    	    	    jQuery(this).removeClass('single');
    	    	    	    //jQuery(this).css({display:'none'});
	    	    	    jQuery(this).parent().prev().find('div.prob').addClass('single');
	    	    	    //jQuery(this).parent().prev().find('div.prob').css({display:"block"});
	    	    	    jQuery(this).parent().prev().find('input').focus();
		        } else {
	    	    	    jQuery(this).find('input').focus();
		    	}
		    } else if(viewmode == 'vertical') {
		        if(jQuery(this).parent().prev().length != 0) {
	    	    	    jQuery(this).parent().prev().find('input').focus();
		        } else {
	    	    	    jQuery(this).find('input').focus();
		    	}
		    } else if((viewmode == 'horizontal') && (mode == 'single')){
		        if(jQuery(this).prev().length != 0) {
    	    	    	    jQuery(this).removeClass('single');
    	    	    	    //jQuery(this).css({display:'none'});
    	    	    	    jQuery(this).prev().addClass('single');
	    	    	    jQuery(this).prev().find('input').focus();
		        } else {
	    	    	    jQuery(this).find('input').focus();
		    	}
		    } else {
		        if(jQuery(this).prev().length != 0) {
	    	    	    jQuery(this).prev().find('input').focus();
		        } else {
	    	    	    jQuery(this).find('input').focus();
		    	}
		    }
	    	    done = 'true';
		}
	    });
	} else if(value == 'Back') {
	    oldval = jQuery('form div.prob.current input').val();
	    newval = oldval.substr(0, oldval.length-1);
	    jQuery('form div.prob.current input').val(newval);
	    jQuery('form div.prob.current input').focus();
	} else {
	    oldval = jQuery('form div.prob.current input').val();
	    jQuery('form div.prob.current input').val(oldval+value);
	    jQuery('form div.prob.current input').focus();
	}
    } else if (state == 'post') { 
	if((jQuery('form div.prob.empty').length != 0) && (mode == 'single')) {
	    var timer = getTimerCurrent();
	    if(timer != 0) {
	    	startTimer();
	    }
    	    jQuery('form div.prob.empty').each(function(index) {
	    	if(index != 0) {
            	    jQuery(this).css({display:'none'})
	    	} else {
    	    	    jQuery(this).css({display:'block'})
    	    	    jQuery(this).addClass('single')
		    if(jQuery.browser.msie) {
		  	setTimeout(function(){
    	    	    	jQuery('div.prob.empty').find('input')[index].focus();
		  	}, 1000);
		    } else {
    	    	    	jQuery('div.prob.empty').find('input')[index].focus();
		    }
	    	}
    	    });

	} else if(jQuery('form div.prob.empty').length != 0) { //mode='all'
	    var timer = getTimerCurrent();
	    if(timer != 0) {
	    	startTimer();
	    }
	    if(jQuery.browser.msie) {
	    	setTimeout(function(){
    	    	    jQuery('form div.prob.empty').find('input')[0].focus();
	    	}, 1000);
	    } else {
    	    	jQuery('form div.prob.empty').find('input')[0].focus();
	    }

	} else if (jQuery('form div.prob.no').length != 0) { //no empties
	    if(jQuery.browser.msie) {
	  	setTimeout(function(){
    	    	    jQuery('form div.prob.no').find('input')[0].focus();
	  	}, 1000);
	    } else {
    	        jQuery('form div.prob.no').find('input')[0].focus();
	    }
	}
    }


 }


 function prepControls() {


/*	Records/Problems, Start Again, Logout			*/
    jQuery('a.control').live('click',function($e) {

		    /*
	jQuery('div.answer input').each(function() {
		var name = jQuery(this).attr('name');
		document.getElementsByTagName(name).value = jQuery(this).val();
		alert(document.getElementsByTagName(name).value);
	});
	psethtml = jQuery('.psetwrap').html();
	alert(psethtml);
	*/

	var action = this.href.split('/').reverse()[0];

	if(action != 'logout') {
	    $e.preventDefault();
	    stopTimer();
	    jQuery.get(this.href, 
		function(data) {
		    strt = (data.indexOf('<div id="wrap"')); 
		    end  = (data.indexOf('</body')); 
		    newdata = data.substring(strt, end-1);
		    jQuery('body').html(newdata);
		    /*
		    jQuery('.psetwrap').html(psethtml);
		    if (action == 'records') {
		    jQuery('.psetwrap').hide();
		    } else {
		    jQuery('.psetwrap').show();
		    }
		    */

    		    loadTimer(getTimerStored());
		    callPreps();
		    findFocus('post');
	    });
	}
    });

    jQuery('a.getpage').live('click',function($e) {
	$e.preventDefault();
	stopTimer();
	var timer = getTimerCurrent();
	var pagekey = this.href.split('?')[1];
	posted = jQuery("form#answerform").serialize()+'&submit=page&timer='+timer+'&'+pagekey;
	jQuery.post('/check', posted,
		function(data) {
		    strt = (data.indexOf('<div id="wrap"')); 
		    end  = (data.indexOf('</body')); 
		    newdata = data.substring(strt, end-1);
		    jQuery('body').html(newdata);

		    if((data.search('statusnew') != -1)) {
			loadTimer(0);
		    } else if((data.search('statusactive') != -1)) {
    		    	loadTimer(getTimerStored());
			startTimer();
		    } else { // done 
    		    	loadTimer(getTimerStored());
		    }

		    callPreps();
    		    findFocus('post');
	});
    });

/*	Check, New, Clear			*/
    jQuery('div#controls input[type=submit]').live('click', function($e) {
	$e.preventDefault();
	stopTimer();
	var timer = getTimerCurrent();
	posted = jQuery("form#answerform").serialize()+'&submit='+this.value+'&timer='+timer;
	jQuery.post('/check', posted,
		function(data) {
		    strt = (data.indexOf('<div id="wrap"')); 
		    end  = (data.indexOf('</body')); 
		    newdata = data.substring(strt, end-1);
		    jQuery('body').html(newdata);

		    if((data.search('statusnew') != -1)) {
			loadTimer(0);
		    } else if((data.search('statusactive') != -1)) {
    		    	loadTimer(getTimerStored());
			startTimer();
		    } else { // done 
    		    	loadTimer(getTimerStored());
		    }

		    callPreps();
    		    findFocus('post');
	});
    });
    
/*	Modeselects: viewmode, runmode, padmode, timermode		*/
    jQuery('div#controls input[type=radio]').live('click', function($e) {

	stopTimer();
	var timer = getTimerCurrent();
	posted = jQuery("form#answerform").serialize();
	posted = posted+'&submit=Radio&timer='+timer;
	stats  = jQuery('#statswrap').html();
	timerhtml  = jQuery('.timerwrap').html();
	statshtml  = jQuery('#statistics').html();

	var selectmode = (jQuery(this).attr('name'));
	var selectval  = (jQuery(this).val());

	jQuery.post('/check', posted,
		function(data) {
		    strt = (data.indexOf('<div id="wrap"')); 
		    end  = (data.indexOf('</body')); 
		    newdata = data.substring(strt, end-1);
		    jQuery('body').html(newdata);

    /* findFocus needs adjusted empty flag for non stored filled answers */
		    jQuery('div.prob').each(function(index){ 
	   		if(jQuery(this).find('div.answer input').val() != '') {
			    jQuery(this).removeClass('empty');
	   		}
		    });

		    //jQuery('#statswrap').html(stats);
		    jQuery('.timerwrap').html(timerhtml);
		    jQuery('#statistics').html(statshtml);

		    checkTimermode();

		    callPreps();
    		    findFocus('post');
	});
    });

/* 	Print Preview, Print Record		*/
    jQuery('div#recordopts a').live('click', function($e) {
	$e.preventDefault();
	var winsrc   = jQuery(this).attr('href');
	var wintitle = jQuery(this).attr('title');

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
	jQuery('div#recordWrap').hide();
	}
    });
 }


 function registerTips() {
	 /*
    jQuery('#submitwrap').tooltip({
		position: 'bottom center', 
		tipClass: 'titletip3'
    });
    */

    jQuery(".modeselect").not('#timermode').each(function() { 
    	if(jQuery(this).find('span.modeon').is(':visible')) {
	    jQuery(this).tooltip({
			  position: 'top right', 
			  predelay: 800,
			  relative: true,
			  offset:[20, 10]
	    });
	}
    });

    jQuery('#sessionctrl a#getrecords').tooltip({
		position: 'bottom center', 
		predelay: 500,
		offset:[5, 0]
		//tipClass: 'titletip2'
    });

    jQuery('#sessionctrl a#getproblemset').tooltip({
		position: 'bottom center', 
		predelay: 1000,
		offset:[5, 0],
		tipClass: 'titletip2'
    });

    jQuery('#sessionctrl a#alogout').tooltip({
		position: 'bottom left', 
		predelay: 300,
		offset:[5, 10],
		tipClass: 'titletip2'
    });

    jQuery('#sessionctrl a#clearrecords').tooltip({
		position: 'bottom right', 
		predelay: 300,
		offset:[5, -10],
		tipClass: 'titletip2'
    });

 }

function getRunmode () {
    var runmode = jQuery('div#runmode input[checked=true]').val() ||
     			jQuery('div#runmode input[checked=checked]').val();

    if(runmode === undefined) { runmode = 'all';}

    return runmode;
}

function getPadmode () {
    var padmode = jQuery('div#padmode input[checked=true]').val() ||
     			jQuery('div#padmode input[checked=checked]').val();

    if(padmode === undefined) { padmode = 'off';}

    return padmode;
}

function getViewmode () {
    var viewmode = jQuery('div#viewmode input[checked=true]').val() ||
     			jQuery('div#viewmode input[checked=checked]').val();

    if(viewmode === undefined) { viewmode = 'all';}

    return viewmode;
}

function getTimermode () {
    var timermode = jQuery('div#timermode input[checked=true]').val() ||
     			jQuery('div#timermode input[checked=checked]').val();

    if(timermode === undefined) { timermode = 'on';}

    return timermode;
}

 function loadTimer(current) {
    if(current === undefined) { current = 0;}
    timerhtml = '<p>&nbsp;&nbsp;&nbsp;Timer&nbsp;:&nbsp;&nbsp;<span id="timer" class="stopped">'+current;
    timerhtml = timerhtml+'</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>';
    jQuery('.timerwrap').prepend(timerhtml);
 }

 function checkTimermode() {
    var timermode = getTimermode();

    if(timermode == 'off') {
    	jQuery('.timerwrap').hide();
    } else {
    	jQuery('.timerwrap').show();
    }
 }

 function stopTimer() {
    jQuery('#timer').removeClass('running clear').addClass('stopped');
 }

 function getTimerCurrent() {
    var value = 0
    var timermode = getTimermode();
    if((timermode == 'on') && (jQuery('.timerwrap').length != 0)) {
    	value =  parseInt(jQuery("#timer").text());
    }
    return  value;
 }

 function getTimerStored() {
    var value = 0
    value = parseInt(jQuery('input[name=timervalue]').val());
    return  value;
 }

 function startTimer() {
    jQuery('#timer').removeClass('stopped clear').addClass('running');
 }

 function clearTimer() {
    jQuery('#timer').removeClass('stopped running').addClass('clear');
 }

 function countUp() {
    var state = jQuery('#timer').attr('class');
    var value = parseInt(jQuery('#timer').text());
    if(state == 'stopped') {
    } else if (state == 'clear') {
    	jQuery('#timer').removeClass('clear running').addClass('stopped');
    	jQuery('#timer').text(0);
    } else if (state == 'running') {
    	value++;
    	jQuery('#timer').text(value);
    }
    ticker = setTimeout('countUp()', 1000);
 }

/* Function to set cookies		*/
function setCookie( name, value, expires, path, domain, secure )  {

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


 function animatePanelctrl() {
    jQuery('div.panelctrl')
	//.css( {backgroundColor: "#fff"} )
	.mouseover(function(){
		jQuery(this).stop().animate(
			//{backgroundColor:'#CFF3F0'}, 
			//{backgroundColor:'#F3F70A'}, 
			//{backgroundColor:'#0897D3'}, 
			{backgroundColor:'#6BC1E5'}, 
			{duration:300})
		})
	.mouseout(function(){
		jQuery(this).stop().animate(
			{backgroundColor:"#F4FD98"}, 
			{duration:200})
		});
 }

 function prepOverlay() {
    jQuery("#getoverlay").overlay({ 
	//mask: '#456743',
	mask: '#666',
        onBeforeLoad: function() { 
 
            jQuery(".contentWrap").load('records #recordWrap',
			function(data) {
	    		    jQuery("#recordover").css({height:'500px'});
	    		    jQuery("#recordover").css({overflowY:'scroll'});
    			    jQuery('.close').show();
	    }); 
        },

	onClose: function () {
	    jQuery("#recordover").empty();
	    jQuery("#recordover").css({height:'auto'});
	    jQuery("#recordover").css({overflowY:'auto'});
    	    jQuery('.close').hide();
	    //jQuery("#overlay").removeAttr("style");
	}	 

    }); 

    jQuery('.close').hide();
 }

