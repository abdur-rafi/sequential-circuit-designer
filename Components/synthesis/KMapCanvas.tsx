import { generateGreyCode, getInputCombination, getLiteral } from "./helperFunctions";
import styles from '../../styles/design.module.scss'
import { circuitMode, kMap, simplifyFunctionReutnType, stringToStringMap } from "./interfaces";
import React from "react";
import { Point } from "../state-diagram/state-diagram-interfaces";
import { useEffect, useRef } from "react";

interface Props{
    kMap : kMap,
    pulse : string,
    remComb : string,
    implicants : simplifyFunctionReutnType,
    colorMap : stringToStringMap,  
    mx : number,
    circuitMode : circuitMode
}
interface State{

}

const doesCombMatch = (piComb : string, comb : string) =>{
    let n = comb.length;
    for(let i = 0; i < n; ++i){
        if(piComb[i] ==='_') continue;
        if(piComb[i] !== comb[i]) return false;
    }
    return true;
}

const KMapCanvas : React.FC<Props> = (props)=>{

    // canvasRef : React.RefObject<HTMLCanvasElement>
    const canvasRef = React.createRef<HTMLCanvasElement>();
    

    useEffect(()=>{
        // console.log('here', props);
        if(!canvasRef.current) return;
        let context =canvasRef.current.getContext('2d');
        if(!context) return;
        let currImplicants = props.implicants[props.pulse].selectedPIs.filter(pi =>doesCombMatch(pi.comb, props.remComb));
        let rowDim = props.kMap.dims.row;
        let colDim = props.kMap.dims.col;
        
        let rowCount = 1 << rowDim;
        let colCount = 1 << colDim;
        let topPadding = 30;
        let leftPadding = 30;
        let startPoint : Point = {x : leftPadding, y : topPadding};
        let gap = 4;
        let delta = 5;
        let impCount = props.mx;
        let vGap = 2 * impCount * delta + gap + 30;
        let hGap = 2 * impCount * delta + gap + 30;;
        let mapWidth = hGap * colCount;
        let mapHeight = vGap * rowCount;
        let bottomPadding = 20;
        let rightPadding = 20;
        let cornerLineComponent = 60;
        let captionFontSize = 20;
        let captionHeight = 3 * captionFontSize;
        


        

        // console.log('currImplicants', currImplicants);
        
        
        canvasRef.current.height = captionHeight + topPadding + cornerLineComponent + mapHeight + bottomPadding;
        canvasRef.current.width = leftPadding + cornerLineComponent + mapWidth + rightPadding;
        context.clearRect(0, 0, canvasRef.current.width,canvasRef.current.width);

        if(rowDim === 0 || colDim === 0){
            context.font = 'bold 20px serif';
            context.textBaseline = 'middle';
            context.fillText('N/A', leftPadding, topPadding);
            return;   
        }

        context.font = `bold ${captionFontSize}px serif`

        let pulseCaption = props.pulse;
        if(props.pulse.length > 0){
            pulseCaption = `pulse: ${pulseCaption}`;
        }
        let pWidth = context.measureText(pulseCaption).width;
        context.fillText(pulseCaption, leftPadding + cornerLineComponent + mapWidth / 2  - pWidth / 2, captionFontSize);
        context.stroke();

        let remCaption = '';
        if(props.remComb.length > 0){
            let remVar = '';
            props.kMap.vars.rem.forEach(r => remVar += ' ' + r);
            remCaption = `${remVar} = ${props.remComb}`
        }
        
        let rWidth = context.measureText(remCaption).width;
        context.fillText(remCaption, leftPadding + cornerLineComponent + mapWidth / 2 - rWidth / 2, 3 * captionFontSize);
        context.stroke();

        context.textBaseline = 'middle';

        startPoint.y += captionHeight;
        
        context.beginPath();
        context.moveTo(startPoint.x, startPoint.y);
        context.lineTo(startPoint.x + cornerLineComponent , startPoint.y + cornerLineComponent);
        context.stroke();


        startPoint.x += cornerLineComponent;
        startPoint.y += cornerLineComponent;

        // context.arc(startPoint.x, startPoint.y, 4, 0, 1);
        // context.stroke();

        let headerFSize = 20;
        context.font = `bold ${headerFSize}px serif`;
        let cornerLineLabelGap = 10;
        let rowLabels = '';
        props.kMap.vars.row.forEach(r => rowLabels += ' ' + r);
        let colLabels = ''
        props.kMap.vars.col.forEach(c => colLabels += ' ' + c);
        let rowWidth = context.measureText(rowLabels).width;
        context.fillText(rowLabels , startPoint.x - rowWidth - cornerLineLabelGap - cornerLineComponent / 2, startPoint.y - cornerLineComponent / 2)
        let colWidth = context.measureText(colLabels).width;
        context.fillText(colLabels, startPoint.x - cornerLineComponent / 2  , startPoint.y - cornerLineComponent / 1.5);

        const rowComb = generateGreyCode(rowDim);
        const colComb = generateGreyCode(colDim);


        context.strokeRect(startPoint.x, startPoint.y , mapWidth, mapHeight);

        let labelGap = 5;
        let currPoint = startPoint;
        let mapFSize = 16;
        context.font = `bold ${mapFSize}px serif`;
        for(let i = 0; i < rowCount; ++i){

            context.beginPath();
            context.moveTo(currPoint.x, currPoint.y + i * vGap);
            context.lineTo(currPoint.x + mapWidth, currPoint.y + i * vGap);
            context.stroke();
            let labelWidth = context.measureText(rowComb[i]).width;
            context.fillText(rowComb[i], currPoint.x - labelWidth - labelGap, currPoint.y + i * vGap + vGap / 2);
        }
        for(let i = 0; i < colCount; ++i){
            context.beginPath();
            context.moveTo(currPoint.x + i * hGap, currPoint.y);
            context.lineTo(currPoint.x + i * hGap, currPoint.y + mapHeight); 
            context.stroke();
            let labelWidth = context.measureText(colComb[i]).width;
            context.fillText(colComb[i], currPoint.x + i * hGap + hGap * .5 - labelWidth / 2, currPoint.y - labelGap - mapFSize / 2);
        
        }




        for(let i = 0; i < rowCount; ++i){
            for(let j = 0; j < colCount; ++j){
                let cellPoint : Point = {x : currPoint.x + j * hGap + .5 * hGap, y : currPoint.y + i * vGap + .5 * vGap};
                let label = props.kMap.map[props.pulse][props.remComb][rowComb[i]][colComb[j]];
                let w = context.measureText(label).width;
                context.beginPath();
                context.fillText(label, cellPoint.x - w / 2, cellPoint.y );

            }
        }
        const checkIfPartOfPi = (pi : string, term : string)=>{
            let n = pi.length;
            for(let i = 0; i < n; ++i){
                if(pi[i] === '_') continue;
                if(pi[i] !== term[i]) return false;
            }
            return true;
        }
        context.lineWidth = 2.5;

        const getNeightBourPoints = (i : number, j : number)=>{
            let topTerm = rowComb[(i === 0 ) ? (rowCount - 1) : (i - 1)] + colComb[j];
            let leftTerm = rowComb[i] + colComb[j == 0 ? colCount - 1 : j - 1];
            let bottomTerm = rowComb[(i === rowCount - 1) ? 0 : i + 1] + colComb[j];
            let rightTerm = rowComb[i] + colComb[(j + 1 === colCount) ? 0 : j + 1 ];
            return [topTerm, rightTerm, bottomTerm, leftTerm];
        }

        currImplicants.forEach(currPi =>{
            if(!context) return;
            let topBorderDrawm = false;
            let bottomBorderDrawn = false;
            let rightBorderDrawn = false;
            let leftBorderDrawn = false;
            for(let i = 0; i < rowCount; ++i){
                for(let j = 0; j < colCount; ++j){
                    let term = rowComb[i] + colComb[j];
                    if(!checkIfPartOfPi(currPi.comb, props.remComb + term )) continue;
                    let [topTerm, rightTerm, bottomTerm, leftTerm] = getNeightBourPoints(i, j);
                    let topIncluded = checkIfPartOfPi(currPi.comb, props.remComb + topTerm);
                    let leftIncluded = checkIfPartOfPi(currPi.comb, props.remComb + leftTerm);
                    let rightIncluded = checkIfPartOfPi(currPi.comb, props.remComb + rightTerm);
                    let bottomIncluded = checkIfPartOfPi(currPi.comb, props.remComb + bottomTerm);
                    if(!topIncluded){
                        topBorderDrawm = true;
                    }
                    if(!rightIncluded){
                        rightBorderDrawn = true;
                    }
                    if(!bottomIncluded){
                        bottomBorderDrawn = true;
                    }
                    if(!leftIncluded){
                        leftBorderDrawn = true;
                    }
                }
            }
            context.strokeStyle = props.colorMap[currPi.comb];
            for(let i = 0; i < rowCount; ++i){
                for(let j = 0; j < colCount; ++j){
                    let term = rowComb[i] + colComb[j];
                    if(!checkIfPartOfPi(currPi.comb, props.remComb + term )) continue;
                    let [topTerm, rightTerm, bottomTerm, leftTerm] = getNeightBourPoints(i, j);
                    let topIncluded = checkIfPartOfPi(currPi.comb, props.remComb + topTerm);
                    let leftIncluded = checkIfPartOfPi(currPi.comb, props.remComb + leftTerm);
                    let rightIncluded = checkIfPartOfPi(currPi.comb, props.remComb + rightTerm);
                    let bottomIncluded = checkIfPartOfPi(currPi.comb, props.remComb + bottomTerm);
                    let currCorner : Point = {x : startPoint.x + j * hGap, y : startPoint.y + i * vGap};
                    
                    if(!topIncluded || (i === 0 && !topBorderDrawm)){
                        context.beginPath();
                        context.moveTo(currCorner.x + gap, currCorner.y + gap);
                        context.lineTo(currCorner.x + hGap - gap, currCorner.y + gap);
                        context.stroke();
                        if(rightIncluded && (rightBorderDrawn || j !== colCount - 1) ){
                            context.beginPath();
                            context.moveTo(currCorner.x + hGap - gap, currCorner.y + gap);
                            context.lineTo(currCorner.x + hGap, currCorner.y + gap);
                            context.stroke();
                        }
                        if(leftIncluded && (leftBorderDrawn || j !== 0)){
                            // console.log('leftIncl');
                            context.beginPath();
                            context.moveTo(currCorner.x  + gap, currCorner.y + gap);
                            context.lineTo(currCorner.x, currCorner.y + gap);
                            context.stroke();
                        }
                    }
                    if(!rightIncluded || (j === colCount - 1 && !rightBorderDrawn )){
                        context.beginPath();
                        context.moveTo(currCorner.x + hGap - gap, currCorner.y + gap);
                        context.lineTo(currCorner.x + hGap - gap, currCorner.y + vGap - gap);
                        context.stroke();
                        if(topIncluded){
                            if(!topBorderDrawm && i === 0){
                                
                            }
                            else{
                                context.beginPath();
                                context.moveTo(currCorner.x + hGap - gap, currCorner.y + gap);
                                context.lineTo(currCorner.x + hGap - gap, currCorner.y);
                                context.stroke();
                            } 
                            // console.log('here', currPi);
                        }
                        if(bottomIncluded){
                            if(bottomBorderDrawn || i !== rowCount - 1){
                                context.beginPath();
                                context.moveTo(currCorner.x + hGap - gap, currCorner.y + vGap - gap);
                                context.lineTo(currCorner.x + hGap - gap, currCorner.y + vGap);
                                context.stroke();
                            }
                        }
                    }
                    if(!bottomIncluded || (i === rowCount - 1 && !bottomBorderDrawn)){
                        context.beginPath();
                        context.moveTo(currCorner.x + gap, currCorner.y + vGap - gap);
                        context.lineTo(currCorner.x + hGap - gap, currCorner.y + vGap - gap);
                        context.stroke();
                        if(leftIncluded && (leftBorderDrawn || j !== 0)){
                            context.beginPath();
                            context.moveTo(currCorner.x + gap, currCorner.y + vGap - gap);
                            context.lineTo(currCorner.x, currCorner.y + vGap - gap);
                            context.stroke();
                        }
                        if(rightIncluded && (rightBorderDrawn || j !== colCount - 1) ){
                            context.beginPath();
                            context.moveTo(currCorner.x + hGap - gap, currCorner.y + vGap - gap);
                            context.lineTo(currCorner.x + hGap, currCorner.y + vGap - gap);
                            context.stroke();
                        }
                    }
                    if(!leftIncluded || (j === 0 && !leftBorderDrawn) ){
                        context.beginPath();
                        context.moveTo(currCorner.x  + gap, currCorner.y + gap);
                        context.lineTo(currCorner.x  + gap, currCorner.y + vGap - gap);
                        context.stroke();
                        if(topIncluded){
                            if(topBorderDrawm || i !== 0){
                                context.beginPath();
                                context.moveTo(currCorner.x +  gap, currCorner.y + gap);
                                context.lineTo(currCorner.x +  gap, currCorner.y);
                                context.stroke();
                            }
                        }
                        if(bottomIncluded){
                            if(bottomBorderDrawn || i !== rowCount - 1){
                                context.beginPath();
                                context.moveTo(currCorner.x + gap, currCorner.y + hGap - gap);
                                context.lineTo(currCorner.x + gap, currCorner.y + hGap);
                                context.stroke();
                            }
                        }
                    }

                }
            }
            gap += delta;
        })

    },[props.kMap]);

    
    return(
        <canvas ref = {canvasRef} />
    )

}

const Legends : React.FC<{
    implicants : simplifyFunctionReutnType,
    pulse : string,
    colorMap : stringToStringMap,
    kMap : kMap,
    circuitMode : circuitMode
}> = (props)=>{

    const canvasRef = React.createRef<HTMLCanvasElement>()

    useEffect(()=>{

        if(!canvasRef.current){
            return;
        }
        let context = canvasRef.current.getContext('2d');
        if(!context) return;
        if(props.kMap.dims.row === 0 || props.kMap.dims.col === 0) return;
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        let vars : string[] = [...props.kMap.vars.rem, ...props.kMap.vars.row, ...props.kMap.vars.col]
        let mxWidth = 0;
        let terms : string[] = [];
        let colors : string[] = [];
        let fSize = 18;
        let top = fSize;
        let leftPadding = 10;
        
        props.implicants[props.pulse].selectedPIs.forEach(pi =>{
            let n = pi.comb.length;
            let curr = getLiteral(pi.comb,vars,props.circuitMode);
            // console.log(curr);
            terms.push(curr);
            colors.push(props.colorMap[pi.comb])
            let w = context!.measureText(curr).width;
            mxWidth = mxWidth > w ? mxWidth : w;
            top += 1.5 * fSize ;
        })

        
        canvasRef.current.width = mxWidth + leftPadding + 100;
        canvasRef.current.height = top + 100;
        context.font = `bold ${fSize}px serif`;
        context.textBaseline = 'middle';

        top = fSize;

        terms.forEach((term, i) =>{
            if(!context) return;
            context.fillStyle = colors[i];
            context.fillRect(leftPadding + 5, top - fSize / 4, fSize / 2, fSize / 2);
            context.fill();
            context.fillStyle = 'black';
            context.fillText(term,leftPadding + 5 + fSize, top);
            context.stroke();
            top += 1.5 * fSize;
        })

    }, [props])

    return(
        <canvas ref = {canvasRef} />
    )
}
const KMap : React.FC<{
    kMap : kMap,
    implicants : simplifyFunctionReutnType,
    circuitMode : circuitMode
}> = (props)=>{

    let rem = props.kMap.dims.rem;
    let row = props.kMap.dims.row;
    let col = props.kMap.dims.col;
    let pulseComb = [''];

    let remComb = generateGreyCode(rem);
    let rowComb = generateGreyCode(row);
    let colComb = generateGreyCode(col);
    if(props.kMap.pulseMode){
        pulseComb = getInputCombination(props.kMap.dims.pulse,'pulse');
    }
    if(rem === 0){
        remComb.push('');
    }

    let colors = ['red', 'green', 'blue', 'orange', 'brown',
     'fuchsia' , 'indigo', 'steelBlue' , 'Tan', 'khaki','turquoise'];
    // colors = colors.slice(10);

    let key = 0;



    return(
        <div className = {styles.kMapContainer}>
            {
                pulseComb.map(p =>{
                    let colorMap : stringToStringMap = {};
                    let ci = 0;
                    props.implicants[p].selectedPIs.forEach(pi =>{
                        colorMap[pi.comb] = colors[ci];
                        ci = (ci + 1) % colors.length;
                    })
                    let mx = 0;
                    remComb.forEach(remComb =>{
                        let t = props.implicants[p].selectedPIs.filter(pi => doesCombMatch(pi.comb, remComb)).length;
                        mx = mx > t ? mx : t;
                    })
                    return(
                        <div key = {p}>
                            <Legends circuitMode = {props.circuitMode} colorMap = {colorMap} implicants = {props.implicants} kMap = {props.kMap}
                            pulse = {p}  />
                        {
                            remComb.map(rem => <KMapCanvas circuitMode = {props.circuitMode} mx = {mx} colorMap = {colorMap} implicants = {props.implicants} key = {rem} kMap = {props.kMap} remComb = {rem} pulse = {p} />)
                        }
                        </div>
                    )
                })
            }
        </div>
    )

}

export default KMap;