import { useState } from "react";
import { Link } from "react-router-dom";
import { ERROR, PRODUCERDATA } from "../types";
import "./styles.css";

export const GetProduct = () => {
  const [response, setResponse] = useState<PRODUCERDATA | null>(null);
  const [user, setUser] = useState('admin');
  const [error, setError] = useState<ERROR | undefined>(undefined)
  const [id, setId] = useState<string | null>(null);

  const handleData = async () => {
    const _tx = await fetch(`http://localhost:5000/api/getProduct/${user}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/pdf',
      },
    });
    let _response = await _tx.json();
    console.log(_response)
    if(_response.status){
      _response = JSON.parse(_response.status);
      setResponse(_response)
    }else{
      setError(_response);
    }
  };

  // const getMSPID = async () => {
  //   const _tx = await fetch(`http://localhost:5000/api/testMSP`, {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   });
  //   let _response = await _tx.json();
  //   console.log(_response)
  // };


  return (
    <div>
      <h1>Get Product Details</h1>
      {error ? (
        <div className="form">
          <h3 style={{color:"red"}}>{error.error}</h3>
          <button onClick={() => {setError(undefined); setId('')}}>Try Again</button>
        </div>
      ) :response ? (
        <div className="form">
          <h2>Product with ID: {id}</h2>
        <ul>
          {Object.keys(response).map((val, idx) => <li key={idx}> <span>{val}: </span>{(response as any)[val]}</li>)}
        </ul>
        </div>
      ) : (
        <div className="form">
          <select onChange={(e) => setUser(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <input
            name="id"
            type="text"
            className="feedback-input"
            placeholder="Enter Product ID"
            onChange={(e) => setId(e.target.value)}
          />
          <button onClick={handleData}>GET</button>
          {/* <br/>
          <br/>
          <button onClick={getMSPID}>GET MSPID</button> */}
        </div>
      )}

      <Link to="/">Home</Link>
    </div>
  );
};
