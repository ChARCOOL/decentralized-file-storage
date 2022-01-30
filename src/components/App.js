import React, { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3'
import './App.css'
import DStorage from '../abis/DStorage.json'
import { create } from 'ipfs-http-client'

const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

const App = () => {
	const [account, setAccount] = useState('')
	const [loading, setLoading] = useState('')
	const [files, setFiles] = useState([])
	const [dstorage, setDstorage] = useState('')
	const [buffer, setBuffer] = useState('')
	const [type, setType] = useState('')
	const [name, setName] = useState('')

	useEffect(() => {
		const load = async () => {
			await loadWeb3()
			await loadBlockchainData()
		}

		load()
	}, [])

	const loadWeb3 = async () => {
		if (window.ethereum) {
			window.web3 = new Web3(window.ethereum)
			await window.ethereum.request({ method: 'eth_requestAccounts' })
		} else if (window.web3) {
			window.web3 = new Web3(window.web3.currentProvider)
		} else {
			window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
		}
	}

	const loadBlockchainData = async () => {
		setLoading(true)

		const web3 = window.web3

		const accounts = await web3.eth.getAccounts()
		setAccount(accounts[0])

		const networkId = await web3.eth.net.getId()
		const networkData = DStorage.networks[networkId]

		if (networkData) {
			const dstorage = new web3.eth.Contract(DStorage.abi, networkData.address)
			setDstorage(dstorage)

			const filesCount = await dstorage.methods.fileCount().call()

			for (let i = filesCount; i >= 1; i--) {
				const file = await dstorage.methods.files(i).call()
				setFiles((files) => [...files, file])
			}
		} else {
			window.alert('DStorage contract not deployed to detect network')
		}
		setLoading(false)
	}

	const captureFile = (event) => {
		event.preventDefault()

		const file = event.target.files[0]
		const reader = new window.FileReader()

		reader.readAsArrayBuffer(file)
		reader.onloadend = () => {
			setBuffer(Buffer(reader.result))
			setType(file.type)
			setName(file.name)
		}
	}

	const uploadFile = async (description) => {
		try {
			const result = await ipfs.add(buffer)

			if (type === '') {
				setType('none')
			}

			console.log(result)

			dstorage.methods
				.uploadFile(result.path, result.size, type, name, description)
				.send({ from: account })
				.on('transactionHash', (hash) => {
					setLoading(false)
					setType('')
					setName('')
					window.reload()
				})
				.on('error', (event) => {
					window.alert('Error')
					setLoading(false)
				})
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<div>
			<Navbar account={account} />
			{loading ? (
				<div id="loader" className="text-center mt-5">
					<p>Loading...</p>
				</div>
			) : (
				<Main files={files} captureFile={captureFile} uploadFile={uploadFile} />
			)}
		</div>
	)
}

export default App
