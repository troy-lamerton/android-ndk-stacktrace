require('dotenv').config()

const l = require('./l')
const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const server = require('fastify')({logger: l})
const staticPlugin = require('fastify-static');

const symbols = require('./symbols_cache/cache')
const ndkRunner = require('./ndk_runner')

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
    
    if (!_.isString(symbols) || !_.endsWith(symbols, 'libil2cpp.sym')) {
        return reply.code(400).send('Bad path to symbols file');
    }
    if (!fs.existsSync(symbols)) {
        return reply.code(400).send('Symbols file does not exist at: ' + symbols);
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
    const symbolsFolder = path.dirname(symbols);

    const symolicatedLogs = await ndkRunner(logs, symbolsFolder, arch)

    reply.type('text/plain')
        .send(symolicatedLogs)
});

server.listen({port: process.env.PORT || 80})
