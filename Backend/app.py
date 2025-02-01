from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import requests
import config
from datetime import datetime
import logging

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///recipes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ingredients = db.Column(db.Text, nullable=False)
    recipe_text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

@app.route('/get_recipe', methods=['POST'])
def get_recipe():
    try:
        data = request.get_json()
        ingredients = data.get('user_input')
        app.logger.debug(f"Received ingredients: {ingredients}")

        if not ingredients:
            return jsonify({"error": "No ingredients provided"}), 400

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {config.GROQ_API_KEY}"
        }

        prompt = f"""Generate a detailed recipe using these ingredients: {ingredients}.
        Format the response with clear sections using numbers and line breaks.
        Include these sections:
        1. Recipe Title
        2. Ingredients List
        3. Instructions
        4. Cooking Time
        5. Servings
        6. Nutrition Information"""

        payload = {
            "model": "llama3-70b-8192",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
        }

        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            json=payload,
            headers=headers,
            timeout=30
        )
        response.raise_for_status()

        result = response.json()
        app.logger.debug(f"Groq API response: {result}")
        
        recipe_text = result.get('choices', [{}])[0].get('message', {}).get('content', '')
        
        if not recipe_text:
            return jsonify({"error": "Failed to generate recipe"}), 500

        formatted_recipe = recipe_text.replace('\n', '<br>')
        return jsonify({"response": formatted_recipe})

    except requests.exceptions.RequestException as e:
        app.logger.error(f"API Error: {str(e)}")
        return jsonify({"error": f"API Error: {str(e)}"}), 500
    except Exception as e:
        app.logger.error(f"Server Error: {str(e)}")
        return jsonify({"error": f"Server Error: {str(e)}"}), 500

@app.route('/save_recipe', methods=['POST'])
def save_recipe():
    try:
        data = request.get_json()
        recipe = Recipe(
            ingredients=data.get('ingredients'),
            recipe_text=data.get('recipe_text')
        )
        db.session.add(recipe)
        db.session.commit()
        return jsonify({"message": "Recipe saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_saved_recipes', methods=['GET'])
def get_saved_recipes():
    try:
        recipes = Recipe.query.order_by(Recipe.timestamp.desc()).all()
        return jsonify([{
            "id": r.id,
            "ingredients": r.ingredients,
            "recipe_text": r.recipe_text,
            "timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        } for r in recipes]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/delete_recipe/<int:recipe_id>', methods=['DELETE'])
def delete_recipe(recipe_id):
    try:
        recipe = Recipe.query.get(recipe_id)
        if recipe:
            db.session.delete(recipe)
            db.session.commit()
            return jsonify({"message": "Recipe deleted"}), 200
        return jsonify({"error": "Recipe not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    if not hasattr(config, 'GROQ_API_KEY'):
        print("Warning: GROQ_API_KEY not found in config.py")
    app.run(debug=True)