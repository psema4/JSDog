# JSDog README

## Summary
Currently jsdog only supports a minimal subset of JSDoc tags, works only at a very coarse resolution, and (for now) is intended only to help provide basic in-browser class API documentation & regression testing.

Input source files are broken up and parsed in blocks, where a "block" is essentially just a multi-line javascript comment.

## Motivation

Like dox*, jsdog was meant to be a quick jsdoc replacement that doesn't require java.  Dox didn't quite fit my needs and I'd been looking for an excuse to build my first non-trivial node.js module.

In addition, jsdog includes jQuery's Qunit to provide regression testing and makes the test results available alongside generated documentation.

* https://github.com/visionmedia/dox
 
## Installation

Should be just a simple `npm install jsdog`

## Additional Required Modules

NPM should take care of getting these setup for you if you don't already have them:

* jade
* nopt

## Usage
    Usage: jsdog [options]

    Options:
      -v                               verbose logging (loglevel 2)
      --help, -h                       this screen
      --ignore, -i                     ignore extraneous newlines in comments
      --loglevel <number>              set logging level (0-3)
      --template <path>, -m <path>     path to the jade output template
      --source <path>, -s <path>       source file to document
      --tests <path>, -t <path>        qunit tests file
      --title <string>, -n <string>    documentation title

## Formatters

Each line in a javascript comment block may contain the following basic text formatters:

    Example                     Description
    --------------------------  ------------------------------------------------------------------------
    *Bold*                      enclose text in asterisks
    !Italic!                    enclose text in exclamations
    _Underline_                 enclose text in underscores
    --Smaller--                 enclose text in double-minusses
    ++Larger++                  enclose text in double-plusses
    ^Superscript^               enclose text in carets
    [red[simple colors]         enclose text in square brackets, add left hand square bracket with color
    [green|black[ dual color ]  same as above, but separate foreground and background colors with a pipe

## A Complete Example

### Source Files

#### Javascript Library (lib/foo.js)

    /** ++*[black[foo.js]*++
     *
     * This is a _dead-simple_ !example! for [black|lightgray[ jsdog ]
     *
     * @author Scott Elcomb <psema4@gmail.com> (http://www.psema4.com/)
     * @version 0.0.1
     */

    /**
     * A dummy constructor to build a brain dead object
     * @constructor
     */
    function Foo() {
    }

    /**
     * A sample method for our object
     *
     * It does nothing but return true
     *
     * @method Foo.bar
     * @param {mixed} baz A dummy param
     * @returns {boolean} Always returns true
     */
    Foo.prototype.bar = function(baz) {
        return true;
    }

#### Qunit Tests (t/foo.js)

    // Simple unit tests for jsdog example

    module("Core");
    test("truth", function() {
        ok(true, "true is ok");
        ok(! false, "false is ok");
    });

    module("Library");
    test("Foo.bar", function() {
        var foo = new Foo();
        equal(foo.bar(), true, "foo.bar() returns true");
    });

### Creating documentation and unit tests

Create documentation from 'foo.js' in the current directory, writing to stdout:

    jsdog -s lib/foo.js -n "Foo Example"

Same again, but display in lynx:

    jsdog -s lib/foo.js --title="Foo Example" | lynx -stdin

Again, this time with verbose logging to stderr & writing output to a directory that can be served by apache or another web server:

    jsdog -v --source lib/foo.js --title="Foo Example" > /var/www/docs/foo.html

NOTE: If stderr is being written to a console, verbose logging assumes it is at least 120 characters wide.

If you have written qunit tests for the source file, you can include those as well:

    jsdog --source lib/foo.js --tests t/foo.js --title="Foo Example" > doc/foo.html

### Processing multiple source files

To process all javascript files in the current folder, run jsdogs and tell it where you want the generated docs to go:

    jsdogs /var/www/docs/

If your javascript sources have qunit tests associated with them, they should be named the same as the source files, but with a 'tests-' prefix.  For example if you have source files called 'foo.js' & 'bar.js' then jsdogs will look for 'tests-foo.js' & 'tests-bar.js'

Alternatively, if you perfer to keep your test files in a t/ subdirectory then jsdogs will look to see if there is one in the current directory. If so jsdogs will check it for a file with the _same name and extension_ as the source file.


## Tag Implementation Status

    [ ] @augments - Indicate this class uses another class as its "base."
    [X] @author - Indicate the author of the code being documented.
    [ ] @argument - Deprecated synonym for @param.
    [ ] @borrows that as this - Document that class's member as if it were a member of this class.
    [ ] @class - Provide a description of the class (versus the constructor).
    [ ] @constant - Indicate that a variable's value is a constant.
    [X] @constructor - Identify a function is a constructor.
    [ ] @constructs - Identicate that a lent function will be used as a constructor.
    [ ] @default - Describe the default value of a variable.
    [~] @deprecated - Indicate use of a variable is no longer supported.  *1*
    [ ] @description - Provide a description (synonym for an untagged first-line).
    [ ] @event - Describe an event handled by a class.
    [ ] @example - Provide a small code example, illustrating usage.
    [ ] @extends - Synonym for @augments.
    [ ] @field - Indicate that the variable refers to a non-function.
    [ ] @fileOverview - Provides information about the entire file.
    [~] @function - Indicate that the variable refers to a function.  *2*
    [ ] @ignore - Indicate JsDoc Toolkit should ignore the variable.
    [ ] @inner - Indicate that the variable refers to an inner function (and so is also @private).
    [ ] @lends - Document that all an object literal's members are members of a given class.
    [ ] {@link ...} - Like @see but can be used within the text of other tags.
    [ ] @memberOf - Document that this variable refers to a member of a given class.
    [ ] @name - Force JsDoc Toolkit to ignore the surrounding code and use the given variable name instead.
    [ ] @namespace - Document an object literal is being used as a "namespace."
    [X] @param - Describe a function's parameter.
    [ ] @private - Indicate a variable is private (use the -p command line option to include these).
    [ ] @property - Document a property of a class from within the constructor's doclet.
    [ ] @public - Indicate an inner variable is public.
    [ ] @requires - Describe a required resource.
    [X] @returns - Describe the return value of a function.
    [ ] @see - Describe a related resource.
    [ ] @since - Indicate that a feature has only been available on and after a certain version number.
    [ ] @static - Indicate that accessing the variable does not require instantiation of its parent.
    [!] @this - Indicates member belongs to a specific scope.
    [ ] @throws - Describe the exception that a function might throw.
    [ ] @type - Describe the expected type of a variable's value or the value returned by a function.
    [X] @version - Indicate the release version of this code.

    Legend:  [ ] Not Implemented    [X] Implemented    [~] Partially Implemented    [!] Non-Standard

### Notes:
1. Block-specific (not variable)
2. Uses (block-level) @method instead of @function
3. Uses @this instead of @memberOf

## Credits
* Target tag list derived from the jsdoc-toolkit wiki:              http://code.google.com/p/jsdoc-toolkit/wiki/TagReference
* jQuery & Qunit for optional unit tests:                           http://docs.jquery.com/Qunit
* SyntaxHighlighter3 for, well, syntax highlighting:                http://alexgorbatchev.com/SyntaxHighlighter/
* The sprintf function from the PHP.js project is used in logging:  http://phpjs.org/
