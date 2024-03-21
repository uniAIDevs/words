import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { OpenAiKeyService } from './open-ai-key.service';
import { OpenAiKeyModel } from './open-ai-key.model';
import { CreateOpenAiKeyDto } from './create-open-ai-key.dto';
import { UpdateOpenAiKeyDto } from './update-open-ai-key.dto';

@ApiBearerAuth('BearerAuth')
@ApiTags('OpenAiKeys')
@Controller('openAiKeys')
export class OpenAiKeyController {
  constructor(
    private openAiKeyService: OpenAiKeyService,
  ) {}


  /**
   * Get all openAiKeys with pagination support.
   *
   * @param {Request} req - The Express request object.
   * @param {number} page - The page number for pagination (optional, default: 1).
   * @param {number} limit - The number of items per page (optional, default: 10).
   * @param {string} search - Optional search term for filtering openAiKeys.
   * @returns {Promise<{ result: OpenAiKeyModel[]; total: number }>} - The list of openAiKeys and the total count.
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
  async getAllOpenAiKeys(
    @Req() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ): Promise<{ result: OpenAiKeyModel[]; total: number }> {
    // Convert page and limit to numbers and ensure they are positive values
    const pageNumber = Math.max(1, Number(page));
    const itemsPerPage = Math.max(1, Number(limit));

    // Calculate the number of items to skip based on the current page and items per page
    const skip = (pageNumber - 1) * itemsPerPage;

    return this.openAiKeyService.getAllOpenAiKeys(
      req.user.userId,
      skip,
      itemsPerPage,
      search
    );
  }

  /**
   * Get openAiKey data for dropdowns.
   *
   * @param {Request} req - The Express request object.
   * @param {string} fields - Comma-separated list of fields to retrieve (optional).
   * @param {string} keyword - The keyword for filtering data (optional).
   * @returns {Promise<OpenAiKeyModel[]>} - The list of openAiKey data for dropdowns.
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
  async getOpenAiKeyDropdownData(
    @Req() req,
    @Query('fields') fields: string,
    @Query('keyword') keyword: string,
  ): Promise<OpenAiKeyModel[]> {
    const fieldArray = fields ? fields.split(',') : [
      'id',
    ]
    return this.openAiKeyService.findAllDropdownData(
      req.user.userId,
      fieldArray, 
      keyword
    );
  }

  /**
   * Get a openAiKey by ID.
   *
   * @param {Request} req - The Express request object.
   * @param {string} id - The id of the openAiKey to retrieve.
   * @returns {Promise<OpenAiKeyModel>} - The openAiKey object.
   */
  @Get(':id')
  async getOpenAiKeyById(
    @Req() req,
    @Param('id') id: string
  ): Promise<OpenAiKeyModel> {
    return this.openAiKeyService.getOpenAiKeyById(
      req.user.userId,
      id
    );
  }

  /**
   * Create a new openAiKey.
   *
   * @param {Request} req - The Express request object.
   * @param {CreateOpenAiKeyDto} createOpenAiKeyDto - The DTO for creating a openAiKey.
   * @returns {Promise<OpenAiKeyModel>} - The newly created openAiKey object.
   */
  @Post()
  async createOpenAiKey(
    @Req() req,
    @Body() createOpenAiKeyDto: CreateOpenAiKeyDto
  ): Promise<OpenAiKeyModel> {
    return this.openAiKeyService.createOpenAiKey(
      req.user.userId,
      createOpenAiKeyDto
    );
  }

  /**
   * Update an existing openAiKey.
   *
   * @param {Request} req - The Express request object.
   * @param {string} id - The id of the openAiKey to update.
   * @param {UpdateOpenAiKeyDto} updateOpenAiKeyDto - The DTO for updating a openAiKey.
   * @returns {Promise<OpenAiKeyModel>} - The updated openAiKey object.
   */
  @Put(':id')
  async updateOpenAiKey(
    @Req() req,
    @Param('id') id: string,
    @Body() updateOpenAiKeyDto: UpdateOpenAiKeyDto,
  ): Promise<OpenAiKeyModel> {
    return this.openAiKeyService.updateOpenAiKey(
      req.user.userId,
      id, 
      updateOpenAiKeyDto
    );
  }


  /**
   * Delete a openAiKey by ID.
   *
   * @param {Request} req - The Express request object.
   * @param {string} id - The id of the openAiKey to delete.
   * @returns {Promise<void>}
   */
  @Delete(':id')
  async deleteOpenAiKey(
    @Req() req,
    @Param('id') id: string
  ): Promise<void> {
    return this.openAiKeyService.deleteOpenAiKey(
      req.user.userId,
      id
    );
  }
}
