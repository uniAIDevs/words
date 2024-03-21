import { Injectable, NotFoundException, BadRequestException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types, UpdateQuery } from 'mongoose';
import { convertArrayToObject, getPipelineStageForPagination } from 'src/shared/utils/common'
import { LlmApIModel } from './llm-ap-i.model';
import { CreateLlmApIDto } from './create-llm-ap-i.dto';
import { UpdateLlmApIDto } from './update-llm-ap-i.dto';

@Injectable()
export class LlmApIService {
  constructor(
    @InjectModel(LlmApIModel.name)
    private readonly llmApIModel: Model<LlmApIModel>,
  ) {}

  /**
   * Retrieve a paginated list of llmApIs for a specific user.
   *
   * @param {string} userId - The ID of the user whose llmApIs to retrieve.
   * @param {number} skip - The number of items to skip for pagination.
   * @param {number} take - The number of items to take per page for pagination.
   * @param {string} searchTerm - Optional search term for filter.
   * @returns {Promise<{ result: LlmApIModel[]; total: number }>} - The list of llmApIs and the total count.
   */
  async getAllLlmApIS(
    userId: string,
    skip: number,
    take: number,
    searchTerm?: string,
  ): Promise<{ result: LlmApIModel[]; total: number }> {
    try {
      const pipeline: PipelineStage[] = [
        {
          $match: {
            user: new Types.ObjectId(userId),
          },
        },
        {
          $project: {
            name: 1,
                        endpoint: 1,
                      },
        },
      ];

      if (searchTerm) {
        // Add a $match stage to filter results based on searchTerm
        pipeline.push({
          $match: {
            $or: [
              { name: { $regex: searchTerm, $options: 'i' } },
                            { endpoint: { $regex: searchTerm, $options: 'i' } },
                            // Add more fields as needed
            ],
          },
        });
      }

      pipeline.push(...getPipelineStageForPagination(skip, take))

      const [result] = await this.llmApIModel.aggregate(pipeline);

      // Extract the total count and matched documents from the aggregation result
      const total = result ? result.total : 0;
      const matchedComments = result ? result.result : [];

      return { result: matchedComments, total };

    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Get a llmApI by ID for a specific user.
   *
   * @param {string} userId - The ID of the user whose llmApIs to retrieve.
   * @param {string} id - The id of the llmApI to retrieve.
   * @returns {Promise<LlmApIModel>} - The llmApI object.
   * @throws {NotFoundException} - If the llmApI with the given id is not found.
   */
  async getLlmApIById(userId: string,id: string): Promise<LlmApIModel> {
    try {
      const llmApI = 
      await this.llmApIModel
      .findOne({ _id: new Types.ObjectId(id), user: new Types.ObjectId(userId), })
      .populate(
        [
        ]
      )
      .exec();
      if (!llmApI) {
        throw new NotFoundException('LlmApIModel not found');
      }
      return llmApI;
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Create a new llmApI for a specific user.
   *
   * @param {string} userId - The ID of the user whose llmApIs to retrieve.
   * @param {CreateLlmApIDto} createLlmApIDto - The DTO for creating a llmApI.
   * @returns {Promise<LlmApIModel>} - The newly created llmApI object.
   */
  async createLlmApI(userId: string,createLlmApIDto: CreateLlmApIDto): Promise<LlmApIModel> {
    try {
      const llmApI = new this.llmApIModel({
        name: createLlmApIDto.name,
                endpoint: createLlmApIDto.endpoint,
                user: new Types.ObjectId(userId), 
      });
      return llmApI.save();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Update an existing llmApI for a specific user.
   *
   * @param {string} userId - The ID of the user whose llmApIs to retrieve.
   * @param {string} id - The id of the llmApI to update.
   * @param {UpdateLlmApIDto} updateLlmApIDto - The DTO for updating a llmApI.
   * @returns {Promise<LlmApIModel>} - The updated llmApI object.
   * @throws {NotFoundException} - If the llmApI with the given id is not found.
   */
  async updateLlmApI(userId: string,id: string, updateLlmApIDto: UpdateLlmApIDto): Promise<LlmApIModel> {
    try {

      //TODO: Fix update
      const llmApI = await this.getLlmApIById(userId, id);

      if (!llmApI) {
        throw new NotFoundException(`${this.llmApIModel.modelName} not found`);
      }

      // Apply partial updates
      const update: UpdateQuery<LlmApIModel> = {};
      for (const field in updateLlmApIDto) {
        if (updateLlmApIDto.hasOwnProperty(field)) {
          update[field] = updateLlmApIDto[field];
        }
      }

      // Save the updated document
      llmApI.set(update);
      return llmApI.save();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Delete a llmApI for a specific user by its ID.
   *
   * @param {string} userId - The ID of the user whose llmApIs to retrieve.
   * @param {string} id - The id of the llmApI to delete.
   * @returns {Promise<void>}
   * @throws {NotFoundException} - If the llmApI with the given ID is not found.
   */
  async deleteLlmApI(userId: string,id: string): Promise<void> {
    try {
      const llmApI = await this.getLlmApIById(userId,id);
      await llmApI.deleteOne();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Find llmApI data for dropdowns with optional filtering.
   *
   * @param {string} userId - The ID of the user whose llmApIs to retrieve.
   * @param {string[]} fields - Comma-separated list of fields to retrieve.
   * @param {string} keyword - The keyword for filtering data.
   * @returns {Promise<LlmApIEntity[]>} - The list of llmApI data for dropdowns.
   */
  async findAllDropdownData(userId: string,fields: string[], keyword: string): Promise<LlmApIModel[]> {
    try {
      const select = fields.reduce((obj, field) => {
        obj[field] = 1;
        return obj;
      }, {});

      const whereConditions = fields.map((field) => ({
        [field]: { $regex: new RegExp(keyword, 'i') }, // Case-insensitive search
      }));

      return await this.llmApIModel
        .find({ user: new Types.ObjectId(userId), $or: whereConditions })
        .select(select)
        .limit(25)
        .exec();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

}
