const sh = require('shelljs');
const path = require('path');

const source = path.join(__dirname, '..', 'server')
const context = path.join(__dirname, 'context')

sh.cp(source, context);

sh.exec(`docker build -t symbolizer-android:latest ./context`)