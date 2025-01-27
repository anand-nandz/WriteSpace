import {
    Card,
    Input,
    Button,
    Link,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    CardHeader,
} from "@nextui-org/react";
import { Eye, EyeOff } from 'lucide-react';
import { USER } from '../utils/constants/constants';
import { useLogin } from '../hooks/useLogin';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { showToastMessage } from "../utils/toast";

const client_id = import.meta.env.VITE_CLIENT_ID || ''

const Login = () => {

    const { formik, showPassword, forgotPasswordEmail, emailError, isOpen, onOpen, onOpenChange, handleForgotPassword, handleGoogleSuccess, isLoading, handleEmailChange, togglePasswordVisibility,
    } = useLogin()

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4 py-6">
            <GoogleOAuthProvider clientId={client_id} >

                <Card className="w-full max-w-[1000px] p-4 md:p-6 bg-white shadow-xl">
                    <>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 flex flex-col justify-center px-2 md:px-4">
                                <CardHeader> <h1 className="text-2xl text-center font-bold mb-8 text-[#333]">
                                    Login
                                </h1>
                                </CardHeader>

                                <form onSubmit={formik.handleSubmit} className=" relative space-y-5 max-w-md mx-auto w-full">
                                    <div>
                                        <Input
                                            type="email"
                                            label="E-mail"
                                            variant="bordered"
                                            name='email'
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.email}
                                            placeholder="Enter your email"
                                            className="max-w-full"
                                            autoComplete="email"
                                        />
                                        {formik.touched.email && formik.errors.email && (
                                            <p className="text-sm" style={{ color: 'red' }}>
                                                {formik.errors.email}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Input
                                            label="Password"
                                            variant="bordered"
                                            placeholder="Enter your password"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            name="password"
                                            value={formik.values.password}
                                            endContent={
                                                <button
                                                    className="focus:outline-none"
                                                    type="button"
                                                    onClick={togglePasswordVisibility}
                                                >
                                                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                                </button>
                                            }
                                            type={showPassword ? "text" : "password"}
                                            className="max-w-full"
                                            autoComplete="new-password"
                                        />
                                        {formik.touched.password && formik.errors.password && (
                                            <p className="text-sm" style={{ color: 'red' }}>
                                                {formik.errors.password}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex justify-end">
                                        <Link onClick={onOpen} size="sm" className="text-black">
                                            Forgot Password?
                                        </Link>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-gray-900 text-white"
                                        size="lg"
                                    >
                                        Sign In
                                    </Button>
                                    <div className="text-center text-sm">
                                        Don't have an Account?{" "}
                                        <Link href={USER.SIGNUP} className="text-black">
                                            Sign Up
                                        </Link>
                                    </div>

                                </form>
                                <div className="flex justify-center mt-4">
                                    <GoogleLogin
                                        type='standard'
                                        theme='filled_black'
                                        size='medium'
                                        text='signin_with'
                                        shape='rectangular'
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => {
                                            showToastMessage('Google login failed', 'error');
                                        }}
                                    />
                                </div>


                            </div>

                            {/* Right Side - Illustration */}
                            <div className="flex-1 relative min-h-[300px] md:min-h-[500px] rounded-2xl overflow-hidden">

                                <img
                                    src="/images/login.png"
                                    alt="Login illustration"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-br" />

                            </div>
                        </div>
                        <div className="absolute bottom-4 left-0 right-0">
                            <Link href={USER.LANDINGPAGE} className="block">
                                <h2 className="font-bold text-black text-center">Explore WriteSpace</h2>
                            </Link>
                        </div>
                    </>

                </Card>


                <Modal
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    placement="center"
                    size="sm"
                    classNames={{
                        base: "bg-white rounded-lg shadow-lg",
                        header: "border-b border-gray-200",
                        body: "py-7",
                        closeButton: "hidden",
                    }}
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <div className="absolute top-2 right-2">
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <ModalHeader className="flex flex-col  items-center justify-center text-xl font-semibold text-black">
                                    Forgot Password
                                </ModalHeader>
                                <ModalBody>
                                    <div className="space-y-4 font-judson">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                                Email
                                            </label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Enter your email"
                                                value={forgotPasswordEmail}
                                                onChange={handleEmailChange}
                                                className="w-full "
                                                autoComplete="email"
                                            />
                                            {emailError ? (
                                                <p
                                                    className="text-sm"
                                                    style={{ color: "red", marginBottom: -15, marginTop: 5 }}
                                                >
                                                    {emailError}
                                                </p>
                                            ) : null}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Enter your email address and we'll send you a link to reset your password.
                                        </p>
                                    </div>
                                </ModalBody>
                                <ModalFooter className="flex justify-between space-x-4">
                                    <Button
                                        className="flex-1 font-judson bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        onClick={onClose}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex font-judson bg-black text-white hover:bg-gray-900"
                                        onClick={handleForgotPassword}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center">
                                                <span className="mr-2">Sending...</span>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            </div>
                                        ) : (
                                            "Send Reset Link"
                                        )}
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>

            </GoogleOAuthProvider>
        </div>
    );

}

export default Login