import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import waveportal from './utils/WavePortal.json'

const App = () => {

  /* 
    Just a state variable to store our user's public wallet
  */
  const [currentAccount, setCurrentAccount] = useState("");

  let [count, setCount] = useState(0);

  let [topWaver, setTopWaver] = useState("");

  let [mining, setMining] = useState(0);

  let [message, setMessage] = useState("");

  /*
   * All state property to store all waves
   */
  const [allWaves, setAllWaves] = useState([]);

  /**
   * Create a varaible here that holds the contract address after you deploy!
   */
  const contractAddress = "0x1A620290763Fd1A0a2eE326d32FCFDdcbC322592";
  
  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        // const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, waveportal.abi, provider);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();
        

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          // wavesCleaned.push({
          wavesCleaned.unshift({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);

        /**
         * Listen in for emitter events!
         */
        wavePortalContract.on("NewWave", async (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          setAllWaves(prevState => [{
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }, ...prevState]);

            let countWaves = await wavePortalContract.getTotalWaves();
            console.log("Retrieved total wave count: ", countWaves.toNumber());
            setCount(countWaves.toNumber());

            let topWaver = await wavePortalContract.getTopWaver();
            console.log("Top Waver: ", topWaver.toString());
            setTopWaver(topWaver.toString());

        });
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /*
  Checking to make sure we have access to window.ethereum
  */
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);

        /* We have the ethereum object, let's update the wave count */
        const provider = new ethers.providers.Web3Provider(ethereum);
        const wavePortalContract = new ethers.Contract(contractAddress, waveportal.abi, provider);

        let countWaves = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count: ", countWaves.toNumber());
        setCount(countWaves.toNumber());

        let topWaver = await wavePortalContract.getTopWaver();
        console.log("Top Waver: ", topWaver.toString());
        setTopWaver(topWaver.toString());

        await getAllWaves();
      }
    } catch (error) {
      console.log(error);
    }
  }

  const listenForWalletChange = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        ethereum.on("accountsChanged", (accounts) => {
          if (accounts.length > 0) {
            setCurrentAccount(accounts[0]);
          } else {
            setCurrentAccount("");
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function requestAccount() {
    return await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  /*
  Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await requestAccount();

      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);

    } catch (error) {
      console.log(error);
    }
  }

  const wave = async () => {
      try {
          const { ethereum } = window;

          if (ethereum) {
              // window.alert(message);
              // return;

              await connectWallet();

              const provider = new ethers.providers.Web3Provider(ethereum);
              const signer = provider.getSigner();
              const wavePortalContract = new ethers.Contract(contractAddress, waveportal.abi, signer);

              // let countWaves = await wavePortalContract.getTotalWaves();
              // console.log("Retrieved total wave count: ", countWaves.toNumber());
              // setCount(countWaves.toNumber());

              const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000});
              console.log("Mining wave()...", waveTxn.hash);
              setMining(1);

              await waveTxn.wait();
              console.log("Mined wave() -- ", waveTxn.hash);
              setMining(0);

              let countWaves = await wavePortalContract.getTotalWaves();
              console.log("Retrieved total wave count: ", countWaves.toNumber());
              setCount(countWaves.toNumber());

              let topWaver = await wavePortalContract.getTopWaver();
              console.log("Top Waver: ", topWaver.toString());
              setTopWaver(topWaver.toString());

              //await getAllWaves();

          } else {
              console.log("Ethereum object doesn't exist!");
          }

      } catch (error) {
          console.log(error);
      }
  }

  /* This handles changes in the message input */
  function handleChange(event) {
    setMessage(event.target.value);
    // console.log(event);
    // console.log(event.target);
    // console.log(event.target.value);
    // console.log(message);
  }

  /* This handles submit events from the form */
  // function handleSubmit(event) {
  //   event.preventDefault();
  //   console.log("Prevented form submit ?");
  // }

  /* This handles submit events from  */
  function handleInputKeyPress(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        console.log("Prevented form submit from pressing Enter key ?");
      }
  }


  /*
   This runs our function when the page loads
  */
  useEffect(() => {
    checkIfWalletIsConnected();
    listenForWalletChange();
  }, [])


  useEffect(() => {
  }, []);

  /*
   This is the actual page
  */
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="Gorilla Emoji"  title="Gorilla">🦍</span>
          <br />
          Hey There!
        </div>

        <div className="bio">
          I Gorilla.
          <br />
          I learning Solidity, I build me dApps.
          <br />
          I be hungry.
          <br />
          Throw messaged-banana, pls?
        </div>

        {!currentAccount ? "":(
          <div className="buttonContainer">
            <input className="waveInput" type="text" placeholder="Please leave a message with the banana" value={message} onChange={handleChange} onKeyPress={handleInputKeyPress} />
            <button disabled={!message ? true : (!mining ? false : true)} className="waveButton" onClick={!message ? undefined : (!mining ? wave : undefined)}>
              {!mining ? ('Throw') : ('Throwing a ')} <span role="img" aria-label="Banana Emoji" title="Banana">🍌</span>
            </button>
          </div>
        )}

        {(currentAccount ? (
            <div className="connectedWalletContainer">
              {`Connected to: ${currentAccount}`}
            </div>
          ) : (
          <div className="buttonContainer">
            <button className="connectButton" onClick={connectWallet}>
              Connect Wallet
            </button>
          </div>
        ))}

        {/*
        * Trying out loading icons
        */}
        <div className="loadingContainer">
          {mining ? (
            <svg version="1.1" id="L9" x="300px" y="0px" viewBox="0 0 100 100" enableBackground="new 0 0 0 0">
              <path fill="#fff" d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
                <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="360 50 50" repeatCount="indefinite" />
              </path>
            </svg>
          ) : ("")
          }
        </div>

        {/*
        * Here we put our Banana Pile
        */}
        {count ? (
          <div className="bananaContainer">
            Banana pile:
            <br/>
            {[...Array(count)].map((e, i) => {
              
              return <span role="img" aria-label="Banana Emoji" key={i}> 🍌 </span>;
              }
            )}
          </div>
        ) : (
          <div className="bananaContainer">
            Still no banana <span role="img" aria-label="Sad Emoji">😔</span>
          </div>
        )}

        {/*
        * We thank our top contributor here
        */}
        {count ? (
          <div className="topThrowerContainer">
            Thank you {topWaver} for throwing the most bananas!!!
          </div>
        ) : (
          <span />
        )}

        {/* Here goes the detailed list of bananas with messages thrown */}
        {allWaves.map((wave, index) => {
          return (
            <div className="bananaWithMessage" key={index}>
              <div>Found <span role="img" aria-label="Banana Emoji" title="Banana">🍌 </span> message: {wave.message}</div>
              <div>From: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
            </div>)
        })}
      </div>
    </div>
  );
}

export default App;
