console.log('Loading function');

const doc = require('dynamodb-doc');

const dynamo = new doc.DynamoDB();

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    const operation = event.httpMethod;
    console.log('event.body:', event.body);
    var jbody= JSON.parse(event.body);
    console.log('jbody:',JSON.stringify(jbody));
    var LastEvaluatedKey = jbody.LastEvaluatedKey;
    console.log('last:',JSON.stringify(LastEvaluatedKey));
    var Limit = jbody.Limit;
    var param = {
        TableName: "textlist",
        Limit: Limit
    };
    if(LastEvaluatedKey){
        param.ExclusiveStartKey= LastEvaluatedKey;
    }
    console.log(JSON.stringify(param));
    switch (operation) {
        case 'POST':
            dynamo.scan(param, (err, data) => {
                if (err) {
                    console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
                }
                else{
                    callback(null, {
                        'statusCode': 200,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': JSON.stringify(data)
                    });
                }
            });
            break;
        default:
            callback(new Error(`Unrecognized operation "${operation}"`));
    }
};
