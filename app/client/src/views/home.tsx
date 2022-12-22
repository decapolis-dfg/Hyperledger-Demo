import { Link } from 'react-router-dom';
import delmonte from '../assets/delmonte.svg';
import './styles.css';

export const Home = () => {
    return(
        <div className="home">
            <div className='logo'>
                <img src={delmonte}/>
            </div>
            <h1>Welcome to Hyperledger Demo</h1>
                <ol>
                <li><Link to="/producer">Producer</Link></li>
                <li><Link to="/getProduct">Get Product</Link></li>
                <li><Link to="/updateProduct">UpdateProduct</Link></li>
               <li> <Link to="/newProcess">NewProcess</Link></li>
               <li><Link to="/getHistory">Get History</Link></li>
                </ol>
        </div>
    )
}