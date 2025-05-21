import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
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

@Injectable()
export class CoursesService {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  async createCourse(createCourseDto: CreateCourseDto, instructorId: string): Promise<Course> {
    return this.coursesRepository.createCourse(
      createCourseDto, 
      new Types.ObjectId(instructorId)
    );
  }

//   async findAllCourses(
//     query: any = {},
//     page = 1,
//     limit = 10,
//   ): Promise<{ courses: Course[]; total: number; page: number; limit: number }> {
//     return this.coursesRepository.findAllCourses(query, page, limit);
//   }

async findAllCourses(
    page = 1,
    limit = 10,
    sort: Record<string, SortOrder> = { createdAt: -1 as SortOrder }
  ): Promise<{ courses: Course[]; total: number; page: number; limit: number }> {
    return this.coursesRepository.findAllCourses(page, limit, sort);
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

  async updateCourse(id: string, updateCourseDto: UpdateCourseDto, userId: string): Promise<Course> {
    const course = await this.findCourseById(id);
    
    // Check if user is the instructor of the course
    if (course.instructor.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to update this course');
    }
    
    return this.coursesRepository.updateCourse(id, updateCourseDto);
  }

  async deleteCourse(id: string, userId: string): Promise<Course> {
    const course = await this.findCourseById(id);
    
    // Check if user is the instructor of the course
    if (course.instructor.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to delete this course');
    }
    
    return this.coursesRepository.deleteCourse(id);
  }

  // Section methods
  async createSection(createSectionDto: CreateSectionDto, userId: string): Promise<Section> {
    const course = await this.findCourseById(createSectionDto.courseId.toString());
    
    // Check if user is the instructor of the course
    if (course.instructor.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to add sections to this course');
    }
    
    return this.coursesRepository.createSection(createSectionDto);
  }

  // async updateSection(id: string, updateSectionDto: any, userId: string): Promise<Section> {
  //   const section = await this.coursesRepository.sectionModel.findById(id).populate('course');
    
  //   if (!section) {
  //     throw new NotFoundException(`Section with ID ${id} not found`);
  //   }
    
  //   const course = await this.findCourseById(section.course.toString());
    
  //   // Check if user is the instructor of the course
  //   if (course.instructor.toString() !== userId) {
  //     throw new ForbiddenException('You are not authorized to update sections in this course');
  //   }
    
  //   return this.coursesRepository.updateSection(id, updateSectionDto);
  // }

  async updateSection(id: string, updateSectionDto: any, userId: string): Promise<Section> {
    // Use the repository method to find the section
    const section = await this.coursesRepository.findSectionById(id);
    
    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }
    
    const course = await this.findCourseById(section.course.toString());
    
    // Check if user is the instructor of the course
    if (course.instructor.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to update sections in this course');
    }
    
    return this.coursesRepository.updateSection(id, updateSectionDto);
  }

  async deleteSection(id: string, userId: string): Promise<Section> {
    const section = await this.findSectionById(id);
    const courseId = section.course.toString();
    const course = await this.findCourseById(courseId);
    
    // Check if user is the instructor of the course
    if (course.instructor.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to delete sections in this course');
    }
    
    return this.coursesRepository.deleteSection(id);
  }

//   async deleteSection(id: string, userId: string): Promise<Section> {
//     const section = await this.coursesRepository.sectionModel.findById(id).populate('course');
    
//     if (!section) {
//       throw new NotFoundException(`Section with ID ${id} not found`);
//     }
    
//     const course = await this.findCourseById(section.course.toString());
    
//     // Check if user is the instructor of the course
//     if (course.instructor.toString() !== userId) {
//       throw new ForbiddenException('You are not authorized to delete sections in this course');
//     }
    
//     return this.coursesRepository.deleteSection(id);
//   }

  // Lesson methods
  // async createLesson(createLessonDto: CreateLessonDto, userId: string): Promise<Lesson> {
  //   const course = await this.findCourseById(createLessonDto.courseId.toString());
    
  //   // Check if user is the instructor of the course
  //   if (course.instructor.toString() !== userId) {
  //     throw new ForbiddenException('You are not authorized to add lessons to this course');
  //   }
    
  //   // Validate that the section belongs to the course
  //   const section = await this.coursesRepository.sectionModel.findById(createLessonDto.sectionId);
    
  //   if (!section) {
  //     throw new NotFoundException(`Section with ID ${createLessonDto.sectionId} not found`);
  //   }
    
  //   if (section.course.toString() !== createLessonDto.courseId.toString()) {
  //     throw new BadRequestException('Section does not belong to the specified course');
  //   }
    
  //   return this.coursesRepository.createLesson(createLessonDto);
  // }

  async createLesson(createLessonDto: CreateLessonDto, userId: string): Promise<Lesson> {
    const course = await this.findCourseById(createLessonDto.courseId.toString());
    
    // Check if user is the instructor of the course
    if (course.instructor.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to add lessons to this course');
    }
    
    // Use the repository method to validate section belongs to course
    const sectionBelongsToCourse = await this.coursesRepository.validateSectionBelongsToCourse(
      createLessonDto.sectionId.toString(),
      createLessonDto.courseId.toString()
    );
    
    if (!sectionBelongsToCourse.exists) {
      throw new NotFoundException(`Section with ID ${createLessonDto.sectionId} not found`);
    }
    
    if (!sectionBelongsToCourse.belongsToCourse) {
      throw new BadRequestException('Section does not belong to the specified course');
    }
    
    return this.coursesRepository.createLesson(createLessonDto);
  }

//   async updateLesson(id: string, updateLessonDto: any, userId: string): Promise<Lesson> {
//     const lesson = await this.coursesRepository.lessonModel.findById(id).populate('course');
    
//     if (!lesson) {
//       throw new NotFoundException(`Lesson with ID ${id} not found`);
//     }
    
//     const course = await this.findCourseById(lesson.course.toString());
    
//     // Check if user is the instructor of the course
//     if (course.instructor.toString() !== userId) {
//       throw new ForbiddenException('You are not authorized to update lessons in this course');
//     }
    
//     return this.coursesRepository.updateLesson(id, updateLessonDto);
//   }

async updateLesson(id: string, updateLessonDto: any, userId: string): Promise<Lesson> {
    const lesson = await this.findLessonById(id);
    const courseId = lesson.course.toString();
    const course = await this.findCourseById(courseId);
    
    // Check if user is the instructor of the course
    if (course.instructor.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to update lessons in this course');
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
      throw new ForbiddenException('You are not authorized to delete lessons in this course');
    }
    
    return this.coursesRepository.deleteLesson(id);
  }

  // async deleteLesson(id: string, userId: string): Promise<Lesson> {
  //   const lesson = await this.coursesRepository.lessonModel.findById(id).populate('course');
    
  //   if (!lesson) {
  //     throw new NotFoundException(`Lesson with ID ${id} not found`);
  //   }
    
  //   const course = await this.findCourseById(lesson.course.toString());
    
  //   // Check if user is the instructor of the course
  //   if (course.instructor.toString() !== userId) {
  //     throw new ForbiddenException('You are not authorized to delete lessons in this course');
  //   }
    
  //   return this.coursesRepository.deleteLesson(id);
  // }

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

  async enrollUserInCourse(userId: string, courseId: string, paymentId?: string): Promise<any> {
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
    return this.coursesRepository.getUserEnrollments(new Types.ObjectId(userId));
  }
  
  async getCourseEnrollments(courseId: string, userId: string): Promise<any[]> {
    const course = await this.findCourseById(courseId);
    
    // Check if user is the instructor of the course
    if (course.instructor.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to view enrollments for this course');
    }
    
    return this.coursesRepository.getCourseEnrollments(new Types.ObjectId(courseId));
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
  
  async checkUserEnrollment(userId: string, courseId: string): Promise<boolean> {
    return this.coursesRepository.checkUserEnrollment(
      new Types.ObjectId(userId),
      new Types.ObjectId(courseId),
    );
  }

  async createReview(userId: string, createReviewDto: CreateReviewDto): Promise<any> {
    // Check if course exists
    const course = await this.findCourseById(createReviewDto.courseId.toString());
    
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
    return this.coursesRepository.getCourseReviews(new Types.ObjectId(courseId));
  }
  
  async getUserReviews(userId: string): Promise<any[]> {
    return this.coursesRepository.getUserReviews(new Types.ObjectId(userId));
  }
  
  async deleteReview(reviewId: string, userId: string): Promise<any> {
    return this.coursesRepository.deleteReview(reviewId, new Types.ObjectId(userId));
  }

  async generateCertificate(userId: string, courseId: string): Promise<any> {
    return this.coursesRepository.generateCertificate(
      new Types.ObjectId(userId),
      new Types.ObjectId(courseId),
    );
  }
  
  async getUserCertificates(userId: string): Promise<any[]> {
    return this.coursesRepository.getUserCertificates(new Types.ObjectId(userId));
  }
  
  async verifyCertificate(certificateNumber: string): Promise<any> {
    const certificate = await this.coursesRepository.verifyCertificate(certificateNumber);
    
    if (!certificate) {
      throw new NotFoundException('Certificate not found or invalid');
    }
    
    return certificate;
  }
}