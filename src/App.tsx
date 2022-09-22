import React from 'react';
import './App.scss';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import TreeCanvas from './components/tree-canvas/TreeCanvas';

function App() {
  return (
    <div id="main" className='d-flex flex-column h-100'>
      <Header></Header>
      <TreeCanvas></TreeCanvas>
      <Footer></Footer>
    </div>
  );
}

export default App;
