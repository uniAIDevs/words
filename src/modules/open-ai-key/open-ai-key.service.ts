import { Injectable, NotFoundException, BadRequestException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types, UpdateQuery } from 'mongoose';
import { convertArrayToObject, getPipelineStageForPagination } from 'src/shared/utils/common'
import { OpenAiKeyModel } from './open-ai-key.model';
import { CreateOpenAiKeyDto } from './create-open-ai-key.dto';
import { UpdateOpenAiKeyDto } from './update-open-ai-key.dto';

@Injectable()
export class OpenAiKeyService {
  constructor(
    @InjectModel(OpenAiKeyModel.name)
    private readonly openAiKeyModel: Model<OpenAiKeyModel>,
  ) {}

  /**
   * Retrieve a paginated list of openAiKeys for a specific user.
   *
   * @param {string} userId - The ID of the user whose openAiKeys to retrieve.
   * @param {number} skip - The number of items to skip for pagination.
   * @param {number} take - The number of items to take per page for pagination.
   * @param {string} searchTerm - Optional search term for filter.
   * @returns {Promise<{ result: OpenAiKeyModel[]; total: number }>} - The list of openAiKeys and the total count.
   */
  async getAllOpenAiKeys(
    userId: string,
    skip: number,
    take: number,
    searchTerm?: string,
  ): Promise<{ result: OpenAiKeyModel[]; total: number }> {
    try {
      const pipeline: PipelineStage[] = [
        {
          $match: {
            user: new Types.ObjectId(userId),
          },
        },
        {
          $project: {
            apiKey: 1,
                      },
        },
      ];

      if (searchTerm) {
        // Add a $match stage to filter results based on searchTerm
        pipeline.push({
          $match: {
            $or: [
              { apiKey: { $regex: searchTerm, $options: 'i' } },
                            // Add more fields as needed
            ],
          },
        });
      }

      pipeline.push(...getPipelineStageForPagination(skip, take))

      const [result] = await this.openAiKeyModel.aggregate(pipeline);

      // Extract the total count and matched documents from the aggregation result
      const total = result ? result.total : 0;
      const matchedComments = result ? result.result : [];

      return { result: matchedComments, total };

    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Get a openAiKey by ID for a specific user.
   *
   * @param {string} userId - The ID of the user whose openAiKeys to retrieve.
   * @param {string} id - The id of the openAiKey to retrieve.
   * @returns {Promise<OpenAiKeyModel>} - The openAiKey object.
   * @throws {NotFoundException} - If the openAiKey with the given id is not found.
   */
  async getOpenAiKeyById(userId: string,id: string): Promise<OpenAiKeyModel> {
    try {
      const openAiKey = 
      await this.openAiKeyModel
      .findOne({ _id: new Types.ObjectId(id), user: new Types.ObjectId(userId), })
      .populate(
        [
        ]
      )
      .exec();
      if (!openAiKey) {
        throw new NotFoundException('OpenAiKeyModel not found');
      }
      return openAiKey;
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Create a new openAiKey for a specific user.
   *
   * @param {string} userId - The ID of the user whose openAiKeys to retrieve.
   * @param {CreateOpenAiKeyDto} createOpenAiKeyDto - The DTO for creating a openAiKey.
   * @returns {Promise<OpenAiKeyModel>} - The newly created openAiKey object.
   */
  async createOpenAiKey(userId: string,createOpenAiKeyDto: CreateOpenAiKeyDto): Promise<OpenAiKeyModel> {
    try {
      const openAiKey = new this.openAiKeyModel({
        apiKey: createOpenAiKeyDto.apiKey,
                user: new Types.ObjectId(userId), 
      });
      return openAiKey.save();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Update an existing openAiKey for a specific user.
   *
   * @param {string} userId - The ID of the user whose openAiKeys to retrieve.
   * @param {string} id - The id of the openAiKey to update.
   * @param {UpdateOpenAiKeyDto} updateOpenAiKeyDto - The DTO for updating a openAiKey.
   * @returns {Promise<OpenAiKeyModel>} - The updated openAiKey object.
   * @throws {NotFoundException} - If the openAiKey with the given id is not found.
   */
  async updateOpenAiKey(userId: string,id: string, updateOpenAiKeyDto: UpdateOpenAiKeyDto): Promise<OpenAiKeyModel> {
    try {

      //TODO: Fix update
      const openAiKey = await this.getOpenAiKeyById(userId, id);

      if (!openAiKey) {
        throw new NotFoundException(`${this.openAiKeyModel.modelName} not found`);
      }

      // Apply partial updates
      const update: UpdateQuery<OpenAiKeyModel> = {};
      for (const field in updateOpenAiKeyDto) {
        if (updateOpenAiKeyDto.hasOwnProperty(field)) {
          update[field] = updateOpenAiKeyDto[field];
        }
      }

      // Save the updated document
      openAiKey.set(update);
      return openAiKey.save();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Delete a openAiKey for a specific user by its ID.
   *
   * @param {string} userId - The ID of the user whose openAiKeys to retrieve.
   * @param {string} id - The id of the openAiKey to delete.
   * @returns {Promise<void>}
   * @throws {NotFoundException} - If the openAiKey with the given ID is not found.
   */
  async deleteOpenAiKey(userId: string,id: string): Promise<void> {
    try {
      const openAiKey = await this.getOpenAiKeyById(userId,id);
      await openAiKey.deleteOne();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Find openAiKey data for dropdowns with optional filtering.
   *
   * @param {string} userId - The ID of the user whose openAiKeys to retrieve.
   * @param {string[]} fields - Comma-separated list of fields to retrieve.
   * @param {string} keyword - The keyword for filtering data.
   * @returns {Promise<OpenAiKeyEntity[]>} - The list of openAiKey data for dropdowns.
   */
  async findAllDropdownData(userId: string,fields: string[], keyword: string): Promise<OpenAiKeyModel[]> {
    try {
      const select = fields.reduce((obj, field) => {
        obj[field] = 1;
        return obj;
      }, {});

      const whereConditions = fields.map((field) => ({
        [field]: { $regex: new RegExp(keyword, 'i') }, // Case-insensitive search
      }));

      return await this.openAiKeyModel
        .find({ user: new Types.ObjectId(userId), $or: whereConditions })
        .select(select)
        .limit(25)
        .exec();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

}
