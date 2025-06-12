import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { paymentStatusManager } from "../services/paymentStatusManager";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [visible, setVisible] = useState(false);
  const timeoutRefs = useRef(new Map());
  const notificationId = useRef(0);

  const isUserRole = () => {
    return userProfile && userProfile.role === "user";
  };

  const addNotification = (notification) => {
    const id = ++notificationId.current;
    const newNotification = {
      id,
      timestamp: Date.now(),
      autoHide: notification.autoHide !== false,
      duration: notification.duration || 5000,
      ...notification,
    };

    setNotifications((prev) => [...prev, newNotification]);
    setVisible(true);

    if (newNotification.autoHide) {
      const timeoutId = setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);

      timeoutRefs.current.set(id, timeoutId);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications((prev) => {
      const filtered = prev.filter((n) => n.id !== id);
      if (filtered.length === 0) {
        setVisible(false);
      }
      return filtered;
    });

    const timeoutId = timeoutRefs.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(id);
    }
  };

  const clearAllNotifications = () => {
    timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutRefs.current.clear();
    setNotifications([]);
    setVisible(false);
  };

  const showPaymentOverdueNotification = (payments) => {
    if (!isUserRole()) return;

    const count = payments.length;
    const message =
      count === 1
        ? `Pembayaran ${payments[0].periodData?.label} sudah terlambat!`
        : `${count} pembayaran sudah terlambat!`;

    return addNotification({
      type: "error",
      title: "Pembayaran Terlambat",
      message,
      icon: "⚠️",
      actions: [
        {
          label: "Bayar Sekarang",
          primary: true,
          onPress: () => {
            // Navigation akan di-handle di komponen yang menggunakan
          },
        },
      ],
      data: { payments, type: "overdue" },
    });
  };

  const showPaymentUpcomingNotification = (payments) => {
    if (!isUserRole()) return;

    const count = payments.length;
    const message =
      count === 1
        ? `Pembayaran ${payments[0].periodData?.label} akan jatuh tempo dalam 3 hari`
        : `${count} pembayaran akan jatuh tempo dalam 3 hari`;

    return addNotification({
      type: "warning",
      title: "Pembayaran Akan Jatuh Tempo",
      message,
      icon: "⏰",
      actions: [
        {
          label: "Lihat Detail",
          primary: true,
          onPress: () => {
            // Navigation akan di-handle di komponen yang menggunakan
          },
        },
      ],
      data: { payments, type: "upcoming" },
    });
  };

  const showPaymentSuccessNotification = (payment) => {
    if (!isUserRole()) return;

    return addNotification({
      type: "success",
      title: "Pembayaran Berhasil",
      message: `Pembayaran ${payment.periodData?.label} telah berhasil diproses`,
      icon: "✅",
      duration: 3000,
      data: { payment, type: "success" },
    });
  };

  const showUpdateNotification = (message, type = "info") => {
    if (!isUserRole()) return;

    return addNotification({
      type,
      title: "Status Diperbarui",
      message,
      icon: type === "success" ? "✅" : "ℹ️",
      duration: 3000,
    });
  };

  const showErrorNotification = (message, error = null) => {
    return addNotification({
      type: "error",
      title: "Error",
      message,
      icon: "❌",
      duration: 4000,
      data: { error },
    });
  };

  const showCreditAppliedNotification = (creditAmount, periodLabel) => {
    if (!isUserRole()) return;

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    };

    return addNotification({
      type: "success",
      title: "Credit Digunakan",
      message: `Credit ${formatCurrency(creditAmount)} berhasil diterapkan untuk ${periodLabel}`,
      icon: "💰",
      duration: 4000,
      data: { creditAmount, periodLabel, type: "credit_applied" },
    });
  };

  const showCreditBalanceNotification = (newBalance) => {
    if (!isUserRole()) return;

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    };

    return addNotification({
      type: "info",
      title: "Saldo Credit Diperbarui",
      message: `Saldo credit Anda sekarang: ${formatCurrency(newBalance)}`,
      icon: "💰",
      duration: 3000,
      data: { newBalance, type: "credit_balance_updated" },
    });
  };

  const showPaymentWithCreditNotification = (payment, creditUsed, remainingAmount) => {
    if (!isUserRole()) return;

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const message = remainingAmount > 0 
      ? `${payment.periodData?.label}: Credit ${formatCurrency(creditUsed)} diterapkan. Sisa ${formatCurrency(remainingAmount)}`
      : `${payment.periodData?.label}: Lunas dengan credit ${formatCurrency(creditUsed)}`;

    return addNotification({
      type: "success",
      title: "Pembayaran dengan Credit",
      message,
      icon: "💳",
      duration: 4000,
      data: { payment, creditUsed, remainingAmount, type: "payment_with_credit" },
    });
  };

  const showGeneralNotification = (
    title,
    message,
    type = "info",
    options = {}
  ) => {
    return addNotification({
      type,
      title,
      message,
      icon:
        options.icon ||
        (type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"),
      duration: options.duration || 4000,
      actions: options.actions,
      data: options.data,
    });
  };

  useEffect(() => {
    const unsubscribe = paymentStatusManager.addListener((type, data) => {
      if (!isUserRole()) return;

      switch (type) {
        case "payments_overdue":
          if (data.userId === userProfile?.id) {
            showPaymentOverdueNotification(data.payments);
          }
          break;

        case "payments_upcoming":
          if (data.userId === userProfile?.id) {
            showPaymentUpcomingNotification(data.payments);
          }
          break;

        case "user_payment_updated":
          if (data.userId === userProfile?.id && data.source !== "manual") {
            showUpdateNotification(
              `Data pembayaran diperbarui (${data.source})`,
              "success"
            );
          }
          break;

        default:
          break;
      }
    });

    return unsubscribe;
  }, [userProfile?.id, userProfile?.role]);

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, []);

  const value = {
    notifications,
    visible,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showPaymentOverdueNotification,
    showPaymentUpcomingNotification,
    showPaymentSuccessNotification,
    showUpdateNotification,
    showErrorNotification,
    showGeneralNotification,
    showCreditAppliedNotification,
    showCreditBalanceNotification,
    showPaymentWithCreditNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
