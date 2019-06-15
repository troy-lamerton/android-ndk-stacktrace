const sh = require('shelljs')
const fs = require('fs')
const path = require('path')
const prompts = require('prompts')

const l = require('./l')

const ndk = 'C:/bin/android-ndk-r20/toolchains/aarch64-linux-android-4.9/prebuilt/windows-x86_64/bin/aarch64-linux-android-addr2line.exe';

(async () => {

const defaultSymbols = require('../config/default')
const customSymbols = require('../config/custom')

l.info('~~ Better Native Crash Logs ~~')

const check1 = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Have you downloaded artifacts zip (from gitlab) for the crashing commit?',
    initial: true
})

if (!check1.value) {
    l.warn('Please find the gitlab pipeline for the crashing commit and download the artifacts.')
    l.info('Unzip the artifacts.zip and then unzip *symbols.zip')
    l.info('You will end up with libil2cpp.sym')
    return;
}

const gameSymbols = await prompts({
    type: 'text',
    name: 'path',
    message: 'Drag libil2cpp.sym file onto this window',
    validate: input => (input.includes('.sym') || input.includes('.so.debug')) && fs.existsSync(input)
});

const symbols = [...defaultSymbols, ...customSymbols, gameSymbols.path];
l.debug('Using symbols: ' + symbols)

const crashLog = await prompts({
    type: 'text',
    name: 'path',
    message: 'Drag a native crash log.txt onto this window',
    validate: input => fs.existsSync(input)
});

const input = fs.readFileSync(crashLog.path, 'utf8').toString()

if (input.length < 5) throw new Error('The logs file you chose didnt even contain logs!')

l.debug(input)

const parser = require('./parser')
let trace = parser(input)

symbols.forEach(symbolsFile => {
    l.info(`Checking for symbols in ${path.basename(symbolsFile)}`)

    trace = trace.map(traceObj => {
        const {number, original} = traceObj;

        const runner = sh.exec(`${ndk} -f -C -e "${symbolsFile}" ${number}`, {async: false, silent: true})
        const niceOutput = runner.stdout.trim()

        // did not find the symbol
        if (niceOutput.startsWith('?')) return traceObj;

        // remove the unknown line number indicator
        return niceOutput.replace('\n??:?', '\n');

    })
})

trace = trace.map(traceObj => {
    if (typeof(traceObj) === 'object') {
        return traceObj.original;
    }
    return traceObj;
})

const output = trace.join('\n')
console.log(output)

fs.writeFileSync(path.join(path.dirname(crashLog.path), `better_${path.basename(crashLog.path)}`), output)

})();
