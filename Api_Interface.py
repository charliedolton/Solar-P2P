import requests
import time

f = open("nameFile.txt", 'r')
planetName = f.read()

BASE_URL = "api.com/sentiments"
GET_PARAMS = dict(
    planetName = planetName
)

while(True):
    try:
        r = requests.get(url=BASE_URL, params=GET_PARAMS)
        sentiments = r.json()
        for sentiment in sentiments:
            sentimentId = sentiment.sentimentId
            sender = sentiment.sender
            if (sentiment == 1):
                blink(BLUE_LED)
            elif (sentiment == 2):
                blink(RED_LED)
            elif (sentiment == 3):
                blink(GREEN_LED_PIN)
        
            DELETE_PARAMS = dict(
                sentimentId = sentimentId
            )

            requests.delete(url=BASE_URL, params=DELETE_PARAMS)

        time.sleep(3)
    except:
        time.sleep(3)
        continue

    if (blueButtonPushed()):
        receiver = getReceiver()
        POST_PARAMS = dict(
            senderName = planetName
            receiverName = receiver
            message = blueMessage
            actionInt = 1
        )
        requests.post(url=BASE_URL, params=POST_PARAMS)

    if (redButtonPushed()):
        reciever = getReceiver()
        POST_PARAMS = dict(
            senderName = planetName
            receiverName = receiver
            message = redMessage
            actionInt = 2
        )
        requests.post(url=BASE_URL, params=POST_PARAMS)

    if (greenButtonPushed()):
        receiver = getReceiver()
        POST_PARAMS = dict(
            senderName = planetName
            receiverName = receiver
            message = greenMessage
            actionInt = 3
        )
        requests.post(url=BASE_URL, params=POST_PARAMS)

