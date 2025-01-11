import { ValidationErrors, ValidationValues } from "../utils/interfaces/interfaces";
import * as Yup from 'yup';


export const validate = (values: ValidationValues): ValidationErrors => {
  const errors: ValidationErrors = {
    name: "",
    email: "",
    contactinfo: "",
    password: "",
    confirmPassword: ""
  };

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const mobileRegex = /^(91)?0?[6-9]\d{9}$/;

  if (!values.name.trim()) {
    errors.name = 'Name is required';
  } else if (!/^[A-Za-z\s]+$/i.test(values.name)) {
    errors.name = 'Should not contain numbers or special characters!';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(values.email)) {
    errors.email = 'Invalid email address';
  }

  if (!values.contactinfo.trim()) {
    errors.contactinfo = 'Phone is required';
  } else if (!mobileRegex.test(values.contactinfo)) {
    errors.contactinfo = 'Invalid mobile number';
  }

  if (!values.password.trim()) {
    errors.password = 'Password is required';
  } else if (!passwordRegex.test(values.password)) {
    errors.password = 'Password must contain at least 8 characters, including one uppercase, one lowercase, one number, and one special character.';
  }

  if (!values.confirmPassword.trim()) {
    errors.confirmPassword = 'Confirm Password is required';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match!';
  }

  return errors;
};


export const validateEmail = (values: Pick<ValidationValues, 'email'>): Pick<ValidationErrors, 'email'> => {
  const errors: Pick<ValidationErrors, 'email'> = {
    email: "",
  };

  // Regular Expression for email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Email validation
  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(values.email)) {
    errors.email = 'Invalid email address';
  }

  return errors;
};

export const validatePassword = (values: Pick<ValidationValues, 'password' | 'confirmPassword'>): Pick<ValidationErrors, 'password' | 'confirmPassword'> => {
  const errors: Pick<ValidationErrors, 'password' | 'confirmPassword'> = {
    password: "",
    confirmPassword: "",
  };

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!values.password.trim()) {
    errors.password = 'Password is required';
  } else if (!passwordRegex.test(values.password)) {
    errors.password = 'Password must contain at least 8 characters, including one uppercase, one lowercase, one number, and one special character.';
  }

  if (!values.confirmPassword.trim()) {
    errors.confirmPassword = 'Confirm Password is required';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match!';
  }

  return errors;
};


export const validateProfile = (values: Pick<ValidationValues, 'name' | 'contactinfo'>): Pick<ValidationErrors, 'name' | 'contactinfo'> => {
  const errors: Pick<ValidationErrors, 'name' | 'contactinfo'> = {
    name: "",
    contactinfo: "",
  };
  const mobileRegex = /^(91)?0?[6-9]\d{9}$/;
  if (!values.name.trim()) {
    errors.name = 'Name is required';
  } else if (!/^[A-Za-z\s]+$/i.test(values.name)) {
    errors.name = 'Should not contain numbers or special characters!';
  }

  if (!values.contactinfo.trim()) {
    errors.contactinfo = 'Phone is required';
  } else if (!mobileRegex.test(values.contactinfo)) {
    errors.contactinfo = 'Invalid mobile number';
  }



  return errors;
};



export const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least 8 characters, including one uppercase, one lowercase, one number, and one special character.'
    ),
});
