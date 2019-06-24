const static = require('../dist/node-static');
const path = require('path')
//
// Create a node-static server to serve the current directory
//
let file = new static.Server('.', {
    cache: 7200, headers: { 'X-Hello': 'World!' },
    externalPaths: ['../node_modules'],
    virtualPaths: {
        'node_modules': path.join(__dirname, '../node_modules')
    }
});
let port = 8185
require('http').createServer(function (request, response) {
    file.serve(request, response, function (err, res) {
        if (err) { // An error as occured
            console.error("> Error serving " + request.url + " - " + err.message);
            response.writeHead(err.status, err.headers);
            response.end();
        } else { // The file was served successfully
            console.log("> " + request.url + " - " + res.message);
        }
    });
}).listen(8185);

// file.resolve = function (pathname) {
//     return path.resolve(path.join(this.root, pathname));
// }

console.log(`> node-static is listening on http://127.0.0.1:${port}`);
