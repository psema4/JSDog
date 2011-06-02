/** ++*[black[helloworld.js]*++
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
function HelloWorld() {
}

/**
 * A sample method for our object
 *
 * It does nothing but return true
 *
 * @method HelloWorld.bar
 * @param {mixed} baz A dummy param
 * @returns {boolean} Always returns true
 */
HelloWorld.prototype.bar = function(baz) {
    return true;
}

