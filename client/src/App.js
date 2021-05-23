import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import io from 'socket.io-client'
import Image from './Image'

const Page = styled.div`
	display: flex;
	height: 100vh;
	width: 100%;
	align-items: center;
	background-color: black;
	flex-direction: column;
`

const Container = styled.div`
	display: flex;
	flex-direction: column;
	height: 90vh;
	max-height: 500px;
	overflow: auto;
	width: 95%;
	max-width: 400px;
	border: 1px solid lightgray;
	border-radius: 10px;
	padding-bottom: 10px;
	margin-top: 25px;
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
	height: 50px;
	border-radius: 10px;
	color: white;
	font-size: 17px;
`

const Form = styled.form`
	width: 95%;
	max-width: 400px;
`

const MyRow = styled.div`
	width: 100%;
	display: flex;
	justify-content: flex-end;
	margin-top: 10px;
`

const MyMessage = styled.div`
	width: 45%;
	background-color: #11112e;
	border: 0.5px solid lightgray;
	color: white;
	padding: 10px;
	margin-right: 5px;
	text-align: center;
	border-top-right-radius: 10%;
	border-bottom-right-radius: 10%;
`

const PartnerRow = styled(MyRow)`
	justify-content: flex-start;
`

const PartnerMessage = styled.div`
	width: 45%;
	background-color: rgba(200, 0, 0, 0.3);
	color: lightgray;
	border: 0.5px solid lightgray;
	padding: 10px;
	margin-left: 5px;
	text-align: center;
	border-top-left-radius: 10%;
	border-bottom-left-radius: 10%;
`

const App = () => {
	const [yourID, setYourID] = useState()
	const [messages, setMessages] = useState([])
	const [message, setMessage] = useState('')
	const [file, setFile] = useState()
	const [username, setUsername] = useState('')

	const socketRef = useRef()

	useEffect(() => {
		function getUsername() {
			const name = prompt('Enter your name:')
			setUsername(name)
		}
		getUsername()

		socketRef.current = io.connect('/')

		socketRef.current.on('your id', id => {
			setYourID(id)
		})

		socketRef.current.on('message', message => {
			console.log('here')
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
			}
			setMessage('')
			setFile('')
			socketRef.current.emit('send message', messageObject)
		} else {
			const messageObject = {
				body: `${username}🢂 ${message}`,
				id: yourID,
				type: 'text',
			}
			setMessage('')
			setFile('')
			socketRef.current.emit('send message', messageObject)
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
			<h2 style={{ color: 'white', background: 'black' }}>iShare</h2>

			<Container>{messages.map(renderMessages)}</Container>

			<Form onSubmit={sendMessage}>
				<TextArea value={message} onChange={handleChange} placeholder="Message..." />
				<Input onChange={selectFile} type="file" />
				<Button>Send</Button>
			</Form>
		</Page>
	)
}

export default App
