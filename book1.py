from flask import Flask, render_template, request, redirect, url_for, flash, session,jsonify
import pandas as pd
import pickle
import numpy as np
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from flask_sqlalchemy import SQLAlchemy
from os import path
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
from models import db,Comment,User


app = Flask(__name__)
app.config['SECRET_KEY'] = 'hkukgjgfhg'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)


# Define the User model
    
# class User(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     email = db.Column(db.String(150), unique=True, nullable=False)
#     password = db.Column(db.String(150), nullable=False)

   
# Initialize the database
with app.app_context():
        db.create_all()

file = "popular_dsa.pkl"
df = pd.read_pickle(file)

if 'author_x' in df.columns:
    df.rename(columns={'author_x': 'author'}, inplace=True)

df.to_pickle("popular_dsa.pkl")

datasets = {
    'network': pickle.load(open('popular_ntw 1.pkl', 'rb')),
    'python': pickle.load(open('popular_py 1.pkl', 'rb')),
    'dsa': pickle.load(open('popular_dsa 1.pkl', 'rb')),
    'os': pickle.load(open('popular_os 1.pkl', 'rb'))
}

data_resources = {
    'network': {
        'pt': pickle.load(open('pt_ntw 1.pkl', 'rb')),
        'similarity_score': pd.read_pickle('similarity_ntw 1.pkl'),
        'book': pd.read_csv(r'Networks_data_filled_features.csv', encoding='ISO-8859-1')
    },
    'python': {
        'pt': pickle.load(open('pt_py 1.pkl', 'rb')),
        'similarity_score': pickle.load(open('similarity_py 1.pkl', 'rb')),
        'book': pd.read_csv(r'python_data_updated.csv')
    },
    'dsa': {
        'pt': pickle.load(open('pt_dsa 1.pkl', 'rb')),
        'similarity_score': pickle.load(open('similarity_dsa 1.pkl', 'rb')),
        'book': pd.read_csv(r'Data Structure_data.csv')
    },
    'os': {
        'pt': pickle.load(open('pt_os 1.pkl', 'rb')),
        'similarity_score': pickle.load(open('similarity_os 1.pkl', 'rb')),
        'book': pd.read_csv(r'Operating System_data.csv')
    }
}


lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))
model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

def hash_password(password):
    return generate_password_hash(password)

def verify_password(hashed_password, plain_password):
    return check_password_hash(hashed_password, plain_password)



# Function to clean text
def clean_text(text):
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    text = text.lower()
    tokens = text.split()
    cleaned_tokens = [lemmatizer.lemmatize(word) for word in tokens if word not in stop_words]
    return ' '.join(cleaned_tokens)

def get_similarity(query, feature):
    embeddings = model.encode([query, feature])
    similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    return similarity

def match_query_to_feature(query, feature):
    similarity_score = get_similarity(query, feature)
    if similarity_score >= 0.5:
        return True
    return query in feature.lower()

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Email already registered. Please log in.', 'error')
            return redirect(url_for('register'))

        # Add new user to the database
        hashed_password = hash_password(password)
        new_user = User(email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('home'))

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        user = User.query.filter_by(email=email).first()
        if user and verify_password(user.password, password):
            session['user'] = email
            flash('Login successful!', 'success')
            return redirect(url_for('home'))
        else:
            flash('Invalid email or password.', 'error')

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))



@app.route('/', methods=['GET', 'POST'])
def home():
    if 'user' not in session:
        return redirect(url_for('login'))

    if request.method == 'POST':
        topic = request.form.get('topic').strip().lower()
        if topic in datasets:
            title=""
            # Redirect to the new results page
            return redirect(url_for('results_page', topic=topic))
        else:
            flash("Invalid topic selected. Please try again.", "error")

    return render_template('index.html', topics=list(datasets.keys()))

@app.route('/results/<topic>', methods=['GET'])
def results_page(topic):
    if topic in datasets:
        books = pd.DataFrame(datasets[topic])
        # title=request.args.get('title')
        # book = books[books['title'] == title].iloc[0]
        temp_data = {
            "title": books['title'].iloc[0],
            "author": books['author'].iloc[0],
            "image": books['image'].iloc[0] if 'image' in books.columns else None,
            "pdf_link": books['pdf_link'].iloc[0] if 'pdf_link' in books.columns else None,
        }
        data = [temp_data]
        
        # title=request.args.get('title')
        # book = books[books['title'] == title].iloc[0]
        # comments = Comment.query.filter_by(title=book['title']).all()
        return render_template('results1.html', books=books, topic=topic, temp_data=temp_data, data=data)

    flash("Invalid topic selected.", "error")
    return redirect(url_for('home'))

@app.route('/similar_books/<topic>/<title>', methods=['GET'])
def similar_books(topic, title):
    try:
        pt = data_resources[topic]['pt']
        similarity_score = data_resources[topic]['similarity_score']
        book = data_resources[topic]['book']
        
        if title not in pt.index:
            return render_template('similar.html', books=None, error="Book not found in the dataset.")
        
        index = np.where(pt.index == title)[0][0]
        similar_items = sorted(list(enumerate(similarity_score[index])), key=lambda x: x[1], reverse=True)[1:7]

        data = []
        for i in similar_items:
            temp_df = book[book['title'] == pt.index[i[0]]]
            if not temp_df.empty:
                temp_data = {
                    "title": temp_df['title'].iloc[0],
                    "author": temp_df['author'].iloc[0],
                    "image": temp_df.get('image', pd.Series()).iloc[0] if 'image' in temp_df else None,
                    "pdf_link": temp_df.get('pdf_link', pd.Series()).iloc[0] if 'pdf_link' in temp_df else None,
                }
                data.append(temp_data)
                
        books = pd.DataFrame(data)
        return render_template('similar.html', books=books, topic=topic, title=title)

    except Exception as e:
        print(f"Error occurred: {e}")
        books = None
        return render_template('similar.html', books=books, error="An unexpected error occurred.",topic=topic,title=title)
    
@app.route('/comments', methods=['GET', 'POST'])
def comments_page():
    title = request.args.get('title')  # Get the book title from query parameters

    if request.method == 'POST':
        # Get the new comment from the form
        comment_text = request.form.get('comment')

        if comment_text:
            # Save the comment in the database
            new_comment = Comment(title=title, content=comment_text)
            db.session.add(new_comment)
            db.session.commit()
            flash('Comment added successfully!', 'success')
        else:
            flash('Comment cannot be empty.', 'error')

        return redirect(url_for('comments_page', title=title))
    
    # Fetch all comments for the given book title
    comments = Comment.query.filter_by(title=title).all()

    # Render the comments.html template with the book title and all related comments
    return render_template('comments.html', title=title, comments=comments)




@app.route('/search', methods=['GET', 'POST'])
def search():
    if request.method == 'POST':
        query = request.form.get('query').strip().lower()
        topic = request.form.get('topic').strip().lower()
        # preferred_by_input = request.form.get('preferred_by').strip().lower()

        # Clean the query text
        cleaned_query = clean_text(query)

        # Mapping for `preferred_by` field
        # PREFERRED_BY_MAPPING = {
        #     "student": 0,
        #     "employee": 1,
        #     "teacher": 2,
        #     "independent learner": 3
        # }

        if topic in datasets:
            book_df = data_resources[topic]['book']

            # Ensure features are preprocessed
            book_df['cleaned_feature'] = book_df['feature'].fillna('').astype(str)

            # Use AI-based matching for query and features
            mask = book_df['cleaned_feature'].apply(lambda x: match_query_to_feature(cleaned_query, x))

            # Filter the books that match the query
            matching_books = book_df[mask]

            # # Update the `preferred_by` filtering logic
            # if preferred_by_input in PREFERRED_BY_MAPPING:
            #     preferred_by_value = str(PREFERRED_BY_MAPPING[preferred_by_input])

            #     # Ensure `preferred_by` column values are strings for safe comparison
            #     matching_books = matching_books[matching_books['preferred_by'].apply(
            #         lambda x: preferred_by_value in str(x)
            #     )]

            # # Map `preferred_by` values to their corresponding labels for display
            # if not matching_books.empty:
            #     matching_books['preferred_by'] = matching_books['preferred_by'].apply(
            #         lambda x: '-'.join(
            #             [k for k, v in PREFERRED_BY_MAPPING.items() if str(v) in str(x)]
            #         )
            #     )

            # Convert the resulting DataFrame to a list of dictionaries for rendering
            books = matching_books.to_dict(orient='records')
            if books:
                return render_template('search_results.html', books=books, query=query, topic=topic)
            else:
                return render_template(
                    'search_results.html', 
                    books=None, 
                    error="No books match your query and preferred criteria.", 
                    topic=topic,
                    query=query
                )

    return render_template('search.html', topics=list(datasets.keys()))

if __name__ == "__main__":
    nltk.download('stopwords')
    nltk.download('wordnet')
    with app.app_context():
        db.create_all()
    app.run(debug=True,use_reloader=False)

