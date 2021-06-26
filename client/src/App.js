import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import io from 'socket.io-client'
import Image from './Image'
import './App.css'

const Page = styled.div`
	display: flex;
	height: 100vh;
	width: 100%;
	align-items: center;
	background-color: black;
	background: rgb(12, 12, 12);
	background: linear-gradient(
		45deg,
		rgba(12, 12, 12, 1) 15%,
		rgba(25, 22, 65, 1) 43%,
		rgba(12, 12, 46, 1) 58%,
		rgba(32, 31, 41, 1) 78%
	);
	flex-direction: column;
	font-size: 1.1rem;
`

const Container = styled.div`
	display: flex;
	flex-direction: column;
	height: 90vh;
	max-height: 512px;
	overflow: auto;
	width: 95%;
	max-width: 400px;
	border: 1px solid lightgray;
	border-radius: 10px;
	padding-bottom: 10px;
	margin-top: 10px;
	box-shadow: 0 0 9px 3px blue;
`

const TextArea = styled.textarea`
	width: 95%;
	height: 50px;
	border-radius: 10px;
	margin-top: 10px;
	padding-left: 10px;
	padding-top: 10px;
	font-size: 17px;
	background-color: transparent;
	border: 1px solid lightgray;
	outline: none;
	color: lightgray;
	letter-spacing: 1px;
	line-height: 20px;
	box-shadow: 0 0 3px 3px blue;
	::placeholder {
		color: lightgray;
	}
`

const Input = styled.input`
	width: 230px;
	margin: 5px auto;
	padding: 3px 10px;
	font-size: 17px;
	background-color: transparent;
	outline: none;
	color: white;
`

const Button = styled.button`
	background-color: red;
	width: 95%;
	border: none;
	height: 44px;
	border-radius: 10px;
	color: white;
	font-size: 17px;
	&:hover {
		background-color: #000c86;
		box-shadow: 1px 1px 3px 0px white;
	}
`

const Form = styled.form`
	width: 95%;
	max-width: 400px;
	display: flex;
	flex-direction: column;
`

const MyRow = styled.div`
	width: 100%;
	display: flex;
	justify-content: flex-end;
	margin-top: 10px;
`

const MyMessage = styled.div`
	width: 77%;
	background-color: #19113929;
	border: 0.5px solid lightgray;
	color: white;
	padding: 10px;
	margin-right: 5px;
	text-align: left;
	border-radius: 30px 0 50px 30px;
	overflow: hidden;
`

const PartnerRow = styled(MyRow)`
	justify-content: flex-start;
`

const PartnerMessage = styled.div`
	width: 77%;
	background-color: rgb(80 80 80 / 30%);
	color: white;
	border: 0.5px solid lightgray;
	padding: 10px;
	margin-left: 5px;
	border-radius: 0 30px 30px 44px;
	overflow: hidden;
`

const App = () => {
	const [yourID, setYourID] = useState()
	const [messages, setMessages] = useState([])
	const [message, setMessage] = useState('')
	const [file, setFile] = useState()
	const [username, setUsername] = useState('')

	const socketRef = useRef()

	useEffect(() => {
		const getUsername = async () => {
			let name
			while (name == null || name == '') {
				name = await prompt('Enter your name:')
			}
			await setUsername(name.toUpperCase())
			socketRef.current.emit('new-user', {
				body: `${name.toUpperCase()} 🅹🅾🅸🅽🅴🅳.`,
				type: 'text',
			})
		}

		socketRef.current = io.connect('/')

		socketRef.current.on('your id', id => {
			setYourID(id)
		})

		getUsername()

		socketRef.current.on('message', message => {
			console.log('here')
			receivedMessage(message)
		})

		socketRef.current.on('user-joined', message => {
			receivedMessage(message)
		})
	}, [])

	function receivedMessage(message) {
		setMessages(oldMsgs => [...oldMsgs, message])
	}

	function sendMessage(e) {
		e.preventDefault()

		if (file) {
			const messageObject = {
				id: yourID,
				type: 'file',
				body: file,
				mimeType: file.type,
				fileName: file.name,
				username: username,
			}
			console.log(file.type)
			setMessage('')
			setFile('')
			socketRef.current.emit('send message', messageObject)
		} else {
			const messageObject = {
				body: `${username}🢂 ${message}`,
				id: yourID,
				type: 'text',
				username: username,
			}
			setMessage('')
			setFile('')
			if (message != '') {
				socketRef.current.emit('send message', messageObject)
			}
		}
	}

	function handleChange(e) {
		setMessage(e.target.value)
	}

	function selectFile(e) {
		setMessage(e.target.files[0].name)
		setFile(e.target.files[0])
	}

	function renderMessages(message, index) {
		if (message.type === 'file') {
			const blob = new Blob([message.body], { type: message.type })
			if (message.id === yourID) {
				return (
					<MyRow key={index}>
						<Image fileName={message.fileName} blob={blob} />
					</MyRow>
				)
			}
			return (
				<PartnerRow key={index}>
					<Image fileName={message.fileName} blob={blob} />
				</PartnerRow>
			)
		}

		if (message.id === yourID) {
			return (
				<MyRow key={index}>
					<MyMessage>{message.body}</MyMessage>
				</MyRow>
			)
		}
		return (
			<PartnerRow key={index}>
				<PartnerMessage>{message.body}</PartnerMessage>
			</PartnerRow>
		)
	}

	return (
		<Page>
			{/* <h2 style={{ color: 'white', background: 'black' }}>iShare</h2> */}
			<div className="container">
				<span>i</span>
				<span>S</span>
				<span>H</span>
				<span>A</span>
				<span>R</span>
				<span>E</span>
			</div>

			<Container>{messages.map(renderMessages)}</Container>

			<Form onSubmit={sendMessage}>
				<TextArea value={message} onChange={handleChange} placeholder="Message..." />
				<Input onChange={selectFile} type="file" className="custom-file-input" />
				<Button>Send</Button>
			</Form>
		</Page>
	)
}

export default App
