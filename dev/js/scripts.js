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

    // document ready
    $(document).ready(function() {
        // bs tooltips
        $('[data-toggle="tooltip"]').tooltip();
        $('[data-extra="tooltip"]').tooltip();
        // sort by name – search field in projects th
        byNameinProjects();
        dashNav();
    });

    // all initial on window resize
    $(window).on('resize', function() {
    });


})(jQuery);
