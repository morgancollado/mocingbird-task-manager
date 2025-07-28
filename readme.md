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
This keeps the controller logic straight forward while still giving us generated helper methods like `task.pending?`, `task.completed!`, minimal overhead allowing for less code to maintain while still giving us the benefits of callback support and guarded transitions.

I had initially explored implementing the AASM gem to give tasks a robust state engine but decided to opt for enum only due to the complexity that AASM introduces that was not necessary for the scope of this project.

### Authentication

1. JWT‑based via a custom JsonWebToken helper
2. AuthController handles /login & /logout
3. UsersController handles /users (signup + profile + CRUD)
4. Angular interceptor attaches Authorization: Bearer <token> to every request
5. I opted for bcrypt and has_secure_password for authentication because it gives us a solid authencation foundation with minimal code. By leveraging rails built in auth convention we have less boiler plate and less dependencies to manage

### Api Design

I based the API on RESTful principles to keep it predictable and easy to consume:

- Resource‑oriented routing: /users, /login, /tasks with standard HTTP verbs (GET/POST/PATCH/DELETE) makes intent clear.
- Stateless JWT authentication: using a single Authorization: Bearer <token> header lets the backend remain stateless and scales easily.

#### Clear separation of concerns:

- AuthController handles only login/logout,
- UsersController handles signup and user CRUD,
- TasksController handles task CRUD and status transitions.

Partial updates via PATCH /tasks/:id allow both attribute changes and guarded status transitions in one call, reducing round‑trips.

Consistent JSON responses and HTTP status codes (200 OK, 201 Created, 422 Unprocessable Entity, 401 Unauthorized) give the client clear signals for success or error.

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
