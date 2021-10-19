import React from "react";
import { StateNode } from "./state-diagram-interfaces";
import styles from '../../styles/stateordertable.module.scss'
import { CSSProperties } from "react-router/node_modules/@types/react";
import { stringToStringMap } from "../synthesis/interfaces";
import { useLabelMap } from "../synthesis/helperFunctions";

class StateOrderTable extends React.Component<{
    labels : string[],
    changeStateNodeOrder : (l : string[]) => void,
    labelMap? : stringToStringMap
},{
    zoomIndex : number,
    movingObjectCss : CSSProperties,
    top : number,
    labels : string[]
}>{
    
    containerRef : React.RefObject<HTMLDivElement>;
    itemHeight :  number;
    itemMargin : number;
    containerPadding : number;
    height : number;
    
    constructor(props : any){
        super(props);
        this.state = {
            zoomIndex : -1,
            movingObjectCss : {
                transform : 'scale(1.1)',
                position : 'relative',
                top : 0
            },
            top : 0,
            labels : this.props.labels
        }
        this.containerRef = React.createRef();
        this.itemHeight = 35;
        this.itemMargin = 5;
        this.containerPadding = 5;
        this.onMouseUp = this.onMouseUp.bind(this);
        this.height = this.containerPadding * 2 + this.itemHeight + this.itemMargin * 2;
        // this.scrollTop = 0;
    }
    

    resetState(){
        this.setState(old => ({
            zoomIndex : -1,
            top : 0,
            movingObjectCss : {
                ...old.movingObjectCss,
                top : 0
            }
        }))
    }    

    onMouseUp(e : React.MouseEvent<HTMLDivElement, MouseEvent>){
        if(this.state.zoomIndex === -1) return;
        let actualHeight = this.containerPadding + this.itemHeight / 2;
        // if(this.state.zoomIndex !== 0){
        actualHeight += (this.state.zoomIndex ) * (this.itemHeight + 2 * this.itemMargin);
        actualHeight += this.itemMargin;
        // }
        let currHeight = actualHeight + this.state.top;
        console.log(`actual height : ${actualHeight} curr height : ${currHeight} top : ${this.state.top}`);
        let newIndex = (currHeight - this.containerPadding) / (this.itemHeight + 2 * this.itemMargin);
        if(newIndex < 0) newIndex = 0;
        else if(newIndex >= this.state.labels.length) newIndex = this.state.labels.length - 1;
        newIndex = Math.floor(newIndex);
        let temp = [...this.state.labels]
        let t = temp[this.state.zoomIndex];
        temp[this.state.zoomIndex] = temp[newIndex];
        temp[newIndex] = t;
        // console.log(newIndex);
        // console.log(temp);
        this.resetState();
        this.setState({labels : temp})
    }

    render(){
        return(
            <div className = {styles.room}>
                <div ref = {this.containerRef} 
                    className = {styles.root}>
                    <div className = {styles.container} 
                    onMouseLeave = {(e)=>{
                        this.resetState();
                        // console.log(e);
                    }}
                    onMouseUp = {this.onMouseUp}
                    onMouseMove = {(e)=>{
                        if(this.state.zoomIndex != -1){

                            // console.log(e);

                            // if(e.nativeEvent.offsetY >= this.height){
                            //     return this.resetState();
                            // }
                            // else if(e.nativeEvent.offsetY < 0){
                            //     return this.resetState();
                            // }
                                
                            
                            this.setState(old =>({
                                movingObjectCss : {
                                    ...old.movingObjectCss,
                                    top : old.top + e.movementY 
                                },
                                top : old.top + e.movementY
                            }))
                        }
                    }}>
                        {this.state.labels.map((label, index) =>(
                            <div onMouseDown = {()=>{
                                this.setState({zoomIndex : index })
                            }} key = {label}
                            className = {styles.item }
                            style = {this.state.zoomIndex === index ? this.state.movingObjectCss : {}}
                            >
                                {useLabelMap(label, this.props.labelMap)}
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <button onClick = {()=>this.props.changeStateNodeOrder(this.state.labels)}> Confirm </button>
                </div>
            </div>
        )
    }
    
}

export default StateOrderTable;