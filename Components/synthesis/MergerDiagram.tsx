import { useEffect, useRef } from "react";
import { clearCanvas, drawCircle, getPointOnCircle } from "../state-diagram/drawingFuncitons";
import { Point } from "../state-diagram/state-diagram-interfaces";
import { generateGreyCode } from "./helperFunctions";
import { implicationEntryMap } from "./interfaces";

const MergerDiagram : React.FC<{
    stateLabels : string[],
    entries : implicationEntryMap,
    inCompatibles? : boolean
}> = (props)=>{

    const canvas = useRef<HTMLCanvasElement>(null);
    const height = 300;
    const widht = 300;
    const gap = 20;
    const radius = widht / 2 - gap;
    const center : Point = {
        x : widht / 2,
        y : height / 2
    }
    

    useEffect(()=>{

        let context = canvas.current?.getContext('2d');
        if(!context) return;
        context.clearRect(0, 0, widht, height);
        context!.textBaseline = 'middle';
        const angleDiff = (Math.PI * 2) / props.stateLabels.length;
        context.font = '14px sans-serif'
        const fontSize = 14;

        const getCenters = () : Point[]=>{
            let s = 1.5 * Math.PI;
            return props.stateLabels.map(label =>{
                s += angleDiff;
                return getPointOnCircle(center, radius, s - angleDiff);
            })
        }

        const drawLines = (points : Point[])=>{
            let n = props.stateLabels.length;
            for(let i = 0; i < n; ++i){
                let s1 = props.stateLabels[i];
                for(let j = i + 1; j < n; ++j){
                    let s2 = props.stateLabels[j];
                    if((props.entries[s1][s2].isCompatible && !props.inCompatibles) || (!props.entries[s1][s2].isCompatible && props.inCompatibles)){
                        context!.beginPath();
                        context!.moveTo(points[i].x, points[i].y);
                        context!.lineTo(points[j].x, points[j].y);
                        context?.stroke();
                    }
                }
            }
        }

        const drawDotsAndLabels = (points : Point[])=>{
            let gap = 5;
            let s = 1.5 * Math.PI;
            points.forEach((p, i) =>{
                context!.beginPath();
                context!.arc(p.x, p.y, 3, 0,Math.PI * 2);
                context!.fill();
                let label = props.stateLabels[i];
                let labelWidht = context!.measureText(label).width;
                if(Math.abs(s - 1.5 * Math.PI) < .0001){
                    context!.strokeText(label, p.x - labelWidht / 2, p.y - labelWidht - gap);
                }
                else if(Math.abs(s - 2.5 * Math.PI) < .0001){
                    context!.strokeText(label, p.x - labelWidht / 2, p.y + labelWidht + gap);
                }
                else if(s > 2.5 * Math.PI){
                    context!.strokeText(label, p.x - labelWidht - gap ,p.y);
                }
                else{
                    context!.fillText(label, p.x + gap ,p.y);
                }
                context!.stroke();
                s += angleDiff;
            })
        }
        let centers = getCenters();
        drawLines(centers);
        drawDotsAndLabels(centers);
        
    })

    return (
        <div >
            <canvas ref={canvas} height = {height} width = {widht} />
        </div>
    )
}

export default MergerDiagram;