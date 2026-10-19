import { NetworkConfig, LoyaltyUser, BlockState, SessionState } from '../types/hotspot';
import { defaultConfig } from '../data/defaultConfig';

const STORAGE_KEYS = {
  CONFIG: 'tunisnet_config_v1',
  SAVED_CARDS: 'tunisnet_saved_cards_v1',
  LOYALTY_USER: 'tunisnet_loyalty_user_v1',
  BLOCK_STATE: 'tunisnet_block_state_v1',
  ACTIVE_SESSION: 'tunisnet_active_session_v1',
};

export const StorageService = {
  // Config
  getConfig(): NetworkConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (saved) {
        return { ...defaultConfig, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to parse config from storage', e);
    }
    return defaultConfig;
  },

  saveConfig(config: NetworkConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save config to storage', e);
    }
  },

  // Saved Cards (HotCookie)
  getSavedCards(): string[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_CARDS);
      return saved ? JSON.parse(saved) : ['98234156', '71049283', '39018475'];
    } catch {
      return ['98234156', '71049283'];
    }
  },

  addSavedCard(card: string): void {
    try {
      const clean = card.trim();
      if (!clean) return;
      const cards = this.getSavedCards().filter((c) => c !== clean);
      cards.unshift(clean);
      localStorage.setItem(STORAGE_KEYS.SAVED_CARDS, JSON.stringify(cards.slice(0, 10)));
    } catch (e) {
      console.warn('Failed to save card', e);
    }
  },

  clearSavedCards(): void {
    localStorage.removeItem(STORAGE_KEYS.SAVED_CARDS);
  },

  // Loyalty User
  getLoyaltyUser(): LoyaltyUser | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOYALTY_USER);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  },

  saveLoyaltyUser(user: LoyaltyUser): void {
    localStorage.setItem(STORAGE_KEYS.LOYALTY_USER, JSON.stringify(user));
  },

  clearLoyaltyUser(): void {
    localStorage.removeItem(STORAGE_KEYS.LOYALTY_USER);
  },

  // Anti-Guessing Blocker State
  getBlockState(): BlockState {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BLOCK_STATE);
      if (saved) {
        const state: BlockState = JSON.parse(saved);
        if (state.blockExpiresAt && Date.now() > state.blockExpiresAt) {
          return { isBlocked: false, attemptsCount: 0, blockExpiresAt: 0, warningVisible: false };
        }
        return state;
      }
    } catch {}
    return { isBlocked: false, attemptsCount: 0, blockExpiresAt: 0, warningVisible: false };
  },

  recordFailedAttempt(): BlockState {
    const current = this.getBlockState();
    const count = current.attemptsCount + 1;
    const warningVisible = count >= 10;
    const isBlocked = count >= 20;
    const blockExpiresAt = isBlocked ? Date.now() + 60 * 1000 : 0; // 1 minute block

    const newState: BlockState = {
      isBlocked,
      attemptsCount: count,
      blockExpiresAt,
      warningVisible,
    };
    localStorage.setItem(STORAGE_KEYS.BLOCK_STATE, JSON.stringify(newState));
    return newState;
  },

  resetFailedAttempts(): void {
    localStorage.removeItem(STORAGE_KEYS.BLOCK_STATE);
  },

  // Active Session
  getSession(): SessionState | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  },

  saveSession(session: SessionState | null): void {
    if (!session) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
    }
  },
};
