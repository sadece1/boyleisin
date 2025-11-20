import api from './api';
import { config } from '@/config';

export interface UploadedFile {
  filename: string;
  path: string;
  size: number;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: UploadedFile | UploadedFile[];
}

export const uploadService = {
  /**
   * Tek bir resim yükle
   */
  async uploadImage(file: File): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('image', file);

    // Don't set Content-Type manually - let browser set it with boundary
    const response = await api.post<UploadResponse>('/upload/image', formData);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Resim yüklenemedi');
    }

    // Single file response
    const data = response.data.data as UploadedFile;
    return data;
  },

  /**
   * Birden fazla resim yükle
   */
  async uploadImages(files: File[]): Promise<UploadedFile[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    // Don't set Content-Type manually - let browser set it with boundary
    const response = await api.post<UploadResponse>('/upload/images', formData);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Resimler yüklenemedi');
    }

    // Multiple files response
    const data = response.data.data as UploadedFile[];
    return data;
  },

  /**
   * Yüklenen dosyayı sil
   */
  async deleteFile(filename: string): Promise<void> {
    await api.delete(`/upload/${filename}`);
  },

  /**
   * Dosya yolunu tam URL'ye dönüştür
   */
  getFileUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // If path already starts with /uploads, use api base URL
    // In development, use proxy, in production use config
    const apiBaseUrl = config.apiBaseUrl.startsWith('http') 
      ? config.apiBaseUrl 
      : '/api';
    return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  },
};

