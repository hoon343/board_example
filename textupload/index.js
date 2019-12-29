console.log('Loading function');
const AWS = require('aws-sdk');
const crypto = require('crypto');
const s3 = new AWS.S3();
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    var jbody= JSON.parse(event.body);
    var content = jbody.content.toString();
    var title = jbody.title.toString();
    
    const operation = event.httpMethod;
    var username = 'testuser';

    const date = new Date();
    var timestamp = (-1)*date.getTime();
    var dbparams = {
        TableName: "textlist",
        Item:{
            "author": username,
            "title": title,
            "submitteddate": timestamp
        }
    };
    var filename =crypto.createHash('md5').update(username+'2w3%9kwp@$e^'+timestamp+'somethingsalt').digest('hex')+'.html';
    dbparams.Item["filename"]=filename;
    console.log('username:'+username);
    console.log('filename:'+filename);
            
    var s3params = {
        Bucket : 'hoon-boardtest',
        Key : username+'/'+filename,
        Body : content
    };
    
    
    
    console.log('jbody:',JSON.stringify(jbody));
    switch (operation) {
        case 'POST':
            s3.putObject(s3params, function(err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else{
                    console.log('text uploaded: '+username+'/'+filename);           // successful response
                    console.log("DB: Adding a new item...");
                    dynamo.put(dbparams, (err, data) => {
                        if (err) {
                            console.error("Unable to add a new item. Error JSON:", JSON.stringify(err, null, 2));
                            var delparams = {
                                Bucket: 'hoon-boardtest',
                                Key: username+'/'+filename
                            };
                            s3.deleteObject(delparams, function(err, data) {
                                if (err) console.log(err, err.stack);  // error
                                else     console.log('text deleted: '+username+'/'+filename);                 // deleted
                            });
                            callback(null, {
                                'statusCode': 500,
                                'headers': {'Access-Control-Allow-Origin': '*'},
                                'body': JSON.stringify(data)
                            });
                        }
                        else{
                            callback(null, {
                                'statusCode': 200,
                                'headers': {'Access-Control-Allow-Origin': '*'},
                                'body': JSON.stringify(data)
                            });
                        }        // successful response
                    });
                }
            });
            break;
        default:
            callback(new Error(`Unrecognized operation "${operation}"`));
    }
};
