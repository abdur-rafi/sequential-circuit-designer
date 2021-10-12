import React from 'react'
import { useState } from 'react'
import styles from '../styles/design.module.scss'
import { useMediaQuery } from 'react-responsive'
import {IoMenuSharp} from 'react-icons/io5'
import {IoIosArrowDown} from 'react-icons/io'


const Header : React.FC<{

}> = (props)=>{
    const [ShowCombLinks, setShowCombLinks] = useState<boolean>(false);
    const [ShowSeqLinks, setShowSeqLinks] = useState<boolean>(false);
    const isSmallScreen = useMediaQuery({query : '(max-width:600px)'});
    const [showLinks, setShowLinks] = useState<boolean>(false);
    
    return(
        <div className = {styles.header}>
            <div className = {styles.logoContainer} >
                <div>Logo</div>
                {
                    isSmallScreen && 
                    <div className = {styles.menuButtonContainer + (showLinks ? ` ${styles.pressed}` : '')}>
                        <IoMenuSharp className = {styles.menuIcon} onClick = {()=>setShowLinks(!showLinks)} />
                    </div>
                }
            </div>
            
            {
                (!isSmallScreen || (isSmallScreen && showLinks)) &&
                <div className = {styles.navigationLinksContainer}>
                    <div>
                        <div onClick = {(e)=>{
                            if(ShowCombLinks){
                                setShowCombLinks(false);
                            }
                            else setShowCombLinks(true)
                        }}> Combiantional Circuits <sub> <IoIosArrowDown className={ShowCombLinks ? styles.rotateArrow : ''} /> </sub> </div>
                        <div className = {styles.combinationalOptionsContainer  + (ShowCombLinks ? '' : ` ${styles.noneDisplay}`) }>
                            <div>
                                <a href='/functionminimization/kmap'> Kmap </a>
                            </div>
                            <div>   
                                <a href='/functionminimization/tabulation'> Tabulation </a>

                            </div>
                        </div>
                        
                    </div>
                    <div>
                        <div onClick = {(e)=>{
                            if(ShowSeqLinks){
                                setShowSeqLinks(false);
                            }
                            else setShowSeqLinks(true)
                        }}>Sequential circuits <sub> <IoIosArrowDown className={ShowSeqLinks ? styles.rotateArrow : ''} /> </sub> </div>
                        <div className = {styles.sequentialOptionsContainer + (ShowSeqLinks ? '' : ` ${styles.noneDisplay}` )}>
                            <div>
                                <a href='/statediagram'> State Diagram </a>

                            </div>
                            <div>
                                <a href='/statetable'> State Table </a>

                            </div>
                        </div>
                        
                    </div>
                </div>
            }
        </div>
    )
}

export default Header;