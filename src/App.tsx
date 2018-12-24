import * as React from 'react';
import './App.css';
import Topbar from './components/Topbar';

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <Topbar />
      </div>
    );
  }
}

export default App;
