// menu.js
const apiKeyInput = document.getElementById('api-key');
const form = document.querySelector('form');

// 1. Load the existing key from storage when the popup opens
browser.storage.local.get('scopusApiKey').then((result) => {
  if (result.scopusApiKey) {
    apiKeyInput.value = result.scopusApiKey;
    const status = document.getElementById('status');
    status.textContent = '✓';
  }
});

// 2. Save the key when the form is submitted
form.addEventListener('submit', async (e) => {
  e.preventDefault(); // Stop the form from actually "submitting" and refreshing the page
  const keyValue = apiKeyInput.value;

  await browser.storage.local.set({
    scopusApiKey: keyValue
  }).then(() => {
    // insert checkmark to indicate success
    const status = document.getElementById('status');
    status.textContent = '✓';
  });
});