/**
 * uiMorphingButton_fixed.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */
;( function( window ) {
	
	'use strict';

	var transEndEventNames = {
			'WebkitTransition': 'webkitTransitionEnd',
			'MozTransition': 'transitionend',
			'OTransition': 'oTransitionEnd',
			'msTransition': 'MSTransitionEnd',
			'transition': 'transitionend'
		},
		transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
		support = { transitions : Modernizr.csstransitions };

	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	function UIMorphingButton( el, options ) {
		this.el = el;
		this.options = extend( {}, this.options );
		extend( this.options, options );
		this._init();
	}

	UIMorphingButton.prototype.options = {
		closeEl : '',
		onBeforeOpen : function() { return false; },
		onAfterOpen : function() { return false; },
		onBeforeClose : function() { return false; },
		onAfterClose : function() { return false; }
	}

	UIMorphingButton.prototype._init = function() {
		// the button
		this.button = this.el.querySelector( 'button' );
		// state
		this.expanded = false;
		// content el
		this.contentEl = this.el.querySelector( '.morph-content' );
		// init events
		this._initEvents();
	}

	UIMorphingButton.prototype._initEvents = function() {
		var self = this;
		// open
		this.button.addEventListener( 'click', function() { 
		var ht = $('#DateSet').data('handsontable');
		
		//Veri girilip girilmediği inceleniyor...
		if (ht.countCols()-40>0 && ht.countRows()-30>0){
			
			//Veri setinden seçili olan alan alındı.
			var sel = ht.getSelected();
			
			//Seçili alanın sütun sayısı 2 ve üzerimi satır sayısı 2 ve üzeri mi
			if (((sel[3]-sel[1]) == 0) && ((sel[2]-sel[0]) == 0)) {
				alert('Verilerinizin analiz edilmesini istediğiniz sayısal bölümü seçiniz.');	
			}
			else if (((sel[3]-sel[1]) < 1) || ((sel[2]-sel[0]) < 1)) {
				alert('Seçmiş olduğunuz veri alanı uygun genişlikte değildir. Seçmiş olduğunuz veri seti En az 2 sütun ve 2 satırdan oluşmalıdır.');
				}
			else {
				
				var i;
				var j;
				var k;
				var dataColStatus = [];
				var emptyData = 0;
				var dataType;
				var dataStock;
				k = 1;
				
				//Sütun işlemi
				for (j=sel[1]+1;j<=sel[3]+1;j++){
					
					
					//Satır işlemi
					for(i=sel[0]+1;i<=sel[2]+1;i++){
						
						//Boş veri kontrolü
						if ((ht.getDataAtCell(i-1,j-1) == null) || (ht.getDataAtCell(i-1,j-1) == ".") || (ht.getDataAtCell(i-1,j-1) == "x") || (ht.getDataAtCell(i-1,j-1) == "-") || (ht.getDataAtCell(i-1,j-1) == "") || (ht.getDataAtCell(i-1,j-1) == "")) { emptyData++; }
						else  {
							if ($.isNumeric(ht.getDataAtCell(i-1,j-1)) == false ) {dataType = "text"; }
						}
						
						
					}
					
					if (dataType != "text") {dataType = "numeric";}
					
					if (emptyData==0) {dataStock = "fullCol";}
					else {dataStock = "emptyCol";}
					
					
					dataColStatus.push({
						id        : j-1,
						emptyData : emptyData,
						dataType  : dataType,
						dataStock : dataStock
					});	
					
					emptyData = 0;
					dataType = "";
					
					k++;
				}
				k=0;
				alert(JSON.stringify(dataColStatus));
				self.toggle();}
			 	
		}
		else {alert('Öncelikli olarak veri setinizi girmelisiniz.');}
		
		
		}
		);
		// close
		if( this.options.closeEl !== '' ) {
			var closeEl = this.el.querySelector( this.options.closeEl );
			if( closeEl ) {
				closeEl.addEventListener( 'click', function() { self.toggle(); } );
			}
		}
	}

	UIMorphingButton.prototype.toggle = function() {
		if( this.isAnimating ) return false;

		// callback
		if( this.expanded ) {
			this.options.onBeforeClose();
		}
		else {
			// add class active (solves z-index problem when more than one button is in the page)
			classie.addClass( this.el, 'active' );
			this.options.onBeforeOpen();
		}

		this.isAnimating = true;

		var self = this,
			onEndTransitionFn = function( ev ) {
				if( ev.target !== this ) return false;

				if( support.transitions ) {
					// open: first opacity then width/height/left/top
					// close: first width/height/left/top then opacity
					if( self.expanded && ev.propertyName !== 'opacity' || !self.expanded && ev.propertyName !== 'width' && ev.propertyName !== 'height' && ev.propertyName !== 'left' && ev.propertyName !== 'top' ) {
						return false;
					}
					this.removeEventListener( transEndEventName, onEndTransitionFn );
				}
				self.isAnimating = false;
				
				// callback
				if( self.expanded ) {
					// remove class active (after closing)
					classie.removeClass( self.el, 'active' );
					self.options.onAfterClose();
				}
				else {
					self.options.onAfterOpen();
				}

				self.expanded = !self.expanded;
			};

		if( support.transitions ) {
			this.contentEl.addEventListener( transEndEventName, onEndTransitionFn );
		}
		else {
			onEndTransitionFn();
		}
			
		// set the left and top values of the contentEl (same like the button)
		var buttonPos = this.button.getBoundingClientRect();
		// need to reset
		classie.addClass( this.contentEl, 'no-transition' );
		this.contentEl.style.left = 'auto';
		this.contentEl.style.top = 'auto';
		
		// add/remove class "open" to the button wraper
		setTimeout( function() { 
			self.contentEl.style.left = buttonPos.left + 'px';
			self.contentEl.style.top = buttonPos.top + 'px';
			
			if( self.expanded ) {
				classie.removeClass( self.contentEl, 'no-transition' );
				classie.removeClass( self.el, 'open' );
			}
			else {
				setTimeout( function() { 
					classie.removeClass( self.contentEl, 'no-transition' );
					classie.addClass( self.el, 'open' ); 
				}, 25 );
			}
		}, 25 );
	}

	// add to global namespace
	window.UIMorphingButton = UIMorphingButton;

})( window );