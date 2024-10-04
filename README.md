# Next Js Starter template
this repo is my starter to full stack applications with all those [libraries](#libraries)

## Table of content
- [Usage](#usage)
- [Prerequisites](#prerequisites)
- [Features](#features)
- [Libraries](#libraries)

## Usage

```sh
  npx create-next-app@latest <app_name> -e https://github.com/PLMohamed/next-js-starter-template
```

Or

```sh
  git clone https://github.com/PLMohamed/next-js-starter-template .
```

after installing dependencies setup your env and db

```sh
    npm run db:setup
    npm run db:generate
    npm run db:migrate
```

this project support both local (Docker) and remote database to satisfy your needs

## Prerequisites

- [Node.js](https://nodejs.org/en) installed
- [Docker](https://www.docker.com) (Optional if you want to use local db and redis)

## Features
- <b>API for Authentication</b>: Built-in endpoints for user signup and login.
- <b>Token Management</b>: Secure token storage using Redis, with middleware for token verification .
- <b>Internationalization (i18n)</b>: Easily localize your application for different languages. 
- <b>ORM Integration</b>: The use of [Drizzle-ORM](https://orm.drizzle.team) for efficient database management with a simple and intuitive API.
- <b>Server less redis</b>: Easy redis caching strategies to improve application performance and reduce database load.
- <b>VSCode Debugger Configuration</b>: Preconfigured settings for debugging your Next.js application in Visual Studio Code.
- <b>Constants Management</b>: Centralize your application constants for easier maintenance and updates.
- <b>Form Validation</b>: Utilize Formik and Yup for handling forms and validating data
- <b>Logging</b>: Comprehensive logging capabilities with Winston for better debugging and monitoring.
- <b>Database Management</b>: Easy setup for databases with options for Docker Compose or traditional installations.
- <b>TypeScript Support</b>: Enjoy the benefits of type safety and improved developer experience.
- <b>Testing</b>: Preconfigured api testing to ensure code reliability.
- <b>Toast</b>: Integrated toast notifications for better user experience on actions and events within the application.



## Libraries
This project utilize diffrent libraries such as :

- Database : [PostgreSQL](https://www.postgresql.org)
- ORM : [Drizzle-ORM](https://orm.drizzle.team)
- CSS : [Tailwind Css](https://tailwindcss.com)
- Fetching : [React Query](https://tanstack.com/query/v3) and [axios](https://axios-http.com)
- Form Validation : [Formik](https://formik.org) and [Yup](https://github.com/jquense/yup)
- Logger : [Winston](https://github.com/winstonjs/winston)
- Tests : [Jest](https://jestjs.io) and [Supertest](https://github.com/ladjs/supertest)
- Toast : [React Hot Toast](https://react-hot-toast.com)
