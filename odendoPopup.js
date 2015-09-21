var OdendoAuctionsWidget = {};
var jQuery2;
OdendoAuctionsWidget.auctionPopup = (function(){

	var cssId = 'myCss';
    var head  = document.getElementsByTagName('head')[0];
	var loadMoreAuctions = true;
	var teamAuctionSpeechBubble;


	return{
		initiate : function (){
			//checks if mobile device
			//http://magentohostsolution.com/3-ways-detect-mobile-device-jquery/
			if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
				return;
			}else
				//this code checks for jQuery and load jQuery if it is not there
				//**//  http://css-tricks.com/snippets/jquery/load-jquery-only-if-not-present/  //**//
				// Only do something if jQuery isn't defined
			if (typeof jQuery == 'undefined' || jQuery.fn.jquery < '1.4.3') {
				if (typeof jQuery == 'function') {
					// warning, global var
					var thisPageUsingOtherJSLibrary = true;
				}
				function getScript(url, success) {
					var script = document.createElement('script');
					script.src = url;
					var head = document.getElementsByTagName('head')[0],
					done = false;
					// Attach handlers for all browsers
					script.onload = script.onreadystatechange = function() {
						if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
						done = true;
							console.log('done=true; callback function provided as param');
							success();
							script.onload = script.onreadystatechange = null;
							head.removeChild(script);
						};
					};
					head.appendChild(script);
				};
				getScript('http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js', function() {
					if (typeof jQuery=='undefined') {
						console.log('Super failsafe - still somehow failed...');
					} else {
					    console.log('jQuery loaded! Make sure to use .noConflict just in case');

					    jQuery2 = jQuery;
					    jQuery.noConflict(true);
					    jQuery2.noConflict(true);
						if (thisPageUsingOtherJSLibrary) {
							//console.log('Run your jQuery Code');
							OdendoAuctionsWidget.auctionPopup.runTeamAuctionPlugin();
						} else {
							//console.log('Use .noConflict(), then run your jQuery Code');
							OdendoAuctionsWidget.auctionPopup.runTeamAuctionPlugin();
						}
					}
				});
			} else {  //jQuery was already loaded
			    jQuery2 = jQuery;
			    jQuery.noConflict(true);
			    jQuery2.noConflict(true);
				//console.log('Run your jQuery Code');
				OdendoAuctionsWidget.auctionPopup.runTeamAuctionPlugin();
			};
		},

		runTeamAuctionPlugin : function (){

		    var link = document.createElement('link');
		    var locale = (typeof odendoData_locale === 'undefined') ? 'da-DK' : odendoData_locale;
		    link.id = cssId;
		    link.rel = 'stylesheet';
		    link.type = 'text/css';
		    link.href = 'http://cdn.odendo.com/auctionPopup/locale/' + locale + '/style.css';
		    link.media = 'all';
		    head.appendChild(link);

			var auctionPluginContent = "";
			auctionPluginContent += '<div id="teamAuctionPluginContainer">';

			//autionBubble
			if (document.cookie == "teamAuctionSpeechBubble=true") {
				auctionPluginContent += OdendoAuctionsWidget.auctionPopup.getAuctionSpeechBubble();
			}
			else if(document.cookie == "teamAuctionSpeechBubble=false"){
				auctionPluginContent += '<div id="auctionBubble"></div>'
			}
			else if(document.cookie.indexOf("teamAuctionSpeechBubble") == -1  ){
				teamAuctionSpeechBubble = document.cookie = "teamAuctionSpeechBubble=true";
				OdendoAuctionsWidget.auctionPopup.auctionPluginContent += OdendoAuctionsWidget.auctionPopup.getAuctionSpeechBubble();
			}

			//autionBubble
			auctionPluginContent += '<div id="auctionButtonImageContainer" onclick="OdendoAuctionsWidget.auctionPopup.openAuctionPlugin()">';
			//auctionPluginContent += '<img id="auctionButtonImage" src="https://s3-eu-west-1.amazonaws.com/tpd/logos-domain/53eb28f00000640005798edd/130x0.png">';
			auctionPluginContent += '</div>';
			auctionPluginContent += '<div id="allAuctionsContainer">';
			auctionPluginContent += '<div id="businessUnitContainer"></div>';
			auctionPluginContent += '<div id="auctionScrollContainer">';

			auctionPluginContent += '<div id="allAuctions"></div>';
			auctionPluginContent += '</div>';
			auctionPluginContent += '</div></div>';

			jQuery2(document).ready(function (jQuery2) {

				jQuery2.support.cors = true;
				jQuery2.ajaxSetup({cache: false});
				jQuery2('body').prepend(auctionPluginContent);
				jQuery2("#teamAuctionPluginContainer").hide(); //possibly remove these
				jQuery2("#allAuctionsContainer").hide();
				OdendoAuctionsWidget.auctionPopup.auctionPluginStylesApply();

			});

			jQuery2(document).ready(function(jQuery2){
			  jQuery2("#auctionScrollContainer").scroll(function(){
				  if(loadMoreAuctions == true){
				   if(jQuery2("#auctionScrollContainer").scrollTop() + jQuery2("#auctionScrollContainer").height() > jQuery2("#allAuctions").height()-100) {
					   loadMoreAuctions = false;
					   OdendoAuctionsWidget.auctionPopup.getAuctions();
					   }
			   }
			  });
			});

			var checkAuctions = jQuery2.ajax({
				type: 'GET',
				//url: "http://localhost:45312/api/auctionapi?" + jQuery2.now(),
				url: "http://api.odendo.com/api/auctionapi?" + jQuery2.now(),
				crossDomain: true,
				contentType: 'text/plain',
				dataType: "json",
				data: {id: odendoData_BusinessUnitId, checkForAuctions: "check" /*"112"*/, auctionType: odendoData_type },
				xhrFields: {
					withCredentials: false
				},
				error: function() {
				}
			});

			checkAuctions.done(function(data){
				var content = "";
				if(data != 0 ){
					jQuery2("#teamAuctionPluginContainer").show();
				}
			});


			var language = jQuery2.ajax({
			    type: 'GET',
			    //url: "http://localhost:45312/api/auctionapi?" + jQuery2.now(),
			    url: "http://api.odendo.com/api/auctionapi?" + jQuery2.now(),
			    crossDomain: true,
			    contentType: 'text/plain',
			    dataType: "json",
			    data: { id: odendoData_BusinessUnitId, langId: 0},
			    xhrFields: {
			        withCredentials: false
			    },
			    error: function () {
			    }
			});

			language.done(function (data) {
			    var content = "";
			    if (data != 0) {
			        jQuery2("#teamAuctionPluginContainer").show();
			    }
			});


			OdendoAuctionsWidget.auctionPopup.getButtonImage();
			OdendoAuctionsWidget.auctionPopup.getBusinessUnit();
			//openAuctionPlugin(); //like this to open all the time?

			//fires each second
			var auctionTimer = setInterval(function(){OdendoAuctionsWidget.auctionPopup.autionTickDown()}, 1000);

		},

		getAuctionSpeechBubble : function (){
			var auctionPluginContent = "";
			auctionPluginContent += '<div id="auctionBubble" class="auctionBubble">';
			auctionPluginContent += '<p>Vi afholder i Ã¸jeblikket auktioner pÃ¥ TeamAuction.dk. Klik pÃ¥ knappen for at se auktionerne</p>';
			auctionPluginContent += '<div class="auctionBubbleAfter"></div>';
			auctionPluginContent += '<div class="auctionBubbleBefore"></div>';
			auctionPluginContent += '</div>';
			return auctionPluginContent;
		},

		converteDateToSecondsleft : function (date){
			var currentDate = new Date();

			var year = date.substr(0,4);
			var month = date.substr(5,2);
			var day = date.substr(8,2);
			var hour = date.substr(11,2);
			var minute = date.substr(14,2);
			var second = date.substr(17,2);
			var endDate = new Date(year, month-1, day, hour, minute, second, 0);
			var secondsLeft = endDate/1000 - currentDate/1000;
			return parseInt(secondsLeft);
		},

		//runs through eath auction and reduceses its timeLeft by 1.
		autionTickDown : function (){
			jQuery2.each(jQuery2('.auctionTimeLeft'), function(i) {
				var i = parseInt(jQuery2(this).attr("timeLeft"));
				if(i > 0){
					i--;
					jQuery2(this).attr("timeLeft", i);
					jQuery2(this).text(OdendoAuctionsWidget.auctionPopup.timerUpdater(i));
				}
			});
		},

		//concatenate the timerString
		timerUpdater : function (totalSeconds){
			var timerString = "";
			timerString += OdendoAuctionsWidget.auctionPopup.daysLeft(totalSeconds)
				+ OdendoAuctionsWidget.auctionPopup.hoursLeft(totalSeconds) + ":"
				+ OdendoAuctionsWidget.auctionPopup.minutesLeft(totalSeconds) + ":"
				+ OdendoAuctionsWidget.auctionPopup.secondsLeft(totalSeconds);
			return timerString;
		},

	    //calculates remaining days
		daysLeft : function (totalSeconds){
			var hour = 3600;
			var days = parseInt(totalSeconds / (hour * 24));
			if(days <= 0){
				return "";
			}
			else if(days == 1){
				return days + " dag ";
			} else if(days > 1){
				return days + " dage ";
			}
		},

		//calculates remaining hours
		hoursLeft :	function (totalSeconds){
			var hour = 3600;
			var hours = parseInt(totalSeconds / hour) % 24;
			hours = ('0' + hours).slice(-2);
			return hours;
		},

		//calculates remaining minutes
		minutesLeft : function (totalSeconds){
			var hour = 3600;
			var minutes = parseInt((totalSeconds % hour) / 60);
			minutes = ('0' + minutes).slice(-2);
			return minutes;
		},

		//calculates remaining seconds
		secondsLeft : function (totalSeconds){
			var seconds = parseInt(totalSeconds % 60);
			seconds = ('0' + seconds).slice(-2);
			return seconds;
		},

		openAuctionPlugin : function (){
			function complete() {
				jQuery2("#allAuctionsContainer").slideDown(300, function() { jQuery2(this).css('overflow', 'visible') });
				if(!jQuery2("#auctionsCloseButtonContainer").length){
					jQuery2("#allAuctionsContainer").prepend("<div id='auctionsCloseButtonContainer' width:214px onclick='OdendoAuctionsWidget.auctionPopup.closeAuctionPlugin()'></div>");
					jQuery2("#auctionsCloseButtonContainer").prepend("<img id='auctionPluginCloseButton' src='http://sleeknoteimages.sleeknote.com/default-with-image_close.png'>").hide().fadeIn(400);
					OdendoAuctionsWidget.auctionPopup.auctionPluginStylesApply();
				} else jQuery2("#auctionsCloseButtonContainer").fadeIn(400);
			}

			if (jQuery2(".auction").length == 0) {
				OdendoAuctionsWidget.auctionPopup.getAuctions();
			}
			jQuery2("#auctionBubble").fadeOut(50);
			teamAuctionSpeechBubble = document.cookie = "teamAuctionSpeechBubble=false";
			jQuery2("#auctionButtonImageContainer").fadeOut(200 ,complete);
		},

		closeAuctionPlugin : function (){
			function complete() {
				jQuery2("#auctionButtonImageContainer").fadeIn(200);
			}
			jQuery2("#allAuctionsContainer").slideUp(300, complete);
		},

		auctionPluginStylesApply : function (){
		},

		getBusinessUnit : function (){
			var getBusinessUnit = jQuery2.ajax({
				type: 'GET',
				//url: "http://localhost:45312/api/auctionapi?" + jQuery2.now(),
				url: "http://api.odendo.com/api/auctionapi?" + jQuery2.now(),
				contentType: 'text/plain',
				dataType: "json",
				data: { id: odendoData_BusinessUnitId, businessUnit: "yes" },
				xhrFields: {
					withCredentials: false
				},
				error: function() {
				}
			}).done(function( data ) {
				jQuery2("#businessUnitContainer").append(data);
			});
		},

		getButtonImage : function (){
			var getButtonImage = jQuery2.ajax({
				type: 'GET',
				//url: "http://localhost:45312/api/auctionapi?/" + jQuery2.now(),
				url: "http://api.odendo.com/api/auctionapi?" + jQuery2.now(),
				contentType: 'text/plain',
				dataType: "json",
				data: { image: "button" },
				xhrFields: {
					withCredentials: false
				},
				error: function() {
				}
			}).done(function( data ) {
				jQuery2("#auctionButtonImageContainer").append(data);
			});
		},
        
		
		
		getAuctions : function (){
			var getAuctions = jQuery2.ajax({
				type: 'GET',
				//url: "http://localhost:45312/api/auctionapi?" + jQuery2.now(),
				url: "http://api.odendo.com/api/auctionapi?" + jQuery2.now(),
				contentType: 'text/plain',
				dataType: "json",
				data: {id: odendoData_BusinessUnitId, selectAuctionsFromRow: jQuery2(".auction").length, teamType: odendoData_type},
				xhrFields: {
					withCredentials: false
				},
				error: function() {
				}
			}).done(function( data ) {
				var content = "";
				if (data.length < 10){
					loadMoreAuctions = false;
				}
				else {
					loadMoreAuctions = true;
				}
				for(i = 0; i < data.length; i++){
					content += data[i];
				}
				jQuery2("#allAuctions").append(content);
				OdendoAuctionsWidget.auctionPopup.auctionPluginStylesApply();
			});
		}
	}
})();
