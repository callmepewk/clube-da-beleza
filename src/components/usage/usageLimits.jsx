// Plan limits configuration
export const PLAN_LIMITS = {
  free: {
    name: 'Básico',
    reports: ['monthly', 'annual'],
    nurse_conversations_monthly: 20,
    nurse_conversations_weekly: 5,
    chatbots: 1,
    sites: 1,
    designs: 1,
    products: 1,
    ai_packages: 1
  },
  pro: {
    name: 'Intermediário',
    reports: ['daily', 'weekly', 'monthly', 'annual'],
    nurse_conversations_monthly: 50,
    chatbots: 2,
    sites: 3,
    designs: 5,
    products: 3,
    ai_packages: 3
  },
  premium: {
    name: 'Premium',
    reports: ['daily', 'weekly', 'monthly', 'annual'],
    nurse_conversations_monthly: -1, // unlimited
    chatbots: 5,
    sites: 10,
    designs: 10,
    products: 10,
    ai_packages: 10
  }
};

export const SECRETARY_WHATSAPP = '5531972595643';

export function getPlanLimits(planName = 'free') {
  return PLAN_LIMITS[planName] || PLAN_LIMITS.free;
}

export function canUseFeature(currentUsage, limit) {
  if (limit === -1) return true; // unlimited
  return currentUsage < limit;
}

export function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function sendWhatsAppMessage(userName, feature) {
  const message = encodeURIComponent(
    `Olá! Meu nome é ${userName} e gostaria de informações sobre a condição especial para ${feature}.`
  );
  window.open(`https://wa.me/${SECRETARY_WHATSAPP}?text=${message}`, '_blank');
}