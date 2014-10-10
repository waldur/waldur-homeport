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

    // document ready
    $(document).ready(function() {
        absCenter();
        withFixedHeader();
    });

    // all initial on window resize
    $(window).on('resize', function() {
        absCenter();
        withFixedHeader();
    });

})(jQuery);
