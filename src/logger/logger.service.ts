import { LoggerService } from '@nestjs/common';
import { LogLevel, Theme } from './theme';
import * as util from 'util';
import XRegExp from 'xregexp';

const regexp = XRegExp(/{\w+(:(?<modifiers>\w+))?}/g);

export class AppLoggerService implements LoggerService {
  private readonly _name?: string;

  public constructor(name?: string) {
    this._name = name;
  }

  log(message: any, context?: string) {
    this._log(LogLevel.Info, [message, context].join(' '));
  }

  error(message: any, trace?: string, context?: string) {
    this._log(LogLevel.Error, [message, trace, context].join(' '));
  }

  warn(message: any, context?: string) {
    this._log(LogLevel.Warning, [message, context].join(' '));
  }

  debug?(message: any, context?: string) {
    this._log(LogLevel.Debug, [message, context].join(' '));
  }

  verbose?(message: any, context?: string) {
    this._log(LogLevel.Verbose, [message, context].join(' '));
  }

  private _log(level: LogLevel, info: string, ...args: any[]) {
    const logArgs = XRegExp.match(info, regexp)!;
    for (let i = 0; i < logArgs.length; i++) {
      const target = logArgs[i];
      let arg = args[i];

      const _modifiers = XRegExp.exec(info, regexp)!.groups!.modifiers ?? '';
      const modifiers = _modifiers.split('');

      info = info.replaceAll(target, this.colorify(arg, modifiers));
    }

    console.log(Theme.constructLog(this._name ?? 'Nest', level) + info);
  }

  private colorify(arg: any, modifiers: string[]) {
    if (typeof arg == 'undefined') arg = Theme.Undefined('undefined');
    if (typeof arg == 'string') arg = Theme.String(arg.toString());
    if (typeof arg == 'number') arg = Theme.Number(arg.toString());
    if (typeof arg == 'boolean')
      arg = arg ? Theme.True(arg.toString()) : Theme.False(arg.toString());
    if (typeof arg == 'object') {
      if (Array.isArray(arg)) {
        arg = arg.map((x) => {
          if (typeof x == 'string') x = `'` + x + `'`;
          return this.colorify(x, []);
        });
        arg = '[ ' + arg.join(', ') + ' ]';
      } else
        arg = Theme.Object(
          util.inspect(arg, { depth: modifiers.includes('d') ? Infinity : 0 }),
        );
    }

    if (arg == null) arg = Theme.Null('null');
    return arg;
  }
}
