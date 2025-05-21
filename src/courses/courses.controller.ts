import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    Request,
    HttpStatus,
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
  import { CoursesService } from './courses.service';
  import { CreateCourseDto } from './dto/create-course.dto';
  import { UpdateCourseDto } from './dto/update-course.dto';
  import { CreateSectionDto } from './dto/create-section.dto';
  import { CreateLessonDto } from './dto/create-lesson.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from '../users/enums/user-role.enum';
  import { EnrollCourseDto } from './dto/enroll-course.dto';
  import { CreateReviewDto } from './dto/create-review.dto';
  
  @ApiTags('courses')
  @Controller('courses')
  export class CoursesController {
    constructor(private readonly coursesService: CoursesService) {}
  
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    //   @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
    @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN) 
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new course' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Course created successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    async createCourse(@Body() createCourseDto: CreateCourseDto, @Request() req) {
      return this.coursesService.createCourse(createCourseDto, req.user.userId);
    }
  
    // @Get()
    // @ApiOperation({ summary: 'Get all courses with filtering options' })
    // @ApiQuery({ name: 'page', required: false, type: Number })
    // @ApiQuery({ name: 'limit', required: false, type: Number })
    // @ApiQuery({ name: 'status', required: false, enum: ['draft', 'published', 'archived'] })
    // @ApiQuery({ name: 'instructor', required: false })
    // @ApiQuery({ name: 'level', required: false, enum: ['beginner', 'intermediate', 'advanced'] })
    // @ApiQuery({ name: 'minPrice', required: false, type: Number })
    // @ApiQuery({ name: 'maxPrice', required: false, type: Number })
    // @ApiQuery({ name: 'search', required: false })
    // @ApiQuery({ name: 'tags', required: false })
    // @ApiQuery({ name: 'isFeatured', required: false, type: Boolean })
    // @ApiResponse({ status: HttpStatus.OK, description: 'Courses retrieved successfully' })
    // async findAllCourses(
    //   @Query('page') page?: number,
    //   @Query('limit') limit?: number,
    //   @Query() query?: any,
    // ) {
    //   return this.coursesService.findAllCourses(
    //     query,
    //     page ? parseInt(page.toString()) : 1,
    //     limit ? parseInt(limit.toString()) : 10,
    //   );
    // }

    @Get()
    @ApiOperation({ summary: 'Get all courses with filtering options' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: ['draft', 'published', 'archived'] })
    @ApiQuery({ name: 'instructor', required: false })
    @ApiQuery({ name: 'level', required: false, enum: ['beginner', 'intermediate', 'advanced'] })
    @ApiQuery({ name: 'minPrice', required: false, type: Number })
    @ApiQuery({ name: 'maxPrice', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'tags', required: false })
    @ApiQuery({ name: 'isFeatured', required: false, type: Boolean })
    @ApiResponse({ status: HttpStatus.OK, description: 'Courses retrieved successfully' })
    async findAllCourses(
      @Query('page') page?: string,
      @Query('limit') limit?: string,
      @Query() query?: any,
    ) {
      // Fix 1: Extract filter parameters from query
      const { page: _, limit: __, ...filters } = query;
      
      // Fix 2: Convert page and limit to numbers with defaults
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 10;
      
      // Fix 3: Call the service with the correct parameters
      return this.coursesService.findAllCourses(pageNum, limitNum, filters);
    }
  
    @Get('popular')
    @ApiOperation({ summary: 'Get popular courses' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: HttpStatus.OK, description: 'Popular courses retrieved successfully' })
    async getPopularCourses(@Query('limit') limit?: number) {
      return this.coursesService.getPopularCourses(limit ? parseInt(limit.toString()) : 5);
    }
  
    @Get('recent')
    @ApiOperation({ summary: 'Get recent courses' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: HttpStatus.OK, description: 'Recent courses retrieved successfully' })
    async getRecentCourses(@Query('limit') limit?: number) {
      return this.coursesService.getRecentCourses(limit ? parseInt(limit.toString()) : 5);
    }
  
    @Get('featured')
    @ApiOperation({ summary: 'Get featured courses' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: HttpStatus.OK, description: 'Featured courses retrieved successfully' })
    async getFeaturedCourses(@Query('limit') limit?: number) {
      return this.coursesService.getFeaturedCourses(limit ? parseInt(limit.toString()) : 5);
    }
  
    @Get('search')
    @ApiOperation({ summary: 'Search courses' })
    @ApiQuery({ name: 'q', required: true })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: HttpStatus.OK, description: 'Search results retrieved successfully' })
    async searchCourses(@Query('q') query: string, @Query('limit') limit?: number) {
      return this.coursesService.searchCourses(query, limit ? parseInt(limit.toString()) : 10);
    }
  
    @Get('related/:id')
    @ApiOperation({ summary: 'Get related courses' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: HttpStatus.OK, description: 'Related courses retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Course not found' })
    async getRelatedCourses(@Param('id') id: string, @Query('limit') limit?: number) {
      return this.coursesService.getRelatedCourses(id, limit ? parseInt(limit.toString()) : 4);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get course by ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Course retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Course not found' })
    async findCourseById(@Param('id') id: string) {
      return this.coursesService.findCourseById(id);
    }
  
    @Get('slug/:slug')
    @ApiOperation({ summary: 'Get course by slug' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Course retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Course not found' })
    async findCourseBySlug(@Param('slug') slug: string) {
      return this.coursesService.findCourseBySlug(slug);
    }
  
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a course' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Course updated successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Course not found' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    async updateCourse(
      @Param('id') id: string,
      @Body() updateCourseDto: UpdateCourseDto,
      @Request() req,
    ) {
      return this.coursesService.updateCourse(id, updateCourseDto, req.user.userId);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a course' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Course deleted successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Course not found' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    async deleteCourse(@Param('id') id: string, @Request() req) {
      return this.coursesService.deleteCourse(id, req.user.userId);
    }
  
    // Section endpoints
    @Post('sections')
    @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new section' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Section created successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    async createSection(@Body() createSectionDto: CreateSectionDto, @Request() req) {
      return this.coursesService.createSection(createSectionDto, req.user.userId);
    }
  
    @Patch('sections/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a section' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Section updated successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Section not found' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    async updateSection(
      @Param('id') id: string,
      @Body() updateSectionDto: any,
      @Request() req,
    ) {
      return this.coursesService.updateSection(id, updateSectionDto, req.user.userId);
    }
  
    @Delete('sections/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a section' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Section deleted successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Section not found' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    async deleteSection(@Param('id') id: string, @Request() req) {
      return this.coursesService.deleteSection(id, req.user.userId);
    }
  
    // Lesson endpoints
    @Post('lessons')
    @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new lesson' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Lesson created successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    async createLesson(@Body() createLessonDto: CreateLessonDto, @Request() req) {
      return this.coursesService.createLesson(createLessonDto, req.user.userId);
    }
  
    @Patch('lessons/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a lesson' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Lesson updated successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lesson not found' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    async updateLesson(
      @Param('id') id: string,
      @Body() updateLessonDto: any,
      @Request() req,
    ) {
      return this.coursesService.updateLesson(id, updateLessonDto, req.user.userId);
    }
  
    @Delete('lessons/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a lesson' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Lesson deleted successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lesson not found' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    async deleteLesson(@Param('id') id: string, @Request() req) {
      return this.coursesService.deleteLesson(id, req.user.userId);
    }



@Post('enroll')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Enroll in a course' })
@ApiResponse({ status: HttpStatus.CREATED, description: 'Enrolled successfully' })
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
async enrollInCourse(@Body() enrollCourseDto: EnrollCourseDto, @Request() req) {
  return this.coursesService.enrollUserInCourse(
    req.user.userId,
    enrollCourseDto.courseId.toString(),
  );
}

@Get('enrollments/user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Get user enrollments' })
@ApiResponse({ status: HttpStatus.OK, description: 'Enrollments retrieved successfully' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
async getUserEnrollments(@Request() req) {
  return this.coursesService.getUserEnrollments(req.user.userId);
}

@Get('enrollments/course/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
@ApiBearerAuth()
@ApiOperation({ summary: 'Get course enrollments' })
@ApiResponse({ status: HttpStatus.OK, description: 'Enrollments retrieved successfully' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
@ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
async getCourseEnrollments(@Param('id') id: string, @Request() req) {
  return this.coursesService.getCourseEnrollments(id, req.user.userId);
}

@Post('progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Update lesson progress' })
@ApiResponse({ status: HttpStatus.OK, description: 'Progress updated successfully' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
async updateLessonProgress(
  @Body() progressDto: { courseId: string; lessonId: string; completed: boolean },
  @Request() req,
) {
  return this.coursesService.updateEnrollmentProgress(
    req.user.userId,
    progressDto.courseId,
    progressDto.lessonId,
    progressDto.completed,
  );
}

@Get('check-enrollment/:id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Check if user is enrolled in a course' })
@ApiResponse({ status: HttpStatus.OK, description: 'Enrollment status retrieved' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
async checkEnrollment(@Param('id') id: string, @Request() req) {
  const isEnrolled = await this.coursesService.checkUserEnrollment(req.user.userId, id);
  return { isEnrolled };
}


@Post('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Create a course review' })
@ApiResponse({ status: HttpStatus.CREATED, description: 'Review created successfully' })
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
async createReview(@Body() createReviewDto: CreateReviewDto, @Request() req) {
  return this.coursesService.createReview(req.user.userId, createReviewDto);
}

@Get('reviews/course/:id')
@ApiOperation({ summary: 'Get course reviews' })
@ApiResponse({ status: HttpStatus.OK, description: 'Reviews retrieved successfully' })
@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Course not found' })
async getCourseReviews(@Param('id') id: string) {
  return this.coursesService.getCourseReviews(id);
}

@Get('reviews/user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Get user reviews' })
@ApiResponse({ status: HttpStatus.OK, description: 'Reviews retrieved successfully' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
async getUserReviews(@Request() req) {
  return this.coursesService.getUserReviews(req.user.userId);
}

@Delete('reviews/:id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Delete a review' })
@ApiResponse({ status: HttpStatus.OK, description: 'Review deleted successfully' })
@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Review not found' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
@ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
async deleteReview(@Param('id') id: string, @Request() req) {
  return this.coursesService.deleteReview(id, req.user.userId);
}

@Post('certificates/:courseId')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Generate a course completion certificate' })
@ApiResponse({ status: HttpStatus.CREATED, description: 'Certificate generated successfully' })
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Course not completed' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
async generateCertificate(@Param('courseId') courseId: string, @Request() req) {
  return this.coursesService.generateCertificate(req.user.userId, courseId);
}

@Get('certificates/user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Get user certificates' })
@ApiResponse({ status: HttpStatus.OK, description: 'Certificates retrieved successfully' })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
async getUserCertificates(@Request() req) {
  return this.coursesService.getUserCertificates(req.user.userId);
}

@Get('certificates/verify/:number')
@ApiOperation({ summary: 'Verify a certificate' })
@ApiResponse({ status: HttpStatus.OK, description: 'Certificate verified successfully' })
@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Certificate not found' })
async verifyCertificate(@Param('number') certificateNumber: string) {
  return this.coursesService.verifyCertificate(certificateNumber);
}
  }