from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firestore DB
cred = credentials.Certificate("solar_key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()
planet_ref = db.collection('Planets')

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "Hello World!"

if __name__ == "__main__":
    app.run()
