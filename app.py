import datetime
from re import I
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
            "private_key": environ.get("private_key").replace("\\n", "\n"),
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
planet_ref = db.collection('Planets')
sentiment_ref = db.collection('Sentiments')

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True


@app.route("/")
def hello_world():
    return "Hello World!"

@app.route("/login", methods=["POST"])
def login():
    try:
        # make sure required parameters are set and included
        name = request.args.get("planetName")
        if not name:
            return "Please include planetName parameter", 400
        pswrd = request.args.get("password")
        if not pswrd:
            return "Please include password parameter", 400
        
        planet_docs = planet_ref.stream()
        for planet_doc in planet_docs:
            print(planet_doc.to_dict()['planetName'])
            if planet_doc.to_dict()['planetName'] == name:
                if planet_doc.to_dict()['password'] == pswrd:
                    return "Successfully logged in planet!", 200
        
        return "Invalid credentials", 200
    except Exception as e:
        return f"An Error Occured: {e}", 500


@app.route("/register", methods=["POST"])
def register():
    try:
        # make sure required parameters are set and included
        name = request.args.get("planetName")
        if not name:
            return "Please include planetName parameter", 400
        pswrd = request.args.get("password")
        if not pswrd:
            return "Please include password parameter", 400
        
        system = request.args.get("system")
        if not system:
            system = 1
        
        #check to make sure no one else in solar system has same name
        if not validatePlanetname(name):
            return "That name is already taken, please use another", 400
        
        planet = {
            u'planetName' : str(name),
            u'password': str(pswrd),
            u'system' : [system]
        }
        
        planet_ref.add(planet)
        return "Successfully registered planet!", 200
    except Exception as e:
        return f"An Error Occured: {e}", 500


@app.route("/planetsInSystem", methods=["GET"])
def planetsInSystem():
    try:
        system = request.args.get("systemNum")
        if not system:
            return "Please include systemNum parameter", 400
        
        planetsInSystem = []
        
        planet_docs = planet_ref.stream()
        for planet_doc in planet_docs:
            if int(system) in planet_doc.to_dict()['system']:
                planetsInSystem.append(dict(id = planet_doc.id, planet = planet_doc.to_dict()))

        return jsonify(planetsInSystem), 200
    except Exception as e:
        return f"An Error Occured: {e}", 500

@app.route("/sentiment", methods=["GET", "POST", "DELETE"])
def sentiment():
    try:
        # Poll and get (if available) a sentiment
        # GET /sentiment
        # planet: planet trying to receive a sentiment
        if request.method == "GET":
            name = request.args.get("planetName")
            system = request.args.get("system")
            if not name:
                return "Please include planetName parameter", 400
            elif not system:
                return "Please include system parameter", 400
            else:
                all_sentiments = []
                sentiment_docs = sentiment_ref.where(u'to', u'==', name).stream()
                for sentiment_doc in sentiment_docs:
                    if str(sentiment_doc.to_dict()[u'system']) == system:
                        all_sentiments.append(dict(id = sentiment_doc.id, sentiment = sentiment_doc.to_dict()))
                return jsonify(sorted(all_sentiments, key= lambda x:x["sentiment"]["date"])), 200

        # Create (pseudo-send) a sentiment
        # POST /sentiment
        # planet: name of the sender planet
        # to_planet: name of the planet to send the sentiment to
        # sentiment: the sentiment to send
        elif request.method == "POST":
            fromPlanet = request.args.get("from")
            toPlanet = request.args.get("to")
            sentiment = request.args.get("sentiment")
            sentVal = request.args.get("sentVal") 
            system = request.args.get("system")
            
            
            if not fromPlanet:
                return "Please include sending Planet name parameter", 400
            elif not toPlanet:
                return "Please include receiving Planet name parameter", 400
            elif not sentiment:
                return "Please include sentiment parameter", 400
            elif not sentVal:
                return "Please include sentiment value parameter", 400
            elif not system:
                return "Please include system parameter", 400
            else:
                print()
                newSentiment = {
                    u'from': fromPlanet,
                    u'to': toPlanet,
                    u'message': sentiment,
                    u'sentVal': int(sentVal),
                    u'system': int(system),
                    u'date': datetime.datetime.now(tz=datetime.timezone.utc),
                }
                sentiment_ref.add(newSentiment)
                return "Successfully sent sentiment", 200

            # create a db entry from planet to to_planet with sentiment_str

        # Delete a sentiment after the planet has receieved it
        # DELETE /sentiment
        # planet: the planet that received the sentiment
        # sentiment: the sentiment that was received
        elif request.method == "DELETE":
            # delete the receieved sentiment from the database
            sentiment_id = request.args.get("sentimentId")
            if not sentiment_id:
                return "Please include sentiment ID parameter", 400
            else:
                sentiment_ref.document(sentiment_id).delete()
                return "Successfully deleted sentiment", 200
        else:
            return "Illegal request method", 405

    except Exception as e:
        return f"An Error Occured: {e}", 500

#validatePlanetName
def validatePlanetname(planetName):
    planet_docs = planet_ref.stream()
    for planet_doc in planet_docs:
        print(planet_doc.to_dict()['planetName'])
        if planet_doc.to_dict()['planetName'] == planetName:
            return False
    return True

if __name__ == "__main__":
    app.run()
