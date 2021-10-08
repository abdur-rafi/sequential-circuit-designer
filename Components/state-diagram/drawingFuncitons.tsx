
import {Point, StateNode, IONode, Edge} from './state-diagram-interfaces'
import {defalutIONodeConfig, defaultStateNodeConfig} from '../../defaultConfigs'
import React from 'react';



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

export function drawCircle(canvas : React.RefObject<HTMLCanvasElement>, center : Point, radius : number, lineColor : string, fillColor? : string){
    let context = canvas.current?.getContext('2d');
    if(!context) return;
    context.beginPath();
    context.strokeStyle = lineColor;
    if(fillColor)
        context.fillStyle = fillColor;
    context.arc(center.x, center.y, radius, 0, Math.PI * 2);     
    if(fillColor) 
        context.fill();
    context.stroke();
    context.closePath();  
}



export function calculateIONodeCenter(stateNode : StateNode, angle : number): Point{
    return   getPointOnCircle(stateNode.center,stateNode.radius + stateNode.gap + stateNode.ioNodeDiameter / 2, angle )
}

export function clearCircle(canvas : React.RefObject<HTMLCanvasElement>, center : Point, radius : number){
    let context = canvas.current?.getContext('2d');
    if(!context) return;
    context.beginPath();
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



export function doRectanglesOverlap(l1 : Point, r1 : Point, l2 : Point, r2 : Point): boolean{
    return (l1.x < r2.x && r1.x > l2.x && r1.y > l2.y && l1.y < r2.y);
 
    // return true;
}

export function getCornerPoints(stateNode : StateNode):{
    l : Point,
    r : Point
}{
    let l2 = {
        x : stateNode.center.x - stateNode.radius -  stateNode.gap - stateNode.ioNodeDiameter - stateNode.inputCombTextLength,
        y : stateNode.center.y - stateNode.radius -  stateNode.gap - stateNode.ioNodeDiameter- stateNode.inputCombTextLength
    }
    let r2 = {
        x : stateNode.center.x + stateNode.radius +  stateNode.gap + stateNode.ioNodeDiameter + stateNode.inputCombTextLength,
        y : stateNode.center.y + stateNode.radius +  stateNode.gap + stateNode.ioNodeDiameter + stateNode.inputCombTextLength
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

function distanceBetweenTwoPoints(p1 : Point, p2 : Point){
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
}

export function doCirclesCollide(c1 : Point, r1 : number, c2 : Point, r2 : number){
    let centerDist = distanceBetweenTwoPoints(c1, c2);
    return centerDist <= (r1 + r2 );
}


export function calculateDelTheta(ioNode : IONode) : number{
    let stateNode = ioNode.originNode;
    return (stateNode.ioNodeDiameter * 2.75) / (stateNode.radius + stateNode.gap + stateNode.ioNodeDiameter / 2);

}

export function getPointOnCircle(center : Point, radius : number, angle : number) : Point{
    return {
        x : center.x + radius * Math.cos(angle),
        y : center.y + radius * Math.sin(angle)
    }
}