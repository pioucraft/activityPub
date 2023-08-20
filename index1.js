import { createHash, createPrivateKey, sign } from "node:crypto"
import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import * as fs from 'fs';
import { sha256 } from "crypto-hash";

const app = express()
app.use(cors())

var privateKey = ""
var publicKey = ""

const privateKeyPath = 'private.pem';
try {
  privateKey = fs.readFileSync(privateKeyPath, 'utf8');
} catch (error) {
  console.error("Error reading or creating private key:", error);
}

const publicKeyPath = 'public.pem';

try {
  publicKey = fs.readFileSync(publicKeyPath, 'utf8');
} catch (error) {
  console.error("Error reading or creating public key:", error);
}



// Custom middleware to parse "activity+json" content type
const activityJsonMiddleware = bodyParser.json({ type: 'application/activity+json' });

app.use(activityJsonMiddleware)



app.all("/.well-known/webfinger", (req, res) => {
    let response = {"subject": "acct:alice@social.gougoule.ch","links": [{"rel": "self","type": "application/activity+json","href": "https://social.gougoule.ch/actor"}]}
    res.json(response)
})

app.all("/actor", (req, res) => {
    let response = {"@context": ["https://www.w3.org/ns/activitystreams","https://w3id.org/security/v1"],"id": "https://social.gougoule.ch/actor","type": "Person","preferredUsername": "alice","inbox": "https://social.gougoule.ch/inbox","publicKey": {"id": "https://social.gougoule.ch/actor#main-key","owner": "https://social.gougoule.ch/actor","publicKeyPem": publicKey}}
    res.json(response)
})

app.all("/inbox", (req, res) => {
    console.log(req)
})

var activity_id = "https://social.gougoule.ch/"+crypto.randomUUID()

var aString = `{"@context": "https://www.w3.org/ns/activitystreams", "id": ${activity_id}, "type": "Follow", "actor": "https://social.gougoule.ch/actor", "object": "https://mastodon.gougoule.ch/users/pfannkuchen"}`
const hash = createHash('sha256');
hash.update(aString, 'utf-8');
const digest = hash.digest('base64');


let date = new Date().toUTCString()
const key = createPrivateKey(privateKey)
const data = [
    `(request-target): post ${"/users/pfannkuchen/inbox"}`,
    `digest: SHA-256=${digest}`,
    `host: mastodon.gougoule.ch`,
    `date: ${date}`,
  ].join("\n");
console.log(data)
const signature = sign("sha256", Buffer.from(data), key).toString("base64");

console.log(signature)

const requestBody = JSON.stringify({
  "@context": "https://www.w3.org/ns/activitystreams",
  "id": activity_id,
  "type": "Follow",
  "actor": "https://social.gougoule.ch/actor",
  "object": "https://mastodon.gougoule.ch/users/pfannkuchen"
});

const contentLength = Buffer.byteLength(requestBody, 'utf-8'); // Calculate the length of the request body

fetch("https://mastodon.gougoule.ch/users/pfannkuchen/inbox", {
  method: "POST",
  headers: {
    "Date": date,
    "content-type": "application/activity+json",
    "Host": "mastodon.gougoule.ch",
    "Signature": `keyId="https://social.gougoule.ch/actor/#main-key",algorithm="rsa-sha256",headers="(request-target) digest host date",signature="${signature}"`,
    "accept": "application/json",
    "Digest": `SHA-256=${digest}`,
    "Content-Length": contentLength // Add the Content-Length header
  },
  body: requestBody
})
.then(response => response.json())
.then(data => {
  console.log(data);
})
.catch(error => {
  console.error("Request error:", error);
});


console.log("https://mastodon.gougoule.ch/users/pfannkuchen/inbox", {"method": "POST", headers: {"Date": date, "Content-Type": "application/activity+json", "Host": "mastodon.gougoule.ch", "Signature": signature, "Digest": "SHA-256="+digest}, "body": {"@context": "https://www.w3.org/ns/activitystreams", "id": activity_id, "type": "Follow", "actor": "https://social.gougoule.ch/actor", "object": "https://mastodon.gougoule.ch/users/pfannkuchen"}})

app.listen(3010)
