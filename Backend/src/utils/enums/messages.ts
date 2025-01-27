export const Messages = {
    Auth: {

        OTP_SENT: `OTP sent to your email for verification.`,
        REGISTER_SUCCESS: `Registration successful.`,
        LOGIN_SUCCESS: `Login successful.`,
        LOGOUT_SUCCESS: `Logged Out successfully...`,
        LOGIN_FAILED: 'Failed to login',
        FAIL_GENERATE_OTP: "Couldn't generate OTP",
        USER_REG_FAILED: 'Failed to register User',
        OTP_EXPIRED: `The OTP has expired. Please request a new one.`,
        INVALID_OTP: `The provided OTP is invalid.`,
        OTP_VERIFY_FAIL: `OTP verification failed`,
        EMAIL_ALREADY_EXISTS: `This email is already registered.`,
        USER_NOT_FOUND: `User not found. Please register.`,
        INVALID_PASSWORD: `Invalid password. Please try again.`,
        SESSION_EXPIRED: `Cookie expired`,
        ACCOUNT_CREATED: 'Account created successfully!',
        AUTHENTICATION_REQUIRED: 'Authentication required' ,
        NO_REFRESHTOKEN: 'No refresh token provided',
        REFRESHTOKEN_EXP: 'Refresh token expired',
        PASSWORD_RESET_LINK: 'Password reset link sent to your email' ,
        PASSWORD_RESET_SUCCESS: 'Password Reset Successfull',


    },


    Common: {

        DATA_RETRIEVED: `Data retrieved successfully.`,
        DATA_SAVED: `Data saved successfully.`,
        OPERATION_COMPLETED: `Operation completed successfully.`,
        INTERNAL_SERVER_ERROR: `An internal server error occurred. Please try again later.`,
        INVALID_INPUT: `Invalid input. Please check your request.`,
        PERMISSION_DENIED: `Permission denied.`,
        RESOURCE_NOT_FOUND: `Requested resource not found.`,
        PASSWORD_RESET_SENT: `Password reset instructions have been sent to your email.`,
        PROFILE_UPDATED: `Your profile has been updated.`,
        LOGOUT_SUCCESS: `You have been logged out successfully.`,
    },

    Warning: {
        UNAUTHORIZED_ACCESS: `Unauthorized access attempt detected.`,
        RATE_LIMIT: `You are sending too many requests. Please wait a while.`,
        TOKEN_NOT_VALID: 'Token is not valid',
        INVALID_PAYLOAD: 'Token payload is invalid',
        USER_ID_MISSING: 'User ID is missing',
        BLOG_ID_MISSING: 'Blog ID is missing',
        EMAIL_REQUIRED: 'Email is Requiresd',
        PASSWORD_REQUIRED: 'Password is required',


    }
};
