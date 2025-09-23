// Test script to check hero settings API
const testData = {
  backgroundImage: '/hero-adventure.jpg',
  title: 'Test Hero Title',
  subtitle: 'Test Hero Subtitle',
  ctaText: 'Test CTA',
  ctaLink: '/test'
};

console.log('Testing hero settings API...');
console.log('Test data:', JSON.stringify(testData, null, 2));

fetch('http://localhost:3000/api/settings/hero', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData),
})
.then(response => {
  console.log('Response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Response data:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('Error:', error);
});