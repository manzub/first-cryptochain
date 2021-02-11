import React from 'react';
import Blocks from './Blocks'
class App extends React.Component {
    state = { walletInfo: {} }

    componentDidMount() {
        fetch('http://localhost:3000/api/wallet-info')
            .then(response => response.json())
            .then(json => {
                this.setState({ walletInfo: json })
            })
    }

    render() {
        const { address, balance } = this.state.walletInfo
        return(<div>
            welcome to the blockchain...
            <div>Address: {address}</div>
            <div>Balance: {balance}</div>
            <br/>
            <Blocks/>
        </div>)
    }
}
export default App;