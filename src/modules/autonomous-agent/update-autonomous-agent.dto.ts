import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsArray, IsDecimal, IsDate, IsNotEmpty, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { IsTimeFormat } from 'src/shared/decorator/validator';

export class UpdateAutonomousAgentDto {


  @ApiProperty({ required: false })
  @IsOptional()
  name?: string;
    


  @ApiProperty({ required: false })
  @IsOptional()
  llmId?: string;
    

  

  
}
