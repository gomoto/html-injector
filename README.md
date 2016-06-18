# html-injector

## Usage

#### command-line
```
$ html-injector infile key globs...
```

```
$ html-injector infile key globs... > outfile
```

#### node.js
```
var inject = require('html-injector);

inject(infile)
.replace(key, globs... [, options])
.write([outfile]);
```

```
inject(infile)
.replace(key1, globs1... [, options1])
.replace(key2, globs2... [, options2])
.write([outfile1])
.replace(key3, globs3... [, options3])
.write([outfile2])
.write([outfile3]);
```




## Parameters

#### infile

`string`

HTML file into which stuff gets injected.

Use special start and end injection tags in the infile to mark content to be replaced by injection.

```
<!--inject:js-->
<script src="{path}">{content}</script>
<!--endinject-->
```

Content between the `inject` and `endinject` comment nodes will repeat once per glob-matching file.

`{path}` will be replaced by each matching file's path.

`{content}` will be replaced by each matching file's content.

#### key

`string`

String which differentiates pairs of injection tags.

The key is specified in the `inject` tag after a colon. In the example above, the key is `js`.

#### globs...

`string...`

One or more [node-glob](https://github.com/isaacs/node-glob) patterns. Files matching the globs will get their paths or content injected into infile.

#### options

| Option       | Type     | Description |
|--------------|----------|-------------|
| `transforms` | `{[name: string]: (pathOrContent: string) => string}` | JavaScript object which defines transform functions |

Options can alternatively be specified in a special file called hi.js at the root of the project (see examples).

#### outfile (optional)

`string`

File to which injected content gets written.

If outfile is not specified, content gets written to stdout.

If only one parameter is passed to write(), it must be outfile. Callback cannot be the only parameter passed to write().

#### callback (optional)

`() => void`

Function which is called after outfile has been written to disk.

outfile must be specified in order to use callback.




## Transforms

Transforms can alter file path and file content before they get injected.

A transform is a JavaScript function that receives a string as input and returns a transformed string as output.

Consider `path` and `content` built-in transforms.

#### path

Function that returns the path of the matching file, regardless of input.

#### content

Function that returns the content of the matching file, regardless of input.

#### Custom transforms

More transforms can be defined in the options object or in a special hi.js file at the root of the project. Once defined, transforms can be used between single brackets between injection tags in the infile. Transforms get applied in the order they appear between brackets. See 'Example with transforms' for details.




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
  <!--inject:tpl-->
  <script type="text/ng-template" id="{path}">
    {content}
  </script>
  <!--endinject-->
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

Command-line: print to stdout
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
inject('app.html').replace('tpl', 'templates/*.html').write('index.html');
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
  <!--inject:tpl-->
  <script type="text/ng-template" id="{path abbreviateTemplates capitalizeDiv}">
    {content capitalizeDiv}
  </script>
  <!--endinject-->
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
