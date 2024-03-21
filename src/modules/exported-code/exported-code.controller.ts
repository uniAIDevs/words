import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ExportedCodeService } from './exported-code.service';
import { ExportedCodeModel } from './exported-code.model';
import { CreateExportedCodeDto } from './create-exported-code.dto';
import { UpdateExportedCodeDto } from './update-exported-code.dto';

@ApiBearerAuth('BearerAuth')
@ApiTags('ExportedCodes')
@Controller('exportedCodes')
export class ExportedCodeController {
  constructor(
    private exportedCodeService: ExportedCodeService,
  ) {}


  /**
   * Get all exportedCodes with pagination support.
   *
   * @param {Request} req - The Express request object.
   * @param {number} page - The page number for pagination (optional, default: 1).
   * @param {number} limit - The number of items per page (optional, default: 10).
   * @param {string} search - Optional search term for filtering exportedCodes.
   * @returns {Promise<{ result: ExportedCodeModel[]; total: number }>} - The list of exportedCodes and the total count.
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
  async getAllExportedCodes(
    @Req() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ): Promise<{ result: ExportedCodeModel[]; total: number }> {
    // Convert page and limit to numbers and ensure they are positive values
    const pageNumber = Math.max(1, Number(page));
    const itemsPerPage = Math.max(1, Number(limit));

    // Calculate the number of items to skip based on the current page and items per page
    const skip = (pageNumber - 1) * itemsPerPage;

    return this.exportedCodeService.getAllExportedCodes(
      req.user.userId,
      skip,
      itemsPerPage,
      search
    );
  }

  /**
   * Get exportedCode data for dropdowns.
   *
   * @param {Request} req - The Express request object.
   * @param {string} fields - Comma-separated list of fields to retrieve (optional).
   * @param {string} keyword - The keyword for filtering data (optional).
   * @returns {Promise<ExportedCodeModel[]>} - The list of exportedCode data for dropdowns.
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
  async getExportedCodeDropdownData(
    @Req() req,
    @Query('fields') fields: string,
    @Query('keyword') keyword: string,
  ): Promise<ExportedCodeModel[]> {
    const fieldArray = fields ? fields.split(',') : [
      'id',
    ]
    return this.exportedCodeService.findAllDropdownData(
      req.user.userId,
      fieldArray, 
      keyword
    );
  }

  /**
   * Get a exportedCode by ID.
   *
   * @param {Request} req - The Express request object.
   * @param {string} id - The id of the exportedCode to retrieve.
   * @returns {Promise<ExportedCodeModel>} - The exportedCode object.
   */
  @Get(':id')
  async getExportedCodeById(
    @Req() req,
    @Param('id') id: string
  ): Promise<ExportedCodeModel> {
    return this.exportedCodeService.getExportedCodeById(
      req.user.userId,
      id
    );
  }

  /**
   * Create a new exportedCode.
   *
   * @param {Request} req - The Express request object.
   * @param {CreateExportedCodeDto} createExportedCodeDto - The DTO for creating a exportedCode.
   * @returns {Promise<ExportedCodeModel>} - The newly created exportedCode object.
   */
  @Post()
  async createExportedCode(
    @Req() req,
    @Body() createExportedCodeDto: CreateExportedCodeDto
  ): Promise<ExportedCodeModel> {
    return this.exportedCodeService.createExportedCode(
      req.user.userId,
      createExportedCodeDto
    );
  }

  /**
   * Update an existing exportedCode.
   *
   * @param {Request} req - The Express request object.
   * @param {string} id - The id of the exportedCode to update.
   * @param {UpdateExportedCodeDto} updateExportedCodeDto - The DTO for updating a exportedCode.
   * @returns {Promise<ExportedCodeModel>} - The updated exportedCode object.
   */
  @Put(':id')
  async updateExportedCode(
    @Req() req,
    @Param('id') id: string,
    @Body() updateExportedCodeDto: UpdateExportedCodeDto,
  ): Promise<ExportedCodeModel> {
    return this.exportedCodeService.updateExportedCode(
      req.user.userId,
      id, 
      updateExportedCodeDto
    );
  }


  /**
   * Delete a exportedCode by ID.
   *
   * @param {Request} req - The Express request object.
   * @param {string} id - The id of the exportedCode to delete.
   * @returns {Promise<void>}
   */
  @Delete(':id')
  async deleteExportedCode(
    @Req() req,
    @Param('id') id: string
  ): Promise<void> {
    return this.exportedCodeService.deleteExportedCode(
      req.user.userId,
      id
    );
  }
}
