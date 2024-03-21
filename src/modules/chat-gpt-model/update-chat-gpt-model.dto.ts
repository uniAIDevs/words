import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsArray, IsDecimal, IsDate, IsNotEmpty, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { IsTimeFormat } from 'src/shared/decorator/validator';

export class UpdateChatGptModelDto {


  @ApiProperty({ required: false })
  @IsOptional()
  modelName?: string;
    


  @ApiProperty({ required: false })
  @IsOptional()
  modelVersion?: string;
    


  @ApiProperty({ required: false })
  @IsOptional()
  apiKeyId?: string;
    

  

  
}
