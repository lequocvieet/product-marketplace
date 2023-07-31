import { Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import {Buffer} from 'buffer';
import MarketplaceAbi from "./contractsData/Marketplace.json"
import MarketplaceAddress from './contractsData/Marketplace-address.json'
import NFTAbi from './contractsData/NFT.json'
import NFTAddress from './contractsData/NFT-address.json'

const ipfsClient = require("ipfs-http-client");
const projectId = "2RxlsL0EdByBbnetwmtzOAXX0Dn";
const projectSecret = "aa7f3e51edccdfbc4c416ea1c86a3640";
const fetch = require('node-fetch');
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
const client = ipfsClient.create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
      authorization: auth,
  },
});

let eventData=[];

// const marketplaceContract = new ethers.Contract(
//   MarketplaceAddress.address,
//   MarketplaceAbi.abi,
//   signer,
// )
// const nftContract = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer)





export function getShortAddress(address) {
  console.log("address",address)
  if (!address) return "no owner";
  return address.slice(0, 5) + "..." + address.slice(38);
}
export function renderTime(epochTime) {
  let today = new Date(epochTime * 1000)
  let time = today.toDateString().slice(4) + " " + today.getHours() + ':' + today.getMinutes()
  return time
}

export function renderCardItem(item) {
  if (!item) return;
  return (
    <Card style={{ height: "auto", width: "16rem", borderRadius: "10px", boxShadow: " 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)" }} bg="dark" border="info">
      <Link to={"/nft-detail/" + item.tokenId}>
        <Card.Img variant="top" style={{ display: "block", height: "16rem", width: "16rem", borderRadius: "10px", "padding": "5px", objectFit: 'contain' }} src={item.image} />
        <Card.Body>
          <Card.Title style={{ fontWeight: "bold" }} >{item.name}</Card.Title>
          {"price" in item ? (
            <Card.Text style={{ color: "red" }}>
              Price: {ethers.utils.formatEther(item.price)} ETH
            </Card.Text>
          ) : (
            <Card.Text></Card.Text>
          )}
        </Card.Body>
      </Link>
    </Card>
  );
}
export function renderLoadingAndError(loading, error) {
  if (loading)
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );
  if (error)
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>This Page is error: {error.data.message}</h2>
      </main>
    );
  return null;
}

//async function

export async function isApprovedForAll(nft, account, marketplace) {
  if (!(await nft.isApprovedForAll(account, marketplace.address))) {
    await (await nft.setApprovalForAll(marketplace.address, true)).wait();
  }
}

export async function getEventTimestamp(eventResult) {
  const blockDetail = await eventResult.getBlock();
  return blockDetail.timestamp;
}
export async function getMetadata(nft, tokenId) {
  const uri = await nft.tokenURI(tokenId);
  const response = await fetch(uri);
  const metadata = await response.json();

  return metadata;

}

export async function fetchAllEvent(itemId,nft,marketplace){
  //listen mint event 
  let count=0;
  let filter1 = nft.filters.MintNFT(null, null, itemId)
  let results1 = await nft.queryFilter(filter1)
  if (results1.length >0) {
    let latestEvent1=results1.pop();
    let mintTrans={
      id:count++,
      event: "Mint Item",
      toAccount:latestEvent1.args[0],
      time:renderTime(await getEventTimestamp(latestEvent1)),
    }
    eventData.push(mintTrans);
    
  }
 


   //Listen buy event
  let filter2 = marketplace.filters.BuyItem(
  itemId,
  null,
  null,
  null,
  null,
  null,
)
 let results2 = await marketplace.queryFilter(filter2)
 if (results2.length >0) {
  let latestEvent2=results2.pop();
  let buyTrans={
    id:count++,
    event: "Buy Item",
    currentPrice:ethers.utils.formatEther(latestEvent2.args[3]),
    fromAccount:latestEvent2.args[4],
    toAccount:latestEvent2.args[5],
    time:renderTime(await getEventTimestamp(latestEvent2)),
  }
  eventData.push(buyTrans);
 }


 //Listen cancel event
  let filter3 = marketplace.filters.CancelItem(itemId, null, null, null)
 let  results3 = await marketplace.queryFilter(filter3)
 if (results3.length >0) {
  let latestEvent3=results3.pop();
  let cancelTrans={
    id:count++,
    event: "Cancel Item",
    fromAccount:latestEvent3.args[3],
    time:renderTime(await getEventTimestamp(latestEvent3)),
  }
  eventData.push(cancelTrans);
 }
 

 //listen sell item event
  let filter4 = marketplace.filters.MakeItem(
  itemId,
  null,
  null,
  null,
  null,
)
let  results4 = await marketplace.queryFilter(filter4)
if (results4.length >0) {
  let latestEvent4=results4.pop();
  let sellTrans={
    id:count++,
    event: "Sell Item",
    currentPrice:ethers.utils.formatEther(latestEvent4.args[3]),
    fromAccount:latestEvent4.args[4],
    time:renderTime(await getEventTimestamp(latestEvent4)),
  }
  eventData.push(sellTrans);

}


     //Listen giftNFT event
  let filter5 = marketplace.filters.GiftNFT(null, null, null, itemId)
 let  results5 = await marketplace.queryFilter(filter5)
 if (results5.length >0) {
  let latestEvent5=results5.pop();
  let giftTrans={
    id:count++,
    event: "Gift Item",
    fromAccount:latestEvent5.args[1],
    toAccount:latestEvent5.args[2],
    time:renderTime(await getEventTimestamp(latestEvent5)),
  }
  eventData.push(giftTrans);

 }
 

       return eventData;

}





