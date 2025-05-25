import asyncio
import sys
from twikit import Client, TooManyRequests
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from random import randint

# Load Firebase credentials
cred = credentials.Certificate("C:/y4s1/research/E-voting-research-project/pages/api/Candidates/firebase-credentials.json")  
firebase_admin.initialize_app(cred)
db = firestore.client()

# Read command-line arguments
if len(sys.argv) < 4:
    print("Usage: python collect_tweets.py <start_date> <end_date> <query>")
    sys.exit(1)

start_date = sys.argv[1]
end_date = sys.argv[2]
query_keywords = sys.argv[3]

# Format Twitter search query
QUERY = f'lang:en ({query_keywords})'

print(f"Fetching tweets with query: {QUERY}")

async def get_live_tweets(client):
    """Fetch real-time tweets with rate limit handling"""
    print(f'{datetime.now()} - Fetching latest tweets...')
    try:
        tweets = await client.search_tweet(QUERY, product='Latest')
        return tweets
    except TooManyRequests as e:
        reset_time = datetime.fromtimestamp(e.rate_limit_reset)
        wait_time = max((reset_time - datetime.now()).total_seconds(), 60)  # Ensure a minimum wait of 60s
        print(f'Rate limit reached. Waiting {wait_time} seconds...')
        await asyncio.sleep(wait_time)
        return await get_live_tweets(client)  # Retry after waiting
    except Exception as e:
        print(f"Error fetching tweets: {e}")
        return None


async def store_tweets_in_firebase(tweets):
    """Store tweets in Firebase Firestore"""
    for tweet in tweets:
        tweet_id = tweet.id
        tweet_data = {
            "username": tweet.user.name,
            "text": tweet.text,
            "created_at": tweet.created_at,
            "retweets": tweet.retweet_count,
            "likes": tweet.favorite_count,
            "location": tweet.user.location if hasattr(tweet.user, 'location') else 'N/A',
            "views": tweet.views if hasattr(tweet, 'views') else 'N/A',
            "shares": tweet.shares if hasattr(tweet, 'shares') else 'N/A'
        }

        # Avoid duplicates
        doc_ref = db.collection("tweets").document(str(tweet_id))
        if doc_ref.get().exists:
            print(f"Tweet {tweet_id} already exists, skipping...")
            continue

        doc_ref.set(tweet_data)
        print(f"Stored tweet {tweet_id} in Firebase.")

async def main():
    client = Client(language='en-US', timeout=60.0)
    client.load_cookies('cookies.json')

    while True:
        tweets = await get_live_tweets(client)  
        if tweets:
            await store_tweets_in_firebase(tweets)  
        
        wait_time = randint(5, 10)
        print(f"Waiting {wait_time} seconds before next fetch...")
        await asyncio.sleep(wait_time)

asyncio.run(main())  
