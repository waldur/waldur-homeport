(function($) {

    function equalheight(container) {

        var currentTallest = 0,
            currentRowStart = 0,
            rowDivs = new Array(),
            $el,
            topPosition = 0;

        $(container).each(function() {

            $el = $(this);
            $($el).height('auto')
            topPostion = $el.position().top;

            if (currentRowStart != topPostion) {
                for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
                    rowDivs[currentDiv].height(currentTallest);
                }
                rowDivs.length = 0; // empty the array
                currentRowStart = topPostion;
                currentTallest = $el.height();
                rowDivs.push($el);
            } else {
                rowDivs.push($el);
                currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
            }
            for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
                    rowDivs[currentDiv].height(currentTallest);
            }
        });
    }

    // functions
    function absCenter(elem) {
        $el = elem;
        var elLeft = -$el.width()/2;
        var elTop = -$el.height()/2;
        $el.css({
            'margin-top': elTop,
            'margin-left': elLeft
        });
    }
    function stateCheck(elem, clName) {
        $el = elem;
        $clName = clName
        if (!$el.hasClass(clName)) {
            $el.addClass(clName);
        } else {
            $el.removeClass(clName);
        }
    }

    // choices
    function choices(elem, classname) {
        var templ = $(elem);
        templ.click(function(){
            templ.removeClass(classname);
            $(this).addClass(classname);
        });
    }

    // for website
    // one page scroll
    function onePage() {
        $('.scroller').click(function(){
            var section = $($(this).data("section"));
            var top = section.offset().top;
            $("html, body").animate({ scrollTop: top }, 700);
            return false;
        });
    }

    // login slide
    function loginSlide() {
        var windowHieght = $(window).height();
        var siteHeader = $('[data-role="header"]').height();
        var siteFooter = $('[data-role="footer"]').height();
        var login = $('[data-role="login"]');
        var loginBox = $('[data-role="login-box"]');
        var loginBoxInputs = $('[data-role="login-box-inputs"]');
        var switchTrigger = $('[data-role="switch-login-form"]');
        var additional = $('[data-role="login-additional"]');
        var loginPadding = 0;

        if (loginBox.height() > loginBoxInputs.height()) {
            loginPadding = loginBox.height();
        } else {
            loginPadding = loginBoxInputs.height()
        }

        login.css('min-height', windowHieght-(siteHeader+siteFooter));
        loginBox.css('top', (windowHieght*.2))
        loginBoxInputs.css('top', (windowHieght*.2))
        additional.css('top', loginPadding+(windowHieght*.2));
        
        // absCenter(loginBox);
        // absCenter(loginBoxInputs);
        loginBox.addClass('transition');
        loginBoxInputs.addClass('transition');

        switchTrigger.click(function(){            
            stateCheck(loginBox, 'state');
            stateCheck(loginBoxInputs, 'state');
        });
    }

    // for account
    // tooltips
    function tooltips() {
        $('[data-toggle="tooltip"]').tooltip();
        $('[data-extra="tooltip"]').tooltip();
    }

    // sort by name – search field in projects th
    function byNameinProjects(){
        var searchBox = $('[data-proj-sort="box"]');
        searchBox.each(function (){
            var searchTrigger = $(this).find('[data-proj-sort="name"]');
            var searchField = $(this).find('[data-proj-sort="field"]');
            searchTrigger.click(function (){
                $(this).toggleClass('active');
                if(!searchField.hasClass('state')) {
                    searchField.addClass('state');
                } else {
                    searchField.removeClass('state');
                }
            });
        });
    }

    // show input
    function showGrouped() {
        var infoBox = $('[data-grouped="box"]');
        infoBox.each(function() {
            var groupedTrigger = $(this).find('[data-grouped="trigger"]');
            var groupedShowGrouped = $(this).find('[data-grouped="show-grouped"]');
            groupedTrigger.click(function() {
                if(!groupedShowGrouped.hasClass('state')) {
                    groupedShowGrouped.addClass('state');
                } else {
                    groupedShowGrouped.removeClass('state');
                }
            });
        });        
    }

    // add resource
    function addResource() {
        var appHeaderHeight = $('.app-header').height();
        var addResTrigger = $('[data-add-trigger="add-presource"]');
        var addResBox = $('[data-add-box="add-presource"]');
        addResBox.css('top', appHeaderHeight);
    }

    function searchAnimate() {
        var box = $('[data-role="search-box"]');
        box.each(function() {
            searchbox = $(this);
            var searchinput = searchbox.find('input');
            // console.log(searchinput);
            searchinput.on('focus', function() {
                searchbox.addClass('state');
            });
            searchinput.on('blur', function() {
                searchbox.removeClass('state');
            });
                // if (searchinput.is(':focus')) {
                //     searchbox.addClass('state');
                //     console.log(searchbox);
                // } else {
                //     searchbox.removeClass('state');
                //     console.log(searchbox);
                // }
            // $(this).find('input').on('focus', function() {
            //     $(this).parent('[data-role="search-box"]').addClass('state');
            // });
        });
    }

    // document ready
    $(window).on('load', function() {
        // website js
        onePage();
        loginSlide();
        // account js
        tooltips();
        byNameinProjects();
        showGrouped();
        addResource();
        equalheight('[data-role="appstore"] [data-role="appstore-template"]');
        equalheight('[data-role="servicestore"] [data-role="servicestore-template"]');
        // addResTemplate();
        choices('[data-role="appstore-template"]', 'state');
        choices('[data-role="plan-in-data"]', 'active');
        choices('[data-role="servicestore-template"]', 'state');
        $('.disabled').bind('click', function(){ return false; });
        searchAnimate()
    });

    // all initial on window resize
    $(window).on('resize', function() {
        loginSlide();
    });


})(jQuery);
