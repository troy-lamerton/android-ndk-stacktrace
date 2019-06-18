const sh = require('shelljs')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const l = require('./l')
const ndks = {
    // ARM64: path.join(__dirname, 'bin/aarch64-linux-android-addr2line.exe')
    'ARM64': path.join(process.env.NDK_PATH, `toolchains/aarch64-linux-android-4.9/prebuilt/windows-x86_64/bin/aarch64-linux-android-addr2line.exe`),
}

function getNdk(arch) {
    return ndks[arch];
}

module.exports = async (logs, specialSymbolsFolder, arch = 'ARM64') => {
    const ndk = getNdk(arch);
    const defaultSymbols = require(`../config/${arch}`)

    const specialSymbolsPath = path.join(specialSymbolsFolder, 'libil2cpp.sym')
    const symbols = [...defaultSymbols, specialSymbolsPath];
    l.debug('Using game symbols: ' + specialSymbolsPath)

    if (logs.length < 5) throw new Error('The logs data doesnt even contain logs!');

    
    const parser = require('./parser')
    const traces = parser(logs)

    if (traces.length > 20) throw new Error(`too long! ${traces.length} lines are apparently crash logs`)
    
    const originalStrings = traces.map(obj => obj.original)

    const linesPromised = traces.map(traceObj => {
        
        const promises = symbols.map(symbolsFile => {
            l.trace(`Checking for symbols in ${path.basename(symbolsFile)}`)
            const { number } = traceObj;

            return executeAsync(`${ndk} -f -C -e "${symbolsFile}" ${number}`)
                .then((niceOutput) => {
                    if (!niceOutput) throw new Error('output is empty!')
                    
                    // did not find the symbol
                    if (niceOutput.startsWith('??')) return null;
                    
                    // remove the unknown line number indicator
                    return niceOutput.replace('\n??:?', '\n');
                }).catch(err => {
                    l.error(`[${ndk}] ${err}`)
                    return null;
                })
        })

        return Promise.all(promises).then(results => {
            return results.find(result => _.isString(result)) || null;
        })
    })

    
    const finalOutputs = await Promise.all(linesPromised);

    const output = finalOutputs
        .map((symbolicated, i) => _.isString(symbolicated) ? symbolicated : originalStrings[i])
        .join('\n')

    return output;
}

function executeAsync(command) {
    return new Promise((resolve, reject) => {
        // l.info(command)
        // resolve('??:?')
        sh.exec(command, {silent: true}, (exitcode, stdout, stderr) => {
            if (exitcode) reject(`exited with code ${exitcode}\n${stderr.trim()}`)
            else resolve(stdout.trim())
        })
    })
}