import { Injectable, NotFoundException, BadRequestException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types, UpdateQuery } from 'mongoose';
import { convertArrayToObject, getPipelineStageForPagination } from 'src/shared/utils/common'
import { MergedLlMModel } from './merged-ll-m.model';
import { CreateMergedLlMDto } from './create-merged-ll-m.dto';
import { UpdateMergedLlMDto } from './update-merged-ll-m.dto';

@Injectable()
export class MergedLlMService {
  constructor(
    @InjectModel(MergedLlMModel.name)
    private readonly mergedLlMModel: Model<MergedLlMModel>,
  ) {}

  /**
   * Retrieve a paginated list of mergedLlMs.
   *
   *
   * @param {number} skip - The number of items to skip for pagination.
   * @param {number} take - The number of items to take per page for pagination.
   * @param {string} searchTerm - Optional search term for filter.
   * @returns {Promise<{ result: MergedLlMModel[]; total: number }>} - The list of mergedLlMs and the total count.
   */
  async getAllMergedLlMS(
    
    skip: number,
    take: number,
    searchTerm?: string,
  ): Promise<{ result: MergedLlMModel[]; total: number }> {
    try {
      const pipeline: PipelineStage[] = [
        {
          $lookup: {
            from: 'llm_apis',
            localField: 'llm1', // Replace 'postId' with the field that represents the post ID in CommentModel
            foreignField: '_id',
            as: 'llm1',
          },
        },
        {
          $lookup: {
            from: 'llm_apis',
            localField: 'llm2', // Replace 'postId' with the field that represents the post ID in CommentModel
            foreignField: '_id',
            as: 'llm2',
          },
        },
        {
          $unwind: {
            path: '$llm1',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$llm2',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            llm1: {
              _id: '$llm1._id',
              name: '$llm1.name',
            },
            llm2: {
              _id: '$llm2._id',
              name: '$llm2.name',
            },
          },
        },
      ];

      if (searchTerm) {
        // Add a $match stage to filter results based on searchTerm
        pipeline.push({
          $match: {
            $or: [
              { 'llm1.name': { $regex: searchTerm, $options: 'i' } },
              { 'llm2.name': { $regex: searchTerm, $options: 'i' } },
              // Add more fields as needed
            ],
          },
        });
      }

      pipeline.push(...getPipelineStageForPagination(skip, take))

      const [result] = await this.mergedLlMModel.aggregate(pipeline);

      // Extract the total count and matched documents from the aggregation result
      const total = result ? result.total : 0;
      const matchedComments = result ? result.result : [];

      return { result: matchedComments, total };

    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Get a mergedLlM by ID.
   *
   *
   * @param {string} id - The id of the mergedLlM to retrieve.
   * @returns {Promise<MergedLlMModel>} - The mergedLlM object.
   * @throws {NotFoundException} - If the mergedLlM with the given id is not found.
   */
  async getMergedLlMById(id: string): Promise<MergedLlMModel> {
    try {
      const mergedLlM = 
      await this.mergedLlMModel
      .findOne({ _id: new Types.ObjectId(id),  })
      .populate(
        [
          'llm1',
          'llm2',
        ]
      )
      .exec();
      if (!mergedLlM) {
        throw new NotFoundException('MergedLlMModel not found');
      }
      return mergedLlM;
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Create a new mergedLlM.
   *
   *
   * @param {CreateMergedLlMDto} createMergedLlMDto - The DTO for creating a mergedLlM.
   * @returns {Promise<MergedLlMModel>} - The newly created mergedLlM object.
   */
  async createMergedLlM(createMergedLlMDto: CreateMergedLlMDto): Promise<MergedLlMModel> {
    try {
      const mergedLlM = new this.mergedLlMModel({
        llm1: new Types.ObjectId(createMergedLlMDto.llmId1),
        llm2: new Types.ObjectId(createMergedLlMDto.llmId2),
        
      });
      return mergedLlM.save();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Update an existing mergedLlM.
   *
   *
   * @param {string} id - The id of the mergedLlM to update.
   * @param {UpdateMergedLlMDto} updateMergedLlMDto - The DTO for updating a mergedLlM.
   * @returns {Promise<MergedLlMModel>} - The updated mergedLlM object.
   * @throws {NotFoundException} - If the mergedLlM with the given id is not found.
   */
  async updateMergedLlM(id: string, updateMergedLlMDto: UpdateMergedLlMDto): Promise<MergedLlMModel> {
    try {

      //TODO: Fix update
      const mergedLlM = await this.getMergedLlMById(id);

      if (!mergedLlM) {
        throw new NotFoundException(`${this.mergedLlMModel.modelName} not found`);
      }

      // Apply partial updates
      const update: UpdateQuery<MergedLlMModel> = {};
      for (const field in updateMergedLlMDto) {
        if (updateMergedLlMDto.hasOwnProperty(field)) {
          update[field] = updateMergedLlMDto[field];
        }
      }

      // Save the updated document
      mergedLlM.set(update);
      return mergedLlM.save();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Delete a mergedLlM by its ID.
   *
   *
   * @param {string} id - The id of the mergedLlM to delete.
   * @returns {Promise<void>}
   * @throws {NotFoundException} - If the mergedLlM with the given ID is not found.
   */
  async deleteMergedLlM(id: string): Promise<void> {
    try {
      const mergedLlM = await this.getMergedLlMById(id);
      await mergedLlM.deleteOne();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Find mergedLlM data for dropdowns with optional filtering.
   *
   *
   * @param {string[]} fields - Comma-separated list of fields to retrieve.
   * @param {string} keyword - The keyword for filtering data.
   * @returns {Promise<MergedLlMEntity[]>} - The list of mergedLlM data for dropdowns.
   */
  async findAllDropdownData(fields: string[], keyword: string): Promise<MergedLlMModel[]> {
    try {
      const select = fields.reduce((obj, field) => {
        obj[field] = 1;
        return obj;
      }, {});

      const whereConditions = fields.map((field) => ({
        [field]: { $regex: new RegExp(keyword, 'i') }, // Case-insensitive search
      }));

      return await this.mergedLlMModel
        .find({  $or: whereConditions })
        .select(select)
        .limit(25)
        .exec();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

   /**
   * Retrieve a paginated list of mergedLlMs by llmAPI.
   *
   *
   * @param {string} llmId1 - The llmId1 of the mergedLlM to retrieve.
   * @param {number} skip - The number of items to skip for pagination.
   * @param {number} take - The number of items to take per page for pagination.
   * @param {string} searchTerm - Optional search term for filter.
   * @returns {Promise<{ result: MergedLlMModel[]; total: number }>} - The list of mergedLlMs and the total count.
   */
  async getMergedLlMSByLlmId1(
    
    llmId1: string,
    skip: number,
    take: number,
    searchTerm?: string,
  ): Promise<{ result: MergedLlMModel[]; total: number }> {
    try {
      const pipeline: PipelineStage[] = [
        
        {
          $match: {
            llm1: new Types.ObjectId(llmId1),
          },
        },
        {
          $lookup: {
            from: 'llm_apis',
            localField: 'llm2', // Replace 'postId' with the field that represents the post ID in CommentModel
            foreignField: '_id',
            as: 'llm2',
          },
        },
        {
          $unwind: {
            path: '$llm2',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            llm2: {
              _id: '$llm2._id',
              name: '$llm2.name',
            },
          },
        },
      ];

      if (searchTerm) {
        // Add a $match stage to filter results based on searchTerm
        pipeline.push({
          $match: {
            $or: [
              { 'llm2.name': { $regex: searchTerm, $options: 'i' } },
              // Add more fields as needed
            ],
          },
        });
      }

      pipeline.push(...getPipelineStageForPagination(skip, take))

      const [result] = await this.mergedLlMModel.aggregate(pipeline);

      // Extract the total count and matched documents from the aggregation result
      const total = result ? result.total : 0;
      const matchedComments = result ? result.result : [];

      return { result: matchedComments, total };

    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }
   /**
   * Retrieve a paginated list of mergedLlMs by llmAPI.
   *
   *
   * @param {string} llmId2 - The llmId2 of the mergedLlM to retrieve.
   * @param {number} skip - The number of items to skip for pagination.
   * @param {number} take - The number of items to take per page for pagination.
   * @param {string} searchTerm - Optional search term for filter.
   * @returns {Promise<{ result: MergedLlMModel[]; total: number }>} - The list of mergedLlMs and the total count.
   */
  async getMergedLlMSByLlmId2(
    
    llmId2: string,
    skip: number,
    take: number,
    searchTerm?: string,
  ): Promise<{ result: MergedLlMModel[]; total: number }> {
    try {
      const pipeline: PipelineStage[] = [
        
        {
          $match: {
            llm2: new Types.ObjectId(llmId2),
          },
        },
        {
          $lookup: {
            from: 'llm_apis',
            localField: 'llm1', // Replace 'postId' with the field that represents the post ID in CommentModel
            foreignField: '_id',
            as: 'llm1',
          },
        },
        {
          $unwind: {
            path: '$llm1',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            llm1: {
              _id: '$llm1._id',
              name: '$llm1.name',
            },
          },
        },
      ];

      if (searchTerm) {
        // Add a $match stage to filter results based on searchTerm
        pipeline.push({
          $match: {
            $or: [
              { 'llm1.name': { $regex: searchTerm, $options: 'i' } },
              // Add more fields as needed
            ],
          },
        });
      }

      pipeline.push(...getPipelineStageForPagination(skip, take))

      const [result] = await this.mergedLlMModel.aggregate(pipeline);

      // Extract the total count and matched documents from the aggregation result
      const total = result ? result.total : 0;
      const matchedComments = result ? result.result : [];

      return { result: matchedComments, total };

    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }
}
