import React from 'react'
import {StateNode, Point, IONode, Edge, MouseMode} from './canvasInterfaces'
import {checkInsideCircle, calculateIONodeCenter,
     clearCircle, drawCircle, checkCollision, createStateNodeObject, 
     pointToString, createEdge, doRectanglesOverlap, getCornerPoints, clearCanvas, createIONodeObject, calculateDelTheta, addIoNode} from './drawingFuncitons'
import styles from '../styles/design.module.scss'
import SideBar from './SideBar';
import TopBar from './topBar';
import { defalutIONodeConfig } from '../defaultConfigs';


// From stackoverflow
class StringIdGenerator {
    _chars : string;
    _nextId : [number];
    constructor(chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
        this._chars = chars;
        this._nextId = [0];
    }
    next() {
        const r = [];
        for (const char of this._nextId) {
            r.unshift(this._chars[char]);
        }
        this._increment();
        return r.join('');
    }
  
    _increment() {
        for (let i = 0; i < this._nextId.length; i++) {
            const val = ++this._nextId[i];
            if (val >= this._chars.length) {
            this._nextId[i] = 0;
            } else {
            return;
            }
        }
        this._nextId.push(0);
    }
  
    *[Symbol.iterator]() {
        while (true) {
            yield this.next();
        }
    }
  }

interface Props{

}

interface State{
    showSideBar : boolean,
    stateNodeToSideBar : StateNode | null,
    ioNodeToSideBar : IONode | null,
    mouseMode : MouseMode,
    numberOfInpVars : number
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
    edgeStartNode : IONode | null;
    tempStateNode : StateNode | null;
    stateLabels : StringIdGenerator;
    nextLabel : string;
    tempStateNodeCenter : Point;
    inputCombTextLength : number;


    constructor(props : Props){
        super(props);
        this.nodeCanvasRef = React.createRef();
        this.edgeCanvasRef = React.createRef();
        this.tempCanvasRef = React.createRef();

        this.stateNodes = [];
        this.edges = [];
        this.stateLabels = new StringIdGenerator();

        this.selectedNode = null;
        this.selectedIndex = -1;
        this.tempEdgePoints = []
        this.edgeStartNode = null;
        this.tempStateNode = null;
        this.tempStateNodeCenter = {
            x : -1, y : -1
        }
        this.inputCombTextLength = 0;
        this.nextLabel = this.stateLabels.next();

        this.state = {
            showSideBar : false,
            ioNodeToSideBar : null,
            stateNodeToSideBar : null,
            mouseMode : 'edge',
            numberOfInpVars : 2
        }

        this.changeNumberOfInputVars = this.changeNumberOfInputVars.bind(this);
        this.toggleSideBar = this.toggleSideBar.bind(this);
        this.setMouseMode = this.setMouseMode.bind(this);
        this.setMouseMode = this.setMouseMode.bind(this);
        this.addIoNodeWithStateChange = this.addIoNodeWithStateChange.bind(this);
        this.changeStateNodeRadius = this.changeStateNodeRadius.bind(this);
    }

    drawLabel(center : Point, label : string, context : CanvasRenderingContext2D | null | undefined){
        if(context == null)
            context = this.nodeCanvasRef.current?.getContext('2d');
        if(!context) return;
        context.font = '24px serif'
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(label, center.x, center.y);
    }

    changeNumberOfInputVars(vars : number){
        this.setState({
            numberOfInpVars : vars
        })
    }

    changeStateNodeRadius(stateNode : StateNode, radius : number){
        if(this.checkIfStateNodeContainsEdge(stateNode)) return;
        this.eraseStateNode(stateNode, this.nodeCanvasRef);
        let r = radius + stateNode.gap + stateNode.ioNodeDiameter / 2;
        for(let i = 0; i < stateNode.ioNodes.length; ++i){
            let ioNode = stateNode.ioNodes[i];
            ioNode.center = {
                x : r * Math.cos(ioNode.angle) + stateNode.center.x,
                y : r * Math.sin(ioNode.angle) + stateNode.center.y
            }
        }
        stateNode.radius = radius;
        this.drawStateNode(stateNode, this.nodeCanvasRef); 
        this.setState({
            stateNodeToSideBar : stateNode
        })
    }

    addIoNodeWithStateChange(stateNode : StateNode, type : 'in' | 'out') : boolean{
        let newIoNode = addIoNode(stateNode, type);
        
        if(newIoNode != null){
            this.setState({
                stateNodeToSideBar : stateNode, 
                ioNodeToSideBar : null
            })
        }
        let context = this.nodeCanvasRef.current?.getContext('2d');
        if(context  != null && newIoNode != null){
            drawCircle(context,newIoNode.center, newIoNode?.radius, 'black', newIoNode.color);
            
        }
        return newIoNode != null;
    }

    setMouseMode(mode : MouseMode){
        this.resetModeVars();
        this.setState(old=>({
            mouseMode : mode,
            showSideBar : false,
            ioNodeToSideBar : null,
            stateNodeToSideBar : null
        }))
    }

    checkIfStateNodeContainsEdge(state : StateNode) : boolean{
        for(let i = 0; i < state.ioNodes.length; ++i){
            if(state.ioNodes[i].edges.length > 0) return true;
        }
        return false;
    }

    checkCollisionWithStateNodes(l1 : Point, r1 : Point , stateNodeP? : StateNode) : boolean{
        for(let i = 0; i < this.stateNodes.length; ++i){
            let stateNode = this.stateNodes[i];
            if(stateNode === stateNodeP) continue; 
            let p = getCornerPoints(stateNode);
            console.log(p);
            if(doRectanglesOverlap(l1, r1, p.l, p.r)){
                return true;
            }
        }
        return false;
    }

    translateStateNode(stateNode : StateNode,x : number, y : number, canvas : React.RefObject<HTMLCanvasElement>){
        // this.eraseStateNode(stateNode, this.tempCanvasRef);
        // clearCanvas(canvas);
        stateNode.center.x += x;
        stateNode.center.y += y;
        for(let i = 0; i < stateNode.ioNodes.length; ++i){
            let ioNode = stateNode.ioNodes[i];
            ioNode.center.x += x;
            ioNode.center.y += y;
        }
        this.drawStateNode(stateNode, canvas);
        // this.focusOnNode(stateNode.center, stateNode.radius, stateNode.color,stateNode.label);
    }


    focusOnNode(center : Point, radius : number, fillColor : string, label? : string){
        let context = this.nodeCanvasRef.current?.getContext('2d');
        if(context == null) return;
        clearCircle(context, center, radius + context.lineWidth);
        drawCircle(context, center, radius, 'blue',fillColor);
        if(label)
            this.drawLabel(center, label, context);
        
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

    drawInputLabel(ioNode : IONode, canvas : React.RefObject<HTMLCanvasElement>){
        let context = canvas.current?.getContext('2d');
        if(!context) return;
        context!.font = 'bold ' + defalutIONodeConfig.inputLabelSize + 'px serif';
        context!.fillStyle = 'black';
        context!.textAlign = 'start';
        context!.textBaseline = 'middle';
        let b = (ioNode.angle > Math.PI / 2 && ioNode.angle < Math.PI * 1.5);
        context!.direction = b ? 'rtl' : 'ltr'; 
        context?.fillText(ioNode.inputComb, ioNode.center.x + (b ? -defalutIONodeConfig.inputLabelGap : defalutIONodeConfig.inputLabelGap), ioNode.center.y);
        
    }

    drawStateNode(state : StateNode, canvas : React.RefObject<HTMLCanvasElement>){
        let context = canvas.current?.getContext('2d');
        if(!context) return;
        if(context != null){
            context.lineWidth = 1.5;
            drawCircle(context, state.center, state.radius, 'black', state.color);
            state.ioNodes.forEach(ioNode => {
                drawCircle(context!, ioNode.center, ioNode.radius, 'black', ioNode.color);
                if(ioNode.type === 'in')
                    this.drawInputLabel(ioNode, canvas);
                // context?.save();
                // context!.fillStyle = 'black';
                // context?.translate(state.center.x, state.center.y);
                // context?.rotate(ioNode.angle);
                // context!.font = 'bold 10px serif';
                // context!.textAlign = 'start';
                // context!.textBaseline = 'middle';
                // context!.direction = 'ltr';
                // context?.fillText('0000' ,state.radius + 20, 0);
                // context?.restore();
            })
            this.drawLabel(state.center, state.label , context);
        }
    }

    calculateInputTextRectangle(ioNode : IONode) : {
        l1 : Point, r1 : Point
    }
    {
        let fSize = defalutIONodeConfig.inputLabelSize;
        let x1 = ioNode.center.x;
        let y1 = ioNode.center.y - fSize / 2;
        let w = ioNode.radius + ioNode.originNode.inputCombTextLength + defalutIONodeConfig.inputLabelGap;
        if(ioNode.angle > Math.PI * .5 && ioNode.angle < Math.PI * 1.5){
            return({
                l1 : {
                    x : x1 - w,
                    y : y1
                },
                r1 : {
                    x : x1,
                    y : y1 + fSize 
                }
            })
            // w = -w;
        }
        else{
            return({
                r1 : {
                    x : x1 + w,
                    y : y1 + fSize
                },
                l1 : {
                    x : x1,
                    y : y1 
                }
            })
        }
        // context.fillStyle = 'red';
        // context.clearRect(x1, y1,w, fSize);
        // context.fill();
    }


    rotateIoNode(selectedNode : IONode, e : MouseEvent){
        let stateNode = selectedNode.originNode;
        let deltaY =  e.offsetY - stateNode.center.y;
        let deltaX =  e.offsetX - stateNode.center.x;
        let angle = Math.atan(deltaY / deltaX);
        if((deltaX < 0 && deltaY < 0) || (deltaX < 0 && deltaY >= 0)) angle += Math.PI;
        if(deltaX >= 0 && deltaY < 0) angle += Math.PI * 2;
        let diff = (20 * Math.PI) / 180;
        diff = calculateDelTheta(selectedNode) / 2;
        let n = stateNode.ioNodes.length;
        let rect1 = this.calculateInputTextRectangle(createIONodeObject(stateNode, angle,'in', '',''));
        for(let i = 0; i < n; ++i){
            if(i == this.selectedIndex) continue;
            let ioNode = stateNode.ioNodes[i];
            if(checkCollision(ioNode.angle,angle, diff)) return;
            let rect2 = this.calculateInputTextRectangle(ioNode);
            if(doRectanglesOverlap(rect1.l1, rect1.r1, rect2.l1, rect2.r1)) return;
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
        if(context == null) return;
        
        let newCenter = calculateIONodeCenter(stateNode, angle);
        this.eraseIONode(selectedNode, this.nodeCanvasRef);
        selectedNode.center = newCenter;
        selectedNode.angle = angle;
        drawCircle(context, newCenter, selectedNode.radius, 'blue',
                selectedNode.color);
        
        let ioNode = selectedNode;
        this.drawInputLabel(ioNode, this.nodeCanvasRef);
        // context!.font = 'bold 10px serif';
        // context!.fillStyle = 'black';
        // context!.textAlign = 'start';
        // context!.textBaseline = 'middle';
        // let b = (ioNode.angle > Math.PI / 2 && ioNode.angle < Math.PI * 1.5);
        // context!.direction = b ? 'rtl' : 'ltr'; 
        // context?.fillText('0000', ioNode.center.x + (b ? -defalutIONodeConfig.inputLabelGap : defalutIONodeConfig.inputLabelGap), ioNode.center.y);
    }


    resetModeVars(){
        if(this.selectedNode ){
            let label;
            if('label' in this.selectedNode)
                label = this.selectedNode.label;
            this.removeFocusCircle(this.selectedNode,label);
        }
        this.selectedIndex = -1;
        this.selectedNode = null;
        this.tempStateNode = null;
        this.tempEdgePoints = [];
        this.edgeStartNode = null;
    }


    toggleSideBar(){
        this.setState(old=>({
            showSideBar : !old.showSideBar
        }))
    }

    

    removeFocusCircle(node : StateNode | IONode, label? : string){
        let context = this.nodeCanvasRef.current?.getContext('2d');
        if(context == null) 
            return;
        clearCircle(context, node.center, node.radius + context.lineWidth);
        drawCircle(context, node.center, node.radius, 'black', node.color);
        if(label){
            this.drawLabel(node.center, label, context);
        }
    }

    eraseStateNode(stateNode : StateNode, canvas : React.RefObject<HTMLCanvasElement>){
        let context = canvas.current?.getContext('2d');
        if(!context) return;
        clearCircle(context, stateNode.center, stateNode.radius + stateNode.gap + stateNode.ioNodeDiameter + context.lineWidth + stateNode.inputCombTextLength);
    }

    eraseIONode(ioNode : IONode, canvas : React.RefObject<HTMLCanvasElement> ){
        let context = canvas.current?.getContext('2d');
        if(!context) return;
        clearCircle(context, ioNode.center, ioNode.radius + context.lineWidth );
        let fSize = parseInt(context.font);
        console.log(fSize);
        fSize = 10;
        let x1 = ioNode.center.x;
        let y1 = ioNode.center.y - fSize / 2;
        let w = ioNode.radius + ioNode.originNode.inputCombTextLength + defalutIONodeConfig.inputLabelGap;
        if(ioNode.angle > Math.PI * .5 && ioNode.angle < Math.PI * 1.5)
            w = -w;
        // context.fillStyle = 'red';
        context.clearRect(x1, y1,w, fSize);
        // context.fill();

    }


    nodeCanvasOnMouseDown(e : MouseEvent){
        if(this.state.mouseMode === 'addNode'){
            return;
        }
        else if(this.state.mouseMode === 'drag' || this.state.mouseMode === 'edge' || this.state.mouseMode === 'select'){
            let prevSelected = this.selectedNode;
            let testPoint : Point = {
                x : e.offsetX,
                y : e.offsetY
            }
            let selected =  this.checkInside(testPoint);
            if(selected.entity == null){
                if(this.state.mouseMode === 'select'){
                    this.setState({
                        stateNodeToSideBar : null,
                        showSideBar : false,
                        ioNodeToSideBar : null
                    })
                    if(prevSelected != null){
                        let label;
                        if('label' in prevSelected)
                            label = prevSelected.label;
                        this.removeFocusCircle(prevSelected, label);
                    }
                }
                return;
            }

            if('from' in selected.entity){

            }
            else if('center' in selected.entity){
                this.selectedNode = selected.entity;
                this.selectedIndex = selected.index;

                if(this.state.mouseMode == 'edge' && 'type' in selected.entity && selected.entity.type === 'in'){
                    this.edgeStartNode = selected.entity;
                }   
                if(this.state.mouseMode === 'drag' || this.state.mouseMode === 'select'){
                    let label;
                    if('label' in selected.entity){
                        label = selected.entity.label;
                        if(this.state.mouseMode === 'drag'){
                            this.eraseStateNode(selected.entity, this.nodeCanvasRef);
                            this.drawStateNode(selected.entity, this.tempCanvasRef);
                            this.tempStateNodeCenter.x = selected.entity.center.x;
                            this.tempStateNodeCenter.y = selected.entity.center.y;
                            return;
                        }
                    }
                    this.focusOnNode(selected.entity.center, selected.entity.radius, selected.entity.color, label);
                    if(this.state.mouseMode === 'select'){
                        if('type' in selected.entity){
                            this.setState({
                                ioNodeToSideBar : selected.entity,
                                stateNodeToSideBar : null,
                                showSideBar : true
                            })
                        }
                        else{
                            this.setState({
                                stateNodeToSideBar : selected.entity,
                                ioNodeToSideBar : null, 
                                showSideBar : true
                            })
                        }
                        if(prevSelected != null){
                            let label;
                            if('label' in prevSelected)
                                label = prevSelected.label;
                            this.removeFocusCircle(prevSelected, label);
                        }
                    }

                }
            }  
        }   

    }

    nodeCanvasMouseUp(e : MouseEvent){
        if(this.state.mouseMode === 'addNode' || this.state.mouseMode === 'select' || this.state.mouseMode === 'edge'){
            return;
        }
        else if(this.state.mouseMode === 'drag'){
            if(this.selectedNode != null){
                let label;
                if('label' in this.selectedNode){
                    label = this.selectedNode.label;
                    // this.eraseStateNode(this.selectedNode,this.tempCanvasRef);
                    let p = getCornerPoints(this.selectedNode);
                    if(this.checkCollisionWithStateNodes(p.l, p.r, this.selectedNode)){
                        let deltaX = this.tempStateNodeCenter.x - this.selectedNode.center.x;
                        let deltaY = this.tempStateNodeCenter.y - this.selectedNode.center.y;
                        this.translateStateNode(this.selectedNode, deltaX, deltaY, this.nodeCanvasRef);
                        
                    }
                    else
                        this.drawStateNode(this.selectedNode, this.nodeCanvasRef); 
                    clearCanvas(this.tempCanvasRef);
                }
                else
                    this.removeFocusCircle(this.selectedNode, label);
                this.selectedNode = null;
                this.selectedIndex = -1;
            }
        }
    }


    nodeCanvasMouseMove(e : MouseEvent){ 

        if(this.state.mouseMode === 'addNode' || this.state.mouseMode === 'select' || this.state.mouseMode === 'edge')
            return;
        else if(this.state.mouseMode === 'drag'){
            if(this.selectedNode === null) return;
            if('type' in this.selectedNode && this.selectedNode.edges.length === 0){
                this.rotateIoNode(this.selectedNode, e);
            }
        }
    }

    tempCanvasMouseMove(e : MouseEvent){
        if(this.state.mouseMode === 'addNode'){
            let state = createStateNodeObject(Math.pow(2, this.state.numberOfInpVars), 1, {x : e.offsetX, y : e.offsetY}, this.nextLabel, this.inputCombTextLength, this.state.numberOfInpVars);
            clearCanvas(this.tempCanvasRef);
            this.drawStateNode(state, this.tempCanvasRef);
            this.tempStateNode = state;
            return;
            
        }
        else if(this.state.mouseMode === 'drag'){
            if(this.selectedNode === null) return;
            if('type' in this.selectedNode){
                return;
            }
            else if('ioNodes' in this.selectedNode){
                if(!this.checkIfStateNodeContainsEdge(this.selectedNode)){
                    clearCanvas(this.tempCanvasRef);
                    this.translateStateNode(this.selectedNode, e.movementX, e.movementY, this.tempCanvasRef);
                }
            }
        }
        else if(this.state.mouseMode === 'select'){
            return;
        }
        else if(this.state.mouseMode === 'edge'){
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
        if(this.state.mouseMode === 'addNode' || this.state.mouseMode === 'drag' || this.state.mouseMode === 'select'){
            return;
        }
        else if(this.state.mouseMode === 'edge'){
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
                    && selected.entity.type === 'out'){
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
        if(this.state.mouseMode === 'addNode'){
            if(this.tempStateNode){
                let p = getCornerPoints(this.tempStateNode);
                if(this.checkCollisionWithStateNodes(p.l, p.r)){
                    return;
                }
                this.stateNodes.push(this.tempStateNode);
                clearCanvas(this.tempCanvasRef);
                this.drawStateNode(this.tempStateNode, this.nodeCanvasRef);
                this.tempStateNode = null;
                // this.state.mouseMode = 'edge';
                this.setState({
                    mouseMode : 'edge'
                })
                this.nextLabel = this.stateLabels.next();
                return;
            }
        }
        else if(this.state.mouseMode === 'drag' || this.state.mouseMode === 'select'){
            return;
        }
        else if(this.state.mouseMode === 'edge'){
            if(this.edgeStartNode != null){
                // console.log(e);
                // console.log(this.stateNodes);
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

        // window.onresize = ()=>{
        //     console.log('herer');
        //     clearCanvas(this.nodeCanvasRef);
        //     clearCanvas(this.tempCanvasRef);
        //     clearCanvas(this.edgeCanvasRef);
        //     this.stateNodes.forEach(s=>{
        //         this.drawStateNode(s, this.nodeCanvasRef);
        //     })
        //     this.edges.forEach(e=>{
        //         this.drawEdge(e);
        //     })
        // }

        if(nodeContext == null || edgeContext == null || tempContext == null) return;

        let str = '';
        for(let i = 0; i < Math.pow(2, this.state.numberOfInpVars);++i)
            str += '0'

        this.inputCombTextLength = nodeContext.measureText(str).width;

        edgeContext.lineWidth = 2;
        

        // let stateNode = createStateNodeObject(4, 3, {x :250, y : 250}, this.nextLabel);
        // this.nextLabel = this.stateLabels.next();
        // let stateNode2 = createStateNodeObject(2, 3, {x : 100, y : 100}, this.nextLabel);
        // this.nextLabel = this.stateLabels.next();
        // this.stateNodes.push(stateNode);
        // this.stateNodes.push(stateNode2);
        // this.stateNodes.forEach(s => this.drawStateNode(s))
        // console.log(this.stateNodes);

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
                    <TopBar changeNumberOfInputVars = {this.changeNumberOfInputVars} numberOfInputVars = {this.state.numberOfInpVars} setMouseMode = {this.setMouseMode} mouseMode = {this.state.mouseMode}/>
                </div>
                <div className={styles.canvasContainer}>
                    <canvas ref = {this.nodeCanvasRef} className={styles.canvas} />
                    <canvas ref={this.edgeCanvasRef} className={styles.canvas} />
                    <canvas ref={this.tempCanvasRef} className={styles.canvas} style={{
                        zIndex : 5
                    }} />
                </div>
                <div onClick={()=>this.setMouseMode('addNode')} className={styles.addNodeButtonContainer}>
                    <button className={styles.addNodeButton}>Add Node</button>
                </div>
                {/* {!this.state.showSideBar && <div className={styles.menuContainer}>
                    <button onClick = {this.toggleSideBar} className = {styles.menu}> Menu</button>
                </div>} */}
                
                {
                    this.state.showSideBar &&
                <div className = {styles.sideBarContainer}>
                    <SideBar changeStateNodeRadius = {this.changeStateNodeRadius} addIoNodeWithStateChange = {this.addIoNodeWithStateChange} ioNode = {this.state.ioNodeToSideBar} stateNode = {this.state.stateNodeToSideBar} toggleSideBar = {this.toggleSideBar} />
                </div>}
            </div>
            
        )
    }
}

export default Canvas;