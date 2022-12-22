import { useState } from "react";
import { Link } from "react-router-dom";
import { PRODUCERDATA, RESPONSE } from "../types";
import "./styles.css";



export const Producer = () => {
   
  const [producerData, setProducerData] = useState<any>(null);

  const [response, setResponse] = useState<RESPONSE | undefined>(undefined);

  const handleData = async () => {
    console.log(producerData)
    const _tx = await fetch('http://localhost:5000/api/addProduct',{ 
      method:'POST',
      body:JSON.stringify(producerData),
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive',
        'Accept': '*/*',
    },
    });
    setResponse(await _tx.json());
  };

  return (
    <div>
      <h1>Producer</h1>
      {response ?
       <div className="response">
        <h2><span>Status:</span> {response.status}</h2>
        <h3><span>TxID:</span> {response.txid}</h3>
        <button onClick={() => {
          setProducerData(null);
          setResponse(undefined)
        }}>Add New Product</button>
        </div>
        :
      <div className="form">
        <input
          type="text"
          className="feedback-input"
          placeholder="Product ID"
          onChange={(e) => setProducerData((val:any) =>  ({...val, id:e.target.value}))}
        />
        <input
          type="text"
          className="feedback-input"
          placeholder="Farm Name"
          onChange={(e) => setProducerData((val:any) =>  ({...val, farm:e.target.value}))}

        />
        <input
          type="text"
          className="feedback-input"
          placeholder="Block Number"
          onChange={(e) => setProducerData((val:any) =>  ({...val, block:e.target.value}))}

        />
        <input
          type="text"
          className="feedback-input"
          placeholder="Lot Number"
          onChange={(e) => setProducerData((val:any) =>  ({...val, lot:e.target.value}))}
        />
        <input
          type={"date"}
          className="feedback-input"
          placeholder="Data"
          onChange={(e) => setProducerData((val:any) =>  ({...val, timestamp:e.target.value}))}
        />
        <button onClick={handleData}>ADD</button>
      </div>
      }
        <Link to='/'>Home</Link>
    </div>
  );
};
