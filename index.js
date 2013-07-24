
/**
 * dependencies
 */

var matches = require('matches-selector')
  , emitter = require('emitter')
  , classes = require('classes')
  , events = require('events')
  , indexof = require('indexof')
  , prop = require('prop');

/**
 * export `Sortable`
 */

module.exports = Sortable;

/**
 * Initialize `Sortable` with `el`.
 *
 * @param {Element} el
 */

function Sortable(el){
  if (!(this instanceof Sortable)) return new Sortable(el);
  if (!el) throw new TypeError('sortable(): expects an element');
  this.events = events(el, this);
  this.els = el.children;
  this.el = el;
}

/**
 * Mixins.
 */

emitter(Sortable.prototype);

/**
 * Ignore items that don't match `selector`.
 *
 * @param {String} selector
 * @return {Sortable}
 * @api public
 */

Sortable.prototype.ignore = function(selector){
  this.ignored = selector;
  return this;
};

/**
 * Set handle to `selector`.
 *
 * @param {String} selector
 * @return {Sortable}
 * @api public
 */

Sortable.prototype.handle = function(selector){
  this._handle = selector;
  return this;
};

/**
 * Bind internal events.
 *
 * @return {Sortable}
 * @api public
 */

Sortable.prototype.bind = function(e){
  this.events.bind('mousedown');
  this.events.bind('dragstart');
  this.events.bind('dragover');
  this.events.bind('dragenter');
  this.events.bind('dragend');
  this.events.bind('drop');
  prop.set(this.els, 'draggable', true);
  this.clone = this.els[0].cloneNode(false);
  classes(this.clone).add('sortable-placeholder');
  return this;
};

/**
 * Unbind internal events.
 *
 * @return {Sortable}
 * @api public
 */

Sortable.prototype.unbind = function(e){
  prop.set(this.els, 'draggable', false);
  this.events.unbind();
  return this;
};

/**
 * Connect the given `sortable`.
 *
 * once connected you can drag elements from
 * the given sortable to this sortable.
 *
 * Example:
 *
 *      one <> two
 *
 *      one
 *      .connect(two)
 *      .connect(one);
 *
 *      two > one
 *
 *      one
 *      .connect(two)
 *
 *      one > two > three
 *
 *      three
 *      .connect(two)
 *      .connect(one);
 *
 * @param {Sortable} sortable
 * @return {Sortable} the given sortable.
 * @api public
 */

Sortable.prototype.connect = function(sortable){
  var self = this;
  this.on('drop', this.reset.bind(sortable));
  return sortable.on('start', function(){
    self.draggable = sortable.draggable;
    self.clone = sortable.clone;
    self.display = sortable.display;
    self.i = sortable.i;
  });
};

/**
 * on-dragstart
 *
 * @param {Event} e
 * @api private
 */

Sortable.prototype.ondragstart = function(e){
  if (this.ignored && matches(e.target, this.ignored)) return e.preventDefault();
  if (this._handle && !this.match) return e.preventDefault();
  this.draggable = e.target;
  this.display = window.getComputedStyle(e.target).display;
  this.i = indexof(e.target);
  e.dataTransfer.setData('text', ' ');
  e.dataTransfer.effectAllowed = 'move';
  classes(e.target).add('dragging');
  this.emit('start', e);
};

/**
 * on-dragover
 * on-dragenter
 *
 * @param {Event} e
 * @api private
 */

Sortable.prototype.ondragenter =
Sortable.prototype.ondragover = function(e){
  var el = e.target
    , next = el
    , ci
    , i;

  if (!this.draggable || el == this.el) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  this.draggable.style.display = 'none';

  // parent
  while (el.parentElement != this.el) el = el.parentElement;
  ci = indexof(this.clone);
  i = indexof(el);
  if (ci < i) next = el.nextElementSibling;
  if (this.ignored && matches(el, this.ignored)) return;
  this.el.insertBefore(this.clone, next);
};

/**
 * on-mousedown.
 *
 * @param {Event} e
 * @api private
 */

Sortable.prototype.onmousedown = function(e){
  if (!this._handle) return;
  this.match = matches(e.target, this._handle);
};

/**
 * on-dragend
 *
 * @param {Event} e
 * @api private
 */

Sortable.prototype.ondragend = function(e){
  if (!this.draggable) return;
  if (this.clone) remove(this.clone);
  this.draggable.style.display = this.display;
  classes(this.draggable).remove('dragging');
  if (this.i == indexof(this.draggable)) return;
  this.emit('update');
};

/**
 * on-drop
 *
 * @param {Event} e
 * @api private
 */

Sortable.prototype.ondrop = function(e){
  e.stopPropagation();
  this.el.insertBefore(this.draggable, this.clone);
  this.ondragend(e);
  this.emit('drop', e);
  this.reset();
};

/**
 * Reset sortable.
 *
 * @api private
 * @return {Sortable}
 * @api private
 */

Sortable.prototype.reset = function(){
  this.draggable = null;
  this.display = null;
  this.i = null;
};

/**
 * Remove the given `el`.
 *
 * @param {Element} el
 * @return {Element}
 * @api private
 */

function remove(el){
  if (!el.parentNode) return;
  el.parentNode.removeChild(el);
}
