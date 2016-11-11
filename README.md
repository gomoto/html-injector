# html-injector

## Usage

### command-line
```
$ html-injector infile tag globs...
```

```
$ html-injector infile tag globs... > outfile
```

### node.js
```
var inject = require('html-injector);

inject(infile)
.replace(tag, globs [, options])
.write([outfile]);

inject(infile)
.replace(tag, globs [, options])
.write([outfile])
.replace(tag, globs [, options])
.replaceValues(tag, values [, options])
.write([outfile]);
```




## Methods

### inject(infile)

Open a file for injection.

Returns an object with three methods: `replace`, `replaceValues`, `write`.

#### infile

`string`

Name of the HTML file into which stuff gets injected.

Inside infile, specify pairs of injection tags to mark content to be replaced.

```
<!--js-->
<script src="{path}">{content}</script>
<!--js-->
```




### .replace(tag, globs [, options])

For each glob-matching file, output an injected version of all the content between the specified injection tag.

Returns an object with three methods: `replace`, `replaceValues`, `write`.

#### tag

`string`

#### globs

`string[]`

One or more [node-glob](https://github.com/isaacs/node-glob) patterns. Files matching the globs will get their paths or content injected into infile.

#### options (optional)

| Option       | Type     | Description |
|--------------|----------|-------------|
| `transforms` | `{[name: string]: (pathOrContent: string) => string}` | JavaScript object which defines transform functions |

Options can alternatively be specified in a special file called hi.js at the root of the project (see examples).




### .replaceValues(tag, values [, options])

Inject values into the content between the injection tags.

With replace(), a file must exist even for its path to get injected (it must match the globs). But sometimes you already know the path and do not need to wait for the file to be generated. replaceValues() injects content based on a map of values.

Returns an object with three methods: `replace`, `replaceValues`, `write`.

#### tag

`string`

Same as in replace().

#### values

`{[value: string]: string}`

A map of values to inject. See replaceValues() example.

#### options (optional)

Same as in replace().




### .write([outfile], [callback])

Write content to disk.

Returns an object with three methods: `replace`, `replaceValues`, `write`.

#### outfile (optional)

`string`

File to which injected content gets written.

If outfile is not specified, content gets written to stdout.

If only one parameter is passed to write(), it must be outfile. Callback cannot be the only parameter passed to write().

#### callback (optional)

`() => void`

Function which gets called after outfile has been written to disk.

outfile must be specified in order to use callback.




## Transforms

Transforms can alter content before it gets injected.

A transform is a JavaScript function that receives a string as input and returns a transformed string as output.

Consider `path` and `content` built-in transforms.

`{path}` will be replaced by file path.

`{content}` will be replaced by file content.

#### Custom transforms

More transforms can be defined in the options object or in a special hi.js file at the root of the project. Once defined, transforms can be used between single brackets between injection tags in the infile. Transforms get applied in the order they appear between brackets. See 'Example with transforms' for details.

`{path firstTransform secondTransform}` will be replaced by file path after being passed to firstTransform then secondTransform.




## Example

Project structure
```
project
│   app.html
│
└───templates
    │   div.html
    │   span.html
```

app.html
```
<body>
  <!--tpl-->
  <script type="text/ng-template" id="{path}">
    {content}
  </script>
  <!--tpl-->
</body>
```

div.html
```
<div></div>
```

span.html
```
<span></span>
```

Print to stdout
```
$ html-injector app.html tpl templates/*.html
<body>
  <script type="text/ng-template" id="templates/div.html">
    <div></div>
  </script>
  <script type="text/ng-template" id="templates/span.html">
    <span></span>
  </script>
</body>
```

Write to index.html
```
$ html-injector app.html tpl templates/*.html > index.html
```

Write to index.html (node.js)
```
var inject = require('html-injector');
inject('app.html')
.replace('tpl', 'templates/*.html')
.write('index.html');
```




## Example with transforms

Project structure
```
project
│   app.html
│   hi.js
│
└───templates
    │   div.html
    │   span.html
```

hi.js (define transforms here)
```
module.exports = {
  transforms: {
    abbreviateTemplates: function(original) {
      return original.replace('templates', 'tpls');
    },
    capitalizeDiv: function(original) {
      return original.replace(new RegExp('div', 'g'), 'DIV');
    }
  }
}
```

app.html (use transforms here)
```
<body>
  <!--tpl-->
  <script type="text/ng-template" id="{path abbreviateTemplates capitalizeDiv}">
    {content capitalizeDiv}
  </script>
  <!--tpl-->
</body>
```

div.html
```
<div></div>
```

span.html
```
<span></span>
```

Print to stdout
```
$ html-injector app.html tpl templates/*.html
<body>
  <script type="text/ng-template" id="tpls/DIV.html">
    <DIV></DIV>
  </script>
  <script type="text/ng-template" id="tpls/span.html">
    <span></span>
  </script>
</body>
```

Write to index.html
```
$ html-injector app.html tpl templates/*.html > index.html
```

Write to index.html (node.js)
```
var inject = require('html-injector');

var options = {
  transforms: {
    abbreviateTemplates: function(original) {
      return original.replace('templates', 'tpls');
    },
    capitalizeDiv: function(original) {
      return original.replace(new RegExp('div', 'g'), 'DIV');
    }
  }
};

inject('app.html')
.replace('tpl', 'templates/*.html', options)
.write('index.html');
```




## Example with replaceValues

Project structure
```
project
│   app.html
```

app.html
```
<body>
  <!--js-->
  <script src="{angular}"></script>
  <script src="{pouchdb}"></script>
  <!--js-->
</body>
```

Replace values and write to index.html (node.js)
```
var inject = require('html-injector');
inject('app.html')
.replaceValues('js', {
  angular: 'node_modules/angular/angular.js',
  pouchdb: 'https://cdnjs.cloudflare.com/ajax/libs/pouchdb/5.4.1/pouchdb.js'
})
.write('index.html');
```

index.html
```
<body>
  <script src="node_modules/angular/angular.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pouchdb/5.4.1/pouchdb.js"></script>
</body>
```
