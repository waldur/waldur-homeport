(function($) {

    // absolutelly center
    function absCenter(){
        elem = $('[data-role="abs-center"]');
        elemHeight = elem.outerHeight();
        elemWidth = elem.outerWidth();
        elem.css('margin-top', -elemHeight/2);
        elem.css('margin-left', -elemWidth/2);
    }

    // document ready
    $(document).ready(function() {
        $('.nav > li > a').tooltip();
        // absCenter();
        // withFixedHeader();
        // withFixedHeaderOne();
        // newProject();
        // typeNotify();
        // // eventOverlay();
        // menuNames();
        // tooltip();
    });

    // all initial on window resize
    $(window).on('resize', function() {
        // absCenter();
        // withFixedHeader();
        // withFixedHeaderOne();
    });

})(jQuery);
