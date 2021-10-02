import React from 'react'
import styles from '../styles/design.module.scss'
import {ImCancelCircle} from 'react-icons/im'
import { IONode, StateNode } from './canvasInterfaces';
import {BsArrowDown, BsArrowDownShort, BsArrowUp, BsArrowUpShort} from 'react-icons/bs'

class SideBar extends React.Component<{
    toggleSideBar : ()=>void,
    stateNode : StateNode | null,
    ioNode : IONode | null,
    addIoNodeWithStateChange : (stateNode : StateNode, type : 'in' | 'out')=>boolean,
    changeStateNodeRadius : (state : StateNode, r : number) =>void
}, {}>{

    render() : React.ReactNode{
        return(
            <div className = {styles.sideBar}>
                <div className = {styles.crossIconContainer}>
                    <div>
                        <ImCancelCircle className={styles.crossIcon} onClick={this.props.toggleSideBar} />
                    </div>
                </div>
                {
                    this.props.ioNode && <IONodeRender ioNode={this.props.ioNode} />
                }
                {
                    this.props.stateNode && <StateNodeRender changeStateNodeRadius = {this.props.changeStateNodeRadius} addIoNodeWithStateChange = {this.props.addIoNodeWithStateChange} stateNode={this.props.stateNode} />
                }
            </div>
        )
    }
}

const StateNodeRender : React.FC<{
    stateNode : StateNode
    addIoNodeWithStateChange : (stateNode : StateNode, type : 'in' | 'out')=>boolean
    changeStateNodeRadius : (state : StateNode, r : number) =>void
    
}> = (props)=>{

    let inNodeC = props.stateNode.ioNodes.filter(n => n.type == 'in').length;
    let outNodeC = props.stateNode.ioNodes.filter(n => n.type == 'out').length;
    return(
        <div className = {styles.stateNodeContainer}>
            <div className = {styles.inNodeContainer}>
                <div>
                    inNode : {inNodeC}

                </div>
                <div className = {styles.arrowContainer}>
                    <BsArrowUp onClick={()=>{
                        props.addIoNodeWithStateChange(props.stateNode, 'in');
                    }} className = {styles.arrowIcon} />
                    <BsArrowDown className = {styles.arrowIcon} />

                </div>
            </div>
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
                        backgroundColor : props.stateNode.color
                    }}>
                    </div>
                </div>
                
                <div>
                    <input type='color' value={props.stateNode.color} ></input>
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
    ioNode : IONode
}> = (props)=>{
    return(
        <div className = {styles.ioNodeContainer}>
            type : {props.ioNode.type}
        </div>
    )
}

export default SideBar;