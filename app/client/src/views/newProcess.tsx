import { useState } from "react";
import { Link } from "react-router-dom";
import { RESPONSE } from "../types";
import "./styles.css";

export const NewProcess = () => {

  const [processData, setProcessData] = useState(null);

  const [response, setResponse] = useState<RESPONSE | undefined>(undefined);
  const [attrs, setAttrs] = useState<any>([]);
  const [currentAtt, setCurrentAtt] = useState<string>();
  const [modal, setModal] = useState(false);

  const handleData = async () => {
    const _tx = await fetch('http://localhost:5000/api/newProcess',{
      method:'POST',
      body:JSON.stringify(processData),
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive',
        'Accept': '*/*',
    },
    });
    setResponse(await _tx.json());
  };

  const handleAddAttr = () => {
    setAttrs((val:any) => ([...val, currentAtt]));
    setCurrentAtt('')
    setModal(false);
  }

  console.log(attrs);
  console.log(processData);
  return (
    <div>
      {modal && 
        <div className="modal">
          <h2>Add New Attribute</h2>
          <input type="text" placeholder="new Attribute" onChange={(e) => setCurrentAtt(e.target.value)}/>
          <button onClick={handleAddAttr}>Add</button>
        </div>
        }
      <h1>New Process</h1>

      {response ?
       <div className="response">
        <h2><span>Status:</span> {response.status}</h2>
        <h3><span>TxID:</span> {response.txid}</h3>
        <button onClick={() => {
          setProcessData(null);
          setResponse(undefined)
        }}>Add New Process</button>
        </div>
        :
      <div className="form">
        <input
          name="tunaId"
          type="text"
          className="feedback-input"
          placeholder="Reference ID"
          onChange={(e) => setProcessData((val:any) => ({
            ...val,id:e.target.value
          }))}/>
        <input
          name="id"
          type="text"
          className="feedback-input"
          placeholder="Processed ID"
          onChange={(e) => setProcessData((val:any) => ({
            ...val,processID:e.target.value
          }))}
        />
        {attrs?.map((a:string, idx:number) => <input key={idx} placeholder={a} type={"text"} className="feedback-input" onChange={(e) => setProcessData((val:any) => ({
          ...val, [a]:e.target.value
        }))}/>)}
        <button onClick={() => setModal(true)}>Add Attribute</button>
        <button onClick={handleData}>ADD</button>
      </div>
}
      
      <Link to="/">Home</Link>
    </div>
  );
};
