import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { LlmApIService } from './llm-ap-i.service';
import { LlmApIModel } from './llm-ap-i.model';
import { CreateLlmApIDto } from './create-llm-ap-i.dto';
import { UpdateLlmApIDto } from './update-llm-ap-i.dto';

@ApiBearerAuth('BearerAuth')
@ApiTags('LlmApIS')
@Controller('llmApIS')
export class LlmApIController {
  constructor(
    private llmApIService: LlmApIService,
  ) {}


  /**
   * Get all llmApIs with pagination support.
   *
   * @param {Request} req - The Express request object.
   * @param {number} page - The page number for pagination (optional, default: 1).
   * @param {number} limit - The number of items per page (optional, default: 10).
   * @param {string} search - Optional search term for filtering llmApIs.
   * @returns {Promise<{ result: LlmApIModel[]; total: number }>} - The list of llmApIs and the total count.
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
  async getAllLlmApIS(
    @Req() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ): Promise<{ result: LlmApIModel[]; total: number }> {
    // Convert page and limit to numbers and ensure they are positive values
    const pageNumber = Math.max(1, Number(page));
    const itemsPerPage = Math.max(1, Number(limit));

    // Calculate the number of items to skip based on the current page and items per page
    const skip = (pageNumber - 1) * itemsPerPage;

    return this.llmApIService.getAllLlmApIS(
      req.user.userId,
      skip,
      itemsPerPage,
      search
    );
  }

  /**
   * Get llmApI data for dropdowns.
   *
   * @param {Request} req - The Express request object.
   * @param {string} fields - Comma-separated list of fields to retrieve (optional).
   * @param {string} keyword - The keyword for filtering data (optional).
   * @returns {Promise<LlmApIModel[]>} - The list of llmApI data for dropdowns.
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
  async getLlmApIDropdownData(
    @Req() req,
    @Query('fields') fields: string,
    @Query('keyword') keyword: string,
  ): Promise<LlmApIModel[]> {
    const fieldArray = fields ? fields.split(',') : [
      'id',
    ]
    return this.llmApIService.findAllDropdownData(
      req.user.userId,
      fieldArray, 
      keyword
    );
  }

  /**
   * Get a llmApI by ID.
   *
   * @param {Request} req - The Express request object.
   * @param {string} id - The id of the llmApI to retrieve.
   * @returns {Promise<LlmApIModel>} - The llmApI object.
   */
  @Get(':id')
  async getLlmApIById(
    @Req() req,
    @Param('id') id: string
  ): Promise<LlmApIModel> {
    return this.llmApIService.getLlmApIById(
      req.user.userId,
      id
    );
  }

  /**
   * Create a new llmApI.
   *
   * @param {Request} req - The Express request object.
   * @param {CreateLlmApIDto} createLlmApIDto - The DTO for creating a llmApI.
   * @returns {Promise<LlmApIModel>} - The newly created llmApI object.
   */
  @Post()
  async createLlmApI(
    @Req() req,
    @Body() createLlmApIDto: CreateLlmApIDto
  ): Promise<LlmApIModel> {
    return this.llmApIService.createLlmApI(
      req.user.userId,
      createLlmApIDto
    );
  }

  /**
   * Update an existing llmApI.
   *
   * @param {Request} req - The Express request object.
   * @param {string} id - The id of the llmApI to update.
   * @param {UpdateLlmApIDto} updateLlmApIDto - The DTO for updating a llmApI.
   * @returns {Promise<LlmApIModel>} - The updated llmApI object.
   */
  @Put(':id')
  async updateLlmApI(
    @Req() req,
    @Param('id') id: string,
    @Body() updateLlmApIDto: UpdateLlmApIDto,
  ): Promise<LlmApIModel> {
    return this.llmApIService.updateLlmApI(
      req.user.userId,
      id, 
      updateLlmApIDto
    );
  }


  /**
   * Delete a llmApI by ID.
   *
   * @param {Request} req - The Express request object.
   * @param {string} id - The id of the llmApI to delete.
   * @returns {Promise<void>}
   */
  @Delete(':id')
  async deleteLlmApI(
    @Req() req,
    @Param('id') id: string
  ): Promise<void> {
    return this.llmApIService.deleteLlmApI(
      req.user.userId,
      id
    );
  }
}
