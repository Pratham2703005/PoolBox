import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  FigmaFile,
  FigmaImageResponse,
  AssetUrl,
  ErrorCode,
} from './types';
import { FIGMA_API_BASE_URL, API_CONFIG, ERROR_MESSAGES } from './constants';

export class FigmaClient {
  private client: AxiosInstance;
  private token: string;

  constructor(personalAccessToken: string) {
    this.token = personalAccessToken;
    this.client = axios.create({
      baseURL: FIGMA_API_BASE_URL,
      timeout: API_CONFIG.timeout,
      headers: {
        'X-Figma-Token': this.token,
      },
    });
  }

  /**
   * Parse Figma file key from URL
   * Supports formats:
   * - https://www.figma.com/file/ABC123/Project-Name
   * - https://www.figma.com/design/ABC123/Project-Name
   * - https://figma.com/file/ABC123
   */
  parseFileKey(figmaUrl: string): string {
    try {
      const url = new URL(figmaUrl);

      // Match /file/:key or /design/:key
      const match = url.pathname.match(/\/(file|design)\/([a-zA-Z0-9]+)/);

      if (!match || !match[2]) {
        throw new Error('Invalid Figma URL format');
      }

      return match[2];
    } catch (error) {
      throw this.createError('INVALID_URL', ERROR_MESSAGES.INVALID_URL, error);
    }
  }

  /**
   * Fetch Figma file data
   */
  async getFile(fileKey: string): Promise<FigmaFile> {
    try {
      const response = await this.client.get<FigmaFile>(`/files/${fileKey}`);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Fetch image URLs for node IDs
   * @param fileKey - Figma file key
   * @param nodeIds - Array of node IDs to get images for
   * @param format - Image format (png, jpg, svg, pdf)
   * @param scale - Scale factor (1, 2, 3, 4)
   */
  async getImageUrls(
    fileKey: string,
    nodeIds: string[],
    format: 'png' | 'jpg' | 'svg' | 'pdf' = 'png',
    scale: number = 2
  ): Promise<AssetUrl[]> {
    if (nodeIds.length === 0) {
      return [];
    }

    try {
      // Batch requests (max 100 IDs per request)
      const batches = this.chunkArray(nodeIds, API_CONFIG.maxAssetBatchSize);
      const allAssets: AssetUrl[] = [];

      for (const batch of batches) {
        const response = await this.client.get<FigmaImageResponse>(
          `/images/${fileKey}`,
          {
            params: {
              ids: batch.join(','),
              format,
              scale,
            },
          }
        );

        if (response.data.err) {
          console.warn('Asset fetch warning:', response.data.err);
        }

        // Convert response to AssetUrl format
        Object.entries(response.data.images).forEach(([id, url]) => {
          if (url) {
            allAssets.push({
              id,
              name: `asset-${id}`,
              type: format.toUpperCase() as 'PNG' | 'JPG' | 'SVG' | 'PDF',
              url,
            });
          }
        });

        // Small delay between batches to avoid rate limiting
        if (batches.length > 1) {
          await this.delay(200);
        }
      }

      return allAssets;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Validate token by making a test request
   */
  async validateToken(): Promise<boolean> {
    try {
      // Make a simple request to test token validity
      await this.client.get('/me');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Handle API errors and convert to structured error format
   */
  private handleApiError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        const status = axiosError.response.status;

        if (status === 403) {
          return this.createError('INVALID_TOKEN', ERROR_MESSAGES.INVALID_TOKEN);
        } else if (status === 404) {
          return this.createError('FILE_NOT_FOUND', ERROR_MESSAGES.FILE_NOT_FOUND);
        } else if (status === 429) {
          return this.createError('RATE_LIMIT', ERROR_MESSAGES.RATE_LIMIT);
        } else {
          return this.createError(
            'API_ERROR',
            ERROR_MESSAGES.API_ERROR,
            axiosError.response.data
          );
        }
      } else if (axiosError.request) {
        return this.createError('NETWORK_ERROR', ERROR_MESSAGES.NETWORK_ERROR);
      }
    }

    if (error instanceof Error && error.message.includes('timeout')) {
      return this.createError('TIMEOUT', ERROR_MESSAGES.TIMEOUT);
    }

    return this.createError('UNKNOWN_ERROR', ERROR_MESSAGES.UNKNOWN_ERROR, error);
  }

  /**
   * Create structured error object
   */
  private createError(
    code: ErrorCode,
    message: string,
    details?: unknown
  ): Error {
    const error = new Error(message) as Error & {
      code: ErrorCode;
      details?: unknown;
    };
    error.code = code;
    error.details = details;
    return error;
  }

  /**
   * Utility: Chunk array into smaller batches
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Utility: Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
