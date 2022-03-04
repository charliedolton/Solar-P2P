from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore
from os.path import exists
from os import getenv, environ
import json

cred = (
    credentials.Certificate("solar_key.json")
    if exists("solar_key.json")
    else credentials.Certificate(
        {
            "type": environ.get("type"),
            "project_id": environ.get("project_id"),
            "private_key_id": environ.get("private_key_id"),
            "private_key": environ.get("private_key").replace(r'\n', '\n'),
            "client_email": environ.get("client_email"),
            "client_id": environ.get("client_id"),
            "auth_uri": environ.get("auth_uri"),
            "token_uri": environ.get("token_uri"),
            "auth_provider_x509_cert_url": environ.get("auth_provider_x509_cert_url"),
            "client_x509_cert_url": environ.get("client_x509_cert_url"),
        }
    )
)


# Initialize Firestore DB
firebase_admin.initialize_app(cred)
db = firestore.client()
planet_ref = db.collection("Planets")

app = Flask(__name__)


@app.route("/")
def hello_world():
    return "Hello World!"


@app.route("/register", methods=["POST"])
def register():
    planet = request.form.get("name")


@app.route("/sentiment", methods=["GET", "POST", "DELETE"])
def sentiment():
    # Poll and get (if available) a sentiment
    # GET /sentiment
    # planet: planet trying to receive a sentiment
    if request.method == "GET":
        planet = request.args.get("planet")

        # check db if planet has any sentiments waiting
        # return sentiment or ""
        return ""

    # Create (pseudo-send) a sentiment
    # POST /sentiment
    # planet: name of the sender planet
    # to_planet: name of the planet to send the sentiment to
    # sentiment: the sentiment to send
    elif request.method == "Post":
        planet, to_planet, sentiment_str = (
            request.form.get("planet"),
            request.form.get("to_planet"),
            request.form.get("sentiment"),
        )

        # create a db entry from planet to to_planet with sentiment_str

    # Delete a sentiment after the planet has receieved it
    # DELETE /sentiment
    # planet: the planet that received the sentiment
    # sentiment: the sentiment that was received
    else:
        planet, sentiment_str = request.args.get("planet"), request.args.get(
            "sentiment"
        )

        # delete the receieved sentiment from the database


if __name__ == "__main__":
    app.run()
