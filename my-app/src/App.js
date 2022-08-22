import React, { useEffect, useState } from "react";
import "./App.css";
import Collection from "./pages/Collection";
import Address from "./pages/Address";
import Home from "./pages/Home";
import { Routes, Route, Link } from "react-router-dom";

// const Moralis = require("moralis-v1/node");
const Moralis = require('moralis-v1');

const App = () => {
  //State
  const [ethAddress, setEthAddress] = useState("");
  const [currentUser,setCurrentUser] = useState();

  //连接钱包
  const login = async () => {
    let currentUser = Moralis.User.current();
    if (!currentUser) {
      await Moralis.authenticate({ signingMessage: "使用 Moralis 登录" })
        .then(function (user) {
          console.log(user);
          setEthAddress(
            user.get("ethAddress").slice(0, 4) +
              "..." +
              user.get("ethAddress").slice(-4)
          );
          console.log(currentUser);
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      console.log("您已经登录");
    }
  };

  //注销
  const logout = async () => {
    await Moralis.User.logOut();
    setEthAddress("");
    alert("已退出");
  };

  //获取
  const getContact = async () => {
    let currentUser = Moralis.User.current()
    let account = currentUser.get("ethAddress");
    const options = {
      chain: "bsc",
      address: account,
      from_block: "0",
    };
    const transactions = await Moralis.Web3API.account.getTransactions(options);
    alert(JSON.stringify(transactions))
  };

  useEffect(() => {
    //Moralis.start
    const appId = "cQHgw1MAZLXSlJjAFdtSeaeXjTCHC5y6xyRnf8jL";
    const serverUrl = "https://uxh1al9mariw.usemoralis.com:2053/server";
    Moralis.start({
      serverUrl: serverUrl,
      appId: appId,
    });
    let currentUser = Moralis.User.current();
    if(!currentUser){
      console.log('请连接钱包');
    }else{
       setEthAddress(
      currentUser.get("ethAddress").slice(0, 4) +
        "..." +
        currentUser.get("ethAddress").slice(-4)
    );
    }
   
  }, []);

  return (
    <>
      <div className="topBanner">
        <div>🐳 NFT Whales</div>
        <div className="menu">
          <Link to="/">
            <div className="menuItem">Home</div>
          </Link>
          {ethAddress == "" ? (
            <button
              onClick={() => {
                login();
              }}
            >
              连接钱包
            </button>
          ) : (
            <button>
              {ethAddress}
            </button>
          )}

          <button
            onClick={() => {
              getContact();
            }}
          >
            获取合约数据
          </button>

          {ethAddress && (
            <button
              onClick={() => {
                logout();
              }}
            >
              注销
            </button>
          )}
        </div>
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:collection" element={<Collection />} />
        <Route path="/:collection/:address" element={<Address />} />
      </Routes>
    </>
  );
};

export default App;
