# Serverless url shortener

## Objective 

Create a serverless url shortener endpoint which will receive a long url and returns a short url.
Users visiting the short url should have a redirection to the long url.

## Description
This repository contains the lambda function code which is saved in index.js file.

## AWS services used for the solution.

- Api Gateway
- DynamoDB
- Lambda
- IAM

## Approach

### On client side
- When the user requests for the shorten url, a fetch request is being made to the backend.
- The response of the request is an object which contains the shorten code for the url.
- The code is attached to the domain/api url to create the shorten url.

### In Backend

- When the user enter and submit the long url, a POST request is sent and it will trigger the lambda.
- In the lambda function, i have used the aws-sdk and nanoId package.
- Nanoid package is used to create short code of length 10 for the long urls.
- These short codes are stored in the DynamoDB table along with their long urls.
- When user opens the shorten url, a GET request is sent to backend.
- The lambda function handles the request by extracting the shortcode from the shorten url.
- The short code is used to search the DDB Table for the long url.
- It then creates a 301 redirect and the user is redirected to the original/long url.

## Installation

- Clone this project.
- Run 'npm install' to install required dependencies.
- Zip the complete folder.
- Create a lambda function in AWS console and and upload the zip file inside the lambda console.

## Configurations in AWS web console

### API Gateway endpoints.

| Api Endpoint | Method | Description                                                              |
| -------------| ------ |------------------------------------------------------------------------- |
| /check       | GET    |Check the operation of the service                                        |
| /shorten     | POST   |Endpoint to shorten the input url                                         |
| /{code}      | GET    |Endpoint to retrieve and redirect to the long url.                        |

### DynamoDB Table configuration

- Partition Key : urlCode
- Global secondary Index : longUrl

### IAM role configuration
- Create a new IAM role for the lambda function to work with all required permissions.
- Attach 'AmazonDynamoDBFullAccess' and 'CloudWatchLogsFullAccess' policies to the new IAM role.
- You can also create a new policy with unit policies of DynamoDB required for the task instead of 'AmazonDynamoDBFullAccess'.
