// Background Slideshow
const bgSlideshow = document.querySelector('.background-slideshow');
const bgImages = bgSlideshow.getElementsByTagName('img');
let currentBgIndex = 0;

function changeBackground() {
  bgImages[currentBgIndex].classList.remove('active');
  currentBgIndex = (currentBgIndex + 1) % bgImages.length;
  bgImages[currentBgIndex].classList.add('active');
}

bgImages[currentBgIndex].classList.add('active');
setInterval(changeBackground, 5000);

// Dark Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

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

// Navigation
document.getElementById('saved-recipes-link').addEventListener('click', async (e) => {
  e.preventDefault();
  document.querySelector('.input-section').style.display = 'none';
  document.querySelector('.output-section').style.display = 'none';
  document.getElementById('saved-section').style.display = 'block';
  loadSavedRecipes();
});

// Home Button Navigation
document.getElementById('home-link').addEventListener('click', (e) => {
  e.preventDefault();
  document.querySelector('.input-section').style.display = 'block';
  document.querySelector('.output-section').style.display = 'none';
  document.getElementById('saved-section').style.display = 'none';
  document.getElementById('back-btn').style.display = 'none';
  document.getElementById('ingredients').value = '';
});

document.getElementById('back-to-home').addEventListener('click', () => {
  document.getElementById('saved-section').style.display = 'none';
  document.querySelector('.input-section').style.display = 'block';
});

// Save Recipe
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'save-recipe-btn') {
    const ingredients = document.getElementById('ingredients').value;
    const recipeText = document.querySelector('.recipe-text').innerHTML;

    fetch('http://127.0.0.1:5000/save_recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients: ingredients,
        recipe_text: recipeText
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        alert('Recipe saved successfully!');
      })
      .catch(error => {
        alert('Error saving recipe: ' + error.message);
      });
  }
});

// Delete Recipe
document.addEventListener('click', async (e) => {
  if (e.target && e.target.classList.contains('delete-btn')) {
    const recipeId = e.target.dataset.id;
    try {
      const response = await fetch(`http://127.0.0.1:5000/delete_recipe/${recipeId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      e.target.parentElement.remove();
    } catch (error) {
      alert('Error deleting recipe: ' + error.message);
    }
  }
});

// Recipe Generation
document.getElementById('generate-btn').addEventListener('click', async () => {
  const ingredients = document.getElementById('ingredients').value;
  if (!ingredients) {
    alert('Please enter some ingredients!');
    return;
  }

  document.querySelector('.output-section').style.display = 'block';
  document.getElementById('loading').style.display = 'flex';
  document.getElementById('recipe-output').style.display = 'none';

  try {
    const response = await fetch('http://127.0.0.1:5000/get_recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_input: ingredients.trim() })
    });

    const data = await response.json();
    document.getElementById('loading').style.display = 'none';

    if (data.error) {
      showError(data.error);
    } else if (data.response) {
      displayRecipe(data.response);
      document.getElementById('back-btn').style.display = 'block';
    } else {
      throw new Error('Unexpected response format');
    }
  } catch (error) {
    console.error('Error:', error);
    showError('Failed to generate recipe. Please try again.');
  }
});

// Helper Functions
function showLoadingState(show) {
  document.getElementById('loading').style.display = show ? 'flex' : 'none';
  document.getElementById('recipe-output').style.display = show ? 'none' : 'block';
}

function displayRecipe(recipeHTML) {
  const recipeOutput = document.getElementById('recipe-output');
  recipeOutput.innerHTML = `
    <div class="recipe-content">
      <h2>Your Recipe</h2>
      <div class="recipe-text">${recipeHTML}</div>
      <button id="save-recipe-btn">Save Recipe</button>
    </div>
  `;
  recipeOutput.style.display = 'block';
}

function showError(message) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('recipe-output').innerHTML = `
    <div class="error-message">
      <h2>Error</h2>
      <p>${message}</p>
    </div>
  `;
  document.getElementById('recipe-output').style.display = 'block';
}

async function loadSavedRecipes() {
  try {
    const response = await fetch('http://127.0.0.1:5000/get_saved_recipes');
    const data = await response.json();

    const list = document.getElementById('saved-recipes-list');
    list.innerHTML = '';

    data.forEach(recipe => {
      const div = document.createElement('div');
      div.className = 'saved-recipe';
      div.innerHTML = `
        <h3>${recipe.ingredients}</h3>
        <div class="recipe-text">${recipe.recipe_text}</div>
        <button class="delete-btn" data-id="${recipe.id}">Delete</button>
      `;
      list.appendChild(div);
    });
  } catch (error) {
    alert('Failed to load saved recipes');
  }
}

// Back Button
document.getElementById('back-btn').addEventListener('click', () => {
  document.getElementById('recipe-output').style.display = 'none';
  document.getElementById('back-btn').style.display = 'none';
  document.querySelector('.input-section').style.display = 'block';
  document.getElementById('ingredients').value = '';
});
