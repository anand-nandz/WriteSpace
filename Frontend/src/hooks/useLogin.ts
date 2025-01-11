import { useState } from "react";
import { LoginFormValues } from "../utils/interfaces/interfaces"
import { loginValidationSchema } from "../validations/userVal";
import { useFormik } from "formik";
import { axiosInstance } from "../config/api/axiosInstance";
import { setUserInfo } from "../redux/slices/UserSlice";
import { showToastMessage } from "../utils/toast";
import { USER } from "../utils/constants/constants";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const initialValues: LoginFormValues = {
    email: '',
    password: ''
}

export const useLogin = () => {
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch()
    const navigate = useNavigate()



    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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
        formik,
        showPassword,
        togglePasswordVisibility,
    }

}