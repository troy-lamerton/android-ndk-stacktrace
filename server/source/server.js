require('dotenv').config()

const sh = require('shelljs')

const l = require('./l')
const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const server = require('fastify')({logger: l})
const staticPlugin = require('fastify-static');

const symbols = require('./symbols_cache/cache')
const ndkRunner = require('./ndk_runner')

const hasNdk = fs.existsSync(process.env.ANDROID_NDK_HOME)
if (!hasNdk) {
    l.error(`Please set ANDROID_NDK_HOME in ${path.join(__dirname, '.env')}.\nYou don't have anything at ${ANDROID_NDK_HOME}.`)
    setTimeout(() => {
        process.exit(1)
    }, 5000);
}

(function() {
    
server.register(staticPlugin, {
    root: path.join(__dirname, 'public')
})

server.post('/android/:commit', async function (req, reply) {
    const commit = _.get(req, 'params.commit')
    const symbols = _.get(req, 'query.symbols')
    const arch = 'ARM64'

    if (!_.isString(commit) || _.size(commit) < 8) {
        return reply.code(400).send('Commit hash must be 8 characters');
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
sh.exec(`start "" "http://localhost:${port}"`, {windowsHide: false, async: false, silent: true})
server.listen({port})

})();
