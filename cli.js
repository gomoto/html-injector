#!/usr/bin/env node

/**
 *  html-injector CLI
 *
 *  The MIT License (MIT)
 *
 *  Copyright (c) 2016 Ryan Gomoto
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of
 *  this software and associated documentation files (the "Software"), to deal in
 *  the Software without restriction, including without limitation the rights to
 *  use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 *  the Software, and to permit persons to whom the Software is furnished to do so,
 *  subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 *  FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 *  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 *  IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 *  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

var fs = require('fs');
var package = require('./package.json');
var htmlInjector = require('./' + package.main);
var program = require('commander');
var UsageError = require('./src/UsageError');

program._name = package.name;

program
.usage('[options] input tag [glob...]')
.description(package.description)
.version(package.version)
.parse(process.argv);

var stream, tag, globs;
if (process.stdin.isTTY) {
  // create file stream from cli argument
  stream = fs.createReadStream(program.args[0]);
  tag = program.args[1];
  globs = program.args.slice(2);
} else {
  // receiving file stream from stdin
  stream = process.stdin;
  tag = program.args[0];
  globs = program.args.slice(1);
}

try {
  stream
  .pipe(htmlInjector({
    [tag]: { globs }
  }))
  .pipe(process.stdout);
}
catch (e) {
  if (e instanceof UsageError) {
    console.log(program.usage());
    console.log(e.message);
  }
  else {
    console.error('Injector error!', e);
  }
  process.exit(1);
}
