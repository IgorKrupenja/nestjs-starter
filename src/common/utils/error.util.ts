interface BuildErrorMessageArgs<T> {
  readonly name: string;
  readonly args: { readonly [key in keyof Partial<T>]: T[key] };
}

export class ErrorUtil {
  static buildAlreadyExistsErrorMessage<T>(args: BuildErrorMessageArgs<T>): string {
    const name = this.capitalize(args.name);
    return Object.keys(args.args).length
      ? `${name} with ${this.formatKeyValuePairs(args.args)} already exists.`
      : `${name} already exists.`;
  }

  static buildNotFoundErrorMessage<T>(args: BuildErrorMessageArgs<T>): string {
    const name = this.capitalize(args.name);
    return Object.keys(args.args).length
      ? `${name} with ${this.formatKeyValuePairs(args.args)} not found.`
      : `${name} not found.`;
  }

  private static capitalize(value: string): string {
    return `${value[0].toUpperCase()}${value.slice(1)}`;
  }

  private static formatKeyValuePairs<T>(args: BuildErrorMessageArgs<T>['args']): string {
    return this.join(Object.entries(args).map(([key, value]) => `${key} '${String(value)}'`));
  }

  private static join(values: string[]): string {
    if (values.length < 2) return values.join();
    if (values.length === 2) return values.join(' and ');

    const lastValues = values.splice(-2);
    return [...values, this.join(lastValues)].join(', ');
  }
}
