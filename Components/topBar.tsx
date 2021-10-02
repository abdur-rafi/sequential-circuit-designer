import React from "react";
import styles from '../styles/design.module.scss'
import {IoHandRightOutline} from 'react-icons/io5'
import {GrSelect} from 'react-icons/gr'
import { MouseMode } from "./canvasInterfaces";
interface Props{
    setMouseMode : (mode : MouseMode)=>void
    mouseMode : 'addNode' | 'drag' | 'edge' | 'select'
}
interface State{

}
class TopBar extends React.Component<Props, State>{



    render() : React.ReactNode{
        return(
            <div className={styles.topBar}>
                <div className = {styles.leftSideContainer}>
                    <div className={styles.grabIconContainer}>
                        <IoHandRightOutline
                        className={styles.grabIcon + ' ' + (this.props.mouseMode === 'drag' ? styles.grabIconActive : '')}
                        onClick = {()=>{
                            // if(this.props.mouseMode === 'drag')
                            //     this.props.setMouseMode('edge');
                            // else
                            this.props.setMouseMode('drag');
                        }}
                        />

                    </div>
                    <div className = {styles.selectIconContainer}>
                        
                        <GrSelect
                            className={styles.selectIcon + ' ' + (this.props.mouseMode === 'select' ? styles.selectIconActive : '')}
                            onClick = {()=>{
                                // if(this.props.mouseMode === 'select')
                                //     this.props.setMouseMode('edge');
                                // else
                                this.props.setMouseMode('select');
                            }}
                            />
                    </div>
                    <div className = {styles.edgeIconContainer}>
                        <div className = {styles.edgeIcon + ' ' + (this.props.mouseMode === 'edge' ? styles.selectIconActive : '')}
                        onClick = {()=>{
                            this.props.setMouseMode('edge')
                        }}>
                            E
                        </div>
                    </div>
                </div>
                <div className = {styles.rightSideContainer}>
                    <div className = {styles.inputVarContainer}>
                        <label> #inp vars</label>
                        <input type='number' />
                    </div>
                </div>

            </div>
        )
    }
}

export default TopBar;