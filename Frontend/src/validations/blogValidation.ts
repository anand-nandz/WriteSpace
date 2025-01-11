import * as Yup from 'yup';
import { BlogData } from '../utils/interfaces/interfaces';
import { BlogCategories, BlogStatus } from '../utils/types/types';

// Helper function to count total valid images
const countValidImages = (
    imageFiles: (File | null)[],
    existingImages: string[]
): number => {
    // Count new valid files
    const newValidImages = imageFiles.filter((file): file is File => file instanceof File).length;

    // Count existing image URLs
    const existingValidImages = existingImages.filter(url => url && url !== '').length;

    // Return total count
    return newValidImages + existingValidImages;
};

// Helper to normalize existing images array
const normalizeExistingImages = (existingImages?: string | string[]): string[] => {
    if (!existingImages) return [];
    return Array.isArray(existingImages) ? existingImages : [existingImages];
};

export const blogValidationSchema = (isEditMode: boolean, existingPost?: BlogData | null) => {
    return Yup.object().shape({
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
            .min(100, 'Description must be at least 100 characters')
            .max(50000, 'Description must be less than 50000 characters')
            ,
        images: Yup.array()
            .test('image-requirements', function (value) {
                if (!value) return this.createError({ message: 'Images are required' });

                const imageFiles = value as (File | null)[];
                const existingImages = isEditMode && existingPost
                    ? normalizeExistingImages(existingPost.imageUrl)
                    : [];

                // Get total count of valid images
                const totalImages = countValidImages(imageFiles, existingImages);

                // Validate minimum images
                if (totalImages < 1) {
                    return this.createError({ message: 'Please upload at least 1 images' });
                }

                // Validate maximum images
                if (!isEditMode && totalImages > 2) {
                    return this.createError({ message: 'Maximum 2 images allowed for new blogs' });
                }

                if (isEditMode && totalImages > 4) {
                    return this.createError({ message: 'Maximum 4 images allowed' });
                }

                // Validate file types and sizes
                const invalidFile = imageFiles.find(file => {
                    if (!file || !(file instanceof File)) return false;

                    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
                    if (!validTypes.includes(file.type)) {
                        return true;
                    }

                    if (file.size > 5 * 1024 * 1024) { // 5MB
                        return true;
                    }

                    return false;
                });

                if (invalidFile) {
                    return this.createError({
                        message: 'All images must be JPG, JPEG, PNG, or WebP and less than 5MB'
                    });
                }

                return true;
            })
    });
};











