# html-injector

## Usage

### command-line
```
$ html-injector infile tag globs... > outfile
```

### node.js
```
var htmlInjector = require('html-injector);

fs.createReadStream(infile)
.pipe(htmlInjector(tag, transforms [, globs]))
.pipe(fs.createWriteStream(outfile));
```





### HTMLInjector(tag, transforms [, globs])

A function that returns a through stream in which content has been transformed
between each pair of the specified tag.

#### tag

`string`

#### transforms

`{[token: string]: string | Function}`

A transform is a function that receives a string as input and returns a transformed string as output.

Bracket content is initially an empty string. Transforms transform bracket content.

As a shorthand, a transform that simply returns a string may be specified as a string.

Transforms are called in the order they appear between brackets.

For example, the following bracket will be replaced by the file path which gets passed to firstTransform then secondTransform.

`{$path firstTransform secondTransform}`

That is, secondTransform(firstTransform($path)).

Transforms can alternatively be specified in a special file called hi.js at the root of the project (see examples).
Transforms passed directly to replace() take precedence.

#### globs

`string[]`

One or more [node-glob](https://github.com/isaacs/node-glob) patterns.

If this is specified, content between each pair of tags will be repeated once per matching file.
Two special transforms become available:

$path returns file path
$content returns file content





## Examples

Before running any example, go to examples directory and run `npm i`.

### 1
Run `npm run cli-example`.
You should see the expected output below printed to stdout.

### 2
Run `npm run node-example`.
You should get a generated index.html file containing the expected output below.

### Expected output
```
<head>
  <script src="node_modules/angular/angular.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pouchdb/5.4.1/pouchdb.js"></script>
</head>
<body>
  <script type="text/ng-template" id="tpls/DIV.html">
    <DIV></DIV>
  </script>
  <script type="text/ng-template" id="tpls/span.html">
    <span></span>
  </script>
</body>
```
