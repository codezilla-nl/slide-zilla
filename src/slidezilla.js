;(function ( $, window, undefined ) {

    var pluginName = 'slidezilla';

    /** Default settings */
    var defaults = {
        classes: {
            container: 'sz-slides',
            slide: 'sz-slide',
            slideSticky: 'sz-slide-sticky',
            stateExcluded: 'sz-slide-excluded',
            navigation: 'sz-nav',
            navigationVisible: 'sz-nav-visible',
            navigationHandle: 'sz-nav-handle',
            navigationHandleOpen: 'sz-nav-handle-open',
            navigationItems: 'sz-nav-items'
        }
    };

    /**
     * Slidezilla
     * @constructor
     * @param {object} element - The HTML element the validator should be bound to
     * @param {object} options - An option map
     */
    function Slidezilla(element, options) {
        this.element = element; // Selected DOM element
        this.$element = $(element); // Selected jQuery element

        this.slides = []; // Create slides array

        // Extend the defaults with the passed options
        this.options = $.extend( {}, defaults, options);

        this.init();
    }


    /**
     * This function initializes the plugin
     */
    Slidezilla.prototype.init = function () {
        this.slides = this._loadElements();
        this.nav = this._loadNavigation();

        this._loadClasses();

        this.lastScrollTop = 0;

        this._addEventListeners();
        this._determineOffsets();
    };

    //
    // PRIVATE FUNCTIONS
    //

    /**
     * This function loads the slide elements and stores them in an array
     * @returns {Array} Array of slide elements
     */
    Slidezilla.prototype._loadElements = function() {
        var _this = this;
        var slides = [];
        var id = 0;

        // Get slide element and store their data in an array
        $('section', _this.$element).each(function(index) {
            var $panel = $(this).css('z-index', index+1);
            var isExcluded = $panel.hasClass(_this.options.classes.stateExcluded);

            // Check if the slide should be excluded
            if(!isExcluded) {

                var oSlide = {
                    _ignoreHashChange: false,
                    id: id,
                    panel: $panel,
                    active: false
                };

                // 1up the ID
                id++;
                // Add to slide array
                slides.push(oSlide);
            }
        });
        return slides;
    };

    /**
     * This function loads the navigation elements
     * @returns {Array} Array of slide elements
     */
    Slidezilla.prototype._loadNavigation = function() {
        var _this = this;
        var $nav = $(this.options.navigation, _this.$element);
        var oNav = null;

        if($nav.length) {
            oNav = {
                container: $nav,
                handle: $('.' + this.options.classes.navigationHandle, $nav),
                items: $('.' + this.options.classes.navigationItems, $nav),
                links: []
            };

            $('a', $nav).each(function() {
                var $link = $(this);
                var $target;

                try {
                    $target = $($link.attr('href'));
                } catch(err) {}

                if($target && $target.length) {
                    oNav.links.push($(this));
                }
            });
        }

        return oNav;
    };

    /**
     * Adds classes to the tab elements based on the options
     */
    Slidezilla.prototype._loadClasses = function() {
        // Add container class
        this.$element.addClass(this.options.classes.container);

        // Add class to nav (if present)
        if(this.nav) {
            this.nav.container.addClass(this.options.classes.navigation);
        }

        // Loop all slides
        for (var i=0; i<this.slides.length; i++) {
            // Add slide class
            this.slides[i].panel.addClass(this.options.classes.slide);
        }
    };

    /**
     * Adds event listeners to elements
     * @private
     */
    Slidezilla.prototype._addEventListeners = function() {
        var _this = this;
        var handleLinkClick;

        $(window).on('scroll', this._throttle(_this._handleScroll));
        $(window).on('resize', this._throttle(_this._determineOffsets));

        if(this.nav) {
            handleLinkClick = function(e) {
                _this._goTo(e, this);
            };

            this.nav.handle.on('click', function () {
                _this._toggleNavItems();
            });

            for (var i = 0; i < this.nav.links.length; i++) {
                this.nav.links[i].on('click', handleLinkClick);
            }
        }
    };

    /**
     * Handles the scroll event
     * @private
     */
    Slidezilla.prototype._handleScroll = function() {
        var scrollTop = $(window).scrollTop();
        var scrollBottom = scrollTop + $(window).height();

        this._determineActiveSlide(scrollTop, scrollBottom);

        if(this.nav && this.nav.handle.is(':hidden')) {
            this._toggleNavbar(scrollTop < this.lastScrollTop && scrollTop >= 0);
        }
        this.lastScrollTop = scrollTop;
    };

    /**
     * Navigates to a slide
     * @private
     */
    Slidezilla.prototype._goTo = function(e, element) {
        var target = $(element).attr('href');
        var offset = $(target)[0].offsetTop;

        e.preventDefault();

        if(this.nav && this.nav.handle.is(':visible')) {
            offset -= this.nav.handle.outerHeight();
        }

        this._toggleNavItems(false);

        $('html, body').animate({scrollTop: offset}, 800, 'swing');
    };

    /**
     * Checks if a slide is too big for the viewport
     * @param {Object} slide
     * @returns {boolean}
     * @private
     */
    Slidezilla.prototype._isSlideTooBig = function(slide) {
        return (slide.panel.outerHeight() > $(window).height());
    };

    /**
     * Determines the current active slide based on a offsetTop or offsetBottom
     * @param {number} offsetTop - The top offset of the viewport
     * @param {number} offsetBottom - The bottom offset of the viewport
     * @private
     */
    Slidezilla.prototype._determineActiveSlide = function(offsetTop, offsetBottom) {
        var _this = this;

        this.slides.forEach(function(slide, index) {
            var slideTooBig = _this._isSlideTooBig(slide);
            var originalOffset = parseInt(slide.panel.attr('data-offset'));

            // Check if panel should be sticky based on smaller/bigger then viewport
            if (slideTooBig && slide.panel[0].offsetTop + slide.panel.height() <= offsetBottom && originalOffset + slide.panel.height() < offsetBottom) {
                _this._setSticky(slide, true);
            } else if (!slideTooBig && slide.panel[0].offsetTop <= offsetTop && originalOffset < offsetTop) {
                _this._setSticky(slide, true);
            } else if (slideTooBig && originalOffset + slide.panel.height() > offsetBottom) {
                _this._setSticky(slide, false);
            } else if (!slideTooBig && originalOffset > offsetTop) {
                _this._setSticky(slide, false);
            }
        });
    };


    /**
     * Toggles a slide to stick to the top or bottom of the viewport
     * @param {Object} slide
     * @param {boolean} isSticky - Toggle
     * @private
     */
    Slidezilla.prototype._setSticky = function(slide, isSticky) {
        var slideTooBig = this._isSlideTooBig(slide);
        var offset;

        if(isSticky) {
            offset = slide.panel.css('top');

            if(slideTooBig) {
                slide.panel.addClass(this.options.classes.slideSticky).css({top: 'auto', bottom: 0});
            } else {
                slide.panel.addClass(this.options.classes.slideSticky).css({top: 0, bottom: 'auto'});
            }
        } else {
            offset = slide.panel.attr('data-offset');
            slide.panel.removeClass(this.options.classes.slideSticky).css({top: offset + 'px', bottom: 'auto'});
        }
    };

    /**
     * Throttles a function
     * @param {Function} callback
     * @param {number} limit - Throttle limit
     * @returns {Function}
     * @private
     */
    Slidezilla.prototype._throttle = function (callback, limit) {
        var _this = this;
        var wait = false;
        return function (e) {
            if (!wait) {
                callback.call(_this, e);
                wait = true;
                setTimeout(function () {
                    wait = false;
                }, limit);
            }
        };
    };

    /**
     * Toggles the navigation visibility
     * @param {boolean} show
     * @private
     */
    Slidezilla.prototype._toggleNavbar = function(show) {
        this.nav.container.toggleClass(this.options.classes.navigationVisible, show);
    };

    Slidezilla.prototype._toggleNavItems = function(show) {
        this.nav.handle.toggleClass(this.options.classes.navigationHandleOpen, show);
    };

    /**
     * Determines the offsets of all the panels
     * @private
     */
    Slidezilla.prototype._determineOffsets = function() {
        var _this = this;
        var offset = 0;

        _this.slides.forEach(function(slide) {
            slide.panel.css({ top: offset });
            slide.panel.attr({ 'data-offset': offset });

            offset += slide.panel.height();
        });
    };



    //
    // PUBLIC FUNCTIONS
    //


    /**
     * Refreshes the plugin and all the panels (incl. added and removed panels)
     */
    Slidezilla.prototype.refresh = function() {

    };


    /**
     * This function can be used to get/set options
     * @return {*} Option value
     */
    Slidezilla.prototype.option = function(key, value) {
        if(value) {
            this.options[key] = value;
        }
        return this.options[key];
    };

    /** jQuery wrapper */
    $.fn[pluginName] = function ( options ) {
        var args = arguments;
        if (options === undefined || typeof options === 'object') {
            return this.each(function () {
                if (!$.data(this, pluginName)) {
                    $.data(this, pluginName, new Slidezilla( this, options ));
                }
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            return this.each(function () {
                var instance = $.data(this, pluginName);

                if (instance instanceof Slidezilla && typeof instance[options] === 'function') {
                    instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
                }

                // Allow instances to be destroyed via the 'destroy' method
                if (options === 'destroy') {
                    // TODO: destroy instance classes, etc
                    $.data(this, pluginName, null);
                }
            });
        }
    };

}(jQuery, window));
