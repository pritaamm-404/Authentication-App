# Authentication App with Node.js, Express, MongoDB, and Passport

## Features
- Local Authentication (Email/Password)
- Google OAuth 2.0 Login
- Password Reset Functionality
- Protected Routes
- Session Management

## Prerequisites
- Node.js (v14 or later)
- MongoDB
- Google OAuth Credentials
- Gmail Account (for password reset emails)

## Installation

1. Clone the repository
```bash
git clone https://github.com/pritaamm-404/Authentication-App.git
cd Authentication-App
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/authapp
SESSION_SECRET=your_long_random_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

4. Google OAuth Setup
- Go to Google Cloud Console
- Create a new project
- Enable Google+ API
- Create OAuth 2.0 Credentials
- Set Authorized redirect URI to `http://localhost:3000/auth/google/callback`

5. Gmail App Password
- Enable 2-Step Verification
- Generate an App Password for your application

## Running the Application
```bash
# Development Mode
npm run dev

# Production Mode
npm start
```

## Project Structure
- `config/`: Passport and database configurations
- `controllers/`: Authentication logic
- `middleware/`: Route protection middleware
- `models/`: Mongoose user schema
- `routes/`: Express route definitions
- `views/`: EJS templates

## Environment Variables
- `PORT`: Server port
- `MONGODB_URI`: MongoDB connection string
- `SESSION_SECRET`: Session encryption key
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret
- `EMAIL_USER`: Gmail address for password reset
- `EMAIL_PASS`: Gmail App Password

## Security Features
- Password hashing with bcrypt
- Secure session management
- OAuth 2.0 authentication
- Password reset with time-limited tokens

## Troubleshooting
- Ensure MongoDB is running
- Check console for any error messages
- Verify all environment variables are set correctly

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## Acknowledgements

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Passport](http://www.passportjs.org/)
- [Google Cloud Console](https://console.cloud.google.com/)

## Contact

For any inquiries or support, please contact [trydaspritam@gmail.com](mailto:trydaspritam@gmail.com).