console.log('🔍 Checking environment variables...');

const databaseUrl = 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_PRISMA_URL ||
  process.env.PRISMA_DATABASE_URL;

const directUrl = 
  process.env.POSTGRES_URL || 
  process.env.POSTGRES_URL_NON_POOLING;

let hasErrors = false;

console.log('\n📋 Database Connection Variables:');
if (databaseUrl) {
  console.log(`  ✅ Database URL: Set (${databaseUrl.substring(0, 30)}...)`);
  if (process.env.PRISMA_DATABASE_URL) {
    console.log('     Kullanılan: PRISMA_DATABASE_URL (Prisma Accelerate)');
  } else if (process.env.DATABASE_URL) {
    console.log('     Kullanılan: DATABASE_URL');
  } else if (process.env.POSTGRES_PRISMA_URL) {
    console.log('     Kullanılan: POSTGRES_PRISMA_URL');
  }
} else {
  console.error('  ❌ Database URL: MISSING');
  console.error('     Gerekli: DATABASE_URL (veya POSTGRES_PRISMA_URL, PRISMA_DATABASE_URL)');
  hasErrors = true;
}

if (directUrl) {
  console.log(`  ✅ Direct URL: Set (${directUrl.substring(0, 30)}...)`);
} else {
  console.warn('  ⚠️  Direct URL: Not set (migrations için gerekli olabilir)');
}

if (hasErrors) {
  console.error('\n❌ Build will fail due to missing required environment variables!');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set. Proceeding with build...');
}

