import firebase_admin
from firebase_admin import credentials, firestore
import joblib
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
import threading
import time
from transformers import pipeline  # ✅ Import sentiment analysis pipeline

# ✅ Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ✅ Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")  # Replace with your Firebase key
firebase_admin.initialize_app(cred)
db = firestore.client()

# ✅ Load trained election prediction model
model = joblib.load("election_model.pkl")

# ✅ Global variable to control prediction loop
prediction_running = False


def load_tweets_from_firestore(batch_size=10):
    """Load tweets from Firestore in batches and extract features for prediction."""
    tweets_ref = db.collection("tweets")
    docs = tweets_ref.limit(batch_size).stream()  # ✅ Fetch only 10 at a time

    data = []
    for doc in docs:
        tweet_data = doc.to_dict()
        created_at = tweet_data.get("Created At")

        # ✅ Extract month from created_at
        if created_at:
            try:
                created_at = pd.to_datetime(created_at)
                month = created_at.strftime('%Y-%m')  # Extract month as 'YYYY-MM'
            except Exception as e:
                print(f"Error parsing date: {tweet_data.get('Text')}, error: {e}")
                month = None
        else:
            month = None

        data.append({
            "text": tweet_data.get("Text", ""),
            "created_at": created_at,
            "month": month,
            "likes": pd.to_numeric(tweet_data.get("Likes"), errors="coerce"),
            "retweets": pd.to_numeric(tweet_data.get("Retweets"), errors="coerce"),
            "views": pd.to_numeric(tweet_data.get("Views"), errors="coerce"),
        })

    df = pd.DataFrame(data)

    # ✅ Convert 'created_at' to a valid datetime format
    df['created_at'] = pd.to_datetime(df['created_at'], errors='coerce')

    # ✅ Fill NaN values with appropriate defaults
    df.fillna({'likes': 0, 'retweets': 0, 'views': 0, 'month': 'unknown'}, inplace=True)

    return df


def analyze_sentiments(df):
    """Perform sentiment analysis and compute engagement score."""
    sentiment_analyzer = pipeline("sentiment-analysis")

    df['engagement_score'] = df['likes'] + df['retweets'] + df['views']
    
    df['sentiment'] = df['text'].apply(
        lambda x: sentiment_analyzer(x[:512])[0]['label'] if isinstance(x, str) else "UNKNOWN"
    )
    df['sentiment_score'] = df['text'].apply(
        lambda x: sentiment_analyzer(x[:512])[0]['score'] if isinstance(x, str) else 0
    )

    df['sentiment_numeric'] = df['sentiment'].apply(lambda x: 1 if x == 'POSITIVE' else -1)
    df['normalized_sentiment'] = (df['sentiment_numeric'] * df['sentiment_score'])

    return df


def predict_and_save_votes():
    """Continuously predict and save election results while running."""
    global prediction_running

    while prediction_running:
        try:
            df = load_tweets_from_firestore()
            print("✅ succesfully load tweets from Firestore!")
            df = analyze_sentiments(df)

            # ✅ Ensure required features are present
            df = df[['month', 'normalized_sentiment', 'engagement_score']]
            
            # ✅ Aggregate per candidate per month
            monthly_data = df.groupby(["month"]).agg({
                "normalized_sentiment": "mean",
                "engagement_score": "sum"
            }).reset_index()

            # ✅ Use only the features that were available during training
            X_new = monthly_data[['normalized_sentiment', 'engagement_score']]

            # ✅ Predict vote share
            monthly_data["predicted_vote_share"] = model.predict(X_new)

            # ✅ Save predictions to Firestore
            predictions_ref = db.collection("monthly_predictions")

            for _, row in monthly_data.iterrows():
                doc_ref = predictions_ref.document(f"{row['month']}")
                doc_ref.set(row.to_dict())

            print("✅ Monthly Predictions Saved to Firestore!")

        except Exception as e:
            print("❌ Error in prediction loop:", e)

        # ✅ Sleep for a period before running again (e.g., every 1 hour)
        time.sleep(3600)  # 1-hour interval


@app.route("/api/start_prediction", methods=["POST"])
def start_prediction():
    """Start the continuous prediction loop."""
    global prediction_running
    if prediction_running:
        return jsonify({"message": "Prediction is already running!"})

    prediction_running = True
    threading.Thread(target=predict_and_save_votes, daemon=True).start()
    return jsonify({"message": "Prediction started successfully!"})


@app.route("/api/stop_prediction", methods=["POST"])
def stop_prediction():
    """Stop the prediction loop."""
    global prediction_running
    if not prediction_running:
        return jsonify({"message": "Prediction is not running!"})

    prediction_running = False
    return jsonify({"message": "Prediction stopped successfully!"})

@app.route("/api/test_load_tweets", methods=["GET"])
def test_load_tweets():
    try:
        df = load_tweets_from_firestore()
        return jsonify(df.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
