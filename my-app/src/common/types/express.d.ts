import 'express';

declare module 'express' {
  interface Request {
    i18nArgs?: Record<string, any>;
  }
}
