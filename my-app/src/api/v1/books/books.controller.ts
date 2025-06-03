import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  // Param,
  Delete,
  UseGuards,
  Request,
  Req,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/createBook.dto';
import { UpdateBookDto } from './dto/updateBook.dto';
// import { BookResponseDto } from './dto/bookResponse.dto';
// import { TransformDto } from '../../../common/decorators/transform.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookAccessGuard } from 'src/common/guards/bookAccess.guard';
import { Book } from './models/book.model';
import { reqUser } from 'src/common/interfaces/reqUser.interface';
import { ResponseMessage } from 'src/common/decorators/responseMessage.decorator';
// import { Book } from './models/book.model';

@UseGuards(JwtAuthGuard)
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}
  @ResponseMessage('book.created')
  @Post()
  create(@Req() req, @Body() createBookDto: CreateBookDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const reqUser = req.user as reqUser;
    return this.booksService.create(reqUser, createBookDto);
  }
  // @ResponseMessage('role.allFetched')
  // @Permissions('read_role')
  @ResponseMessage('book.allFetched')
  @Get()
  findAll(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    return this.booksService.findAll(req.user);
  }

  // @TransformDto(BookResponseDto)
  @ResponseMessage('book.fetched')
  @UseGuards(BookAccessGuard)
  @Get(':id')
  getBook(@Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return req.book;
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
  @ResponseMessage('book.updated')
  @UseGuards(BookAccessGuard)
  @Patch(':id')
  update(@Req() req, @Body() updateBookDto: UpdateBookDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const book = req.book as Book; // No need to query again
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const roleId = req.user.roleId as number;
    return this.booksService.update(book, roleId, updateBookDto);
    // return this.booksService.update(+id, updateBookDto);
  }
  @ResponseMessage('book.deleted')
  @UseGuards(BookAccessGuard)
  @Delete(':id')
  async remove(@Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const book = req.book as Book; // No need to query again

    await this.booksService.remove(book);
  }
}
