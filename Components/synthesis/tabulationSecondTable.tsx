import React from "react";
import { useEffect } from "react";
import { Point } from "../state-diagram/state-diagram-interfaces";
import { getLiteral } from "./helperFunctions";
import {simplifyFunctionReutnType } from "./interfaces";

const SecondTable : React.FC<{
    implicants : simplifyFunctionReutnType,
    vars : string[],
    pulse : string,
    minterms : number[]
}> = ({implicants, vars, pulse, minterms})=>{
    const canvasRef = React.createRef<HTMLCanvasElement>();
    useEffect(()=>{
        if(!canvasRef.current){
            return;
        }
        let context = canvasRef.current.getContext('2d');
        if(!context) return;
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);


        let cellWidth = 35;
        let cellHeight = 20;

        let rowCount = implicants[pulse].PIs.length;

        let colCount = minterms.length;

        let fSize = 16;

        let topPadding = 30;
        let leftPadding = 30;
        let rightPadding = 20;
        let bottomPadding = 20;

        let piCellWidth = 0;
        let literals : string[]= [];
        implicants[pulse].PIs.forEach(pi=>{
            let comb = getLiteral(pi.comb, vars, 'synch');
            literals.push(comb);
            let len = context!.measureText(comb).width;
            piCellWidth = piCellWidth > len ? piCellWidth : len;
        })

        let piCellPadding = 20;
        piCellWidth += piCellPadding;

        let headerRowHeight = 30;
        let crossLength = 10;

        let tableHeight = headerRowHeight + rowCount * cellHeight;
        let tableWidth = piCellWidth + colCount * cellWidth;

        let topLeftCorner : Point = {x : topPadding ,y : leftPadding}
        
        canvasRef.current.width = topLeftCorner.x + tableWidth + rightPadding;
        canvasRef.current.height = topLeftCorner.y + tableHeight + bottomPadding;
        context.font = `bold ${fSize}px serif`;
        context.textBaseline = 'middle';
        context.lineWidth = 2;

        context.strokeRect(topLeftCorner.x, topLeftCorner.y , tableWidth, tableHeight);
        context.stroke();

        // context.beginPath();
        context.moveTo(topLeftCorner.x, topLeftCorner.y + headerRowHeight);
        context.lineTo(topLeftCorner.x + tableWidth, topLeftCorner.y + headerRowHeight);
        // context.font = `bold ${fSize}px serif`;
        let w = context.measureText('PIs').width;
        context.fillText('PIs', topLeftCorner.x + piCellWidth / 2 - w / 2, topLeftCorner.y + headerRowHeight / 2 );
        // context.stroke();
        
        // context.beginPath();
        context.moveTo(topLeftCorner.x + piCellWidth , topLeftCorner.y);
        context.lineTo(topLeftCorner.x + piCellWidth, topLeftCorner.y + tableHeight);
        // context.stroke();
        for(let i = 0; i < rowCount; ++i){
            // context.beginPath();
            context.moveTo(topLeftCorner.x , topLeftCorner.y + headerRowHeight + i * cellHeight);
            context.lineTo(topLeftCorner.x + tableWidth , topLeftCorner.y + headerRowHeight + i * cellHeight)
            let w = context.measureText(literals[i]).width;
            context.fillText(literals[i], topLeftCorner.x + piCellWidth / 2 - w/2 , topLeftCorner.y + headerRowHeight + i * cellHeight + .5 * cellHeight);
            // context.stroke();
        }

        for(let j = 0; j < colCount; ++j){
            // context.beginPath();
            context.moveTo(topLeftCorner.x + piCellWidth + j * cellWidth , topLeftCorner.y);
            context.lineTo(topLeftCorner.x + piCellWidth + j * cellWidth , topLeftCorner.y + tableHeight);
            let w = context.measureText(minterms[j].toString()).width;
            context.fillText( minterms[j].toString(), topLeftCorner.x + piCellWidth + j * cellWidth + .5 * cellWidth - w / 2, topLeftCorner.y + .5 * cellHeight )
            // context.stroke();
        }
        context.stroke();

        let converedMinterm = new Set<number>();
        let selectedPiSets = new Set<string>();
        implicants[pulse].selectedPIs.forEach(pi => selectedPiSets.add(pi.comb));

        

        let colors = ['red', 'green', 'blue', 'orange', 'brown',
        'fuchsia' , 'indigo', 'steelBlue' , 'Tan', 'khaki','turquoise'];
        let ci = 0;

        for(let i = 0; i < rowCount ; ++i){
            let currPi = implicants[pulse].PIs[i];
            let f = -1;
            let s = -1;
            for(let j = 0; j < colCount; ++j){
                let currMinterm = minterms[j];
                let str = currMinterm.toString(2);
                while(str.length < vars.length){
                    str = '0' + str;
                }
                let cellCornerPoint : Point = {
                    x : topLeftCorner.x + j* cellWidth + piCellWidth,
                    y : topLeftCorner.y + i * cellHeight + headerRowHeight
                }
                if(currPi.minterms.has(str)){
                    if(!converedMinterm.has(currMinterm)){
                        
                        if(f == -1 ){
                            f = j;
                        }
                        s = j;
                    }
                    context.moveTo(cellCornerPoint.x + .5 * cellWidth - crossLength / 2, cellCornerPoint.y + .5 * cellHeight - crossLength / 2);
                    context.lineTo(cellCornerPoint.x + .5 * cellWidth + crossLength / 2, cellCornerPoint.y + .5 * cellHeight + crossLength / 2)
                    context.moveTo(cellCornerPoint.x + .5 * cellWidth + crossLength / 2, cellCornerPoint.y + .5 * cellHeight - crossLength / 2);
                    context.lineTo(cellCornerPoint.x + .5 * cellWidth - crossLength / 2, cellCornerPoint.y + .5 * cellHeight + crossLength / 2)
                    if(selectedPiSets.has(currPi.comb) && !converedMinterm.has(currMinterm)){
                        context.stroke();
                        context.beginPath();
                        context.strokeStyle = colors[ci];
                        context.moveTo(topLeftCorner.x + piCellWidth + j * cellWidth + cellWidth / 2, topLeftCorner.y + headerRowHeight + cellHeight / 2);
                        context.lineTo(topLeftCorner.x + piCellWidth + j * cellWidth + cellWidth / 2, topLeftCorner.y + headerRowHeight + rowCount * cellHeight - cellHeight / 2)
                        context.stroke();
                        context.beginPath();
                        context.strokeStyle = 'black';
                        converedMinterm.add(currMinterm);
                    }
                }
            }
            if(selectedPiSets.has(currPi.comb)){
                context.stroke();
                context.beginPath();
                context.strokeStyle = colors[ci];
                context.moveTo(topLeftCorner.x + piCellWidth + f * cellWidth + cellWidth / 2, topLeftCorner.y + headerRowHeight + i * cellHeight + cellHeight / 2);
                context.lineTo(topLeftCorner.x + piCellWidth + s * cellWidth + cellWidth / 2, topLeftCorner.y + headerRowHeight + i * cellHeight + cellHeight / 2)
                context.stroke();
                context.beginPath();
                context.strokeStyle = 'black';
            }
            
            ci = (ci + 1) % colors.length;
        }

        context.stroke();
        

    }, [implicants])
    return(
        <canvas ref = {canvasRef} ></canvas>
    )
}

export default SecondTable;