import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course, CourseSchema } from './schemas/course.schema';
import { Section, SectionSchema } from './schemas/section.schema';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { Enrollment, EnrollmentSchema } from './schemas/enrollment.schema';
import { Review, ReviewSchema } from './schemas/review.schema';
import { Certificate, CertificateSchema } from './schemas/certificate.schema';
import { CoursesRepository } from './courses.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Section.name, schema: SectionSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Certificate.name, schema: CertificateSchema },
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService, CoursesRepository],
  exports: [CoursesService],
})
export class CoursesModule {}