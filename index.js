
/**
 * dependencies
 */

var emitter = require('emitter')
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
 * mixins.
 */

emitter(Sortable.prototype);

/**
 * bind internal events.
 *
 * @return {Sortable}
 */

Sortable.prototype.bind = function(e){
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
 * unbind internal events.
 *
 * @return {Sortable}
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
 */

Sortable.prototype.ondragstart = function(e){
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
 */

Sortable.prototype.ondragenter =
Sortable.prototype.ondragover = function(e){
  e.preventDefault();
  if (!this.draggable) return;
  if (e.target == this.el) return;
  e.dataTransfer.dropEffect = 'move';
  this.draggable.style.display = 'none';
  var el = e.target;
  while (el.parentElement != this.el) el = el.parentElement;
  var ci = indexof(this.clone);
  var i = indexof(el);
  if (ci < i) el = el.nextSibling;
  this.el.insertBefore(this.clone, el);
};

/**
 * on-dragend
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
 */

Sortable.prototype.ondrop = function(e){
  e.stopPropagation();
  this.el.insertBefore(this.draggable, this.clone);
  this.ondragend(e);
  this.emit('drop');
  this.reset();
};

/**
 * Reset sortable.
 *
 * @api private
 * @return {Sortable}
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
 */

function remove(el){
  if (!el.parentNode) return;
  el.parentNode.removeChild(el);
}
