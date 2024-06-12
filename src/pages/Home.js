import React, { useEffect, useState } from "react";
import Web3 from "web3";
import "./Home.css";

const Home = () => {
  // connect metamask
  const connectMetamask = async () => {
    // exisiting ethereum from window
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      const chainId = await window.ethereum.request({ method: "eth_chainId" }); // get current connected eth chain id

      if (chainId !== "0xAA36A7") {
        // switch network as sepolia one
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xAA36A7" }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0xAA36A7",
                    rpcUrl:
                      "https://sepolia.infura.io/v3/e89d286f38f848c885d1fb6fdda37b13",
                  },
                ],
              });
            } catch (error) {
              console.log("error", error);
            }
          }
        }

        window.ethereum.on("chainChanged", handleAfterChainChanged);

        function handleAfterChainChanged(_chainId) {
          window.location.reload();
        }
      }

      // wallet connect
      await window.ethereum
        .enable()
        .then((result) => {
          var str = result[0];
          console.log(str);
          if (typeof result !== "undefined" && result.length > 0) {
            // set account address to storage
            localStorage.setItem("addr", str);
            window.location.assign("/staking");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (window.web3) {
      window.web3 = new Web3(
        new Web3.providers.HttpProvider(
          "https://sepolia.infura.io/v3/e89d286f38f848c885d1fb6fdda37b13"
        )
      );
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };

  return (
    <div className="main-container">
      <div className="sub-container">
        <button className="connectbtn" onClick={() => connectMetamask()}>
          Connect Wallet
        </button>
      </div>
    </div>
  );
};

export default Home;
