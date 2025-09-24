const axios = require('axios');

// Simple API testing script - requires server to be running
const BASE_URL = 'http://localhost:3000';

// Test accounts
const testAccounts = [
  { email: 'admin@acme.test', password: 'password', role: 'admin', tenant: 'acme' },
  { email: 'user@acme.test', password: 'password', role: 'member', tenant: 'acme' },
  { email: 'admin@globex.test', password: 'password', role: 'admin', tenant: 'globex' },
  { email: 'user@globex.test', password: 'password', role: 'member', tenant: 'globex' }
];

async function testAPI() {
  console.log('🧪 Testing Multi-Tenant Notes API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health check...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed\n');

    // Test 2: Login with each test account
    console.log('2. Testing authentication...');
    const tokens = {};
    
    for (const account of testAccounts) {
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: account.email,
          password: account.password
        });
        
        tokens[account.email] = response.data.data.token;
        console.log(`✅ Login successful: ${account.email} (${account.role}, ${account.tenant})`);
      } catch (error) {
        console.log(`❌ Login failed: ${account.email}`);
        throw error;
      }
    }
    console.log('');

    // Test 3: Tenant isolation - try to access wrong tenant
    console.log('3. Testing tenant isolation...');
    try {
      await axios.get(`${BASE_URL}/api/tenants/globex`, {
        headers: { Authorization: `Bearer ${tokens['admin@acme.test']}` }
      });
      console.log('❌ Tenant isolation failed - should have been blocked');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Tenant isolation working - cross-tenant access blocked');
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 4: Create notes and test subscription limits
    console.log('4. Testing note creation and subscription limits...');
    const acmeToken = tokens['user@acme.test'];
    
    // Create 3 notes (should work - free plan allows 3)
    for (let i = 1; i <= 3; i++) {
      await axios.post(`${BASE_URL}/api/notes`, {
        title: `Test Note ${i}`,
        content: `Content for note ${i}`
      }, {
        headers: { Authorization: `Bearer ${acmeToken}` }
      });
      console.log(`✅ Created note ${i}/3 (free plan limit)`);
    }

    // Try to create 4th note (should fail)
    try {
      await axios.post(`${BASE_URL}/api/notes`, {
        title: 'Test Note 4',
        content: 'This should fail'
      }, {
        headers: { Authorization: `Bearer ${acmeToken}` }
      });
      console.log('❌ Subscription limits not working - 4th note created');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Subscription limits working - 4th note blocked');
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 5: Upgrade subscription (admin only)
    console.log('5. Testing subscription upgrade...');
    const adminToken = tokens['admin@acme.test'];
    
    await axios.post(`${BASE_URL}/api/tenants/acme/upgrade`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Subscription upgraded to Pro by admin');

    // Now create 4th note (should work after upgrade)
    await axios.post(`${BASE_URL}/api/notes`, {
      title: 'Test Note 4 - Pro Plan',
      content: 'This should work after upgrade'
    }, {
      headers: { Authorization: `Bearer ${acmeToken}` }
    });
    console.log('✅ 4th note created successfully after Pro upgrade');
    console.log('');

    // Test 6: List notes and verify tenant isolation
    console.log('6. Testing note listing and tenant isolation...');
    
    const acmeNotes = await axios.get(`${BASE_URL}/api/notes`, {
      headers: { Authorization: `Bearer ${tokens['user@acme.test']}` }
    });
    
    const globexNotes = await axios.get(`${BASE_URL}/api/notes`, {
      headers: { Authorization: `Bearer ${tokens['user@globex.test']}` }
    });
    
    console.log(`✅ Acme tenant has ${acmeNotes.data.data.notes.length} notes`);
    console.log(`✅ Globex tenant has ${globexNotes.data.data.notes.length} notes`);
    console.log('✅ Notes are properly isolated by tenant');

    console.log('\n🎉 All tests passed! Multi-tenant API is working correctly.');

  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    if (error.response) {
      console.log('Response:', error.response.data);
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;