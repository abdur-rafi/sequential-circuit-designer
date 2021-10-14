import React from 'react'
import { AiFillGithub, AiOutlineFacebook } from 'react-icons/ai';
import styles from '../styles/footerheadercontainer.module.scss'

const Footer : React.FC<{

}> = (props)=>{

    return(
        <div className = {styles.footer}>
            <div className = {styles.cardContainer}>
                <div>
                    Developped by Abdur Rafi
                    <br/>
                    Social links:
                    <div className = {styles.linksContainer} >
                        <a target = "_blank" href="https://www.facebook.com/abdur08236.rafi" > <AiOutlineFacebook className = {styles.facebookIcon} /> </a>
                        <a target = "_blank" href = "https://github.com/abdur-rafi" > <AiFillGithub className = {styles.githubIcon} /> </a>
                    </div>
                    <br/>
                    Mail: rafi08236@gmail.com
                </div>
                <div>

                </div>
            </div>
            
        </div>
    )
}

export default Footer;