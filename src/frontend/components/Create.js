import { useState } from 'react'
import React from 'react'
import 'reactjs-popup/dist/index.css'
import { Row, Form, Button } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import NFTAddress from '../contractsData/NFT-address.json'
import {Buffer} from 'buffer';
import {
  getEventTimestamp,
  renderTime,
} from '../HelperFunction'
const ipfsClient = require("ipfs-http-client");
const projectId = "2RxlsL0EdByBbnetwmtzOAXX0Dn";
const projectSecret = "aa7f3e51edccdfbc4c416ea1c86a3640";

const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
const client = ipfsClient.create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
        authorization: auth,
    },
});
const Create = ({ nft, account }) => {
  const [image, setImage] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const uploadToIPFS = async (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    if (typeof file !== 'undefined') {
      try {
        const result = await client.add(file)
        console.log(result)
        setImage(`https://product-vieet.infura-ipfs.io/ipfs/${result.path}`)
      } catch (error) {
        setError(error)
        console.log('ipfs image upload error: ', error)
      }
    }
  }

  const createNFT = async () => {
    if (!image || !name || !description) return
    try {
      const result = await client.add(
        JSON.stringify({ image, name, description }),
      )
      mint(result)
    } catch (error) {
      setError(error)
      console.log('ipfs uri upload error: ', error)
    }
  }

  const mint = async (result) => {
    const uri = `https://product-vieet.infura-ipfs.io/ipfs/${result.path}`
    console.log('URI', uri)
    // mint nft 
    await (await nft.mint(uri)).wait()

    //listen mint event 
    const filter = nft.filters.MintNFT(account, null, null)
    const results = await nft.queryFilter(filter)
    let mintEvent = await results.pop();
    let time = renderTime(await getEventTimestamp(mintEvent));
    mintEvent = mintEvent.args
    console.log(time)
    console.log(mintEvent.to.toString())


  }

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: '1000px' }}
        >
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control
                onChange={(e) => setName(e.target.value)}
                size="lg"
                required
                type="text"
                placeholder="Name"
              />
              <Form.Control
                onChange={(e) => setDescription(e.target.value)}
                size="lg"
                required
                as="textarea"
                placeholder="Description"
              />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create NFT
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Create
