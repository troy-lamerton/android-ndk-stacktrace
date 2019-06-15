const _ = require('lodash');
const path = require('path');
const fs = require('fs')
const request = require('superagent')
const unzipper = require('unzipper')

const l = require('../l')


const cacheFolder = 'symbols'

function has(key) {
    const filepath = path.join(cacheFolder, key)
    return fs.existsSync(filepath)
}

/**
 * @param {string} commit 
 * @param {string} arch ARM64 | ARMv7 | X86
 * @returns path to the cached file
 */
function get(commit, arch) {
    return path.join(cacheFolder, commit, arch);
}

async function downloadSymbols(commit, arch) {
    const key = `${commit}/${arch}`
    const filepath = path.join(cacheFolder, key)

    const DEMO = 'https://codeload.github.com/ezefranca/EFInternetIndicator/zip/master'
    const url = `https://gitlab.botogames.com/root/idlegame/${commit}/${arch}`
    // const req = request.get(url);

    const req = request.get(DEMO);

    req.responseType('application/zip');
    
    const outstream = unzipper.Extract({ path: filepath })

    let count = 0;
    outstream.on('data', _ => {
        count++;
        if (count % 100 == 0) {
            l.debug(`downloaded ${count} chunks`)
        }
    })
    
    const prom = new Promise((resolve, reject) => {
        outstream.once('end', () => {
            l.info(`done downloading ${commit}/${arch}`)
            resolve(filepath)
        })
        outstream.once('error', err => {
            reject(`[${commit}/${arch} download] ${err}`)
        })
        outstream.once('close', () => {
            l.warn(`download stream closed ${commit}/${arch}`)
        })
    })
    
    req.pipe(outstream);
    l.debug('begin piping')

    return prom;
}

module.exports = {
    has,
    get,
    downloadSymbols,
}
