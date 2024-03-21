import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsArray, IsDecimal, IsDate, IsNotEmpty, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { IsTimeFormat } from 'src/shared/decorator/validator';

export class UpdateOpenAiKeyDto {


  @ApiProperty({ required: false })
  @IsOptional()
  apiKey?: string;
    

  

  
}
