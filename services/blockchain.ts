import { ethers } from "ethers";
import address from '../artifacts/contractAddress.json';
import abi from '../artifacts/contracts/DappVotes.sol/DappVotes.json';
import { globalActions } from "@/store/globalSlices";
import { store } from "@/store";
import { ContestantStruct, PollParams, PollStruct } from "@/utils/types";
import { time } from "console";

const {setWallet, setPolls, setPoll, setContestants} = globalActions;
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
    const accounts = await ethereum?.request?.({method:'eth_accounts'})
    const provider = accounts?.[0]
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)

    const wallet = accounts?.[0] ?null : ethers.Wallet.createRandom()
    const signer = provider.getSigner(accounts?.[0] ? undefined : wallet?.address)

    const contract = new ethers.Contract(ContractAddress,ContractAbi,signer)
    return contract
}

const createPoll = async(data: PollParams) => {
    if(!ethereum){
        reportError('please install metamask')
        return Promise.reject(new Error('Metamask not installed'))
    }

    try {
        const contract = await getEthereumContract()
        const {image,title,description,startsAt,endsAt} = data
        tx = await contract.createPoll(image,title,description,startsAt,endsAt)

        await tx.wait()

        const polls = await contract.getPolls()
        store.dispatch(setPolls(polls))

        return Promise.resolve(tx)
    }catch(error){
        reportError(error)
        return Promise.reject(error)
    }
}

const updatePoll = async(id: number,data: PollParams) => {
    if(!ethereum){
        reportError('please install metamask')
        return Promise.reject(new Error('Metamask not installed'))
    }

    try {
        const contract = await getEthereumContract()
        const {image,title,description,startsAt,endsAt} = data
        const tx = await contract.updatePoll(id,image,title,description,startsAt,endsAt)

        await tx.wait()
        const poll = await getPoll(id)
        store.dispatch(setPoll(poll))
        return Promise.resolve(tx)
    }catch(error){
        reportError(error)
        return Promise.reject(error)
    }
}

const deletePoll = async(id: number) => {
    if(!ethereum){
        reportError('please install metamask')
        return Promise.reject(new Error('Metamask not installed'))
    }

    try {
        const contract = await getEthereumContract()
        const tx = await contract.deletePoll(id)
        await tx.wait()

        return Promise.resolve(tx)
    }catch(error){
        reportError(error)
        return Promise.reject(error)
    }
}

const getPolls = async ():Promise<PollStruct[]> =>{
    const contract = await getEthereumContract()
    const polls = await contract.getPolls()
    return structurePolls(polls)
}

const getPoll = async (id: number): Promise<PollStruct> => {
    const contract = await getEthereumContract()
    const poll = await contract.getPoll(id)
    return structurePolls([poll])[0]
  }

  const contestPoll = async(id: number,name: string,image: string,party: string,nationalId: string,bio: string) => {
    if(!ethereum){
        reportError('please install metamask')
        return Promise.reject(new Error('Metamask not installed'))
    }

    try {
        const contract = await getEthereumContract()
        const tx = await contract.contest(id,name,image,party,nationalId,bio)
        await tx.wait()

        const poll = await getPoll(id)
        store.dispatch(setPoll(poll))

        const contestants = await getContestants(id)
        store.dispatch(setContestants(contestants))

        return Promise.resolve(tx)
    }catch(error){
        reportError(error)
        return Promise.reject(error)
    }
}

const voteCandidate = async(id: number,cid: number) => {
    if(!ethereum){
        reportError('please install metamask')
        return Promise.reject(new Error('Metamask not installed'))
    }

    try {
        const contract = await getEthereumContract()
        const tx = await contract.vote(id,cid)
        await tx.wait()

        const poll = await getPoll(id)
        store.dispatch(setPoll(poll))

        const contestants = await getContestants(id)
        store.dispatch(setContestants(contestants))

        return Promise.resolve(tx)
    }catch(error){
        reportError(error)
        return Promise.reject(error)
    }
}

const getContestants = async(id: number) : Promise<ContestantStruct[]> => {
    const contract = await getEthereumContract()
    const contestants = await contract.getContestants(id)
    return structureContestants(contestants)
}

const structureContestants = (contestants:ContestantStruct[]):ContestantStruct[] =>
    contestants.map((contestant)=>({
        id:Number(contestant.id),
        image:contestant.image,
        name:contestant.name,
        voter:contestant.voter.toLowerCase(),
        votes:Number(contestant.votes),
        voters:contestant.voters.map((voter:string)=>voter.toLowerCase()),
    }))
    .sort((a,b)=>b.votes - a.votes)


const structurePolls = (polls:PollStruct[]):PollStruct[] =>
    polls.map((poll)=>({
        id:Number(poll.id),
        image:poll.image,
        title:poll.title,
        description:poll.description,
        votes:Number(poll.votes),
        contestants:Number(poll.contestants),
        deleted:poll.deleted,
        director:poll.director.toLowerCase(),
        startsAt:Number(poll.startsAt),
        endsAt:Number(poll.endsAt),
        timestamp:Number(poll.timestamp),
        voters:poll.voters.map((voter:string)=>voter.toLowerCase()),
        avatars : poll.avatars

    }))
    .sort((a,b)=>b.timestamp - a.timestamp)
    

const reportError = (error:any) =>{
    console.error(error)
}

export {connectWallet,checkWallet,createPoll,getPolls,getPoll, updatePoll,deletePoll,contestPoll,getContestants,voteCandidate}