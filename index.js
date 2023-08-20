import { createHash, createPrivateKey, sign } from "node:crypto"
import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import * as fs from 'fs';

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


var activity_id = "https://social.gougoule.ch/"+crypto.randomUUID()
var hash = createHash('sha256');



const digest = hash.update(`{"@context": "https://www.w3.org/ns/activitystreams", "id": ${activity_id}, "type": "Follow", "actor": "https://social.gougoule.ch/actor", "object": "https://mastodon.gougoule.ch/users/pfannkuchen"}`, "utf-8").digest("hex")
let date = new Date().toUTCString()
const key = createPrivateKey(privateKey)
const data = [
    `(request-target): post ${"/users/pfannkuchen/inbox"}`,
    `digest: SHA-256=${digest}`,
    `host: mastodon.gougoule.ch`,
    `date: ${date}`
  ].join("\n");
const signature = sign("sha256", Buffer.from(data), key).toString("base64");

console.log(signature)
fetch("https://mastodon.gougoule.ch/users/pfannkuchen/inbox", {"method": "POST", headers: {"Date": date, "Content-Type": "application/activity+json", "Host": "mastodon.gougoule.ch", "Signature": signature, "Digest": "SHA-256="+digest}, "body": {"@context": "https://www.w3.org/ns/activitystreams", "id": activity_id, "type": "Follow", "actor": "https://social.gougoule.ch/actor", "object": "https://mastodon.gougoule.ch/users/pfannkuchen"}}).then(data => data).then(data => {

    console.log(data)
    
})

app.listen(3010)
