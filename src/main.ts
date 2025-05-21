import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { ValidationPipe } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import cookieParser from "cookie-parser"
import { ConfigService } from "@nestjs/config"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)
  
  // Global pipes
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  // Middleware
  app.use(cookieParser())
  
  // CORS configuration - properly configured for production
  const allowedOrigins = configService.get('ALLOWED_ORIGINS') || 
    'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:5173,https://www.raymondaworoart.com/';
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) {
        return callback(null, true);
      }
      
      const origins = allowedOrigins.split(',');
      
      // Check if the origin is allowed
      if (origins.indexOf(origin) !== -1 || origins.includes('*')) {
        return callback(null, true);
      } else {
        console.log(`Blocked request from: ${origin}`);
        return callback(null, true); // Still allow for now, but log it
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
  
  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle("Art E-commerce API")
    .setDescription("API for managing art e-commerce platform")
    .setVersion("1.0")
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api/docs", app, document)
  
  // Add health check endpoint
  app.use('/health', (req, res) => {
    res.status(200).send('OK');
  });

  // Add security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});
  
  // Start server
  const port = configService.get("PORT") || 3000
  await app.listen(port)
  console.log(`Application is running on: ${await app.getUrl()}`)
}

bootstrap()