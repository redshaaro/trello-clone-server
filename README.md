# Trello Clone - Backend API

A feature-rich Trello-like task management system backend built with Node.js, Express, and PostgreSQL.

## Features

### 🔐 Authentication & User Management
- User registration and login with JWT tokens
- Password hashing with bcrypt
- Email-based password reset
- Change password (authenticated users)
- Edit username
- Delete account

### 📋 Board Management
- Create, read, update, and delete boards
- Board ownership and member-based access control
- Get all boards (owned and member boards)
- Role-based permissions (OWNER, ADMIN, MEMBER, VIEWER)

### 👥 Collaboration
- Invite users to boards via email
- Accept/decline/cancel invitations
- Get board members list
- Remove board members (OWNER/ADMIN only)
- Update member roles (OWNER only)
- Leave board (members only)
- Token-based invitation system with 15-minute expiry

### 📑 Columns
- Create columns in boards
- Get all columns for a board
- Edit column names
- Delete columns (OWNER/ADMIN only)
- Drag-and-drop column reordering
- Auto-positioning system

### ✅ Tasks
- Create tasks in columns
- Get all tasks in a column
- Get task by ID
- Edit task (title, description, status)
- Delete tasks
- Move tasks between columns
- Drag-and-drop task reordering
- Auto-positioning system
- Task status: todo, in-progress, done

### 💬 Task Comments
- Add comments to tasks
- View all comments with user details
- Delete own comments
- Board owners can delete any comment
- Comments ordered by newest first

### 🏷️ Task Labels
- Create and assign labels with colors
- Reusable labels across tasks
- Add/remove labels from tasks
- Label color customization
- Prevent duplicate label assignments

### 👤 Task Assignees
- Assign board members to tasks
- View all assigned users
- Unassign users from tasks
- Only board members can be assigned

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Database**: PostgreSQL
- **ORM**: Sequelize v6
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Email**: Nodemailer
- **Other**: CORS, dotenv

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=trello_clone
DB_HOST=localhost
DB_DIALECT=postgres

# JWT Secret (use a strong random string in production)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Email Configuration (for invitations and password reset)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

4. Create the database:
```bash
createdb trello_clone
```

5. Run migrations:
```bash
npx sequelize-cli db:migrate
```

6. Start the server:
```bash
npm run serve
```

The server will start on `http://localhost:3000` (or the PORT specified in .env)

## Database Schema

### Users
- `id` (PK)
- `username` (unique, required)
- `email` (unique, nullable)
- `password` (hashed, required)
- `resetPasswordToken` (nullable)
- `resetPasswordExpires` (nullable)

### Boards
- `id` (PK)
- `name`
- `user_id` (FK -> Users)
- `background_url` (nullable - URL to background image)

### Board Members
- `id` (PK)
- `board_id` (FK -> Boards)
- `user_id` (FK -> Users)
- `role` (OWNER, ADMIN, MEMBER, VIEWER)

### Invitations
- `id` (PK)
- `board_id` (FK -> Boards)
- `inviter_id` (FK -> Users)
- `invitee_email`
- `role`
- `token_hash`
- `status` (PENDING, ACCEPTED, DECLINED, CANCELLED, EXPIRED)
- `expires_at`

### Columns
- `id` (PK)
- `name`
- `board_id` (FK -> Boards)
- `position`

### Tasks
- `id` (PK)
- `title` (required, max 255 chars)
- `description` (TEXT, nullable - supports long content)
- `status` (ENUM: todo, in-progress, done)
- `column_id` (FK -> Columns)
- `position` (integer)

### Comments
- `id` (PK)
- `text` (TEXT, required)
- `task_id` (FK -> Tasks)
- `user_id` (FK -> Users)
- `createdAt`, `updatedAt`

### Labels
- `id` (PK)
- `name` (required)
- `color` (required, default: #3b82f6)
- `createdAt`, `updatedAt`

### Task_Labels (Junction Table)
- `id` (PK)
- `task_id` (FK -> Tasks)
- `label_id` (FK -> Labels)
- UNIQUE(task_id, label_id)

### Task_Assignees (Junction Table)
- `id` (PK)
- `task_id` (FK -> Tasks)
- `user_id` (FK -> Users)
- UNIQUE(task_id, user_id)

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login user

### User Routes (`/api/users`)
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `POST /change-password` - Change password (authenticated)
- `PUT /edit-username` - Update username (authenticated)
- `PUT /edit-email` - Update email (authenticated)
- `DELETE /delete-account` - Delete account (authenticated)

### Health Check
- `GET /health` - Check server status (no authentication required)

### Board Routes (`/api/boards`)
- `GET /` - Get all user boards (owned + member)
- `POST /createBoard` - Create a new board
- `GET /:boardId` - Get board by ID
- `PUT /:boardId` - Update board name
- `PUT /:boardId/background` - Update board background image
- `DELETE /:boardId` - Delete board (owner only)
- `POST /:boardId/invite` - Invite user to board
- `POST /invitation/accept` - Accept invitation
- `POST /invitation/decline` - Decline invitation
- `POST /invitation/cancel` - Cancel invitation
- `GET /:boardId/members` - Get board members
- `DELETE /:boardId/members/:memberId` - Remove board member
- `PUT /:boardId/members/:memberId/role` - Update member role
- `POST /:boardId/leave` - Leave board (members only)

### Column Routes (`/api/columns`)
- `POST /` - Create a new column
- `GET /:id` - Get all columns for a board
- `PUT /:id` - Edit column name
- `DELETE /:id` - Delete column
- `PUT /moveColumn` - Reorder columns

### Task Routes (`/api/tasks`)
- `POST /` - Create a new task
- `GET /:id` - Get all tasks in a column
- `GET /gettask/:id` - Get task by ID
- `PUT /:id` - Edit task
- `DELETE /:id` - Delete task
- `PUT /moveTask` - Move/reorder tasks
- `GET /:taskId/comments` - Get task comments
- `POST /:taskId/comments` - Add comment to task
- `DELETE /:taskId/comments/:commentId` - Delete comment
- `GET /:taskId/labels` - Get task labels
- `POST /:taskId/labels` - Add label to task
- `DELETE /:taskId/labels/:labelId` - Remove label from task
- `GET /:taskId/assignees` - Get task assignees
- `POST /:taskId/assignees` - Assign user to task
- `DELETE /:taskId/assignees/:userId` - Unassign user from task

## Role-Based Permissions

### OWNER
- Full control over the board
- Can delete the board
- Can change member roles
- Can invite/remove members
- Can create/edit/delete columns and tasks

### ADMIN
- Can edit board name
- Can invite/remove members (except other admins)
- Can create/edit/delete columns and tasks
- Cannot delete the board
- Cannot change roles

### MEMBER
- Can create/edit/delete tasks
- Can create/edit columns
- Cannot delete columns
- Cannot invite/remove members
- Cannot edit board settings

### VIEWER
- Read-only access
- Can view boards, columns, and tasks
- Cannot create, edit, or delete anything

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not enough permissions)
- `404` - Not Found
- `409` - Conflict (e.g., username already exists)
- `500` - Internal Server Error

## Security Features

- JWT-based authentication
- Password hashing with bcrypt (salt rounds: 10)
- Token expiration (1 hour for auth, 15 minutes for invites/reset)
- Role-based access control
- Input validation
- SQL injection protection (Sequelize ORM)
- CORS enabled

## Development

### Run in development mode:
```bash
npm run serve
```

### Create a new migration:
```bash
npx sequelize-cli migration:generate --name migration-name
```

### Run migrations:
```bash
npx sequelize-cli db:migrate
```

### Undo last migration:
```bash
npx sequelize-cli db:migrate:undo
```

## Email Configuration

For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in the `EMAIL_PASS` environment variable

## Project Structure

```
server/
├── config/
│   └── config.js              # Database configuration
├── migrations/                # Database migrations
├── models/                    # Sequelize models
│   ├── user.js
│   ├── board.js
│   ├── board_member.js
│   ├── invitation.js
│   ├── column.js
│   └── task.js
├── src/
│   ├── controllers/          # Route controllers
│   │   ├── auth.controller.js
│   │   ├── board.controller.js
│   │   ├── column.controller.js
│   │   └── task.controller.js
│   ├── middlewares/          # Express middlewares
│   │   ├── authMiddleware.js
│   │   └── checkBoardAccess.js
│   ├── routes/               # API routes
│   │   ├── auth.router.js
│   │   ├── boards.router.js
│   │   ├── columns.router.js
│   │   ├── tasks.router.js
│   │   └── users.router.js
│   ├── utils/                # Utility functions
│   │   └── permissions.js
│   ├── app.js                # Express app setup
│   └── server.js             # Server entry point
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

ISC

## Support

For issues and questions, please open an issue on the repository.

