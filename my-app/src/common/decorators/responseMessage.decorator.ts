import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_KEY = 'responseMessage';

export interface ResponseMessageMetadata {
  translationKey: string;
  args?: Record<string, any>;
}

export const ResponseMessage = (
  translationKey: string,
  args?: Record<string, any>, // Optional
) => SetMetadata(RESPONSE_MESSAGE_KEY, { translationKey, args });
