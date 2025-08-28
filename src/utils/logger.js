import fs from 'fs/promises';
import path from 'path';

class Logger {
  constructor() {
    this.logDir = process.env.PWD + '/logs';
    this.ensureLogDirectory();
  }

  async ensureLogDirectory() {
    try {
      await fs.access(this.logDir);
    } catch (error) {
      await fs.mkdir(this.logDir, { recursive: true });
    }
  }

  async log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    const logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`);
    const logLine = JSON.stringify(logEntry) + '\n';

    try {
      await fs.appendFile(logFile, logLine);
    } catch (error) {
      console.error('Erro ao escrever log:', error);
    }

    // Console output
    const consoleMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    if (level === 'error') {
      console.error(consoleMessage, data);
    } else if (level === 'warn') {
      console.warn(consoleMessage, data);
    } else {
      console.log(consoleMessage, data);
    }
  }

  info(message, data = {}) {
    return this.log('info', message, data);
  }

  error(message, data = {}) {
    return this.log('error', message, data);
  }

  warn(message, data = {}) {
    return this.log('warn', message, data);
  }

  debug(message, data = {}) {
    return this.log('debug', message, data);
  }
}

export default new Logger();
