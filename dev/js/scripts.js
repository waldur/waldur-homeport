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

    // document ready
    $(document).ready(function() {
        // bs tooltips
        $('[data-toggle="tooltip"]').tooltip();
        // sort by name – search field in projects th
        byNameinProjects();
    });

    // all initial on window resize
    $(window).on('resize', function() {
    });


})(jQuery);
