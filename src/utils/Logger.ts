export enum LogLevel {
  TRACE,
  DEBUG,
  INFO,
  WARN,
  ERROR,
  FATAL,
}

export type Level = keyof typeof LogLevel

class Logger {

  constructor() {}

  private _write (msg: string, level: Level, ...args: any[]) {

  }

  log () {}

  debug () {}

  info () {}

  error () {}
}

export { Logger }
