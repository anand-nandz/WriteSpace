import { useState } from "react";
import { ErrorResponse, LoginFormValues } from "../utils/interfaces/interfaces"
import { loginValidationSchema, validateEmail } from "../validations/userVal";
import { useFormik } from "formik";
import { axiosInstance } from "../config/api/axiosInstance";
import { setUserInfo } from "../redux/slices/UserSlice";
import { showToastMessage } from "../utils/toast";
import { USER } from "../utils/constants/constants";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@nextui-org/react";
import Swal from "sweetalert2";
import axios, { AxiosError } from "axios";

const initialValues: LoginFormValues = {
    email: '',
    password: ''
}

export const useLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [emailError, setEmailError] = useState('');
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    const dispatch = useDispatch()
    const navigate = useNavigate()



    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value;
        setForgotPasswordEmail(email)
        const errors = validateEmail({ email });
        setEmailError(errors.email);
    }
    
    const handleForgotPassword = async () => {
        try {

            if (!forgotPasswordEmail.trim()) {
                showToastMessage('Please enter a valid email address', 'error')
                return
            }
            if (emailError) {
                showToastMessage(emailError, 'error')
                return
            }
            setIsLoading(true);
            const response = await axiosInstance.post('/forgot-password', {
                email: forgotPasswordEmail
            })
            showToastMessage(response.data.message, "success");
            onOpenChange();
            Swal.fire({
                title: 'Reset Link Sent!',
                text: 'A password reset link has been sent to your email. It will be active for the next 30 minutes.',
                icon: 'success',
                timer: 5000,
                timerProgressBar: true,
            });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ErrorResponse>;
                const errorMessage = axiosError.response?.data?.message ||
                    axiosError.response?.data?.error ||
                    axiosError.message ||
                    "An error occurred while processing your request";
                showToastMessage(errorMessage, "error");
            } else {
                console.error('An unexpected error occurred:', error);
                showToastMessage("An unexpected error occurred", "error");
            }
        } finally {
            setIsLoading(false); 
        }
    };


    const formik = useFormik({
        initialValues,
        validationSchema: loginValidationSchema,
        onSubmit: (values) => {
            if (Object.keys(formik.errors).length === 0) {
                axiosInstance
                    .post('/login', values)
                    .then((response) => {
                        localStorage.setItem('userToken', response.data.token);
                        dispatch(setUserInfo(response.data.user));                        
                        showToastMessage(response.data.message, 'success')
                        navigate(`${USER.HOME}`);
                    })
                    .catch((error) => {
                        console.error(error);
                        showToastMessage(error.response.data.message, 'error')
                    });
            } else {
                showToastMessage('Please correct the validation errors before submitting', 'error')
            }

        }
    })
    return {
        isOpen,
        isLoading,
        formik,
        showPassword,
        forgotPasswordEmail,
        emailError,
        onOpen,
        onOpenChange,
        togglePasswordVisibility,
        handleForgotPassword,
        handleEmailChange
    }

}