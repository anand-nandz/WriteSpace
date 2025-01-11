import { AxiosInstance } from 'axios';


export type CreateAxiosInstance = (
    baseUrl: string,
    tokenKey: string,
    refreshTokenKey: string
  ) => AxiosInstance;
  
  export enum BlogStatus {
    DRAFT = "Draft",
    PUBLISHED = "Published",
    ARCHIVED = "Archived",
    Blocked = 'Blocked'
  }

  export enum BlogCategories {
    ALL= 'All',
    TECH = "Tech",
    LIFESTYLE= "Lifestyle",
    EDUCATION= "Education",
    HEALTH= "Health",
    TRAVEL= "Travel",
    FOOD= "Food",
    FASHION= "Fashion",
    BUSINESS= "Business",
    FINANCE= "Finance",
    SPORTS= "Sports",
    ENTERTAINMENT= "Entertainment",
    GAMING= "Gaming",
    SCIENCE= "Science",
    NEWS= "News",
    PERSONAL= "Personal",
    DIY= "DIY",
    ART= "Art",
    PHOTOGRAPHY= "Photography",
    PARENTING= "Parenting",
    RELATIONSHIPS= "Relationships",
    SPIRITUALITY= "Spirituality",
    ENVIRONMENT= "Environment",
    HISTORY= "History",
    BOOKS= "Books",
  };