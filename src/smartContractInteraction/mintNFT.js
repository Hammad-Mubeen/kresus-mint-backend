require("dotenv").config();
const  { Web3 } = require("web3");
const abi =require ("./abi/nftABI");

const contractAddress = process.env.NFT_CONTRACT_HASH;
const infuraAPI = process.env.INFURA_API;

async function mintNFTHelper(IPFSHash,vaultAddress,privateKey) 
{
    const web3 = new Web3(infuraAPI); 
    const contract = new web3.eth.Contract(abi, contractAddress);
    const account = web3.eth.accounts.wallet.add(privateKey);

    const gasEstimate = await contract.methods
      .mintNFT(vaultAddress,IPFSHash)
      .estimateGas({ from: account[0].address });
    console.log(gasEstimate);
    
    const encode = contract.methods.mintNFT(vaultAddress,IPFSHash).encodeABI();

    const txParams = {
        gas:gasEstimate,
        from: account[0].address,
        to: contractAddress,
        data: encode,
    };
    const receipt = await web3.eth.sendTransaction(txParams);
    console.log("Transaction receipt:", receipt);
    return receipt.transactionHash;
}

module.exports.mintNFTHelper = mintNFTHelper;