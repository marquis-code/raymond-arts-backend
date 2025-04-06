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
  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  // Middleware
  app.use(cookieParser())

  // CORS
  app.enableCors({
    // origin: configService.get("FRONTEND_URL"),
    origin: true, // This allows requests from all origins
    credentials: true,
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

  // Start server
  const port = configService.get("PORT") || 3000
  await app.listen(port)
  console.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap()

