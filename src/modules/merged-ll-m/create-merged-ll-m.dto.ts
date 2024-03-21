import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsArray, IsDecimal, IsDateString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { IsTimeFormat } from 'src/shared/decorator/validator';

export class CreateMergedLlMDto {
  

  @ApiProperty()
  @IsNotEmpty()
  llmId1: string;
  
  

  @ApiProperty()
  @IsNotEmpty()
  llmId2: string;
  
  

  

}
