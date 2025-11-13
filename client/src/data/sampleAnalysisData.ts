import type { AnalysisData } from '../types/analysis.types';

// Sample data based on your backend analysis logs
// This can be used for testing the UI components

export const sampleAnalysisData: AnalysisData = {
  framework_analysis: {
    framework: 'Unknown',
    confidence: 0.0
  },
  
  dependency_graph: {
    'composer-setup.php': ['issues', 'a', 'in', 'stability', 'this', 'that'],
    'config/database.php': [],
    'public/index.php': [
      'Blog\\Services\\Router',
      'Blog\\Services\\Request',
      'Blog\\Exceptions\\ApiException',
      'Blog\\Services\\Response',
      'Blog\\Controllers\\PostController'
    ],
    'src/Controllers/PostController.php': [
      'Blog\\Services\\Request',
      'Blog\\Exceptions\\ApiException',
      'Blog\\Repositories\\PostRepository',
      'Blog\\Services\\Response',
      'Blog\\Models\\Post'
    ],
    'src/Database/DatabaseConnection.php': ['PDO', 'PDOException'],
    'src/Exceptions/ApiException.php': ['Exception'],
    'src/Models/Post.php': [],
    'src/Repositories/PostRepository.php': [
      'PDOException',
      'Blog\\Exceptions\\ApiException',
      'Blog\\Database\\DatabaseConnection',
      'PDO',
      'Blog\\Models\\Post'
    ],
    'src/Services/Request.php': [],
    'src/Services/Response.php': [],
    'src/Services/Router.php': ['Closure', 'Exception', 'Blog\\Exceptions\\ApiException']
  },
  
  files_summary: [
    {
      file_path: 'composer-setup.php',
      file_purpose: 'Composer installer script',
      file_type: 'HELPER',
      primary_functionality: 'Installs and manages the Composer PHP dependency manager',
      responsibility_type: 'application logic',
      dependencies: ['issues', 'a', 'in', 'stability', 'this', 'that']
    },
    {
      file_path: 'config/database.php',
      file_purpose: 'Configuration file for database connection',
      file_type: 'HELPER',
      primary_functionality: 'Defines the database connection details and options',
      responsibility_type: 'Configuration',
      dependencies: []
    },
    {
      file_path: 'public/index.php',
      file_purpose: 'This file serves as a web API entry point for a blog post management system.',
      file_type: 'HELPER',
      primary_functionality: 'It handles incoming HTTP requests, routes them to appropriate methods in the PostController class, and returns the response.',
      responsibility_type: 'Application logic',
      dependencies: [
        'Blog\\Services\\Router',
        'Blog\\Services\\Request',
        'Blog\\Exceptions\\ApiException',
        'Blog\\Services\\Response',
        'Blog\\Controllers\\PostController'
      ]
    },
    {
      file_path: 'src/Controllers/PostController.php',
      file_purpose: 'Blog post controller handling CRUD operations',
      file_type: 'CONTROLLER',
      primary_functionality: 'It handles incoming HTTP requests, routes them to appropriate methods in the PostController class, and returns the response.',
      responsibility_type: 'Application logic',
      dependencies: [
        'Blog\\Services\\Request',
        'Blog\\Exceptions\\ApiException',
        'Blog\\Repositories\\PostRepository',
        'Blog\\Services\\Response',
        'Blog\\Models\\Post'
      ]
    },
    {
      file_path: 'src/Database/DatabaseConnection.php',
      file_purpose: 'Database connection handler',
      file_type: 'HELPER',
      primary_functionality: 'Establishes and returns a PDO database connection using the provided configuration.',
      responsibility_type: 'infrastructure',
      dependencies: ['PDO', 'PDOException']
    },
    {
      file_path: 'src/Exceptions/ApiException.php',
      file_purpose: 'Custom exception handling for API errors',
      file_type: 'HELPER',
      primary_functionality: 'Creates and manages API exceptions with HTTP status codes',
      responsibility_type: 'error handling',
      dependencies: ['Exception']
    },
    {
      file_path: 'src/Models/Post.php',
      file_purpose: 'Post entity model',
      file_type: 'MODEL',
      primary_functionality: 'Represents a blog post with properties and validation',
      responsibility_type: 'data model',
      dependencies: []
    },
    {
      file_path: 'src/Repositories/PostRepository.php',
      file_purpose: 'Data access layer for blog posts',
      file_type: 'REPOSITORY',
      primary_functionality: 'Handles all database operations for blog posts including CRUD and search',
      responsibility_type: 'data access',
      dependencies: [
        'PDOException',
        'Blog\\Exceptions\\ApiException',
        'Blog\\Database\\DatabaseConnection',
        'PDO',
        'Blog\\Models\\Post'
      ]
    },
    {
      file_path: 'src/Services/Request.php',
      file_purpose: 'HTTP request handler',
      file_type: 'SERVICE',
      primary_functionality: 'Processes incoming HTTP requests and extracts data',
      responsibility_type: 'request handling',
      dependencies: []
    },
    {
      file_path: 'src/Services/Response.php',
      file_purpose: 'HTTP response handler',
      file_type: 'SERVICE',
      primary_functionality: 'Formats and sends HTTP responses with proper status codes',
      responsibility_type: 'response handling',
      dependencies: []
    },
    {
      file_path: 'src/Services/Router.php',
      file_purpose: 'Application router',
      file_type: 'SERVICE',
      primary_functionality: 'Routes HTTP requests to appropriate controller methods',
      responsibility_type: 'routing',
      dependencies: ['Closure', 'Exception', 'Blog\\Exceptions\\ApiException']
    }
  ],
  
  migration_phases: [
    {
      number: 1,
      name: 'Foundation and Configuration Migration',
      description: 'Convert basic configuration files and set up Node.js project structure. This includes database configuration and project setup.',
      estimated_time: '8 hours',
      file_count: 2,
      file_types: ['HELPER'],
      files: ['composer-setup.php', 'config/database.php'],
      risks: [
        'Environment configuration differences between PHP and Node.js',
        'Database connection string format differences'
      ],
      success_criteria: 'Node.js project is initialized with proper configuration files, and database connection is successfully established.',
      testing_strategy: 'Create unit tests for configuration loading and database connection. Test with different environment variables.'
    },
    {
      number: 2,
      name: 'Core Services Migration',
      description: 'Convert Request, Response, and Router services to Node.js equivalents. These are fundamental to the API functionality.',
      estimated_time: '16 hours',
      file_count: 3,
      file_types: ['SERVICE'],
      files: ['src/Services/Request.php', 'src/Services/Response.php', 'src/Services/Router.php'],
      risks: [
        'Differences in request/response handling between PHP and Node.js',
        'Middleware implementation differences',
        'Async/await vs synchronous code patterns'
      ],
      success_criteria: 'All service classes work correctly in Node.js environment with proper request/response handling and routing.',
      testing_strategy: 'Integration tests simulating various HTTP requests and responses. Test middleware chain execution.'
    },
    {
      number: 3,
      name: 'Model Layer Migration',
      description: 'Convert the Post model to use a Node.js ORM or data validation library. Ensure data structure consistency.',
      estimated_time: '12 hours',
      file_count: 1,
      file_types: ['MODEL'],
      files: ['src/Models/Post.php'],
      risks: [
        'Data type differences between PHP and JavaScript',
        'Validation logic inconsistencies',
        'Timestamp handling differences'
      ],
      success_criteria: 'Post model is fully functional in Node.js with all validation rules properly implemented.',
      testing_strategy: 'Unit tests to validate data integrity within the model. Test data mapping between the model and mock database results.'
    },
    {
      number: 4,
      name: 'Repository Layer Migration',
      description: 'Convert the PostRepository to use the Node.js database connection and model. This includes rewriting the database interaction logic.',
      estimated_time: '24 hours',
      file_count: 1,
      file_types: ['REPOSITORY'],
      files: ['src/Repositories/PostRepository.php'],
      risks: [
        'Differences in query building between PHP and Node.js',
        'Performance bottlenecks in database queries',
        'Incorrect data mapping between database results and model instances'
      ],
      success_criteria: 'All database operations (CRUD and search) in the PostRepository function correctly in Node.js.',
      testing_strategy: 'Integration tests to verify database interactions. Test CRUD operations and search functionality. Use a testing database to avoid impacting production data. Measure query performance and optimize as needed.'
    },
    {
      number: 5,
      name: 'Router Service Conversion',
      description: 'Convert the Router to use a Node.js framework like Express.js. This involves defining routes and mapping them to controller functions.',
      estimated_time: '16 hours',
      file_count: 1,
      file_types: ['SERVICE'],
      files: ['src/Services/Router.php'],
      risks: [
        'Incorrect route definitions',
        'Middleware conflicts',
        'Differences in request handling between PHP and Node.js/Express.js'
      ],
      success_criteria: 'Routes are correctly defined in Express.js and map to the appropriate controller functions. Middleware is correctly configured.',
      testing_strategy: 'Integration tests to verify route mapping and middleware functionality. Use tools like Supertest to simulate HTTP requests and assert responses.'
    },
    {
      number: 6,
      name: 'Controller Logic Migration',
      description: 'Convert the PostController logic to Node.js. This involves handling requests, interacting with the repository, and returning responses.',
      estimated_time: '32 hours',
      file_count: 1,
      file_types: ['CONTROLLER'],
      files: ['src/Controllers/PostController.php'],
      risks: [
        'Logic errors during conversion',
        'Incorrect handling of asynchronous operations',
        'Differences in error handling between PHP and Node.js'
      ],
      success_criteria: 'All controller functions handle requests correctly, interact with the repository, and return appropriate responses.',
      testing_strategy: 'Integration tests to verify end-to-end functionality of API endpoints. Use mock repositories to isolate controller logic. Test error handling scenarios.'
    },
    {
      number: 7,
      name: 'Entry Point and Final Integration',
      description: 'Convert the public/index.php file to a Node.js entry point. This involves setting up the Express.js application, loading middleware, and starting the server.',
      estimated_time: '8 hours',
      file_count: 1,
      file_types: ['HELPER'],
      files: ['public/index.php'],
      risks: [
        'Server configuration issues',
        'Port conflicts',
        'Incorrect environment variable settings'
      ],
      success_criteria: 'Node.js application starts successfully and handles all API requests.',
      testing_strategy: 'End-to-end tests to verify the entire application is functioning correctly. Monitor application logs for errors.'
    }
  ],
  
  top_risks: [
    'Data type inconsistencies between PHP and Node.js leading to data corruption.',
    'Performance degradation due to inefficient database queries or asynchronous operations.',
    'Security vulnerabilities introduced during the conversion process, especially related to database interactions.',
    'Logic errors in the converted code, leading to unexpected behavior.'
  ],
  
  code_understanding: `Project Purpose and Domain:
This project is a RESTful API for managing a blog, allowing users to create, read, update, and delete blog posts. It follows PSR-12 coding standards and uses a layered architecture (MVC pattern).

Main Features and Capabilities:
- RESTful API for blog management
- CRUD operations for blog posts
- Filtering posts by search terms
- JSON responses with appropriate HTTP status codes
- Composer autoloading (PSR-4)
- Proper error handling

Technology Stack Summary:
- PHP
- PSR-12 coding standards
- MVC pattern
- Composer
- PDO for database connection with prepared statements

Target Users/Audience:
This API is intended for developers who want to create a simple blog management system using PHP.

Business Logic Overview:
The API receives requests, processes them using the MVC pattern, and returns JSON responses. The main components are:

1. public/index.php: The entry point of the application, it sets up error reporting, loads the autoloader, and handles CORS.
2. src/Controllers/PostController.php: Handles the logic for blog post operations, such as creating, reading, updating, and deleting posts.
3. src/Models/Post.php: Defines the Post model, which represents a blog post with properties like ID, title, content, and timestamps.
4. src/Services/Request.php: Handles the incoming API requests, providing methods to get the request method and check if the request is a specific method.
5. src/Services/Response.php: Handles the API responses, providing a method to send JSON responses with appropriate status codes.
6. src/Services/Router.php: Handles the routing of API requests to the appropriate controllers.`,
  
  architectural_insights: {
    architectural_pattern: 'Layered Architecture (MVC pattern)',
    separation_of_concerns: "The project demonstrates a good separation of concerns, with distinct layers for the application's logic (Controllers, Models, Services), infrastructure (DatabaseConnection), and presentation (index.php).",
    scalability_considerations: 'The project is designed to handle a moderate number of users and blog posts, but for scalability, considerations such as caching, load balancing, and sharding could be implemented. The current database connection is not object-relational mapped, which might limit scalability in complex database operations.',
    maintainability_score: '7.5 (Out of 10)',
    technical_debt_indicators: "The project uses a custom exception class (ApiException), which is a good practice, but the lack of a specific framework might lead to duplicated code or inconsistencies in the long run. Also, the project does not have extensive testing, which could increase technical debt.",
    migration_to_nodejs_complexity: 'Medium',
    recommended_nodejs_architecture: 'A microservices architecture using Express.js for the API, with separate services for authentication, blog management, and database access. Use a package manager like npm for dependency management.',
    step_by_step_migration_strategy: [
      'Familiarize yourself with Node.js and Express.js.',
      'Set up a new project structure for the microservices architecture.',
      'Migrate the database connection and models to a suitable Node.js ORM like Sequelize or TypeORM.',
      'Implement the CRUD operations for blog posts using Express.js routes.',
      'Implement the filtering functionality.',
      'Implement error handling and proper responses.',
      'Implement authentication and authorization.',
      'Test the API thoroughly.'
    ]
  }
};

// Export a function to simulate API call with delay
export const fetchSampleData = (): Promise<AnalysisData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleAnalysisData);
    }, 1000); // Simulate 1 second API delay
  });
};