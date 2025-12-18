import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDb from "./db";
import User from "@/model/user.Model";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";


const authOptions: NextAuthOptions = {
  // Authentication providers configuration
  providers: [
    CredentialsProvider({
      // Provider name displayed on the sign-in page
      name: "Credentials",
      
      // Define the input fields for the login form
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      
      // Authorization logic - validates user credentials
      async authorize(credentials, req) {
        const email = credentials?.email;
        const password = credentials?.password;
        
        // Validate that both email and password are provided
        if (!email || !password) {
          throw new Error("Invalid Credentials.");
        }

        // Connect to the database
        await connectDb();
        
        // Find user by email in the database
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("User not found.");
        }

        // Compare provided password with hashed password in database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          throw new Error("Invalid password.");
        }

        // Return user object on successful authentication
        // This data will be passed to the JWT callback
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image
        };
      }
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  
  // Callbacks to customize JWT and session behavior
  callbacks: {
    async signIn({ account, user, profile }) {
      if (account?.provider === 'google') {
        await connectDb();
        let existUser = await User.findOne({ email: user?.email });
        
        if (!existUser) {
          existUser = await User.create({
            name: user?.name,
            email: user?.email,
            image: user?.image
          });
        }
        
        // Attach the database user ID to the user object
        user.id = existUser._id.toString();
      }
      return true;
    },
    
    // JWT callback - called when JWT is created or updated
    // Adds custom user data to the JWT token
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }
      return token;
    },
    
    // Session callback - called when session is checked
    // Adds JWT token data to the session object accessible on client
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
      }
      return session;
    }
  },
  
  // Session configuration
  session: {
    strategy: "jwt", // Use JWT for session management (required for credentials)
    maxAge: 30 * 24 * 60 * 60 // Session expires in 30 days (in seconds)
  },
  
  // Custom pages for authentication
  pages: {
    signIn: "/login", // Custom login page
    error: "/login" // Redirect to login page on error
  },
  
  // Secret key for signing JWT tokens (keep this secure!)
  secret: process.env.AUTH_SECRET
};

export default authOptions;

/*
=============================================================================
NEXTAUTH AUTHENTICATION FLOW
=============================================================================

1. USER LOGIN REQUEST
   - User submits email and password through login form
   - Form sends POST request to /api/auth/signin endpoint

2. CREDENTIALS VALIDATION (authorize function)
   - NextAuth calls the authorize() function in CredentialsProvider
   - Checks if email and password are provided
   - Connects to database using connectDb()
   - Searches for user by email in User collection
   - If user not found, throws error
   - Compares password with hashed password using bcrypt
   - If password doesn't match, throws error
   - On success, returns user object with id, email, name, image

3. JWT TOKEN CREATION (jwt callback)
   - After successful authorization, jwt() callback is triggered
   - User data from authorize() is added to the JWT token
   - Token includes: id, name, email, image
   - Token is signed using AUTH_SECRET
   - Token is stored in an HTTP-only cookie

4. SESSION CREATION (session callback)
   - When client requests session data (e.g., getSession(), useSession())
   - session() callback is triggered
   - Decodes JWT token and extracts user data
   - Adds user data to session object
   - Returns session object to client

5. SESSION VERIFICATION
   - On subsequent requests, JWT token is automatically sent via cookie
   - NextAuth verifies token signature using AUTH_SECRET
   - If valid, user remains authenticated
   - If expired (after 30 days), user must log in again

6. PROTECTED ROUTES
   - Use getServerSession() on server or useSession() on client
   - Check if session exists and user is authenticated
   - Redirect to /login if not authenticated

7. LOGOUT
   - User calls signOut() function
   - JWT token cookie is cleared
   - User is redirected to login page

=============================================================================
ERROR HANDLING
=============================================================================
- Invalid credentials → Error thrown, user stays on login page
- User not found → Error thrown with "User not found" message
- Wrong password → Error thrown with "Invalid password" message
- All errors redirect to the error page (set to /login)

=============================================================================
SECURITY NOTES
=============================================================================
- Passwords are hashed with bcrypt (never stored in plain text)
- JWT tokens are signed and verified with AUTH_SECRET
- Tokens stored in HTTP-only cookies (not accessible via JavaScript)
- Session expires after 30 days of inactivity
- Always use HTTPS in production to protect credentials in transit
*/