import { ApiProperty } from '@nestjs/swagger';

export class CountMetaDto {
  @ApiProperty({
    description: 'The total number of items.',
    example: 100,
  })
  readonly count!: number;
}
