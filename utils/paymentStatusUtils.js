export const updatePaymentStatusBasedOnDate = (payment, currentDate = new Date()) => {
  if (payment.status === 'lunas') {
    return payment;
  }

  const deadlineDate = new Date(payment.deadline || currentDate);
  const isOverdue = currentDate > deadlineDate;

  if (isOverdue && payment.status === 'belum_bayar') {
    return {
      ...payment,
      status: 'terlambat'
    };
  }

  return payment;
};

export const calculatePaymentProgress = (payments) => {
  const total = payments.length;
  if (total === 0) return 0;

  const completed = payments.filter(p => p.status === 'lunas').length;
  return Math.round((completed / total) * 100);
};

export const getPaymentStatusPriority = (status) => {
  const priorities = {
    'terlambat': 1,
    'belum_bayar': 2,
    'lunas': 3
  };
  return priorities[status] || 4;
};

export const sortPaymentsByStatus = (payments) => {
  return [...payments].sort((a, b) => {
    const priorityA = getPaymentStatusPriority(a.status);
    const priorityB = getPaymentStatusPriority(b.status);
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    const periodA = parseInt(a.periodKey.replace('period_', ''));
    const periodB = parseInt(b.periodKey.replace('period_', ''));
    return periodA - periodB;
  });
};

export const getNextPaymentDue = (payments) => {
  const unpaidPayments = payments.filter(p => 
    p.status === 'belum_bayar' || p.status === 'terlambat'
  );
  
  if (unpaidPayments.length === 0) return null;
  
  return unpaidPayments.sort((a, b) => {
    const periodA = parseInt(a.periodKey.replace('period_', ''));
    const periodB = parseInt(b.periodKey.replace('period_', ''));
    return periodA - periodB;
  })[0];
};

export const getPaymentStatusColor = (status, colors) => {
  switch (status) {
    case 'lunas':
      return colors.success;
    case 'belum_bayar':
      return colors.error;
    case 'terlambat':
      return colors.warning;
    default:
      return colors.gray500;
  }
};

export const getPaymentStatusIcon = (status) => {
  switch (status) {
    case 'lunas':
      return '✅';
    case 'belum_bayar':
      return '❌';
    case 'terlambat':
      return '⚠️';
    default:
      return '❓';
  }
};

export const formatPaymentAmount = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatPaymentDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};