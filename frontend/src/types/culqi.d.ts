// Culqi Checkout SDK Type Definitions
declare global {
  interface Window {
    Culqi: {
      publicKey: string;
      settings: (config: CulqiSettings) => void;
      options?: (config: CulqiOptions) => void;
      open: () => void;
      close: () => void;
      createToken: () => void;
      token?: CulqiToken;
      error?: CulqiError;
    };
    culqi?: () => void;
  }
}

export interface CulqiSettings {
  title: string;
  currency: string;
  amount: number;
  order?: string;
  description?: string;
  xculqirsaid?: string;
}

export interface CulqiOptions {
  lang?: 'es' | 'en';
  modal?: boolean;
  installments?: boolean;
  customButton?: string;
  style?: {
    logo?: string;
    maincolor?: string;
    buttontext?: string;
    maintext?: string;
    desctext?: string;
  };
}

export interface CulqiToken {
  id: string;
  type: string;
  email: string;
  creation_date: number;
  card_number: string;
  last_four: string;
  active: boolean;
  iin: {
    object: string;
    bin: string;
    card_brand: string;
    card_type: string;
    card_category: string;
    issuer: {
      name: string;
      country: string;
      country_code: string;
    };
  };
  client: {
    ip: string;
    ip_country: string;
    ip_country_code: string;
    browser: string;
    device_fingerprint: string;
    device_type: string;
  };
  metadata?: Record<string, any>;
}

export interface CulqiError {
  merchant_message: string;
  user_message: string;
  code: string;
}

export interface CulqiCardData {
  card_number: string;
  cvv: string;
  expiration_month: string;
  expiration_year: string;
  email: string;
}

export {};
