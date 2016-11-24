from __future__ import print_function

import json
import os

import boto3

print('Loading function')


def handler(event, context):
    client = boto3.client(
        'iot-data', region_name=os.environ['IOT_TOPIC_REGION_ID'])

    print("Received event: " + json.dumps(event, indent=2))

    eventName = event['Records'][0]['eventName']
    print("Event Name: '" + eventName + "'")

    if eventName == 'INSERT':
        print(
            "data: " + json.dumps(event['Records'][0]['dynamodb']['NewImage']))
        # Change topic, qos and payload
        response = client.publish(
            topic=os.environ['IOT_TOPIC_MQTT'],
            qos=1,
            payload=json.dumps(event['Records'][0]['dynamodb']['NewImage']))
        return 'Successfully inserted data to iot'
    #print("Received event: " + json.dumps(event, indent=2))
    # for record in event['Records']:
    #     print(record['eventID'])
    #     print(record['eventName'])
    #     print("DynamoDB Record: " + json.dumps(record['dynamodb'], indent=2))
    return 'No data inserted'
