module.exports = require('pino')({
    level: process.env.LOG_LEVEL,
    prettyPrint: {
        levelFirst: true,
        ignore: 'time,pid,hostname'
    },
})