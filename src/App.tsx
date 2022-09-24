import React from 'react';
import './App.scss';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import TreeCanvas from './components/tree-canvas/TreeCanvas';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Planets from './components/planets/Planets';

function App() {
  return (
    <div id="main" className='d-flex flex-column h-100'>
      <Header></Header>
      <div id="main-content" className='flex-grow-1'>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<TreeCanvas/>} />
            <Route path="/planets" element={<Planets/>} />
          </Routes>
        </BrowserRouter>
      </div>
      <Footer></Footer>
    </div>
  );
}

export default App;
