import { useState } from "react";
import { Link } from "react-router-dom";
import { ERROR } from "../types";
import "./styles.css";

export const GetHistory = () => {
  const [response, setResponse] = useState<any>(undefined);
  const [error, setError] = useState<ERROR | undefined>(undefined)
  const [id, setId] = useState<string | null>(null);

  const handleData = async () => {
    const _tx = await fetch("http://localhost:5000/api/getHistory/" + id, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const _response = await _tx.json();
    _response.status ? setResponse(JSON.parse(_response.status)) : setError(_response);
  };

  // const showDiff = (o1:any, o2:any) => {
  //   let diff = Object.keys(o2).reduce((diff, key) => {
  //     if (o1[key] === o2[key]) return diff
  //     return {
  //       ...diff,
  //       [key]: o2[key]
  //     }
  //   }, {})
  //   console.log(diff)
  //   return diff
  // }
  
  return (
    <div>
      <h1>Get Product History</h1>
      {error?.error ? (
        <div className="form">
          <h3 style={{color:"red"}}>{error.error}</h3>
          <button onClick={() => {setResponse(undefined); setId('')}}>Try Again</button>
        </div>
      ) : response ? (
        <div className="history">
          <h2>History of Product with ID: {id}</h2>
          <div>
          {response.map((val:any, idx:number) => 
          <ul key={idx} style={{opacity: idx === 0 ? 1 : 0.5}}>
            {idx === 0 ? <h4 style={{color:"green", borderBottom:"1px solid green", fontSize:"20px"}}> Current state</h4> : <h4 style={{color:"yellow"}}>History of state</h4> } 
            {Object.keys(val).map((e:any, index:number) => 
              <li key={index}><span>{e}: </span> {val[e]}</li>
            )}
          </ul>
          )}
          </div>
        </div>
      ) : (
        <div className="form">
          <input
            name="id"
            type="text"
            className="feedback-input"
            placeholder="Enter Product ID"
            onChange={(e) => setId(e.target.value)}
          />
          <button onClick={handleData}>GET</button>
        </div>
      )}
      <Link to="/">Home</Link>
    </div>
  );
};
