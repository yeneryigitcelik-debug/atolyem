/**
 * Environment variables kontrol scripti
 * Kullanım: node scripts/check-env.js
 */

require('dotenv').config();

const requiredVars = [
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_IMAGES_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_HASH',
  'NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH',
];

console.log('=== Environment Variables Kontrolü ===\n');

let allPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const isPresent = !!value;
  const length = value ? value.length : 0;
  const preview = value ? `${value.substring(0, 10)}...` : 'EKSIK';
  
  console.log(`${varName}:`);
  console.log(`  Durum: ${isPresent ? '✓ Mevcut' : '✗ Eksik'}`);
  console.log(`  Uzunluk: ${length}`);
  console.log(`  Önizleme: ${preview}`);
  console.log('');
  
  if (!isPresent) {
    allPresent = false;
  }
});

const optionalVars = {
  'CLOUDFLARE_IMAGES_VARIANT': process.env.CLOUDFLARE_IMAGES_VARIANT || 'public (varsayılan)',
};

console.log('=== Opsiyonel Değişkenler ===\n');
Object.entries(optionalVars).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

console.log('\n=== Sonuç ===');
if (allPresent) {
  console.log('✓ Tüm gerekli environment variable\'lar mevcut!');
  console.log('\nNot: Eğer hala hata alıyorsanız, development server\'ı yeniden başlatın:');
  console.log('  npm run dev');
} else {
  console.log('✗ Bazı environment variable\'lar eksik!');
  console.log('\nLütfen .env dosyanızı kontrol edin:');
  console.log('  1. Değişken isimlerinin doğru olduğundan emin olun');
  console.log('  2. Tırnak işareti kullanmayın (KEY="value" ❌, KEY=value ✅)');
  console.log('  3. Boşluk olmamalı (KEY = value ❌, KEY=value ✅)');
  console.log('  4. Her satırda sadece bir değişken olmalı');
  process.exit(1);
}

