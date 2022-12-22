import { useState } from "react";
import { Link } from "react-router-dom";
import { DELIVERERDATA, RESPONSE } from "../types";
import "./styles.css";

export const UpdateProduct = () => {
  

  const [response, setResponse] = useState<RESPONSE | undefined>(undefined);
  const [delivererData, setDelivererData] = useState<DELIVERERDATA | null>(
    null
  );

  const handleData = async () => {
    console.log(delivererData);
    const _tx = await fetch("http://localhost:5000/api/updateProduct", {
      method: "POST",
      body: JSON.stringify(delivererData),
      headers: {
        "Content-Type": "application/json",
        Connection: "keep-alive",
        Accept: "*/*",
      },
    });
    setResponse(await _tx.json());

  };

  return (
    <div>
      <h1>Update Product</h1>
      {response?.status ? (
        <div className="response">
          <h2>
            <span>Status:</span> {response.status}
          </h2>
          <h3>
            <span>TxID:</span> {response.txid}
          </h3>
          <button
            onClick={() => {
              setDelivererData(null);
              setResponse(undefined);
            }}
          >
            Update Product
          </button>
        </div>
      ) : response?.error ? 
          <div className="form">
          <h3 style={{color:"red"}}>{delivererData?.id} Is Not Existed</h3>
          <button onClick={() => setResponse(undefined)}>Try Again</button>
        </div>
      :(
        <div className="form">
          <input
            name="id"
            type="text"
            className="feedback-input"
            placeholder="Enter Product ID"
            onChange={(e) => setDelivererData((val:any) => ({...val, id:e.target.value}))}
          />
          <input
            name="position"
            type="text"
            className="feedback-input"
            placeholder="Enter Position"
            onChange={(e) => setDelivererData((val:any) => ({...val, position:e.target.value}))}
          />
          <input
            name="process"
            type="text"
            className="feedback-input"
            placeholder="Enter Process"
            onChange={(e) => setDelivererData((val:any) => ({...val, process:e.target.value}))}
          />
          <button onClick={handleData}>UPDATE</button>
        </div>
      )}

      <Link to="/">Home</Link>
    </div>
  );
};
