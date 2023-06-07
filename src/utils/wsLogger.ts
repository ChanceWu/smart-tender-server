import { createLogger, format, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf, errors } = format;

export const wsLogger = createLogger({
    level: 'info',
    format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        printf(info => `${info.timestamp} ${info.level}: ${info.message}\n${info.stack || ''}`),
    ),
    transports: [
        // 控制台输出
        new transports.Console(),
        // 每天生成一个info日志文件
        new DailyRotateFile({
            filename: 'logs/info-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'info',
        }),
        // 每天生成一个error日志文件
        new DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
        }),
    ],
})