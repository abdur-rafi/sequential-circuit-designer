import React from 'react'
import {StateNode, Point, IONode, Edge, MouseMode} from './canvasInterfaces'
import {checkInsideCircle, calculateIONodeCenter,
     clearCircle, drawCircle, checkCollision, 
     pointToString, doRectanglesOverlap, getCornerPoints, clearCanvas, calculateDelTheta, doCirclesCollide} from './drawingFuncitons'
import styles from '../styles/design.module.scss'
import SideBar from './SideBar';
import TopBar from './topBar';
import { canvasConfig, defalutIONodeConfig, defaultStateNodeConfig } from '../defaultConfigs';
import Design from './results';
import Lingk from 'next/link'
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
    numberOfInpVars : number,
    synthesis : boolean 
}


class Canvas extends React.Component<Props, State>{

    nodeCanvasRef: React.RefObject<HTMLCanvasElement>;
    edgeCanvasRef : React.RefObject<HTMLCanvasElement>;
    tempCanvasRef : React.RefObject<HTMLCanvasElement>;

    stateNodes : StateNode[];
    edges : Edge[];

    selectedNode : IONode | StateNode | null;
    selectedIndex : number;
    tempEdgePoints : Point[];
    edgeStartNode : IONode | null;
    tempStateNode : StateNode | null;
    stateLabels : StringIdGenerator;
    nextLabel : string;
    tempStateNodeCenter : Point;
    inputCombTextLength : number;
    selectedEdge : Edge | null;
    moveContext : boolean
    


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
        this.selectedEdge = null;
        this.moveContext = false;

        this.state = {
            showSideBar : false,
            ioNodeToSideBar : null,
            stateNodeToSideBar : null,
            mouseMode : 'edge',
            numberOfInpVars : 2,
            synthesis : false
        }

        this.changeNumberOfInputVars = this.changeNumberOfInputVars.bind(this);
        this.toggleSideBar = this.toggleSideBar.bind(this);
        this.setMouseMode = this.setMouseMode.bind(this);
        this.setMouseMode = this.setMouseMode.bind(this);
        this.addIoNodeWithStateChange = this.addIoNodeWithStateChange.bind(this);
        this.changeStateNodeRadius = this.changeStateNodeRadius.bind(this);
        this.changeStateColor = this.changeStateColor.bind(this);
        this.changeIoNodeColor = this.changeIoNodeColor.bind(this);
        this.changeSynthesis = this.changeSynthesis.bind(this);
    }

    changeSynthesis( s : boolean){
        this.setState({
            synthesis : s
        })
    }

    createEdge(from : IONode, to : IONode, tempEdgePoints: Point[]) : Edge{
        let s = new Set<string>();
        tempEdgePoints = tempEdgePoints.filter(p =>{
            return !(checkInsideCircle(to.center,to.radius,p)
            || checkInsideCircle(from.center, from.radius,p))
        })
        tempEdgePoints.forEach(p=>{
            s.add(pointToString(p));
        })
        tempEdgePoints.splice(0, 0, from.center);
        tempEdgePoints.push(to.center);
        let edge : Edge = {
            from : from,
            to : to,
            points : tempEdgePoints,
            pointsSet : s,
            color : '#004d00'
        }
        return edge;
        
    }

    changeStateColor(state : StateNode, color : string){
        state.color = color;
        this.setState({
            stateNodeToSideBar : state
        })
        this.eraseStateNode(state, this.nodeCanvasRef);
        this.drawStateNode(state, this.nodeCanvasRef);
    }

    changeIoNodeColor(state: IONode, color : string){
        state.color = color;
        this.eraseIONode(state, this.nodeCanvasRef);
        this.drawIoNode(state, this.nodeCanvasRef);
        this.setState({
            ioNodeToSideBar : state
        })
    }

    addIoNode(stateNode : StateNode, type : 'in' | 'out') : IONode | null{
        let ioNodes = stateNode.ioNodes;
        for(let i = 0; i < ioNodes.length; ++i){
            
            let next = (i + 1 ) % ioNodes.length;
            let nextAngle = Math.PI * 2;
            if(next == 0 && ioNodes.length > 1){
                nextAngle = ioNodes[i].angle + (Math.PI * 2 - ioNodes[i].angle + ioNodes[0].angle);
            }
            else if(ioNodes.length != 1){
                nextAngle = ioNodes[next].angle;
            }
            let between = (ioNodes[i].angle + nextAngle) / 2;
            if(between > Math.PI * 2) between -= Math.PI * 2;
            let delta = calculateDelTheta(ioNodes[i]);
            if(checkCollision(ioNodes[i].angle, between, delta / 2) || checkCollision(ioNodes[next].angle, between, delta/2)){
                continue;
            }
            let ioNode = this.createIONodeObject(stateNode, between, type,
                type == 'in' ? defalutIONodeConfig.inNodeColor : defalutIONodeConfig.outNodeColor,'');
            
            ioNodes.splice(i+1,0,ioNode);
            console.log(stateNode);
            return ioNode;
        }
        return null;
    }

    createIONodeObject(stateNode : StateNode, angle : number, type : 'in' | 'out',color : string, inputComb : string) : IONode{
        return{
            angle : angle,
            center : calculateIONodeCenter(stateNode, angle),
            color : color,
            originNode : stateNode,
            radius : stateNode.ioNodeDiameter / 2,
            type : type,
            edges : [],
            inputComb : inputComb
        }
    }
    
    createStateNodeObject(inNodesCount : number, outNodesCount : number, center : Point,radius : number, label : string, inputCombTextLength : number, numberOfInputVars : number) : StateNode{
        let stateNode : StateNode = {
            center : center,
            radius : radius, 
            gap : defaultStateNodeConfig.gap,
            color : defaultStateNodeConfig.color,
            ioNodes : [],
            ioNodeDiameter : defaultStateNodeConfig.ioNodeDiameter,
            label : label,
            inputCombTextLength : inputCombTextLength,
            minRadius : defaultStateNodeConfig.minRadius
        }
        
        let gap = (Math.PI * 2) / (inNodesCount + outNodesCount);
        let s = 0;
        for(let i = 0; i < inNodesCount; ++i){
            let inpComb = i.toString(2);
            while(inpComb.length !=  numberOfInputVars ){
                inpComb = '0' + inpComb;
            }
            let node = this.createIONodeObject(stateNode, s, 'in', defalutIONodeConfig['inNodeColor'], inpComb);
            s += gap;
            stateNode.ioNodes.push(node);
        }
        for(let i = 1; i <= outNodesCount; ++i){
            let node = this.createIONodeObject(stateNode, s, 'out', defalutIONodeConfig['outNodeColor'], '');
            s += gap;
            stateNode.ioNodes.push(node);
        }
        return stateNode;
        
    }

    drawLabel(center : Point, label : string,canvas : React.RefObject<HTMLCanvasElement>, font : string){
        let context = canvas.current?.getContext('2d');
        if(!context) return;
        context.font = font;
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(label, center.x, center.y);
    }

    doAnyCollide(stateNode : StateNode) : boolean{
        for(let i = 0; i < stateNode.ioNodes.length; ++i){
            let curr = stateNode.ioNodes[i];
            let nxt = stateNode.ioNodes[(i + 1) % stateNode.ioNodes.length];
            let rect1 = this.calculateInputTextRectangle(curr);
            let rect2 = this.calculateInputTextRectangle(nxt);

             
            if(doCirclesCollide(curr.center, curr.radius + canvasConfig.nodeCanvasLineWidth,
                nxt.center, nxt.radius + canvasConfig.nodeCanvasLineWidth ) || 
                doRectanglesOverlap(rect1.l1, rect1.r1, rect2.l1, rect2.r1)) return true;
            
        }
        return false;
    }
    getMaxNumberOfStates(){
        return Math.pow(2, this.state.numberOfInpVars);
    }

    getMinSizeStateNode(stateNode : StateNode): StateNode{
        let i = defaultStateNodeConfig.minRadius;
        let j = 1000;
        let m : number;
        let last = stateNode;
        while(i <= j){
            m = Math.floor((i + j) / 2);
            let newNode = this.createStateNodeObject(this.getMaxNumberOfStates(),1,stateNode.center,m,
            stateNode.label, stateNode.inputCombTextLength, this.state.numberOfInpVars);
            if(!this.doAnyCollide(newNode)){
                j = m - 1;
                last = newNode;
                newNode.minRadius = newNode.radius;
                console.log(m);
            }
            else 
                i = m + 1;
        }
        return last;
    }

    changeNumberOfInputVars(vars : number){
        this.setState({
            numberOfInpVars : vars
        }, ()=>{
            clearCanvas(this.nodeCanvasRef);
            clearCanvas(this.tempCanvasRef);
            clearCanvas(this.edgeCanvasRef);
            this.stateNodes = []
            this.edges = []
            // let t : StateNode[] = [];
            // this.stateNodes.forEach(s=>{
            //     t.push(this.createStateNodeObject(Math.pow(2, this.state.numberOfInpVars),1, s.center, s.label, s.inputCombTextLength, this.state.numberOfInpVars));
            // })
            // this.stateNodes = t;
            // this.stateNodes.forEach(s=>this.drawStateNode(s, this.nodeCanvasRef));
            this.resetModeVars();
        })
        
    }

    changeStateNodeRadius(stateNode : StateNode, radius : number){
        if(this.checkIfStateNodeContainsEdge(stateNode) || (radius < stateNode.minRadius)) return;
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
        let newIoNode = this.addIoNode(stateNode, type);
        
        if(newIoNode != null){
            this.setState({
                stateNodeToSideBar : stateNode, 
                ioNodeToSideBar : null
            })
            drawCircle(this.nodeCanvasRef,newIoNode.center, newIoNode?.radius, 'black', newIoNode.color);
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


    getBoundaryRadius(state: StateNode){
        return state.radius + state.gap + state.ioNodeDiameter + state.inputCombTextLength;
    }

    doCollideWithOtherStateNodes(stateNode : StateNode):boolean{
        for(let i = 0; i < this.stateNodes.length; ++i){
            let curr = this.stateNodes[i];
            if(curr == stateNode) continue;
            
            if(doCirclesCollide(stateNode.center,this.getBoundaryRadius(stateNode), curr.center, this.getBoundaryRadius(curr))){
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

    translateEdge(edge : Edge,x : number, y : number, canvas : React.RefObject<HTMLCanvasElement>){
        edge.pointsSet = new Set();
        for(let i = 0; i < edge.points.length; ++i){
            edge.points[i] = {
                x : edge.points[i].x + x,
                y : edge.points[i].y + y
            }
            edge.pointsSet.add(pointToString(edge.points[i]));
        }
        this.drawEdge(edge);
    }

    clearNode(node : StateNode | IONode, canvas : React.RefObject<HTMLCanvasElement>){
        let context =  canvas.current?.getContext('2d');
        if(!context) return;
        clearCircle(canvas, node.center,node.radius + context.lineWidth);
    }

    focusOnNode(node : StateNode | IONode, canvas : React.RefObject<HTMLCanvasElement>){
        let context = canvas.current?.getContext('2d');
        if(context == null) return;
        clearCircle(canvas, node.center, node.radius + context.lineWidth);
        drawCircle(canvas, node.center, node.radius, 'blue',node.color);
        let x;
        if(x = this.isStateNode(node))
            this.drawLabel(x.center, x.label , canvas, defaultStateNodeConfig.font);
        
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
        let r = 2;
        for(let i = 0; i < this.edges.length; ++i){
            
            let edge = this.edges[i];
            let nbPoints : Point[] = []
            for(let i = -r; i <= r; ++i){
                for(let j = -r; j <= r; ++j){
                    nbPoints.push({
                        x : testPoint.x + i,
                        y : testPoint.y + j
                    })
                }
            }
            if(nbPoints.some(p=>edge.pointsSet.has(pointToString(p)))){
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
        context!.font = defalutIONodeConfig.font;
        context!.fillStyle = 'black';
        context!.textAlign = 'start';
        context!.textBaseline = 'middle';
        let b = (ioNode.angle > Math.PI / 2 && ioNode.angle < Math.PI * 1.5);
        let inpComb = ioNode.inputComb;
        if(b)
            inpComb = inpComb.split("").reverse().join("");
        let len = context.measureText(inpComb).width;
        // context!.direction = b ? 'rtl' : 'ltr'; 
        context?.fillText(inpComb, ioNode.center.x + (b ? -defalutIONodeConfig.inputLabelGap - len : defalutIONodeConfig.inputLabelGap), ioNode.center.y);
        
    }

    drawIoNode(ioNode : IONode, canvas : React.RefObject<HTMLCanvasElement>){
        drawCircle(canvas, ioNode.center, ioNode.radius, 'black', ioNode.color);
        if(ioNode.type === 'in')
            this.drawInputLabel(ioNode, canvas);
    }
    drawStateNode(state : StateNode, canvas : React.RefObject<HTMLCanvasElement>){
        let context = canvas.current?.getContext('2d');
        if(!context) return;
        // context.lineWidth = 1.5;
        drawCircle(canvas, state.center, state.radius, 'black', state.color);
        state.ioNodes.forEach(ioNode => {
            this.drawIoNode(ioNode, canvas);
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
        this.drawLabel(state.center, state.label , canvas, defaultStateNodeConfig.font);
        
    }

    calculateInputTextRectangle(ioNode : IONode) : {
        l1 : Point, r1 : Point
    }
    {
        let fSize = defalutIONodeConfig.fontSize;
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
        let n = stateNode.ioNodes.length;
        let rect1 = this.calculateInputTextRectangle(this.createIONodeObject(stateNode, angle,'in', '',''));
        let center = calculateIONodeCenter(selectedNode.originNode, angle);
        
        for(let i = 0; i < n; ++i){
            if(i == this.selectedIndex) continue;
            let ioNode = stateNode.ioNodes[i];
            if(doCirclesCollide(center, selectedNode.radius + canvasConfig.nodeCanvasLineWidth, ioNode.center, ioNode.radius + canvasConfig.nodeCanvasLineWidth)) return;
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
        
        
        let newCenter = calculateIONodeCenter(stateNode, angle);
        this.eraseIONode(selectedNode, this.nodeCanvasRef);
        selectedNode.center = newCenter;
        selectedNode.angle = angle;
        drawCircle(this.nodeCanvasRef, newCenter, selectedNode.radius, 'blue',
                selectedNode.color);
        
        let ioNode = selectedNode;
        this.drawInputLabel(ioNode, this.nodeCanvasRef);
        // context!.font = 'bold 10px serif';
    }

    resetModeVars(){
        if(this.selectedNode ){
            let label;
            if('label' in this.selectedNode)
                label = this.selectedNode.label;
            this.removeFocusCircle(this.selectedNode);
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

    removeFocusCircle(node : StateNode | IONode){
        let context = this.nodeCanvasRef.current?.getContext('2d');
        if(context == null) 
            return;
        clearCircle(this.nodeCanvasRef, node.center, node.radius + context.lineWidth);
        drawCircle(this.nodeCanvasRef, node.center, node.radius, 'black', node.color);
        if('label' in node){
            this.drawLabel(node.center, node.label, this.nodeCanvasRef, defaultStateNodeConfig.font);
        }
        // if(label){
        //     this.drawLabel(node.center, label, context);
        // }
    }

    eraseStateNode(stateNode : StateNode, canvas : React.RefObject<HTMLCanvasElement>){
        let context = canvas.current?.getContext('2d');
        if(!context) return;
        clearCircle(this.nodeCanvasRef, stateNode.center, stateNode.radius + stateNode.gap + stateNode.ioNodeDiameter + context.lineWidth + stateNode.inputCombTextLength);
    }

    eraseIONode(ioNode : IONode, canvas : React.RefObject<HTMLCanvasElement> ){
        let context = canvas.current?.getContext('2d');
        if(!context) return;
        clearCircle(this.nodeCanvasRef, ioNode.center, ioNode.radius + context.lineWidth );
        let fSize = defalutIONodeConfig.fontSize;
        let x1 = ioNode.center.x;
        let y1 = ioNode.center.y - fSize / 2;
        let w = ioNode.radius + ioNode.originNode.inputCombTextLength + defalutIONodeConfig.inputLabelGap;
        if(ioNode.angle > Math.PI * .5 && ioNode.angle < Math.PI * 1.5)
            w = -w;
        // context.fillStyle = 'red';
        context.clearRect(x1, y1,w, fSize);
        // context.fill();

    }

    focusOnEdge(edge : Edge){
        let p = edge.color;
        edge.color = 'blue';
        // this.drawEdge(edge);
        clearCanvas(this.edgeCanvasRef);
        this.edges.forEach(e => this.drawEdge(e));
        edge.color = p;

    }
    removeFocusFromEdge(){
        clearCanvas(this.edgeCanvasRef);
        this.edges.forEach(e => this.drawEdge(e));
    }
    
    isSpaceAvailableForTempNode() : boolean{
        return !this.doCollideWithOtherStateNodes(this.tempStateNode!);
        // let p = getCornerPoints(this.tempStateNode!);
        // return !(this.checkCollisionWithStateNodes(p.l, p.r))
    }
    drawTempNodeOnNodeCanvas(){
        this.drawStateNode(this.tempStateNode!, this.nodeCanvasRef);
        
    }

    isEdge(entity : IONode | StateNode | Edge | null) : Edge | null{
        if(!entity) return entity;
        if('from' in entity){
            return entity;
        }
        return null;
    }
    isStateNode(entity : IONode | StateNode | Edge | null) : StateNode | null{
        if(!entity) return null;
        if('ioNodes' in entity){
            return entity;
        }
        return null;
    }
    isIONode(entity : IONode | StateNode | Edge | null) : IONode | null{
        if(!entity) return null;
        if('originNode' in entity){
            return entity;
        }
        return null;
    }

    removeStateNode(stateNode : StateNode){
        this.stateNodes = this.stateNodes.filter(s => s != stateNode);
        this.eraseStateNode(stateNode, this.nodeCanvasRef);
    }

    removeEdge(edge : Edge){
        this.edges = this.edges.filter(e => e != edge);
        clearCanvas(this.edgeCanvasRef);
        this.edges.forEach(e => this.drawEdge(e));
        edge.from.edges = edge.from.edges.filter(e => e != edge);
        edge.to.edges = edge.to.edges.filter(e => e != edge);
        
    }

    drawStateBoundary(s : StateNode){
        let context = this.tempCanvasRef.current?.getContext('2d');
        if(!context) return;
        context.beginPath();
        context.strokeStyle = 'red';
        // context.lineWidth = 3;
        context.arc(s.center.x, s.center.y, s.radius + s.gap + s.ioNodeDiameter + s.inputCombTextLength, 0, Math.PI * 2);
        // context.lineWidth = 2;
        context.stroke();
    }

    drawAllStateBoundary(){
        this.stateNodes.forEach(s=>{
            this.drawStateBoundary(s);
        })
    }

    moveAllCanvasContext(x : number, y : number){
        let nodeContext = this.nodeCanvasRef.current?.getContext('2d');
        let edgeContext = this.edgeCanvasRef.current?.getContext('2d');
        let tempContext = this.tempCanvasRef.current?.getContext('2d');
        if(nodeContext && edgeContext && tempContext){
            nodeContext.translate(x, y);
            edgeContext.translate(x, y);
            tempContext.translate(x, y);
        }
    }

    getOutNode(stateNode : StateNode) : IONode{
        for(let j = 0; j < stateNode.ioNodes.length; ++j){
            if(stateNode.ioNodes[j].type === 'out') return stateNode.ioNodes[j];
        }
        return this.createIONodeObject(stateNode, 1, 'out','','');
    }

    createTestGraph(){
        for(let i = 0; i < 5; ++i){
            let state = this.createStateNodeObject(this.getMaxNumberOfStates(), 1, {x : 100 + i * 100, y : 100 + i * 100}, defaultStateNodeConfig.minRadius, this.nextLabel, this.inputCombTextLength, this.state.numberOfInpVars);
            this.nextLabel = this.stateLabels.next();
            state = this.getMinSizeStateNode(state);
            this.stateNodes.push(state);
            this.drawStateNode(state, this.nodeCanvasRef);
            
            for(let j = 0; j < state.ioNodes.length; ++j){
                let ioNode = state.ioNodes[j];
                let outNode = this.getOutNode(state);
                let e = this.createEdge(ioNode,outNode,[]);
                ioNode.edges.push(e);
                outNode.edges.push(e);
                this.drawEdge(e);
                this.edges.push(e);
            }
        }
    }

    canvasOnMouseDown(e : MouseEvent){
        if(this.state.mouseMode === 'addNode' && this.tempStateNode){
            if(this.isSpaceAvailableForTempNode()){
                this.stateNodes.push(this.tempStateNode);
                clearCanvas(this.tempCanvasRef);
                this.drawTempNodeOnNodeCanvas();
                this.tempStateNode = null;this.setState({
                    mouseMode : 'edge'
                })
                this.nextLabel = this.stateLabels.next();
            }
        }
        else if(this.state.mouseMode === 'drag'){
            let testPoint : Point = {
                x : e.offsetX,
                y : e.offsetY
            }
            let selected =  this.checkInside(testPoint);
            if(selected.entity != null){
                let x;
                if((x = this.isEdge(selected.entity))){
                    
                }
                else if((x = this.isStateNode(selected.entity))){
                    this.selectedNode = x;
                    this.selectedIndex = selected.index;
                    clearCanvas(this.tempCanvasRef);
                    this.eraseStateNode(x, this.nodeCanvasRef);
                    this.drawStateNode(x, this.tempCanvasRef);
                    this.focusOnNode(x, this.tempCanvasRef);
                    this.tempStateNodeCenter = {
                        x : x.center.x,
                        y : x.center.y
                    }
                    this.drawAllStateBoundary();
                }
                else if((x = this.isIONode(selected.entity))){
                    this.selectedNode = x;
                    this.selectedIndex = selected.index;
                    this.focusOnNode(x, this.nodeCanvasRef);
                }
            }  
            else{
                this.moveContext = true;
            }
        }
        else if (this.state.mouseMode === 'select'){
            let testPoint : Point = {
                x : e.offsetX,
                y : e.offsetY
            }
            let selected =  this.checkInside(testPoint);
            let x;
            if(this.selectedNode)
                this.removeFocusCircle(this.selectedNode);
            // else if(this.selectedEdge)
            //     this.drawEdge(this.selectedEdge);
            if(selected.entity){
                if(x = this.isStateNode(selected.entity)){
                    this.setState({
                        stateNodeToSideBar : x,
                        ioNodeToSideBar : null,
                        showSideBar : true
                    })
                    this.focusOnNode(x, this.nodeCanvasRef);
                    this.selectedNode = x;
                    this.selectedIndex = selected.index;
                }
                else if(x = this.isIONode(selected.entity)){
                    this.setState({
                        stateNodeToSideBar : null,
                        ioNodeToSideBar : x,
                        showSideBar : true
                    })
                    this.focusOnNode(x, this.nodeCanvasRef);
                    this.selectedNode = x;
                    this.selectedIndex = selected.index;
                }
                else if(x = this.isEdge(selected.entity)){
                    if(x != this.selectedEdge){
                        if(this.selectedEdge)
                            this.removeFocusFromEdge();
                        this.selectedEdge = x;
                        this.focusOnEdge(x);
                    }
                }
            }
            else{
                this.selectedNode = null;
                this.selectedIndex = -1;
                this.setState({
                    ioNodeToSideBar : null,
                    stateNodeToSideBar : null,
                    showSideBar : false
                })
                if(this.selectedEdge){
                    this.removeFocusFromEdge();
                    this.selectedEdge = null;
                }
            } 
        }
        else if(this.state.mouseMode === 'edge'){
            let testPoint : Point = {
                x : e.offsetX,
                y : e.offsetY
            }
            let selected =  this.checkInside(testPoint);
            let x;
            if(x = this.isIONode(selected.entity)){
                if(x.type == 'in'){
                    this.edgeStartNode = x;
                    let context = this.tempCanvasRef.current?.getContext('2d');
                    if(context){
                        context.strokeStyle = 'black';
                        context.beginPath();
                        context.moveTo(x.center.x, x.center.y);
                    }
                }
            }
        }
    }


    canvasOnMouseMove(e : MouseEvent){
        // console.log(e);
        if(this.state.mouseMode === 'addNode'){
            let state = this.createStateNodeObject(Math.pow(2, this.state.numberOfInpVars), 1, {x : e.offsetX, y : e.offsetY}, defaultStateNodeConfig.minRadius, this.nextLabel, this.inputCombTextLength, this.state.numberOfInpVars);
            state = this.getMinSizeStateNode(state);
            clearCanvas(this.tempCanvasRef);
            this.drawStateNode(state, this.tempCanvasRef);
            this.drawAllStateBoundary();
            if(this.tempStateNode)
                this.drawStateBoundary(this.tempStateNode);
            this.tempStateNode = state;
        }
        else if(this.state.mouseMode === 'drag'){
            let x;
            if(x = this.isIONode(this.selectedNode)){
                if(x.edges.length === 0){
                    this.rotateIoNode(x, e);
                }
            }
            else if(x = this.isStateNode(this.selectedNode)){
                if(!this.checkIfStateNodeContainsEdge(x)){
                    clearCanvas(this.tempCanvasRef);
                    this.drawAllStateBoundary();
                    this.translateStateNode(x, e.movementX, e.movementY, this.tempCanvasRef);
                    this.focusOnNode(x, this.tempCanvasRef);
                }
            }
            else if(this.moveContext){
                clearCanvas(this.nodeCanvasRef);
                clearCanvas(this.edgeCanvasRef);
                this.stateNodes.forEach(s=>{
                    this.translateStateNode(s, e.movementX, e.movementY, this.nodeCanvasRef);
                })
                this.edges.forEach(edge=>this.translateEdge(edge,e.movementX, e.movementY,this.edgeCanvasRef));
                
                console.log(e);
                // this.moveAllCanvasContext(e.offsetX, e.offsetY);
                // clearCanvas(this.nodeCanvasRef);
                // clearCanvas(this.edgeCanvasRef);
                // clearCanvas(this.tempCanvasRef);
                // this.stateNodes.forEach(s => this.drawStateNode(s, this.nodeCanvasRef));

            }
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

    canvasOnMouseUp(e : MouseEvent){
        if(this.state.mouseMode === 'drag'){
            if(this.selectedNode != null){
                let x;
                if(x = this.isStateNode(this.selectedNode)){
                    // let p = getCornerPoints(x);
                    if(this.doCollideWithOtherStateNodes(x)){
                        let deltaX = this.tempStateNodeCenter.x - this.selectedNode.center.x;
                        let deltaY = this.tempStateNodeCenter.y - this.selectedNode.center.y;
                        this.translateStateNode(x, deltaX, deltaY, this.nodeCanvasRef);
                        
                    }
                    else
                        this.drawStateNode(x, this.nodeCanvasRef);
                    clearCanvas(this.tempCanvasRef);
                }
                else{
                    this.removeFocusCircle(this.selectedNode);
                }
                this.selectedNode = null;
                this.selectedIndex = -1;
            }
            this.moveContext = false;
        }
        else if(this.state.mouseMode === 'edge'){
            if(this.edgeStartNode != null){
                let tempContext = this.tempCanvasRef.current?.getContext('2d');
                if(tempContext == null || this.tempEdgePoints.length === 0) return;
                clearCanvas(this.tempCanvasRef);
                let testPoint = {
                    x : e.offsetX, 
                    y : e.offsetY
                }
                let selected = this.checkInsideNode(testPoint);
                if(selected.entity != null && 'type' in selected.entity
                    && selected.entity.type === 'out'){
                        let from = this.edgeStartNode;
                        let to = selected.entity;
                        let edge = this.createEdge(from, to, this.tempEdgePoints);
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


        window.addEventListener('keydown', e=>{
            console.log(e);
            if(e.key === 'Delete'){
                if(this.state.mouseMode === 'select'){
                    let x ;
                    if(x = this.isStateNode(this.selectedNode)){
                        if(!this.checkIfStateNodeContainsEdge(x)){
                            this.removeStateNode(x);
                            this.selectedNode = null;
                            this.selectedIndex = -1;
                            this.setState({
                                stateNodeToSideBar : null, 
                                showSideBar : false
                            })
                        }
                    }
                    if(this.selectedEdge){
                        this.removeEdge(this.selectedEdge);
                    }
                }
            }
        })

        if(nodeContext == null || edgeContext == null || tempContext == null) return;

        // this.createTestGraph();

        let str = '';
        for(let i = 0; i < this.state.numberOfInpVars;++i)
            str += '0'

        this.inputCombTextLength = nodeContext.measureText(str).width + defalutIONodeConfig.inpCombLengthExtra + defalutIONodeConfig.inputLabelGap;

        edgeContext.lineWidth = canvasConfig.edgeCanvasLineWidth;
        nodeContext.lineWidth = canvasConfig.nodeCanvasLineWidth;
        tempContext.lineWidth = canvasConfig.tempCanvasLineWidth;
        

        // let stateNode = this.createStateNodeObject(4, 1, {x :250, y : 250}, defaultStateNodeConfig.radius, this.nextLabel, this.inputCombTextLength, this.state.numberOfInpVars);
        // this.nextLabel = this.stateLabels.next();
        // let stateNode2 = this.createStateNodeObject(4, 1, {x : 100, y : 100}, defaultStateNodeConfig.radius, this.nextLabel, this.inputCombTextLength, this.state.numberOfInpVars);
        // this.nextLabel = this.stateLabels.next();
        // this.stateNodes.push(stateNode);
        // this.stateNodes.push(stateNode2);
        // this.stateNodes.forEach(s => this.drawStateNode(s, this.nodeCanvasRef))
        // console.log(this.stateNodes);

        tempCanvas.addEventListener('mousedown', e=>{
            // this.nodeCanvasOnMouseDown(e);
            // this.tempCanvasMouseDown(e);
            this.canvasOnMouseDown(e);
        })

        tempCanvas.addEventListener('mouseup', e=>{
            // this.nodeCanvasMouseUp(e);
            // this.tempCanvasMouseUp(e);
            this.canvasOnMouseUp(e);
        })

        tempCanvas.addEventListener('mousemove', e=>{
            // console.log(e);
            // this.nodeCanvasMouseMove(e);
            // this.tempCanvasMouseMove(e);
            this.canvasOnMouseMove(e);
        })
    }    

    

    render() : React.ReactNode{
        return (
            <div className={styles.root}>
                {
                    
                    <div style={{
                        display : this.state.synthesis ? 'none' : 'block'
                    }}>
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
                    <div onClick={()=>this.setState({synthesis : true})} className={styles.synthesisButtonContainer}>
                        <button className={styles.synthesisButton}>
                            synthesis
                            {/* <Link to='/synthesize' > </Link> */}
                        </button>
                    </div>

                    <div onClick={()=>this.setMouseMode('addNode')} className={styles.addNodeButtonContainer}>
                        <button className={styles.addNodeButton}>Add Node</button>
                    </div>
                    
                    
                    {
                        this.state.showSideBar &&
                    <div className = {styles.sideBarContainer}>
                        <SideBar changeIoNodeColor = {this.changeIoNodeColor} changeStateColor = {this.changeStateColor} changeStateNodeRadius = {this.changeStateNodeRadius} addIoNodeWithStateChange = {this.addIoNodeWithStateChange} ioNode = {this.state.ioNodeToSideBar} stateNode = {this.state.stateNodeToSideBar} toggleSideBar = {this.toggleSideBar} />
                    </div>}
                </div>}
                    {
                        this.state.synthesis &&
                        <Design changeSynthesis={this.changeSynthesis} numberOfInpVar = {this.state.numberOfInpVars} stateNodes={this.stateNodes} edges = {this.edges} />    
                    }
            </div>
            
        )
    }
}

export default Canvas;