export interface SpeedOption {
  name: string;
  value: string;
  default?: boolean;
  recommended?: boolean;
}

export interface ProfileItem {
  price: string;
  time: string;
  transfer?: string;
  validity?: string;
}

export interface SellPointItem {
  name: string;
  phone?: string;
}

export interface NetworkConfig {
  networkName: string;
  serviceNumber: string;
  newsLine: string;
  adImages: string[];
  popupAdvTime: number;
  enableLoyaltySystem: boolean;
  loginType: 'User' | 'UserPass';
  inputOnlyNumbers: boolean;
  loginSpeedsMode: boolean;
  enableUltraSpeed: boolean;
  speedTryChange: number;
  speedTryChangeTimeout: number;
  speeds: SpeedOption[];
  profiles: ProfileItem[];
  sellPoints: SellPointItem[];
  newsTitle: string;
  newsContent: string;
  newsCode: string;
  newsExtraTitle: string;
  newsExtraContent: string;
  newsExtraBadge: string;
  redirectToEsterahah: string;
  redirectToMobasher: string;
  appDetectorUrl: string;
  appOctopusUrl: string;
}

export interface SessionState {
  isLoggedIn: boolean;
  username: string;
  mac: string;
  ip: string;
  speed: string;
  updateOption: '_Uon' | '_Uoff';
  bytesIn: number;
  bytesOut: number;
  remainBytes: number;
  startTime: number;
  sessionTimeLeftSeconds: number;
}

export interface LoyaltyUser {
  phone: string;
  points: number;
  registeredAt: string;
  savedCards: {
    pin: string;
    date: string;
    pointsEarned: number;
    profile?: string;
  }[];
  loans: {
    id: string;
    amount: number;
    date: string;
    status: 'active' | 'repaid';
    cardCode: string;
  }[];
}

export interface BlockState {
  isBlocked: boolean;
  attemptsCount: number;
  blockExpiresAt: number;
  warningVisible: boolean;
}
