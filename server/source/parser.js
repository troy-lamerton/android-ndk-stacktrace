const l = require('./l')
const _ = require('lodash')

/*
// example
2019-06-15 00:13:53.381 15804-15827/? E/CRASH: *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
2019-06-15 00:13:53.381 15804-15827/? E/CRASH: Build type 'Release', Scripting Backend 'il2cpp', CPU 'arm64-v8a'
...
2019-06-15 00:13:53.381 15804-15827/? E/CRASH: backtrace:
2019-06-15 00:13:53.402 15804-15827/? E/CRASH: 	#00  pc 0000000000008150  /system/lib64/liblog.so (__android_log_assert+296)
2019-06-15 00:13:53.402 15804-15827/? E/CRASH: 	#01  pc 00000000000b441c  /system/lib64/libhwui.so ()
2019-06-15 00:13:53.402 15804-15827/? E/CRASH: 	#02  pc 0000000000440288  /system/lib64/libhwui.so ()
2019-06-15 00:13:53.402 15804-15827/? E/CRASH: 	#03  pc 00000000000aff7c  /system/lib64/libhwui.so ()
2019-06-15 00:13:53.406 15804-15849/? E/CRASH: other thread is trapped; signum = 6
*/

const cpuRegex = /CPU '([\w\-]+)'/
const nativeBacktraceRegex = /[\t ]+#[0-9]+ +pc ([0-9a-f]+)\s+(.*)$/

module.exports = function(verboseLog) {
    const lines = verboseLog.split('\n')
    
    const startLine = lines.findIndex(line => nativeBacktraceRegex.test(line) && line.includes('#00'))
    if (startLine < 0) return null;

    l.debug('starts at line ' + startLine)
    const backtrace = lines
            .slice(startLine)
            .map(line => nativeBacktraceRegex.exec(line))
            .filter(matches => !!matches)
            .map(matches => ({
                pc: matches[1],
                number: parseInt(matches[1].trim(), 16),
                original: matches[2],
            }))

    l.debug('there is number of lines in the backtrace: ' + backtrace.length)
    return backtrace
}