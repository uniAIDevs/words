import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { LlmAdapterService } from './llm-adapter.service';
import { LlmAdapterModel } from './llm-adapter.model';
import { CreateLlmAdapterDto } from './create-llm-adapter.dto';
import { UpdateLlmAdapterDto } from './update-llm-adapter.dto';

@ApiBearerAuth('BearerAuth')
@ApiTags('LlmAdapters')
@Controller('llmAdapters')
export class LlmAdapterController {
  constructor(
    private llmAdapterService: LlmAdapterService,
  ) {}


  /**
   * Get all llmAdapters with pagination support.
   *
   * 
   * @param {number} page - The page number for pagination (optional, default: 1).
   * @param {number} limit - The number of items per page (optional, default: 10).
   * @param {string} search - Optional search term for filtering llmAdapters.
   * @returns {Promise<{ result: LlmAdapterModel[]; total: number }>} - The list of llmAdapters and the total count.
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
  async getAllLlmAdapters(
    
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ): Promise<{ result: LlmAdapterModel[]; total: number }> {
    // Convert page and limit to numbers and ensure they are positive values
    const pageNumber = Math.max(1, Number(page));
    const itemsPerPage = Math.max(1, Number(limit));

    // Calculate the number of items to skip based on the current page and items per page
    const skip = (pageNumber - 1) * itemsPerPage;

    return this.llmAdapterService.getAllLlmAdapters(
      
      skip,
      itemsPerPage,
      search
    );
  }

  /**
   * Get llmAdapter data for dropdowns.
   *
   * 
   * @param {string} fields - Comma-separated list of fields to retrieve (optional).
   * @param {string} keyword - The keyword for filtering data (optional).
   * @returns {Promise<LlmAdapterModel[]>} - The list of llmAdapter data for dropdowns.
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
  async getLlmAdapterDropdownData(
    
    @Query('fields') fields: string,
    @Query('keyword') keyword: string,
  ): Promise<LlmAdapterModel[]> {
    const fieldArray = fields ? fields.split(',') : [
      'id',
    ]
    return this.llmAdapterService.findAllDropdownData(
      
      fieldArray, 
      keyword
    );
  }

  /**
   * Get a llmAdapter by ID.
   *
   * 
   * @param {string} id - The id of the llmAdapter to retrieve.
   * @returns {Promise<LlmAdapterModel>} - The llmAdapter object.
   */
  @Get(':id')
  async getLlmAdapterById(
    
    @Param('id') id: string
  ): Promise<LlmAdapterModel> {
    return this.llmAdapterService.getLlmAdapterById(
      
      id
    );
  }

  /**
   * Create a new llmAdapter.
   *
   * 
   * @param {CreateLlmAdapterDto} createLlmAdapterDto - The DTO for creating a llmAdapter.
   * @returns {Promise<LlmAdapterModel>} - The newly created llmAdapter object.
   */
  @Post()
  async createLlmAdapter(
    
    @Body() createLlmAdapterDto: CreateLlmAdapterDto
  ): Promise<LlmAdapterModel> {
    return this.llmAdapterService.createLlmAdapter(
      
      createLlmAdapterDto
    );
  }

  /**
   * Update an existing llmAdapter.
   *
   * 
   * @param {string} id - The id of the llmAdapter to update.
   * @param {UpdateLlmAdapterDto} updateLlmAdapterDto - The DTO for updating a llmAdapter.
   * @returns {Promise<LlmAdapterModel>} - The updated llmAdapter object.
   */
  @Put(':id')
  async updateLlmAdapter(
    
    @Param('id') id: string,
    @Body() updateLlmAdapterDto: UpdateLlmAdapterDto,
  ): Promise<LlmAdapterModel> {
    return this.llmAdapterService.updateLlmAdapter(
      
      id, 
      updateLlmAdapterDto
    );
  }


  /**
   * Delete a llmAdapter by ID.
   *
   * 
   * @param {string} id - The id of the llmAdapter to delete.
   * @returns {Promise<void>}
   */
  @Delete(':id')
  async deleteLlmAdapter(
    
    @Param('id') id: string
  ): Promise<void> {
    return this.llmAdapterService.deleteLlmAdapter(
      
      id
    );
  }
}
