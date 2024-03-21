import { Injectable, NotFoundException, BadRequestException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types, UpdateQuery } from 'mongoose';
import { convertArrayToObject, getPipelineStageForPagination } from 'src/shared/utils/common'
import { LlmAdapterModel } from './llm-adapter.model';
import { CreateLlmAdapterDto } from './create-llm-adapter.dto';
import { UpdateLlmAdapterDto } from './update-llm-adapter.dto';

@Injectable()
export class LlmAdapterService {
  constructor(
    @InjectModel(LlmAdapterModel.name)
    private readonly llmAdapterModel: Model<LlmAdapterModel>,
  ) {}

  /**
   * Retrieve a paginated list of llmAdapters.
   *
   *
   * @param {number} skip - The number of items to skip for pagination.
   * @param {number} take - The number of items to take per page for pagination.
   * @param {string} searchTerm - Optional search term for filter.
   * @returns {Promise<{ result: LlmAdapterModel[]; total: number }>} - The list of llmAdapters and the total count.
   */
  async getAllLlmAdapters(
    
    skip: number,
    take: number,
    searchTerm?: string,
  ): Promise<{ result: LlmAdapterModel[]; total: number }> {
    try {
      const pipeline: PipelineStage[] = [
        {
          $project: {
            name: 1,
                        modelType: 1,
                      },
        },
      ];

      if (searchTerm) {
        // Add a $match stage to filter results based on searchTerm
        pipeline.push({
          $match: {
            $or: [
              { name: { $regex: searchTerm, $options: 'i' } },
                            { modelType: { $regex: searchTerm, $options: 'i' } },
                            // Add more fields as needed
            ],
          },
        });
      }

      pipeline.push(...getPipelineStageForPagination(skip, take))

      const [result] = await this.llmAdapterModel.aggregate(pipeline);

      // Extract the total count and matched documents from the aggregation result
      const total = result ? result.total : 0;
      const matchedComments = result ? result.result : [];

      return { result: matchedComments, total };

    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Get a llmAdapter by ID.
   *
   *
   * @param {string} id - The id of the llmAdapter to retrieve.
   * @returns {Promise<LlmAdapterModel>} - The llmAdapter object.
   * @throws {NotFoundException} - If the llmAdapter with the given id is not found.
   */
  async getLlmAdapterById(id: string): Promise<LlmAdapterModel> {
    try {
      const llmAdapter = 
      await this.llmAdapterModel
      .findOne({ _id: new Types.ObjectId(id),  })
      .populate(
        [
        ]
      )
      .exec();
      if (!llmAdapter) {
        throw new NotFoundException('LlmAdapterModel not found');
      }
      return llmAdapter;
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Create a new llmAdapter.
   *
   *
   * @param {CreateLlmAdapterDto} createLlmAdapterDto - The DTO for creating a llmAdapter.
   * @returns {Promise<LlmAdapterModel>} - The newly created llmAdapter object.
   */
  async createLlmAdapter(createLlmAdapterDto: CreateLlmAdapterDto): Promise<LlmAdapterModel> {
    try {
      const llmAdapter = new this.llmAdapterModel({
        name: createLlmAdapterDto.name,
                modelType: createLlmAdapterDto.modelType,
                
      });
      return llmAdapter.save();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Update an existing llmAdapter.
   *
   *
   * @param {string} id - The id of the llmAdapter to update.
   * @param {UpdateLlmAdapterDto} updateLlmAdapterDto - The DTO for updating a llmAdapter.
   * @returns {Promise<LlmAdapterModel>} - The updated llmAdapter object.
   * @throws {NotFoundException} - If the llmAdapter with the given id is not found.
   */
  async updateLlmAdapter(id: string, updateLlmAdapterDto: UpdateLlmAdapterDto): Promise<LlmAdapterModel> {
    try {

      //TODO: Fix update
      const llmAdapter = await this.getLlmAdapterById(id);

      if (!llmAdapter) {
        throw new NotFoundException(`${this.llmAdapterModel.modelName} not found`);
      }

      // Apply partial updates
      const update: UpdateQuery<LlmAdapterModel> = {};
      for (const field in updateLlmAdapterDto) {
        if (updateLlmAdapterDto.hasOwnProperty(field)) {
          update[field] = updateLlmAdapterDto[field];
        }
      }

      // Save the updated document
      llmAdapter.set(update);
      return llmAdapter.save();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Delete a llmAdapter by its ID.
   *
   *
   * @param {string} id - The id of the llmAdapter to delete.
   * @returns {Promise<void>}
   * @throws {NotFoundException} - If the llmAdapter with the given ID is not found.
   */
  async deleteLlmAdapter(id: string): Promise<void> {
    try {
      const llmAdapter = await this.getLlmAdapterById(id);
      await llmAdapter.deleteOne();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  /**
   * Find llmAdapter data for dropdowns with optional filtering.
   *
   *
   * @param {string[]} fields - Comma-separated list of fields to retrieve.
   * @param {string} keyword - The keyword for filtering data.
   * @returns {Promise<LlmAdapterEntity[]>} - The list of llmAdapter data for dropdowns.
   */
  async findAllDropdownData(fields: string[], keyword: string): Promise<LlmAdapterModel[]> {
    try {
      const select = fields.reduce((obj, field) => {
        obj[field] = 1;
        return obj;
      }, {});

      const whereConditions = fields.map((field) => ({
        [field]: { $regex: new RegExp(keyword, 'i') }, // Case-insensitive search
      }));

      return await this.llmAdapterModel
        .find({  $or: whereConditions })
        .select(select)
        .limit(25)
        .exec();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

}
