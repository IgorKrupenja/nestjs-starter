import { Prisma } from './generated/prisma/client';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto implements Pick<Prisma.PostCreateInput, 'title' | 'content'> {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsEmail()
  @IsNotEmpty()
  authorEmail!: string;
}
