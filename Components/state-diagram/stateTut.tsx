import React from "react";
import styles from '../../styles/statetut.module.scss';
import { calculateIONodeCenter } from "./drawingFuncitons";
import { Point, StateNode } from "./state-diagram-interfaces";

class StateTut extends React.Component<{
    createStateNodeObject : (inpCombs : string[], outNodesCount : number, 
        center : Point,radius : number, label : string, inputCombTextLength : number, 
        numberOfInputVars : number) => StateNode
    drawStateNode : (state : StateNode, canvas : React.RefObject<HTMLCanvasElement>,includeOut ? : boolean) => void
},{
    stateNode : StateNode
}>{

    canvasRef : React.RefObject<HTMLCanvasElement>;



    constructor(props : any){
        super(props);
        this.canvasRef = React.createRef();
        let inpComb = ['input']
        let outNodesCount = 1;
        let center : Point = {x : 50, y : 50}
        let radius  = 25;
        let label = 'label';
        let inputCombTextLength = 20;
        let numberOfInputVars = 1;

        let stateNode = this.props.createStateNodeObject(
            inpComb, outNodesCount,center, radius,
            label, inputCombTextLength, numberOfInputVars
        )
        stateNode.ioNodes[0].angle = 1.5 * Math.PI; 
        stateNode.ioNodes[1].angle = .5 * Math.PI;
        stateNode.ioNodes[0].center = calculateIONodeCenter(stateNode, 1.5 * Math.PI);
        stateNode.ioNodes[0].output = 'output';
        stateNode.ioNodes[1].center = calculateIONodeCenter(stateNode, .5 * Math.PI);
        this.state = {
            stateNode : stateNode
        }
    }

    componentDidMount(){
        if(!this.canvasRef.current) return;
        let context = this.canvasRef.current.getContext('2d');
        if(!context) return;

        this.props.drawStateNode(this.state.stateNode, this.canvasRef);
        let ioNode = this.state.stateNode.ioNodes[1];
        context.font = 'bold 12px serif'
        context.textAlign = 'start';
        context.fillText('connect', ioNode.center.x + ioNode.radius + 5, ioNode.center.y - 10 );
        context.fillText('incoming', ioNode.center.x + ioNode.radius + 5, ioNode.center.y );
        context.fillText('edge', ioNode.center.x + ioNode.radius + 5, ioNode.center.y + 10 );

        context.stroke();
    }

    render(){

        return(
            <div className = {styles.root}> 
                <canvas width = {130} height = {110} ref = {this.canvasRef} />
                <div className = {styles.textContainer}>
                    Use 'd' to denote don't care conditions
                </div>
            </div>
        )
    }
}

export default StateTut;