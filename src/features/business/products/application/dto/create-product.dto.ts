import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Agua 600ml' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Cristal' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ example: 2500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  price!: number;

  @ApiProperty({ example: 5, default: 0 })
  @Transform(({ value }) => (value === undefined || value === null ? 0 : value))
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiProperty({ example: 1, default: 0 })
  @Transform(({ value }) => (value === undefined || value === null ? 0 : value))
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  productTypeId!: number;
}
