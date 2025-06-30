import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWaliPaymentHistory } from './waliPaymentService';
import { getAllUsersPaymentStatus } from './adminPaymentService';
import { getActiveTimeline } from './timelineService';

class PaymentStatusManager {
  constructor() {
    this.cache = new Map();
    this.lastUpdateTimes = new Map();
    this.isUpdating = new Set();
    this.throttleSettings = {
      perUser: 5 * 60 * 1000,
      perPage: 2 * 60 * 1000,
      backgroundResume: 30 * 60 * 1000
    };
    this.backgroundTime = null;
    this.listeners = new Set();
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(type, data) {
    this.listeners.forEach(callback => {
      try {
        callback(type, data);
      } catch (error) {
        console.error('Error notifying listener:', error);
      }
    });
  }

  getCacheKey(type, userId = null) {
    return userId ? `${type}_${userId}` : type;
  }

  async getFromCache(key) {
    try {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < this.throttleSettings.perPage) {
        return cached.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting from cache:', error);
      return null;
    }
  }

  setCache(key, data) {
    try {
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  shouldSkipUpdate(type, userId = null) {
    const key = this.getCacheKey(type, userId);
    const lastUpdate = this.lastUpdateTimes.get(key);
    
    if (!lastUpdate) return false;
    
    const timeSinceUpdate = Date.now() - lastUpdate;
    return timeSinceUpdate < this.throttleSettings.perUser;
  }

  markUpdateTime(type, userId = null) {
    const key = this.getCacheKey(type, userId);
    this.lastUpdateTimes.set(key, Date.now());
  }

  async updateUserPaymentStatus(userId, forceUpdate = false, source = 'manual') {
    if (!userId) return { success: false, error: 'User ID required' };

    const key = this.getCacheKey('user_payments', userId);
    
    if (!forceUpdate && this.shouldSkipUpdate('user_payments', userId)) {
      console.log(`Skipping user payment update for ${userId} due to throttling`);
      const cached = await this.getFromCache(key);
      if (cached) return { success: true, data: cached, fromCache: true };
    }

    if (this.isUpdating.has(key)) {
      console.log(`Update already in progress for ${userId}`);
      return { success: false, error: 'Update in progress' };
    }

    try {
      this.isUpdating.add(key);
      console.log(`Updating payment status for user ${userId} (source: ${source})`);

      const result = await getWaliPaymentHistory(userId);
      
      if (result.success) {
        this.setCache(key, result);
        this.markUpdateTime('user_payments', userId);
        
        this.notifyListeners('user_payment_updated', {
          userId,
          data: result,
          source
        });

        const overduePayments = this.checkForOverduePayments(result.payments || []);
        const upcomingPayments = this.checkForUpcomingPayments(result.payments || []);
        
        if (overduePayments.length > 0) {
          this.notifyListeners('payments_overdue', {
            userId,
            payments: overduePayments,
            count: overduePayments.length
          });
        }

        if (upcomingPayments.length > 0) {
          this.notifyListeners('payments_upcoming', {
            userId,
            payments: upcomingPayments,
            count: upcomingPayments.length
          });
        }

        return { success: true, data: result, source };
      }

      return result;
    } catch (error) {
      console.error('Error updating user payment status:', error);
      return { success: false, error: error.message };
    } finally {
      this.isUpdating.delete(key);
    }
  }

  async updateAllUsersPaymentStatus(forceUpdate = false, source = 'manual') {
    const key = this.getCacheKey('all_users_payments');
    
    if (!forceUpdate && this.shouldSkipUpdate('all_users_payments')) {
      console.log('Skipping all users payment update due to throttling');
      const cached = await this.getFromCache(key);
      if (cached) return { success: true, data: cached, fromCache: true };
    }

    if (this.isUpdating.has(key)) {
      console.log('All users update already in progress');
      return { success: false, error: 'Update in progress' };
    }

    try {
      this.isUpdating.add(key);
      console.log(`Updating payment status for all users (source: ${source})`);

      const result = await getAllUsersPaymentStatus();
      
      if (result.success) {
        this.setCache(key, result);
        this.markUpdateTime('all_users_payments');
        
        this.notifyListeners('all_users_updated', {
          data: result,
          source
        });

        return { success: true, data: result, source };
      }

      return result;
    } catch (error) {
      console.error('Error updating all users payment status:', error);
      return { success: false, error: error.message };
    } finally {
      this.isUpdating.delete(key);
    }
  }

  checkForOverduePayments(payments) {
    return payments.filter(payment => payment.status === 'terlambat');
  }

  checkForUpcomingPayments(payments) {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    
    return payments.filter(payment => {
      if (payment.status !== 'belum_bayar') return false;
      
      const dueDate = new Date(payment.dueDate);
      return dueDate <= threeDaysFromNow && dueDate > now;
    });
  }

  async handleAppStateChange(nextAppState, userId = null) {
    if (nextAppState === 'active') {
      const now = Date.now();
      const timeSinceBackground = this.backgroundTime ? now - this.backgroundTime : 0;
      
      if (timeSinceBackground > this.throttleSettings.backgroundResume) {
        console.log('App resumed after long background, updating payment status');
        
        if (userId) {
          await this.updateUserPaymentStatus(userId, false, 'app_resume');
        } else {
          await this.updateAllUsersPaymentStatus(false, 'app_resume');
        }
      }
    } else if (nextAppState === 'background') {
      this.backgroundTime = Date.now();
    }
  }

  async handleUserLogin(userId) {
    console.log('User logged in, updating payment status');
    return await this.updateUserPaymentStatus(userId, true, 'login');
  }

  async handlePageNavigation(page, userId = null) {
    const isPaymentPage = page.includes('payment') || page.includes('status');
    
    if (isPaymentPage) {
      console.log(`Navigated to payment page: ${page}`);
      
      if (userId) {
        return await this.updateUserPaymentStatus(userId, false, 'page_navigation');
      } else {
        return await this.updateAllUsersPaymentStatus(false, 'page_navigation');
      }
    }
    
    return { success: true, skipped: true };
  }

  async clearUserCache(userId) {
    if (userId) {
      const userKey = this.getCacheKey('user_payments', userId);
      this.cache.delete(userKey);
      this.lastUpdateTimes.delete(userKey);
    }
  }

  clearAllCache() {
    this.cache.clear();
    this.lastUpdateTimes.clear();
    this.isUpdating.clear();
  }

  getDebugInfo() {
    return {
      cacheSize: this.cache.size,
      lastUpdateTimes: Object.fromEntries(this.lastUpdateTimes),
      isUpdating: Array.from(this.isUpdating),
      throttleSettings: this.throttleSettings
    };
  }
}

export const paymentStatusManager = new PaymentStatusManager();