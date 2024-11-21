import { ethers } from "ethers";
import address from '../artifacts/contractAddress.json';
import abi from '../artifacts/contracts/DappVotes.sol/DappVotes.json';
import { globalActions } from "@/store/globalSlices";
import { store } from "@/store";
import { PollParams } from "@/utils/types";

const {setWallet} = globalActions;
const ContractAddress = address.address;
const ContractAbi = abi.abi;
let ethereum : any
let tx:any

if(typeof window !== 'undefined'){
    ethereum = (window as any).ethereum
}

const connectWallet = async () =>{
    try {
        if(!ethereum){
            return reportError('please install metamask')
        }
        const accounts = await ethereum.request?.({method:'eth_requestAccounts'})
        store.dispatch(setWallet(accounts?.[0]))
    } catch (error) {
        reportError(error)
    }
}

const checkWallet = async () =>{
    try {
        if(!ethereum){
            return reportError('please install metamask')
        }
        const accounts = await ethereum.request?.({method:'eth_accounts'})
        
        ethereum.on('chainChanged', async()=>{
            window.location.reload()
        })
        ethereum.on('accountsChanged', async()=>{
            store.dispatch(setWallet(accounts?.[0]))
        })
        
        if(accounts?.length){
            store.dispatch(setWallet(accounts?.[0]))
        }else{
            store.dispatch(setWallet(''))
            reportError('please connect your wallet')
        }

    } catch (error) {
        reportError(error)
    }
}

const getEthereumContract = async () =>{
    const accounts = await ethereum.request?.({method:'eth_accounts'})
    const provider = accounts?.[0]
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)

    const wallet = accounts?.[0] ?null : ethers.Wallet.createRandom()
    const signer = provider.getSigner(accounts?.[0] ? undefined : wallet?.address)

    const contract = new ethers.Contract(ContractAddress,ContractAbi,signer)
    return contract
}

const createpoll = async(data: PollParams) => {
    if(!ethereum){
        reportError('please install metamask')
        return Promise.reject(new Error('Metamask not installed'))
    }

    try {
        const contract = await getEthereumContract()
        const {image,title,description,startsAt,endsAt} = data
        tx = await contract.createPoll(image,title,description,startsAt,endsAt)

        await tx.wait()
        return Promise.resolve(tx)
    }catch(error){
        reportError(error)
        return Promise.reject(error)
    }
}

const reportError = (error:any) =>{
    console.error(error)
}

export {connectWallet,checkWallet}