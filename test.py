
try:
    
  import json
  import boto3
  print("all modelues loaded...")
except Exception as e:
  print ("Some modules are missing")

def lambda_handler(event, context):

    client_sentiment = boto3.client("comprehend")
    Text = event.get("Text", None)
    response = client_sentiment.detect_sentiment(
        Text=Text,
        LanguageCode='en'
        )
    
    print(response)

    return {
        'status code': 200,
    }
    
    