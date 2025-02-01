
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import config  # Import config.py for API key

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

@app.route('/get_recipe', methods=['POST'])
def get_recipe():
    try:
        data = request.get_json()
        ingredients = data.get('user_input')

        if not ingredients:
            return jsonify({"error": "No ingredients provided"}), 400

        # Groq API configuration
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {config.GROQ_API_KEY}"  # Access API key from config.py
        }

        # Prepare the prompt for recipe generation
        prompt = f"""Generate a detailed recipe using these ingredients: {ingredients}.
        Introduce Yourself as a neuralChat ai recipe generator.
        1. A creative recipe title
        2. List of all ingredients with quantities
        3. Step by step cooking instructions
        4. Estimated cooking time
        5. Number of servings
        6..Please provide nutrution information """

        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}]
        }

        # Make request to Groq API
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            json=payload,
            headers=headers
        )
        response.raise_for_status()

        # Extract recipe from response
        recipe_text = response.json().get('choices', [{}])[0].get('message', {}).get('content', '')
        
        if not recipe_text:
            return jsonify({"error": "Failed to generate recipe"}), 500

        # Format recipe text with HTML line breaks
        formatted_recipe = recipe_text.replace('\n', '<br>')
        
        return jsonify({"response": formatted_recipe})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"API Error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Server Error: {str(e)}"}), 500

if __name__ == "__main__":
    if not hasattr(config, 'GROQ_API_KEY'):  # Check if API key exists in config.py
        print("Warning: GROQ_API_KEY not found in config.py")
    app.run(debug=True)
