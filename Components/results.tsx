import React from "react";
import { Edge, StateNode } from "./canvasInterfaces";
import styles from '../styles/design.module.scss'

interface excitationInterface{
    map : {
        [state : string] : {
            [inpComb : string] : string
        }
    },
    dims : {
        row : number,
        col : number
    },
    stateIndex : number,
    stateLabels : string,
    inputLabels : string
    
    
}
interface nextStateMap {
    [state : string] : {
        [inpComb : string] : string
    }
}
interface kMap{
    map :{
        [remComb : string] : {
            [rowComb : string] : {
                [columnComb : string] : string
            }
        }
    },
    dims : {
        rem : number
        row : number,
        col : number
    },
    functionName : string,
    vars : {
        rem : string,
        row : string,
        col : string
    }
}
interface truthTable{
    table : {
        [inpComb : string] : string
    },
    dims : number,
    functionName : string,
    vars : string
}

function getRequiredBitForStates(noOfStateNodes : number){
    let c = 0;
    let n = noOfStateNodes;
    while(Math.pow(2, c) < n){
        c++;
    }
    return c;
}

function getBinRepresentation(stateNodes : StateNode[]) : Map<string, string>{
    let n = stateNodes.length;
    let c = getRequiredBitForStates(n);
    let m = new Map<string, string>();
    for(let i = 0; i < n; ++i){
        let curr = i.toString(2);
        while(curr.length < c){
            curr = '0' + curr;
        }
        m.set(stateNodes[i].label,curr);
    }
    return m;
}

function getInputCombination(d : number) : string[]{
    let n = Math.pow(2,d);
    let inps : string[] = []
    for(let i = 0; i < n; ++i){
        let curr = i.toString(2);
        while(curr.length < d){
            curr = '0' + curr;
        }
        inps.push(curr);

    }
    return inps;
}

function getNextStateMap(stateNodes : StateNode[], numberOfInpVars : number) : nextStateMap{
    let map : nextStateMap = {};
    let inpComb = getInputCombination(numberOfInpVars);
    stateNodes.forEach(s=>{
        map[s.label] = {}
        inpComb.forEach(comb=>{

            map[s.label][comb] = s.ioNodes.filter(ioNode => ioNode.inputComb === comb)[0].edges[0].to.originNode.label
        })
    })
    return map;
}

function getLabels(n : number, t : string): string{
    let s = '';
    for(let i = 0; i < n; ++i)
        s += t + i;
    return s;
}

function getExcitations(stateNodes : StateNode[] , binMap : Map<string, string>, numberOfInputVar : number, latchMap : {[key: string]: string}) : excitationInterface[]{
    let excitations : excitationInterface[] = [];
    let numberOfStateBits = getRequiredBitForStates(stateNodes.length);
    let inpComb = getInputCombination(numberOfInputVar);
    for(let i = 0; i < numberOfStateBits; ++i){
        excitations.push({map : {}, 
            dims : {
                row : numberOfStateBits,
                col : numberOfInputVar
            },
            stateIndex : i,
            stateLabels : getLabels(numberOfStateBits, 'y'),
            inputLabels : getLabels(numberOfInputVar, 'x')
        });
        stateNodes.forEach(s =>{
            let currStateLabel = s.label;
            let currBin = binMap.get(currStateLabel);
            excitations[i].map[currBin!] = {}
            inpComb.forEach(comb=>{
                let nxtStateLabel = s.ioNodes.filter(ioNode => ioNode.inputComb === comb)[0].edges[0].to.originNode.label;
                let nextBin = binMap.get(nxtStateLabel);
                if(!nextBin || !currBin) return;
                excitations[i].map[currBin][comb] = latchMap[ currBin[i] + nextBin[i] ];
            })
        })
    }
    return excitations;
}

function truthTablesFromExcitation(excitation : excitationInterface, numberOfVars : number, fDim : number, pair : boolean, lathcLabel : string) : truthTable[]{
    let inpCombs = getInputCombination(numberOfVars);
    let tTable : truthTable[] = [{table : {}, dims : numberOfVars,functionName : '', vars : excitation.stateLabels + excitation.inputLabels}];
    if(pair) tTable.push({table : {}, dims : numberOfVars, functionName : '', vars : excitation.stateLabels + excitation.inputLabels});
    inpCombs.forEach(comb => {
        let f = comb.slice(0, fDim);
        let s = comb.slice(fDim);
        let r;
        try{

            r = excitation.map[f][s];
        }
        catch(e){

        }
        tTable[0].table[comb] = r ? r[0] : 'd'; 
        tTable[0]['functionName'] = lathcLabel[0] + excitation.stateIndex; 
        
        if(pair){
            tTable[1].table[comb] = r ? r[1] : 'd';
            tTable[1]['functionName'] = lathcLabel[1] + excitation.stateIndex; 
        }
    })
    return tTable;
    
}

function generateKMap(truthTable : truthTable, numberOfTotalVars : number) : kMap{
    if(numberOfTotalVars < 5){
        let row = Math.floor(numberOfTotalVars / 2);
        let col = numberOfTotalVars - row;
        let rowComb = getInputCombination(row);
        let colComb = getInputCombination(col);
        let kMap : kMap = {
            map : {},
            dims : {
                rem : 0,
                row : row,
                col : col
            },
            functionName : truthTable.functionName,
            vars : {
                rem : '',
                row : truthTable.vars.slice(0, 2 * row),
                col : truthTable.vars.slice( 2 * row)
            }
        };
        kMap.map[1] = {}
        
        rowComb.forEach(rcomb=>{
            kMap.map[1][rcomb] = {}
            colComb.forEach(ccomb=>{
                kMap.map[1][rcomb][ccomb] = truthTable.table[rcomb + ccomb];
            })
        })
        return kMap;
    }
    else{
        
        let rem = numberOfTotalVars - 4;
        let remCombs = getInputCombination(rem);
        let comb = getInputCombination(4);

        let kMap : kMap = {
            map : {},
            dims : {
                rem : rem,
                row : 2,
                col : 2
            },
            functionName : truthTable.functionName,
            vars : {
                rem : truthTable.vars.slice(0, 2 * rem),
                row : truthTable.vars.slice(2 * rem, 2 * rem + 4),
                col : truthTable.vars.slice(-4)
            }
        };

        remCombs.forEach(remComb=>{
            let tTable : truthTable = {
                table : {},
                dims : numberOfTotalVars,
                functionName : truthTable.functionName,
                vars : truthTable.vars.slice(-4)
            };
            comb.forEach(c=>{
                tTable.table[c] = truthTable.table[remComb + c];
            })
            kMap.map[remComb] = generateKMap(tTable, 4).map[1];
        })
        return kMap;
    }
}

function generateGreyCode(nBit : number) : string[]{
    if(nBit == 1){
        return ['0', '1']
    }
    let pr = generateGreyCode(nBit - 1);
    let prRev = [...pr].reverse();
    pr = pr.map(p=>'0'+p);
    prRev = prRev.map(p=>'1' + p);
    return [...pr, ...prRev];
}

const SRMap = {
    '00' : '0d',
    '01' : '10',
    '10' : '01',
    '11' : 'd0'
}
const JKMap = {
    '00' : '0d',
    '01' : '1d',
    '10' : 'd1',
    '11' : 'd0'
}
const DMap = {
    '00' : '0',
    '01' : '1',
    '10' : '0',
    '11' : '1'
}
const TMap = {
    '00' : '0',
    '01' : '1',
    '10' : '1',
    '11' : '0'
}

const Design : React.FC<{
    stateNodes : StateNode[],
    edges : Edge[],
    numberOfInpVar : number,
    changeSynthesis : (b : boolean) => void
}> = (props)=>{

    let stateVars = getRequiredBitForStates(props.stateNodes.length) ;
    let numberOfVars = stateVars + props.numberOfInpVar;
    const binRep = getBinRepresentation(props.stateNodes);
    const excitations = getExcitations(props.stateNodes, binRep, props.numberOfInpVar,SRMap);
    const nextStateMap = getNextStateMap(props.stateNodes, props.numberOfInpVar);
    let truthTables : truthTable[] = [];
    excitations.forEach(e=> truthTables.push(...truthTablesFromExcitation(e, numberOfVars, stateVars,true, 'SR')));
    let kMaps : kMap[] = [];
    truthTables.forEach(t=>kMaps.push(generateKMap(t,numberOfVars)));
    let i = 0;
    return (
        <div>
            <StateTable nextStateMap = {nextStateMap} numberOfInpVar = {props.numberOfInpVar} stateNodes = {props.stateNodes}/>
            <StateAssignment binRep = {binRep} stateNodes = {props.stateNodes}  />
            <StateTable nextStateMap = {nextStateMap} binRep = {binRep} numberOfInpVar = {props.numberOfInpVar} stateNodes = {props.stateNodes}/>
            <TransitionTable excitations = {excitations} stateNodes = {props.stateNodes} binRep = {binRep} latchLabel = 'SR' latchMap = {SRMap} numberOfInputVars = {props.numberOfInpVar}  />
            {
                kMaps.map(k=>{
                    return(
                        <div> 
                            <div> {k.functionName} </div>
                            <KMap key = {i++} kMap = {k} />
                        </div>
                    )
                })
            }
            {/* <KMap kMap = {kMaps[1]} /> */}
            <button onClick = {()=> props.changeSynthesis(false)}> back to diagram </button>
        </div>
    )
}

const StateTable : React.FC<{
    stateNodes : StateNode[],
    numberOfInpVar : number,
    nextStateMap : nextStateMap,
    binRep? : Map<string, string> 
}> = (props)=>{

    let inpComb = getInputCombination(props.numberOfInpVar);

    if(props.stateNodes.length == 0) 
        return(
            <div>
            </div>
        )
    
    return (
        <div className = {styles.stateTableContainer}>
            <table className = {styles.stateTable}>
                <thead >
                    <tr>
                        <th rowSpan={2}>previous state</th>
                        <th colSpan={Math.pow(2,props.numberOfInpVar)} > next state </th>
                    </tr>
                    <tr>
                        {
                            inpComb.map(inp=>{
                                return(
                                    <th key = {inp}> {inp} </th>
                                )
                            })
                        }
                    </tr>
                </thead>
                <tbody>
                {
                    props.stateNodes.map(s=>{
                        let t : React.ReactNode[] = [];
                        t = inpComb.map(comb=>{
                            let text = props.nextStateMap[s.label][comb];
                            if(props.binRep) text = props.binRep.get(text)!;
                            return (
                                <th key = {'s' + s.label + 'i' +  comb}>
                                    {text}
                                </th>
                            )
                        })
                        return(
                            <tr key={s.label}>
                                <th> {props.binRep ? props.binRep.get(s.label) :  s.label} </th>
                                {t}
                            </tr>
                        )
                    })
                }
                </tbody>
            </table>
        </div>
    )
}

const StateAssignment : React.FC<{
    stateNodes : StateNode[],
    binRep : Map<string, string>
}> = (props)=>{
    
    
    return(
        <div className = {styles.stateAssignmentContainer}>
            <table className = {styles.stateAssignmentTable}>
                <thead>
                    <tr>
                        <th>State</th>
                        <th>Binary Representation</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        props.stateNodes.map(s=>{
                            return(
                                <tr key={s.label}>
                                    <td>{s.label}</td>
                                    <td>{props.binRep.get(s.label)}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </div>

    )
}

const TransitionTable : React.FC<{
    stateNodes : StateNode[],
    binRep : Map<string, string>,
    latchMap : {[key :string] : string},
    latchLabel : string,
    numberOfInputVars : number,
    excitations : excitationInterface[]
}> = (props)=>{


    let upperHeadRow : React.ReactNode[] = [];
    let lowerHeadRow : React.ReactNode[] = [];
    let stateBitCount = getRequiredBitForStates(props.stateNodes.length);
    let inpComb = getInputCombination(props.numberOfInputVars);
    
    for(let i = 0; i < stateBitCount; ++i){
        upperHeadRow.push(
            <th key = {i} colSpan = {Math.pow(2,props.numberOfInputVars)}>
                {props.latchLabel.length === 2 ? 
                (<span>{props.latchLabel[0]}<sub>{i}</sub>{props.latchLabel[1]}<sub>{i}</sub></span>  ) :
                (<span>{props.latchLabel}<sub>{i}</sub></span>)
                }
            </th>
        )
        inpComb.forEach(inp =>{
            lowerHeadRow.push(
                <th key = {inp + i}>
                    {inp}
                </th>
            )
        })
    }
    

    return(
        <div className = {styles.transitionTableContainer}>
            <table className = {styles.transitionTable}>
                <thead>
                    <tr>
                        <th rowSpan={2}> Previous State </th>
                        {upperHeadRow}
                    </tr>
                    <tr>
                        {lowerHeadRow}
                    </tr>
                </thead>
                <tbody>
                    {
                        props.stateNodes.map(stateNode =>{
                            let nextStateRows : React.ReactNode[] = [];
                            for(let i = 0; i < stateBitCount; ++i){
                                for(let j = 0; j < inpComb.length; ++j){
                                    nextStateRows.push(
                                        <td key = {'inp'+inpComb[j]+stateNode.label+'i'+i}>
                                            {props.excitations[i].map[props.binRep.get(stateNode.label)!][inpComb[j]]}
                                        </td>
                                    )
                                }
                            }
                            return(
                                <tr key = {stateNode.label}>
                                    <td>
                                        {props.binRep.get(stateNode.label)}
                                    </td>
                                    {nextStateRows}
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>

        </div>
    )
}

const KMap : React.FC<{
    kMap : kMap
}> = (props)=>{

    let rem = props.kMap.dims.rem;
    let row = props.kMap.dims.row;
    let col = props.kMap.dims.col;

    let remComb = generateGreyCode(rem);
    let rowComb = generateGreyCode(row);
    let colComb = generateGreyCode(col);

    console.log(remComb, rowComb, colComb);

    return(
        <div className = {styles.kMapContainer}>
            {
                remComb.map(rem=>{
                    return(
                        
                        <table key={rem}>
                            <caption> {rem} </caption>
                        <tbody>
                            <tr>
                                <td className={styles.rowVarLabels} rowSpan = {6}> {props.kMap.vars.row.split('').map((s, i)=>{
                                    if(i % 2) return(<sub>{s}</sub>)
                                    return s
                                })} </td>
                                <td  className={styles.colVarLabels} colSpan = {5}> {props.kMap.vars.col.split('').map((s, i)=>{
                                    if(i % 2) return(<sub>{s}</sub>)
                                    return s
                                })} </td>
                            </tr>
                            <tr>
                                <td style={{border : 'none'}}> 
                                </td>
                            {
                                colComb.map(col=>{
                                    return(
                                        <td className = {styles.colLabels}>
                                            {col}
                                        </td>
                                    )
                                })
                            }
                            </tr>
                        {    
                            rowComb.map(row=>{
                                return(
                                    <tr key={row}>
                                        <td className = {styles.rowLabels} > {row} </td>
                                    {
                                        colComb.map(col=>{
                                            return(
                                                <td key ={col}>
                                                    {props.kMap.map[rem][row][col]}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                )
                                
                            })
                        }
                        </tbody>
                        </table>
                    )
                })

            }
        </div>
    )

}

export default Design;