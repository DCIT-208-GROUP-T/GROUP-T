const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Mock user data for testing
const testUsers = {
  client: {
    _id: 'test-client-id', // This would need to be replaced with actual IDs from your database
    firebaseUid: 'test-client-firebase-uid',
    email: 'client@test.com',
    fullName: 'Test Client',
    accountType: 'client'
  },
  lawyer: {
    _id: 'test-lawyer-id',
    firebaseUid: 'test-lawyer-firebase-uid',
    email: 'lawyer@test.com',
    fullName: 'Test Lawyer',
    accountType: 'lawyer'
  },
  admin: {
    _id: 'test-admin-id',
    firebaseUid: 'test-admin-firebase-uid',
    email: 'admin@test.com',
    fullName: 'Test Admin',
    accountType: 'admin'
  }
};

async function testUserEndpoints() {
  console.log('🧪 Testing User Endpoints...\n');

  try {
    // Test 1: Get all users
    console.log('1. Testing GET /users');
    const usersResponse = await axios.get(`${BASE_URL}/users`);
    console.log(`   ✅ Success: ${usersResponse.data.length} users found`);

    if (usersResponse.data.length > 0) {
      const testUserId = usersResponse.data[0]._id;
      
      // Test 2: Get user by ID
      console.log('2. Testing GET /users/:id');
      const userByIdResponse = await axios.get(`${BASE_URL}/users/${testUserId}`);
      console.log(`   ✅ Success: User found - ${userByIdResponse.data.fullName}`);

      // Test 3: Update user profile
      console.log('3. Testing PUT /users/profile/:id');
      const updateData = {
        fullName: 'Updated Test User',
        phoneNumber: '+1234567890',
        profilePicture: 'https://example.com/profile.jpg'
      };
      
      const profileUpdateResponse = await axios.put(
        `${BASE_URL}/users/profile/${testUserId}`,
        updateData
      );
      console.log(`   ✅ Success: Profile updated - ${profileUpdateResponse.data.fullName}`);
      console.log(`   Phone: ${profileUpdateResponse.data.phoneNumber}`);
      console.log(`   Profile Picture: ${profileUpdateResponse.data.profilePicture}`);

      // Test 4: User deactivation
      console.log('4. Testing PUT /users/:id/deactivate');
      const deactivateResponse = await axios.put(`${BASE_URL}/users/${testUserId}/deactivate`);
      console.log(`   ✅ Success: ${deactivateResponse.data.message}`);

      // Verify deactivation worked
      const verifyDeactivated = await axios.get(`${BASE_URL}/users/${testUserId}`);
      console.log(`   User active status: ${verifyDeactivated.data.isActive}`);

    } else {
      console.log('   ⚠️  No users found for testing - skipping user-specific tests');
    }

  } catch (error) {
    console.error('   ❌ Error:', error.response?.data?.message || error.message);
  }
}

async function testCaseEndpoints() {
  console.log('\n🧪 Testing Case Endpoints...\n');

  try {
    // Test 1: Get all cases
    console.log('1. Testing GET /cases');
    const casesResponse = await axios.get(`${BASE_URL}/cases`);
    console.log(`   ✅ Success: ${casesResponse.data.length} cases found`);

    if (casesResponse.data.length > 0) {
      const testCaseId = casesResponse.data[0]._id;
      
      // Test 2: Get case by ID
      console.log('2. Testing GET /cases/:id');
      const caseByIdResponse = await axios.get(`${BASE_URL}/cases/${testCaseId}`);
      console.log(`   ✅ Success: Case found - ${caseByIdResponse.data.title}`);

      // Test 3: Get cases by status
      console.log('3. Testing GET /cases/status/:status');
      const statusResponse = await axios.get(`${BASE_URL}/cases/status/open`);
      console.log(`   ✅ Success: ${statusResponse.data.length} open cases found`);

    } else {
      console.log('   ⚠️  No cases found for testing - skipping case-specific tests');
    }

  } catch (error) {
    console.error('   ❌ Error:', error.response?.data?.message || error.message);
  }
}

async function testRateLimiting() {
  console.log('\n🧪 Testing Rate Limiting...\n');

  try {
    console.log('Making 10 rapid requests to test rate limiting:');
    for (let i = 1; i <= 10; i++) {
      try {
        const response = await axios.get(`${BASE_URL}/users`);
        console.log(`   Request ${i}: ✅ Success (${response.status})`);
      } catch (error) {
        if (error.response?.status === 429) {
          console.log(`   Request ${i}: ⚠️  Rate Limited (429)`);
          break;
        } else {
          console.log(`   Request ${i}: ❌ Error (${error.response?.status || error.message})`);
        }
      }
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive API Tests\n');
  console.log('='.repeat(50));

  await testUserEndpoints();
  await testCaseEndpoints();
  await testRateLimiting();

  console.log('\n' + '='.repeat(50));
  console.log('🎉 All tests completed!');
  console.log('\nNote: Some tests may require actual data in the database.');
  console.log('For role-based access testing, you would need:');
  console.log('- Valid user IDs with different roles');
  console.log('- Proper authentication headers');
}

runAllTests().catch(console.error);
