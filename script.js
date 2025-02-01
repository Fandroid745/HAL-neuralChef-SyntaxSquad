// Dark Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved theme in localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  body.classList.add(savedTheme);
  updateToggleButton(savedTheme);
}

themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  const isDarkMode = body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDarkMode ? 'dark-mode' : '');
  updateToggleButton(isDarkMode ? 'dark-mode' : '');
});

function updateToggleButton(theme) {
  themeToggle.textContent = theme === 'dark-mode' ? '☀️' : '🌙';
}

// Navigation Logic
const homeLink = document.getElementById('home-link');
const shareExtraLink = document.getElementById('share-extra-link');

homeLink.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = 'index.html'; // Redirect to home page
});

shareExtraLink.addEventListener('click', (e) => {
  e.preventDefault();
  alert('Share Extra section is under construction!'); // Placeholder for Share Extra functionality
});

// Recipe Generation Logic
document.getElementById('generate-btn').addEventListener('click', async () => {
  const ingredients = document.getElementById('ingredients').value;
  if (!ingredients) {
      alert('Please enter some ingredients!');
      return;
  }

  // Show loading animation
  document.querySelector('.output-section').style.display = 'block';
  document.getElementById('loading').style.display = 'flex';
  document.getElementById('recipe-output').style.display = 'none';

  try {
      // Call Flask backend API
      const response = await fetch('http://127.0.0.1:5000/get_recipe', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_input: ingredients.trim() })
      });

      const data = await response.json();

      // Hide loading animation
      document.getElementById('loading').style.display = 'none';
      document.getElementById('recipe-output').style.display = 'block';

      if (data.error) {
          // Handle error response
          document.getElementById('recipe-output').innerHTML = `
              <div class="error-message">
                  <h2>Error</h2>
                  <p>${data.error}</p>
              </div>
          `;
      } else if (data.response) {
          // Display the generated recipe
          document.getElementById('recipe-output').innerHTML = `
              <div class="recipe-content">
                  <h2>Your Recipe</h2>
                  <div class="recipe-text">${data.response}</div>
              </div>
          `;
      } else {
          throw new Error('Unexpected response format');
      }

  } catch (error) {
      console.error('Error:', error);
      document.getElementById('loading').style.display = 'none';
      document.getElementById('recipe-output').style.display = 'block';
      document.getElementById('recipe-output').innerHTML = `
          <div class="error-message">
              <h2>Error</h2>
              <p>Failed to generate recipe. Please try again.</p>
          </div>
      `;
  }
});

// Add this code to handle the Back button
document.getElementById('back-btn').addEventListener('click', () => {
    // Hide the recipe output and Back button
    document.getElementById('recipe-output').style.display = 'none';
    document.getElementById('back-btn').style.display = 'none';
    
    // Show the input section
    document.querySelector('.input-section').style.display = 'block';
    
    // Clear the input field
    document.getElementById('ingredients').value = '';
  });
  
  // Modify the recipe generation logic to show the Back button
  document.getElementById('generate-btn').addEventListener('click', async () => {
    const ingredients = document.getElementById('ingredients').value;
    if (!ingredients) {
        alert('Please enter some ingredients!');
        return;
    }
  
    // Show loading animation
    document.querySelector('.output-section').style.display = 'block';
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('recipe-output').style.display = 'none';
    document.getElementById('back-btn').style.display = 'none'; // Hide Back button while loading
  
    try {
        // Call Flask backend API
        const response = await fetch('http://127.0.0.1:5000/get_recipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_input: ingredients.trim() })
        });
  
        const data = await response.json();
  
        // Hide loading animation
        document.getElementById('loading').style.display = 'none';
        document.getElementById('recipe-output').style.display = 'block';
        document.getElementById('back-btn').style.display = 'block'; // Show Back button after recipe is generated
  
        if (data.error) {
            // Handle error response
            document.getElementById('recipe-output').innerHTML = `
                <div class="error-message">
                    <h2>Error</h2>
                    <p>${data.error}</p>
                </div>
            `;
        } else if (data.response) {
            // Display the generated recipe
            document.getElementById('recipe-output').innerHTML = `
                <div class="recipe-content">
                    <h2>Your Recipe</h2>
                    <div class="recipe-text">${data.response}</div>
                </div>
            `;
        } else {
            throw new Error('Unexpected response format');
        }
  
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('recipe-output').style.display = 'block';
        document.getElementById('recipe-output').innerHTML = `
            <div class="error-message">
                <h2>Error</h2>
                <p>Failed to generate recipe. Please try again.</p>
            </div>
        `;
        document.getElementById('back-btn').style.display = 'block'; // Show Back button on error
    }
  });
