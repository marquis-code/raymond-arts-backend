import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
  } from "@nestjs/common"
  import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express"
  import { ImagesService } from "./images.service"
  import type { CreateImageDto } from "./dto/create-image.dto"
  import type { UpdateImageDto } from "./dto/update-image.dto"
  
  @Controller("images")
  export class ImagesController {
    constructor(private readonly imagesService: ImagesService) {}
  
    @Post()
    @UseInterceptors(FileInterceptor("file"))
    async create(
      @UploadedFile(
        new ParseFilePipe({
          validators: [
            new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
            new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          ],
        }),
      )
      file: Express.Multer.File,
      @Body() createImageDto: CreateImageDto,
    ) {
      return this.imagesService.create(file, createImageDto)
    }
  
    @Post("batch")
    @UseInterceptors(FilesInterceptor("files", 10)) // Allow up to 10 files
    async createMany(
      @UploadedFiles(
        new ParseFilePipe({
          validators: [
            new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
            new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          ],
        }),
      )
      files: Express.Multer.File[],
      @Body() createImageDto: CreateImageDto,
    ) {
      return this.imagesService.createMany(files, createImageDto)
    }
  
    @Get()
    findAll() {
      return this.imagesService.findAll()
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.imagesService.findOne(id);
    }
  
    @Patch(":id")
    update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
      return this.imagesService.update(id, updateImageDto)
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.imagesService.remove(id);
    }
  }
  