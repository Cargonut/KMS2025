import { Module } from '@nestjs/common';
import { UploadController } from './file-upload.controller';

@Module({
  controllers: [UploadController],
})
export class UploadModule {}
