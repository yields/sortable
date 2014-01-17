# sortable

  UI Sortable component, see the [demo](http://yields.github.io/sortable/index.html).

## Installation

    $ component install yields/sortable

## API

#### events

  - `update`(e), emitted when sort changes happen.
  - `start`(e), emitted when the drag starts.
  - `drop`(e), emitted when drop happens.

#### Sortable(el)

Initialize Sortable with `el`.

#### .ignore(selector)

Ignore items matching the given `selector`.

#### .handle(selector)

Set the handle to `selector`.

#### .bind()

Bind internal events.

#### .unbind()

Unbind internal events.

#### .connect(sortable)

Connect with `Sortable` instance, the method returns the given `Sortable`.

```js
one = new Sortable(query('.one'));
two = new Sortable(query('.two'));

// one <> two
one
.connect(two)
.connect(one);

// one > two
one.connect(two);

```

## License

  MIT
