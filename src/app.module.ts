import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocxMergeModule } from './modules/docx-merge/docx-merge.module';
import { LoginModule } from './modules/login/login.module';

@Module({
  imports: [DocxMergeModule, LoginModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
