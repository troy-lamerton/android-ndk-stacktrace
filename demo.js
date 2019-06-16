const request = require('superagent')
const path = require('path')
const fs = require('fs')

const l = require('./source/l')

const glob = require('glob-fs')({ gitignore: true });

const commit = 'db2aab38'; //production on play store june 14th
// const commit = '86642d51';

l.info('~~ Demo begins ~~');
(async () => {
    
    const filepaths = await glob.readdirPromise('_input/*.txt')
    
    const requests = filepaths.map(filepath => {
        l.info(filepath)
        
        request.post(`localhost:80/android/${commit}`)
            .type('text/plain')
            .responseType('text/plain')
            .send(fs.readFileSync(filepath).toString())
            .then(res => {
                l.info(`${filepath} ---> ${res.body.toString().length} chars`)
                const outputPath = path.join('_output', `[symbolicated] ${path.basename(filepath)}`)
                fs.writeFileSync(outputPath, res.body.toString())
            })
    })

    await Promise.all(requests)
})();
