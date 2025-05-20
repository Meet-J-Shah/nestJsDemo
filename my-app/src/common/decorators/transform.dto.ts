// src/common/decorators/transform.dto.ts
import { SetMetadata } from '@nestjs/common';

export const TRANSFORM_DTO_KEY = '__dto';
export const TransformDto = (dto: any) => SetMetadata(TRANSFORM_DTO_KEY, dto);
