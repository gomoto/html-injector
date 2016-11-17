var fs = require('fs');
var htmlInjector = require('html-injector');

console.time('time');

fs.createReadStream('app.html')

.pipe(htmlInjector({

  vendor: {
    transforms: {
      angular: 'node_modules/angular/angular.js',
      pouchdb: 'https://cdnjs.cloudflare.com/ajax/libs/pouchdb/5.4.1/pouchdb.js'
    }
  },

  templates: {
    globs: [
      'templates/*.html'
    ],
    transforms: {
      abbreviateTemplates: function(original) {
        return original.replace('templates', 'tpls');
      },
      capitalizeDiv: function(original) {
        return original.replace(new RegExp('div', 'g'), 'DIV');
      }
    }
  }

}))

.pipe(fs.createWriteStream('index.html'))

.on('finish', function() {
  console.log('Finished injecting HTML');
  console.timeEnd('time');
});
