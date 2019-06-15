const sh = require('shelljs')
const fs = require('fs')
const path = require('path')
const prompts = require('prompts')

const l = require('./l')

const customSymbols = require('../config/custom')

const ndks = {
    ARM64: 'bin/aarch64-linux-android-addr2line.exe'
}

function getNdk(arch) {
    return ndks[arch];
}


module.exports = async (logs, symbolsPath, arch = 'ARM64') => {
    const ndk = getNdk(arch);
    const defaultSymbols = require(`../config/${arch}`)

    l.info('~~ Better NDK Symbols ~~')
    l.info('You will end up with libil2cpp.sym')

    const symbols = [...defaultSymbols, symbolsPath];
    l.debug('Using symbols: ' + symbolsPath)

    if (logs.length < 5) throw new Error('The logs data doesnt even contain logs!');

    l.debug(logs)

    const parser = require('./parser')
    let trace = parser(logs)

    symbols.forEach(symbolsFile => {
        l.info(`Checking for symbols in ${path.basename(symbolsFile)}`)

        trace = trace.map(traceObj => {
            const { number } = traceObj;

            const runner = sh.exec(`${ndk} -f -C -e "${symbolsFile}" ${number}`, {async: false, silent: true})
            const niceOutput = runner.stdout.trim()

            // did not find the symbol
            if (niceOutput.startsWith('?')) return traceObj;

            // remove the unknown line number indicator
            return niceOutput.replace('\n??:?', '\n');

        })
    })

    trace = trace.map(traceObj => traceObj.original || traceObj)

    const output = trace.join('\n')
    console.log(output)

    fs.writeFileSync(path.join(path.dirname(crashLog.path), `better_${path.basename(crashLog.path)}`), output)

}
