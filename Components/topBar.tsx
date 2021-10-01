import React from "react";
import styles from '../styles/design.module.scss'
import {IoHandRightOutline} from 'react-icons/io5'
interface Props{
    toggleGrabMode : ()=>void
}
interface State{
    buttonPressed : boolean
}
class TopBar extends React.Component<Props, State>{

    constructor(props : Props){
        super(props);
        this.state = {
            buttonPressed : false
        }
        this.switchPressed = this.switchPressed.bind(this);
    }
    
    switchPressed(){
        this.setState(old=>({
            ...old,
            buttonPressed : !old.buttonPressed
        }))
    }

    render() : React.ReactNode{
        return(
            <div className={styles.topBar}>
                <div className={styles.grabIconContainer}>
                    <IoHandRightOutline
                    className={styles.grabIcon + ' ' + (this.state.buttonPressed ? styles.grabIconActive : '')}
                    onClick = {()=>{
                        this.props.toggleGrabMode();
                        this.switchPressed();
                    }}
                    />

                </div>
            </div>
        )
    }
}

export default TopBar;