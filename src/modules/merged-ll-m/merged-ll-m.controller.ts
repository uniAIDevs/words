import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { MergedLlMService } from './merged-ll-m.service';
import { MergedLlMModel } from './merged-ll-m.model';
import { CreateMergedLlMDto } from './create-merged-ll-m.dto';
import { UpdateMergedLlMDto } from './update-merged-ll-m.dto';

@ApiBearerAuth('BearerAuth')
@ApiTags('MergedLlMS')
@Controller('mergedLlMS')
export class MergedLlMController {
  constructor(
    private mergedLlMService: MergedLlMService,
  ) {}


  /**
   * Get all mergedLlMs with pagination support.
   *
   * 
   * @param {number} page - The page number for pagination (optional, default: 1).
   * @param {number} limit - The number of items per page (optional, default: 10).
   * @param {string} search - Optional search term for filtering mergedLlMs.
   * @returns {Promise<{ result: MergedLlMModel[]; total: number }>} - The list of mergedLlMs and the total count.
   */
  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Optional page for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Optional limit for pagination',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Optional search for searching',
  })
  async getAllMergedLlMS(
    
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ): Promise<{ result: MergedLlMModel[]; total: number }> {
    // Convert page and limit to numbers and ensure they are positive values
    const pageNumber = Math.max(1, Number(page));
    const itemsPerPage = Math.max(1, Number(limit));

    // Calculate the number of items to skip based on the current page and items per page
    const skip = (pageNumber - 1) * itemsPerPage;

    return this.mergedLlMService.getAllMergedLlMS(
      
      skip,
      itemsPerPage,
      search
    );
  }

  /**
   * Get mergedLlM data for dropdowns.
   *
   * 
   * @param {string} fields - Comma-separated list of fields to retrieve (optional).
   * @param {string} keyword - The keyword for filtering data (optional).
   * @returns {Promise<MergedLlMModel[]>} - The list of mergedLlM data for dropdowns.
   */
  @Get('dropdown')
  @ApiQuery({
    name: 'fields',
    required: false,
    type: String,
    description: 'Optional fields for filtering',
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    type: String,
    description: 'Optional keyword for filtering',
  })
  async getMergedLlMDropdownData(
    
    @Query('fields') fields: string,
    @Query('keyword') keyword: string,
  ): Promise<MergedLlMModel[]> {
    const fieldArray = fields ? fields.split(',') : [
      'id',
    ]
    return this.mergedLlMService.findAllDropdownData(
      
      fieldArray, 
      keyword
    );
  }

  /**
   * Get a mergedLlM by ID.
   *
   * 
   * @param {string} id - The id of the mergedLlM to retrieve.
   * @returns {Promise<MergedLlMModel>} - The mergedLlM object.
   */
  @Get(':id')
  async getMergedLlMById(
    
    @Param('id') id: string
  ): Promise<MergedLlMModel> {
    return this.mergedLlMService.getMergedLlMById(
      
      id
    );
  }

  /**
   * Create a new mergedLlM.
   *
   * 
   * @param {CreateMergedLlMDto} createMergedLlMDto - The DTO for creating a mergedLlM.
   * @returns {Promise<MergedLlMModel>} - The newly created mergedLlM object.
   */
  @Post()
  async createMergedLlM(
    
    @Body() createMergedLlMDto: CreateMergedLlMDto
  ): Promise<MergedLlMModel> {
    return this.mergedLlMService.createMergedLlM(
      
      createMergedLlMDto
    );
  }

  /**
   * Update an existing mergedLlM.
   *
   * 
   * @param {string} id - The id of the mergedLlM to update.
   * @param {UpdateMergedLlMDto} updateMergedLlMDto - The DTO for updating a mergedLlM.
   * @returns {Promise<MergedLlMModel>} - The updated mergedLlM object.
   */
  @Put(':id')
  async updateMergedLlM(
    
    @Param('id') id: string,
    @Body() updateMergedLlMDto: UpdateMergedLlMDto,
  ): Promise<MergedLlMModel> {
    return this.mergedLlMService.updateMergedLlM(
      
      id, 
      updateMergedLlMDto
    );
  }


  /**
   * Delete a mergedLlM by ID.
   *
   * 
   * @param {string} id - The id of the mergedLlM to delete.
   * @returns {Promise<void>}
   */
  @Delete(':id')
  async deleteMergedLlM(
    
    @Param('id') id: string
  ): Promise<void> {
    return this.mergedLlMService.deleteMergedLlM(
      
      id
    );
  }
}
