import { Injectable, NotFoundException, BadRequestException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types, UpdateQuery } from 'mongoose';
import { convertArrayToObject, getPipelineStageForPagination } from 'src/shared/utils/common'
import { ExportedCodeModel } from './exported-code.model';
import { CreateExportedCodeDto } from './create-exported-code.dto';
import { UpdateExportedCodeDto } from './update-exported-code.dto';

@Injectable()
export class ExportedCodeService {
  constructor(
    @InjectModel(ExportedCodeModel.name)
    private readonly exportedCodeModel: Model<ExportedCodeModel>,
  ) {}

  /**
   * Retrieve a paginated list of exportedCodes for a specific user.
   *
   * @param {string} userId - The ID of the user whose exportedCodes to retrieve.
   * @param {number} skip - The number of items to skip for pagination.
   * @param {number} take - The number of items to take per page for pagination.
   * @param {string} searchTerm - Optional search term for filter.
   * @returns {Promise<{ result: ExportedCodeModel[]; total: number }>} - The list of exportedCodes and the total count.
   */
  async getAllExportedCodes(
    userId: string,
    skip: number,
    take: number,
    searchTerm?: string,
  ): Promise<{ result: ExportedCodeModel[]; total: number }> {
    try {
      const pipeline: PipelineStage[] = [
        {
          $match: {
            user: new Types.ObjectId(userId),
          },
        },
        {
          $project: {
            code: 1,
                      },
        },
      ];

      if (searchTerm) {
        // Add a $match stage to filter results based on searchTerm
        pipeline.push({
          $match: {
            $or: [
              { code: { $regex: searchTerm, $options: 'i' } },
                            // Add more fields as needed
            ],
          },
        });
      }

      pipeline.push(...getPipelineStageForPagination(skip, take))

      const [result] = await this.exportedCodeModel.aggregate(pipeline);

      // Extract the total count and matched documents from the aggregation result
      const total = result ? result.total : 0;
      const matchedComments = result ? result.result : [];

      return { result: matchedComments, total };

    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Get a exportedCode by ID for a specific user.
   *
   * @param {string} userId - The ID of the user whose exportedCodes to retrieve.
   * @param {string} id - The id of the exportedCode to retrieve.
   * @returns {Promise<ExportedCodeModel>} - The exportedCode object.
   * @throws {NotFoundException} - If the exportedCode with the given id is not found.
   */
  async getExportedCodeById(userId: string,id: string): Promise<ExportedCodeModel> {
    try {
      const exportedCode = 
      await this.exportedCodeModel
      .findOne({ _id: new Types.ObjectId(id), user: new Types.ObjectId(userId), })
      .populate(
        [
        ]
      )
      .exec();
      if (!exportedCode) {
        throw new NotFoundException('ExportedCodeModel not found');
      }
      return exportedCode;
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Create a new exportedCode for a specific user.
   *
   * @param {string} userId - The ID of the user whose exportedCodes to retrieve.
   * @param {CreateExportedCodeDto} createExportedCodeDto - The DTO for creating a exportedCode.
   * @returns {Promise<ExportedCodeModel>} - The newly created exportedCode object.
   */
  async createExportedCode(userId: string,createExportedCodeDto: CreateExportedCodeDto): Promise<ExportedCodeModel> {
    try {
      const exportedCode = new this.exportedCodeModel({
        code: createExportedCodeDto.code,
                user: new Types.ObjectId(userId), 
      });
      return exportedCode.save();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Update an existing exportedCode for a specific user.
   *
   * @param {string} userId - The ID of the user whose exportedCodes to retrieve.
   * @param {string} id - The id of the exportedCode to update.
   * @param {UpdateExportedCodeDto} updateExportedCodeDto - The DTO for updating a exportedCode.
   * @returns {Promise<ExportedCodeModel>} - The updated exportedCode object.
   * @throws {NotFoundException} - If the exportedCode with the given id is not found.
   */
  async updateExportedCode(userId: string,id: string, updateExportedCodeDto: UpdateExportedCodeDto): Promise<ExportedCodeModel> {
    try {

      //TODO: Fix update
      const exportedCode = await this.getExportedCodeById(userId, id);

      if (!exportedCode) {
        throw new NotFoundException(`${this.exportedCodeModel.modelName} not found`);
      }

      // Apply partial updates
      const update: UpdateQuery<ExportedCodeModel> = {};
      for (const field in updateExportedCodeDto) {
        if (updateExportedCodeDto.hasOwnProperty(field)) {
          update[field] = updateExportedCodeDto[field];
        }
      }

      // Save the updated document
      exportedCode.set(update);
      return exportedCode.save();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Delete a exportedCode for a specific user by its ID.
   *
   * @param {string} userId - The ID of the user whose exportedCodes to retrieve.
   * @param {string} id - The id of the exportedCode to delete.
   * @returns {Promise<void>}
   * @throws {NotFoundException} - If the exportedCode with the given ID is not found.
   */
  async deleteExportedCode(userId: string,id: string): Promise<void> {
    try {
      const exportedCode = await this.getExportedCodeById(userId,id);
      await exportedCode.deleteOne();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Find exportedCode data for dropdowns with optional filtering.
   *
   * @param {string} userId - The ID of the user whose exportedCodes to retrieve.
   * @param {string[]} fields - Comma-separated list of fields to retrieve.
   * @param {string} keyword - The keyword for filtering data.
   * @returns {Promise<ExportedCodeEntity[]>} - The list of exportedCode data for dropdowns.
   */
  async findAllDropdownData(userId: string,fields: string[], keyword: string): Promise<ExportedCodeModel[]> {
    try {
      const select = fields.reduce((obj, field) => {
        obj[field] = 1;
        return obj;
      }, {});

      const whereConditions = fields.map((field) => ({
        [field]: { $regex: new RegExp(keyword, 'i') }, // Case-insensitive search
      }));

      return await this.exportedCodeModel
        .find({ user: new Types.ObjectId(userId), $or: whereConditions })
        .select(select)
        .limit(25)
        .exec();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

}
