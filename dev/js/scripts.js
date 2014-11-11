(function($) {

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
        
        login.css('height', windowHieght-(siteHeader+siteFooter));

        var loginBox = $('[data-role="login-box"]');
        var loginBoxInputs = $('[data-role="login-box-inputs"]');
        var switchTrigger = $('[data-role="switch-login-form"]');
        
        absCenter(loginBox);
        absCenter(loginBoxInputs);
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
                    console.log('foo bar')
                } else {
                    searchField.removeClass('state');
                    console.log('fuck')
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
                    console.log('sd')
                } else {
                    groupedShowGrouped.removeClass('state');
                    console.log('fail')
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

    function addResTemplate() {
        var templ = $('[data-role="appstore-template"]');
        templ.click(function(){
            templ.removeClass('state');
            $(this).addClass('state');
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
        addResTemplate();
    });

    // all initial on window resize
    $(window).on('resize', function() {
        loginSlide();
    });


})(jQuery);
