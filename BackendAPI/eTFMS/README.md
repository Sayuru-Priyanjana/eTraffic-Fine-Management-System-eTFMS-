# eTraffic Fine Management System (eTFMS) - Backend API

This is the backend API for the eTraffic Fine Management System (eTFMS). It is built using Spring Boot and provides RESTful endpoints for managing traffic fines, fine categories, and user authentication.

## Tech Stack
*   **Framework:** Spring Boot (Java 21)
*   **Build Tool:** Maven
*   **Database:** PostgreSQL
*   **ORM:** Spring Data JPA / Hibernate
*   **Security:** Spring Security with JWT Authentication
*   **Boilerplate reduction:** Lombok

## Prerequisites
Before you begin, ensure you have the following installed on your machine:
*   [Java Development Kit (JDK) 21](https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html) or higher
*   [Apache Maven](https://maven.apache.org/download.cgi)
*   [PostgreSQL](https://www.postgresql.org/download/)

## Setup & Configuration

### 1. Database Setup
Ensure PostgreSQL is running. Create a new database named `eTFMS`. You can do this via pgAdmin or the `psql` command line:
```sql
CREATE DATABASE "eTFMS";
```

### 2. Configure `application.properties`
The project's database configuration is located in `src/main/resources/application.properties`. 
Update the credentials if your local PostgreSQL setup differs from the defaults:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/eTFMS
spring.datasource.username=postgres
spring.datasource.password=0011 # <-- Update with your DB password
```
*(Note: Hibernate is configured with `update` so tables will be generated automatically when the app starts).*

## Running the Application

1.  Open a terminal and navigate to the root directory of the backend project (`/BackendAPI/eTFMS`).
2.  Build the project and download dependencies using Maven:
    ```bash
    mvn clean install
    ```
3.  Run the Spring Boot application:
    ```bash
    mvn spring-boot:run
    ```
    The server will start on `http://localhost:8080`.

## API Documentation

The application uses JWT tokens for security. You must first register/login to obtain a Bearer token, which should be included in the `Authorization` header for subsequent requests. 
*A complete collection of HTTP requests for testing is available in the `eTFMS.http` file at the root of the project.*

### Authentication (`/api/auth`)
*   `POST /api/auth/register`: Register a new user (Roles: ADMIN, POLICE_OFFICER, DRIVER).
    ```json
    {
      "id": "P-1001",
      "username": "officer_john",
      "password": "password123",
      "role": "POLICE_OFFICER"
    }
    ```
    *(Note: `id` is required for Police and Driver, but auto-generated for Admin)*
*   `POST /api/auth/login`: Authenticate and receive a JWT.
    ```json
    {
      "username": "officer_john",
      "password": "password123"
    }
    ```

### Fine Categories (`/api/categories`)
*(Requires **Admin Token** for modifications. **Police Token** can be used to list categories)*
*   `GET /api/categories`: List all fine categories.
*   `POST /api/categories`: Create a new category *(Admin Only)*.
    ```json
    {
      "identifier": "SPEEDING_TIER_1",
      "description": "Speeding over 10km/h but less than 20km/h",
      "amount": 3000.0
    }
    ```
*   `PUT /api/categories/{id}`: Update a category *(Admin Only)*.
    ```json
    {
      "identifier": "SPEEDING_TIER_1",
      "description": "Speeding over 10km/h but less than 20km/h",
      "amount": 3500.0
    }
    ```
*   `DELETE /api/categories/{id}`: Delete a category *(Admin Only)*.

### Fines (`/api/fines`)
*(Requires **Admin Token** for full access, **Police Token** to issue/view, and **Driver Token** to view own fines and settle)*
*   `POST /api/fines`: Issue a new fine *(Police/Admin)*.
    ```json
    {
      "categoryId": 1,
      "driverId": "B-9876543",
      "dueDate": "2026-12-31T23:59:59"
    }
    ```
*   `GET /api/fines`: Get all fines *(Admin)*.
*   `GET /api/fines/driver/{driverId}`: Get fines for a specific driver.
*   `GET /api/fines/officer/{officerId}`: Get fines issued by a specific officer.
*   `PUT /api/fines/{id}`: Update fine details/status *(Police/Admin)*.
    ```json
    {
      "categoryId": 1,
      "driverId": "B-9876543",
      "dueDate": "2026-12-31T23:59:59",
      "status": "PAID"
    }
    ```
*   `DELETE /api/fines/{id}`: Delete a fine *(Admin)*.
*   `POST /api/fines/{id}/settle`: Mark a fine as paid *(Driver Only)*.
    *(No request body required)*

## Project Structure Overview
*   `controller/`: Contains REST API endpoints.
*   `service/`: Contains the core business logic.
*   `repository/`: Interfaces for database interactions (Spring Data JPA).
*   `model/`: Entity classes representing database tables.
*   `dto/`: Data Transfer Objects for request/response payloads.
*   `security/`: JWT filters, authentication providers, and security configurations.
