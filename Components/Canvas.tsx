import React from 'react'
import {StateNode, Point, IONode, Edge} from './canvasInterfaces'
import {checkInsideCircle, calculateIONodeCenter,
     clearCircle, drawCircle, checkCollision, createStateNodeObject, pointToString} from './drawingFuncitons'
import {canvasConfig, defalutIONodeConfig, defaultStateNodeConfig} from '../defaultConfigs'
interface Props{

}

interface State{

}

class Canvas extends React.Component<Props, State>{

    nodeCanvasRef: React.RefObject<HTMLCanvasElement>;
    edgeCanvasRef : React.RefObject<HTMLCanvasElement>;
    tempCanvasRef : React.RefObject<HTMLCanvasElement>;
    stateNodes : StateNode[];
    selectedNode : IONode | StateNode | null;
    selectedIndex : number;
    edges : Edge[];
    tempEdgePoints : Point[];
    edgeStartNode : IONode | null
    constructor(props : Props){
        super(props);
        this.nodeCanvasRef = React.createRef();
        this.edgeCanvasRef = React.createRef();
        this.tempCanvasRef = React.createRef();
        this.stateNodes = [];
        this.selectedNode = null;
        this.selectedIndex = -1;
        this.edges = [];
        this.tempEdgePoints = []
        this.edgeStartNode = null;
    }

    checkIfStateNodeContainsEdge(state : StateNode) : boolean{
        for(let i = 0; i < state.ioNodes.length; ++i){
            if(state.ioNodes[i].edges.length > 0) return false;
        }
        return true;
    }

    checkCollisionWithStateNodes(){

    }

    translateStateNode(stateNode : StateNode,x : number, y : number){
        let context = this.nodeCanvasRef.current?.getContext('2d');
        if(context == null) return;
        clearCircle(context,stateNode.center, stateNode.radius + 2 * stateNode.gap);
        stateNode.center.x += x;
        stateNode.center.y += y;
        for(let i = 0; i < stateNode.ioNodes.length; ++i){
            let ioNode = stateNode.ioNodes[i];
            ioNode.center.x += x;
            ioNode.center.y += y;
        }
        this.drawStateNode(stateNode);
    }

    createEdge(from : IONode, to : IONode) : Edge{
            let s = new Set<string>();
            this.tempEdgePoints = this.tempEdgePoints.filter(p =>{
                return !(checkInsideCircle(to.center,to.radius,p)
                || checkInsideCircle(from.center, from.radius,p))
            })
            this.tempEdgePoints.forEach(p=>{
                s.add(pointToString(p));
            })
            this.tempEdgePoints.splice(0, 0, from.center);
            this.tempEdgePoints.push(to.center);
            let edge : Edge = {
                from : from,
                to : to,
                points : this.tempEdgePoints,
                pointsSet : s,
                color : 'darkgrey'
            }
            return edge;
            
    }

    focusOnNode(center : Point, radius : number, fillColor : string){
        let context = this.nodeCanvasRef.current?.getContext('2d');
        if(context == null) return;
        clearCircle(context, center, radius + context.lineWidth);
        drawCircle(context, center, radius, 'blue',fillColor);
    }

    checkInsideNode(testPoint : Point) :
    { entity : StateNode | IONode | null , index : number}
    {
        for(let i = 0; i < this.stateNodes.length; ++i){
            let stateNode = this.stateNodes[i];
            if(checkInsideCircle(stateNode.center, stateNode.radius, testPoint)){
                return {entity : stateNode, index : i};
            }
            for(let j = 0; j < stateNode.ioNodes.length; ++j){
                let ioNode = stateNode.ioNodes[j];
                if(checkInsideCircle(ioNode.center, ioNode.radius, testPoint)){
                    return { entity : ioNode, index : j};
                }
            }
        }
        return {entity : null, index : -1}
    }

    checkInsideEdge(testPoint : Point) : { entity : Edge | null, index : number}{
        for(let i = 0; i < this.edges.length; ++i){
            
            let edge = this.edges[i];
            if(edge.pointsSet.has(pointToString(testPoint))){
                return {
                    entity : edge,
                    index : i
                }
            }
        }
        return { entity : null, index : -1}
    }

    checkInside(testPoint : Point) : { entity : StateNode | IONode | null | Edge , index : number} {
        
        let selected = this.checkInsideNode(testPoint);
        if(selected.entity === null){
            return this.checkInsideEdge(testPoint);
            
        }
        return selected;
    }

    nodeCanvasOnMouseDown(e : MouseEvent){

        if(this.nodeCanvasRef.current === null) return;
        let context = this.nodeCanvasRef.current.getContext('2d');
        if(context == null) return;

        let testPoint : Point = {
            x : e.offsetX,
            y : e.offsetY
        }

        let selected =  this.checkInside(testPoint);
        if(selected.entity == null) return;
        if('center' in selected.entity){
            this.focusOnNode(selected.entity.center, selected.entity.radius, selected.entity.color);
            this.selectedNode = selected.entity;
            if('type' in this.selectedNode){
                this.edgeStartNode = this.selectedNode;
                // this.tempEdgePoints.push(testPoint);
            }
        }
        this.selectedIndex = selected.index;

        

    }

    nodeCanvasMouseUp(e : MouseEvent){
        if(this.selectedNode != null){
            let context = this.nodeCanvasRef.current!.getContext('2d');
            if(context === null) return;
            clearCircle(context, this.selectedNode.center, this.selectedNode.radius + context.lineWidth);
            drawCircle(context, this.selectedNode.center, this.selectedNode.radius, 'black', this.selectedNode.color);
            this.selectedNode = null;
        }
    }

    nodeCanvasMouseMove(e : MouseEvent, enableRotation : boolean){
        if(this.selectedNode === null) return;
        if('type' in this.selectedNode && enableRotation){
            let stateNode = this.selectedNode.originNode;
            let deltaY =  e.offsetY - stateNode.center.y;
            let deltaX =  e.offsetX - stateNode.center.x;
            let angle = Math.atan(deltaY / deltaX);
            if((deltaX < 0 && deltaY < 0) || (deltaX < 0 && deltaY >= 0)) angle += Math.PI;
            if(deltaX >= 0 && deltaY < 0) angle += Math.PI * 2;
            let diff = (20 * Math.PI) / 180;

            let n = stateNode.ioNodes.length;
            for(let i = 0; i < n; ++i){
                if(i == this.selectedIndex) continue;
                let ioNode = stateNode.ioNodes[i];
                if(checkCollision(ioNode.angle,angle, diff)) return;
            }

            let i = (this.selectedIndex + 1 ) ;
            let selected = this.selectedIndex;
            while( i < n && stateNode.ioNodes[i].angle < stateNode.ioNodes[selected].angle){
                let t = stateNode.ioNodes[i];
                stateNode.ioNodes[i] = stateNode.ioNodes[selected];
                stateNode.ioNodes[selected] = t;
                selected = i++;
            }
            i = (this.selectedIndex - 1) ;
            while(i >= 0 && stateNode.ioNodes[i].angle > stateNode.ioNodes[selected].angle){
                let t = stateNode.ioNodes[i];
                stateNode.ioNodes[i] = stateNode.ioNodes[selected];
                stateNode.ioNodes[selected] = t;
                selected = i--;
            }
            this.selectedIndex = selected;
            
            let context = this.nodeCanvasRef.current?.getContext('2d');
            if(context === null) return;

            if(context != null){
                let newCenter = calculateIONodeCenter(stateNode, angle);
                clearCircle(context, this.selectedNode.center,
                    this.selectedNode.radius + context.lineWidth);
                this.selectedNode.center = newCenter;
                this.selectedNode.angle = angle;
                drawCircle(context, newCenter, this.selectedNode.radius, 'blue',
                    this.selectedNode.color);
            }
        }
        else if('ioNodes' in this.selectedNode){
            if(this.checkIfStateNodeContainsEdge(this.selectedNode)){
                this.translateStateNode(this.selectedNode, e.movementX, e.movementY);
            }
        }
    }

    tempCanvasMouseMove(e : MouseEvent){
        if(this.edgeStartNode != null){
            let tempContext = this.tempCanvasRef.current?.getContext('2d');
            if(tempContext == null) return;
            tempContext.lineTo(e.offsetX, e.offsetY);
            this.tempEdgePoints.push({x : e.offsetX, y : e.offsetY});
            tempContext.stroke();
        }
    }

    drawEdge(edge : Edge){
        let edgeContext = this.edgeCanvasRef.current?.getContext('2d');
        if(edgeContext == null) return;
        if(edge.points.length === 0) return;
        // drawCircle(edgeContext, edge.points[0],2.5,'transparent',edge.color);
        // edgeContext.fillStyle = ''

        edgeContext.strokeStyle = edge.color;
        edgeContext.beginPath();
        edgeContext.moveTo(edge.points[0].x, edge.points[0].y);
        for(let i = 1; i < edge.points.length; ++i){
            edgeContext.lineTo(edge.points[i].x, edge.points[i].y);
        }
        edgeContext.stroke();
        
        edgeContext.beginPath();
        let p = edge.points[0];
        edgeContext.fillStyle = edge.from.color;
        edgeContext.arc(p.x, p.y, 4, 0, Math.PI * 2);
        edgeContext.fill();
        edgeContext.stroke();
        edgeContext.beginPath();
        p = edge.points[edge.points.length - 1];
        edgeContext.fillStyle = edge.to.color;
        edgeContext.arc(p.x, p.y, 4, 0, Math.PI * 2);
        edgeContext.fill();
        edgeContext.stroke();

        // edgeContext.beginPath();
    }

    tempCanvasMouseUp(e : MouseEvent){
        if(this.edgeStartNode != null){
            let tempCanvas = this.tempCanvasRef.current;
            if(tempCanvas == null) return;
            let tempContext = tempCanvas.getContext('2d');
            if(tempContext == null || this.tempEdgePoints.length === 0) return;
            tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

            let testPoint = {
                x : e.offsetX, 
                y : e.offsetY
            }

            let selected = this.checkInsideNode(testPoint);
            if(selected.entity != null && 'type' in selected.entity
                && this.edgeStartNode.originNode !== selected.entity.originNode){
                    let from = this.edgeStartNode;
                    let to = selected.entity;
                    let edge = this.createEdge(from, to);
                    this.drawEdge(edge);
                    this.edges.push(edge);
                    from.edges.push(edge);
                    to.edges.push(edge);
            }
            this.edgeStartNode = null;
            this.tempEdgePoints = []
        }
    }

    tempCanvasMouseDown(e : MouseEvent){
        if(this.edgeStartNode != null){
            let tempContext = this.tempCanvasRef.current?.getContext('2d');
            if(tempContext == null) return;
            tempContext.beginPath();
            tempContext.strokeStyle = 'black';

        }
    }

    drawStateNode(state : StateNode){
        let context = this.nodeCanvasRef.current?.getContext('2d');
        if(context != null){
            context.lineWidth = 1.5;
            drawCircle(context, state.center, state.radius, 'black', state.color);
            state.ioNodes.forEach(ioNode => {
                drawCircle(context!, ioNode.center, ioNode.radius, 'black', ioNode.color);
            })
        }
    }

    componentDidMount(){ 
        const nodeCanvas = this.nodeCanvasRef.current;
        const edgeCanvas = this.edgeCanvasRef.current;
        const tempCanvas = this.tempCanvasRef.current;

        if(nodeCanvas == null || edgeCanvas == null || tempCanvas == null) return;
        let nodeContext = nodeCanvas.getContext('2d');
        let edgeContext = edgeCanvas.getContext('2d');
        let tempContext = tempCanvas.getContext('2d');

        nodeCanvas.height = nodeCanvas.clientHeight;
        nodeCanvas.width = nodeCanvas.clientWidth;
        edgeCanvas.height = edgeCanvas.clientHeight;
        edgeCanvas.width = edgeCanvas.clientWidth;
        tempCanvas.height = tempCanvas.clientHeight;
        tempCanvas.width = tempCanvas.clientWidth;


        if(nodeContext == null || edgeContext == null || tempContext == null) return;

        edgeContext.lineWidth = 3;
        

        let stateNode = createStateNodeObject(4, 3, {x :250, y : 250});
        let stateNode2 = createStateNodeObject(2, 3, {x : 100, y : 100})
        this.stateNodes.push(stateNode);
        this.stateNodes.push(stateNode2);
        this.stateNodes.forEach(s => this.drawStateNode(s))

        tempCanvas.addEventListener('mousedown', e=>{
            this.nodeCanvasOnMouseDown(e);
            this.tempCanvasMouseDown(e);
        })

        tempCanvas.addEventListener('mouseup', e=>{
            this.nodeCanvasMouseUp(e);
            this.tempCanvasMouseUp(e);
        })

        tempCanvas.addEventListener('mousemove', e=>{
            console.log(e);
            this.nodeCanvasMouseMove(e, false);
            this.tempCanvasMouseMove(e);
        })
    }

    render() : React.ReactNode{
        return (
            <div>
                <canvas ref = {this.nodeCanvasRef} style={{
                    width : canvasConfig.width, 
                    height : canvasConfig.height, 
                    border : "solid",
                    borderColor : "red", 
                    borderWidth : "1px",
                    position : "absolute"
                }} />
                <canvas ref={this.edgeCanvasRef} style={{
                    width : canvasConfig.width, 
                    height : canvasConfig.height,
                    border : "solid",
                    borderColor : "red", 
                    borderWidth : "1px",
                    position : "absolute",
                }} />
                <canvas ref={this.tempCanvasRef} style={{
                    width : canvasConfig.width, 
                    height : canvasConfig.height,
                    border : "solid",
                    borderColor : "red", 
                    borderWidth : "1px",
                    position : "absolute",
                    zIndex : 10
                }} />
            </div>
        )
    }
}

export default Canvas;