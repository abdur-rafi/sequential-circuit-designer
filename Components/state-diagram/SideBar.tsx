import React, { useState } from 'react'
import styles from '../../styles/sidebar.module.scss'
import {ImCancelCircle} from 'react-icons/im'
import { IONode, StateNode } from './state-diagram-interfaces';
import {BsArrowDown, BsArrowUp} from 'react-icons/bs'
import { getInputCombination } from '../synthesis/helperFunctions';
import { circuitMode } from '../synthesis/interfaces';
class SideBar extends React.Component<{
    toggleSideBar : ()=>void,
    stateNode : StateNode | null,
    ioNode : IONode | null,
    addIoNodeWithStateChange : (stateNode : StateNode, type : 'in' | 'out')=>boolean,
    changeStateNodeRadius : (state : StateNode, r : number) =>void,
    changeStateColor : (state: StateNode, color : string)=>void,
    changeIoNodeColor : (state: IONode, color : string)=>void,
    changeNumberOfOutputVars : (n : number)=>void,
    numberOfOutputVars : number,
    changeOutput : (ioNode : IONode, s : string) => void,
    circuitMode : circuitMode,
    onLabelChange : (s : StateNode, l : string) => void
}, {}>{

    render() : React.ReactNode{
        return(
            <div className = {styles.sideBar}>
                <div className = {styles.crossIconContainer}>
                    <div>
                        <ImCancelCircle  className={styles.crossIcon} onClick={this.props.toggleSideBar} />
                    </div>
                </div>
                {
                    this.props.ioNode && <IONodeRender circuitMode = {this.props.circuitMode} changeOutput={this.props.changeOutput} numberOfOutputVars={this.props.numberOfOutputVars} changeNumberOfOutputVars={this.props.changeNumberOfOutputVars} changeIoNodeColor={this.props.changeIoNodeColor} ioNode={this.props.ioNode} />
                }
                {
                    this.props.stateNode && <StateNodeRender onLabelChange = {this.props.onLabelChange} changeStateColor = {this.props.changeStateColor} changeStateNodeRadius = {this.props.changeStateNodeRadius} addIoNodeWithStateChange = {this.props.addIoNodeWithStateChange} stateNode={this.props.stateNode} />
                }
            </div>
        )
    }
}

const StateNodeRender : React.FC<{
    stateNode : StateNode
    addIoNodeWithStateChange : (stateNode : StateNode, type : 'in' | 'out')=>boolean
    changeStateNodeRadius : (state : StateNode, r : number) =>void,
    changeStateColor : (state: StateNode, color : string)=>void,
    onLabelChange : (s : StateNode, l : string) => void
    
}> = (props)=>{

    let inNodeC = props.stateNode.ioNodes.filter(n => n.type == 'in').length;
    let outNodeC = props.stateNode.ioNodes.filter(n => n.type == 'out').length;
    const [color, setColor] = useState<string>(props.stateNode.color);
    return(
        <div className = {styles.stateNodeContainer}>
            {/* <div className = {styles.inNodeContainer}>
                <div>
                    inNode : {inNodeC}

                </div>
                <div className = {styles.arrowContainer}>
                    <BsArrowUp onClick={()=>{
                        props.addIoNodeWithStateChange(props.stateNode, 'in');
                    }} className = {styles.arrowIcon} />
                    <BsArrowDown className = {styles.arrowIcon} />

                </div>
            </div> */}
            <div className = {styles.outNodeContainer}>
                <div>
                    outNode : {outNodeC}
                </div>
                <div className = {styles.arrowContainer}>
                    <BsArrowUp onClick={()=>{
                        props.addIoNodeWithStateChange(props.stateNode, 'out');
                    }}
                     className = {styles.arrowIcon} />
                    <BsArrowDown className = {styles.arrowIcon} />

                </div>
            </div>
            <div className = {styles.colorContainer}>
                <div className = {styles.colorBlockContainer}>
                    <div>
                        color:  
                    </div>
                    <div className = {styles.colorBlock} style = {{
                        backgroundColor : color
                    }}>
                    </div>
                </div>
                
                <div>
                    <input type='color' value={props.stateNode.color} onChange={(e)=>{
                        setColor(e.target.value);
                        props.changeStateColor(props.stateNode, e.target.value);
                    }} ></input>
                </div>

                
            </div>
            <div className = {styles.stateLabelContainer}>
                <div className = {styles.labelContainer}>
                    <div>
                        <label>
                            Label: 
                        </label>  
                    </div>
                </div>
                
                <div>
                    <input type='text' value={props.stateNode.label} onChange={(e)=>{
                        props.onLabelChange(props.stateNode,e.target.value);
                        // setColor(e.target.value);
                        // props.changeStateColor(props.stateNode, e.target.value);
                    }} ></input>
                </div>

                
            </div>
            
            <div className = {styles.radiusContainer}>
                <div>
                    radius : {props.stateNode.radius}
                </div>
                
                <div className = {styles.arrowContainer}>
                    <BsArrowUp onClick={()=>{
                        props.changeStateNodeRadius(props.stateNode, 
                            props.stateNode.radius + 1);
                    }} className = {styles.arrowIcon} />
                    <BsArrowDown onClick={()=>{
                        props.changeStateNodeRadius(props.stateNode, 
                            props.stateNode.radius - 1);
                    }}
                    className = {styles.arrowIcon} />

                </div>
            </div>
        </div>
    )
}

const IONodeRender : React.FC<{
    
    changeIoNodeColor : (state: IONode, color : string)=>void,
    ioNode : IONode,
    changeNumberOfOutputVars : (n : number)=>void,
    numberOfOutputVars : number,
    changeOutput : (ioNode : IONode, s : string) => void,
    circuitMode : circuitMode
}> = (props)=>{

    const outputComb = getInputCombination(props.numberOfOutputVars, 'synch' );
    
    const [color, setColor] = useState<string>(props.ioNode.color);
    // const [output, setOutput] = useState<string>('');
    return(
        <div className = {styles.ioNodeContainer}>
            <div className = {styles.colorContainer}>
                <div className = {styles.colorBlockContainer}>
                    <div>
                        color:  
                    </div>
                    <div className = {styles.colorBlock} style = {{
                        backgroundColor : props.ioNode.color
                    }}>
                    </div>
                </div>
                
                <div>
                    <input type='color' value={props.ioNode.color} onChange={(e)=>{
                        setColor(e.target.value);
                        props.changeIoNodeColor(props.ioNode, e.target.value);
                    }} ></input>
                </div>
                
            </div>
            {props.ioNode.type === 'in' &&
                <div className={styles.outputContainer}>
                <div>
                    output
                </div>
                <div>
                    
                    <input type = 'text' onChange = {(e)=>{
                        let n = e.target.value.length;
                        if(n > props.numberOfOutputVars) return;
                        for(let i = 0; i < n; ++i){
                            if( e.target.value[i] !== '0' && e.target.value[i] !== '1' && e.target.value[i] !== 'd'){
                                return;
                            }
                        }
                        props.changeOutput(props.ioNode,e.target.value);
                    }} value = {props.ioNode.output}/>
                    {/* <input value={props.ioNode.output}  type='string'/> */}
                    {/* <select onChange = {(e)=>{
                        if(e.target.value !== props.ioNode.output){
                            props.changeOutput(props.ioNode, e.target.value);
                        }
                    }} value={props.ioNode.output} >
                        {
                            outputComb.map(c => <option key = {c}> {c} </option>)
                        }
                    </select> */}
                </div>
            </div>}
        </div>
    )
}

export default SideBar;