import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import PDFDocument, { pipe } from "pdfkit";
import cors from "cors";
// Setting for Hyperledger Fabric
import { Wallets, Gateway } from "fabric-network";
import fs from "fs";
import path, { resolve } from "path";
import yaml from "js-yaml";
import multer, { memoryStorage } from "multer";
import { S3Client } from "@aws-sdk/client-s3";

require("dotenv").config();

var s3Services = require("./services/s3Services.ts");

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// CORS Origin
app.use(function (req: Request, res: Response, next: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  // res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
const gateway = new Gateway();

const storage = memoryStorage();
const upload = multer({ storage });

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID?.toString() as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.toString() as string,
  },
});
//used by upload form
app.post(
  "/upload",
  upload.single("image"),
  async (req: Request, res: Response) => {
    const { file } = req;

    if (!file)
      return res.status(400).json({
        message: "Bad Request",
      });

    // const { error, key } = await s3Services.uploadToS3(s3, file);
    const _res = await s3Services.uploadToS3(s3, file);

    if (_res.error)
      return res.status(500).json({
        key:'ERROR IN UPLOADING'
      });

    return res.status(201).json(_res)

  }
);

app.get("/download/:id", async (req: Request, res: Response) => {
  const _data = (await s3Services.getImageFromS3(s3, req.params.id)) as any;
  return res.json({
    hash: _data.hash,
  })
  // return _pipe
  // const _buffer = Buffer.from(_data.body);
  // res.attachment(req.params.id);
  // _data.body.pipe(res);
  // res.pipe(_data.body).send({
  //   hash:_data.hash
  // })



});

app.get("/images", async (req: Request, res: Response) => {
  try {
    const imageKeys = await s3Services.getImagesKeysByUser(s3);

    const preSignedUrls = await s3Services.getSignedURLs(s3, imageKeys);
    return res.json(preSignedUrls);
  } catch (error) {
    console.log(error);
    return { error };
  }
});

app.post("/api/addProduct", async function (req: Request, res: Response) {
  let tx;
  try {
    //const contract = await fabricNetwork.connectNetwork('connection-producer.json', 'wallet/wallet-producer');
    const ccpPath = path.resolve(
      __dirname,
      "../..",
      "connections",
      "connection-producer.yaml"
    );
    let connectionProfile = yaml.load(
      fs.readFileSync(ccpPath, "utf8")
    ) as Record<string, unknown>;

    const walletPath = path.join(
      process.cwd(),
      "identity/user/producer-user/wallet"
    );
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userName = "producer-user";

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(userName);
    if (!identity) {
      console.log(
        `An identity for the user ${userName} does not exist in the wallet`
      );
      console.log("Run the addWallet.js application before retrying");
      return;
    }

    // Set connection options; identity and wallet
    let connectionOptions = {
      identity: userName,
      wallet: wallet,
      discovery: { enabled: true, asLocalhost: true },
    };

    // Connect to gateway using application specified parameters
    console.log("Connect to Fabric gateway.");

    await gateway.connect(connectionProfile, connectionOptions);

    console.log("Use network channel: mychannel.");

    const network = await gateway.getNetwork("mychannel");

    const contract = await network.getContract("scm-contract");

    let tuna = {
      id: req.body.id,
      farm: req.body.farm,
      block: req.body.block,
      lot: req.body.lot,
      timestamp: req.body.timestamp,
    };

    tx = await contract.submitTransaction("addProduct", JSON.stringify(tuna));
    await res.json({
      status: `OK - Transaction has been submitted\n ${tuna}`,
      txid: tx.toString(),
    });
    console.log("Tuna Added Successfully");
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error,
    });
  } finally {
    // Disconnect from the gateway
    console.log("Disconnect from Fabric gateway.");
    gateway.disconnect();
  }
});

app.post("/api/updateProduct", async function (req: Request, res: Response) {
  console.log(req.body, "RECEIVED DATA");
  try {
    const ccpPath = path.resolve(
      __dirname,
      "../..",
      "connections",
      "connection-deliverer.yaml"
    );
    let connectionProfile = yaml.load(
      fs.readFileSync(ccpPath, "utf8")
    ) as Record<string, unknown>;

    const walletPath = path.join(
      process.cwd(),
      "identity/user/deliverer-user/wallet"
    );
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userName = "deliverer-user";

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(userName);
    if (!identity) {
      console.log(
        `An identity for the user ${userName} does not exist in the wallet`
      );
      console.log("Run the addWallet.js application before retrying");
      return;
    }

    // Set connection options; identity and wallet
    let connectionOptions = {
      identity: userName,
      wallet: wallet,
      discovery: { enabled: true, asLocalhost: true },
    };

    // Connect to gateway using application specified parameters
    console.log("Connect to Fabric gateway.");

    await gateway.connect(connectionProfile, connectionOptions);

    console.log("Use network channel: mychannel.");

    const network = await gateway.getNetwork("mychannel");

    const contract = await network.getContract("scm-contract");

    let tx = await contract.submitTransaction(
      "setPosition",
      req.body.id,
      req.body.position,
      req.body.process
    );

    res.json({
      status: `OK - Transaction has been submitted with new edits \n Position: ${req.body.position}\n Process: ${req.body.process}`,
      txid: tx.toString(),
    });
    console.log("product updated");
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error,
    });
  } finally {
    // Disconnect from the gateway
    console.log("Disconnect from Fabric gateway.");
    gateway.disconnect();
  }
});

app.get(
  "/api/getProduct/:user/:id",
  async function (req: Request, res: Response) {
    try {
      const ccpPath = path.resolve(
        __dirname,
        "../..",
        "connections",
        "connection-manufacturer.yaml"
      );
      let connectionProfile = yaml.load(
        fs.readFileSync(ccpPath, "utf8")
      ) as Record<string, unknown>;

      const walletPath = path.join(
        process.cwd(),
        "identity/user/manufacturer-user/wallet"
      );
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);

      const userName = "manufacturer-user";

      // Check to see if we've already enrolled the user.
      const identity = await wallet.get(userName);
      if (!identity) {
        console.log(
          `An identity for the user ${userName} does not exist in the wallet`
        );
        console.log("Run the addWallet.js application before retrying");
        return;
      }

      // Set connection options; identity and wallet
      let connectionOptions = {
        identity: userName,
        wallet: wallet,
        discovery: { enabled: true, asLocalhost: true },
      };

      // Connect to gateway using application specified parameters
      console.log("Connect to Fabric gateway.");

      await gateway.connect(connectionProfile, connectionOptions);

      console.log("Use network channel: mychannel.");

      const network = await gateway.getNetwork("mychannel");

      const contract = await network.getContract("scm-contract");

      let _args = {
        id: req.params.id,
        user: req.params.user,
      };

      const pdfDoc = new PDFDocument();
      const pdfPath = path.resolve(
        __dirname,
        "../",
        "client/src/assets",
        "Product_Details.pdf"
      );
      pdfDoc.pipe(fs.createWriteStream(pdfPath));
      const result = await contract.evaluateTransaction(
        "queryAsset",
        JSON.stringify(_args)
      );

      pdfDoc.text("Details: " + result.toString(), 200, 200);
      pdfDoc.end();
      res.set("Content-Type", "application/pdf");
      res.status(200).json({
        status: result.toString(),
      });
    } catch (error) {
      console.error(`Failed to evaluate transaction: ${error}`);
      return res.status(500).json({
        error: `Failed to evaluate transaction: ${error}`,
      });
    } finally {
      // Disconnect from the gateway
      console.log("Disconnect from Fabric gateway.");
      gateway.disconnect();
    }
  }
);

app.get("/api/testMSP", async (req: Request, res: Response) => {
  try {
    const ccpPath = path.resolve(
      __dirname,
      "../..",
      "connections",
      "connection-manufacturer.yaml"
    );
    let connectionProfile = yaml.load(
      fs.readFileSync(ccpPath, "utf8")
    ) as Record<string, unknown>;

    const walletPath = path.join(
      process.cwd(),
      "identity/user/manufacturer-user/wallet"
    );
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userName = "manufacturer-user";

    const identity = await wallet.get(userName);
    if (!identity) {
      console.log(
        `An identity for the user ${userName} does not exist in the wallet`
      );
      console.log("Run the addWallet.js application before retrying");
      return;
    }

    // Set connection options; identity and wallet
    let connectionOptions = {
      identity: userName,
      wallet: wallet,
      discovery: { enabled: true, asLocalhost: true },
    };

    await gateway.connect(connectionProfile, connectionOptions);

    console.log("Use network channel: mychannel.");

    const network = await gateway.getNetwork("mychannel");

    const contract = await network.getContract("scm-contract");

    const result = await contract.evaluateTransaction("getMspId");

    res.status(200).json(result.toString());
  } catch {
    console.log("Custom Error while loading MSP_ID");
  }
});

app.post("/api/newProcess", async function (req: Request, res: Response) {
  try {
    const ccpPath = path.resolve(
      __dirname,
      "../..",
      "connections",
      "connection-manufacturer.yaml"
    );
    let connectionProfile = yaml.load(
      fs.readFileSync(ccpPath, "utf8")
    ) as Record<string, unknown>;

    const walletPath = path.join(
      process.cwd(),
      "identity/user/manufacturer-user/wallet"
    );
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userName = "manufacturer-user";

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(userName);
    if (!identity) {
      console.log(
        `An identity for the user ${userName} does not exist in the wallet`
      );
      console.log("Run the addWallet.js application before retrying");
      return;
    }

    // Set connection options; identity and wallet
    let connectionOptions = {
      identity: userName,
      wallet: wallet,
      discovery: { enabled: true, asLocalhost: true },
    };

    // Connect to gateway using application specified parameters
    console.log("Connect to Fabric gateway.");

    await gateway.connect(connectionProfile, connectionOptions);

    console.log("Use network channel: mychannel.");

    const network = await gateway.getNetwork("mychannel");

    const contract = await network.getContract("scm-contract");

    // let processData = {
    //   id: req.body.id,
    //   latitude: req.body.latitude,
    //   longitude: req.body.longitude,
    //   type: req.body.type,
    //   tunaId: req.body.tunaId
    // }

    let processData = req.body;
    console.log(processData);
    let tx = await contract.submitTransaction(
      "addProcess",
      JSON.stringify(processData)
    );
    res.json({
      status: "OK - Transaction has been submitted",
      txid: tx.toString(),
    });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error,
    });
  } finally {
    // Disconnect from the gateway
    console.log("Disconnect from Fabric gateway.");
    gateway.disconnect();
  }
});

app.get("/api/getHistory/:id", async function (req: Request, res: Response) {
  try {
    const ccpPath = path.resolve(
      __dirname,
      "../..",
      "connections",
      "connection-retailer.yaml"
    );
    let connectionProfile = yaml.load(
      fs.readFileSync(ccpPath, "utf8")
    ) as Record<string, unknown>;

    const walletPath = path.join(
      process.cwd(),
      "identity/user/retailer-user/wallet"
    );
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userName = "retailer-user";

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(userName);
    if (!identity) {
      console.log(
        `An identity for the user ${userName} does not exist in the wallet`
      );
      console.log("Run the addWallet.js application before retrying");
      return;
    }

    // Set connection options; identity and wallet
    let connectionOptions = {
      identity: userName,
      wallet: wallet,
      discovery: { enabled: true, asLocalhost: true },
    };

    // Connect to gateway using application specified parameters
    console.log("Connect to Fabric gateway.");

    await gateway.connect(connectionProfile, connectionOptions);

    console.log("Use network channel: mychannel.");

    const network = await gateway.getNetwork("mychannel");

    const contract = await network.getContract("scm-contract");

    let pdfDoc = new PDFDocument();
    const pdfPath = path.resolve(
      __dirname,
      "../",
      "client/src/assets",
      `Sushi_Details${req.params.id}.pdf`
    );
    pdfDoc.pipe(fs.createWriteStream(pdfPath));
    // const result = await contract.evaluateTransaction('queryAsset', req.params.id);
    const result_2 = await contract.evaluateTransaction(
      "getHistory",
      req.params.id
    );
    let response = JSON.parse(result_2.toString());
    //res.json(response);
    console.log(result_2.toString());
    // res.render('SushiDetails');
    pdfDoc.text("Details: " + result_2.toString(), 200, 200);
    pdfDoc.end();
    res.status(200).json({
      status: result_2.toString(),
    });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error,
    });
  } finally {
    // Disconnect from the gateway
    console.log("Disconnect from Fabric gateway.");
    gateway.disconnect();
  }
});

app.listen(process.env.PORT, () => {
  console.log("***********************************");
  console.log(`REST Server listening on port ${process.env.PORT}`);
  console.log("***********************************");
});

function reject(err: Error): void {
  throw new Error("Function not implemented.");
}
