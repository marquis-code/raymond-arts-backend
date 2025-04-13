// import { v2 as cloudinary } from 'cloudinary';
// import { ConfigService } from '@nestjs/config';

// export const CloudinaryProvider = {
//   provide: 'CLOUDINARY',
//   useFactory: (configService: ConfigService) => {
//     return cloudinary.config({
//       cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
//       api_key: configService.get('CLOUDINARY_API_KEY'),
//       api_secret: configService.get('CLOUDINARY_API_SECRET'),
//     });
//   },
//   inject: [ConfigService],
// };

import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  },
};
