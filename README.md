# Words

This is a Nest.js project that incorporates several technologies, including Swagger for API documentation, Mongoose for MongoDB, Node Mailer for sending emails, and JWT for authentication.

## Table of Contents

- [Words](#word)
  - [Table of Contents](#table-of-contents)
  - [Description](#description)
  - [Features](#features)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Email Notifications](#email-notifications)
  - [License](#license)

## Description

This project is built using Nest.js, a powerful framework for building scalable and efficient server-side applications with TypeScript. It combines various technologies to provide a robust foundation for your application, allowing you to focus on building your business logic.

## Features

- **Swagger API Documentation**: The API endpoints are documented using Swagger. The API documentation provides detailed information about each endpoint, making it easier for developers to understand and use the API.

- **Mongoose with MongoDB Database**: Mongoose, a popular ODM (Object Data Modeling) library for MongoDB and Node.js, is used instead of TypeORM. It provides a flexible and schema-based solution for interacting with MongoDB, allowing you to define data models and perform CRUD operations with ease.

- **Node Mailer**: The project utilizes Node Mailer to send emails. You can easily configure and send transactional emails, such as welcome emails, password reset emails, and more.

- **Authentication with JWT**: JWT (JSON Web Tokens) is employed for user authentication. It provides a secure way to authenticate users and manage user sessions without the need for server-side storage.

## Requirements

Before running the project, ensure you have the following dependencies installed:

- Node.js
- npm
- MongoDB

## Installation


1. Install the dependencies:

```bash
npm install
```

2. Set environment variables:

   - Create a `.env` file in the root directory and set the required environment variables, such as the email credentials, database configuration to match your setup (e.g., mongo db url etc.).

## Usage

To start the server, use the following command:

```bash
npm run start
```

The server will be running at `http://localhost:3000` by default. You can now access the API endpoints and test the functionalities.

## API Documentation

The API endpoints are documented using Swagger. To access the API documentation, navigate to `http://localhost:3000/api-docs` in your browser. The Swagger UI will display the available endpoints along with their descriptions and request/response details.

## Authentication

The project uses JWT for user authentication. To access protected routes, clients need to include the JWT token in the `Authorization` header of the request. The server will verify the token, and if valid, grant access to the protected resources.

To generate a JWT token, make a `POST` request to the `/auth/login` endpoint with valid user credentials. The server will respond with a JWT token that can be used for subsequent authenticated requests.

## Email Notifications

Node Mailer is integrated into the project to send emails. You can use the provided email service to send transactional emails to users. To configure the email service, update the email credentials in the `.env` file.

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use and modify the code to suit your needs.

---