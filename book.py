from flask import Flask, render_template, request, jsonify
import pandas as pd

app = Flask(__name__)

# Load book data (make sure to use the correct path)
book_data = pd.read_csv(r'C:\Users\vedaksha M\OneDrive\Documents\E2_VEDAKSHA M_1RV23CS283\book.csv', low_memory=False)  # Replace with the actual path

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        # Collect user input from form
        user_type = request.form.get('user_type').strip().lower()
        topic = request.form.get('topic').strip().lower()
        language = request.form.get('language', '').strip().lower()

        # Create user profile dictionary
        user_profile = {
            'user_type': user_type,
            'topic': topic,
            'language': language
        }
        
        # Get recommendations
        recommended_books = recommend_books(user_profile, book_data)
        return render_template('results.html', books=recommended_books)

    # Render the index page
    return render_template('index.html')

@app.route('/get_languages', methods=['POST'])
def get_languages():
        # Reload dataset dynamically
    book_data = pd.read_csv(r'C:\Users\vedaksha M\OneDrive\Documents\E2_VEDAKSHA M_1RV23CS283\book.csv', low_memory=False)

    # Extract topic from request
    topic = request.json.get('topic', '').strip().lower()

    # Filter book data based on the topic and extract unique languages
    filtered_books = book_data[book_data['topic'].str.lower() == topic]
    unique_languages = filtered_books['language'].dropna().unique().tolist()

    return jsonify({'languages': unique_languages})

def recommend_books(user_profile, book_data):
    # Filter books based on user type
    recommended_books = book_data[book_data['user_type'].str.lower() == user_profile['user_type']]

    # Filter further by topic
    recommended_books = recommended_books[recommended_books['topic'].str.lower() == user_profile['topic']]

    # If topic is Computer Science, filter by language if provided
    if user_profile['topic'] == 'computer science' and 'language' in user_profile:
        recommended_books = recommended_books[recommended_books['language'].str.lower() == user_profile['language']]
    elif user_profile['topic'] == 'mechanical' and 'language' in user_profile:
        recommended_books = recommended_books[recommended_books['language'].str.lower() == user_profile['language']]
    elif user_profile['topic'] == 'electrical' and 'language' in user_profile:
        recommended_books = recommended_books[recommended_books['language'].str.lower() == user_profile['language']]
        
    # Return recommended books as a list of dictionaries
    return recommended_books[['book_name', 'storage']].to_dict(orient='records')

if __name__ == "__main__":
    app.run(debug=True)
