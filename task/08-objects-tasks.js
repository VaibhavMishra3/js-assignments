"use strict";

/**************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 **************************************************************************************************/

/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    var r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
}

Rectangle.prototype.getArea = function () {
  return this.width * this.height;
};

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    var r = fromJSON(Rectangle.prototype, '{"width":10, "height":20}');
 *
 */
function fromJSON(proto, json) {
  const obj = Object.create(proto);
  Object.assign(obj, JSON.parse(json));
  return obj;
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy and implement the functionality
 * to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple, clear and readable as possible.
 *
 * @example
 *
 *  var builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()  => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()  => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()        =>    'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class Selector {
  constructor() {
    this.specificity = 0; // Track selector specificity
    this.parts = []; // Array to store selector parts
    this.seen = new Set();
  }

  _checkDuplicate(value) {
    if (this.seen.has(value)) {
      throw new Error(
        "Element, id and pseudo-element should not occur more than one time inside the selector"
      );
    }
    this.seen.add(value);
  }

  element(value) {
    this._checkDuplicate("element");
    this.parts.push(`${value}`);
    this.specificity += 1;
    return this;
  }
  id(value) {
    this._checkDuplicate("id");
    this.parts.push(`#${value}`);
    this.specificity += 100; // ID selector has high specificity
    return this;
  }

  class(value) {
    this._checkDuplicate("class");
    this.parts.push(`.${value}`);
    this.specificity += 10; // Class selector has medium specificity
    return this;
  }

  attr(value) {
    this._checkDuplicate("attr");
    const attr = `[${value}]`;
    this.parts.push(attr);
    this.specificity += 1; // Attribute selector has low specificity
    return this;
  }

  pseudoClass(value) {
    this._checkDuplicate("pseudoClass");
    this.parts.push(`:${value}`);
    this.specificity += 1; // Pseudo-class selector has low specificity
    return this;
  }

  pseudoElement(value) {
    this._checkDuplicate("psuedoElement");
    this.parts.push(`::${value}`);
    this.specificity += 0; // Pseudo-element selector has no specificity
    return this;
  }

  stringify() {
    return this.parts.join("");
  }
}

const cssSelectorBuilder = {
  element: function (value) {
    return new Selector().element(value);
  },

  id: function (value) {
    return new Selector().element("").id(value);
  },

  class: function (value) {
    return new Selector().element("").class(value);
  },

  attr: function (value) {
    return new Selector().element("").attr(value);
  },

  pseudoClass: function (value) {
    return new Selector().element("").pseudoClass(value);
  },

  pseudoElement: function (value) {
    return new Selector().element("").pseudoElement(value);
  },

  combine: (selector1, combinator, selector2) => {
    const newSelector = new Selector(selector1.element);
    newSelector.parts.push(...selector1.parts);
    newSelector.parts.push(" ");
    newSelector.parts.push(combinator);
    newSelector.parts.push(" ");
    newSelector.parts.push(...selector2.parts);
    newSelector.specificity = Math.max(
      selector1.specificity,
      selector2.specificity
    );
    return newSelector;
  },
};

module.exports = {
  Rectangle: Rectangle,
  getJSON: getJSON,
  fromJSON: fromJSON,
  cssSelectorBuilder: cssSelectorBuilder,
};
