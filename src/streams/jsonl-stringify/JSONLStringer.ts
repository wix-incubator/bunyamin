/* eslint-disable unicorn/no-null */
import { Transform } from 'stream';

export type JSONLStringerOptions = {
  replacer: any;
  header: string;
  delimiter: string;
  footer: string;
};

export class JSONLStringer extends Transform {
  private _replacer: any;
  private _header: string;
  private _delimiter: string;
  private _footer: string;

  constructor(options: JSONLStringerOptions) {
    super({ writableObjectMode: true, readableObjectMode: false });

    this._replacer = options.replacer;
    this._header = options.header;
    this._delimiter = options.delimiter;
    this._footer = options.footer;
  }

  _transform(chunk: any, _: any, callback: any) {
    if (this._header) {
      this.push(this._header);
    }

    this.push(JSON.stringify(chunk, this._replacer));
    this._transform = this._nextTransform;
    callback(null);
  }

  _nextTransform(chunk: any, _: any, callback: any) {
    this.push(this._delimiter + JSON.stringify(chunk, this._replacer));
    callback(null);
  }

  _flush(callback: any) {
    if (this._footer) {
      this.push(this._footer);
    }

    callback();
  }
}
