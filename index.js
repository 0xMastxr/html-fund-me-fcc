import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

console.log("ethers-5.6.esm.min.js running")

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        document.getElementById("connectButton").innerHTML = "Connected!"
        console.log("connected!")
    } else {
        document.getElementById("connectButton").innerHTML = "Please install metamask!"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with the amount of ${ethAmount} ETH...`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum) //provider/connection to blockchain (METAMASK)
        const signer = provider.getSigner() //Get a signer for the transaction (ACCOUNT ON METAMASK)
        const contract = new ethers.Contract(contractAddress, abi, signer) //Contract deployed
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log("Error")
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    //listen for the transaction to be mined (transactionReceipt)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(`Completed with ${transactionReceipt.confirmations} confirmations`)
            resolve()
        })
    })
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner() //Get a signer for the transaction (ACCOUNT ON METAMASK)
        const contract = new ethers.Contract(contractAddress, abi, signer) //Contract deployed
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {}
    }
}
