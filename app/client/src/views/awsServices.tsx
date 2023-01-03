import { FC, useState } from "react";
import { PostImage, RetriveAll, RetriveObject } from "../utils/awsTools";

const AwsServices:FC = () => {

    const [allImages, setAllImages] = useState<string[]>();
    const [uploadRes, setUploadRes] = useState<any>(undefined);
    const [file, setFile] = useState<any>();
    const [keyFile, setKeyFile] = useState();
    const [key, setKey] = useState<string>();

    const [isLoading, setIsLoading] = useState<string | undefined>(undefined)


    const getAllImages = async () => {
        const _temp:string[] = await RetriveAll();
        setAllImages(_temp);
    };

    const uploadToAws = async () => {
        if(file){
        setIsLoading('Wait a Sec');
        const _res = await PostImage(file);
        setUploadRes(_res);
        setIsLoading(undefined);
    }
    };

    const retriveByKey = async (key:string) => {
        const hash = await RetriveObject(key);
        setKeyFile(hash);
    }




    return(
        <div className="aws">
            <h1>AWS Services</h1>

            <section>
            <div>
                {isLoading ? <h3>{isLoading}</h3> : 
                    uploadRes ? <h3>"{uploadRes.key}" Uploaded Sccessfully<br/> with hash: {uploadRes.hash}</h3> : 
                <label htmlFor="uploader">
                    Upload file to AWS from here {'<--'}
                    <input type={"file"} id="uploader" accept="image/*" onChange={(e) => setFile(e.target.files![0])}/>
                </label>
                }
                <button disabled={uploadRes ? true : false} style={{
                    opacity:uploadRes ? 0.5 : 1, cursor:uploadRes ? "not-allowed":"pointer"
                }} onClick={uploadToAws}>Upload</button>
            </div>

            <div>
                <button onClick={getAllImages}>Retrive All</button>
            </div>

            <div>
                <label>
                    Retrive File By Key
                <input type={"text"} placeholder="Enter file key..." onChange={(e) => setKey(e.target.value)}/>
                </label>
                {key && 
                    <button onClick={() => retriveByKey(key)}>Retrive hash by key</button>
                }
                {keyFile && <h3>Hash of Key: {key} = {keyFile}</h3>}
            </div>
            </section>
            {allImages &&
            <div>
                <h2>All images Saved in AWS</h2>
                <ul>
                    { allImages.map((i) => 
                        <li key={i}><img src={i} alt=""/></li>
                    )}
                </ul>
            </div>
            }
        </div>
    )
}

export default AwsServices;