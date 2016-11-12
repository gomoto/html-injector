var inject = require('html-injector');
inject('app.html')
.replace('vendor', {
  angular: 'node_modules/angular/angular.js',
  pouchdb: 'https://cdnjs.cloudflare.com/ajax/libs/pouchdb/5.4.1/pouchdb.js',
})
.replace('templates', {
  abbreviateTemplates: function(original) {
    return original.replace('templates', 'tpls');
  },
  capitalizeDiv: function(original) {
    return original.replace(new RegExp('div', 'g'), 'DIV');
  }
}, [
  'templates/*.html'
])
.write('index.html');
