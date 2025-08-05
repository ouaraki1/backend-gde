const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let folderId = '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

const setAuthToken = (token) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

async function debugUpload() {
  try {
    console.log('🔍 Debugging file upload 500 error...\n');

    // Step 1: Test server connection
    console.log('1. Testing server connection...');
    try {
      const testResponse = await axios.get(`${API_BASE_URL}/test`);
      console.log('✅ Server is responding:', testResponse.data.message);
    } catch (error) {
      console.error('❌ Server connection failed:', error.message);
      return;
    }

    // Step 2: Login
    console.log('\n2. Logging in...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@example.com',
        password: 'admin123'
      });
      
      authToken = loginResponse.data.token;
      setAuthToken(authToken);
      console.log('✅ Logged in successfully');
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data?.message || error.message);
      return;
    }

    // Step 3: Create a test folder
    console.log('\n3. Creating test folder...');
    try {
      const folderResponse = await api.post('/folders', { name: 'Test Upload Folder' });
      folderId = folderResponse.data._id;
      console.log('✅ Test folder created:', folderId);
    } catch (error) {
      console.error('❌ Folder creation failed:', error.response?.data?.message || error.message);
      return;
    }

    // Step 4: Test file upload with detailed error logging
    console.log('\n4. Testing file upload...');
    try {
      // Create a simple text file
      const fileContent = 'This is a test file for upload debugging';
      const fileBuffer = Buffer.from(fileContent, 'utf8');
      
      const formData = new FormData();
      formData.append('files', fileBuffer, 'test-upload.txt');
      formData.append('tags', 'test, debug');
      formData.append('status', 'courent');

      console.log('   📤 Sending upload request...');
      console.log('   📁 Folder ID:', folderId);
      console.log('   📄 File name: test-upload.txt');
      console.log('   🏷️ Tags: test, debug');
      console.log('   📊 Status: courent');

      const uploadResponse = await api.post(`/folders/${folderId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout
      });
      
      console.log('✅ Upload successful:', uploadResponse.data);
      
    } catch (error) {
      console.error('❌ Upload failed!');
      console.error('   Error message:', error.message);
      console.error('   Status code:', error.response?.status);
      console.error('   Status text:', error.response?.statusText);
      console.error('   Response data:', error.response?.data);
      console.error('   Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        timeout: error.config?.timeout
      });
      
      // Check if it's a multer error
      if (error.response?.data?.message && error.response.data.message.includes('Type de fichier non autorisé')) {
        console.error('   🔍 This appears to be a file type validation error');
      }
      
      // Check if it's a permission error
      if (error.response?.status === 403) {
        console.error('   🔍 This appears to be a permission error');
      }
      
      // Check if it's a database error
      if (error.response?.data?.error && error.response.data.error.includes('MongoDB')) {
        console.error('   🔍 This appears to be a database error');
      }
    }

    // Step 5: Test folder contents to see if upload actually worked
    console.log('\n5. Checking folder contents...');
    try {
      const contentsResponse = await api.get(`/folders/main/${folderId}/contents`);
      console.log('✅ Folder contents:', {
        folderName: contentsResponse.data.name,
        fileCount: contentsResponse.data.files?.length || 0
      });
      
      if (contentsResponse.data.files && contentsResponse.data.files.length > 0) {
        console.log('   📄 Files in folder:');
        contentsResponse.data.files.forEach((file, index) => {
          console.log(`      ${index + 1}. ${file.name} (${file.mimetype})`);
        });
      }
    } catch (error) {
      console.error('❌ Failed to get folder contents:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugUpload(); 