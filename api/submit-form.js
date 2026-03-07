// Simple in-memory rate limiting (resets on function cold start)
// For production, use Vercel Edge Config or Redis
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute per IP

function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { timestamp: now, count: 1 });
    return false;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }
  
  record.count++;
  return false;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeString(str, maxLength = 5000) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLength);
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIp = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Trop de requêtes. Veuillez réessayer plus tard.' });
  }

  const { firstname, lastname, email, company, message } = req.body || {};

  const errors = [];
  
  const sanitizedFirstname = sanitizeString(firstname, 100);
  if (!sanitizedFirstname) {
    errors.push('Le prénom est requis');
  }
  
  const sanitizedLastname = sanitizeString(lastname, 100);
  if (!sanitizedLastname) {
    errors.push('Le nom est requis');
  }
  
  const sanitizedEmail = sanitizeString(email, 254);
  if (!sanitizedEmail || !validateEmail(sanitizedEmail)) {
    errors.push('Un email valide est requis');
  }
  
  const sanitizedCompany = sanitizeString(company, 200);
  const sanitizedMessage = sanitizeString(message, 5000);

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  try {
    console.log('=== NOUVELLE DEMANDE DE CONTACT ===');
    console.log('Prénom:', sanitizedFirstname);
    console.log('Nom:', sanitizedLastname);
    console.log('Email:', sanitizedEmail);
    console.log('Société:', sanitizedCompany);
    console.log('Message:', sanitizedMessage);
    console.log('===================================');

    return res.status(200).json({ 
      success: true,
      message: 'Demande reçue. Nous vous recontacterons sous 24h.'
    });
  } catch (error) {
    console.error('Form submission error:', error);
    return res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer plus tard.' });
  }
}
