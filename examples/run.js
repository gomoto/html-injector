var fs = require('fs');
var htmlInjector = require('html-injector');

fs.createReadStream('app.html')

.pipe(htmlInjector('vendor', {
  angular: 'node_modules/angular/angular.js',
  pouchdb: 'https://cdnjs.cloudflare.com/ajax/libs/pouchdb/5.4.1/pouchdb.js',
}))

.pipe(htmlInjector('templates', {
  abbreviateTemplates: function(original) {
    return original.replace('templates', 'tpls');
  },
  capitalizeDiv: function(original) {
    return original.replace(new RegExp('div', 'g'), 'DIV');
  }
}, [
  'templates/*.html'
]))

.pipe(fs.createWriteStream('index.html'))

.on('finish', function() {
  console.log('Finished injecting HTML');
});
