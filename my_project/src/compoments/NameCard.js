import React from 'react'
const NameCard = (props) => {
    const {name, number, isHuman, tags } = props
    return (
        <div className="alert alert-success">
            <h4 className="alert alert-success">{name}</h4>
            <ul>
                <li>phone: {number}</li>
                <li>{isHuman ? 'human' : 'unknown creature'}</li>
                <hr/>
                <p>
                    { tags.map((tag, index) => (
                        <span className="badge badge-pill badge-primary" key={index}>{tag}</span>
                    ))}
                </p>
            </ul>
        </div>
    )
}

export default NameCard