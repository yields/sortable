
/**
 * dependencies
 */

var emitter = require('emitter')
  , classes = require('classes')
  , events = require('events');

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
  this.events.bind('mousedown');
  this.events.bind('mouseup');
  this.events.bind('dragstart');
  this.events.bind('dragover');
  this.events.bind('dragenter');
  this.events.bind('dragend');
  this.events.bind('drop');
  prop(this.els, 'draggable', true);
  this.clone = this.els[0].cloneNode(true);
  this.clone.innerHTML = '';
  classes(this.clone).add('sortable-placeholder');
  return this;
};

/**
 * unbind internal events.
 * 
 * @return {Sortable}
 */

Sortable.prototype.unbind = function(e){
  prop(this.els, 'draggable', false);
  this.events.unbind();
  return this;
};

/**
 * on-mousedown
 */

Sortable.prototype.onmousedown = function(e){
  if (this.el == e.target.parentNode) {
    this.draggable = e.target;
    this.i = indexof(this.draggable);
    this.display = window.getComputedStyle(e.target).display;
  }
};

/**
 * on-mouseup
 */

Sortable.prototype.onmouseup = function(){
  this.draggable = null;
};

/**
 * on-dragstart
 */

Sortable.prototype.ondragstart = function(e){
  if (!this.draggable) return;
  e.dataTransfer.effectAllowed = 'move';
  classes(e.target).add('dragging');
};

/**
 * on-dragover
 * on-dragenter
 */

Sortable.prototype.ondragenter = 
Sortable.prototype.ondragover = function(e){
  if (!this.draggable) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  this.draggable.style.display = 'none';
  var ci = indexof(this.clone);
  var i = indexof(e.target);
  var el = e.target;
  if (ci < i) el = el.nextSibling;
  this.el.insertBefore(this.clone, el);
};

/**
 * on-dragend
 */

Sortable.prototype.ondragend = function(e){
  if (!this.draggable) return;
  if (this.clone.parentNode) this.el.removeChild(this.clone);
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
};

/**
 * set `els` `prop` to `val`.
 * 
 * TODO: separate component
 * 
 * @param {NodeList} els
 * @param {String} prop
 * @param {Mixed} val
 */

function prop(els, prop, val){
  for (var i = 0, len = els.length; i < len; ++i) {
    els[i][prop] = val
  }
}

/**
 * get index of the given `el`.
 * 
 * @param {Element} el
 * @return {Number}
 */

function indexof(el){
  if (!el.parentNode) return -1;
  var els = el.parentNode.children;
  return [].indexOf.call(els, el);
}
