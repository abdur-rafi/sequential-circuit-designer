import React from "react";
import styles from '../../styles/topbar.module.scss'
import {IoHandRightOutline} from 'react-icons/io5'
import {GrSelect} from 'react-icons/gr'
import { MouseMode } from "./state-diagram-interfaces";
import {AiFillCaretRight, AiOutlinePlus} from 'react-icons/ai'
interface Props{
    setMouseMode : (mode : MouseMode)=>void
    mouseMode : 'addNode' | 'drag' | 'edge' | 'select',
    numberOfInputVars : number,
    changeNumberOfInputVars : (vars : number)=> void,
    numberOfOutputVars : number,
    changeNumberOfOutputVars : (vars : number)=> void,
    changeSynthesis : (b : boolean) => void
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
                            if(this.props.mouseMode === 'drag')
                                return;
                            // else
                            this.props.setMouseMode('drag');
                        }}
                        />

                    </div>
                    <div className = {styles.selectIconContainer}>
                        
                        <GrSelect
                            className={styles.selectIcon + ' ' + (this.props.mouseMode === 'select' ? styles.selectIconActive : '')}
                            onClick = {()=>{
                                if(this.props.mouseMode === 'select')
                                    return;
                                // else
                                this.props.setMouseMode('select');
                            }}
                            />
                    </div>
                    <div className = {styles.edgeIconContainer}>
                        <div className = {styles.edgeIcon + ' ' + (this.props.mouseMode === 'edge' ? styles.selectIconActive : '')}
                        onClick = {()=>{
                            if(this.props.mouseMode === 'edge')
                                return;
                            this.props.setMouseMode('edge')
                        }}>
                            E
                        </div>
                    </div>
                    <div className = {styles.plusIconContainer }>
                        <div className = {styles.plusIcon + ' ' +  (this.props.mouseMode === 'addNode' ? styles.plusIconActive : '')}
                         onClick = {()=>{
                            if(this.props.mouseMode === 'addNode')
                                return;
                            this.props.setMouseMode('addNode')
                        }}>
                            <AiOutlinePlus />
                        </div>
                    </div>
                    <div className = {styles.resultIconContainer }>
                        <div className = {styles.resultIcon}
                         onClick = {()=>{
                            this.props.changeSynthesis(true);
                        }}>
                            <AiFillCaretRight />
                        </div>
                    </div>
                    
                </div>
                <div className = {styles.rightSideContainer}>
                    <div className = {styles.inputVarContainer}>
                        <label> input</label>
                        <input type='number' value={this.props.numberOfInputVars}
                        onChange = {(e)=>{
                            let n = parseInt(e.target.value);
                            if(n > 4 || n < 1) return;
                            this.props.changeNumberOfInputVars(n);
                            
                            }} />
                        <label> output </label>
                        <input type='number' value={this.props.numberOfOutputVars} onChange={(e)=>{
                            let n = parseInt(e.target.value);
                            if(n > 0 && n < 5){
                                this.props.changeNumberOfOutputVars(n);
                            }
                        }} />
                        
                    </div>
                </div>

            </div>
        )
    }
}

export default TopBar;