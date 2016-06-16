# html-injector

## Usage 

#### command-line
```
$ html-injector target key globs...
```

#### node.js
```
var injector = require('html-injector);

injector(target, key, globs, options);
```




## Parameters

#### target

HTML file into which stuff gets injected.

In the target, use special start and end injection tags to mark content to be replaced by injection.

```
<!--inject:js-->
<script src="{path}">{content}</script>
<!--endinject-->
```

Content between the `inject` and `endinject` comment nodes will repeat once per glob-matching file.

`{path}` will be replaced by each matching file's path.

`{content}` will be replaced by each matching file's content.

#### key

String which differentiates pairs of injection tags.

The key is specified in the `inject` tag after a colon. In the example above, the key is `js`.

#### globs

One or more [node-glob](https://github.com/isaacs/node-glob) patterns. Files matching the globs will get their paths or content injected into target.

#### options (for node.js usage)

| Option       | Type     | Description |
|--------------|----------|-------------|
| `outfile`    | `string` | Output file to which injected content is written |
| `transforms` | `{[name: string]: (pathOrContent: string) => string}` | JavaScript object which defines transform functions |

For command-line usage, specify output file with a redirect, and specify transforms in a special file called hi.js at the root of the project (see examples).




## Transforms

Transforms can alter file path and file content before they get injected.

A transform is a JavaScript function that receives a string as input and returns a transformed string as output.

Consider `path` and `content` built-in transforms.

#### path

Function that returns the path of the matching file, regardless of input.

#### content

Function that returns the content of the matching file, regardless of input.

#### Custom transforms 

More transforms can be defined in a special hi.js file at the root of the project. Once defined, transforms can be used between injection tags in the target. Transforms are applied in the order used. See 'Example with transforms' for details.




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

or redirect to index.html
```
$ html-injector app.html tpl templates/*.html > index.html
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

or redirect to index.html
```
$ html-injector app.html tpl templates/*.html > index.html
```
