import * as Yup from 'yup';
import { BlogCategories, BlogStatus } from '../interfaces/commonInterface';


export const blogValidationSchema = Yup.object().shape({
    title: Yup.string()
        .required('Title is required')
        .min(10, 'Title must be at least 15 characters')
        .max(200, 'Title must be less than 200 characters')
        .trim(),
    category: Yup.string()
        .required('Category is required')
        .oneOf(Object.values(BlogCategories), 'Please select a valid category '),

    status: Yup.string()
        .required('Status is required')
        .oneOf(Object.values(BlogStatus), 'Please select a valid status'),

    description: Yup.string()
        .required('Description is required')
        .min(1000, 'Description must be at least 1000 characters')
        .max(200000, 'Description must be less than 200000 characters')
        ,
});



export const validatePostInput = async (data: any) => {
    try {
        const validatedData = await blogValidationSchema.validate(data, {
            abortEarly: false,
        });
        return { isValid: true, data: validatedData };
    } catch (error) {
        if (error instanceof Yup.ValidationError) {
            return {
                isValid: false,
                errors: error.errors
            };
        }
        throw error;
    }
};








