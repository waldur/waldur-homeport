(function($) {

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
            $(this).toggleClass('state');
        });
    }

    // document ready
    $(document).ready(function() {
        // website js
        onePage();
        // account js
        tooltips();
        byNameinProjects();
        showGrouped();
        addResource();
        addResTemplate();
    });

    // all initial on window resize
    $(window).on('resize', function() {
    });


})(jQuery);
