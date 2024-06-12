import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Web3 from "web3";
import { ethers } from "ethers";
import contract from "../utils/contract";
import stakingabi from "../utils/staking.json";
import "./staking.css";

const Staking = () => {
  const [myAccount, setMyAccount] = useState("");
  const [Web3Instance, setWeb3Instance] = useState([]);
  const [ethBalance, setEthBalance] = useState(0);
  const [ethAmount, setEthAmount] = useState(0);

  const [StakedAmount, setStakedAmount] = useState(0);
  const [claimAbleAmount, SetclaimAbleAmount] = useState(0);

  // check the wallet connecting status
  useEffect(() => {
    setMyAccount(localStorage.getItem("addr"));
    if (window.web3 !== undefined && window.ethereum) {
      loadWeb3();
    }
  }, []);

  useEffect(() => {
    if (Web3Instance.length !== 0) {
      FetchETHBalance();
      FetchStakedEther();
      FetchClaimAbleToken();
      setInterval(function () {
        FetchETHBalance();
        FetchStakedEther();
        FetchClaimAbleToken();
      }, 5000);
    }
  }, [Web3Instance, myAccount]);

  // load the wallet instance
  const loadWeb3 = async () => {
    const Web3Instance = await new Web3(window.ethereum);
    setWeb3Instance(Web3Instance);
  };

  // get the wallet Ethereum Balance
  const FetchETHBalance = async () => {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const balance = await signer.getBalance();
    console.log(`Balance: ${ethers.utils.formatEther(balance)} ETH`);
    setEthBalance(ethers.utils.formatEther(balance));
  };

  // get the staked Ethereum
  const FetchStakedEther = async () => {
    const StakingContract = new Web3Instance.eth.Contract(
      stakingabi,
      contract.Staking[1]
    );
    try {
      StakingContract.methods
        .stakingBalance(myAccount)
        .call()
        .then((e) => {
          console.log("Staked Successfully!", e / 10 ** 18);
          setStakedAmount(e / 10 ** 18);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error, "error");
    }
  };

  // get the rewards ethereum balance
  const FetchClaimAbleToken = async () => {
    const StakingContract = new Web3Instance.eth.Contract(
      stakingabi,
      contract.Staking[1]
    );
    try {
      StakingContract.methods
        .getPendingReward(myAccount)
        .call()
        .then((e) => {
          console.log("Staked Successfully!", e / 10 ** 18);
          SetclaimAbleAmount(e / 10 ** 18);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error, "error");
    }
  };

  // stake the ethereum
  const StakeEther = async () => {
    if (ethAmount == 0) {
      toast("Can't Stake with 0 ETH!");
    } else {
      const StakingContract = new Web3Instance.eth.Contract(
        stakingabi,
        contract.Staking[1]
      );
      const weiAmount = Web3Instance.utils.toWei(ethAmount, "ether"); // Convert 0.1 Ether to Wei

      const stakeAmount = Web3Instance.utils.toBN(weiAmount); // Convert to BigNumber
      try {
        StakingContract.methods
          .stake()
          .send({ from: myAccount, value: stakeAmount })
          .then((e) => {
            toast(`${ethAmount} Staked Successfully!`);
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.log(error, "error");
      }
    }
  };

  // unstake
  const HandleUnstake = async () => {
    const StakingContract = new Web3Instance.eth.Contract(
      stakingabi,
      contract.Staking[1]
    );
    try {
      StakingContract.methods
        .unstake()
        .send({ from: myAccount })
        .then((e) => {
          toast(`${StakedAmount} UnStaked Successfully!`);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error, "error");
    }
  };

  // claim the rewards
  const HandleClaim = async () => {
    const StakingContract = new Web3Instance.eth.Contract(
      stakingabi,
      contract.Staking[1]
    );
    try {
      StakingContract.methods
        .claimReward()
        .send({ from: myAccount })
        .then((e) => {
          toast(`${claimAbleAmount} Claimed Successfully!`);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error, "error");
    }
  };

  return (
    <div className="main-container">
      <ToastContainer />
      <div className="sub-section">
        {myAccount === "Connect Wallet" ? (
          <div>
            <div>Wallet Address: {myAccount}</div>
            <div>My Ether Balance: {ethBalance} ETH</div>
          </div>
        ) : (
          <div>
            <div>Wallet Address: {myAccount}</div>
            <div>My Ether Balance: {ethBalance} ETH</div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  margin: "auto",
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <input
                  className="form-control"
                  type="text"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  placeholder="Enter your ETH amount for staking.."
                />
                <button className="button" onClick={() => StakeEther()}>
                  Stake
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="unStake-container">
          <div>Staked Amount: {StakedAmount} ETH</div>
          <button className="button" onClick={() => HandleUnstake()}>
            UnStake
          </button>
        </div>
        <div className="claim-container">
          <div>Claimable Token Amount: {claimAbleAmount} $REWARDS</div>
          <button className="button" onClick={() => HandleClaim()}>
            Claim
          </button>
        </div>
      </div>
    </div>
  );
};

export default Staking;
