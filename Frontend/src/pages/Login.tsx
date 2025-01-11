import {
    Card,
    Input,
    Button,
    Link,
} from "@nextui-org/react";
import { Eye, EyeOff } from 'lucide-react';
import { USER } from '../utils/constants/constants';
import { useLogin } from '../hooks/useLogin';

const Login = () => {

    const { formik, showPassword, togglePasswordVisibility,
    } = useLogin()

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
            <Card className="w-full max-w-[1000px] p-4 md:p-6 bg-white shadow-xl">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Side - Login Form */}
                    <div className="flex-1 flex flex-col justify-center">
                        <h1 className="text-2xl font-semibold mb-8 text-[#333]">
                            Login
                        </h1>
                        <form onSubmit={formik.handleSubmit} className="space-y-6 max-w-md">
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
                                <Link href="#" size="sm" className="text-black">
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
                <div>
                    <div>
                        <Link href={USER.LANDINGPAGE} className="text-black">
                            <h2 className="font-bold text-inherit text-black text-center">Explore WriteSpace</h2>
                        </Link>

                    </div>
                </div>
            </Card>

        </div>
    );

}

export default Login