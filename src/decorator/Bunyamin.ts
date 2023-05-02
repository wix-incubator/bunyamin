import type { CategoryThreadDispatcher, MessageStack } from '../threads';
import { mergeCategories } from '../threads';
import { isActionable, isObject, isPromiseLike } from '../utils';
import type { LogLevel } from '../types';
import type { BunyaminConfig } from './BunyaminConfig';
import type { BunyaminLogMethod } from './BunyaminLogMethod';
import type { LoggerContext, ResolvedLoggerContext, UserLoggerContext } from './LoggerContext';

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

  readonly #context: LoggerContext | undefined;
  /**
   * All instances of {@link Bunyamin} must share the same object instance
   */
  readonly #shared: SharedBunyaminConfig;

  constructor(shared: SharedBunyaminConfig, context?: LoggerContext) {
    this.#shared = shared as SharedBunyaminConfig;
    this.#context = context ?? undefined;
  }

  get logger() {
    return this.#shared.logger;
  }

  child(overrides?: UserLoggerContext): Bunyamin {
    const childContext = this.#mergeContexts(this.#context, this.#transformContext(overrides));
    return new Bunyamin(this.#shared, childContext);
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
    const entry = this.#resolveLogEntry({ ph: 'B' }, arguments_);
    this.#beginInternal(level, entry.context, entry.message);
  }

  #beginInternal(level: LogLevel, context: ResolvedLoggerContext, message: unknown[]): void {
    this.#shared.messageStack.push(context as any, message);
    this.#shared.logger[level](context, ...message);
  }

  #end(level: LogLevel, ...arguments_: any[]): void {
    const entry = this.#resolveLogEntry({ ph: 'E' }, arguments_);
    this.#endInternal(level, entry.context, entry.message);
  }

  #endInternal(level: LogLevel, context: ResolvedLoggerContext, customMessage: unknown[]): void {
    const beginMessage = this.#shared.messageStack.pop(context as any);
    const message = customMessage.length > 0 ? customMessage : beginMessage;

    this.#shared.logger[level](context, ...(message as unknown[]));
  }

  #instant(level: LogLevel, ...arguments_: any[]): void {
    const entry = this.#resolveLogEntry(void 0, arguments_);
    this.#shared.logger[level](entry.context, ...entry.message);
  }

  #complete<T>(
    level: LogLevel,
    maybeContext: unknown,
    maybeMessage: unknown,
    maybeAction: T | (() => T),
  ): T {
    const action = typeof maybeContext === 'string' ? (maybeMessage as T | (() => T)) : maybeAction;
    const arguments_ = maybeAction === action ? [maybeContext, maybeMessage] : [maybeContext];
    const { context, message } = this.#resolveLogEntry({ ph: 'B' }, arguments_);

    return this.#completeInternal(level, context, message, action);
  }

  #completeInternal<T>(
    level: LogLevel,
    context: ResolvedLoggerContext,
    message: unknown[],
    action: T | (() => T),
  ): T {
    const end = (customContext: EndContext) => {
      const endContext: ResolvedLoggerContext = {
        ph: 'E',
        cat: context.cat,
        tid: context.tid,
        ...customContext,
      };
      this.#endInternal(level, endContext, []);
    };

    let result;
    this.#beginInternal(level, { ...context, ph: 'B' }, message);
    try {
      result = isActionable(action) ? action() : action;

      if (isPromiseLike(result)) {
        result.then(
          () => end({ success: true }),
          (error) => end({ success: false, error }),
        );
      } else {
        end({ success: true });
      }

      return result;
    } catch (error: unknown) {
      end({ success: false, error });
      throw error;
    }
  }

  #resolveLogEntry(boundContext: LoggerContext | undefined, arguments_: unknown[]) {
    const userContext = isObject(arguments_[0]) ? (arguments_[0] as LoggerContext) : undefined;

    return {
      context: this.#mergeContexts(
        { ...this.#context, ...boundContext },
        this.#transformContext(userContext),
      ),
      message: userContext === undefined ? arguments_ : arguments_.slice(1),
    };
  }

  #mergeContexts(
    left: LoggerContext | undefined,
    right: UserLoggerContext | undefined,
  ): ResolvedLoggerContext {
    const { cat: leftCat, tid: leftTid, ph: leftPh, ...leftRest } = left ?? {};
    const { asyncId, cat: rightCat, tid: rightTid, ph: rightPh, ...rightRest } = right ?? {};

    const ph = rightPh ?? leftPh;
    const cat = mergeCategories(leftCat, rightCat) || (this.#shared.defaultCategory ?? 'custom');
    const tid = rightTid ?? leftTid ?? this.#shared.dispatcher.resolve(ph, cat, asyncId);

    return {
      ...leftRest,
      ...rightRest,
      cat,
      ph,
      tid,
    };
  }

  #transformContext<T extends LoggerContext>(context: T | undefined): T | undefined {
    return this.#shared.transformContext ? this.#shared.transformContext(context) : context;
  }
}

type EndContext = {
  success?: boolean;
  error?: unknown;
};
