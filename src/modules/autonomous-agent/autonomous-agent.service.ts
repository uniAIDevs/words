import { Injectable, NotFoundException, BadRequestException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types, UpdateQuery } from 'mongoose';
import { convertArrayToObject, getPipelineStageForPagination } from 'src/shared/utils/common'
import { AutonomousAgentModel } from './autonomous-agent.model';
import { CreateAutonomousAgentDto } from './create-autonomous-agent.dto';
import { UpdateAutonomousAgentDto } from './update-autonomous-agent.dto';

@Injectable()
export class AutonomousAgentService {
  constructor(
    @InjectModel(AutonomousAgentModel.name)
    private readonly autonomousAgentModel: Model<AutonomousAgentModel>,
  ) {}

  /**
   * Retrieve a paginated list of autonomousAgents for a specific user.
   *
   * @param {string} userId - The ID of the user whose autonomousAgents to retrieve.
   * @param {number} skip - The number of items to skip for pagination.
   * @param {number} take - The number of items to take per page for pagination.
   * @param {string} searchTerm - Optional search term for filter.
   * @returns {Promise<{ result: AutonomousAgentModel[]; total: number }>} - The list of autonomousAgents and the total count.
   */
  async getAllAutonomousAgents(
    userId: string,
    skip: number,
    take: number,
    searchTerm?: string,
  ): Promise<{ result: AutonomousAgentModel[]; total: number }> {
    try {
      const pipeline: PipelineStage[] = [
        {
          $match: {
            user: new Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: 'llm_apis',
            localField: 'llm', // Replace 'postId' with the field that represents the post ID in CommentModel
            foreignField: '_id',
            as: 'llm',
          },
        },
        {
          $unwind: {
            path: '$llm',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            name: 1,
                        llm: {
              _id: '$llm._id',
              name: '$llm.name',
            },
          },
        },
      ];

      if (searchTerm) {
        // Add a $match stage to filter results based on searchTerm
        pipeline.push({
          $match: {
            $or: [
              { name: { $regex: searchTerm, $options: 'i' } },
                            { 'llm.name': { $regex: searchTerm, $options: 'i' } },
              // Add more fields as needed
            ],
          },
        });
      }

      pipeline.push(...getPipelineStageForPagination(skip, take))

      const [result] = await this.autonomousAgentModel.aggregate(pipeline);

      // Extract the total count and matched documents from the aggregation result
      const total = result ? result.total : 0;
      const matchedComments = result ? result.result : [];

      return { result: matchedComments, total };

    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Get a autonomousAgent by ID for a specific user.
   *
   * @param {string} userId - The ID of the user whose autonomousAgents to retrieve.
   * @param {string} id - The id of the autonomousAgent to retrieve.
   * @returns {Promise<AutonomousAgentModel>} - The autonomousAgent object.
   * @throws {NotFoundException} - If the autonomousAgent with the given id is not found.
   */
  async getAutonomousAgentById(userId: string,id: string): Promise<AutonomousAgentModel> {
    try {
      const autonomousAgent = 
      await this.autonomousAgentModel
      .findOne({ _id: new Types.ObjectId(id), user: new Types.ObjectId(userId), })
      .populate(
        [
          'llm',
        ]
      )
      .exec();
      if (!autonomousAgent) {
        throw new NotFoundException('AutonomousAgentModel not found');
      }
      return autonomousAgent;
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Create a new autonomousAgent for a specific user.
   *
   * @param {string} userId - The ID of the user whose autonomousAgents to retrieve.
   * @param {CreateAutonomousAgentDto} createAutonomousAgentDto - The DTO for creating a autonomousAgent.
   * @returns {Promise<AutonomousAgentModel>} - The newly created autonomousAgent object.
   */
  async createAutonomousAgent(userId: string,createAutonomousAgentDto: CreateAutonomousAgentDto): Promise<AutonomousAgentModel> {
    try {
      const autonomousAgent = new this.autonomousAgentModel({
        name: createAutonomousAgentDto.name,
                llm: new Types.ObjectId(createAutonomousAgentDto.llmId),
        user: new Types.ObjectId(userId), 
      });
      return autonomousAgent.save();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Update an existing autonomousAgent for a specific user.
   *
   * @param {string} userId - The ID of the user whose autonomousAgents to retrieve.
   * @param {string} id - The id of the autonomousAgent to update.
   * @param {UpdateAutonomousAgentDto} updateAutonomousAgentDto - The DTO for updating a autonomousAgent.
   * @returns {Promise<AutonomousAgentModel>} - The updated autonomousAgent object.
   * @throws {NotFoundException} - If the autonomousAgent with the given id is not found.
   */
  async updateAutonomousAgent(userId: string,id: string, updateAutonomousAgentDto: UpdateAutonomousAgentDto): Promise<AutonomousAgentModel> {
    try {

      //TODO: Fix update
      const autonomousAgent = await this.getAutonomousAgentById(userId, id);

      if (!autonomousAgent) {
        throw new NotFoundException(`${this.autonomousAgentModel.modelName} not found`);
      }

      // Apply partial updates
      const update: UpdateQuery<AutonomousAgentModel> = {};
      for (const field in updateAutonomousAgentDto) {
        if (updateAutonomousAgentDto.hasOwnProperty(field)) {
          update[field] = updateAutonomousAgentDto[field];
        }
      }

      // Save the updated document
      autonomousAgent.set(update);
      return autonomousAgent.save();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Delete a autonomousAgent for a specific user by its ID.
   *
   * @param {string} userId - The ID of the user whose autonomousAgents to retrieve.
   * @param {string} id - The id of the autonomousAgent to delete.
   * @returns {Promise<void>}
   * @throws {NotFoundException} - If the autonomousAgent with the given ID is not found.
   */
  async deleteAutonomousAgent(userId: string,id: string): Promise<void> {
    try {
      const autonomousAgent = await this.getAutonomousAgentById(userId,id);
      await autonomousAgent.deleteOne();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Find autonomousAgent data for dropdowns with optional filtering.
   *
   * @param {string} userId - The ID of the user whose autonomousAgents to retrieve.
   * @param {string[]} fields - Comma-separated list of fields to retrieve.
   * @param {string} keyword - The keyword for filtering data.
   * @returns {Promise<AutonomousAgentEntity[]>} - The list of autonomousAgent data for dropdowns.
   */
  async findAllDropdownData(userId: string,fields: string[], keyword: string): Promise<AutonomousAgentModel[]> {
    try {
      const select = fields.reduce((obj, field) => {
        obj[field] = 1;
        return obj;
      }, {});

      const whereConditions = fields.map((field) => ({
        [field]: { $regex: new RegExp(keyword, 'i') }, // Case-insensitive search
      }));

      return await this.autonomousAgentModel
        .find({ user: new Types.ObjectId(userId), $or: whereConditions })
        .select(select)
        .limit(25)
        .exec();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

   /**
   * Retrieve a paginated list of autonomousAgents by llmAPI.
   *
   * @param {string} userId - The ID of the user whose autonomousAgents to retrieve.
   * @param {string} llmId - The llmId of the autonomousAgent to retrieve.
   * @param {number} skip - The number of items to skip for pagination.
   * @param {number} take - The number of items to take per page for pagination.
   * @param {string} searchTerm - Optional search term for filter.
   * @returns {Promise<{ result: AutonomousAgentModel[]; total: number }>} - The list of autonomousAgents and the total count.
   */
  async getAutonomousAgentsByLlmId(
    userId: string,
    llmId: string,
    skip: number,
    take: number,
    searchTerm?: string,
  ): Promise<{ result: AutonomousAgentModel[]; total: number }> {
    try {
      const pipeline: PipelineStage[] = [
        
        {
          $match: {
            user: new Types.ObjectId(userId),
            llm: new Types.ObjectId(llmId),
          },
        },
        {
          $project: {
            name: 1,
                      },
        },
      ];

      if (searchTerm) {
        // Add a $match stage to filter results based on searchTerm
        pipeline.push({
          $match: {
            $or: [
              { name: { $regex: searchTerm, $options: 'i' } },
                            // Add more fields as needed
            ],
          },
        });
      }

      pipeline.push(...getPipelineStageForPagination(skip, take))

      const [result] = await this.autonomousAgentModel.aggregate(pipeline);

      // Extract the total count and matched documents from the aggregation result
      const total = result ? result.total : 0;
      const matchedComments = result ? result.result : [];

      return { result: matchedComments, total };

    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }
}
