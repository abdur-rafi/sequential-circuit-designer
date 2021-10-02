
import {Point, StateNode, IONode, Edge} from './canvasInterfaces'
import {defalutIONodeConfig, defaultStateNodeConfig} from '../defaultConfigs'
import React from 'react';

export function createIONodeObject(stateNode : StateNode, angle : number, type : 'in' | 'out',color : string) : IONode{
    return{
        angle : angle,
        center : calculateIONodeCenter(stateNode, angle),
        color : color,
        originNode : stateNode,
        radius : stateNode.ioNodeDiameter / 2,
        type : type,
        edges : []
    }
}

export function createStateNodeObject(inNodesCount : number, outNodesCount : number, center : Point) : StateNode{
    let stateNode : StateNode = {
        center : center,
        radius : defaultStateNodeConfig.radius, 
        gap : defaultStateNodeConfig.gap,
        color : defaultStateNodeConfig.color,
        ioNodes : [],
        ioNodeDiameter : defaultStateNodeConfig.ioNodeDiameter
    }
    
    let gap = (Math.PI * 2) / (inNodesCount + outNodesCount);
    let s = 0;
    for(let i = 1; i <= inNodesCount; ++i){
        let node = createIONodeObject(stateNode, s, 'in', defalutIONodeConfig['inNodeColor']);
        s += gap;
        stateNode.ioNodes.push(node);
    }
    for(let i = 1; i <= outNodesCount; ++i){
        let node = createIONodeObject(stateNode, s, 'out', defalutIONodeConfig['outNodeColor']);
        s += gap;
        stateNode.ioNodes.push(node);
    }
    return stateNode;
    
}

export function checkInsideCircle(center : Point, radius : number, testPoint : Point) : boolean{
    let xDist = center.x - testPoint.x ;
    xDist *= xDist;
    let yDist = center.y - testPoint.y;
    yDist *= yDist;
    let dist = Math.sqrt(xDist + yDist);
    // console.log(dist);
    // console.log(center);
    return dist <= radius;
    
}

export function drawCircle(context : CanvasRenderingContext2D, center : Point, radius : number, lineColor : string, fillColor : string){
    context.beginPath();
    context.strokeStyle = lineColor;
    context.fillStyle = fillColor;
    context.arc(center.x, center.y, radius, 0, Math.PI * 2);      
    context.fill();
    context.stroke();
    context.closePath();  
}



export function calculateIONodeCenter(stateNode : StateNode, angle : number): Point{
    return({
        x : stateNode.center.x + (stateNode.radius + stateNode.gap + stateNode.ioNodeDiameter / 2) * Math.cos(angle),
        y : stateNode.center.y + (stateNode.radius + stateNode.gap + stateNode.ioNodeDiameter / 2) * Math.sin(angle)
    })
}

export function clearCircle(context : CanvasRenderingContext2D, center : Point, radius : number){
    context.beginPath();
    // context.lineWidth = 1;
    context.strokeStyle = 'white';
    context.arc(center.x, center.y,  radius , 0, Math.PI * 2);
    context.fillStyle = 'white';
    context.fill();
    context.stroke();
    context.closePath();
}

export function bringBetweenZeroAnd2pi(angle : number) : number{

    if(angle >= 2 * Math.PI) return angle - 2 * Math.PI;
    if(angle < 0) return angle + 2 * Math.PI;
    return angle;
}

export function checkCollision(referenceAngle : number,testAngle : number, diff : number ) : boolean{
    let upper = bringBetweenZeroAnd2pi(referenceAngle + diff);
    let lower = bringBetweenZeroAnd2pi(referenceAngle - diff);
    if(!(upper > lower)){
        if((testAngle < upper) || (testAngle > lower)) return true;
    }
    else if(testAngle >= lower && testAngle <= upper)
        return true;
    return false;
}

export function pointToString(p : Point){
    return p.x.toString() + ',' + p.y.toString();
}

export function createEdge(from : IONode, to : IONode, tempEdgePoints: Point[]) : Edge{
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
        color : 'darkgrey'
    }
    return edge;
    
}

export function doRectanglesOverlap(l1 : Point, r1 : Point, l2 : Point, r2 : Point): boolean{
    return (l1.x < r2.x && r1.x > l2.x && r1.y > l2.y && l1.y < r2.y);
 
    // return true;
}

export function getCornerPoints(stateNode : StateNode):{
    l : Point,
    r : Point
}{
    let l2 = {
        x : stateNode.center.x - stateNode.radius -  stateNode.gap - stateNode.ioNodeDiameter,
        y : stateNode.center.y - stateNode.radius -  stateNode.gap - stateNode.ioNodeDiameter
    }
    let r2 = {
        x : stateNode.center.x + stateNode.radius +  stateNode.gap + stateNode.ioNodeDiameter,
        y : stateNode.center.y + stateNode.radius +  stateNode.gap + stateNode.ioNodeDiameter
    }
    return {
        l : l2,
        r : r2
    }

}

export function clearCanvas(canvasRef : React.RefObject<HTMLCanvasElement>){
    let canvas = canvasRef.current;
    if(canvas == null) return;
    let context = canvas.getContext('2d');
    if(context == null) return;
    context.clearRect(0, 0, canvas.width, canvas.height);

}

export function addIoNode(stateNode : StateNode, type : 'in' | 'out') : IONode | null{
    let ioNodes = stateNode.ioNodes;
    // console.log(ioNodes);
    for(let i = 0; i < ioNodes.length; ++i){
        
        let next = (i + 1 ) % ioNodes.length;
        let nextAngle = Math.PI * 2;
        if(next == 0 && ioNodes.length > 1){
            nextAngle = ioNodes[i].angle + (Math.PI * 2 - ioNodes[i].angle + ioNodes[0].angle);
            // if(nextAngle > Math.PI * 2) nextAngle -= Math.PI * 2;
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
        let ioNode = createIONodeObject(stateNode, between, type,
            type == 'in' ? defalutIONodeConfig.inNodeColor : defalutIONodeConfig.outNodeColor);
        
        ioNodes.splice(i+1,0,ioNode);
        console.log(stateNode);
        return ioNode;
    }
    return null;
}

export function calculateDelTheta(ioNode : IONode) : number{
    let stateNode = ioNode.originNode;
    return (stateNode.ioNodeDiameter * 2.5) / (stateNode.radius + stateNode.gap + stateNode.ioNodeDiameter / 2);

}