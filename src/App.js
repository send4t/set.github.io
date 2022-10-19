import './App.css';
import {useWeb3React} from '@web3-react/core'
import {injected} from "./components/wallet/connectors";
import {TOKEN_LIST} from "./assets/tokenList";
import {useEffect, useState} from "react";
import useBalance from "./hooks/useBalance";
import {useForm, useFieldArray} from "react-hook-form";
import {DISPERSE_CONTRACT, getDisperseContract} from "./store/contractDisperseStore";
import {getIERC20Contract} from "./store/contractIERC20";
import Web3 from "web3";
import {Biconomy} from "@biconomy/mexa";
import {cutAddress, isErrorExist, ZERO_ADDRESS} from "./assets/helpers";
import Header from "./components/header/Header";


function App() {
  const biconomy = new Biconomy(Web3.givenProvider, {
    apiKey: process.env.REACT_APP_BICONOMY_API_KEY,
    debug: true,
    contractAddresses: [DISPERSE_CONTRACT, TOKEN_LIST[1].address, TOKEN_LIST[2].address],
  });

  useEffect(() => {
    async function initBiconomy() {
      await biconomy.init();

      biconomy.on("txMined", (data) => {
        // Event emitter to monitor when a transaction is mined
        console.log("transaction data", data);
      });
      biconomy.on("txHashGenerated", (data) => {
        // Event emitter to monitor when a transaction hash is generated
        console.log("transaction data", data);
      });
      biconomy.on("txHashChanged", (data) => {
        // Event emitter to monitor when a transaction hash is changed in case of gas price bump
        console.log("transaction data", data);
      });
      biconomy.on("error", (data) => {
        // Event emitter to monitor when an error occurs
        console.log("transaction data", data);
      });
    }

    initBiconomy();
  });

  const web3 = new Web3(Web3.givenProvider);
  const [selectedToken, setSelectedToken] = useState(TOKEN_LIST[0]);
  const {active, account} = useWeb3React();

  const {register, control, handleSubmit, formState: {errors}} = useForm({
    reValidateMode: 'onChange',
    mode: 'onChange',
    defaultValues: {list: [{address: "", value: ""}]},
  });

  const {fields, append, remove} = useFieldArray({
    control, name: "list",
    reValidateMode: 'onChange',
  });
  const {balance} = useBalance(selectedToken.address, selectedToken.decimals);

  const onSubmit = async data => {
    const contract = getDisperseContract(DISPERSE_CONTRACT, web3);

    if (selectedToken.symbol === "ETH") {
      contract.methods
        .disperseEther(
          data.list.map(({address}) => address),
          data.list.map(({value}) => "0x" + Web3.utils.toBN(Web3.utils.toWei(value.toString(), "ether")).toString(16))
        ).send({
        from: account,
        value: "0x" + Web3.utils.toBN(Web3.utils.toWei((data.list.map(({value}) => value).reduce((a, b) => Number(a) + Number(b), 0)).toString(), "ether")).toString(16),
        signatureType: "EIP712_SIGN",
      })
        .then(data => console.log(data))
        .catch(error => console.log(error));
    } else {
      const ierc20Contract = getIERC20Contract(selectedToken.address, web3, account);
      await ierc20Contract.methods.approve(
        DISPERSE_CONTRACT, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      ).send({
        from: account
      });

      await contract.methods
        .disperseToken(
          selectedToken.address,
          data.list.map(({address}) => address),
          data.list.map(({value}) => "0x" + Web3.utils.toBN(Web3.utils.toWei(value.toString(), "ether")).toString(16))
        ).send({
        from: account,
        signatureType: "EIP712_SIGN",
      });

      // my 0x1C5Ec4E0a1d186E69A730D414E28545B1540Fe72
      // 0x13dC73D7A4647B4853ac94B08D8cB5f6d6381e46
      // 0x63ab0a113eb34D5652A4d0680d4232Cc9d70308b
    }
  };

  return (
    <div className="App">
      <div className="App-box">
        <Header/>

        {active &&
          <div className="App-body">
            <div className="account-box">
              {!active && <span>Not connected</span>}
              {active && <span>Account: {cutAddress(account)}</span>}

              <select
                className="btn"
                onChange={(e) => setSelectedToken(TOKEN_LIST[e.target.value])}
              >
                {TOKEN_LIST.map((token, i) => (
                  <option value={i} key={token.address}>{token.name}</option>
                ))}
              </select>
            </div>
            <div className="balance-section">
              <h3>{selectedToken.name} : {balance}</h3>
              <section>
                <button
                  className="default-btn"
                  type="button"
                  onClick={() => {
                    append({address: "", value: ""});
                  }}
                >
                  +
                </button>
              </section>
            </div>

            <form className="disperse-form" onSubmit={handleSubmit(onSubmit)}>
              {fields.map((item, index) => {
                return (
                  <div className="form-item" key={item.id}>
                    <div className="form-item-inputs">
                      <input
                        className={isErrorExist(errors, index, 'address') && "input-error"}
                        placeholder="Wallet address"
                        {...register(
                          `list.${index}.address`,
                          {
                            required: true,
                            minLength: 42,
                            validate: value => Web3.utils.isAddress(value)
                          }
                        )}
                      />
                      <input
                        className={isErrorExist(errors, index, 'value') && "input-error"}
                        placeholder="Value"
                        {...register(
                          `list.${index}.value`,
                          {
                            required: true,
                            min: 0,
                            pattern: {value: '[+-]?([0-9]*[.])?[0-9]+'},
                            validate: value => balance > value
                          },
                        )}
                      />
                      <button
                        disabled={fields.length === 1}
                        className="default-btn"
                        type="button"
                        onClick={() => remove(index)}
                      >
                        Delete
                      </button>
                    </div>
                    <div className="form-item-errors">
                      {errors.list && errors.list[index]?.address?.type === 'required' &&
                        <p className="form-input-error" role="alert">Address is required</p>}
                      {errors.list && errors.list[index]?.address?.type === 'minLength' &&
                        <p className="form-input-error" role="alert">Minimal length of address is 42</p>}
                      {errors.list && errors.list[index]?.address?.type === 'validate' &&
                        <p className="form-input-error" role="alert">It should be an ETH address</p>}
                      {errors.list && errors.list[index]?.value?.type === 'required' &&
                        <p className="form-input-error" role="alert">Value is required</p>}
                      {errors.list && errors.list[index]?.value?.type === 'min' &&
                        <p className="form-input-error" role="alert">Value should be greater then 0</p>}
                      {errors.list && errors.list[index]?.value?.type === 'pattern' &&
                        <p className="form-input-error" role="alert">Please enter a number</p>}
                      {errors.list && errors.list[index]?.value?.type === 'validate' &&
                        <p className="form-input-error" role="alert">Insufficient {selectedToken.name} balance</p>}
                    </div>
                  </div>
                );
              })}
              <input className="default-btn" type="submit" value="Disperse"/>
            </form>
          </div>
        }
      </div>
    </div>
  );
}

export default App;
