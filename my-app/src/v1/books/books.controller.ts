import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/createBook.dto';
import { UpdateBookDto } from './dto/updateBook.dto';
import { BookResponseDto } from './dto/bookResponse.dto';
import { TransformDto } from '../../common/decorators/transform.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }
  @TransformDto(BookResponseDto)
  @Get()
  async findAll() {
    return this.booksService.findAll();
  }

  @TransformDto(BookResponseDto)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.booksService.findOne(+id);
  }

  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   const book = await this.booksService.findOne(+id);

  //   const plain = book1({ plain: true }); // MUST convert Sequelize model
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  //   const transformed = plainToInstance(BookResponseDto, plain, {
  //     excludeExtraneousValues: true, // CRITICAL
  //   });

  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  //   return transformed;
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(+id, updateBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }
}
