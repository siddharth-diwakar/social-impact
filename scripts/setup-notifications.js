#!/usr/bin/env node

/**
 * Notification System Setup Script
 * 
 * This script helps you set up the notification system by:
 * 1. Checking if .env.local exists
 * 2. Adding missing notification-related environment variables
 * 3. Providing setup instructions
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ENV_LOCAL_PATH = path.join(process.cwd(), '.env.local');
const ENV_EXAMPLE_PATH = path.join(process.cwd(), '.env.example');

console.log('🔔 Notification System Setup Script\n');
console.log('=====================================\n');

// Generate a secure cron secret
function generateCronSecret() {
  return crypto.randomBytes(32).toString('hex');
}

// Check if .env.local exists
if (!fs.existsSync(ENV_LOCAL_PATH)) {
  console.log('⚠️  .env.local file not found!\n');
  console.log('Creating .env.local from .env.example...\n');
  
  if (fs.existsSync(ENV_EXAMPLE_PATH)) {
    const exampleContent = fs.readFileSync(ENV_EXAMPLE_PATH, 'utf8');
    fs.writeFileSync(ENV_LOCAL_PATH, exampleContent);
    console.log('✅ Created .env.local file\n');
    console.log('📝 Please update .env.local with your actual values:\n');
    console.log('   1. Supabase credentials (required)');
    console.log('   2. Resend API key (required for email)');
    console.log('   3. Twilio credentials (optional, for SMS)');
    console.log('   4. CRON_SECRET (already generated for you)\n');
  } else {
    console.log('❌ .env.example not found. Please create .env.local manually.\n');
    process.exit(1);
  }
} else {
  console.log('✅ .env.local file found\n');
  
  // Read existing .env.local
  const envContent = fs.readFileSync(ENV_LOCAL_PATH, 'utf8');
  const envLines = envContent.split('\n');
  
  // Check for missing notification variables
  const requiredVars = {
    'RESEND_API_KEY': 'Email service (Resend)',
    'CRON_SECRET': 'Cron job security',
  };
  
  const optionalVars = {
    'TWILIO_ACCOUNT_SID': 'SMS service (Twilio)',
    'TWILIO_AUTH_TOKEN': 'SMS service (Twilio)',
    'TWILIO_PHONE_NUMBER': 'SMS service (Twilio)',
  };
  
  const missing = [];
  const missingOptional = [];
  
  // Check required variables
  for (const [varName, description] of Object.entries(requiredVars)) {
    if (!envContent.includes(`${varName}=`) || envContent.includes(`${varName}=your_`)) {
      missing.push({ varName, description });
    }
  }
  
  // Check optional variables
  for (const [varName, description] of Object.entries(optionalVars)) {
    if (!envContent.includes(`${varName}=`) || envContent.includes(`${varName}=your_`)) {
      missingOptional.push({ varName, description });
    }
  }
  
  if (missing.length > 0 || missingOptional.length > 0) {
    console.log('⚠️  Missing environment variables:\n');
    
    if (missing.length > 0) {
      console.log('Required:');
      missing.forEach(({ varName, description }) => {
        console.log(`   - ${varName}: ${description}`);
      });
      console.log('');
    }
    
    if (missingOptional.length > 0) {
      console.log('Optional (for SMS):');
      missingOptional.forEach(({ varName, description }) => {
        console.log(`   - ${varName}: ${description}`);
      });
      console.log('');
    }
    
    // Add missing CRON_SECRET if not present
    if (missing.some(m => m.varName === 'CRON_SECRET')) {
      const newSecret = generateCronSecret();
      console.log(`🔐 Generated CRON_SECRET: ${newSecret}\n`);
      console.log('Adding CRON_SECRET to .env.local...\n');
      
      // Append to .env.local
      fs.appendFileSync(ENV_LOCAL_PATH, `\n# Cron Job Security (Auto-generated)\nCRON_SECRET=${newSecret}\n`);
      console.log('✅ Added CRON_SECRET to .env.local\n');
    }
  } else {
    console.log('✅ All notification environment variables are set!\n');
  }
}

console.log('📋 Next Steps:\n');
console.log('1. Run the database migration:');
console.log('   → Go to Supabase Dashboard → SQL Editor');
console.log('   → Run: supabase/migrations/008_add_notification_system.sql\n');

console.log('2. Set up Resend (for email):');
console.log('   → Sign up at https://resend.com');
console.log('   → Get your API key');
console.log('   → Add to .env.local: RESEND_API_KEY=re_your_key\n');

console.log('3. Set up Twilio (optional, for SMS):');
console.log('   → Sign up at https://www.twilio.com');
console.log('   → Get credentials and phone number');
console.log('   → Add to .env.local: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER\n');

console.log('4. Deploy to Vercel (if using):');
console.log('   → Add all environment variables to Vercel dashboard');
console.log('   → Cron jobs will be automatically configured via vercel.json\n');

console.log('📚 For detailed instructions, see: NOTIFICATION_SETUP.md\n');

