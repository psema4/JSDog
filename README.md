# JSDog README

## Summary
JSDog supports a minimal subset of JSDoc tags, works only at a very coarse resolution and (for now) intended to help provide basic in-browser class API documentation & regression testing.

Input source files are broken up and parsed in blocks, where a "block" is essentially just a multi-line javascript comment. Inline comments for property tagging is also supported.

## Motivation

Like dox*, jsdog was meant to be a quick jsdoc replacement that doesn't require java.

JSDog includes jQuery's Qunit to provide regression testing and makes test results available alongside the generated documentation.

* https://github.com/visionmedia/dox

#### See also

doc.md - a jsdoc to markdown converter

https://github.com/Pita/doc.md

## Installation

`npm install -g jsdog`

## Required Modules

NPM should take care of getting these setup for you if you don't already have them:

* jade
* nopt (should come with npm)

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

## Examples

- The current JSDog documentation at http://psema4.github.com/JSDog/
- There is a Hello World project in the examples folder which should help get you started

## Multiple Files

To process all javascript files in the current folder, run jsdogs and tell it where you want the generated docs to go:

    jsdogs /var/www/docs/

Qunit test files should have the same filename as the associated source file but in a t/ folder, or in the current folder with the filename prefixed by 'tests-'

    eg. foo.js will check for tests-foo.js and ./t/foo.js

## Tag Implementation Status

### Supported

#### Meta
- @author
- @version

#### Code
- @constructor
- @deprecated
- @event
- @function
- @name
- @param
- @private
- @property
- @protected
- @public
- @returns
- @this
- @throws

## Credits
* Intended tag support derived from the jsdoc-toolkit wiki:         http://code.google.com/p/jsdoc-toolkit/wiki/TagReference
* jQuery & Qunit for optional unit tests:                           http://docs.jquery.com/Qunit
* SyntaxHighlighter3 for, well, syntax highlighting:                http://alexgorbatchev.com/SyntaxHighlighter/
* The sprintf function from the PHP.js project is used in logging:  http://phpjs.org/
