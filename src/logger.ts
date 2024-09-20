import "server-only";
import winston from "winston";

const { combine, timestamp, json, printf } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleString("en-US");

    return `[${formattedDate}] - ${label ? `[${label}] ` : ""}${level}: ${message}`;

});

const logger = winston.createLogger({
    level: "info",
    format: combine(timestamp(), json(), myFormat),
    transports: [
        new winston.transports.File({
            filename: "error.log",
            level: "error"
        }),
        new winston.transports.File({ filename: "app.log" }),
    ],
});

export { logger };