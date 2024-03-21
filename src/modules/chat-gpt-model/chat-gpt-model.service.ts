import { Injectable, NotFoundException, BadRequestException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types, UpdateQuery } from 'mongoose';
import { convertArrayToObject, getPipelineStageForPagination } from 'src/shared/utils/common'
import { ChatGptModelModel } from './chat-gpt-model.model';
import { CreateChatGptModelDto } from './create-chat-gpt-model.dto';
import { UpdateChatGptModelDto } from './update-chat-gpt-model.dto';

@Injectable()
export class ChatGptModelService {
  constructor(
    @InjectModel(ChatGptModelModel.name)
    private readonly chatGptModelModel: Model<ChatGptModelModel>,
  ) {}

  /**
   * Retrieve a paginated list of chatGptModels.
   *
   *
   * @param {number} skip - The number of items to skip for pagination.
   * @param {number} take - The number of items to take per page for pagination.
   * @param {string} searchTerm - Optional search term for filter.
   * @returns {Promise<{ result: ChatGptModelModel[]; total: number }>} - The list of chatGptModels and the total count.
   */
  async getAllChatGptModels(
    
    skip: number,
    take: number,
    searchTerm?: string,
  ): Promise<{ result: ChatGptModelModel[]; total: number }> {
    try {
      const pipeline: PipelineStage[] = [
        {
          $lookup: {
            from: 'open_ai_keys',
            localField: 'apiKey', // Replace 'postId' with the field that represents the post ID in CommentModel
            foreignField: '_id',
            as: 'apiKey',
          },
        },
        {
          $unwind: {
            path: '$apiKey',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            modelName: 1,
                        modelVersion: 1,
                        apiKey: {
              _id: '$apiKey._id',
              apiKey: '$apiKey.apiKey',
            },
          },
        },
      ];

      if (searchTerm) {
        // Add a $match stage to filter results based on searchTerm
        pipeline.push({
          $match: {
            $or: [
              { modelName: { $regex: searchTerm, $options: 'i' } },
                            { modelVersion: { $regex: searchTerm, $options: 'i' } },
                            { 'apiKey.apiKey': { $regex: searchTerm, $options: 'i' } },
              // Add more fields as needed
            ],
          },
        });
      }

      pipeline.push(...getPipelineStageForPagination(skip, take))

      const [result] = await this.chatGptModelModel.aggregate(pipeline);

      // Extract the total count and matched documents from the aggregation result
      const total = result ? result.total : 0;
      const matchedComments = result ? result.result : [];

      return { result: matchedComments, total };

    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Get a chatGptModel by ID.
   *
   *
   * @param {string} id - The id of the chatGptModel to retrieve.
   * @returns {Promise<ChatGptModelModel>} - The chatGptModel object.
   * @throws {NotFoundException} - If the chatGptModel with the given id is not found.
   */
  async getChatGptModelById(id: string): Promise<ChatGptModelModel> {
    try {
      const chatGptModel = 
      await this.chatGptModelModel
      .findOne({ _id: new Types.ObjectId(id),  })
      .populate(
        [
          'apiKey',
        ]
      )
      .exec();
      if (!chatGptModel) {
        throw new NotFoundException('ChatGptModelModel not found');
      }
      return chatGptModel;
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Create a new chatGptModel.
   *
   *
   * @param {CreateChatGptModelDto} createChatGptModelDto - The DTO for creating a chatGptModel.
   * @returns {Promise<ChatGptModelModel>} - The newly created chatGptModel object.
   */
  async createChatGptModel(createChatGptModelDto: CreateChatGptModelDto): Promise<ChatGptModelModel> {
    try {
      const chatGptModel = new this.chatGptModelModel({
        modelName: createChatGptModelDto.modelName,
                modelVersion: createChatGptModelDto.modelVersion,
                apiKey: new Types.ObjectId(createChatGptModelDto.apiKeyId),
        
      });
      return chatGptModel.save();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Update an existing chatGptModel.
   *
   *
   * @param {string} id - The id of the chatGptModel to update.
   * @param {UpdateChatGptModelDto} updateChatGptModelDto - The DTO for updating a chatGptModel.
   * @returns {Promise<ChatGptModelModel>} - The updated chatGptModel object.
   * @throws {NotFoundException} - If the chatGptModel with the given id is not found.
   */
  async updateChatGptModel(id: string, updateChatGptModelDto: UpdateChatGptModelDto): Promise<ChatGptModelModel> {
    try {

      //TODO: Fix update
      const chatGptModel = await this.getChatGptModelById(id);

      if (!chatGptModel) {
        throw new NotFoundException(`${this.chatGptModelModel.modelName} not found`);
      }

      // Apply partial updates
      const update: UpdateQuery<ChatGptModelModel> = {};
      for (const field in updateChatGptModelDto) {
        if (updateChatGptModelDto.hasOwnProperty(field)) {
          update[field] = updateChatGptModelDto[field];
        }
      }

      // Save the updated document
      chatGptModel.set(update);
      return chatGptModel.save();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Delete a chatGptModel by its ID.
   *
   *
   * @param {string} id - The id of the chatGptModel to delete.
   * @returns {Promise<void>}
   * @throws {NotFoundException} - If the chatGptModel with the given ID is not found.
   */
  async deleteChatGptModel(id: string): Promise<void> {
    try {
      const chatGptModel = await this.getChatGptModelById(id);
      await chatGptModel.deleteOne();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Find chatGptModel data for dropdowns with optional filtering.
   *
   *
   * @param {string[]} fields - Comma-separated list of fields to retrieve.
   * @param {string} keyword - The keyword for filtering data.
   * @returns {Promise<ChatGptModelEntity[]>} - The list of chatGptModel data for dropdowns.
   */
  async findAllDropdownData(fields: string[], keyword: string): Promise<ChatGptModelModel[]> {
    try {
      const select = fields.reduce((obj, field) => {
        obj[field] = 1;
        return obj;
      }, {});

      const whereConditions = fields.map((field) => ({
        [field]: { $regex: new RegExp(keyword, 'i') }, // Case-insensitive search
      }));

      return await this.chatGptModelModel
        .find({  $or: whereConditions })
        .select(select)
        .limit(25)
        .exec();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

   /**
   * Retrieve a paginated list of chatGptModels by openAIKey.
   *
   *
   * @param {string} apiKeyId - The apiKeyId of the chatGptModel to retrieve.
   * @param {number} skip - The number of items to skip for pagination.
   * @param {number} take - The number of items to take per page for pagination.
   * @param {string} searchTerm - Optional search term for filter.
   * @returns {Promise<{ result: ChatGptModelModel[]; total: number }>} - The list of chatGptModels and the total count.
   */
  async getChatGptModelsByApiKeyId(
    
    apiKeyId: string,
    skip: number,
    take: number,
    searchTerm?: string,
  ): Promise<{ result: ChatGptModelModel[]; total: number }> {
    try {
      const pipeline: PipelineStage[] = [
        
        {
          $match: {
            apiKey: new Types.ObjectId(apiKeyId),
          },
        },
        {
          $project: {
            modelName: 1,
                        modelVersion: 1,
                      },
        },
      ];

      if (searchTerm) {
        // Add a $match stage to filter results based on searchTerm
        pipeline.push({
          $match: {
            $or: [
              { modelName: { $regex: searchTerm, $options: 'i' } },
                            { modelVersion: { $regex: searchTerm, $options: 'i' } },
                            // Add more fields as needed
            ],
          },
        });
      }

      pipeline.push(...getPipelineStageForPagination(skip, take))

      const [result] = await this.chatGptModelModel.aggregate(pipeline);

      // Extract the total count and matched documents from the aggregation result
      const total = result ? result.total : 0;
      const matchedComments = result ? result.result : [];

      return { result: matchedComments, total };

    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }
}
