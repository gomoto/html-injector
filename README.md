# html-injector

## Usage

### command-line
```
$ html-injector infile tag globs... > outfile
```

### node.js
```
var inject = require('html-injector);

inject(infile)
.replace(tag, transforms [, globs])
.write([outfile]);
```





### inject(infile)

Opens a file for injection.

Returns an Injectable instance.

#### infile

`string`

Name of the HTML file into which stuff will be injected.





## Injectable





### Injectable.replace(tag, transforms [, globs])

Replace the content between each pair of the specified tag.

This can be called multiple times before calling write().

#### tag

`string`

#### transforms

`{[token: string]: string | Function}`

A transform is a function that receives a string as input and returns a transformed string as output.

Bracket content is initially an empty string. Transforms transform bracket content.

As a shorthand, a transform that simply returns a string may be specified as a string.

Transforms are called in the order they appear between brackets.

For example, the following bracket will be replaced by the file path which gets passed to firstTransform then secondTransform.

`{path firstTransform secondTransform}`

That is, secondTransform(firstTransform(path)).

Transforms can alternatively be specified in a special file called hi.js at the root of the project (see examples).
Transforms passed directly to replace() take precedence.

#### globs

`string[]`

One or more [node-glob](https://github.com/isaacs/node-glob) patterns.

If this is specified, content between each pair of tags will be repeated once per matching file.
Two special transforms become available:

$path returns file path
$content returns file content





### .write([outfile], [callback])

Write content to disk.

After this, replace() can still be called.

#### outfile (optional)

`string`

File to which injected content gets written.

If outfile is not specified, content gets written to stdout.

If only one parameter is passed to write(), it must be outfile. Callback cannot be the only parameter passed to write().

#### callback (optional)

`() => void`

Function which gets called after outfile has been written to disk.

outfile must be specified in order to use callback.





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

Prints to stdout
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
