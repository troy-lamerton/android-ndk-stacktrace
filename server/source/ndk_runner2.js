const { streamWrite, streamEnd, onExit } = require('@rauschma/stringio');
const { spawn } = require('child_process');
const path = require('path')
const _ = require('lodash')
const l = require('./l');

const parser = require('./parser');

async function main(cmd) {
  const sink = spawn(cmd, {stdio: ['pipe', process.stdout, process.stderr]}); // (A)

  writeToWritable(sink.stdin); // (B)
  await onExit(sink);

  console.log('### DONE');
}

async function writeToWritable(writable) {
  await streamWrite(writable, 'Firstline.sym\n');
  await streamWrite(writable, 'Secondline.sym\n');
  await streamEnd(writable);
}

const windowsNdks = {
  // ARM64: path.join(__dirname, 'bin/aarch64-linux-android-addr2line.exe')
  'arm64-v8a': path.join(__dirname, '..', `tools/${}/prebuilt/windows-x86_64/bin/aarch64-linux-android-addr2line.exe`),
}

function getNdk(arch) {
  return windowsNdks[arch];
}

module.exports = async (logs, specialSymbolsFolder, arch) => {
    const defaultSymbols = require(`../config/${arch}`)
    
    const specialSymbolsPath = path.join(specialSymbolsFolder, 'libil2cpp.sym')
    const symbols = [...defaultSymbols, specialSymbolsPath];
    l.debug('Using game symbols: ' + specialSymbolsPath)
    
    const backtrace = parser(logs)
    if (!backtrace) throw new Error('Parsing failed. Did you include all lines starting from *** *** *** ?');
    if (backtrace.length > 32) throw new Error(`too long! ${backtrace.length} lines are apparently crash logs`)
    const originalStrings = backtrace.map(obj => obj.original)
    
    const ndkTool = getTools(arch);
    l.info('using ndk tool at ' + ndkTool)
    const proc = main(ndkTool)

    // return the full output string
}
