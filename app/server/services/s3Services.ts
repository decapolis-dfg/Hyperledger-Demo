import {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { Readable } from "stream";
import * as dotenv from "dotenv";

dotenv.config();


module.exports = {
  uploadToS3: async function (s3:S3Client, file: any) {
    const key = file.originalname;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      const{ETag} = await s3.send(command);
      return { key:key, hash:ETag };
    } catch (error) {
      console.log(error);
      return { error };
    }
  },

  getImagesKeysByUser: async function (s3:S3Client) {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME,
    });

    const { Contents = [] } = await s3.send(command);
    return Contents.map((image:any) => image.Key);
  },

  getSignedURLs: async function(s3:S3Client,imageKeys:any){
    const preSignedUrls = await Promise.all(
        imageKeys.map((key:string) => {
          const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
          });
          return getSignedUrl(s3, command, { expiresIn: 900 });
        })
      );
      return preSignedUrls;
  },

  getImageMetadata: async function (s3:S3Client, key: string) {
    const command = new HeadObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });
    const _temp = await s3.send(command);

    return _temp;
  },

  getImageFromS3: async function (s3:S3Client, key: string) {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });
    try {
      const response = await s3.send(command);
      if (response.Body instanceof Readable) {
        //   let responseDataChunks: any[] = []
        //   response.Body.once('error', err => reject(err))
        //   response.Body.on('data', (chunk:any) => responseDataChunks.push(chunk))
        //   response.Body.once('end', () => resolve(responseDataChunks.join('')))
        return {
          body:response.Body,
          hash:response.ETag
        };
      }
    } catch (err) {
      console.log(err);
    }
    // console.log("IMAGE HASH:" , getHash(responseDataChunks.toString()))
  },
  
  getHash: function (content: any) {
    var hash = crypto.createHash("md5");
    //passing the data to be hashed
    const data = hash.update(content, "utf-8");
    //Creating the hash in the required format
    const gen_hash = data.digest("hex");
    return gen_hash;
  },
};
