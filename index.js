const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const AWS = require("aws-sdk");
const cors = require('cors')

const app = express()

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const bucketName = 'crossover-test-bucket-will2s'

AWS.config.getCredentials(function (err) {
  if (err) console.log(err.stack);
  // credentials not loaded
  else {
    console.log("Access key:", AWS.config.credentials.accessKeyId);
  }
});

// Multer single file parser
const upload = multer({ limits: { fileSize: 500000 } }).single('uploadFile')

app.post('/upload', upload, (req, res) => {
  upload(req, res, function (err) {
    // check for error thrown by multer- file size etc
    if (err || req.file === undefined) {
      console.log(err)
      res.send("error occured")
    } else {
      // everything worked fine // req.body has text fields, req.file has the file 
      // TODO replace with try catch ?
      const objectParams = { Bucket: bucketName, Key: req.file.originalname, Body: req.file.buffer};

      const uploadPromise = new AWS.S3({ apiVersion: '2006-03-01' }).putObject(objectParams).promise();
      uploadPromise.then((data) => {
        console.log("Successfully uploaded data to " + bucketName + "/" + req.file.originalname);
      }).catch((err) => {
        console.error(err, err.stack);
      });

    }
  })
})


// Create unique bucket name


app.listen(8080,
  () => console.log(`Server running on port 8080`))