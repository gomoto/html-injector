# html-injector



## Usage

### node.js
```
var htmlInjector = require('html-injector);

fs.createReadStream(infile)
.pipe(htmlInjector({
  tag: { globs, cwd, transforms }
})
.pipe(fs.createWriteStream(outfile));
```

### command-line
```
$ html-injector infile tag [globs...] > outfile
```

### node.js (multiple injection)
```
var htmlInjector = require('html-injector);

fs.createReadStream(infile)
.pipe(htmlInjector({
  tag1: { globs, cwd, transforms },
  tag2: { globs, cwd, transforms }
})
.pipe(fs.createWriteStream(outfile));
```

### command-line (multiple injection)
```
$ html-injector infile tag1 [globs...] | html-injector tag2 [globs...] > outfile
```



## HTMLInjector(configuration)

Returns a through stream in which content has been transformed.

All transformations happen between injection tags:

```
<!--tag-->
<script type="text/ng-template" id="{$path}">
  {$content}
</script>
<!--tag-->
```

### configuration

Configures how to transform content between each tag pair.

```
{
  [tag]: {
    globs,
    cwd,
    transforms
  }
}
```

#### globs

`string[]`

One or more [node-glob](https://github.com/isaacs/node-glob) patterns.

If this is specified, content between each pair of tags will be repeated once per matching file.

Two special transforms become available:

$path returns file path

$content returns file content

#### cwd (optional)

`string`

Default: process.cwd()

Current working directory for globs. Injected file paths will be relative to this directory.

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



## Example 1
Run `npm run cli-example`.
You should see the expected output below printed to stdout.

## Example 2
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
