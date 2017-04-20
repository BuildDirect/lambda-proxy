var https = require('https');
const DEBUG = process.env.DEBUG | false;


exports.handler = (event, context, callback) => {
    if (DEBUG)
        console.log(JSON.stringify(event));
    if (! ("headers" in event))
        return callback("Missing headers in event body, you need to set body mapping in gateway.");
    if (! ("body" in event))
        return callback("Missing body in event body, you need to set body mapping in gateway.");
    if (! ("target" in event))
        return callback("Missing target in event body, you need to set body mapping in gateway.");
    
    var config = event.target;
    
    var options = {
        hostname: config.hostname,
        port: 443,
        path: config.path,
        method: config.method,
        headers: event.headers
    };
   
    var req = https.request(options, (res) => {
    
        var data = '';
        res.on('data', (d) => {
            data += d;
        });
        
        res.on('end', (e) => {
            if (DEBUG)
                console.log("Call to " + config.hostname + " got status " + res.statusCode + ": " + JSON.stringify(event.body));
            if(res.statusCode < 400){
                callback(null, data);
            }
            else {
                callback(data);
            }
        });
        
    });
    
    req.on('error', (err) => {
        console.error("Error in calling " + config.hostname + ": " + err);
        callback(err);
    });
    
    req.write(JSON.stringify(event.body));
    req.end();
};
