import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsArray, IsDecimal, IsDate, IsNotEmpty, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { IsTimeFormat } from 'src/shared/decorator/validator';

export class UpdateMergedLlMDto {


  @ApiProperty({ required: false })
  @IsOptional()
  llmId1?: string;
    


  @ApiProperty({ required: false })
  @IsOptional()
  llmId2?: string;
    

  

  
}
