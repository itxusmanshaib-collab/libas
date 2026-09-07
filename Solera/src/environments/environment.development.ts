export const environment = {
  production: false,

  // ── App Info ──
  // Sirf yahan change karo — poori app mein automatically update hoga
  appName: 'Libas Junior',
  appTagline: "Men's Denim, Made Better",
  appDescription: 'Premium jeans and everyday denim for the modern man',

  // ── API ──
  apiUrl: 'https://localhost:7217/api',

  // ── Storage Keys ──
  tokenStorageKey: 'libas_junior_token',
  userStorageKey: 'libas_junior_user',

  // ── Assets ──
  logoPath: 'assets/images/logo.png',
  defaultProductImage: 'assets/images/no-image.png',

  // ── Settings ──
  currencySymbol: 'Rs.',
  defaultPageSize: 12,

  emailjs: {
    serviceId: 'YOUR_SERVICE_ID',
    templateId: 'YOUR_TEMPLATE_ID',
    publicKey: 'YOUR_PUBLIC_KEY',
  },
};
