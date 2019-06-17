const request = require('superagent')
const path = require('path')
const fs = require('fs')

const l = require('./source/l')

const glob = require('glob')

l.info('~~ Demo begins ~~');
(async () => {
    const filepaths = await getFiles('_input/???????*/*.txt')
    const inputs = filepaths.map(filepath => ({filepath, commit: path.basename(path.dirname(filepath))}))

    const requests = inputs.map(({filepath, commit}) => {
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

function getFiles(pattern) {
    return new Promise((resolve, reject) => {
        glob(pattern, (err, result) => err ? reject(err) : resolve(result))
    })
}