import React from "react";
import { Edge, StateNode } from "./canvasInterfaces";
import styles from '../styles/design.module.scss'

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

    const binRep = getBinRepresentation(props.stateNodes);

    props.stateNodes.forEach(s=>{
        s.ioNodes.sort((a, b)=> {
            if(a.inputComb < b.inputComb) return -1;
            if(a.inputComb === b.inputComb) return 0;
            return 1;
        });
    })

    return (
        <div>
            <StateTable numberOfInpVar = {props.numberOfInpVar} stateNodes = {props.stateNodes}/>
            <StateAssignment binRep = {binRep} stateNodes = {props.stateNodes}  />
            <StateTable binRep = {binRep} numberOfInpVar = {props.numberOfInpVar} stateNodes = {props.stateNodes}/>
            <TransitionTable stateNodes = {props.stateNodes} binRep = {binRep} latchLabel = 'SR' latchMap = {SRMap} numberOfInputVars = {props.numberOfInpVar}  />
            <button onClick = {()=> props.changeSynthesis(false)}> back to diagram </button>
        </div>
    )
}

const StateTable : React.FC<{
    stateNodes : StateNode[],
    numberOfInpVar : number,
    binRep? : Map<string, string> 
}> = (props)=>{

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
                            getInputCombination(props.numberOfInpVar).map(inp=>{
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
                        let t = s.ioNodes.map(ioNode=>{
                            let text = ioNode.edges[0].to.originNode.label;
                            if(props.binRep) text = props.binRep.get(text)!;
                            return(
                                
                                <td key={ioNode.inputComb}>{text}</td>
                            )
                        })
                        // let text = s.label;
                        // if(props.binRep) text = props.binRep.get(text)!;
                        return(
                            <tr key={s.label}>
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
    numberOfInputVars : number
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
                                stateNode.ioNodes.filter(ioNode => ioNode.type === 'in')
                                .forEach(ioNode =>{
                                    let prState = props.binRep.get(stateNode.label);
                                    let nxtState = props.binRep.get(ioNode.edges[0].to.originNode.label);
                                    console.log(prState, nxtState);
                                    nextStateRows.push(
                                        <td key = {prState! + nxtState! + 's' + i + 'inp' + ioNode.inputComb }>
                                            {props.latchMap[prState![i]+nxtState![i]]}
                                        </td>
                                    )
                                })
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

export default Design;