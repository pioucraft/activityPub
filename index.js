import express from "express"
import cors from "cors"

const app = express()
app.use(cors())
app.use(express.json())




app.all("/.well-known/webfinger", (req, res) => {
    let response = {"subject": "acct:alice@social.gougoule.ch","links": [{"rel": "self","type": "application/activity+json","href": "https://social.gougoule.ch/actor"}]}
    res.json(response)
})

app.all("/actor", (req, res) => {
    let response = {"@context": ["https://www.w3.org/ns/activitystreams","https://w3id.org/security/v1"],"id": "https://social.gougoule.ch/actor","type": "Person","preferredUsername": "alice","inbox": "https://social.gougoule.ch/inbox","publicKey": {"id": "https://social.gougoule.ch/actor#main-key","owner": "https://social.gougoule.ch/actor","publicKeyPem": "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsXU0wOL2B8VFiKmZgrDh6JY3I5lxnaa7nRKEgzDCuFefBQVVSJTl3j7tNYNeija40tQhz40czM6zbaMNKi68ea4wlxdBOUtBV+QKFX3YjaqL/ojk064DAZuIu2J389gKpVFMhJwrLRBGpSqBF26PA2XyFCLibAeGq0/htWcO6YEbQLy3xTjtaXhuOP4mdhsRAi36X+1+ygDWG2cN9wEnttx2H4Y/mxMnwYoVRCajTs6MAs2eSXv0mTLY+k4dkoqJF/hw4WqymqdCRZWvtxjGwv/yqEMudGFCQRIgZ3w2hkbN5E6RSR0mxrpJ0UArTQOYZndh2O6CWHHjDvHLyazsnwIDAQAB-----END PUBLIC KEY-----"}}
    res.json(response)
})


app.all("/inbox", (req, res) => {
    console.log(req.type)
    let follower = req.body.actor
    const followAccept = {
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "Follow",
      actor: "https://social.gougoule.ch/actor",
      object: follower,
    };
    res.json(followAccept)
})

app.listen(3010)
