import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ChatGptModelService } from './chat-gpt-model.service';
import { ChatGptModelModel } from './chat-gpt-model.model';
import { CreateChatGptModelDto } from './create-chat-gpt-model.dto';
import { UpdateChatGptModelDto } from './update-chat-gpt-model.dto';

@ApiBearerAuth('BearerAuth')
@ApiTags('ChatGptModels')
@Controller('chatGptModels')
export class ChatGptModelController {
  constructor(
    private chatGptModelService: ChatGptModelService,
  ) {}


  /**
   * Get all chatGptModels with pagination support.
   *
   * 
   * @param {number} page - The page number for pagination (optional, default: 1).
   * @param {number} limit - The number of items per page (optional, default: 10).
   * @param {string} search - Optional search term for filtering chatGptModels.
   * @returns {Promise<{ result: ChatGptModelModel[]; total: number }>} - The list of chatGptModels and the total count.
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
  async getAllChatGptModels(
    
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ): Promise<{ result: ChatGptModelModel[]; total: number }> {
    // Convert page and limit to numbers and ensure they are positive values
    const pageNumber = Math.max(1, Number(page));
    const itemsPerPage = Math.max(1, Number(limit));

    // Calculate the number of items to skip based on the current page and items per page
    const skip = (pageNumber - 1) * itemsPerPage;

    return this.chatGptModelService.getAllChatGptModels(
      
      skip,
      itemsPerPage,
      search
    );
  }

  /**
   * Get chatGptModel data for dropdowns.
   *
   * 
   * @param {string} fields - Comma-separated list of fields to retrieve (optional).
   * @param {string} keyword - The keyword for filtering data (optional).
   * @returns {Promise<ChatGptModelModel[]>} - The list of chatGptModel data for dropdowns.
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
  async getChatGptModelDropdownData(
    
    @Query('fields') fields: string,
    @Query('keyword') keyword: string,
  ): Promise<ChatGptModelModel[]> {
    const fieldArray = fields ? fields.split(',') : [
      'id',
    ]
    return this.chatGptModelService.findAllDropdownData(
      
      fieldArray, 
      keyword
    );
  }

  /**
   * Get a chatGptModel by ID.
   *
   * 
   * @param {string} id - The id of the chatGptModel to retrieve.
   * @returns {Promise<ChatGptModelModel>} - The chatGptModel object.
   */
  @Get(':id')
  async getChatGptModelById(
    
    @Param('id') id: string
  ): Promise<ChatGptModelModel> {
    return this.chatGptModelService.getChatGptModelById(
      
      id
    );
  }

  /**
   * Create a new chatGptModel.
   *
   * 
   * @param {CreateChatGptModelDto} createChatGptModelDto - The DTO for creating a chatGptModel.
   * @returns {Promise<ChatGptModelModel>} - The newly created chatGptModel object.
   */
  @Post()
  async createChatGptModel(
    
    @Body() createChatGptModelDto: CreateChatGptModelDto
  ): Promise<ChatGptModelModel> {
    return this.chatGptModelService.createChatGptModel(
      
      createChatGptModelDto
    );
  }

  /**
   * Update an existing chatGptModel.
   *
   * 
   * @param {string} id - The id of the chatGptModel to update.
   * @param {UpdateChatGptModelDto} updateChatGptModelDto - The DTO for updating a chatGptModel.
   * @returns {Promise<ChatGptModelModel>} - The updated chatGptModel object.
   */
  @Put(':id')
  async updateChatGptModel(
    
    @Param('id') id: string,
    @Body() updateChatGptModelDto: UpdateChatGptModelDto,
  ): Promise<ChatGptModelModel> {
    return this.chatGptModelService.updateChatGptModel(
      
      id, 
      updateChatGptModelDto
    );
  }


  /**
   * Delete a chatGptModel by ID.
   *
   * 
   * @param {string} id - The id of the chatGptModel to delete.
   * @returns {Promise<void>}
   */
  @Delete(':id')
  async deleteChatGptModel(
    
    @Param('id') id: string
  ): Promise<void> {
    return this.chatGptModelService.deleteChatGptModel(
      
      id
    );
  }
}
