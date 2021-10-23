import React from 'react'
import Footer from './Footer'
import Header from './Header'
import styles from '../styles/footerheadercontainer.module.scss'

const HeaderFooterContent : React.FC<{
    content : React.ReactNode,
    useFooter : boolean,
    useHeight : boolean,
    useMinWidth : boolean
}> = (props)=>{


    return(
        <div className = {styles.root + (props.useMinWidth ? ` ${styles.fitContent}` : '')} >
            <Header/>
            <div className = {styles.contentContainer + (props.useHeight ? ` ${styles.contentHeight}` : '')}>
                {props.content}
            </div>

            { props.useFooter && <Footer />}
        </div>
    )
}

export default HeaderFooterContent;