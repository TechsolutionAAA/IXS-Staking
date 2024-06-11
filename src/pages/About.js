import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Web3 from "web3";
import { ethers } from "ethers";
import contract from "../utils/contract";
import stakingabi from "../utils/staking.json";
import "./About.css";

const Home = () => {
  const [MyAccount, setMyAccount] = useState("");
  const [Web3Instance, setWeb3Instance] = useState([]);
  const [ETH_balance, setETH_balance] = useState(0);
  const [ETH_amount, setETH_amount] = useState(0);

  const [StakedAmount, setStakedAmount] = useState(0);
  const [claimAbleAmount, SetclaimAbleAmount] = useState(0);

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
  }, [Web3Instance, MyAccount]);

  const loadWeb3 = async () => {
    const Web3Instance = await new Web3(window.ethereum);
    setWeb3Instance(Web3Instance);
  };

  const FetchETHBalance = async () => {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const balance = await signer.getBalance();
    console.log(`Balance: ${ethers.utils.formatEther(balance)} ETH`);
    setETH_balance(ethers.utils.formatEther(balance));
  };

  const FetchStakedEther = async () => {
    const StakingContract = new Web3Instance.eth.Contract(
      stakingabi,
      contract.Staking[1]
    );
    try {
      StakingContract.methods
        .stakingBalance(MyAccount)
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

  const FetchClaimAbleToken = async () => {
    const StakingContract = new Web3Instance.eth.Contract(
      stakingabi,
      contract.Staking[1]
    );
    try {
      StakingContract.methods
        .getPendingReward(MyAccount)
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

  const StakeEther = async () => {
    if (ETH_amount == 0) {
      toast("Can't Stake with 0 ETH!");
    } else {
      const StakingContract = new Web3Instance.eth.Contract(
        stakingabi,
        contract.Staking[1]
      );
      const weiAmount = Web3Instance.utils.toWei(ETH_amount, "ether"); // Convert 0.1 Ether to Wei

      const stakeAmount = Web3Instance.utils.toBN(weiAmount); // Convert to BigNumber
      try {
        StakingContract.methods
          .stake()
          .send({ from: MyAccount, value: stakeAmount })
          .then((e) => {
            toast(`${ETH_amount} Staked Successfully!`);
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.log(error, "error");
      }
    }
  };

  const HandleUnstake = async () => {
    const StakingContract = new Web3Instance.eth.Contract(
      stakingabi,
      contract.Staking[1]
    );
    try {
      StakingContract.methods
        .unstake()
        .send({ from: MyAccount })
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

  const HandleClaim = async () => {
    const StakingContract = new Web3Instance.eth.Contract(
      stakingabi,
      contract.Staking[1]
    );
    try {
      StakingContract.methods
        .claimReward()
        .send({ from: MyAccount })
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
        {MyAccount === "Connect Wallet" ? (
          <div>
            <div>Wallet Address: {MyAccount}</div>
            <div>My Ether Balance: {ETH_balance} ETH</div>
          </div>
        ) : (
          <div>
            <div>Wallet Address: {MyAccount}</div>
            <div>My Ether Balance: {ETH_balance} ETH</div>

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
                  value={ETH_amount}
                  onChange={(e) => setETH_amount(e.target.value)}
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

export default Home;
