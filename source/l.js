module.exports = require('pino')({
    level: 'info',
    prettyPrint: {
        levelFirst: true,
        ignore: 'time,pid,hostname'
    },
    
})