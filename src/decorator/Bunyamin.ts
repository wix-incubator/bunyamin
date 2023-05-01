import path from 'path';
import { sanitizeBunyanContext } from '../bunyan';
import { CategoryThreadDispatcher, MessageStack } from '../threads';
import { isError, isObject, isPromiseLike } from '../utils';
import { LogLevel } from '../types';
import { BunyaminConfig } from './BunyaminConfig';
import { BunyaminLogMethod } from './BunyaminLogMethod';
import { LoggerContext } from './LoggerContext';

export type SharedBunyaminConfig = BunyaminConfig & {
  dispatcher: CategoryThreadDispatcher;
  messageStack: MessageStack;
};

export class Bunyamin {
  public readonly fatal = this.#setupLogMethod('fatal');
  public readonly error = this.#setupLogMethod('error');
  public readonly warn = this.#setupLogMethod('warn');
  public readonly info = this.#setupLogMethod('info');
  public readonly debug = this.#setupLogMethod('debug');
  public readonly trace = this.#setupLogMethod('trace');

  /**
   * All instances of {@link Bunyamin} must share the same object instance
   */
  readonly #shared: SharedBunyaminConfig;
  readonly #context?: LoggerContext;

  constructor(sharedConfig: SharedBunyaminConfig, context?: LoggerContext) {
    this.#shared = sharedConfig as SharedBunyaminConfig;
    this.#context = context;
  }

  get bunyan() {
    return this.#shared.bunyan;
  }

  child(overrides: LoggerContext): Bunyamin {
    const merged = this._mergeContexts(
      this.#context ?? {},
      this.#shared.unsafeMode ? overrides : sanitizeBunyanContext(overrides),
    );
    return new Bunyamin(this.#shared, merged);
  }

  _mergeContexts(...contexts: (LoggerContext | undefined)[]): LoggerContext {
    const context = Object.assign({}, ...contexts);
    const categoriesNonUnique = contexts.flatMap((c: LoggerContext | undefined) => {
      return c && c.cat ? (Array.isArray(c.cat) ? c.cat : String(c.cat).split(',')) : [];
    });
    const categories = [...new Set(categoriesNonUnique)].join(',');

    if (context.err) {
      context.error = context.err;
      delete context.err;
    }

    if (categories) {
      context.cat = categories;
    } else {
      delete context.cat;
    }

    if (context.__filename) {
      context.__filename = path.basename(context.__filename);
    }

    context.ph = context.ph || 'i';
    context.tid = this.#shared.dispatcher.resolve(context.ph, context.cat, context.id || 0);

    return context;
  }

  #setupLogMethod(level: LogLevel): BunyaminLogMethod {
    const logMethod = this.#instant.bind(this, level);

    return Object.assign(logMethod, {
      begin: this.#begin.bind(this, level),
      complete: this.#complete.bind(this, level),
      end: this.#end.bind(this, level),
    }) as BunyaminLogMethod;
  }

  #begin(level: LogLevel, ...arguments_: any[]): void {
    const { context, msg } = this.#parseArgs({ ph: 'B' }, arguments_);
    this.#beginInternal(level, context, msg);
  }

  #beginInternal(level: LogLevel, context: LoggerContext, message: any[]): void {
    this.#shared.messageStack.push(context as any, message);
    this.#shared.bunyan[level](context, ...message);
  }

  #end(level: LogLevel, ...arguments_: any[]): void {
    const { context, msg } = this.#parseArgs({ ph: 'E' }, arguments_);
    this.#endInternal(level, context, msg);
  }

  #endInternal(level: LogLevel, context: LoggerContext, customMessage: any[]): void {
    const beginMessage = this.#shared.messageStack.pop(context as any);
    const message = customMessage.length > 0 ? customMessage : beginMessage;

    this.#shared.bunyan[level](context, ...(message as any[]));
  }

  #instant(level: LogLevel, ...arguments_: any[]): void {
    const { context, msg } = this.#parseArgs(null as any, arguments_);
    this.#shared.bunyan.logger[level](context, ...msg);
  }

  #complete(level: LogLevel, maybeContext: any, maybeMessage: any, maybeAction: any) {
    const action = typeof maybeContext === 'string' ? maybeMessage : maybeAction;
    const arguments_ = maybeAction === action ? [maybeContext, maybeMessage] : [maybeContext];
    const { context, msg } = this.#parseArgs(null as any, arguments_);
    const end = (customContext?: LoggerContext) =>
      this[level].end({
        id: context.id,
        cat: context.cat,
        ...customContext,
      });

    let result;
    this.#beginInternal(level, { ...context, ph: 'B' }, msg);
    try {
      result = typeof action === 'function' ? action() : action;

      if (isPromiseLike(result)) {
        result.then(
          () => end({ success: true }),
          (error) => end({ success: false, err: error }),
        );
      } else {
        end({ success: true });
      }

      return result;
    } catch (error) {
      end({ success: false, err: error });
      throw error;
    }
  }

  #parseArgs(boundContext: LoggerContext, arguments_: any[]) {
    const userContext: LoggerContext | undefined = isError(arguments_[0])
      ? { err: arguments_[0] }
      : isObject(arguments_[0])
      ? (arguments_[0] as LoggerContext)
      : undefined;

    const message = userContext === undefined ? arguments_ : arguments_.slice(1);

    const context = this._mergeContexts(
      this.#context,
      boundContext,
      this.#shared.unsafeMode || !userContext ? userContext : sanitizeBunyanContext(userContext),
    );

    return { context, msg: message };
  }
}
