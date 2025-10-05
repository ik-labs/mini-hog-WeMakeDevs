import { IsArray, IsEnum, IsOptional, IsString, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class FunnelStepDto {
  @IsString()
  @IsNotEmpty()
  event!: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  properties?: Record<string, any>;
}

export class FunnelQueryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FunnelStepDto)
  steps!: FunnelStepDto[];

  @IsString()
  @IsOptional()
  time_window?: string;

  @IsEnum(['strict', 'any_order'])
  @IsOptional()
  step_order?: 'strict' | 'any_order';

  @IsString()
  @IsOptional()
  breakdown_by?: string;

  @IsString()
  @IsOptional()
  from?: string;

  @IsString()
  @IsOptional()
  to?: string;
}
