# Root-level Dockerfile so Cloud Build / Cloud Run GitHub deploys work with the
# default settings (build context = repo root). The backend lives in shifting/.
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY shifting/pom.xml .
RUN mvn -B dependency:go-offline
COPY shifting/src ./src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
