import crypo from "node:crypto"
import express from "express"
import cors from "cors"
import bodyParser from "body-parser"

const app = express()
app.use(cors())

// Custom middleware to parse "activity+json" content type
const activityJsonMiddleware = bodyParser.json({ type: 'application/activity+json' });

app.use(activityJsonMiddleware)



app.all("/.well-known/webfinger", (req, res) => {
    let response = {"subject": "acct:alice@social.gougoule.ch","links": [{"rel": "self","type": "application/activity+json","href": "https://social.gougoule.ch/actor"}]}
    res.json(response)
})

app.all("/actor", (req, res) => {
    let response = {"@context": ["https://www.w3.org/ns/activitystreams","https://w3id.org/security/v1"],"id": "https://social.gougoule.ch/actor","type": "Person","preferredUsername": "alice","inbox": "https://social.gougoule.ch/inbox","publicKey": {"id": "https://social.gougoule.ch/actor#main-key","owner": "https://social.gougoule.ch/actor","publicKeyPem": "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsXU0wOL2B8VFiKmZgrDh6JY3I5lxnaa7nRKEgzDCuFefBQVVSJTl3j7tNYNeija40tQhz40czM6zbaMNKi68ea4wlxdBOUtBV+QKFX3YjaqL/ojk064DAZuIu2J389gKpVFMhJwrLRBGpSqBF26PA2XyFCLibAeGq0/htWcO6YEbQLy3xTjtaXhuOP4mdhsRAi36X+1+ygDWG2cN9wEnttx2H4Y/mxMnwYoVRCajTs6MAs2eSXv0mTLY+k4dkoqJF/hw4WqymqdCRZWvtxjGwv/yqEMudGFCQRIgZ3w2hkbN5E6RSR0mxrpJ0UArTQOYZndh2O6CWHHjDvHLyazsnwIDAQAB-----END PUBLIC KEY-----"}}
    res.json(response)
})


app.all("/inbox", async (req, res) => {
    console.log(req)
    let actor = req.body.actor
    await send(req.app.get("actor"), req.body.actor, {
        "@context": "https://www.w3.org/ns/activitystreams",
        id: `https://social.gougoule.ch/${crypto.randomUUID()}`,
        type: "Accept",
        actor,
        object: body,
      });

})

async function send(sender, recipient, message) {
  const url = new URL(recipient);

  const actor = await fetchActor(recipient);
  const fragment = actor.inbox.replace("https://" + url.hostname, "");
  const body = JSON.stringify(message);
  const digest = crypto.createHash("sha256").update(body).digest("base64");
  const d = new Date();

  const key = crypto.createPrivateKey(PRIVATE_KEY.toString());
  const data = [
    `(request-target): post ${fragment}`,
    `host: ${url.hostname}`,
    `date: ${d.toUTCString()}`,
    `digest: SHA-256=${digest}`,
  ].join("\n");
  const signature = crypto
    .sign("sha256", Buffer.from(data), key)
    .toString("base64");

  const res = await fetch(actor.inbox, {
    method: "POST",
    headers: {
      host: url.hostname,
      date: d.toUTCString(),
      digest: `SHA-256=${digest}`,
      "content-type": "application/json",
      signature: `keyId="${sender}#main-key",headers="(request-target) host date digest",signature="${signature}"`,
      accept: "application/json",
    },
    body,
  });

  if (res.status < 200 || 299 < res.status) {
    throw new Error(res.statusText + ": " + (await res.text()));
  }

  return res;
}

app.listen(3010)
