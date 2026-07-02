// Hackathon IT School - Index Page JavaScript

// Configuration - Replace with your Supabase credentials
const SUPABASE_URL = 'https://halphorcsdtrnudluqzt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E2yIxlz8GswFJn-zfnzpxQ_ZsxqEMoy';

// Initialize Supabase
let supabase;
try {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (error) {
  console.error('Supabase initialization error:', error);
}

// DOM Elements
const registrationForm = document.getElementById('registrationForm');
const formStep = document.getElementById('formStep');
const successStep = document.getElementById('successStep');
const submitBtn = document.getElementById('submitBtn');
const submitLabel = document.getElementById('submitLabel');
const newRequestBtn = document.getElementById('newRequestBtn');
const fullNameInput = document.getElementById('fullName');
const phoneInput = document.getElementById('phone');
const nameField = document.getElementById('nameField');
const phoneField = document.getElementById('phoneField');
const secretAdminLock = document.getElementById('secretAdminLock');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initForm();
  initAdminLock();
});

// Form handling
function initForm() {
  if (!registrationForm) return;

  registrationForm.addEventListener('submit', handleRegistration);
  
  if (newRequestBtn) {
    newRequestBtn.addEventListener('click', resetForm);
  }

  // Real-time validation
  fullNameInput.addEventListener('input', () => {
    validateField(fullNameInput, nameField);
  });

  phoneInput.addEventListener('input', () => {
    validateField(phoneInput, phoneField);
  });
}

function validateField(input, field) {
  const value = input.value.trim();
  
  if (value.length > 0) {
    field.classList.remove('error');
  }
}

async function handleRegistration(e) {
  e.preventDefault();

  const fullName = fullNameInput.value.trim();
  const phone = phoneInput.value.trim();

  // Validation
  let isValid = true;

  if (!fullName) {
    nameField.classList.add('error');
    isValid = false;
  }

  if (!phone) {
    phoneField.classList.add('error');
    isValid = false;
  }

  if (!isValid) return;

  // Phone format validation (Uzbekistan format)
  const phoneRegex = /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    phoneField.classList.add('error');
    showToast('Iltimos, to\'g\'ri telefon raqam formatini kiriting (+998 90 123 45 67)');
    return;
  }

  // Show loading state
  setLoading(true);

  try {
    // Submit to Supabase
    const { data, error } = await supabase
      .from('applications')
      .insert([{
        full_name: fullName,
        phone: phone,
        status: 'new',
        source: 'website',
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;

    // Show success
    showSuccessStep();
    showToast('Arizangiz muvaffaqiyatli yuborildi!');

  } catch (error) {
    console.error('Registration error:', error);
    showToast('Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.');
  } finally {
    setLoading(false);
  }
}

function setLoading(loading) {
  if (loading) {
    submitBtn.disabled = true;
    submitLabel.textContent = 'Yuborilmoqda...';
  } else {
    submitBtn.disabled = false;
    submitLabel.textContent = 'Qabulga yozilish';
  }
}

function showSuccessStep() {
  formStep.style.display = 'none';
  successStep.classList.add('show');
}

function resetForm() {
  registrationForm.reset();
  formStep.style.display = 'block';
  successStep.classList.remove('show');
  nameField.classList.remove('error');
  phoneField.classList.remove('error');
}

// Admin lock (secret trigger)
function initAdminLock() {
  if (!secretAdminLock) return;

  let clickCount = 0;
  let lastClick = 0;

  secretAdminLock.addEventListener('click', () => {
    const now = Date.now();
    
    if (now - lastClick < 500) {
      clickCount++;
      
      if (clickCount >= 5) {
        // Redirect to admin panel
        window.location.href = 'admin.html';
        clickCount = 0;
      }
    } else {
      clickCount = 1;
    }
    
    lastClick = now;
  });
}

// Toast notification
function showToast(message, duration = 3000) {
  // Remove existing toast
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #1e293b;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(toast);

  // Remove after duration
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

// Phone input formatting
function formatPhoneNumber(input) {
  let value = input.value.replace(/\D/g, '');
  
  if (value.length > 0) {
    if (value[0] === '9') {
      value = '998' + value;
    }
  }
  
  if (value.length > 12) {
    value = value.slice(0, 12);
  }
  
  let formatted = '';
  if (value.length > 0) {
    formatted = '+' + value.slice(0, 3);
  }
  if (value.length > 3) {
    formatted += ' ' + value.slice(3, 5);
  }
  if (value.length > 5) {
    formatted += ' ' + value.slice(5, 8);
  }
  if (value.length > 8) {
    formatted += ' ' + value.slice(8, 10);
  }
  if (value.length > 10) {
    formatted += ' ' + value.slice(10, 12);
  }
  
  return formatted;
}

// Apply phone formatting
if (phoneInput) {
  phoneInput.addEventListener('input', (e) => {
    const formatted = formatPhoneNumber(e.target);
    e.target.value = formatted;
  });
}
