(function () {
    'use strict';
    var cfg = window.hotspotConfig || {};
    if (cfg['enable-loyalty-system'] !== true) return;

    function append(src) {
        var script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.head.appendChild(script);
    }
    append('js/loyalty-system/loyalty-integration.js');
    append('js/notifications-system/notifications-integration.js');
})();
