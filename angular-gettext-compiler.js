// Based on https://raw.githubusercontent.com/rubenv/angular-gettext-tools/master/lib/compile.js
// It supports one locale per file
'use strict';

var po = require('pofile');

var noContext = '$$noContext';

var Compiler = (function () {
    function Compiler() {}

    Compiler.browserConvertedHTMLEntities = {
        'hellip': '…',
        'cent': '¢',
        'pound': '£',
        'euro': '€',
        'laquo': '«',
        'raquo': '»',
        'rsaquo': '›',
        'lsaquo': '‹',
        'copy': '©',
        'reg': '®',
        'trade': '™',
        'sect': '§',
        'deg': '°',
        'plusmn': '±',
        'para': '¶',
        'middot': '·',
        'ndash': '–',
        'mdash': '—',
        'lsquo': '‘',
        'rsquo': '’',
        'sbquo': '‚',
        'ldquo': '“',
        'rdquo': '”',
        'bdquo': '„',
        'dagger': '†',
        'Dagger': '‡',
        'bull': '•',
        'prime': '′',
        'Prime': '″',
        'asymp': '≈',
        'ne': '≠',
        'le': '≤',
        'ge': '≥',
        'sup2': '²',
        'sup3': '³',
        'frac12': '½',
        'frac14': '¼',
        'frac13': '⅓',
        'frac34': '¾'
    };

    Compiler.hasFormat = function (format) {
        return format === 'json';
    };

    Compiler.prototype.convertPo = function (content) {
        var catalog = po.parse(content);

        if (!catalog.headers.Language) {
            throw new Error('No Language header found!');
        }

        var strings = {};
        for (var i = 0; i < catalog.items.length; i++) {
            var item  = catalog.items[i];
            var ctx   = item.msgctxt || noContext;
            var msgid = item.msgid;

            var convertedEntity;
            var unconvertedEntity;
            var unconvertedEntityPattern;

            for ( unconvertedEntity in Compiler.browserConvertedHTMLEntities ) {
                convertedEntity = Compiler.browserConvertedHTMLEntities[ unconvertedEntity ];
                unconvertedEntityPattern = new RegExp( '&' + unconvertedEntity + ';?', 'g' );
                msgid = msgid.replace( unconvertedEntityPattern, convertedEntity );
            }

            if (item.msgstr[0].length > 0 && !item.flags.fuzzy && !item.obsolete) {
                if (!strings[msgid]) {
                    strings[msgid] = {};
                }

                // Add array for plural, single string for signular.
                strings[msgid][ctx] = item.msgstr.length === 1 ? item.msgstr[0] : item.msgstr;
            }
        }

        // Strip context from strings that have no context.
        for (var key in strings) {
            if (Object.keys(strings[key]).length === 1 && strings[key][noContext]) {
                strings[key] = strings[key][noContext];
            }
        }

        return JSON.stringify(strings);
    };

    return Compiler;
})();

module.exports = Compiler;
