import React from "react";
import styles from '../../styles/topbar.module.scss'
import {IoHandRightOutline} from 'react-icons/io5'
import {GrSelect} from 'react-icons/gr'
import { MouseMode } from "./state-diagram-interfaces";
import {AiFillCaretRight, AiOutlineDash, AiOutlinePlus} from 'react-icons/ai'
import { useMediaQuery } from "react-responsive";
import { circuitMode } from "../synthesis/interfaces";
interface Props{
    setMouseMode : (mode : MouseMode)=>void
    mouseMode : 'addNode' | 'drag' | 'edge' | 'select',
    numberOfInputVars : number,
    changeNumberOfInputVars : (vars : number)=> void,
    numberOfOutputVars : number,
    changeNumberOfOutputVars : (vars : number)=> void,
    changeSynthesis : (b : boolean) => void,
    changeCircuitMode : (c : circuitMode)=>void,
    circuitMode : circuitMode
}
interface State{

}
const TopBar : React.FC<Props> = (props)=>{

    const removeTextFromOptions = useMediaQuery({query : '(max-width:800px)'});

    
    return(
        <div className={styles.topBar}>
            <div className = {styles.leftSideContainer}>
                <div onClick = {()=>{
                        if(props.mouseMode === 'drag')
                            return;
                        // else
                        props.setMouseMode('drag');
                    }} className={styles.grabIconContainer+ ' ' + (props.mouseMode === 'drag' ? styles.grabIconActive : '')}>
                    { !removeTextFromOptions && 'Drag'}
                    <IoHandRightOutline
                    className={styles.grabIcon }
                    
                    />

                </div>
                <div onClick = {()=>{
                            if(props.mouseMode === 'select')
                                return;
                            // else
                            props.setMouseMode('select');
                        }} className = {styles.selectIconContainer  + ' ' + (props.mouseMode === 'select' ? styles.selectIconActive : '')}>
                    { !removeTextFromOptions && "Select"}
                    <GrSelect
                        className={styles.selectIcon}
                        
                        />
                </div>
                <div onClick = {()=>{
                        if(props.mouseMode === 'edge')
                            return;
                        props.setMouseMode('edge')
                    }} className = {styles.edgeIconContainer + ' ' + (props.mouseMode === 'edge' ? styles.selectIconActive : '')}>
                    { !removeTextFromOptions && 'Connect'}
                    {/* <div className = {styles.edgeIcon + ' ' + (this.props.mouseMode === 'edge' ? styles.selectIconActive : '')}
                    onClick = {()=>{
                        if(this.props.mouseMode === 'edge')
                            return;
                        this.props.setMouseMode('edge')
                    }}>
                        E
                    </div> */}

                    <AiOutlineDash className = {styles.edgeIcon}>
                        E
                    </AiOutlineDash>

                </div>
                <div onClick = {()=>{
                        if(props.mouseMode === 'addNode')
                            return;
                        props.setMouseMode('addNode')
                    }} className = {styles.plusIconContainer + ' ' +  (props.mouseMode === 'addNode' ? styles.plusIconActive : '') }>
                    { !removeTextFromOptions &&  "New Node"}
                    <AiOutlinePlus className = {styles.plusIcon }/>
                </div>
                <div onClick = {()=>{
                        props.changeSynthesis(true);
                    }} className = {styles.resultIconContainer }>
                    { !removeTextFromOptions &&  "Calculate"}
                    <AiFillCaretRight className = {styles.resultIcon}/>
                </div>
                
            </div>
            <div className = {styles.rightSideContainer}>
                <div className = {styles.modeContainer} >
                    <label>mode{' '}</label> 
                    <select onChange = {(e)=>{
                        if(e.target.value !== props.circuitMode){
                            if(e.target.value === 'synch' || e.target.value === 'pulse')
                                props.changeCircuitMode(e.target.value);
                        }
                    }} value = {props.circuitMode}>
                        <option>synch</option>
                        <option>pulse</option>
                    </select>
                </div>
                <div className = {styles.inputVarContainer}>
                    <label> input</label>
                    <input type='number' value={props.numberOfInputVars}
                    onChange = {(e)=>{
                        let n = parseInt(e.target.value);
                        if(n > 4 || n < 1) return;
                        props.changeNumberOfInputVars(n);
                        
                        }} />
                    {/* <label> output </label>
                    <input type='number' value={this.props.numberOfOutputVars} onChange={(e)=>{
                        let n = parseInt(e.target.value);
                        if(n > 0 && n < 5){
                            this.props.changeNumberOfOutputVars(n);
                        }
                    }} /> */}
                    
                </div>
                <div className = {styles.outputVarContainer}>
                <label> output </label>
                    <input type='number' value={props.numberOfOutputVars} onChange={(e)=>{
                        let n = parseInt(e.target.value);
                        if(n > 0 && n < 5){
                            props.changeNumberOfOutputVars(n);
                        }
                    }} />

                </div>
            </div>

        </div>
    )
    
}

export default TopBar;