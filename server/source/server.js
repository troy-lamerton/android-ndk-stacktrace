require('dotenv').config()
const path = require('path')
const _ = require('lodash')
const fs = require('fs')
const staticPlugin = require('fastify-static');
const sh = require('shelljs')

const l = require('./l');
const server = require('fastify')({logger: l});

const symbols = require('./symbols_cache/cache');
const ndkRunner = require('./ndk_runner2');

(function() {
    
server.register(staticPlugin, {
    root: path.join(__dirname, 'public')
})

const supportedArchs = [
    'arm64-v8a'
]

const shaRegex = /[a-f0-9]{8,64}/i

server.post('/android/:commit', async function (req, reply) {
    const commit = _.get(req, 'params.commit')
    const symbols = _.get(req, 'query.symbols')
    const arch = 'arm64-v8a'

    if (!supportedArchs.includes(arch)) {
        return reply.code(400).send('unsupported architecture ' + arch);
    }

    if (!_.isString(commit) || _.size(commit) < 8 || !shaRegex.test(commit)) {
        return reply.code(400).send('Commit hash must be 8+ [a-f0-9] characters');
    }
    const symbolsFile = path.join(symbols, 'libil2cpp.sym');
    if (!fs.existsSync(symbolsFile)) {
        return reply.code(400).send('Symbols file does not exist at: ' + symbolsFile);
    }

    // if (!symbols.has(commit, arch)) {
    //     l.info('symbols will be downloaded')
    //     throw new Error('not implemented (download symbols)')
    //     // await symbols.downloadSymbols(commit, arch)
        
    // } else {
    //     l.info('using symbols in cache')
    // }

    const logs = req.body.toString()
    // const symbolsFolder = symbols.get(commit, arch);
    const symbolsFolder = symbols;

    const symolicatedLogs = await ndkRunner(logs, symbolsFolder, arch)

    reply.type('text/plain')
        .send(symolicatedLogs)
});

const port = process.env.PORT || 80
if (process.argv[2] !== 'development') {
    sh.exec(`start "" "http://localhost:${port}"`, {windowsHide: false, async: false, silent: true})
}
server.listen({port})

})();
