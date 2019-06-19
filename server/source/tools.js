const os = require('os')
const path = require('path')

// 'Linux' on Linux, 'Darwin' on macOS, and 'Windows_NT' on Windows.

const platform = os.type()

module.exports = function(arch) {
    // return path.join(__dirname, '..', 'tools', `${arch}/${platform}/bin/aarch64-linux-android-addr2line`)
    return path.join(__dirname, '..', 'tools', `${arch}/${platform}/bin/llvm-symbolizer`)
}
