(function($) {

    function absCenter(){
        elem = $('[data-role="abs-center"]');
        elemHeight = elem.outerHeight();
        elemWidth = elem.outerWidth();
        elem.css('margin-top', -elemHeight/2);
        elem.css('margin-left', -elemWidth/2);
    }

    function withFixedHeader(){
        var body = $('[data-role="with-fixed-header"]');
        var fixedHeaderHeight = $('[data-role="fixed-header"]').height();
        body.css('padding-top', fixedHeaderHeight*2);
    }

    function withFixedHeaderOne(){
        var body = $('[data-role="with-fixed-header-one"]');
        var fixedHeaderHeight = $('[data-role="fixed-header"]').height();
        body.css('padding-top', fixedHeaderHeight);
    }

    function newProject(){
        var trigger = $('[data-role="new-project-trigger"]');
        var createNewProject = $('[data-role="create-new-project"]');
        trigger.click(function(){
            if(!createNewProject.hasClass('state')) {
                createNewProject.addClass('state');
            } else {
                createNewProject.removeClass('state');
            }
        });
    }

    // document ready
    $(document).ready(function() {
        absCenter();
        withFixedHeader();
        withFixedHeaderOne();
        newProject();
    });

    // all initial on window resize
    $(window).on('resize', function() {
        absCenter();
        withFixedHeader();
        withFixedHeaderOne();
    });

})(jQuery);
