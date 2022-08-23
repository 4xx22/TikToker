const moment = require('moment');
const chalk = require('chalk');
const timestamp = `[${moment().format('HH:mm:ss')}]:`;

exports.log = (content, type = 'log') => {
	if (content == 'error') return;
	switch (type) {
	case 'log':
		console.log(`${timestamp} ${chalk.bgBlue("[" + type.toUpperCase() + "]")} ${content} `);
		break;
	case 'debug':
		console.log(`${timestamp} ${chalk.black.bgYellow(type.toUpperCase())} ${content} `);
		break;
	case 'info':
		console.log(`${timestamp} ${chalk.bgRed(type.toUpperCase())} ${content} `);
		break;
	case 'warn':
		console.log(`${timestamp} ${chalk.green(type.toUpperCase())} ${content} `);
		break;
	case 'error':
		console.log(`${timestamp} ${chalk.black.bgWhite(type.toUpperCase())} ${content}`);
		break;
	default: throw new TypeError("Le type de logger doit être l'un des suivants: log, warn, info, error, debug");
}
};

exports.debug = (...args) => this.log(...args, 'debug');

exports.info = (...args) => this.log(...args, 'info');

exports.warn = (...args) => this.log(...args, 'warn');

exports.error = (...args) => this.log(...args, 'error');