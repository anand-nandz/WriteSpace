import { BlogCategories } from "../types/types";

export interface UserState {
    userData: UserData | null;
    isUserSignedIn: boolean,
    latestBlog: BlogData | null,
}


export interface UserData {
    _id: string;
    email: string;
    password?: string;
    name: string;
    contactinfo?: string;
    isActive: boolean;
    isGoogleUser: boolean;
    image?: string;
    createdAt: string | undefined;
    updatedAt: string | undefined;
}


export interface ValidationErrors {
    name: string;
    email: string;
    contactinfo: string;
    password: string;
    confirmPassword: string;
}

export interface ValidationValues {
    name: string;
    email: string;
    contactinfo: string;
    password: string;
    confirmPassword: string;
}


export interface UserFormValues {
    email: string;
    password: string;
    name: string;
    contactinfo: string;
    confirmPassword: string;
    isGoogleUser?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface OtpFormValues {
    otp: string;
}

export interface LoginFormValues {
    email: string;
    password: string;
}
export interface LoginErrorResponse {
    message?: string;
    error?: string;
}

export interface IProfileFormData {
    name: string;
    email: string;
    contactinfo: string;
    image?: File | string;
    isGoogleUser?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface IValidationErrors {
    name: string;
    contactinfo: string;
  };
  
  export interface IUserDetails {
    isOpen: boolean;
    onClose: () => void;
    user: UserData | null;
    onSave: (data: FormData) => Promise<void>
  
  }

  export interface BlogData {
    _id: string;
    title: string;
    description: string;
    imageUrl?: string ;
    blogId?: string;
    likeCount?: number; 
    dislikeCount?: number; 
    category: BlogCategories | '';
    status: BlogStatus | '';
    user_id?: string 
    createdAt: string;
    updatedAt: string;
    userId:{
      name: string
      email: string
      image: string
      contactinfo: string
    }
}

  
export interface BlogFormData {
  title: string;
  description: string;
  category: BlogCategories | '';
  status: BlogStatus | '';
  imageUrl?: (File | null)[];

}


export enum BlogStatus {
  Draft = 'Draft',
  Published = 'Published',
  Archived = 'Archived',
  Blocked = 'Blocked',
  Delete = 'Deleted'
}

export interface ErrorResponse {
  message?: string;
  error?: string;
}


export interface ResetFormValues {
  password: string;
  confirmPassword: string;
}

export const toastStyles = `
.Toastify__toast {
  background-color: #1a1a1a !important;
  color: #ffffff !important;
  border: 2px solid #000000;
  border-radius: 4px;
}

.Toastify__toast-icon {
  width: 20px;
  height: 20px;
}

.Toastify__close-button {
  color: #ffffff !important;
  opacity: 0.7;
}

.Toastify__close-button:hover {
  opacity: 1;
}

.Toastify__progress-bar {
  background: #404040 !important;
}

.Toastify__toast--success .Toastify__progress-bar {
  background: #2f855a !important;
}

.Toastify__toast--error .Toastify__progress-bar {
  background: #c53030 !important;
}
`;


export const formatDate = (dateInput?: string | Date): string => {
    if (!dateInput) {
      return 'Invalid date'; 
    }
  
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return 'Invalid date'; 
    }
  
    return date.toLocaleDateString('en-GB');
  };
  

  export interface BlogCardProps {
    image?: string | string[]
    title: string
    date?: string
    categories: string[]
    excerpt: string
    blogId?: string
    onEditClick?: () => void;
    onDelete?: () => void;
    isAll?: boolean
    author?: {
      name: string
      email: string
      image: string
      contactinfo: string
    }
}


export interface BlogModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  image?: string | string[]
  date?: string
  categories: string[]
  excerpt?: string
  author?: {
    name?: string
    email?: string
    image?: string
    contactinfo?: string
  }
}

// export interface BlogCardProps {
//   blog: {
//     _id: string
//     blogId: string
//     title: string
//     description: string
//     image?: string | string[]
//     categories: string[]
//     createdAt: string
//     author?: {
//       name: string
//       email: string
//       image: string
//       contactinfo: string
//     }
//   }
//   onEditClick?: () => void
//   isAll?: boolean
// }