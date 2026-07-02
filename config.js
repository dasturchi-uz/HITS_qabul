// Hackathon IT School CRM - Configuration
// Copy this file and update with your Supabase credentials

const CONFIG = {
  // Supabase Configuration
  supabase: {
    url: 'YOUR_SUPABASE_URL', // e.g., 'https://your-project.supabase.co'
    key: 'YOUR_SUPABASE_ANON_KEY' // e.g., 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },

  // Application Configuration
  app: {
    name: 'Hackathon IT School',
    year: '2026',
    phone: '+998 50 045 60 10',
    address: 'Farg\'ona shahri, Mustaqillik shoh ko\'chasi, 341-uy',
    coordinates: {
      lat: 40.355617,
      lng: 71.767729
    }
  },

  // Admin Panel Configuration
  admin: {
    defaultPassword: 'admin123', // Change this immediately after first login
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxLoginAttempts: 5
  },

  // Features Configuration
  features: {
    enableRegistration: true,
    enableAdminPanel: true,
    enableNotifications: true,
    enableReports: true
  },

  // Pricing Configuration (in UZS)
  pricing: {
    dayStudent: 2350000,
    transportStudent: 2500000,
    dormitoryStudent: 3300000
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
