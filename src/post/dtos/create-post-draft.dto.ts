import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@src/generated/prisma/client.js';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDraftDto implements Pick<Prisma.PostCreateInput, 'title' | 'content'> {
  @ApiProperty({
    description: 'The title of the post.',
    example: 'On programming languages',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'The content of the post.',
    example: 'TypeScript is the best programming language.',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({
    description: 'The email of the author of the post.',
    example: 'test@example.com',
    type: String,
  })
  @IsEmail()
  @IsNotEmpty()
  authorEmail!: string;
}
