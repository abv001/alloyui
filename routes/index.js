var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-west-2',
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
});

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index.html');
});

router.get('/data', function (req, res, next) {
    var params = {
        TableName: "customer"
    }
    var docClient = new AWS.DynamoDB.DocumentClient();
    docClient.scan(params, function (err, data) {
        var items = [];
        if (data && data.Items) {
            data.Items.forEach(function (item) {
                var customer = item.customer;
                customer['id'] = item.id;
                items.push(customer);
            });
        }
        res.json(items);
    });
});

router.post('/add', function (req, res, next) {
    console.log(req.body);
    var customer = req.body
    if (!req.body.id || req.body.length == 0) {
        delete customer['id'];
        var params = {
            TableName: 'customer',
            Item: {
                'id': new Date().getTime(),
                'customer': customer
            }
        };
        var docClient = new AWS.DynamoDB.DocumentClient();
        docClient.put(params, function (err, data) {
            if (err) {
                console.log("Error", err);
            } else {
                console.log("Success", data.Item);
            }
            res.redirect('/');
        });
    } else {
        var customer = req.body
        var params = {
            TableName: 'customer',
            Key: {
                'id': parseInt(req.body.id)
            },
            UpdateExpression: "set customer = :customer",
            ExpressionAttributeValues: {
                ":customer": customer
            }
        };
        var docClient = new AWS.DynamoDB.DocumentClient();
        docClient.update(params, function (err, data) {
            if (err) {
                console.log("Error", err);
            } else {
                console.log("Success", data.Item);
            }
            res.redirect('/');
        });
    }
});

router.post('/delete', function (req, res, next) {
    var params = {
        TableName: 'customer'
    };
    var docClient = new AWS.DynamoDB({apiVersion: '2012-10-08'})
    docClient.deleteTable(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data.Item);
        }
        res.redirect('/');
    });
});

router.post('/del', function (req, res, next) {
    console.log(req.body);
    var params = {
        TableName: 'customer',
        Key: {
            id: parseInt(req.body.id)
        }
    };
    var docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-10-08'})
    docClient.delete(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data.Item);
        }
        res.redirect('/');
    });
});

router.post('/create', function (req, res, next) {
    var params = {
        AttributeDefinitions: [
            {
                AttributeName: 'id',
                AttributeType: 'N'
            }
        ],
        KeySchema: [
            {
                AttributeName: 'id',
                KeyType: 'HASH'
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
        },
        TableName: 'customer',
        StreamSpecification: {
            StreamEnabled: false
        }
    };
    var ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'})
    // Call DynamoDB to create the table
    ddb.createTable(params, function (err, data) {
        if (err) {
            req.flash('info', err.message);
            console.log("Error", err.message);
        } else {
            console.log("Success", data);
        }
        res.redirect('/');
    });
});

module.exports = router;