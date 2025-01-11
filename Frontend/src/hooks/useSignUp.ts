import { useState } from "react";
import { UserFormValues } from "../utils/interfaces/interfaces";
import { validate } from "../validations/userVal";
import { useNavigate } from "react-router-dom";
import { showToastMessage } from "../utils/toast";
import { axiosInstance } from "../config/api/axiosInstance";
import axios from 'axios';

const initialValues: UserFormValues = {
  email: "",
  password: "",
  name: "",
  contactinfo: "",
  confirmPassword: "",
};


export const useSignup = () => {
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState<UserFormValues>(initialValues);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [e.target.name]: e.target.value });

    const errors = validate({ ...formValues, [name]: value });
    setFormErrors((prevErrors) => ({ ...prevErrors, ...errors }));

  };

  const togglePasswordVisibility1 = () => {
    setShowPassword1(!showPassword1);
  };
  const togglePasswordVisibility2 = () => {
    setShowPassword2(!showPassword2);
  };


  const submitHandler = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log(formValues, 'formvalues');

    const errors = validate(formValues);
    setFormErrors(errors);
    if (Object.values(errors).every((error) => error === "")) {
      setIsLoading(true);
      try {
        console.log('enetered');

        const response = await axiosInstance.post("/signup", formValues, {
          withCredentials: true
        });
        console.log(response, 'response');

        if (response.data.email) {
          showToastMessage('OTP sent successfully', 'success');
          localStorage.setItem('otpData', JSON.stringify({
            otpExpiry: response.data.otpExpiry,
            resendAvailableAt: response.data.resendAvailableAt,
            email: response.data.email
          }));
          navigate('/verifyOtp');
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error)
          showToastMessage(error?.response?.data?.message, 'error');
        } else {
          console.error('Failed to resend OTP:', error);
          showToastMessage('An unexpected error occurred. Please try again.', 'error');
        }

      } finally {
        setIsLoading(false);
      }
    }
  }


  return {
    formValues,
    formErrors,
    isLoading,
    showPassword1,
    showPassword2,
    handleChange,
    submitHandler,
    togglePasswordVisibility1,
    togglePasswordVisibility2,
  }
}