(function($) {

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

    function dashNav(){
        var dashNavBox = $('.dash-nav');
        dashNavBox.css('margin-top', -dashNavBox.height()/2)
    }

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

    // document ready
    $(document).ready(function() {
        // bs tooltips
        $('[data-toggle="tooltip"]').tooltip();
        $('[data-extra="tooltip"]').tooltip();
        byNameinProjects();
        dashNav();
        showGrouped();
    });

    // all initial on window resize
    $(window).on('resize', function() {
    });


})(jQuery);
