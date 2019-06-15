const l = require('./l')

/*
// example
2019-06-15 00:13:53.381 15804-15827/? E/CRASH: backtrace:
2019-06-15 00:13:53.402 15804-15827/? E/CRASH: 	#00  pc 0000000000008150  /system/lib64/liblog.so (__android_log_assert+296)
2019-06-15 00:13:53.402 15804-15827/? E/CRASH: 	#01  pc 00000000000b441c  /system/lib64/libhwui.so ()
2019-06-15 00:13:53.402 15804-15827/? E/CRASH: 	#02  pc 0000000000440288  /system/lib64/libhwui.so ()
2019-06-15 00:13:53.402 15804-15827/? E/CRASH: 	#03  pc 00000000000aff7c  /system/lib64/libhwui.so ()
2019-06-15 00:13:53.406 15804-15849/? E/CRASH: other thread is trapped; signum = 6
*/

module.exports = function(verboseLog) {
    const lines = verboseLog.split('\n')
    const startLine = lines.find(line => line.includes('CRASH') && line.includes('#00'))
    l.debug('starts at line ' + startLine)
    const backtrace = lines
            .slice(startLine)
            .filter(line => line.includes(' pc '))
            .map(line => line.slice(line.indexOf('pc ') + 2).trim())
            .map(line => line.split(/\s+/))
            // logs are now [ ['00000123', '/system/libx/lib.so'], ... ]
            .map(tuple => ({
                number: parseInt(tuple[0].trim(), 16),
                original: `${tuple[0]} ${tuple[1]}\n`
            }))

    return backtrace;
}