/** ++*[black[jsdog.js]*++ - Simple JSDoc documentation generator
 *
 * For command-line usage see *`jsdog --help'*
 *
 * Each line in a javascript comment block may contain simple formatters:
 * &nbsp; + *Bold*: enclose text in asterisks
 * &nbsp; + !Italic!: enclose text in exclamations
 * &nbsp; + _Underline_: enclose text in underscores
 * &nbsp; + --Smaller--: enclose text in double-minusses
 * &nbsp; + ++Larger++: enclose text in double-plusses
 * &nbsp; + ^Superscript^: enclose text in carets
 * &nbsp; + [red[simple colors]: see example by viewing this file's source code
 * &nbsp; + [green|black[ dual color ]: another example showing foreground & background colors
 * 
 * Email addresses and internet urls (FTP, HTTP[S]) found within the comment blocks are automatically converted
 *
 * @version 0.6.3
 * @author Scott Elcomb <psema4@gmail.com> http://www.psema4.com/
 */

/**
 * Virtual constructor (NPM Module Wrapper)
 * @constructor
 * @method jsdog
 */

var fs = require('fs'),
    util = require('util'), 
    lineCounter = 0,
    blocks = {},
    blockCounter = 0,
    inBlock = false,

    logLevel = [ false, true, "verbose", "super" ],
    logging = logLevel[0],

    rex = {
        // block control
        inline:         /\/\*(.*)\*\//,
        startBlock:     /\/\*\*/,
        endBlock:       /\*\//,
        blockComment:   /\s*\*+\s*(.*)$/,

        // uri replacement
        email:          /((?:\w+\+*\w+)@\w+\.\w+)/,
        uri:            /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,

        // formatters
        bold:           /(\*\s*.*\s*\*)/,
        italic:         /(!\s*.*\s*!)/,
        underline:      /(_\s*.*\s*_)/,
        larger:         /(\+\+\s*.*\s*\+\+)/,
        smaller:        /(--\s*.*\s*--)/,
        superscript:    /(\^\s*.*\s*\^)/,
        colored:        /(\[([\w\|]+)\[(.*)\])/,

        // jsdoc tags
        author:         /@author\s+(.*)/i,
        version:        /@version\s+(.*)/i,
        constructor:    /@constructor/i,
        deprecated:     /@deprecated/i,
        method:         /@method\s+(.*)/i,
        memberOf:       /@this\s+(.*)/i,
        param:          /@param\s+{(\w+)}\s+(\w+)\s+(.*)$/i,
        returns:        /@returns\s+{(\w+)}\s+(.*)$/i
    };

/**
 * Emits a string of text to stderr when logging is turned on
 * @method jsdog.log
 * @param {string} text A string of text to send to stderr
 */
function log(text) {
    if (logging) console.warn(text);
}

/**
 * View jsdog.parseLine() source code for examples
 *
 * @method jsdog.formatterSimple
 * @param {string} line Line of test to reformat
 * @param {regex} re Capturing regular expression to test against
 * @param {string} replacement String to replace original line with; "%1" should be used as placeholder for match
 * @param {object} fnObj Optional object containing preFormat() & postFormat() methods, both of which should accept & return a string of text
 * @returns {string} Resulting formatted string
 */

function formatterSimple(line, re, replacement, fnObj) {
    if (re.test(line)) {
        if (fnObj && fnObj.preFormat) line = fnObj.preFormat(line);

        var match = re.exec(line)[1];
        if (logging) log("formatterSimple found match: " + match);
        replacement = replacement.replace(/%1/, match);
        line = line.replace(re, replacement);

        if (fnObj && fnObj.postFormat) line = fnObj.postFormat(line);
    }

    return line;
}

/**
 * Parses a single line of javascript looking for JSDoc tags and text formatters. Also formats web & email addresses for use in the html output
 * @method jsdog.parseLine
 * @param {string} text A line of text to check for JSDoc tags & URI's
 * @param {string} key Block identifier for any JSDoc tag matches on this line
 */
function parseLine(text, key) {
    // TODO: precompile postFormat regexes

    // simple formatters - bold
    text = formatterSimple(text,
        rex.bold,
        "<b>%1</b>",
        { postFormat: function(line) { return line.replace(/\*/g, ''); } }
    );

    // simple formatters - italic
    text = formatterSimple(text,
        rex.italic,
        "<i>%1</i>",
        { postFormat: function(line) { return line.replace(/!/g, ''); } }
    );

    // simple formatters - underline
    text = formatterSimple(text,
        rex.underline,
        "<u>%1</u>",
        { postFormat: function(line) { return line.replace(/_/g, ''); } }
    );

    // simple formatters - larger
    text = formatterSimple(text,
        rex.larger,
        '<span style="font-size: x-large;">%1</span>',
        { postFormat: function(line) { return line.replace(/\+\+/g, ''); } }
    );

    // simple formatters - smaller
    text = formatterSimple(text,
        rex.smaller,
        '<span style="font-size: x-small;">%1</span>',
        { postFormat: function(line) { return line.replace(/--/g, ''); } }
    );

    // simple formatters - super
    text = formatterSimple(text,
        rex.superscript,
        '<sup>%1</sup>',
        { postFormat: function(line) { return line.replace(/\^/g, ''); } }
    );

    // check for email addresses
    if (rex.email.test(text)) {
        var email = rex.email.exec(text)[1];
        if (logging) log('found "' + email + '" in line: ' + text);
        text = text.replace(/</, '&lt;').replace(/>/, '&gt;');      // get rid of optional angle brackets
        email = email.replace(/@/, '-at-').replace(/\./g, '-dot-'); // add a tiny bit of protection from scraping
        text = text.replace(rex.email, email);
        if (logging) log('  now: ' + text);
    }

    // check for ftp and http/s uri's
    if (rex.uri.test(text)) {
        var uriMatch = rex.uri.exec(text);
        var uri = uriMatch[1] + '://' + uriMatch[3];
        var link = '<a href="' + uri + '">' + uri + '</a>';
        if (logging) log('found "' + uri +'" in line: ' + text);
        text = text.replace(rex.uri, link);
        if (logging) log('  now: ' + text);
    }

    // check for color formatters
    if (rex.colored.test(text)) {
        var colored = rex.colored.exec(text);
        var color = colored[2];
        var coloredText = colored[3].replace(/\s/g, '&nbsp;');

        var style = 'color: ';
        if (color.match(/\|/)) { // check for background color
            var colors = color.split(/\|/);
            style += colors[0] + '; background-color: ' + colors[1] + ';';
        } else {
            style += color + ';';
        }

        if (logging) log('found "' + coloredText + '" to be colored.');
        coloredText = '<span style="' + style + '">' + coloredText.replace(/\^/g, ' ') + '</span>';
        if (logging) log('  now: ' + coloredText);
        text = text.replace(rex.colored, coloredText);
    }

    // check for jsdoc tags
    if (rex.author.test(text)) {
        blocks[key].author = rex.author.exec(text)[1];

    } else if (rex.version.test(text)) {
        blocks[key].version = rex.version.exec(text)[1];

    } else if (rex.constructor.test(text)) {
        blocks[key].constructor = true;

    } else if (rex.deprecated.test(text)) {
        blocks[key].deprecated = true;

    } else if (rex.method.test(text)) {
        blocks[key].name = rex.method.exec(text)[1];

    } else if (rex.memberOf.test(text)) {
        blocks[key].thisParam = rex.memberOf.exec(text)[1];

    } else if (rex.param.test(text)) {
        if (! blocks[key].params) blocks[key].params = [];

        var parts = rex.param.exec(text);
        blocks[key].params.push({
            datatype: parts[1],
            name:     parts[2],
            desc:     parts[3]
        });

    } else if (rex.returns.test(text)) {
        if (! blocks[key].returns) blocks[key].returns = [];

        var parts = rex.returns.exec(text);
        blocks[key].returns.push({
            datatype: parts[1],
            desc:     parts[2]
        });

    } else {
        if (ignoreBlankLines) {
            if (text != "") blocks[key].text += text + "<br />\n";
        } else {
            blocks[key].text += text + "<br />\n";
        }
    } 
}

/**
 * Processes an input source file line-by-line, scanning for JSDoc tags in javascript comment blocks
 * @method jsdog.parseSourceFile
 * @param {string} filename The filename to read then parse for JSDom tags
 * @param {object} cliOpts Command line options as parsed by nopt - see https://github.com/isaacs/nopt
 * @param {function} fn Callback to receive scan results once completed
 */
function parseSourceFile(filename, cliOpts, fn) {
    logging = (cliOpts && cliOpts.loglevel) ? logLevel[cliOpts.loglevel] : false;
    ignoreBlankLines = (cliOpts && cliOpts.ignore) ? cliOpts.ignore : false;

    var startTime = Date.now(),
        endTime = 0;

    this.readSourceFile(filename, function(data) {
        data = data + '';

        processed = {
            docs: '',
            genTime: 0,
            src: ''
        };

        var lines = data.split("\n");

        // process file
        for (var i=0; i<lines.length; i++) {
            lineCounter++;
            var line = lines[i];
            if (logging === 'verbose') log(sprintf("[%05s] >|%-120s|<", lineCounter, line));
            processed.src += line + "\n";
            var blockKey = 'block' + blockCounter;
            var text;

            if (rex.inline.test(line)) {
                text = rex.inline.exec(line)[1];
                if (! inBlock) {
                    if (blockCounter > 0) {
                        var lastBlock = 'block' + (blockCounter-1);
                        log(
                            sprintf("%4s found oob-inline comment: text=%s, key=%s",
                            '', text, lastBlock)
                        );
                        if (logging === 'super') log(util.inspect(blocks[lastBlock]));
                        parseLine(text, lastBlock);
                    }
                }

            } else if (rex.startBlock.test(line)) {
                log(sprintf("%2s entering block on line %d", '', lineCounter));
                inBlock = true;
                blocks[blockKey] = {
                    id:   blockKey,
                    text: ''
                };

            } else if (inBlock && rex.endBlock.test(line)) {
                log(sprintf("%2s leaving block on line %d", '', lineCounter));
                inBlock = false;
                blockCounter++;
                log(sprintf("%2s blockCounter = %d", '', blockCounter));
            }

            if (inBlock && rex.blockComment.test(line)) text = rex.blockComment.exec(line)[1];

            if (inBlock) {
                parseLine(text, blockKey);

            } else {
                var lastBlock = 'block' + (blockCounter-1);

                if (! blocks[lastBlock].declaration) {
                    fnDec = '';

                    if (line.match(/\.([\w\$]+)\s*=\s*function\s*\(/)) {
                        fnDec = line.match(/\.([\w\$]+)\s*=\s*function\s*\(/)[1];

                    } else if (line.match(/.*function\s+([\w\$]+)\s*\(/)) {
                        fnDec = line.match(/.*function\s+([\w\$]+)\s*\(/)[1];
                    }

                    if (logging === 'super') log(
                        sprintf("%4s fnDec for lastBlock '%s': %s",
                        '', lastBlock, fnDec)
                    );

                    if (line.match(/function/)) {
                        line = line.replace(/{/, '');
                        blocks[lastBlock].declaration = line;
                    }

                    if (! blocks[lastBlock].name && fnDec != '') blocks[lastBlock].name = fnDec;
                }
            }
        }

        // for (var b in blocks) console.log(util.inspect(blocks[b]));

        processed.docs = blocks;

        endTime = Date.now();
        processed.genTime = sprintf("%01.3f", (endTime - startTime)/1000);

        fn(processed);
    });
}

/**
 * Reads a text file and sends the buffer to the specified callback
 *
 * @method jsdog.readSourceFile
 * @param {string} filename The filename to read
 * @param {function} fn Callback to execute when done
 */
function readSourceFile(filename, fn) {
    fs.readFile(filename, function (err, data) {
        if (err) throw err;
        fn(data);
    });
}

/**
 * sprintf from the php.js project, for formatting logging output
 * @method jsdog.sprintf
 * @param {string} formatStr printf compatable format string
 * @param {mixed} vars See examples at http://phpjs.org/functions/sprintf
 * @returns {string} Result of printf operation
 */
// Dual MIT/GPL license - see PHPJS-LICENSE.txt
function sprintf() {
    // http://kevin.vanzonneveld.net
    // +   original by: Ash Searle (http://hexmen.com/blog/)
    // + namespaced by: Michael White (http://getsprink.com)
    // +    tweaked by: Jack
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Paulo Freitas
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: sprintf("%01.2f", 123.1);
    // *     returns 1: 123.10
    // *     example 2: sprintf("[%10s]", 'monkey');
    // *     returns 2: '[    monkey]'
    // *     example 3: sprintf("[%'#10s]", 'monkey');
    // *     returns 3: '[####monkey]'
    var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g;
    var a = arguments,
        i = 0,
        format = a[i++];

    // pad()
    var pad = function (str, len, chr, leftJustify) {
        if (!chr) {
            chr = ' ';
        }
        var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
        return leftJustify ? str + padding : padding + str;
    };

    // justify()
    var justify = function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
        var diff = minWidth - value.length;
        if (diff > 0) {
            if (leftJustify || !zeroPad) {
                value = pad(value, minWidth, customPadChar, leftJustify);
            } else {
                value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
            }
        }
        return value;
    };

    // formatBaseX()
    var formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
        // Note: casts negative numbers to positive ones
        var number = value >>> 0;
        prefix = prefix && number && {
            '2': '0b',
            '8': '0',
            '16': '0x'
        }[base] || '';
        value = prefix + pad(number.toString(base), precision || 0, '0', false);
        return justify(value, prefix, leftJustify, minWidth, zeroPad);
    };

    // formatString()
    var formatString = function (value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
        if (precision != null) {
            value = value.slice(0, precision);
        }
        return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
    };

    // doFormat()
    var doFormat = function (substring, valueIndex, flags, minWidth, _, precision, type) {
        var number;
        var prefix;
        var method;
        var textTransform;
        var value;

        if (substring == '%%') {
            return '%';
        }

        // parse flags
        var leftJustify = false,
            positivePrefix = '',
            zeroPad = false,
            prefixBaseX = false,
            customPadChar = ' ';
        var flagsl = flags.length;
        for (var j = 0; flags && j < flagsl; j++) {
            switch (flags.charAt(j)) {
            case ' ':
                positivePrefix = ' ';
                break;
            case '+':
                positivePrefix = '+';
                break;
            case '-':
                leftJustify = true;
                break;
            case "'":
                customPadChar = flags.charAt(j + 1);
                break;
            case '0':
                zeroPad = true;
                break;
            case '#':
                prefixBaseX = true;
                break;
            }
        }

        // parameters may be null, undefined, empty-string or real valued
        // we want to ignore null, undefined and empty-string values
        if (!minWidth) {
            minWidth = 0;
        } else if (minWidth == '*') {
            minWidth = +a[i++];
        } else if (minWidth.charAt(0) == '*') {
            minWidth = +a[minWidth.slice(1, -1)];
        } else {
            minWidth = +minWidth;
        }

        // Note: undocumented perl feature:
        if (minWidth < 0) {
            minWidth = -minWidth;
            leftJustify = true;
        }

        if (!isFinite(minWidth)) {
            throw new Error('sprintf: (minimum-)width must be finite');
        }

        if (!precision) {
            precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : undefined;
        } else if (precision == '*') {
            precision = +a[i++];
        } else if (precision.charAt(0) == '*') {
            precision = +a[precision.slice(1, -1)];
        } else {
            precision = +precision;
        }

        // grab value using valueIndex if required?
        value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

        switch (type) {
        case 's':
            return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
        case 'c':
            return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
        case 'b':
            return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
        case 'o':
            return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
        case 'x':
            return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
        case 'X':
            return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
        case 'u':
            return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
        case 'i':
        case 'd':
            number = (+value) | 0;
            prefix = number < 0 ? '-' : positivePrefix;
            value = prefix + pad(String(Math.abs(number)), precision, '0', false);
            return justify(value, prefix, leftJustify, minWidth, zeroPad);
        case 'e':
        case 'E':
        case 'f':
        case 'F':
        case 'g':
        case 'G':
            number = +value;
            prefix = number < 0 ? '-' : positivePrefix;
            method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
            textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
            value = prefix + Math.abs(number)[method](precision);
            return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
        default:
            return substring;
        }
    };

    return format.replace(regex, doFormat);
}

if(typeof(exports) !== 'undefined' && exports !== null) {
  exports.parseSourceFile = parseSourceFile;
  exports.readSourceFile = readSourceFile;
}
