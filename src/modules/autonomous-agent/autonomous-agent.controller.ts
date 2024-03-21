import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { AutonomousAgentService } from './autonomous-agent.service';
import { AutonomousAgentModel } from './autonomous-agent.model';
import { CreateAutonomousAgentDto } from './create-autonomous-agent.dto';
import { UpdateAutonomousAgentDto } from './update-autonomous-agent.dto';

@ApiBearerAuth('BearerAuth')
@ApiTags('AutonomousAgents')
@Controller('autonomousAgents')
export class AutonomousAgentController {
  constructor(
    private autonomousAgentService: AutonomousAgentService,
  ) {}


  /**
   * Get all autonomousAgents with pagination support.
   *
   * @param {Request} req - The Express request object.
   * @param {number} page - The page number for pagination (optional, default: 1).
   * @param {number} limit - The number of items per page (optional, default: 10).
   * @param {string} search - Optional search term for filtering autonomousAgents.
   * @returns {Promise<{ result: AutonomousAgentModel[]; total: number }>} - The list of autonomousAgents and the total count.
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
  async getAllAutonomousAgents(
    @Req() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ): Promise<{ result: AutonomousAgentModel[]; total: number }> {
    // Convert page and limit to numbers and ensure they are positive values
    const pageNumber = Math.max(1, Number(page));
    const itemsPerPage = Math.max(1, Number(limit));

    // Calculate the number of items to skip based on the current page and items per page
    const skip = (pageNumber - 1) * itemsPerPage;

    return this.autonomousAgentService.getAllAutonomousAgents(
      req.user.userId,
      skip,
      itemsPerPage,
      search
    );
  }

  /**
   * Get autonomousAgent data for dropdowns.
   *
   * @param {Request} req - The Express request object.
   * @param {string} fields - Comma-separated list of fields to retrieve (optional).
   * @param {string} keyword - The keyword for filtering data (optional).
   * @returns {Promise<AutonomousAgentModel[]>} - The list of autonomousAgent data for dropdowns.
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
  async getAutonomousAgentDropdownData(
    @Req() req,
    @Query('fields') fields: string,
    @Query('keyword') keyword: string,
  ): Promise<AutonomousAgentModel[]> {
    const fieldArray = fields ? fields.split(',') : [
      'id',
    ]
    return this.autonomousAgentService.findAllDropdownData(
      req.user.userId,
      fieldArray, 
      keyword
    );
  }

  /**
   * Get a autonomousAgent by ID.
   *
   * @param {Request} req - The Express request object.
   * @param {string} id - The id of the autonomousAgent to retrieve.
   * @returns {Promise<AutonomousAgentModel>} - The autonomousAgent object.
   */
  @Get(':id')
  async getAutonomousAgentById(
    @Req() req,
    @Param('id') id: string
  ): Promise<AutonomousAgentModel> {
    return this.autonomousAgentService.getAutonomousAgentById(
      req.user.userId,
      id
    );
  }

  /**
   * Create a new autonomousAgent.
   *
   * @param {Request} req - The Express request object.
   * @param {CreateAutonomousAgentDto} createAutonomousAgentDto - The DTO for creating a autonomousAgent.
   * @returns {Promise<AutonomousAgentModel>} - The newly created autonomousAgent object.
   */
  @Post()
  async createAutonomousAgent(
    @Req() req,
    @Body() createAutonomousAgentDto: CreateAutonomousAgentDto
  ): Promise<AutonomousAgentModel> {
    return this.autonomousAgentService.createAutonomousAgent(
      req.user.userId,
      createAutonomousAgentDto
    );
  }

  /**
   * Update an existing autonomousAgent.
   *
   * @param {Request} req - The Express request object.
   * @param {string} id - The id of the autonomousAgent to update.
   * @param {UpdateAutonomousAgentDto} updateAutonomousAgentDto - The DTO for updating a autonomousAgent.
   * @returns {Promise<AutonomousAgentModel>} - The updated autonomousAgent object.
   */
  @Put(':id')
  async updateAutonomousAgent(
    @Req() req,
    @Param('id') id: string,
    @Body() updateAutonomousAgentDto: UpdateAutonomousAgentDto,
  ): Promise<AutonomousAgentModel> {
    return this.autonomousAgentService.updateAutonomousAgent(
      req.user.userId,
      id, 
      updateAutonomousAgentDto
    );
  }


  /**
   * Delete a autonomousAgent by ID.
   *
   * @param {Request} req - The Express request object.
   * @param {string} id - The id of the autonomousAgent to delete.
   * @returns {Promise<void>}
   */
  @Delete(':id')
  async deleteAutonomousAgent(
    @Req() req,
    @Param('id') id: string
  ): Promise<void> {
    return this.autonomousAgentService.deleteAutonomousAgent(
      req.user.userId,
      id
    );
  }
}
