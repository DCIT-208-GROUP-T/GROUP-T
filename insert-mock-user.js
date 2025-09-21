const { createUser } = require('./models/UserFirestore');

async function insertMockUser() {
  try {
    console.log('Connected to Firestore');

    const mockUser = {
      firebaseUid: 'mock-firebase-uid-12345',
      email: 'client@example.com',
      fullName: 'Mock Client User',
      accountType: 'client',
      phoneNumber: '+1234567890',
      profilePicture: '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const user = await createUser(mockUser);

    console.log('Mock user inserted successfully');
    console.log('User ID:', user.id);
    console.log('Email:', user.email);

  } catch (error) {
    console.error('Error inserting mock user:', error);
  }
}

insertMockUser();
