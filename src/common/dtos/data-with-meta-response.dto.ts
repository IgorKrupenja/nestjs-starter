import { CountMetaDto } from './count-meta.dto.js';

export class DataWithMetaResponseDto<TData, TMeta = CountMetaDto> {
  readonly data!: TData;
  readonly meta!: TMeta;
}
