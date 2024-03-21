import { PipelineStage } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

export function convertArrayToObject(arr: string[]): {
  [key: string]: boolean;
} {
  const result: { [key: string]: boolean } = {};
  arr.forEach((item) => {
    result[item] = true;
  });
  return result;
}

export function getPipelineStageForPagination(
  skip: number,
  limit: number,
): PipelineStage[] {
  return [
    {
      $group: {
        _id: null,
        total: { $sum: 1 }, // Count the matched documents
        result: { $push: '$$ROOT' }, // Push the matched documents to the result array
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $project: {
        _id: 0,
        total: 1,
        result: 1,
      },
    },
  ];
}

export function generateToken(): string {
  // 1. Generate a cryptographically secure random UUID for high uniqueness:
  const rawToken = uuidv4();

  // 2. Hash the token using a strong algorithm (e.g., SHA-256) for added security:
  const hashedToken = createHash('sha256').update(rawToken).digest('hex');

  return hashedToken;
}
