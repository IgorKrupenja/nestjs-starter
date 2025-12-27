import { ApiProperty } from '@nestjs/swagger';
import { PostModel } from '@src/generated/prisma/models';

export class PostDto implements PostModel {
  @ApiProperty({
    description: 'The unique identifier of the post.',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'The title of the post.',
    example: 'On programming languages',
  })
  title!: string;

  @ApiProperty({
    description: 'The content of the post.',
    example: 'TypeScript is the best programming language.',
  })
  content!: string;

  @ApiProperty({
    description: 'Whether the post is published or not.',
    example: true,
  })
  published!: boolean;

  @ApiProperty({
    description: 'The unique identifier of the author of the post.',
    example: 1,
  })
  authorId!: number;
}
