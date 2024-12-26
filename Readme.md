# Custom URL Shortener API

## Overview
The Custom URL Shortener API is a scalable and efficient solution designed to simplify the sharing of long URLs by creating concise short URLs. This system also provides advanced analytics, user authentication via Google Sign-In, and rate limiting to ensure secure and reliable usage.

---

## Features

### 1. User Authentication
- **Google Sign-In:** Simplified user registration and login process using Google authentication.

### 2. URL Shortening
- **Short URL Generation:** Shortens long URLs for easy sharing.
- **Custom Alias:** Option to create a custom alias for the short URL.
- **Topic-Based Grouping:** Categorize URLs under specific topics such as acquisition, activation, and retention.

### 3. Redirect Functionality
- Redirect users from a short URL to the original long URL.
- **Analytics Tracking:** Tracks user interactions such as timestamp, user agent, IP address, and geolocation.

### 4. URL Analytics
- **Individual Analytics:** Provides total clicks, unique users, and detailed breakdowns by date, OS type, and device type.
- **Topic-Based Analytics:** Aggregated performance metrics for URLs grouped under specific topics.
- **Overall Analytics:** Comprehensive performance metrics for all URLs created by the user.

### 5. Rate Limiting
- Restricts the number of URLs a user can create within a specified time frame to prevent abuse.

### 6. Caching
- **Redis Integration:** Caches short and long URLs and analytics data to improve performance and reduce database load.

### 7. Scalability
- Dockerized application to enable seamless deployment and scalability on cloud hosting platforms like AWS or Heroku.

---

## Installation

### Prerequisites
- **Node.js** (v14 or later)
- **Docker**
- **Redis**
- **MongoDB** (or your database of choice)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/Nikunj-Khinchi/ShortURL.git
   ```

2. Install dependencies:
   ```bash
    cd shortUrl
   npm install
   ```

3. Refer to the `.env.example` file for environment variable configurations.

4. Start the application normally:
   ```bash
   npm start
   ```

5. To run the application using Docker:
   - Use the provided `docker-compose.yml` file:
     ```bash
     docker-compose up --build
     ```
   - The Docker container is pushed here: [Docker Hub Link](https://hub.docker.com/repository/docker/nikunjkhinchi/shortenurl).
   - You can also use the Docker image from Docker Hub by running the following changes in the `docker-compose.yml` file:
     ```yaml
        services:
        app:
            image: nikunjkhinchi/shortenurl:latest
            ...
     ```
    - Then run the following command:
      ```bash
        docker-compose up
        ```
6. The application will be running on `http://localhost:<PORT>`.



---

## Deployment
The service has been deployed on the Render platform. Access the live service here: [Render Deployment Link](https://shorturl-7r29.onrender.com/).

---

## API Documentation

### Base URL
`http://localhost:<PORT>`

### Endpoints

#### User Authentication
| Endpoint           | Method | Description                        |
|--------------------|--------|------------------------------------|
| `/auth/google`     | GET    | Authenticate using Google Sign-In. |

#### URL Shortening
| Endpoint           | Method | Description                                              |
|--------------------|--------|----------------------------------------------------------|
| `/api/shorten`     | POST   | Create a new short URL.                                  |
| `/api/shorten/:id` | GET    | Redirect to the original URL.                            |

#### Analytics
| Endpoint                         | Method | Description                                                 |
|----------------------------------|--------|-------------------------------------------------------------|
| `/api/analytics/:alias`          | GET    | Retrieve analytics for a specific short URL.               |
| `/api/analytics/topic/:topic`    | GET    | Retrieve analytics for all URLs under a specific topic.    |
| `/api/analytics/overall`         | GET    | Retrieve overall analytics for all user-created URLs.      |

#### API Documentation
| Endpoint       | Method | Description                              |
|----------------|--------|------------------------------------------|
| `/api-docs`    | GET    | Access API documentation for developers. |

---

## Testing

Run the tests using:
```bash
npm test
```

---

## Technologies Used
- **Backend Framework:** Node.js (Express.js)
- **Database:** MongoDB
- **Cache:** Redis
- **Authentication:** Google Sign-In
- **Containerization:** Docker
- **Documentation:** Swagger
- **Testing:** Jest, Supertest

---

## Contribution Guidelines
1. Fork the repository.
2. Create a new feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Submit a pull request.
