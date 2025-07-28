# Task Manager App

A minimal Task Manager demonstrating end‑to‑end CRUD, authentication, and mobile packaging:

- **Rails API** (Ruby 3.1+, JWT auth, PostgreSQL)  
- **Angular Frontend** (Angular 16+, Material, standalone components)  
- **Capacitor** packaging for iOS & Android  
- **Enum‑backed task status** with simple guarded transitions  

---

## 📝 Design Decisions

### Task Status Modeling

I opted to use Rails’ built‑in `enum` for the `status` column instead of a full state‑machine gem:

```ruby
# app/models/task.rb
enum status: {
  pending:     0,
  in_progress: 1,
  completed:   2,
  cancelled:   3
}
```
This keeps the controller logic straight forward while still giving us generated helper methods like `task.pending?`, `task.completed!`, minimal overhead allowing for less code to maintain and understand and still giving us the benefits of callback support and guarded transitions.

### Authentication

1. JWT‑based via a custom JsonWebToken helper
2. AuthController handles /login & /logout
3. UsersController handles /users (signup + profile + CRUD)
4. Angular interceptor attaches Authorization: Bearer <token> to every request

## Getting Started
### Prereqs

1. Ruby 3.1+ & Bundler
2. PostgreSQL (or any SQL database supported by Rails)
3. Node.js 16+ & npm (or yarn)
4. Angular CLI:

#### Clone the repo
```bash
git clone git@github.com:morgancollado/mocingbird-task-manager.git
cd mocingbird-task-manager
```

#### Environment variables
```dotenv
# rails/.env
JWT_SECRET=<rails secret>
```
Generate secrets with `rails secret`

#### Rails API set up
```bash
cd api
bundle install
rails db:create db:migrate
rails server
```
Server runs on localhost:3000
Endpoints are as follows 
- POST /users – signup
- POST /login – login
- DELETE /logout – logout
- GET /tasks – list tasks
- POST /tasks – create task
- PATCH /tasks/:id – update attrs & status
- DELETE /tasks/:id – delete task

#### Angular front end set up

```bash
cd client
npm install
```
Create `src/envrionments/envrionment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```
Serve the app
```bash
ng serve
```

Frontend routes are as follows:

- /login
- /signup
- /tasks (protected)
- /tasks/new
- /tasks/:id

#### Mobile Packaging (Capacitor)
```bash
npm run build
npx cap add ios android
npx cap copy
npx cap open ios   # or `android`
```

#### Tests
Backend tests written using rspec and can be run as follows 
```bash
cd rails
bundle exec rspec
```

Front end tests are run using `ng test` from the client directory.

This project is released under the MIT License.