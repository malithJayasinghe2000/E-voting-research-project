# mongodb.py
from pymongo import MongoClient

client = MongoClient("mongodb+srv://sandaru2:sandaru2@test.bgjabxi.mongodb.net/biznesAdverticerDB?retryWrites=true&w=majority")
db = client["biznesAdverticerDB"]
votes_collection = db["votes"]

def store_encrypted_vote(vote_data):
    votes_collection.insert_one(vote_data)
