import { Button, Card, CardBody } from '@nextui-org/react';
import { useEffect, useState } from 'react'
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import { OtpFormValues } from '../utils/interfaces/interfaces';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showToastMessage } from '../utils/toast';
import { axiosInstance } from '../config/api/axiosInstance';


const VerifyOtp = () => {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        const otpData = localStorage.getItem('otpData');
        console.log(otpData,'data');
        
        if (!otpData) {
            navigate('/signup');
            return;
        }

        const { otpExpiry } = JSON.parse(otpData);

        const startTimer = () => {
            const now = Date.now();
            if (otpExpiry > now) {
                setTimeLeft(Math.floor((otpExpiry - now) / 1000));

                const interval = setInterval(() => {
                    const currentTime = Date.now();
                    if (otpExpiry > currentTime) {
                        setTimeLeft(Math.floor((otpExpiry - currentTime) / 1000));
                    } else {
                        setTimeLeft(0);
                        localStorage.removeItem('otpData')
                        navigate('/signup');
                        clearInterval(interval);
                    }
                }, 1000);

                return () => clearInterval(interval);
            } else {
                setTimeLeft(0);
                localStorage.removeItem('otpData')
            }
        };

        startTimer();
    }, [navigate]);


    const handleVerify = async (values: OtpFormValues, { setSubmitting, setFieldError }: FormikHelpers<OtpFormValues>) => {
        setIsLoading(true);
        try {
            const otpData = localStorage.getItem('otpData');
            
            if (!otpData) {
                navigate('/signup');
                return;
            }
            const response = await axiosInstance.post('/verifyOtp', { otp: values.otp });
            showToastMessage(response.data.message, 'success');
            if (response.data.user) {
                localStorage.removeItem('otpData');
                navigate('/login');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'Invalid OTP';
                setFieldError('otp', errorMessage); // Set field error for formik
                showToastMessage(errorMessage, 'error'); // Display toast message
                if (error.response?.status === 400 && errorMessage === 'Session expired. Please sign up again.') {
                    setTimeout(() => {
                        navigate('/signup');
                    }, 2000);
                }
            } else {
                showToastMessage('An unexpected error occurred. Please try again.', 'error');
            }
        } finally {
            setIsLoading(false);
            setSubmitting(false);
        }

    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const validationSchema = Yup.object().shape({
        otp: Yup.string()
            .required('OTP is required')
            .matches(/^[0-9]+$/, "Must be only digits")
            .min(4, 'Must be exactly 4 digits')
            .max(4, 'Must be exactly 4 digits')
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] py-2 px-4">
            <Card className="w-full max-w-[1000px] md:p-6 bg-white shadow-xl">
                <div className="flex flex-col md:flex-row">
                    {/* Left Side - Image */}
                    <div className="hidden md:flex flex-1 relative min-h-[300px] md:min-h-[500px] rounded-2xl overflow-hidden">
                        <img
                            src="/images/login.png"
                            alt="Login illustration"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br " />
                    </div>

                    {/* Right Side - Form */}
                    <div className="flex-1 flex flex-col md:p-8 justify-center">
                        <h1 className="text-2xl text-center font-semibold mb-4 text-[#333]">
                            Verify OTP
                        </h1>
                        <Formik
                            initialValues={{ otp: '' }}
                            validationSchema={validationSchema}
                            onSubmit={handleVerify}
                        >
                            {({ isSubmitting }) => (
                                <Form className='space-y-4'>
                                    <CardBody className='flex flex-col gap-4 px-4'>
                                        <Field
                                            type='text'
                                            name='otp'
                                            placeholder='Enter OTP'
                                            className="w-full px-3 py-2 border rounded-md"
                                            disabled={isSubmitting}
                                        />
                                        <ErrorMessage name="otp" component="div" className="text-red-500 text-sm mt-1" />

                                        {timeLeft !== null && (
                                            <h2 className="text-center" color={timeLeft > 0 ? "blue-gray" : "red"}>
                                                {timeLeft > 0
                                                    ? `Time remaining: ${formatTime(timeLeft)}`
                                                    : "OTP has expired"}
                                            </h2>
                                        )}


                                        <div className='flex justify-between gap-4'>
                                            <Button
                                                type="submit"
                                                disabled={isLoading || !timeLeft || timeLeft === 0 || isSubmitting}
                                                className="bg-gray-900 text-white"
                                                fullWidth
                                            >
                                                {isSubmitting ? "Verifying..." : "Verify"}
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Form>

                            )}
                        </Formik>
                    </div>
                </div>
            </Card >
        </div >
    );
}

export default VerifyOtp