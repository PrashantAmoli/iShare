import React, { useState, useEffect } from 'react'

function Image(props) {
	const [imageSrc, setImageSrc] = useState()

	useEffect(() => {
		const reader = new FileReader()
		reader.readAsDataURL(props.blob)
		reader.onloadend = () => {
			setImageSrc(reader.result)
		}
	}, [props.blob])
	return (
		<img style={{ width: 180, height: 'auto', margin: 3 }} src={imageSrc} alt={props.fileName} />
	)
}

export default Image
