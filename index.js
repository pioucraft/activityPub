import { createHash, createPrivateKey, sign } from "node:crypto"
import express from "express"
import cors from "cors"
import bodyParser from "body-parser"

const app = express()
app.use(cors())


var publicKey = "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsXU0wOL2B8VFiKmZgrDh6JY3I5lxnaa7nRKEgzDCuFefBQVVSJTl3j7tNYNeija40tQhz40czM6zbaMNKi68ea4wlxdBOUtBV+QKFX3YjaqL/ojk064DAZuIu2J389gKpVFMhJwrLRBGpSqBF26PA2XyFCLibAeGq0/htWcO6YEbQLy3xTjtaXhuOP4mdhsRAi36X+1+ygDWG2cN9wEnttx2H4Y/mxMnwYoVRCajTs6MAs2eSXv0mTLY+k4dkoqJF/hw4WqymqdCRZWvtxjGwv/yqEMudGFCQRIgZ3w2hkbN5E6RSR0mxrpJ0UArTQOYZndh2O6CWHHjDvHLyazsnwIDAQAB-----END PUBLIC KEY-----"


var privateKey = "-----BEGIN PRIVATE KEY-----MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCxdTTA4vYHxUWIqZmCsOHoljcjmXGdprudEoSDMMK4V58FBVVIlOXePu01g16KNrjS1CHPjRzMzrNtow0qLrx5rjCXF0E5S0FX5AoVfdiNqov+iOTTrgMBm4i7Ynfz2AqlUUyEnCstEEalKoEXbo8DZfIUIuJsB4arT+G1Zw7pgRtAvLfFOO1peG44/iZ2GxECLfpf7X7KANYbZw33ASe23HYfhj+bEyfBihVEJqNOzowCzZ5Je/SZMtj6Th2SiokX+HDharKap0JFla+3GMbC//KoQy50YUJBEiBnfDaGRs3kTpFJHSbGuknRQCtNA5hmd2HY7oJYceMO8cvJrOyfAgMBAAECggEADrGQQSppycHtXIACjH497mbFwQZbEH02Sq62VzCJ5v6mVaGX6q8di3X1aTlr8hDO4/IZrJhYGqNA2yKlm+kLxR2Fu3T6+xX+nprstNPbQvuspNJL9DUT3aW1wCJKoV+xnfep2M8fihcvakynLLwETnk5/q3WxrAm1/eAzmbupqncyh5Eeo+3RPQXQAZa5CEeyBfMdM9BRAV2gULuZ/2UXHGGh97JU5v7Wnl0GuJUn/xMReCnE68LMEwYXH3CSZIW20NxVOfAWz56zg/Xs5qjw6473FIhzMrSWlPe3oCKEfKa8x9JUvrnNNJv8ysWR1w/rrrvXWwtNkN0SNiH5IKMCQKBgQD6K63i4neZpBM37DZ2K8fDAbV2c529BkdObweJo7FTwhWvsedSWcLZxPS1gCJFXckVs7X/zSczhCDVgyvzfpRpSXSgkEcLRjAXTqTkESzGxvUJKMUS9HDEm29bsbXpxphLA4VUOJDGc/f8ufJ8bqJ+5jdDQgojJcheOlrp5UfolwKBgQC1l8eXZmn3KCQflEsyBlgrAsdSAYHUnzMl8Bjc8vSq43HWDGBWsrvL8seu9UWQSW6/Hd4jLPOyIpKnnB0aeIXNR4fRtz9hdnCbqnYmOnZxnbzztYJlDPFDKlrK00mWP9mumXHrIZFwWjrGilcS1j1602qApre2qjK0QGsppRBVOQKBgEw4CJdqhiPSQGS2W/Vu60K3f5DiMrnHcuwrmbFOpRUuuaq42hBV9q6geineKxLVOxGYmiegWoQwikxi1X4vH4pgbd8JdguyS66eMFCoButc7ITo3fojbUQJU0ktgI4ECpw4K2P4g+tio7hk8sMEdg+Rll6wfSQuO7ixsMc4KstrAoGBAJFFzFGth8ZHIab1zrZFZxF5lpVfSUsc1SFbk7hm0R9I94/CtOuG7z/4iJDJ/Q2yAVv5e/VuB8MRb3uRI6NCmeAggmJek+DXjLyrwPtSN+EqzLe3FIrcsMIHxzyNjUga6n2Imh796skUFgMxNvmF1QdGzOQA++WxAQE8q75UI93ZAoGBAKl9qOjYikaya9plIghYchyGWzrlWz6CihG8CspzVtXw+W+op82pqD2NZLanXdge5J1rUGWmST0VOuGnM3VgiR15ZAPIuAP5H+JxmrGzgLrfrcpe2g5vTbkZSSQSwTFlnLUY0CQ1g0qhObdWd3RfPrcSO+gBDWu/AgLsIfaiS7Wb-----END PRIVATE KEY-----"

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


var activity_id = crypto.randomUUID()
var hash = createHash('sha256');



const digest = hash.update(`{"@context": "https://www.w3.org/ns/activitystreams", "id": ${activity_id}, "type": "Follow", "actor": "https://social.gougoule.ch/actor", "object": "https://mastodon.gougoule.ch/users/pfannkuchen"}`, "utf-8").digest("hex")
let date = new Date().toUTCString()
const key = createPrivateKey(privateKey);
const data = [
    `(request-target): post ${"/users/pfannkuchen/inbox"}`,
    `host: mastodon.gougoule.ch`,
    `date: ${date}`,
    `digest: SHA-256=${digest}`,
  ].join("\n");
const signature = sign("sha256", Buffer.from(data), key).toString("base64");

console.log(signature)
fetch("https://mastodon.gougoule.ch/users/pfannkuchen/inbox", {headers: {"Date": date, "Content-Type": "application/activity+json", "Host": "mastodon.gougoule.ch", "Signature": signature, "Digest": digest}, "body": {"@context": "https://www.w3.org/ns/activitystreams", "id": activity_id, "type": "Follow", "actor": "https://social.gougoule.ch/actor", "object": "https://mastodon.gougoule.ch/users/pfannkuchen"}}).then(data => data.json()).then(data => {
    
})

app.listen(3010)
