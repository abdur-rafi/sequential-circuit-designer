import React from 'react'
import { AiFillGithub, AiOutlineFacebook } from 'react-icons/ai';
import styles from '../styles/footerheadercontainer.module.scss'

const Footer : React.FC<{

}> = (props)=>{

    return(
        <div className = {styles.footer}>
            <div className = {styles.cardContainer}>
                <div>
                    Developed by Abdur Rafi
                    {/* <br/> */}
                    <div className = {styles.linksContainer} >
                        <a target = "_blank" href="https://www.facebook.com/abdur08236.rafi" > <AiOutlineFacebook className = {styles.facebookIcon} /> </a>
                        <a target = "_blank" href = "https://github.com/abdur-rafi/sequential-circuit-designer" > <AiFillGithub className = {styles.githubIcon} /> </a>

                    </div>
                    {/* <br/> */}
                    Mail: rafi08236@gmail.com
                    <br/>
                    Feel free to provide any  
                    <br/>
                    suggestion or feedback
                    <br/>
                    <span style={{
                        "color" : "red"
                    }}>Please refrain from using this site to cheat </span>
                </div>
            </div>
            
        </div>
    )
}

export default Footer;