import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsArray, IsDecimal, IsDate, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto {

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;
}
