const AWS = require("aws-sdk");
const { nanoid } = require("nanoid");
AWS.config.update({
  region: "us-east-1",
});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = process.env.DDBTableName;
const shortenerPath = "/shortener";
const redirectPath = "/{code}";
const checkPath = "/check";

exports.handler = async function (event, context, callback) {
  console.log("Event: ", event);
  let response;
  const body = JSON.parse(event.body);
  switch (true) {
    case event.httpMethod === "GET" && event.path === checkPath:
      response = buildResponse(200);
      break;
    case event.httpMethod === "GET" && event.resource === redirectPath:
      response = await handleRedirection(event.pathParameters.code, callback);
      break;
    case event.httpMethod === "POST" && event.path === shortenerPath:
      response = await createShortCode(body.longUrl);
      break;
    default:
      response = buildResponse(
        404,
        "Not Found, please check the url and params."
      );
      break;
  }
  return response;
};
// function to shorten url for short code
const createShortCode = async (url) => {
  const params = {
    TableName: dynamodbTableName,
    IndexName: "longUrlIndex",
    KeyConditionExpression: "longUrl = :longUrl",
    ExpressionAttributeValues: {
      ":longUrl": url,
    },
  };

  //find if database already has provided long url
  const data = await dynamodb.query(params).promise();
  if (data?.Items?.length > 0) {
    const body = {
      Operation: "SAVE",
      Message: "SUCCESS",
      Item: data.Items[0],
    };
    return buildResponse(200, body);
  } else {
    const shortCode = nanoid(10);
    const newItem = {
      urlCode: shortCode,
      longUrl: url,
    };
    const newParams = {
      TableName: dynamodbTableName,
      Item: newItem,
    };
    return await dynamodb
      .put(newParams)
      .promise()
      .then(
        () => {
          const body = {
            Operation: "SAVE",
            Message: "SUCCESS",
            Item: newItem,
          };
          console.log(body);
          return buildResponse(200, body);
        },
        (error) => {
          console.error("Error while creating new short url code", error);
        }
      );
  }
};

const handleRedirection = async (code, callback) => {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      urlCode: code,
    },
  };
  const item = await dynamodb.get(params).promise();
  if (item?.Item) {
    const response = {
      statusCode: 301,
      headers: {
        Location: item.Item.longUrl,
      },
    };
    return callback(null, response);
  } else {
    return buildResponse(404, "Url not found");
  }
};

function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin":
        "https://url-shortener-serverless.netlify.app/",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    },
    body: JSON.stringify(body),
  };
}
