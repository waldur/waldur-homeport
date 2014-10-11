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

    // menu
    function menuNames() {
        var link = $('.main-nav ul li a');
        link.each(function() {
            $(this).append('<span class=\"display-name\"></span>');
            $(this).find('.display-name').html($(this).attr('data-name'));
        });
    }

    // Event log
    function typeNotify() {
        var singleNotify = $('[data-notify="single-notify"]');
        var notifyDecor = singleNotify.find('.name');
        notifyDecor.append('<span class=\"sp\"></span>');

        var combineNotify = $('[data-notify="combine-notify"]');
        var notifyDecor = combineNotify.find('.name');
        notifyDecor.append('<span class=\"sp combine-1\"></span><span class=\"sp combine-2\"></span>');
    }

    function eventOverlay() {
        var eventItem = $('.main-activity-item');
        eventItem.each(function(){
            var box = $(this);
            box.append('<div class=\"overlay\"></div>')
            var overlayReady = $(this).find('.overlay');
            overlayReady.css('width', box.outerWidth()).css('height', box.outerHeight());
        });
    }

    // document ready
    $(document).ready(function() {
        absCenter();
        withFixedHeader();
        withFixedHeaderOne();
        newProject();
        typeNotify();
        eventOverlay();
        menuNames();
    });

    // all initial on window resize
    $(window).on('resize', function() {
        absCenter();
        withFixedHeader();
        withFixedHeaderOne();
    });

})(jQuery);
