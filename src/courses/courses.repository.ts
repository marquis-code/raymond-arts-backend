import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, SortOrder, Schema as MongooseSchema, } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { Section, SectionDocument } from './schemas/section.schema';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { Enrollment, EnrollmentDocument } from './schemas/enrollment.schema';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Certificate, CertificateDocument } from './schemas/certificate.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { ObjectIdType } from '../common/types/mongoose-types';
import slugify from 'slugify';

@Injectable()
export class CoursesRepository {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Certificate.name) private certificateModel: Model<CertificateDocument>,
  ) {}

  async createCourse(createCourseDto: CreateCourseDto, instructorId: Types.ObjectId): Promise<Course> {
    const slug = slugify(createCourseDto.title, { lower: true });
    
    // Check if slug exists, append random string if needed
    const slugExists = await this.courseModel.exists({ slug });
    const finalSlug = slugExists 
      ? `${slug}-${Math.random().toString(36).substring(2, 8)}`
      : slug;
    
    const newCourse = new this.courseModel({
      ...createCourseDto,
      slug: finalSlug,
      instructor: instructorId,
    });
    
    return newCourse.save();
  }

//   async findAllCourses(
//     query: any = {},
//     page = 1,
//     limit = 10,
//     sort = { createdAt: -1 },
//   ): Promise<{ courses: Course[]; total: number; page: number; limit: number }> {
//     const skip = (page - 1) * limit;
    
//     // Build filter based on query parameters
//     const filter: any = {};
    
//     if (query.status) {
//       filter.status = query.status;
//     }
    
//     if (query.instructor) {
//       filter.instructor = new Types.ObjectId(query.instructor);
//     }
    
//     if (query.level) {
//       filter.level = query.level;
//     }
    
//     if (query.isFeatured) {
//       filter.isFeatured = query.isFeatured === 'true';
//     }
    
//     if (query.minPrice !== undefined && query.maxPrice !== undefined) {
//       filter.price = { 
//         $gte: Number(query.minPrice), 
//         $lte: Number(query.maxPrice) 
//       };
//     } else if (query.minPrice !== undefined) {
//       filter.price = { $gte: Number(query.minPrice) };
//     } else if (query.maxPrice !== undefined) {
//       filter.price = { $lte: Number(query.maxPrice) };
//     }
    
//     if (query.search) {
//       filter.$text = { $search: query.search };
//     }
    
//     if (query.tags) {
//       const tags = Array.isArray(query.tags) ? query.tags : [query.tags];
//       filter.tags = { $in: tags };
//     }
    
//     const total = await this.courseModel.countDocuments(filter);
//     const courses = await this.courseModel
//       .find(filter)
//       .sort(sort)
//       .skip(skip)
//       .limit(limit)
//       .populate('instructor', 'name email')
//       .exec();
    
//     return {
//       courses,
//       total,
//       page,
//       limit,
//     };
//   }

// async findAllCourses(
//     page: number = 1, 
//     limit: number = 10, 
//     sort: Record<string, SortOrder> = { createdAt: -1 as SortOrder }
//   ): Promise<{ courses: Course[]; total: number; page: number; limit: number }> {
//     const skip = (page - 1) * limit;
//     const [courses, total] = await Promise.all([
//       this.courseModel
//         .find({ status: 'published' })
//         .sort(sort)
//         .skip(skip)
//         .limit(limit)
//         .populate('instructor', 'name email')
//         .exec(),
//       this.courseModel.countDocuments({ status: 'published' }).exec(),
//     ]);

//     return {
//       courses,
//       total,
//       page,
//       limit,
//     };
//   }

async findAllCourses(
  page: number = 1, 
  limit: number = 10, 
  sort: Record<string, any> = { createdAt: -1 },
  query: Record<string, any> = {}
): Promise<{ courses: Course[]; total: number; page: number; limit: number }> {
  const skip = (page - 1) * limit;
  
  // Ensure sort values are valid MongoDB sort values (1, -1, 'asc', 'desc')
  const validSort: Record<string, any> = {};
  for (const [key, value] of Object.entries(sort)) {
    // Convert string values to proper sort orders
    if (value === 'asc' || value === 'ascending') {
      validSort[key] = 1;
    } else if (value === 'desc' || value === 'descending') {
      validSort[key] = -1;
    } else if (value === 1 || value === -1) {
      validSort[key] = value;
    }
    // Ignore invalid sort values
  }
  
  // If no valid sort keys were provided, use default sort
  if (Object.keys(validSort).length === 0) {
    validSort.createdAt = -1;
  }
  
  const [courses, total] = await Promise.all([
    this.courseModel
      .find(query)
      .sort(validSort)
      .skip(skip)
      .limit(limit)
      .populate('instructor', 'name email')
      .exec(),
    this.courseModel.countDocuments(query).exec(),
  ]);

  return {
    courses,
    total,
    page,
    limit,
  };
}

  async findCourseById(id: string): Promise<Course> {
    return this.courseModel
      .findById(id)
      .populate('instructor', 'name email')
      .populate({
        path: 'sections',
        populate: {
          path: 'lessons',
          model: 'Lesson',
        },
      })
      .exec();
  }

  async findCourseBySlug(slug: string): Promise<Course> {
    return this.courseModel
      .findOne({ slug })
      .populate('instructor', 'name email')
      .populate({
        path: 'sections',
        populate: {
          path: 'lessons',
          model: 'Lesson',
        },
      })
      .exec();
  }

  async updateCourse(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    // If title is updated, update slug as well
    if (updateCourseDto.title) {
      const slug = slugify(updateCourseDto.title, { lower: true });
      
      // Check if slug exists and is not the current course
      const slugExists = await this.courseModel.exists({ 
        slug, 
        _id: { $ne: id } 
      });
      
      if (slugExists) {
        updateCourseDto['slug'] = `${slug}-${Math.random().toString(36).substring(2, 8)}`;
      } else {
        updateCourseDto['slug'] = slug;
      }
    }
    
    return this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .exec();
  }

  async deleteCourse(id: string): Promise<Course> {
    // Delete all sections and lessons associated with this course
    const course = await this.courseModel.findById(id);
    
    if (course) {
      // Delete all sections
      await this.sectionModel.deleteMany({ course: id });
      
      // Delete all lessons
      await this.lessonModel.deleteMany({ course: id });
    }
    
    return this.courseModel.findByIdAndDelete(id).exec();
  }

  // Section methods
  // async createSection(createSectionDto: CreateSectionDto): Promise<Section> {
  //   const newSection = new this.sectionModel({
  //     ...createSectionDto,
  //     course: createSectionDto.courseId,
  //   });
    
  //   const savedSection = await newSection.save();
    
  //   // Update course to include this section
  //   await this.courseModel.findByIdAndUpdate(
  //     createSectionDto.courseId,
  //     { $push: { sections: savedSection._id } },
  //   );
    
  //   return savedSection;
  // }

  async updateSection(id: string, updateSectionDto: any): Promise<Section> {
    return this.sectionModel
      .findByIdAndUpdate(id, updateSectionDto, { new: true })
      .exec();
  }

  async deleteSection(id: string): Promise<Section> {
    const section = await this.sectionModel.findById(id);
    
    if (section) {
      // Delete all lessons in this section
      await this.lessonModel.deleteMany({ section: id });
      
      // Remove section from course
      await this.courseModel.findByIdAndUpdate(
        section.course,
        { $pull: { sections: id } },
      );
    }
    
    return this.sectionModel.findByIdAndDelete(id).exec();
  }

  async createSection(sectionData: Partial<Section>): Promise<Section> {
    const newSection = new this.sectionModel(sectionData);
    return newSection.save();
  }

  async createLesson(lessonData: Partial<Lesson>): Promise<Lesson> {
    const newLesson = new this.lessonModel(lessonData);
    return newLesson.save();
  }

  // // Lesson methods
  // async createLesson(createLessonDto: CreateLessonDto): Promise<Lesson> {
  //   const newLesson = new this.lessonModel({
  //     ...createLessonDto,
  //     section: createLessonDto.sectionId,
  //     course: createLessonDto.courseId,
  //   });
    
  //   const savedLesson = await newLesson.save();
    
  //   // Update section to include this lesson
  //   await this.sectionModel.findByIdAndUpdate(
  //     createLessonDto.sectionId,
  //     { $push: { lessons: savedLesson._id } },
  //   );
    
  //   // Update course total lessons and duration
  //   const course = await this.courseModel.findById(createLessonDto.courseId);
  //   await this.courseModel.findByIdAndUpdate(
  //     createLessonDto.courseId,
  //     { 
  //       totalLessons: course.totalLessons + 1,
  //       durationInMinutes: course.durationInMinutes + (createLessonDto.durationInMinutes || 0),
  //     },
  //   );
    
  //   return savedLesson;
  // }

  async updateLesson(id: string, updateLessonDto: any): Promise<Lesson> {
    const oldLesson = await this.lessonModel.findById(id);
    const updatedLesson = await this.lessonModel
      .findByIdAndUpdate(id, updateLessonDto, { new: true })
      .exec();
    
    // If duration changed, update course total duration
    if (oldLesson && updatedLesson && oldLesson.durationInMinutes !== updatedLesson.durationInMinutes) {
      const durationDiff = (updatedLesson.durationInMinutes || 0) - (oldLesson.durationInMinutes || 0);
      
      await this.courseModel.findByIdAndUpdate(
        updatedLesson.course,
        { $inc: { durationInMinutes: durationDiff } },
      );
    }
    
    return updatedLesson;
  }

  async deleteLesson(id: string): Promise<Lesson> {
    const lesson = await this.lessonModel.findById(id);
    
    if (lesson) {
      // Remove lesson from section
      await this.sectionModel.findByIdAndUpdate(
        lesson.section,
        { $pull: { lessons: id } },
      );
      
      // Update course total lessons and duration
      await this.courseModel.findByIdAndUpdate(
        lesson.course,
        { 
          $inc: { 
            totalLessons: -1,
            durationInMinutes: -(lesson.durationInMinutes || 0),
          } 
        },
      );
    }
    
    return this.lessonModel.findByIdAndDelete(id).exec();
  }

  // Analytics methods
  async getPopularCourses(limit = 5): Promise<Course[]> {
    return this.courseModel
      .find({ status: 'published' })
      .sort({ enrollmentCount: -1, averageRating: -1 })
      .limit(limit)
      .populate('instructor', 'name email')
      .exec();
  }

  async getRecentCourses(limit = 5): Promise<Course[]> {
    return this.courseModel
      .find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('instructor', 'name email')
      .exec();
  }

  async getFeaturedCourses(limit = 5): Promise<Course[]> {
    return this.courseModel
      .find({ status: 'published', isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('instructor', 'name email')
      .exec();
  }

  async getRelatedCourses(courseId: string, limit = 4): Promise<Course[]> {
    const course = await this.courseModel.findById(courseId);
    
    if (!course) {
      return [];
    }
    
    return this.courseModel
      .find({
        _id: { $ne: courseId },
        status: 'published',
        $or: [
          { tags: { $in: course.tags } },
          { level: course.level },
        ],
      })
      .limit(limit)
      .populate('instructor', 'name email')
      .exec();
  }

  async searchCourses(query: string, limit = 10): Promise<Course[]> {
    return this.courseModel
      .find(
        { 
          $text: { $search: query },
          status: 'published',
        },
        { score: { $meta: 'textScore' } },
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .populate('instructor', 'name email')
      .exec();
  }

  async updateCourseRating(courseId: string, rating: number): Promise<void> {
    const course = await this.courseModel.findById(courseId);
    
    if (course) {
      const newAverageRating = 
        (course.averageRating * course.reviewCount + rating) / (course.reviewCount + 1);
      
      await this.courseModel.findByIdAndUpdate(
        courseId,
        { 
          averageRating: newAverageRating,
          reviewCount: course.reviewCount + 1,
        },
      );
    }
  }

  async enrollUserInCourse(userId: Types.ObjectId, courseId: Types.ObjectId, paymentId?: Types.ObjectId): Promise<Enrollment> {
    // Check if user is already enrolled
    const existingEnrollment = await this.enrollmentModel.findOne({
      user: userId,
      course: courseId,
    });
    
    if (existingEnrollment) {
      return existingEnrollment;
    }
    
    // Create new enrollment
    const newEnrollment = new this.enrollmentModel({
      user: userId,
      course: courseId,
      payment: paymentId,
      lastAccessedAt: new Date(),
    });
    
    const savedEnrollment = await newEnrollment.save();
    
    // Update course enrollment count
    await this.courseModel.findByIdAndUpdate(
      courseId,
      { $inc: { enrollmentCount: 1 } },
    );
    
    return savedEnrollment;
  }
  
  async getUserEnrollments(userId: Types.ObjectId): Promise<Enrollment[]> {
    return this.enrollmentModel
      .find({ user: userId })
      .populate('course')
      .sort({ createdAt: -1 })
      .exec();
  }
  
  async getCourseEnrollments(courseId: Types.ObjectId): Promise<Enrollment[]> {
    return this.enrollmentModel
      .find({ course: courseId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }
  

async updateEnrollmentProgress(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    lessonId: Types.ObjectId,
    completed: boolean,
  ): Promise<Enrollment> {
    const enrollment = await this.enrollmentModel.findOne({
      user: userId,
      course: courseId,
    });
    
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }
    
    // Update the completed lessons array
    let completedLessons = enrollment.completedLessons || [];
    const lessonIndex = completedLessons.findIndex(
      (item) => item.lessonId.toString() === lessonId.toString(),
    );
    
    if (lessonIndex >= 0) {
      completedLessons[lessonIndex].completed = completed;
    } else {
      // Fix: Use MongooseSchema.Types.ObjectId to match the schema definition
      completedLessons.push({ 
        lessonId: lessonId as unknown as MongooseSchema.Types.ObjectId, 
        completed 
      });
    }
    
    // Calculate progress percentage
    const course = await this.courseModel.findById(courseId);
    const totalLessons = course.totalLessons;
    const completedCount = completedLessons.filter((item) => item.completed).length;
    const progressPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
    
    // Check if course is completed
    const isCompleted = progressPercentage >= 100;
    
    // Update enrollment
    return this.enrollmentModel.findOneAndUpdate(
      { user: userId, course: courseId },
      {
        completedLessons,
        progressPercentage,
        isCompleted,
        lastAccessedAt: new Date(),
      },
      { new: true },
    );
  }
  
  async checkUserEnrollment(userId: Types.ObjectId, courseId: Types.ObjectId): Promise<boolean> {
    const enrollment = await this.enrollmentModel.findOne({
      user: userId,
      course: courseId,
    });
    
    return !!enrollment;
  }

  // Add these methods to the class
async createReview(userId: Types.ObjectId, courseId: Types.ObjectId, rating: number, comment: string): Promise<Review> {
    // Check if user is enrolled in the course
    const isEnrolled = await this.checkUserEnrollment(userId, courseId);
    
    if (!isEnrolled) {
      throw new Error('You must be enrolled in the course to leave a review');
    }
    
    // Check if user has already reviewed this course
    const existingReview = await this.reviewModel.findOne({
      user: userId,
      course: courseId,
    });
    
    if (existingReview) {
      throw new Error('You have already reviewed this course');
    }
    
    // Create new review
    const newReview = new this.reviewModel({
      user: userId,
      course: courseId,
      rating,
      comment,
      isApproved: true, // Auto-approve for now, can be changed to require admin approval
    });
    
    const savedReview = await newReview.save();
    
    // Update course average rating
    await this.updateCourseRating(courseId.toString(), rating);
    
    return savedReview;
  }
  
  async getCourseReviews(courseId: Types.ObjectId): Promise<Review[]> {
    return this.reviewModel
      .find({ course: courseId, isApproved: true })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }
  
  async getUserReviews(userId: Types.ObjectId): Promise<Review[]> {
    return this.reviewModel
      .find({ user: userId })
      .populate('course')
      .sort({ createdAt: -1 })
      .exec();
  }
  
  async deleteReview(reviewId: string, userId: Types.ObjectId): Promise<Review> {
    const review = await this.reviewModel.findById(reviewId);
    
    if (!review) {
      throw new Error('Review not found');
    }
    
    if (review.user.toString() !== userId.toString()) {
      throw new Error('You are not authorized to delete this review');
    }
    
    // Update course average rating
    const course = await this.courseModel.findById(review.course);
    
    if (course && course.reviewCount > 1) {
      const newAverageRating = 
        (course.averageRating * course.reviewCount - review.rating) / (course.reviewCount - 1);
      
      await this.courseModel.findByIdAndUpdate(
        review.course,
        { 
          averageRating: newAverageRating,
          reviewCount: course.reviewCount - 1,
        },
      );
    } else if (course) {
      // If this is the only review, reset rating
      await this.courseModel.findByIdAndUpdate(
        review.course,
        { 
          averageRating: 0,
          reviewCount: 0,
        },
      );
    }
    
    return this.reviewModel.findByIdAndDelete(reviewId).exec();
  }

  // Add these methods to the class
async generateCertificate(userId: Types.ObjectId, courseId: Types.ObjectId): Promise<Certificate> {
    // Check if user has completed the course
    const enrollment = await this.enrollmentModel.findOne({
      user: userId,
      course: courseId,
    });
    
    if (!enrollment) {
      throw new Error('You are not enrolled in this course');
    }
    
    if (!enrollment.isCompleted) {
      throw new Error('You must complete the course to get a certificate');
    }
    
    // Check if certificate already exists
    const existingCertificate = await this.certificateModel.findOne({
      user: userId,
      course: courseId,
    });
    
    if (existingCertificate) {
      return existingCertificate;
    }
    
    // Generate certificate number
    const certificateNumber = `CERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString().substring(9)}`;
    
    // Create new certificate
    const newCertificate = new this.certificateModel({
      user: userId,
      course: courseId,
      certificateNumber,
      issueDate: new Date(),
      // Certificate URL would be generated by a separate service
      certificateUrl: `/certificates/${certificateNumber}`,
    });
    
    return newCertificate.save();
  }
  
  async getUserCertificates(userId: Types.ObjectId): Promise<Certificate[]> {
    return this.certificateModel
      .find({ user: userId })
      .populate('course')
      .sort({ issueDate: -1 })
      .exec();
  }
  
  async verifyCertificate(certificateNumber: string): Promise<Certificate> {
    return this.certificateModel
      .findOne({ certificateNumber })
      .populate('user', 'name email')
      .populate('course', 'title')
      .exec();
  }

  async findSectionById(id: string): Promise<Section> {
    return this.sectionModel.findById(id).populate('course').exec();
  }
  
  async findLessonById(id: string): Promise<Lesson> {
    return this.lessonModel.findById(id).populate('course').exec();
  }
  
//   async findCourseById(id: string): Promise<Course> {
//     return this.courseModel.findById(id).exec();
//   }
  
//   async deleteSection(id: string): Promise<Section> {
//     // First, find and remove all lessons in this section
//     await this.lessonModel.deleteMany({ section: id });
    
//     // Then delete the section
//     return this.sectionModel.findByIdAndDelete(id).exec();
//   }
  
//   async updateLesson(id: string, updateLessonDto: any): Promise<Lesson> {
//     return this.lessonModel.findByIdAndUpdate(id, updateLessonDto, { new: true }).exec();
//   }

// async findLessonById(id: string): Promise<Lesson> {
//   return this.lessonModel.findById(id).populate('course').exec();
// }

// async findSectionById(id: string): Promise<Section> {
//   return this.sectionModel.findById(id).populate('course').exec();
// }

// async deleteLesson(id: string): Promise<Lesson> {
//   return this.lessonModel.findByIdAndDelete(id).exec();
// }

// async updateSection(id: string, updateSectionDto: any): Promise<Section> {
//   return this.sectionModel.findByIdAndUpdate(id, updateSectionDto, { new: true }).exec();
// }

async validateSectionBelongsToCourse(sectionId: ObjectIdType, courseId: ObjectIdType): Promise<{ exists: boolean; belongsToCourse: boolean }> {
  const section = await this.sectionModel.findById(sectionId).exec();
  
  if (!section) {
    return { exists: false, belongsToCourse: false };
  }
  
  return { 
    exists: true, 
    belongsToCourse: section.course.toString() === courseId 
  };
}

async updateSectionAddLesson(sectionId: ObjectIdType, lessonId: ObjectIdType): Promise<Section> {
  // const objectIdSectionId = toObjectId(sectionId);
  // const objectIdLessonId = toObjectId(lessonId);
  
  const updatedSection = await this.sectionModel.findByIdAndUpdate(
    sectionId,
    { $push: { lessons: lessonId } },
    { new: true }
  ).exec();
  
  if (!updatedSection) {
    throw new Error(`Section with ID ${sectionId} not found`);
  }
  
  return updatedSection;
}
}