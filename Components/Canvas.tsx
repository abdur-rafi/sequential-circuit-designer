import React from 'react'
import {StateNode, Point, IONode, Edge} from './canvasInterfaces'
import {checkInsideCircle, calculateIONodeCenter,
     clearCircle, drawCircle, checkCollision, createStateNodeObject, 
     pointToString, createEdge, doRectanglesOverlap, getCornerPoints, clearCanvas} from './drawingFuncitons'
import styles from '../styles/design.module.scss'
import SideBar from './SideBar';
import TopBar from './topBar';

interface Props{

}

interface State{
    showSideBar : boolean
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
    mouseMode : 'addNode' | 'drag' | 'edge' | 'select';
    tempStateNode : StateNode | null;

    constructor(props : Props){
        super(props);
        this.nodeCanvasRef = React.createRef();
        this.edgeCanvasRef = React.createRef();
        this.tempCanvasRef = React.createRef();

        this.stateNodes = [];
        this.edges = [];


        this.selectedNode = null;
        this.selectedIndex = -1;
        this.tempEdgePoints = []
        this.edgeStartNode = null;
        this.tempStateNode = null;

        this.AddNode = this.AddNode.bind(this);
        this.state = {
            showSideBar : true
        }
        this.toggleSideBar = this.toggleSideBar.bind(this);
        this.toggleGrabMode = this.toggleGrabMode.bind(this);
        this.mouseMode = 'edge';

    }

    checkIfStateNodeContainsEdge(state : StateNode) : boolean{
        for(let i = 0; i < state.ioNodes.length; ++i){
            if(state.ioNodes[i].edges.length > 0) return false;
        }
        return true;
    }

    checkCollisionWithStateNodes(l1 : Point, r1 : Point) : boolean{
        for(let i = 0; i < this.stateNodes.length; ++i){
            let stateNode = this.stateNodes[i];
            let p = getCornerPoints(stateNode);
            console.log(p);
            if(doRectanglesOverlap(l1, r1, p.l, p.r)){
                return true;
            }
        }
        return false;
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

    drawEdge(edge : Edge){
        let edgeContext = this.edgeCanvasRef.current?.getContext('2d');
        if(edgeContext == null) return;
        if(edge.points.length === 0) return;
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

    drawStateNode(state : StateNode, context? : CanvasRenderingContext2D | null){
        if(context == undefined)
            context = this.nodeCanvasRef.current?.getContext('2d');
        if(context != null){
            context.lineWidth = 1.5;
            drawCircle(context, state.center, state.radius, 'black', state.color);
            state.ioNodes.forEach(ioNode => {
                drawCircle(context!, ioNode.center, ioNode.radius, 'black', ioNode.color);
            })
        }
    }

    toggleGrabMode(){
        if(this.mouseMode === 'drag'){
            this.mouseMode = 'edge';
        }
        else{
            this.mouseMode = 'drag';
            
        }
        this.resetModeVars();
    }

    rotateIoNode(selectedNode : IONode, e : MouseEvent){
        let stateNode = selectedNode.originNode;
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
            clearCircle(context, selectedNode.center,
                selectedNode.radius + context.lineWidth);
            selectedNode.center = newCenter;
            selectedNode.angle = angle;
            drawCircle(context, newCenter, selectedNode.radius, 'blue',
                selectedNode.color);
        }

    }


    resetModeVars(){
        this.selectedIndex = -1;
        this.selectedNode = null;
        this.tempStateNode = null;
        this.tempEdgePoints = [];
        this.edgeStartNode = null;
    }

    AddNode(){
        this.mouseMode = 'addNode';
    }

    toggleSideBar(){
        this.setState(old=>({
            showSideBar : !old.showSideBar
        }))
    }


    nodeCanvasOnMouseDown(e : MouseEvent){
        if(this.mouseMode === 'addNode'){
            return;
        }
        else if(this.mouseMode === 'drag' || this.mouseMode === 'edge' || this.mouseMode === 'select'){
            let testPoint : Point = {
                x : e.offsetX,
                y : e.offsetY
            }
            let selected =  this.checkInside(testPoint);
            if(selected.entity == null) return;

            if('from' in selected.entity){

            }
            else if('center' in selected.entity){
                this.selectedNode = selected.entity;
                this.selectedIndex = selected.index;

                if(this.mouseMode == 'edge' && 'type' in selected.entity){
                    this.edgeStartNode = selected.entity;
                }   
                if(this.mouseMode === 'drag' || this.mouseMode === 'select'){
                    this.focusOnNode(selected.entity.center, selected.entity.radius, selected.entity.color);
                }
            }

            // if('center' in selected.entity){
            //     this.focusOnNode(selected.entity.center, selected.entity.radius, selected.entity.color);
            //     this.selectedNode = selected.entity;
            //     if('type' in this.selectedNode){
            //         this.edgeStartNode = this.selectedNode;
            //     }
            // }
            // this.selectedIndex = selected.index;    
        }
        // if(this.mouseMode === 'addNode') return;
        // if(this.nodeCanvasRef.current === null) return;
        // let context = this.nodeCanvasRef.current.getContext('2d');
        // if(context == null) return;
        
        // let testPoint : Point = {
        //     x : e.offsetX,
        //     y : e.offsetY
        // }

        // let selected =  this.checkInside(testPoint);
        // if(selected.entity == null) return;
        // if('center' in selected.entity){
        //     this.focusOnNode(selected.entity.center, selected.entity.radius, selected.entity.color);
        //     this.selectedNode = selected.entity;
        //     if('type' in this.selectedNode){
        //         this.edgeStartNode = this.selectedNode;
        //     }
        // }
        // this.selectedIndex = selected.index;        

    }

    nodeCanvasMouseUp(e : MouseEvent){
        if(this.mouseMode === 'addNode' || this.mouseMode === 'select' || this.mouseMode === 'edge'){
            return;
        }
        else if(this.mouseMode === 'drag'){
            if(this.selectedNode != null){
                let context = this.nodeCanvasRef.current!.getContext('2d');
                if(context === null) return;
                clearCircle(context, this.selectedNode.center, this.selectedNode.radius + context.lineWidth);
                drawCircle(context, this.selectedNode.center, this.selectedNode.radius, 'black', this.selectedNode.color);
                this.selectedNode = null;
                this.selectedIndex = -1;
            }
        }
    }


    nodeCanvasMouseMove(e : MouseEvent){

        if(this.mouseMode === 'addNode' || this.mouseMode === 'select' || this.mouseMode === 'edge')
            return;
        else if(this.mouseMode === 'drag'){
            if(this.selectedNode === null) return;
            if('type' in this.selectedNode){
                this.rotateIoNode(this.selectedNode, e);
            }
            else if('ioNodes' in this.selectedNode){
                if(this.checkIfStateNodeContainsEdge(this.selectedNode)){
                    this.translateStateNode(this.selectedNode, e.movementX, e.movementY);
                }
            }
        }
    }

    tempCanvasMouseMove(e : MouseEvent){
        if(this.mouseMode === 'addNode'){
            let state = createStateNodeObject(0, 0, {x : e.offsetX, y : e.offsetY});
            let canvas = this.tempCanvasRef.current;
            let context = canvas!.getContext('2d');
            clearCanvas(this.tempCanvasRef);
            this.drawStateNode(state, context);
            this.tempStateNode = state;
            return;
            
        }
        else if(this.mouseMode === 'drag' || this.mouseMode === 'select'){
            return;
        }
        else if(this.mouseMode === 'edge'){
            if(this.edgeStartNode != null){
                let tempContext = this.tempCanvasRef.current?.getContext('2d');
                if(tempContext == null) return;
                tempContext.lineTo(e.offsetX, e.offsetY);
                this.tempEdgePoints.push({x : e.offsetX, y : e.offsetY});
                tempContext.stroke();
            }
        }
        
    }

    tempCanvasMouseUp(e : MouseEvent){ 
        if(this.mouseMode === 'addNode' || this.mouseMode === 'drag' || this.mouseMode === 'select'){
            return;
        }
        else if(this.mouseMode === 'edge'){
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
                        let edge = createEdge(from, to, this.tempEdgePoints);
                        this.drawEdge(edge);
                        this.edges.push(edge);
                        from.edges.push(edge);
                        to.edges.push(edge);
                }
                this.edgeStartNode = null;
                this.tempEdgePoints = []
            }

        }
        
    }
    

    tempCanvasMouseDown(e : MouseEvent){
        if(this.mouseMode === 'addNode'){
            if(this.tempStateNode){
                let p = getCornerPoints(this.tempStateNode);
                if(this.checkCollisionWithStateNodes(p.l, p.r)){
                    return;
                }
                this.stateNodes.push(this.tempStateNode);
                clearCanvas(this.tempCanvasRef);
                this.drawStateNode(this.tempStateNode);
                this.tempStateNode = null;
                this.mouseMode = 'edge';
                return;
            }
        }
        else if(this.mouseMode === 'drag' || this.mouseMode === 'select'){
            return;
        }
        else if(this.mouseMode === 'edge'){
            if(this.edgeStartNode != null){
                console.log(e);
                console.log(this.stateNodes);
                let tempContext = this.tempCanvasRef.current?.getContext('2d');
                if(tempContext == null) return;
                tempContext.beginPath();
                tempContext.strokeStyle = 'black';
    
            }
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
            // console.log(e);
            this.nodeCanvasMouseMove(e);
            this.tempCanvasMouseMove(e);
        })
    }

    

    render() : React.ReactNode{
        return (
            <div className={styles.root}>
                <div className={styles.topBarContainer}>
                    <TopBar toggleGrabMode={this.toggleGrabMode}/>
                </div>
                <div className={styles.canvasContainer}>
                    <canvas ref = {this.nodeCanvasRef} className={styles.canvas} />
                    <canvas ref={this.edgeCanvasRef} className={styles.canvas} />
                    <canvas ref={this.tempCanvasRef} className={styles.canvas} style={{
                        zIndex : 5
                    }} />
                </div>
                <div onClick={this.AddNode} className={styles.addNodeButtonContainer}>
                    <button className={styles.addNodeButton}>Add Node</button>
                </div>
                {!this.state.showSideBar && <div className={styles.menuContainer}>
                    <button onClick = {this.toggleSideBar} className = {styles.menu}> Menu</button>
                </div>}
                
                {
                    this.state.showSideBar &&
                <div className = {styles.sideBarContainer}>
                    <SideBar toggleSideBar = {this.toggleSideBar} />
                </div>}
            </div>
            
        )
    }
}

export default Canvas;