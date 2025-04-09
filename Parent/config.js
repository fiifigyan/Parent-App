// Description: Application configuration.
export const appConfig = {
  APP_NAME: 'OFORI ATTA INTERNATIONAL SCHOOL',
  APP_SHORT_NAME: 'OAIS',
  APP_VERSION: '1.0.0',
  isDevelopment: process.env.NODE_ENV === 'development'
};

export const API_CONFIG = {
  BASE_URL: 'https://73xd35pq-2025.uks1.devtunnels.ms/api/parent',

  AUTH_ENDPOINTS: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgot',
    RESET_PASSWORD: '/auth/reset',
    LOGOUT: '/auth/logout',
  },
  ADMISSION_ENDPOINTS: {
    SUBMIT_ADMISSION_FORM: '/admissions/submit',
    GET_ADMISSION_STATUS: {
      BY_PARENT: '/admissions/status/:parentId',
      BY_APPLICATION: '/admissions/status/:applicationId'
    }
  },
  EVENT_ENDPOINTS: {
    BASE: '/events',
    BY_DATE: '/events?date=',
    REGISTER: '/events/:eventId/register',
    CANCEL: '/events/:eventId/cancel'
  },
  PASSWORD_REQUIREMENTS: {
    minLength: 8,
    needsUppercase: true,
    needsNumber: true,
    needsSpecialChar: true
  },
  REQUEST_TIMEOUT: 60000,
};

export const SCOPES = {
  ADMISSION_PHASE: [
    'purchase:form',
    'submit:admission',
    'view:status'
  ],
  MAIN_APP: [
    'read:dashboard',
    'read:profile',
    'read:events',
    'read:notifications',
    'purchase:form',
    'submit:admission',
    'manage:children',
    'view:payments',
    'make:payments'
  ]
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_INFO: 'userInfo',
  SELECTED_STUDENT: 'selectedStudent'
};

// Description: Firebase configuration.
export const firebaseConfig = {
  apiKey: "AIzaSyD-2z4Tm6GQw1Kv6b7hFZyJ1G4t9T2J1vA",
  authDomain: "royals-international-school.firebaseapp.com",
  projectId: "royals-international-school",
  storageBucket: "royals-international-school.appspot.com",
  messagingSenderId: "592534746069",
  appId: "1:592534746069:web:5c5b2a2b7c7f3d3b1c6c2e"
};

// Description: Payment configuration.
export const paymentConfig = {
  // Stripe API Configuration
  STRIPE_API_URL: 'https://api.stripe.com/v1',
  STRIPE_SECRET_KEY: 'YOUR_STRIPE_SECRET_KEY',

  // PayPal API Configuration
  PAYPAL_API_URL: 'https://api.sandbox.paypal.com',
  PAYPAL_CLIENT_ID: 'YOUR_PAYPAL_CLIENT_ID',
  PAYPAL_SECRET: 'YOUR_PAYPAL_SECRET',

  // Bank Transfer Mock API
  BANK_TRANSFER_API_URL: 'https://your-bank-api.com',

  // MoMo API Configuration
  MOMO_API_URL: 'https://momodeveloper.mtn.com/API-collections#api=collection&operation',
  MOMO_API_KEY: '6158fec0e4cc451a8cd79225226df29a',
  MOMO_SUBSCRIPTION_KEY: '2e7b4754a8e242208304dff1b39d1ea1'
};