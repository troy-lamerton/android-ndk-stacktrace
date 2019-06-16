require('dotenv').config()

const l = require('./l')
const _ = require('lodash')
const server = require('fastify')({logger: l})

const symbols = require('./symbols_cache/cache')
const ndkRunner = require('./ndk_runner')


server.post('/android/:commit', async function (req, reply) {
    const commit = _.get(req, 'params.commit')
    const arch = 'ARM64'

    if (!_.isString(req.params.commit) || _.size(commit) < 7) {
        return reply.code(400).send('Commit hash must be at least 7 characters');
    }

    if (!symbols.has(commit, arch)) {
        l.info('symbols will be downloaded')
        throw new Error('not implemented (download symbols)')
        // await symbols.downloadSymbols(commit, arch)
        
    } else {
        l.info('using symbols in cache')
    }

    const logs = req.body.toString()
    const symbolsFolder = symbols.get(commit, arch);

    const symolicatedLogs = await ndkRunner(logs, symbolsFolder, arch)

    reply.type('text/plain')
        .send(symolicatedLogs)
});

server.listen({port: process.env.PORT || 80})
