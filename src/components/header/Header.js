import React from 'react';
import walletLogo from "../../assets/img/ic_wallet_24.svg";
import {injected} from "../wallet/connectors";
import {useWeb3React} from "@web3-react/core";
import classes from "./Header.module.css"

const Header = () => {
  const {activate} = useWeb3React();

  async function connect() {
    try {
      await activate(injected)
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <>
      <div className={classes.AppBoxHeader}>
        <h3>Disperse App</h3>
        <button className="btn" onClick={connect}>
          <img src={walletLogo} alt="Connect Wallet"/>
          <span>Connect Wallet</span>
        </button>
      </div>
      <div className="App-box-divider"></div>
    </>
  );
};

export default Header;
