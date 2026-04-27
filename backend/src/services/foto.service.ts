import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

let configurado = false;
const configurar = (): void => {
  if (configurado) return;
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    throw new AppError(
      'Cloudinary no está configurado. Define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY ' +
      'y CLOUDINARY_API_SECRET en las variables de entorno.',
      503,
    );
  }
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key:    env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
  configurado = true;
};

/**
 * Sube un buffer de imagen a Cloudinary y retorna la URL pública.
 *   carpeta: agrupamos por tipo para mantener orden ('usuarios', 'familiares', 'mascotas').
 */
export const subirFoto = async (
  buffer: Buffer,
  filename: string,
  carpeta: string = 'quickrescue',
): Promise<string> => {
  configurar();
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: carpeta,
        public_id: filename.replace(/\.[^.]+$/, ''),
        overwrite: true,
        resource_type: 'image',
        // Optimizaciones razonables: WebP y limit a 1024px del lado mayor.
        transformation: [
          { width: 1024, height: 1024, crop: 'limit' },
          { quality: 'auto:good', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error || !result) {
          logger.error('Cloudinary upload error', error);
          return reject(new AppError('No se pudo subir la imagen', 500));
        }
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
};
