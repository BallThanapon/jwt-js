# Express JWT Authentication (MySQL + Prisma)

ระบบ Authentication ตัวอย่างด้วย Node.js, Express, MySQL, Prisma ORM, bcrypt และ JWT ใช้ JavaScript (CommonJS)

## Requirements

- Node.js รุ่น LTS ที่ Prisma 6 รองรับ
- MySQL 8+ (หรือเวอร์ชันที่ Prisma 6 รองรับ)
- npm
- VS Code REST Client (ตัวเลือก) สำหรับไฟล์ `tests/auth.http`

## 1. ติดตั้ง dependencies

```bash
npm install
```

## 2. สร้าง MySQL database

เข้า MySQL แล้วรัน:

```sql
CREATE DATABASE auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 3. ตั้งค่า environment

คัดลอก `.env.example` เป็น `.env` แล้วแก้ `DATABASE_URL` และ `JWT_SECRET`

ตัวอย่าง:

```dotenv
PORT=3000
NODE_ENV=development
DATABASE_URL="mysql://root:your_password@localhost:3306/auth_db"
JWT_SECRET="replace_with_a_random_secret_at_least_32_bytes_long"
JWT_EXPIRES_IN="15m"
```

อย่านำไฟล์ `.env` หรือ JWT secret ขึ้น Git

## 4. สร้างตาราง

```bash
npx prisma migrate dev --name init
npx prisma generate
```

## 5. เริ่มเซิร์ฟเวอร์

```bash
npm run dev
```

API จะอยู่ที่ `http://localhost:3000`

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login with `identifier` (email or username) |
| GET | `/api/users/me` | Bearer JWT | Current user |
| GET | `/api/users` | Bearer JWT | Demo protected list endpoint |

## Example requests

### Register

`POST /api/auth/register`

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "TestPassword123"
}
```

### Login

`POST /api/auth/login`

```json
{
  "identifier": "test@example.com",
  "password": "TestPassword123"
}
```

The response includes `token`. Use it in protected requests:

```http
Authorization: Bearer YOUR_TOKEN
```

Use the sample requests in `tests/auth.http` with the VS Code REST Client extension, or create the same requests in Postman.

## Security notes

- Passwords are hashed using bcrypt (12 salt rounds).
- JWT is signed using HS256, has an expiry, issuer, and audience checks.
- Use HTTPS in production and keep `JWT_SECRET` private.
- Consider HttpOnly/Secure/SameSite cookies plus CSRF protection for browser sessions, or carefully protect bearer tokens from XSS.
- `/api/users` is a demo endpoint that lets any authenticated user list users. Add role-based authorization or remove it before production.
- Add account lockout/monitoring and stronger validation according to the application's requirements.
- This example does not implement refresh tokens or token revocation.

## Database schema

The Prisma model maps to MySQL table `users`, with `id`, `username`, `email`, `password`, `createdAt`, and `updatedAt`. `username` and `email` are unique.
