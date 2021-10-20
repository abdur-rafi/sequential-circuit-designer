import React from "react";
import styles from '../../styles/topbar.module.scss'
import {IoHandRightOutline} from 'react-icons/io5'
import {GrSelect} from 'react-icons/gr'
import { MouseMode } from "./state-diagram-interfaces";
import {AiFillCaretRight, AiOutlineDash, AiOutlinePlus} from 'react-icons/ai'
import {RiDeleteBin6Line} from 'react-icons/ri'
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
    circuitMode : circuitMode,
    deleteSelected : ()=>void
}
interface State{

}
const TopBar : React.FC<Props> = (props)=>{

    const removeTextFromOptions = useMediaQuery({query : '(max-width:900px)'});

    
    return(
        <div className={styles.topBar}>
            <div className = {styles.leftSideContainer}>
                <div onClick = {()=>{
                        if(props.mouseMode === 'drag')
                            return;
                        // else
                        props.setMouseMode('drag');
                    }} className={styles.grabIconContainer+ ' ' + (props.mouseMode === 'drag' ? styles.grabIconActive : '')}
                    title = 'move and rotate nodes'>
                    { !removeTextFromOptions && 'Drag'}
                    <IoHandRightOutline
                    className={styles.grabIcon }/>

                </div>
                <div onClick = {(e)=>{
                            if(props.mouseMode === 'select')
                                return;
                            // else
                            props.setMouseMode('select');
                        }} className = {styles.selectIconContainer  + ' ' + (props.mouseMode === 'select' ? styles.selectIconActive : '')}
                        title = 'Select nodes to modify labels, outputs, colors, radius etc.'>
                    { !removeTextFromOptions && "Select"}
                    <GrSelect
                        className={styles.selectIcon}
                        
                        />
                </div>
                <div onClick = {()=>{
                        if(props.mouseMode === 'edge')
                            return;
                        props.setMouseMode('edge')
                    }} className = {styles.edgeIconContainer + ' ' + (props.mouseMode === 'edge' ? styles.selectIconActive : '')}
                    title = 'draw edges between states'>
                    { !removeTextFromOptions && 'Connect'}
                    {/* <div className = {styles.edgeIcon + ' ' + (this.props.mouseMode === 'edge' ? styles.selectIconActive : '')}
                    onClick = {()=>{
                        if(this.props.mouseMode === 'edge')
                            return;
                        this.props.setMouseMode('edge')
                    }}>
                        E
                    </div> */}

                    <AiOutlineDash className = {styles.edgeIcon}/>

                </div>
                <div onClick = {(e)=>{
                        if(props.mouseMode === 'addNode')
                            return;
                        props.setMouseMode('addNode')
                    }} className = {styles.plusIconContainer + ' ' +  (props.mouseMode === 'addNode' ? styles.plusIconActive : '') }
                    title = 'Add new state'>
                    { !removeTextFromOptions &&  "New State"}
                    <AiOutlinePlus className = {styles.plusIcon }/>
                </div>
                <div className = {styles.deleteIconContainer } onClick = {props.deleteSelected}
                    title = 'Delete selected'>
                    { !removeTextFromOptions &&  "Delete"}
                    <RiDeleteBin6Line className = {styles.deleteIcon }/>
                </div>
                <div onClick = {()=>{
                        props.changeSynthesis(true);
                    }} className = {styles.resultIconContainer } title = 'start synthesis' >
                    { !removeTextFromOptions &&  "Calculate"}
                    <AiFillCaretRight className = {styles.resultIcon}/>
                </div>
                
            </div>
            <div className = {styles.rightSideContainer}>
                <div className = {styles.modeContainer} title = "change circuit mode" >
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
                <div className = {styles.inputVarContainer} title = 'number of input variables' >
                    <label> input bits </label>
                    <input type='number' value={props.numberOfInputVars}
                    onChange = {(e)=>{
                        let n = parseInt(e.target.value);
                        if(props.circuitMode === 'pulse'){
                            if(n < 1) return;
                        }
                        if(n > 4 || n < 0) return;
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
                <div className = {styles.outputVarContainer} title = 'number of output bits'>
                <label> output bits </label>
                    <input type='number' value={props.numberOfOutputVars} onChange={(e)=>{
                        let n = parseInt(e.target.value);
                        if(n > -1 && n < 5){
                            props.changeNumberOfOutputVars(n);
                        }
                    }} />

                </div>
            </div>

        </div>
    )
    
}

export default TopBar;