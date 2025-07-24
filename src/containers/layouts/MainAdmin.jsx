import React from 'react'
import Nav from '../../components/Common/Header'


export default ({children}) => {
    return (
        <div>
            <Nav />
            {children}
        </div>
    )
}

