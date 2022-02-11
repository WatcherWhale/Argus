const express = require("express");
const winston = require("winston");
const morgan = require("morgan");
const rfs = require("rotating-file-stream");
const process = require("process");

const production = Object.keys(process.env).indexOf("PRODUCTION") !== -1;
const rfsOptions = {
    size: "10M",
    interval: "1d",
    compress: "gzip",
    path: "logs"
}

const logger = winston.createLogger({
    level: production ? 'info': 'debug',
    transports : [
        new winston.transports.Console({
            json: false,
            format: winston.format.cli(),
            handleExceptions: true
        }),
        new winston.transports.Stream({
            stream: rfs.createStream("gateway.log", rfsOptions),
            format: winston.format.json()
        })
    ]
});

logger.stream = {
    write: function(message, encoding) {
        logger.info(message.trim());
    }
};

const accessLogStream = rfs.createStream("access.log", rfsOptions);

const loggerMiddleware = express.Router();
loggerMiddleware.use([morgan('common', {stream: logger.stream}), morgan('combined', {stream: accessLogStream})]);

module.exports = { logger: logger, loggerMiddleware: loggerMiddleware};
