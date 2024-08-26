require("dotenv").config();
const  { Web3 } = require("web3");
const abi =require ("./abi/nftABI");

async function initializeCall()
{
  const web3 = new Web3(process.env.INFURA_API); 
  const contract = new web3.eth.Contract(abi, process.env.NFT_CONTRACT_HASH);
  const account = web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);
  const nonce = await web3.eth.getTransactionCount(account[0].address);
  console.log("nonce: ",nonce);
  return { web3, contract, account, nonce};
}

async function getGasPrice(web3,contract,account,vaultAddress,IPFSHash)
{
  const gasEstimate = await contract.methods
  .mintNFT(vaultAddress,IPFSHash)
  .estimateGas({ from: account[0].address });
  console.log("gasEstimate: ",gasEstimate);

  const gasPrice = await web3.eth.getGasPrice();
  console.log("gasPrice: ",gasPrice);

  const txCost = gasEstimate * gasPrice;
  console.log("txCost: ",txCost);

  const txCostInEther = web3.utils.fromWei(txCost.toString(), "ether");
  console.log("txCostInEther: ",txCostInEther);

  return { gasEstimate, txCostInEther};
}

async function mintNFTHelper(IPFSHash,vaultAddress) 
{
    const { web3, contract, account} = await initializeCall();
    const {gasEstimate} = await getGasPrice(web3,contract,account,vaultAddress,IPFSHash);
    const encode = contract.methods.mintNFT(vaultAddress,IPFSHash).encodeABI();
    const txParams = {
        gas:gasEstimate,
        from: account[0].address,
        to: process.env.NFT_CONTRACT_HASH,
        data: encode,
    };
    const receipt = await web3.eth.sendTransaction(txParams);
    console.log("Transaction receipt:", receipt);
    return receipt.transactionHash;
}

module.exports.mintNFTHelper = mintNFTHelper;
module.exports.initializeCall = initializeCall;
module.exports.getGasPrice = getGasPrice;