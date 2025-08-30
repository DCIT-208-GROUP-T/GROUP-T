const http = require('http');

// Test GET /api/users
console.log('Testing GET /api/users...');
const getReq = http.request('http://localhost:3000/api/users', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('GET /api/users response:', data);
    testPostUser();
  });
});
getReq.end();

function testPostUser() {
  console.log('\nTesting POST /api/users...');
  const postData = JSON.stringify({
    firebaseUid: 'test456',
    email: 'test2@example.com',
    fullName: 'Test User 2',
    accountType: 'client',
    phoneNumber: '987-654-3210',
    address: '456 Test Avenue, Test City, TS 67890',
    profilePicture: 'test-profile2.jpg'
  });

  const postReq = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/users',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('POST /api/users response:', data);
      testGetUsersAgain();
    });
  });

  postReq.write(postData);
  postReq.end();
}

function testGetUsersAgain() {
  console.log('\nTesting GET /api/users again...');
  const getReq = http.request('http://localhost:3000/api/users', (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('GET /api/users response after POST:', data);
      testOtherEndpoints();
    });
  });
  getReq.end();
}

function testOtherEndpoints() {
  console.log('\nTesting other endpoints...');
  
  // Test /api/cases
  http.request('http://localhost:3000/api/cases', (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('GET /api/cases response:', data);
    });
  }).end();

  // Test /api/appointments
  http.request('http://localhost:3000/api/appointments', (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('GET /api/appointments response:', data);
    });
  }).end();

  // Test /api/messages
  http.request('http://localhost:3000/api/messages', (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('GET /api/messages response:', data);
    });
  }).end();
}
