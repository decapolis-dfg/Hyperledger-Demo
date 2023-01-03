import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GetProduct } from './views/getProduct';
import { Home } from './views/home';
import { GetHistory } from './views/getHistory';
import { Producer } from './views/producer';
import { UpdateProduct } from './views/updateProduct';
import { NewProcess } from './views/newProcess';
import AwsServices from './views/awsServices';

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/getProduct" element={<GetProduct />} />
          <Route path="/getHistory" element={<GetHistory />} />
          <Route path="/producer" element={<Producer />} />
          <Route path="/updateProduct" element={<UpdateProduct />} />
          <Route path="/newProcess" element={<NewProcess />} />
          <Route path="/awsServices" element={<AwsServices />} />
        </Routes>
      </Router>
  );
}

export default App;
