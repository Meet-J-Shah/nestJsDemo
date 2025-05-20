/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/books/dto/book-response.dto.ts
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class BookResponseDto {
  @Expose()
  bookId: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  // ❌ No @Expose() = will be excluded
  password: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<BookResponseDto>) {
    Object.assign(this, partial);
  }
}
