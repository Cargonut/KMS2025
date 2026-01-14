import { Controller, Post, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { createWriteStream } from 'fs';
import { join } from 'path';

@Controller('upload')
export class UploadController {

  @Post('profile')
  async uploadProfile(@Req() req: FastifyRequest) {
    const data = await req.file();

    if (!data) {
      throw new Error('No file uploaded');
    }

    const filename = `${Date.now()}-${data.filename}`;
    const filepath = join(process.cwd(), 'uploads/profile', filename);

    await new Promise<void>((resolve, reject) => {
      const stream = createWriteStream(filepath);
      data.file.pipe(stream);

      stream.on('finish', () => resolve());
      stream.on('error', reject);
    });

    return {
      url: `/uploads/profile/${filename}`,
      filename,
    };
  }

  @Post('vehicle')
  async uploadVehicle(@Req() req: FastifyRequest) {
    const data = await req.file();

    if (!data) {
      throw new Error('No file uploaded');
    }

    const filename = `${Date.now()}-${data.filename}`;
    const filepath = join(process.cwd(), 'uploads/vehicle', filename);

    await new Promise<void>((resolve, reject) => {
      const stream = createWriteStream(filepath);
      data.file.pipe(stream);

      stream.on('finish', () => resolve());
      stream.on('error', reject);
    });

    return {
      url: `/uploads/vehicle/${filename}`,
      filename,
    };
  }
}

