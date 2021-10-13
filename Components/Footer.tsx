import React from 'react'
import styles from '../styles/footerheadercontainer.module.scss'

const Footer : React.FC<{

}> = (props)=>{

    return(
        <div className = {styles.footer}>
            <div>
                Developped by Abdur Rafi
                <br/>
                Social links
            </div>
            <div>

            </div>
        </div>
    )
}

export default Footer;