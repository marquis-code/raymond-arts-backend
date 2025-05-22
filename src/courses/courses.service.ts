import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Types, SortOrder } from 'mongoose';
import { CoursesRepository } from './courses.repository';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { Course } from './schemas/course.schema';
import { Section } from './schemas/section.schema';
import { Lesson } from './schemas/lesson.schema';
import { toSchemaObjectId } from '../common/types/mongoose-types';

@Injectable()
export class CoursesService {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  async createCourse(
    createCourseDto: CreateCourseDto,
    instructorId: string,
  ): Promise<Course> {
    return this.coursesRepository.createCourse(
      createCourseDto,
      new Types.ObjectId(instructorId),
    );
  }

  async findAllCourses(
    page = 1,
    limit = 10,
    filters: Record<string, any> = {},
  ): Promise<{
    courses: Course[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Extract sort parameters if they exist
    const { sortBy, sortOrder, ...queryFilters } = filters;

    // Create a sort object
    const sort: Record<string, any> = {};
    if (sortBy) {
      sort[sortBy] = sortOrder || 'desc';
    } else {
      sort.createdAt = -1; // Default sort
    }

    // Process filters into a MongoDB query
    const query: Record<string, any> = {};

    // Handle status filter
    if (queryFilters.status) {
      query.status = queryFilters.status;
    }

    // Handle instructor filter
    if (queryFilters.instructor) {
      query.instructor = queryFilters.instructor;
    }

    // Handle level filter
    if (queryFilters.level) {
      query.level = queryFilters.level;
    }

    // Handle price range filter
    if (
      queryFilters.minPrice !== undefined ||
      queryFilters.maxPrice !== undefined
    ) {
      query.price = {};
      if (queryFilters.minPrice !== undefined) {
        query.price.$gte = parseFloat(queryFilters.minPrice);
      }
      if (queryFilters.maxPrice !== undefined) {
        query.price.$lte = parseFloat(queryFilters.maxPrice);
      }
    }

    // Handle search filter
    if (queryFilters.search) {
      query.$text = { $search: queryFilters.search };
    }

    // Handle tags filter
    if (queryFilters.tags) {
      query.tags = {
        $in: Array.isArray(queryFilters.tags)
          ? queryFilters.tags
          : [queryFilters.tags],
      };
    }

    // Handle featured filter
    if (queryFilters.isFeatured !== undefined) {
      query.isFeatured =
        queryFilters.isFeatured === 'true' || queryFilters.isFeatured === true;
    }

    // Call the repository with the processed query, page, limit, and sort
    return this.coursesRepository.findAllCourses(page, limit, sort, query)
  }

  // Fix 2: Add methods to get section and lesson by ID
  async findSectionById(id: string): Promise<Section> {
    const section = await this.coursesRepository.findSectionById(id);

    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    return section;
  }

  async findLessonById(id: string): Promise<Lesson> {
    const lesson = await this.coursesRepository.findLessonById(id);

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  async findCourseById(id: string): Promise<Course> {
    const course = await this.coursesRepository.findCourseById(id);

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async findCourseBySlug(slug: string): Promise<Course> {
    const course = await this.coursesRepository.findCourseBySlug(slug);

    if (!course) {
      throw new NotFoundException(`Course with slug ${slug} not found`);
    }

    return course;
  }

  async updateCourse(
    id: string,
    updateCourseDto: UpdateCourseDto,
    userId: string,
  ): Promise<Course> {

    const course = await this.coursesRepository.findCourseById(id);

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    // Check if the instructor field exists
    if (!course.instructor) {
      throw new ForbiddenException('Course has no assigned instructor');
    }

    // Handle both populated and non-populated cases
    let instructorId: string;

    // Check if instructor is a populated object or just an ObjectId
    if (typeof course.instructor === 'object' && course.instructor !== null) {
      // If it's a populated object, it might have _id
      // Use type assertion to tell TypeScript this is a populated object
      const populatedInstructor = course.instructor as any;

      if (populatedInstructor._id) {
        instructorId = populatedInstructor._id.toString();
      } else {
        // If somehow it's an object without _id, use the object itself
        instructorId = populatedInstructor.toString();
      }
    } else {
      // If it's just an ObjectId
      instructorId = course.instructor.toString();
    }

    console.log('Instructor ID:', instructorId);
    console.log('User ID:', userId);

    // Compare the IDs
    if (instructorId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this course',
      );
    }

    return this.coursesRepository.updateCourse(id, updateCourseDto);
  }

  async deleteCourse(id: string, userId: string): Promise<Course> {
    const course = await this.findCourseById(id);

    // Check if user is the instructor of the course
    if (course.instructor.toString() !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this course',
      );
    }

    return this.coursesRepository.deleteCourse(id);
  }

  // async createSection(
  //   createSectionDto: CreateSectionDto,
  //   userId: string,
  // ): Promise<Section> {
  //   // Convert string to Schema.Types.ObjectId using our helper
  //   const courseId = toSchemaObjectId(createSectionDto.course);

  //   const course = await this.findCourseById(createSectionDto.course);

  //   if (!course) {
  //     throw new NotFoundException(`Course with ID not found`);
  //   }

  //   // Check if the instructor field exists
  //   if (!course.instructor) {
  //     throw new ForbiddenException('Course has no assigned instructor');
  //   }

  //   // Handle both populated and non-populated cases
  //   let instructorId: string;

  //   // Check if instructor is a populated object or just an ObjectId
  //   if (typeof course.instructor === 'object' && course.instructor !== null) {
  //     // If it's a populated object, it might have _id
  //     // Use type assertion to tell TypeScript this is a populated object
  //     const populatedInstructor = course.instructor as any;

  //     if (populatedInstructor._id) {
  //       instructorId = populatedInstructor._id.toString();
  //     } else {
  //       // If somehow it's an object without _id, use the object itself
  //       instructorId = populatedInstructor.toString();
  //     }
  //   } else {
  //     // If it's just an ObjectId
  //     instructorId = course.instructor.toString();
  //   }

  //   console.log('Instructor ID:', instructorId);
  //   console.log('User ID:', userId);

  //   // Compare the IDs
  //   if (instructorId !== userId) {
  //     throw new ForbiddenException(
  //       'You are not authorized to update this course',
  //     );
  //   }


  //   // Map DTO properties to schema properties
  //   const sectionData: Partial<Section> = {
  //     title: createSectionDto.title,
  //     description: createSectionDto.description,
  //     order: createSectionDto.order,
  //     course: courseId, // Now using Schema.Types.ObjectId
  //     lessons: [],
  //   };

  //   // Use the repository to create the section
  //   return this.coursesRepository.createSection(sectionData);
  // }

  async createSection(
    createSectionDto: CreateSectionDto,
    userId: string,
  ): Promise<Section> {
    // Convert string to Schema.Types.ObjectId using our helper
    const courseId = toSchemaObjectId(createSectionDto.course);
  
    const course = await this.findCourseById(createSectionDto.course);
  
    if (!course) {
      throw new NotFoundException(`Course with ID not found`);
    }
  
    // Check if the instructor field exists
    if (!course.instructor) {
      throw new ForbiddenException('Course has no assigned instructor');
    }
  
    // Handle both populated and non-populated cases
    let instructorId: string;
  
    // Check if instructor is a populated object or just an ObjectId
    if (typeof course.instructor === 'object' && course.instructor !== null) {
      // If it's a populated object, it might have _id
      // Use type assertion to tell TypeScript this is a populated object
      const populatedInstructor = course.instructor as any;
  
      if (populatedInstructor._id) {
        instructorId = populatedInstructor._id.toString();
      } else {
        // If somehow it's an object without _id, use the object itself
        instructorId = populatedInstructor.toString();
      }
    } else {
      // If it's just an ObjectId
      instructorId = course.instructor.toString();
    }
  
    console.log('Instructor ID:', instructorId);
    console.log('User ID:', userId);
  
    // Compare the IDs
    if (instructorId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this course',
      );
    }
  
    // Map DTO properties to schema properties
    const sectionData: Partial<Section> = {
      title: createSectionDto.title,
      description: createSectionDto.description,
      order: createSectionDto.order,
      course: courseId, // Now using Schema.Types.ObjectId
      lessons: [],
    };
  
    // Use the repository to create the section
    const newSection = await this.coursesRepository.createSection(sectionData);
    
    // Update the course directly using the Mongoose model
    // This bypasses the DTO validation
    await this.coursesRepository.addSectionToCourse(createSectionDto.course, newSection._id);
  
    return newSection;
  }

  async createLesson(
    createLessonDto: CreateLessonDto,
    userId: string,
  ): Promise<Lesson> {
    // Convert strings to Schema.Types.ObjectId using our helper
    const courseId = toSchemaObjectId(createLessonDto.course);
    const sectionId = toSchemaObjectId(createLessonDto.section);
  
    const course = await this.findCourseById(createLessonDto.course);
  
    if (!course) {
      throw new NotFoundException(`Course with ID not found`);
    }
  
    // Check if the instructor field exists
    if (!course.instructor) {
      throw new ForbiddenException('Course has no assigned instructor');
    }
  
    let instructorId: string;
  
    // Check if instructor is a populated object or just an ObjectId
    if (typeof course.instructor === 'object' && course.instructor !== null) {
      // If it's a populated object, it might have _id
      // Use type assertion to tell TypeScript this is a populated object
      const populatedInstructor = course.instructor as any;
  
      if (populatedInstructor._id) {
        instructorId = populatedInstructor._id.toString();
      } else {
        // If somehow it's an object without _id, use the object itself
        instructorId = populatedInstructor.toString();
      }
    } else {
      // If it's just an ObjectId
      instructorId = course.instructor.toString();
    }
  
    console.log('Instructor ID:', instructorId);
    console.log('User ID:', userId);
  
  
    if (instructorId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to add lessons to this course',
      );
    }
  
    // Validate section belongs to course
    const sectionBelongsToCourse =
      await this.coursesRepository.validateSectionBelongsToCourse(
        createLessonDto.section,
        createLessonDto.course,
      );
  
    if (!sectionBelongsToCourse.exists) {
      throw new NotFoundException(
        `Section with ID ${createLessonDto.section} not found`,
      );
    }
  
    if (!sectionBelongsToCourse.belongsToCourse) {
      throw new BadRequestException(
        'Section does not belong to the specified course',
      );
    }
  
    // Map DTO properties to schema properties
    const lessonData: Partial<Lesson> = {
      title: createLessonDto.title,
      description: createLessonDto.description,
      order: createLessonDto.order,
      course: courseId, // Now using Schema.Types.ObjectId
      section: sectionId, // Now using Schema.Types.ObjectId
      type: createLessonDto.type,
      videoUrl: createLessonDto.videoUrl,
      content: createLessonDto.content,
      durationInMinutes: createLessonDto.durationInMinutes,
      isPreview: createLessonDto.isPreview,
    };
  
    // Use the repository to create the lesson
    const savedLesson = await this.coursesRepository.createLesson(lessonData);
  
    // Update the section to include this lesson - make sure _id exists
    if (!savedLesson._id) {
      throw new Error('Saved lesson does not have an _id');
    }
  
    // Add the lesson to the section
    await this.coursesRepository.updateSectionAddLesson(
      sectionId,
      savedLesson._id,
    );
  
    // Update the course's totalLessons count and durationInMinutes
    await this.coursesRepository.updateCourseLessonStats(
      courseId,
      savedLesson.durationInMinutes || 0
    );
  
    return savedLesson;
  }
  // async createLesson(
  //   createLessonDto: CreateLessonDto,
  //   userId: string,
  // ): Promise<Lesson> {
  //   // Convert strings to Schema.Types.ObjectId using our helper
  //   const courseId = toSchemaObjectId(createLessonDto.course);
  //   const sectionId = toSchemaObjectId(createLessonDto.section);

  //   const course = await this.findCourseById(createLessonDto.course);

  //   if (!course) {
  //     throw new NotFoundException(`Course with ID not found`);
  //   }

  //   // Check if the instructor field exists
  //   if (!course.instructor) {
  //     throw new ForbiddenException('Course has no assigned instructor');
  //   }

  //   let instructorId: string;

  //   // Check if instructor is a populated object or just an ObjectId
  //   if (typeof course.instructor === 'object' && course.instructor !== null) {
  //     // If it's a populated object, it might have _id
  //     // Use type assertion to tell TypeScript this is a populated object
  //     const populatedInstructor = course.instructor as any;

  //     if (populatedInstructor._id) {
  //       instructorId = populatedInstructor._id.toString();
  //     } else {
  //       // If somehow it's an object without _id, use the object itself
  //       instructorId = populatedInstructor.toString();
  //     }
  //   } else {
  //     // If it's just an ObjectId
  //     instructorId = course.instructor.toString();
  //   }

  //   console.log('Instructor ID:', instructorId);
  //   console.log('User ID:', userId);


  //   if (instructorId !== userId) {
  //     throw new ForbiddenException(
  //       'You are not authorized to add lessons to this course',
  //     );
  //   }

  //   // Validate section belongs to course
  //   const sectionBelongsToCourse =
  //     await this.coursesRepository.validateSectionBelongsToCourse(
  //       createLessonDto.section,
  //       createLessonDto.course,
  //     );

  //   if (!sectionBelongsToCourse.exists) {
  //     throw new NotFoundException(
  //       `Section with ID ${createLessonDto.section} not found`,
  //     );
  //   }

  //   if (!sectionBelongsToCourse.belongsToCourse) {
  //     throw new BadRequestException(
  //       'Section does not belong to the specified course',
  //     );
  //   }

  //   // Map DTO properties to schema properties
  //   const lessonData: Partial<Lesson> = {
  //     title: createLessonDto.title,
  //     description: createLessonDto.description,
  //     order: createLessonDto.order,
  //     course: courseId, // Now using Schema.Types.ObjectId
  //     section: sectionId, // Now using Schema.Types.ObjectId
  //     type: createLessonDto.type,
  //     videoUrl: createLessonDto.videoUrl,
  //     content: createLessonDto.content,
  //     durationInMinutes: createLessonDto.durationInMinutes,
  //     isPreview: createLessonDto.isPreview,
  //   };

  //   // Use the repository to create the lesson
  //   const savedLesson = await this.coursesRepository.createLesson(lessonData);

  //   // Update the section to include this lesson - make sure _id exists
  //   if (!savedLesson._id) {
  //     throw new Error('Saved lesson does not have an _id');
  //   }

  //   await this.coursesRepository.updateSectionAddLesson(
  //     sectionId,
  //     savedLesson._id,
  //   );

  //   return savedLesson;
  // }

  async updateSection(
    id: string,
    updateSectionDto: any,
    userId: string,
  ): Promise<Section> {
    // Use the repository method to find the section
    const section = await this.coursesRepository.findSectionById(id);

    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    const course = await this.findCourseById(section.course.toString());

    // Check if user is the instructor of the course
    if (course.instructor.toString() !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update sections in this course',
      );
    }

    return this.coursesRepository.updateSection(id, updateSectionDto);
  }

  async deleteSection(id: string, userId: string): Promise<Section> {
    const section = await this.findSectionById(id);
    const courseId = section.course.toString();
    const course = await this.findCourseById(courseId);

    // Check if user is the instructor of the course
    if (course.instructor.toString() !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete sections in this course',
      );
    }

    return this.coursesRepository.deleteSection(id);
  }

  async updateLesson(
    id: string,
    updateLessonDto: any,
    userId: string,
  ): Promise<Lesson> {
    const lesson = await this.findLessonById(id);
    const courseId = lesson.course.toString();
    const course = await this.findCourseById(courseId);

    // Check if user is the instructor of the course
    if (course.instructor.toString() !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update lessons in this course',
      );
    }

    return this.coursesRepository.updateLesson(id, updateLessonDto);
  }

  async deleteLesson(id: string, userId: string): Promise<Lesson> {
    // Use the repository method to find the lesson
    const lesson = await this.coursesRepository.findLessonById(id);

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    const course = await this.findCourseById(lesson.course.toString());

    // Check if user is the instructor of the course
    if (course.instructor.toString() !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete lessons in this course',
      );
    }

    return this.coursesRepository.deleteLesson(id);
  }

  // Analytics methods
  async getPopularCourses(limit = 5): Promise<Course[]> {
    return this.coursesRepository.getPopularCourses(limit);
  }

  async getRecentCourses(limit = 5): Promise<Course[]> {
    return this.coursesRepository.getRecentCourses(limit);
  }

  async getFeaturedCourses(limit = 5): Promise<Course[]> {
    return this.coursesRepository.getFeaturedCourses(limit);
  }

  async getRelatedCourses(courseId: string, limit = 4): Promise<Course[]> {
    return this.coursesRepository.getRelatedCourses(courseId, limit);
  }

  async searchCourses(query: string, limit = 10): Promise<Course[]> {
    return this.coursesRepository.searchCourses(query, limit);
  }

  async enrollUserInCourse(
    userId: string,
    courseId: string,
    paymentId?: string,
  ): Promise<any> {
    const course = await this.findCourseById(courseId);

    if (course.status !== 'published') {
      throw new BadRequestException('Cannot enroll in an unpublished course');
    }

    return this.coursesRepository.enrollUserInCourse(
      new Types.ObjectId(userId),
      new Types.ObjectId(courseId),
      paymentId ? new Types.ObjectId(paymentId) : undefined,
    );
  }

  async getUserEnrollments(userId: string): Promise<any[]> {
    return this.coursesRepository.getUserEnrollments(
      new Types.ObjectId(userId),
    );
  }

  async getCourseEnrollments(courseId: string, userId: string): Promise<any[]> {
    const course = await this.findCourseById(courseId);

    // Check if user is the instructor of the course
    if (course.instructor.toString() !== userId) {
      throw new ForbiddenException(
        'You are not authorized to view enrollments for this course',
      );
    }

    return this.coursesRepository.getCourseEnrollments(
      new Types.ObjectId(courseId),
    );
  }

  async updateEnrollmentProgress(
    userId: string,
    courseId: string,
    lessonId: string,
    completed: boolean,
  ): Promise<any> {
    return this.coursesRepository.updateEnrollmentProgress(
      new Types.ObjectId(userId),
      new Types.ObjectId(courseId),
      new Types.ObjectId(lessonId),
      completed,
    );
  }

  async checkUserEnrollment(
    userId: string,
    courseId: string,
  ): Promise<boolean> {
    return this.coursesRepository.checkUserEnrollment(
      new Types.ObjectId(userId),
      new Types.ObjectId(courseId),
    );
  }

  async createReview(
    userId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<any> {
    // Check if course exists
    const course = await this.findCourseById(
      createReviewDto.courseId.toString(),
    );

    if (course.status !== 'published') {
      throw new BadRequestException('Cannot review an unpublished course');
    }

    return this.coursesRepository.createReview(
      new Types.ObjectId(userId),
      new Types.ObjectId(createReviewDto.courseId),
      createReviewDto.rating,
      createReviewDto.comment,
    );
  }

  async getCourseReviews(courseId: string): Promise<any[]> {
    return this.coursesRepository.getCourseReviews(
      new Types.ObjectId(courseId),
    );
  }

  async getUserReviews(userId: string): Promise<any[]> {
    return this.coursesRepository.getUserReviews(new Types.ObjectId(userId));
  }

  async deleteReview(reviewId: string, userId: string): Promise<any> {
    return this.coursesRepository.deleteReview(
      reviewId,
      new Types.ObjectId(userId),
    );
  }

  async generateCertificate(userId: string, courseId: string): Promise<any> {
    return this.coursesRepository.generateCertificate(
      new Types.ObjectId(userId),
      new Types.ObjectId(courseId),
    );
  }

  async getUserCertificates(userId: string): Promise<any[]> {
    return this.coursesRepository.getUserCertificates(
      new Types.ObjectId(userId),
    );
  }

  async verifyCertificate(certificateNumber: string): Promise<any> {
    const certificate =
      await this.coursesRepository.verifyCertificate(certificateNumber);

    if (!certificate) {
      throw new NotFoundException('Certificate not found or invalid');
    }

    return certificate;
  }
}
