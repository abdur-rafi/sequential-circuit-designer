
import {Point, StateNode, IONode} from './canvasInterfaces'
import {defalutIONodeConfig, defaultStateNodeConfig} from '../defaultConfigs'

function createIONodeObject(stateNode : StateNode, angle : number, type : 'in' | 'out',color : string) : IONode{
    return{
        angle : angle,
        center : calculateIONodeCenter(stateNode, angle),
        color : color,
        originNode : stateNode,
        radius : stateNode.gap - 5,
        type : type,
        edges : []
    }
}

export function createStateNodeObject(inNodesCount : number, outNodesCount : number, center : Point) : StateNode{
    let stateNode : StateNode = {
        center : center,
        radius : defaultStateNodeConfig['radius'], 
        gap : defaultStateNodeConfig['gap'],
        color : defaultStateNodeConfig['color'],
        ioNodes : []
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
    console.log(dist);
    console.log(center);
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
        x : stateNode.center.x + (stateNode.radius + stateNode.gap) * Math.cos(angle),
        y : stateNode.center.y + (stateNode.radius + stateNode.gap) * Math.sin(angle)
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