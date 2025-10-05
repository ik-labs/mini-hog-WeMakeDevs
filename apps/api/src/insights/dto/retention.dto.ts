import { IsEnum, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class RetentionQueryDto {
  @IsEnum(['first_event', 'signup', 'custom_event'])
  @IsOptional()
  cohort_type?: 'first_event' | 'signup' | 'custom_event';

  @IsString()
  @IsOptional()
  cohort_event?: string;

  @IsString()
  @IsOptional()
  return_event?: string;

  @IsEnum(['daily', 'weekly', 'monthly'])
  @IsOptional()
  period_type?: 'daily' | 'weekly' | 'monthly';

  @IsInt()
  @Min(1)
  @Max(52)
  @IsOptional()
  periods?: number;

  @IsString()
  @IsOptional()
  from?: string;

  @IsString()
  @IsOptional()
  to?: string;

  @IsString()
  @IsOptional()
  date_range?: string;
}
