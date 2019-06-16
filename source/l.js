module.exports = require('pino')({
    level: 'debug',
    prettyPrint: {
        levelFirst: true,
        ignore: 'time,pid,hostname'
    },
    
})