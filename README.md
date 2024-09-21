# Next Js Starter template - [ STILL IN PROGRESS ]
this repo is my starter to full stack applications with all those [libraries](#libraries)

## Usage : 

```sh
  npx create-next-app@latest app_name -e https://github.com/PLMohamed/next-js-starter-template
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

## Libraries
This project utilize diffrent libraries such as :

- ORM : [Drizzle-ORM](https://orm.drizzle.team)
- CSS : [Tailwind Css](https://tailwindcss.com)
- Fetching : [React Query](https://tanstack.com/query/v3) for the client and [axios](https://axios-http.com)
- Form Validation : [Formik](https://formik.org) and [Yup](https://github.com/jquense/yup)
- Logger : [Winston](https://github.com/winstonjs/winston)

